import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    disabled?: boolean;
    clickHandler: () => void;
};

export default function SendButton({className, disabled, clickHandler}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <ActionButton
            className={twMerge(
                'w-8 h-8',
                'p-0.5',
                'text-white',
                'border border-enonic-blue rounded-md',
                'bg-enonic-blue',
                'enabled:hover:bg-enonic-blue-light',
                'disabled:bg-enonic-gray-400 disabled:border-enonic-gray-400',
                className,
            )}
            disabled={disabled}
            name={t('action.send')}
            icon='send'
            mode='icon-with-title'
            size='md'
            clickHandler={clickHandler}
        />
    );
}
