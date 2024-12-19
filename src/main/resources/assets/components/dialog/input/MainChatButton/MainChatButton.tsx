import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import ActionButton from '../../../base/ActionButton/ActionButton';

type Props = {
    className?: string;
    disabled?: boolean;
    type: 'send' | 'stop';
    clickHandler: () => void;
};

export default function MainChatButton({className, disabled, type, clickHandler}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <ActionButton
            className={twMerge(
                'w-8 h-8',
                'p-0.5',
                'text-white',
                'border border-enonic-blue rounded-full',
                'bg-enonic-blue',
                'enabled:hover:bg-enonic-blue-400',
                'disabled:bg-enonic-gray-400 disabled:border-enonic-gray-400',
                className,
            )}
            disabled={disabled}
            name={t('action.send')}
            icon={type}
            mode='icon-with-title'
            size='md'
            clickHandler={clickHandler}
        />
    );
}
