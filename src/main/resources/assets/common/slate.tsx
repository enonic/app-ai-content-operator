import { isValidElement, type ReactElement, type ReactNode } from 'react';

import type { Descendant } from 'slate';

import { MentionElement } from '../components/dialog/input/prompt/mention-element/MentionElement';

type ElementEntry = ReactNode | string;

const isCustomText = (node: Descendant): node is Slate.CustomText => 'text' in node;

const isMentionElement = (node: Descendant): node is Slate.MentionElement => {
  return 'type' in node && node.type === 'mention';
};

const isEmptyEntry = (element: ElementEntry): boolean => {
  if (typeof element === 'string' && element.trim() === '') {
    return true;
  }
  if (!isValidElement(element)) {
    return false;
  }
  const { props } = element as ReactElement<Record<string, unknown>>;
  return typeof props === 'object' && props != null && 'data-empty' in props;
};

export function parseNodes(nodes: Descendant[]): ReactNode {
  const elements = nodes.map((node, index): ElementEntry => {
    if (isCustomText(node)) {
      return node.text;
    }

    if (isMentionElement(node)) {
      return <MentionElement key={index} element={node} />;
    }
    const paragraph = node.children ? parseNodes(node.children) : null;
    return paragraph ? <p key={index}>{paragraph}</p> : <p key={index} data-empty />;
  });

  return trimElements(elements);
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
    .map((node) => {
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
