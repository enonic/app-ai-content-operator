import clsx from 'clsx';

import {SPECIAL_NAMES} from '../../../../../lib/shared/prompts';
import {ModelChatMessage} from '../../../../stores/data/ChatMessage';
import ApplicantIcon from '../../../shared/AssistantIcon/AssistantIcon';
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

const ORDER: string[] = Object.values(SPECIAL_NAMES).reverse();

function createFields({id: messageId, content}: ModelChatMessage): JSX.Element[] {
    const classNames = 'p-2 border-dashed last:!border-b';
    return Object.entries(content)
        .sort(([keyA], [keyB]) => {
            const indexA = ORDER.indexOf(keyA);
            const indexB = ORDER.indexOf(keyB);
            return indexA - indexB;
        })
        .reverse()
        .map(([key, value = '']) => {
            switch (key) {
                case SPECIAL_NAMES.error:
                    return <ErrorItem key={key} className={classNames} value={value} />;
                case SPECIAL_NAMES.unclear:
                    return <IssueItem key={key} className={classNames} value={value} />;
                case SPECIAL_NAMES.common:
                    return <CommonItem key={key} className={classNames} value={value} />;
                case SPECIAL_NAMES.topic:
                    return (
                        <TopicItem key={key} className={classNames} messageId={messageId} name={key} value={value} />
                    );
                default:
                    return (
                        <ElementItem key={key} className={classNames} messageId={messageId} name={key} value={value} />
                    );
            }
        });
}

export default function AssistantMessage({className, message, last}: Props): JSX.Element {
    return (
        <div className={clsx(['flex gap-2', className])}>
            <ApplicantIcon className='shrink-0 mt-3 text-enonic-blue-light' />
            <article className={clsx(['flex flex-col gap-1', 'flex-1'])}>
                <ul className='flex flex-col divide-y'>{createFields(message)}</ul>
                <MessageControls className='pt-1' content={message.content} last={last} />
            </article>
        </div>
    );
}
