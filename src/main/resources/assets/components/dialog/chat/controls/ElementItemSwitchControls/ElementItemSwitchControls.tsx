import {useTranslation} from 'react-i18next';
import {twJoin, twMerge} from 'tailwind-merge';

import {changeModelMessageSelectedIndex} from '../../../../../stores/chat';
import {MultipleValues} from '../../../../../stores/data/MultipleContentValue';
import ActionButton from '../../../../base/ActionButton/ActionButton';

export interface Props {
    className?: string;
    messageId: string;
    name: string;
    content: MultipleValues;
}

export default function ElementItemSwitchControls({className, messageId, name, content}: Props): React.ReactNode {
    const {t} = useTranslation();
    const {values, selectedIndex} = content;
    const isFirst = selectedIndex === 0;
    const isLast = selectedIndex === values.length - 1;
    const totalCount = values.length;
    const text = `${selectedIndex + 1}/${totalCount}`;

    return (
        <div className={twMerge('flex items-center', className)}>
            <ActionButton
                className='w-4 h-auto disabled:opacity-25'
                name={t('showPreviousOption')}
                icon='left'
                mode='icon-only'
                size='xs'
                disabled={isFirst}
                clickHandler={() => {
                    changeModelMessageSelectedIndex(messageId, name, selectedIndex - 1);
                }}
            />
            <span
                className={twJoin(
                    'flex items-center justify-center',
                    'w-6 h-6 p-',
                    'text-xs text-enonic-gray-600 cursor-default',
                )}
            >
                {text}
            </span>
            <ActionButton
                className='w-4 h-auto disabled:opacity-25'
                name={t('action.showNextOption')}
                icon='right'
                mode='icon-only'
                size='xs'
                disabled={isLast}
                clickHandler={() => {
                    changeModelMessageSelectedIndex(messageId, name, selectedIndex + 1);
                }}
            />
        </div>
    );
}
