import {twJoin, twMerge} from 'tailwind-merge';

import {SPECIAL_NAMES} from '../../../../../shared/enums';
import {messageContentToValues} from '../../../../common/messages';
import {ModelChatMessage} from '../../../../stores/data/ChatMessage';
import AssistantIcon from '../../../base/AssistantIcon/AssistantIcon';
import CommonItem from '../CommonItem/CommonItem';
import ElementItem from '../ElementItem/ElementItem';
import ErrorItem from '../ErrorItem/ErrorItem';
import IssueItem from '../IssueItem/IssueItem';
import MessageControls from '../MessageControls/MessageControls';
import TopicItem from '../TopicItem/TopicItem';

type Props = {
    className?: string;
    message: ModelChatMessage;
    last: boolean;
};

function createItems({id: messageId, content}: ModelChatMessage, last: boolean): React.ReactNode[] {
    const classNames = 'p-2 border-dashed last:!border-b';
    return Object.entries(messageContentToValues(content)).map(([key, value]) => {
        switch (key) {
            case SPECIAL_NAMES.error:
                return <ErrorItem key={key} className={classNames} value={value} />;
            case SPECIAL_NAMES.unclear:
                return <IssueItem key={key} className={classNames} value={value} />;
            case SPECIAL_NAMES.common:
                return <CommonItem key={key} className={classNames} value={value} last={last} />;
            case SPECIAL_NAMES.topic:
                return (
                    <TopicItem
                        key={key}
                        className={classNames}
                        messageId={messageId}
                        name={key}
                        value={value}
                        last={last}
                    />
                );
            default:
                return (
                    <ElementItem
                        key={key}
                        className={classNames}
                        messageId={messageId}
                        name={key}
                        value={value}
                        last={last}
                    />
                );
        }
    });
}

export default function AssistantMessage({className, message, last}: Props): React.ReactNode {
    return (
        <div className={twMerge('flex gap-2', className)}>
            <AssistantIcon className={twJoin('shrink-0 mt-3 text-enonic-blue-light')} />
            <article className={twJoin('flex flex-col gap-1 flex-1 text-sm')}>
                <ul className='flex flex-col divide-y'>{createItems(message, last)}</ul>
                <MessageControls className='pt-1' content={message.content} last={last} />
            </article>
        </div>
    );
}
