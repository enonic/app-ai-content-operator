import {BaseRange} from 'slate';
import {HistoryEditor} from 'slate-history';
import {ReactEditor} from 'slate-react';

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
