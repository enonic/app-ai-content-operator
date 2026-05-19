import { cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createEditor, Editor, Node, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';

import { $mentions, MessageRole } from '@/store/content';
import { $dialog } from '@/store/dialog';
import { $target, clearTarget, setTarget } from '@/store/editor';
import { $licenseState } from '@/store/license';
import { $isBusy, $isConnected, sendPrompt, sendStop } from '@/store/websocket';

import type { Mention } from '@/store/content';
import type { Descendant } from 'slate';

import { findLooseMatch } from '../../../../../common/mentions';
import { useDeepMemo } from '../../../../../hooks/useDeepMemo';
import { calcMentionSpec, insertMention, withMentions } from '../../../../../plugins/withMentions';
import { MainChatButton } from '../../main-chat-button/MainChatButton';
import { MentionsList } from '../mentions-list/MentionsList';
import { PromptAreaElement } from '../prompt-area-element/PromptAreaElement';

const PROMPT_AREA_NAME = 'PromptArea';

export type PromptAreaProps = {
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

export const PromptArea = ({ className }: PromptAreaProps): React.ReactNode => {
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
      data-component={PROMPT_AREA_NAME}
      className={cn(
        PROMPT_AREA_NAME,
        'relative',
        'flex grow flex-col items-center gap-2.5',
        'w-full',
        'bg-surface-neutral',
        'rounded-lg',
        'overflow-y-auto',
        className,
      )}
    >
      <Slate editor={editor} initialValue={INITIAL_VALUE} onChange={handleChange}>
        <Editable
          className={cn(
            'max-h-31 w-full',
            'm-0 py-3 pr-11',
            'bg-transparent placeholder-black/50',
            'rounded-2xl border-0',
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
        className="absolute right-1 bottom-1 z-20"
        disabled={isMainChatButtonDisabled}
        kind={isBusy ? 'stop' : 'send'}
        clickHandler={isBusy ? () => sendStop(MessageRole.USER) : () => sendPromptAndClear(editor)}
      />
    </div>
  );
};
PromptArea.displayName = PROMPT_AREA_NAME;
