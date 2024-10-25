import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

import {REGULAR_SCREEN} from '../../../../common/device';
import CopyControl from '../CopyControl/CopyControl';

type Props = {
    className?: string;
    content: string;
};

export default function CommonItemContent({className, content}: Props): JSX.Element {
    return (
        <div className={twMerge('group/item relative leading-6', className)}>
            <CopyControl
                key='copy'
                className={clsx('float-right relative shadow', REGULAR_SCREEN && 'invisible group-hover/item:visible')}
                content={content}
            />
            <span>{content}</span>
        </div>
    );
}
