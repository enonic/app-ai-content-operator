import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import {clearChat} from '../../../../stores/chat';
import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    disabled?: boolean;
};

export default function NewChatButton({className, disabled}: Props): JSX.Element {
    const {t} = useTranslation();

    const classNames = clsx(
        'w-10 h-10',
        'bg-transparent enabled:bg-transparent',
        'text-enonic-gray enabled:hover:text-black enabled:hover:active:text-enonic-blue',
        className,
    );

    return (
        <ActionButton
            className={classNames}
            disabled={disabled}
            name={t('action.newChat')}
            icon={'pencilSquared'}
            mode='compact'
            size='medium'
            handleClick={() => {
                clearChat();
            }}
        />
    );
}
