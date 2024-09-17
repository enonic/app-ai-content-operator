import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {changeModelMessageSelectedIndex} from '../../../../stores/chat';
import {MultipleContentValue} from '../../../../stores/data/ChatMessage';
import ActionButton from '../../../shared/ActionButton/ActionButton';

export interface Props {
    className?: string;
    messageId: string;
    name: string;
    content: MultipleContentValue;
}

export default function MessageSwitcher({className, messageId, name, content}: Props): JSX.Element {
    const {t} = useTranslation();
    const {values, selectedIndex} = content;
    const isFirst = selectedIndex === 0;
    const isLast = selectedIndex === values.length - 1;
    const totalCount = values.length;
    const text = `${selectedIndex + 1}/${totalCount}`;

    return (
        <div className={twMerge(clsx(['flex', className]))}>
            <ActionButton
                className='w-4 disabled:opacity-25'
                name={t('showPrevious')}
                icon='left'
                mode='icon-only'
                size='tiny'
                disabled={isFirst}
                handleClick={() => {
                    changeModelMessageSelectedIndex(messageId, name, selectedIndex - 1);
                }}
            />
            <span
                className={clsx([
                    'flex items-center justify-center',
                    'w-6 h-6 p-',
                    'text-xs text-enonic-gray cursor-default',
                ])}
            >
                {text}
            </span>
            <ActionButton
                className='w-4 disabled:opacity-25'
                name={t('action.showNext')}
                icon='right'
                mode='icon-only'
                size='tiny'
                disabled={isLast}
                handleClick={() => {
                    changeModelMessageSelectedIndex(messageId, name, selectedIndex + 1);
                }}
            />
        </div>
    );
}
