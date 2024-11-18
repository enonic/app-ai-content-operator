import clsx from 'clsx';
import {useTranslation} from 'react-i18next';

import {clearChat} from '../../../../stores/chat';
import {resetContext} from '../../../../stores/context';
import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    disabled?: boolean;
};

export default function NewChatButton({className, disabled}: Props): React.ReactNode {
    const {t} = useTranslation();

    const classNames = clsx(
        'w-10 h-10',
        'bg-transparent enabled:bg-transparent',
        'text-enonic-gray-600 enabled:hover:text-black enabled:hover:active:text-enonic-blue',
        className,
    );

    return (
        <ActionButton
            className={classNames}
            disabled={disabled}
            name={t('action.newChat')}
            icon={'pencilSquared'}
            mode='icon-with-title'
            size='md'
            clickHandler={() => {
                clearChat();
                resetContext();
            }}
        />
    );
}
