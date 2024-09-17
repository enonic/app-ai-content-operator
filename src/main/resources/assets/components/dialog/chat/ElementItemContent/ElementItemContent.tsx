import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

type Props = {
    className?: string;
    content: string;
    type?: 'text' | 'html';
};

export default function ElementItemContent({className, content, type = 'text'}: Props): JSX.Element {
    const classNames = twMerge(clsx(['relative', 'col-span-2', className]));

    switch (type) {
        case 'html':
            return (
                <div
                    dangerouslySetInnerHTML={{__html: content}}
                    className={clsx(['enonic-ai-html-based prose prose-sm', classNames])}
                />
            );
        case 'text':
            return <div className={classNames}>{content}</div>;
    }
}
