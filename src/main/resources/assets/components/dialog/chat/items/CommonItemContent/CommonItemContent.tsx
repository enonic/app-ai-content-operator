import {twJoin, twMerge} from 'tailwind-merge';

import {REGULAR_SCREEN} from '../../../../../common/device';
import LoadingIcon from '../../../../base/LoadingIcon/LoadingIcon';
import CopyControl from '../../controls/CopyControl/CopyControl';

type Props = {
    className?: string;
    content: Optional<string>;
    last: boolean;
};

export default function CommonItemContent({className, content, last}: Props): React.ReactNode {
    return (
        <div className={twMerge('group/item relative leading-6', className)}>
            {content ? (
                <>
                    <CopyControl
                        key='copy'
                        className={twJoin(
                            'float-right relative shadow',
                            REGULAR_SCREEN && !last && 'invisible group-hover/item:visible',
                        )}
                        content={content}
                    />
                    <span>{content}</span>
                </>
            ) : (
                <LoadingIcon />
            )}
        </div>
    );
}
