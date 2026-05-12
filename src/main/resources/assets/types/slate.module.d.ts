import type { BaseRange } from 'slate';
import type { HistoryEditor } from 'slate-history';
import type { ReactEditor } from 'slate-react';

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
