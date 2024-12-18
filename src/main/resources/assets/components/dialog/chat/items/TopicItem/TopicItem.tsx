import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {twJoin, twMerge} from 'tailwind-merge';

import {SPECIAL_NAMES} from '../../../../../../shared/enums';
import {REGULAR_SCREEN} from '../../../../../common/device';
import {dispatchInteracted} from '../../../../../common/events';
import {pickValue} from '../../../../../common/messages';
import {MultipleValues} from '../../../../../stores/data/MultipleContentValue';
import ElementItemControls from '../../controls/ElementItemControls/ElementItemControls';
import ElementItemSwitchControls from '../../controls/ElementItemSwitchControls/ElementItemSwitchControls';
import ElementItemContent from '../ElementItemContent/ElementItemContent';

type Props = {
    className?: string;
    messageId: string;
    name: string;
    last: boolean;
    value: Optional<string | MultipleValues>;
};

export default function TopicItem({className, messageId, name, last, value}: Props): React.ReactNode {
    const {t} = useTranslation();
    const topic = t('field.mentions.__topic__.label');
    const content = value && pickValue(value);

    return (
        <li
            className={twMerge(
                clsx('group/item grid grid-cols-fit-fit-1fr gap-x-1 gap-y-1 hover:bg-slate-50', className),
            )}
        >
            <button
                className='-mx-1 px-1 align-baseline cursor-pointer text-sky-600 truncate'
                title={topic}
                onClick={() => dispatchInteracted(SPECIAL_NAMES.topic)}
            >
                <span className='text-xs'>{topic}</span>
            </button>
            {content && typeof value !== 'string' && (
                <ElementItemSwitchControls messageId={messageId} name={name} content={value} />
            )}
            {content && (
                <ElementItemControls
                    className={twJoin('col-start-3', REGULAR_SCREEN && !last && 'invisible group-hover/item:visible')}
                    content={content}
                    name={SPECIAL_NAMES.topic}
                />
            )}
            <ElementItemContent className='col-span-3' content={content} />
        </li>
    );
}
