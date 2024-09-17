import clsx from 'clsx';

import {REGULAR_SCREEN} from '../../../../common/device';
import CopyControl from '../CopyControl/CopyControl';

type Props = {
    className?: string;
    content: string;
};

export default function CommonItemContent({className, content}: Props): JSX.Element {
    return (
        <div className={clsx(['group/item relative leading-6', className])}>
            <CopyControl
                key='copy'
                className={clsx([
                    'float-right relative shadow',
                    {'invisible group-hover/item:visible': REGULAR_SCREEN},
                ])}
                content={content}
            />
            <span>{content}</span>
        </div>
    );
}
