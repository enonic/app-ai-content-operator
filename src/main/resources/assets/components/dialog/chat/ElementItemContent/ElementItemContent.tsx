import {twMerge} from 'tailwind-merge';

type Props = {
    className?: string;
    content: string;
    type?: 'text' | 'html';
};

export default function ElementItemContent({className, content, type = 'text'}: Props): JSX.Element {
    switch (type) {
        case 'html':
            return (
                <div
                    dangerouslySetInnerHTML={{__html: content}}
                    className={twMerge('enonic-ai-html-based prose prose-sm', 'relative', 'col-span-2', className)}
                />
            );
        case 'text':
            return <div className={twMerge('relative', 'col-span-2', className)}>{content}</div>;
    }
}
