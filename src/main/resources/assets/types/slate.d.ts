import type { BaseRange } from 'slate';
import type { HistoryEditor } from 'slate-history';
import type { ReactEditor } from 'slate-react';

declare global {
  namespace Slate {
    type MentionElement = {
      type: 'mention';
      character: string;
      children: CustomText[];
      path: string;
      title: string;
    };

    type ParagraphElement = {
      type: 'paragraph';
      children: (CustomText | MentionElement)[];
    };

    type CustomElement = MentionElement | ParagraphElement;

    type CustomText = {
      text: string;
    };
  }
}

declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor &
      HistoryEditor & {
        nodeToDecorations?: Map<Element, Range[]>;
      };
    Element: Slate.CustomElement;
    Text: Slate.CustomText;
    Range: BaseRange & Record<string, unknown>;
  }
}
