import {isValidElement} from 'react';
import {Descendant, Editor} from 'slate';

import MentionElement from '../components/dialog/input/prompt/MentionElement/MentionElement';
import {insertMention} from '../plugins/withMentions';
import {Mention} from '../stores/data/Mention';

type ElementEntry = React.ReactNode | string;

const isCustomText = (node: Descendant): node is Slate.CustomText => 'text' in node;

const isMentionElement = (node: Descendant): node is Slate.MentionElement => {
    return 'type' in node && node.type === 'mention';
};

const isEmptyEntry = (element: ElementEntry): boolean => {
    if (typeof element === 'string' && element.trim() === '') {
        return true;
    }
    return (
        isValidElement(element) &&
        typeof element.props === 'object' &&
        element.props != null &&
        'data-empty' in element.props
    );
};

export function parseNodes(nodes: Descendant[]): React.ReactNode {
    const elements = nodes.map((node, index): ElementEntry => {
        if (isCustomText(node)) {
            return node.text;
        }

        if (isMentionElement(node)) {
            return <MentionElement key={index} element={node} />;
        }
        const paragraph = node.children ? parseNodes(node.children) : null;
        return paragraph ? <p key={index}>{paragraph}</p> : <p data-empty></p>;
    });

    const trimmedElements = trimElements(elements);
    return <>{trimmedElements}</>;
}

function trimElements(elements: ElementEntry[]): ElementEntry[] {
    let start = 0;
    let end = elements.length;
    for (let i = 0; i < elements.length; i++) {
        if (!isEmptyEntry(elements[i])) {
            start = i;
            break;
        }
    }
    for (let i = elements.length - 1; i >= 0; i--) {
        if (!isEmptyEntry(elements[i])) {
            end = i + 1;
            break;
        }
    }
    return elements.slice(start, end);
}

export function parseText(nodes: Descendant[]): string {
    return nodes
        .map(node => {
            if (isCustomText(node)) {
                return node.text;
            }
            if (isMentionElement(node)) {
                return `{{${node.path}}}`;
            }
            const paragraph = node.children ? parseText(node.children) : '';
            return `${paragraph}\n`;
        })
        .join('')
        .trim();
}

export function insertOrReplaceLastMention(editor: Editor, mention: Mention): void {
    deleteLastMention(editor, editor.children);
    insertMention(editor, mention);
}

function deleteLastMention(editor: Editor, nodes: Descendant[]): void {
    const lastElement = nodes[nodes.length - 1];

    if (!lastElement) {
        return;
    }

    if (isCustomText(lastElement)) {
        if (lastElement.text.trim() === '') {
            const potentialMention = nodes[nodes.length - 2];

            if (potentialMention && isMentionElement(potentialMention)) {
                if (lastElement.text.length > 0) {
                    // if non-empty element has spaces then need to delete them first
                    editor.delete({unit: 'character', reverse: true, distance: lastElement.text.length});
                }

                editor.deleteBackward('word');
            }
        }
    } else {
        return deleteLastMention(editor, lastElement.children);
    }
}
