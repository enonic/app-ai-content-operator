import {useStore} from '@nanostores/react';

import {SPECIAL_NAMES} from '../../../../../shared/enums';
import {messageContentToValues} from '../../../../common/messages';
import {$fieldDescriptors} from '../../../../stores/data';
import {ModelChatMessageContent} from '../../../../stores/data/ChatMessage';
import CommonItem from '../items/CommonItem/CommonItem';
import ElementItem from '../items/ElementItem/ElementItem';

type Props = {
    messageId: string;
    content: Required<ModelChatMessageContent>;
    last: boolean;
};

export function AssistantMessageList({messageId, content, last}: Props): React.ReactNode {
    const classNames = 'p-2 border-dashed last:!border-b';

    const fieldDescriptors = useStore($fieldDescriptors);

    return (
        <ul className='flex flex-col divide-y'>
            {Object.entries(messageContentToValues(content)).map(([key, value]) => {
                if (key === SPECIAL_NAMES.common) {
                    return <CommonItem key={key} className={classNames} value={value} last={last} />;
                }

                const descriptor = fieldDescriptors.find(descriptor => descriptor.name === key);
                if (!descriptor) {
                    return undefined;
                }

                return (
                    <ElementItem
                        key={key}
                        className={classNames}
                        messageId={messageId}
                        descriptor={descriptor}
                        value={value}
                        last={last}
                    />
                );
            })}
        </ul>
    );
}
