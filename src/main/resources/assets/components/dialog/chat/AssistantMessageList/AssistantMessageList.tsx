import {useStore} from '@nanostores/react';
import {useEffect, useRef} from 'react';

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

    const ref = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (last && ref.current) {
            ref.current.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }
    }, [ref, last]);

    return (
        <ul className='flex flex-col divide-y' ref={ref}>
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
