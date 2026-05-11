import {useTranslation} from 'react-i18next';

import {sendRetry} from '@/store/websocket/websocket.store';
import ActionButton from '@/ui/primitives/ActionButton/ActionButton';

type Props = {
    className?: string;
    userMessageId: string;
    disabled?: boolean;
};

export default function RetryControl({className, userMessageId, disabled}: Props): React.ReactNode {
    const {t} = useTranslation();

    return (
        <ActionButton
            className={className}
            name={t('action.retry')}
            icon='retry'
            mode='icon-with-title'
            clickHandler={() => sendRetry(userMessageId)}
            disabled={disabled}
        />
    );
}
