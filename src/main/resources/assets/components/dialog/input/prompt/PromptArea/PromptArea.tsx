import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {createEditor, Descendant, Editor, Node, Transforms} from 'slate';
import {withHistory} from 'slate-history';
import {Editable, ReactEditor, Slate, withReact} from 'slate-react';

import {findLooseMatch} from '../../../../../common/mentions';
import {useDeepMemo} from '../../../../../hooks/useDeepMemo';
import {calcMentionSpec, insertMention, withMentions} from '../../../../../plugins/withMentions';
import {sendUserMessage} from '../../../../../stores/chat';
import {$mentions} from '../../../../../stores/data';
import {Mention} from '../../../../../stores/data/Mention';
import {$dialog} from '../../../../../stores/dialog';
import {$target, clearTarget, setTarget} from '../../../../../stores/editor';
import {$chatRequestRunning} from '../../../../../stores/requests';
import {setScope} from '../../../../../stores/scope';
import SendButton from '../../SendButton/SendButton';
import MentionsList from '../MentionsList/MentionsList';
import PromptAreaElement from '../PromptAreaElement/PromptAreaElement';

type Props = {
    className?: string;
};

const INITIAL_VALUE: Descendant[] = [
    {
        type: 'paragraph',
        children: [{text: ''}],
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
            .map(child => Node.string(child))
            .join('')
            .trim() === ''
    );
}

function sendPrompt(editor: Editor): void {
    void sendUserMessage(editor.children);
    clearPrompt(editor);
}

export default function PromptArea({className}: Props): React.ReactNode {
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.focus();
        }
    }, []);

    const [editor] = useState(() => withMentions(withHistory(withReact(createEditor()))));
    const [rect, setRect] = useState<DOMRect | undefined>();
    const {hidden} = useStore($dialog, {keys: ['hidden']});
    const target = useStore($target);

    const [index, setIndex] = useState(0);
    const [search, setSearch] = useState('');

    const {t} = useTranslation();

    const allMentions = useStore($mentions);
    const mentionsToDisplay = useDeepMemo(findLooseMatch(allMentions, search));
    const hasMentions = mentionsToDisplay.length > 0;

    useEffect(() => {
        if (hidden) {
            clearTarget();
        } else {
            ReactEditor.focus(editor);
        }
    }, [hidden]);

    const requestRunning = useStore($chatRequestRunning);
    const [editorEmpty, setEditorEmpty] = useState(isEditorEmpty(editor));
    const isSendDisabled = requestRunning || editorEmpty;

    useEffect(() => {
        if (target && hasMentions) {
            const domRange = ReactEditor.toDOMRange(editor, target);
            const rect = domRange.getBoundingClientRect();
            setRect(rect);
        }
    }, [hasMentions, editor, search, target]);

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
            if (mention.type === 'scope') {
                setScope(mention.path);
                editor.deleteBackward('word');
            } else if (target) {
                Transforms.select(editor, target);
                insertMention(editor, mention);
                clearTarget();
                ReactEditor.focus(editor);
            }
        },
        [editor, target],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent): void => {
            if (!target || !hasMentions) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    if (event.altKey || event.shiftKey) {
                        editor.insertBreak();
                    } else if (!isSendDisabled) {
                        sendPrompt(editor);
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
        [mentionsToDisplay, editor, index, target, isSendDisabled],
    );

    const classNames = clsx(
        'relative',
        'flex flex-col flex-grow items-center',
        'w-full',
        'bg-enonic-gray-100',
        'rounded-[1.5rem]',
        'overflow-y-auto',
        className,
    );

    return (
        <div className={classNames}>
            <Slate editor={editor} initialValue={INITIAL_VALUE} onChange={handleChange}>
                <Editable
                    className={clsx(
                        'w-full max-h-[7.75rem]',
                        'm-0 py-3 pr-11',
                        'bg-transparent placeholder-black/50',
                        'border-0 rounded-[1.5rem]',
                        'resize-none',
                        'text-sm leading-6',
                        'outline-none',
                        'overflow-x-hidden overflow-y-auto',
                        'ai-content-operator-compact-scroll',
                    )}
                    onKeyDown={handleKeyDown}
                    placeholder={t('text.input.placeholder')}
                    renderElement={PromptAreaElement}
                    ref={ref}
                />
                {target && hasMentions && (
                    <MentionsList
                        mentions={mentionsToDisplay}
                        targetRect={rect}
                        selectedIndex={index}
                        handleClick={handleMentionSelected}
                    />
                )}
            </Slate>
            <SendButton
                className='absolute bottom-2 right-2'
                disabled={isSendDisabled}
                clickHandler={() => sendPrompt(editor)}
            />
        </div>
    );
}
