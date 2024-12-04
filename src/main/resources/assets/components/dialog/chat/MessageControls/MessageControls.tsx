import {useStore} from '@nanostores/react';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {SPECIAL_NAMES} from '../../../../../shared/enums';
import {dispatchResultApplied} from '../../../../common/events';
import {pickMessageValue} from '../../../../common/mentions';
import {sendRetryMessage} from '../../../../stores/chat';
import {ApplyMessage} from '../../../../stores/data/ApplyMessage';
import {ModelChatMessageContent} from '../../../../stores/data/ChatMessage';
import {$chatRequestRunning} from '../../../../stores/requests';
import ActionButton from '../../../base/ActionButton/ActionButton';

export interface Props {
    className?: string;
    forId: string;
    content: ModelChatMessageContent;
    last: boolean;
}

function extractItems(content: ModelChatMessageContent): ApplyMessage[] {
    return Object.entries(content)
        .filter(([name]) => name !== SPECIAL_NAMES.error && name !== SPECIAL_NAMES.unclear)
        .map(([name, content = '']) => ({
            path: name,
            text: pickMessageValue(content),
        }));
}

export default function MessageControls({className, forId, content, last}: Props): React.ReactNode {
    const {t} = useTranslation();

    const multiple = Object.keys(content).length > 1;
    const requestRunning = useStore($chatRequestRunning);
    const lastAndAvailable = last && !requestRunning;

    return (
        <div className={twMerge('empty:hidden', className)}>
            {lastAndAvailable && (
                <ActionButton
                    name={t('action.retry')}
                    icon='retry'
                    mode='icon-with-title'
                    clickHandler={() => void sendRetryMessage(forId)}
                />
            )}
            {lastAndAvailable && multiple && (
                <ActionButton
                    name={t('action.insertAll')}
                    icon='applyAll'
                    mode='icon-with-title'
                    clickHandler={() => {
                        const items = extractItems(content);
                        dispatchResultApplied(items);
                    }}
                />
            )}
        </div>
    );
}
