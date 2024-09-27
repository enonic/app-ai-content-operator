import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {SPECIAL_NAMES} from '../../../../../lib/shared/prompts';
import {animateTopicScroll} from '../../../../common/animations';
import {REGULAR_SCREEN} from '../../../../common/device';
import {pickMessageValue} from '../../../../common/mentions';
import {MultipleContentValue} from '../../../../stores/data/ChatMessage';
import ElementItemContent from '../ElementItemContent/ElementItemContent';
import ElementItemControls from '../ElementItemControls/ElementItemControls';
import MessageSwitcher from '../MessageSwitcher/MessageSwitcher';

type Props = {
    className?: string;
    messageId: string;
    name: string;
    value: string | MultipleContentValue;
};

export default function TopicItem({className, messageId, name, value}: Props): JSX.Element {
    const {t} = useTranslation();
    const topic = t('field.label.topic');
    const content = pickMessageValue(value);

    return (
        <li
            className={twMerge(
                clsx(['group/item grid grid-cols-fit-fit-1fr gap-x-1 gap-y-1 hover:bg-slate-50', className]),
            )}
        >
            <button
                className='-mx-1 px-1 align-baseline cursor-pointer text-sky-600 truncate'
                title={topic}
                onClick={() => animateTopicScroll()}
            >
                <span className='text-xs'>{topic}</span>
            </button>
            {typeof value !== 'string' && <MessageSwitcher messageId={messageId} name={name} content={value} />}
            <ElementItemControls
                className={clsx(['col-start-3', {'invisible group-hover/item:visible': REGULAR_SCREEN}])}
                content={content}
                name={SPECIAL_NAMES.topic}
            />
            <ElementItemContent className='col-span-3' content={pickMessageValue(content)} />
        </li>
    );
}
