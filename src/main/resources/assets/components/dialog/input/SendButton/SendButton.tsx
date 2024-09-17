import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    disabled?: boolean;
    handleClick: () => void;
};

export default function SendButton({className, disabled, handleClick}: Props): JSX.Element {
    const {t} = useTranslation();

    const classNames = clsx(
        'w-8 h-8',
        'p-0.5',
        'text-white',
        'border border-enonic-blue rounded-full',
        'bg-enonic-blue',
        'enabled:hover:bg-enonic-blue-light',
        'disabled:bg-enonic-gray-light disabled:border-enonic-gray-light',
        className,
    );

    return (
        <ActionButton
            className={classNames}
            disabled={disabled}
            name={t('action.send')}
            icon='send'
            mode='compact'
            size='medium'
            handleClick={handleClick}
        />
    );
}
