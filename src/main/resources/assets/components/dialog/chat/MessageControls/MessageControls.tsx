import {useStore} from '@nanostores/react';
import clsx from 'clsx';
import {useTranslation} from 'react-i18next';
import {twMerge} from 'tailwind-merge';

import {animateGlow} from '../../../../common/animations';
import {dispatchResultApplied} from '../../../../common/events';
import {pickMessageValue} from '../../../../common/mentions';
import {sendRetryMessage} from '../../../../stores/chat';
import {ApplyMessage} from '../../../../stores/data/ApplyMessage';
import {ModelChatMessageContent} from '../../../../stores/data/ChatMessage';
import {isChatRequestRunning} from '../../../../stores/requests';
import ActionButton from '../../../shared/ActionButton/ActionButton';

export interface Props {
    className?: string;
    content: ModelChatMessageContent;
    last: boolean;
}

function extractItems(content: ModelChatMessageContent): ApplyMessage[] {
    return Object.entries(content)
        .filter(([name]) => name !== '_error_' && name !== '_unclear')
        .map(([name, content = '']) => ({
            name,
            content: pickMessageValue(content),
        }));
}

export default function MessageControls({className, content, last}: Props): JSX.Element {
    const {t} = useTranslation();

    const multiple = Object.keys(content).length > 1;
    const requestRunning = useStore(isChatRequestRunning);
    const lastAndAvailable = last && !requestRunning;

    return (
        <div className={twMerge(clsx(['empty:hidden', className]))}>
            {lastAndAvailable && (
                <ActionButton
                    name={t('action.retry')}
                    icon='retry'
                    mode='compact'
                    handleClick={() => void sendRetryMessage()}
                />
            )}
            {lastAndAvailable && multiple && (
                <ActionButton
                    name={t('action.insertAll')}
                    icon='applyAll'
                    mode='compact'
                    handleClick={() => {
                        const items = extractItems(content);
                        dispatchResultApplied(items);
                        Object.keys(content).forEach(name => animateGlow(name));
                    }}
                />
            )}
        </div>
    );
}
