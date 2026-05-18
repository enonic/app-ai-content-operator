import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createEditor, Editor, Node, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { twJoin, twMerge } from 'tailwind-merge';

import { $mentions, MessageRole, getAllPathsFromString } from '@/store/content';
import { $context } from '@/store/context';
import { $dialog } from '@/store/dialog';
import { $target, clearTarget, setTarget } from '@/store/editor';
import { $licenseState } from '@/store/license';
import { $isBusy, $isConnected, sendPrompt, sendStop } from '@/store/websocket';

import type { Mention } from '@/store/content';
import type { Descendant } from 'slate';

import { findLooseMatch } from '../../../../../common/mentions';
import { useDeepMemo } from '../../../../../hooks/useDeepMemo';
import { calcMentionSpec, insertMention, withMentions } from '../../../../../plugins/withMentions';
import ContextControl from '../../../context/context-controls/ContextControls';
import MainChatButton from '../../main-chat-button/MainChatButton';
import MentionsList from '../mentions-list/MentionsList';
import PromptAreaElement from '../prompt-area-element/PromptAreaElement';

type Props = {
  className?: string;
};

const INITIAL_VALUE: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

function clearPrompt(editor: Editor): void {
  Transforms.delete(editor, {
    at: {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    },
  });
}
function isEditorEmpty(editor: Editor): boolean {
  // Use `return parseText(editor.children).trim() === '';` to treat mentions as non-empty text
  return (
    editor.children
      .map((child) => Node.string(child))
      .join('')
      .trim() === ''
  );
}

function sendPromptAndClear(editor: Editor): void {
  sendPrompt(editor.children);
  clearPrompt(editor);
}

export default function PromptArea({ className }: Props): React.ReactNode {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  const [editor] = useState(() => withMentions(withHistory(withReact(createEditor()))));
  const [rect, setRect] = useState<DOMRect | undefined>();
  const { hidden } = useStore($dialog, { keys: ['hidden'] });
  const target = useStore($target);

  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');

  const { t } = useTranslation();

  const allMentions = useStore($mentions);
  const mentionsToDisplay = useDeepMemo(findLooseMatch(allMentions, search));

  const isBusy = useStore($isBusy);
  const isConnected = useStore($isConnected);
  const licenseState = useStore($licenseState);
  const [editorEmpty, setEditorEmpty] = useState(isEditorEmpty(editor));
  const canSend = isConnected && !editorEmpty && !isBusy;
  const isMainChatButtonDisabled = !isConnected || (editorEmpty && !isBusy);

  const context = useStore($context);
  const paths = context ? getAllPathsFromString(context) : [];
  const hasContext = paths.length > 0;

  useEffect(() => {
    if (hidden || licenseState !== 'OK') {
      clearTarget();
    } else {
      ReactEditor.focus(editor);
    }
  }, [editor, hidden, licenseState]);

  useEffect(() => {
    if (target) {
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      setRect(rect);
    }
  }, [editor, search, target]);

  const handleChange = (): void => {
    const matches = calcMentionSpec(editor);
    if (matches) {
      setTarget(matches.target);
      setSearch(matches.search);
      setIndex(0);
    } else {
      clearTarget();
    }

    setEditorEmpty(isEditorEmpty(editor));
  };

  const handleMentionSelected = useCallback(
    (mention: Mention): void => {
      if (target) {
        if (mentionsToDisplay.length > 0) {
          Transforms.select(editor, target);
          insertMention(editor, mention);
        }

        clearTarget();
        ReactEditor.focus(editor);
      }
    },
    [editor, mentionsToDisplay.length, target],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>): void => {
      if (!target) {
        if (event.key === 'Enter') {
          event.preventDefault();
          if (event.altKey || event.shiftKey) {
            editor.insertBreak();
          } else if (canSend) {
            sendPromptAndClear(editor);
          }
        }
        return;
      }
      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          const prevIndex = index >= mentionsToDisplay.length - 1 ? 0 : index + 1;
          setIndex(prevIndex);
          break;
        }
        case 'ArrowUp': {
          event.preventDefault();
          const nextIndex = index <= 0 ? mentionsToDisplay.length - 1 : index - 1;
          setIndex(nextIndex);
          break;
        }
        case 'Tab':
        case ' ':
        case 'Enter':
          event.preventDefault();
          handleMentionSelected(mentionsToDisplay[index]);
          break;
        case 'Escape':
          event.preventDefault();
          clearTarget();
          break;
      }
    },
    [mentionsToDisplay, editor, handleMentionSelected, index, target, canSend],
  );

  return (
    <div
      className={twMerge(
        'relative',
        'flex flex-grow flex-col items-center',
        'w-full',
        'bg-enonic-gray-100',
        'rounded-2xl',
        'overflow-y-auto',
        hasContext &&
          'before:bg-gradient-fade-to-t before:to-enonic-gray-100 before:absolute before:inset-0 before:top-[1px] before:right-2 before:left-2 before:z-10 before:h-10 before:rounded-t-lg before:from-transparent before:content-[""]',
        className,
      )}
    >
      <ContextControl className="absolute top-2 left-2 z-20 w-[calc(100%-1rem)]" />
      <Slate editor={editor} initialValue={INITIAL_VALUE} onChange={handleChange}>
        <Editable
          className={twJoin(
            'w-full max-h-[7.75rem]',
            'm-0 pb-3 pr-11',
            hasContext ? 'pt-12' : 'pt-3',
            'bg-transparent placeholder-black/50',
            'border-0 rounded-2xl',
            'resize-none',
            'text-sm leading-6',
            'outline-none',
            'overflow-x-hidden overflow-y-auto',
            'transition-padding duration-200 ease-in-out',
            'ai-content-operator-compact-scroll',
          )}
          onKeyDown={handleKeyDown}
          placeholder={t('text.input.placeholder')}
          renderElement={PromptAreaElement}
          readOnly={licenseState !== 'OK'}
          ref={ref}
        />
        {target && (
          <MentionsList
            mentions={mentionsToDisplay}
            targetRect={rect}
            selectedIndex={index}
            handleClick={handleMentionSelected}
          />
        )}
      </Slate>
      <MainChatButton
        className="absolute right-2 bottom-2 z-20"
        disabled={isMainChatButtonDisabled}
        type={isBusy ? 'stop' : 'send'}
        clickHandler={isBusy ? () => sendStop(MessageRole.USER) : () => sendPromptAndClear(editor)}
      />
    </div>
  );
}
