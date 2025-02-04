import {useStore} from '@nanostores/react';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {createEditor, Descendant, Editor, Node, Transforms} from 'slate';
import {withHistory} from 'slate-history';
import {Editable, ReactEditor, Slate, withReact} from 'slate-react';
import {twJoin, twMerge} from 'tailwind-merge';

import {findLooseMatch} from '../../../../../common/mentions';
import {useDeepMemo} from '../../../../../hooks/useDeepMemo';
import {calcMentionSpec, insertMention, withMentions} from '../../../../../plugins/withMentions';
import {$context} from '../../../../../stores/context';
import {$mentions} from '../../../../../stores/data';
import {Mention} from '../../../../../stores/data/Mention';
import {MessageRole} from '../../../../../stores/data/MessageType';
import {$dialog} from '../../../../../stores/dialog';
import {$target, clearTarget, setTarget} from '../../../../../stores/editor';
import {$licenseState} from '../../../../../stores/license';
import {getAllPathsFromString} from '../../../../../stores/utils/path';
import {$isBusy, $isConnected, sendPrompt, sendStop} from '../../../../../stores/worker';
import ContextControl from '../../../context/ContextControls/ContextControls';
import MainChatButton from '../../MainChatButton/MainChatButton';
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

function sendPromptAndClear(editor: Editor): void {
    sendPrompt(editor.children);
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
    }, [hidden, licenseState]);

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
        [editor, target],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent): void => {
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
        [mentionsToDisplay, editor, index, target, canSend],
    );

    return (
        <div
            className={twMerge(
                'relative',
                'flex flex-col flex-grow items-center',
                'w-full',
                'bg-enonic-gray-100',
                'rounded-2xl',
                'overflow-y-auto',
                hasContext &&
                    'before:content-[""] before:absolute before:inset-0 before:h-10 before:top-[1px] before:left-2 before:right-2 before:rounded-t-lg before:bg-gradient-fade-to-t before:from-transparent before:to-enonic-gray-100 before:z-10',
                className,
            )}
        >
            <ContextControl className='absolute top-2 left-2 w-[calc(100%-1rem)] z-20' />
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
                className='absolute bottom-2 right-2 z-20'
                disabled={isMainChatButtonDisabled}
                type={isBusy ? 'stop' : 'send'}
                clickHandler={isBusy ? () => sendStop(MessageRole.USER) : () => sendPromptAndClear(editor)}
            />
        </div>
    );
}
