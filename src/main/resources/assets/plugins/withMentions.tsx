import {BaseEditor, BasePoint, Editor, Element, Range, Transforms} from 'slate';

import {Mention} from '../stores/data/Mention';

type MentionSpec = {
    target: Range;
    search: string;
};

export function insertMention(editor: Editor, mention: Mention): void {
    const mentionElement: Slate.MentionElement = {
        type: 'mention',
        character: mention.label,
        path: mention.path,
        children: [{text: ''}],
        title: mention.prettified,
    };
    Transforms.insertNodes(editor, [mentionElement, {text: ' '}]);
    Transforms.move(editor);
}

export function isMentionElement(element: Element): element is Slate.MentionElement {
    return 'type' in element && element.type === 'mention';
}

export function withMentions<T extends BaseEditor>(editor: T): T {
    const {isInline, isVoid, markableVoid} = editor;

    editor.isInline = (element: Element) => isMentionElement(element) || isInline(element);
    editor.isVoid = (element: Element) => isMentionElement(element) || isVoid(element);
    editor.markableVoid = (element: Element) => isMentionElement(element) || markableVoid(element);

    return editor;
}

export function calcMentionSpec(editor: Editor): MentionSpec | null {
    const {selection} = editor;

    if (!selection || !Range.isCollapsed(selection)) {
        return null;
    }

    const [start] = Range.edges(selection);

    const beforeRange = getBeforeRange(editor, start);
    const beforeText = beforeRange ? Editor.string(editor, beforeRange) : null;
    const beforeMatch = beforeText ? beforeText.match(/^@(\w*)$/) : null;

    const after = Editor.after(editor, start);
    const afterRange = Editor.range(editor, start, after);
    const afterText = Editor.string(editor, afterRange);
    const afterMatch = afterText.match(/^(\s|$)/);

    if (beforeRange && beforeMatch && afterMatch) {
        return {target: beforeRange, search: beforeMatch[1] ?? ''};
    }

    return null;
}

function getBeforeRange(editor: Editor, start: BasePoint): Range | null {
    return getBeforeCharRange(editor, start) ?? getBeforeWordRange(editor, start);
}

function getBeforeWordRange(editor: Editor, start: BasePoint): Range | null {
    const wordBefore = Editor.before(editor, start, {unit: 'word'});
    const before = wordBefore ? Editor.before(editor, wordBefore) : null;
    return before ? Editor.range(editor, before, start) : null;
}

function getBeforeCharRange(editor: Editor, start: BasePoint): Range | null {
    const charBefore = Editor.before(editor, start, {unit: 'character'});

    const before = charBefore ? Editor.before(editor, charBefore) : null;
    const rangeBefore = before ? Editor.range(editor, before, charBefore) : null;
    const hasValidBefore = rangeBefore == null || Editor.string(editor, rangeBefore) == ' ';

    return charBefore && hasValidBefore ? Editor.range(editor, charBefore, start) : null;
}
