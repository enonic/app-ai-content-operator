import {useStore} from '@nanostores/react';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {dispatchResultApplied} from '../../../../common/events';
import {messageContentToValues, pickValue} from '../../../../common/messages';
import {ApplyMessage} from '../../../../stores/data/ApplyMessage';
import {ModelChatMessageContent} from '../../../../stores/data/ChatMessage';
import {MultipleValues} from '../../../../stores/data/MultipleContentValue';
import {$canChat, sendRetry} from '../../../../stores/websocket';
import ActionButton from '../../../base/ActionButton/ActionButton';

export interface Props {
    className?: string;
    forId: string;
    content: ModelChatMessageContent;
    last: boolean;
}

function extractItems(content: ModelChatMessageContent): ApplyMessage[] {
    return Object.entries(messageContentToValues(content))
        .filter((value): value is [string, string | MultipleValues] => value[1] != null)
        .map(([name, value]) => ({
            path: name,
            text: pickValue(value),
        }));
}

export default function MessageControls({className, content, last, forId}: Props): React.ReactNode {
    const {t} = useTranslation();

    const multiple = Object.keys(content).length > 1;
    const canChat = useStore($canChat);
    const lastAndAvailable = last && canChat;

    return (
        <div className={twMerge('empty:hidden', className)}>
            {lastAndAvailable && (
                <ActionButton
                    name={t('action.retry')}
                    icon='retry'
                    mode='icon-with-title'
                    clickHandler={() => sendRetry(forId)}
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
