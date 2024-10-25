import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    disabled?: boolean;
    clickHandler: () => void;
};

export default function SendButton({className, disabled, clickHandler}: Props): JSX.Element {
    const {t} = useTranslation();

    const classNames = clsx(
        'w-8 h-8',
        'p-0.5',
        'text-white',
        'border border-enonic-blue rounded-full',
        'bg-enonic-blue',
        'enabled:hover:bg-enonic-blue-light',
        'disabled:bg-enonic-gray-400 disabled:border-enonic-gray-400',
        className,
    );

    return (
        <ActionButton
            className={classNames}
            disabled={disabled}
            name={t('action.send')}
            icon='send'
            mode='compact'
            size='md'
            clickHandler={clickHandler}
        />
    );
}
