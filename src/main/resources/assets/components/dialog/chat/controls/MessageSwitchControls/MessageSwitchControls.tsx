import {useTranslation} from 'react-i18next';
import {twJoin, twMerge} from 'tailwind-merge';

import {markMessageAsActive} from '../../../../../stores/chat';
import ActionButton from '../../../../base/ActionButton/ActionButton';

export interface Props {
    className?: string;
    ids: string[];
    selectedId: string;
}

export default function MessageSwitchControls({className, ids, selectedId}: Props): React.ReactNode {
    const {t} = useTranslation();

    const selectedIndex = ids.indexOf(selectedId);
    const isFirst = selectedIndex === 0;
    const isLast = selectedIndex === ids.length - 1;
    const totalCount = ids.length;
    const text = `${selectedIndex + 1}/${totalCount}`;

    return (
        <div className={twMerge('flex items-center', className)}>
            <ActionButton
                className='disabled:opacity-25'
                name={t('showPreviousMessage')}
                icon='left'
                mode='icon-only'
                size='sm'
                disabled={isFirst}
                clickHandler={() => {
                    markMessageAsActive(ids.at(selectedIndex - 1));
                }}
            />
            <span
                className={twJoin(
                    'flex items-center justify-center',
                    'w-6 h-6',
                    'text-xs text-enonic-gray-600 cursor-default',
                )}
            >
                {text}
            </span>
            <ActionButton
                className='disabled:opacity-25'
                name={t('action.showNextMessage')}
                icon='right'
                mode='icon-only'
                size='sm'
                disabled={isLast}
                clickHandler={() => {
                    markMessageAsActive(ids.at(selectedIndex + 1));
                }}
            />
        </div>
    );
}
