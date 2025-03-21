import {useStore} from '@nanostores/react';
import {useEffect, useRef} from 'react';
import {twJoin} from 'tailwind-merge';

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
    const fieldDescriptors = useStore($fieldDescriptors);

    const ref = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (last && ref.current) {
            ref.current.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }
    }, [ref, last]);

    return (
        <ul className='flex flex-col divide-y rounded overflow-hidden' ref={ref}>
            {Object.entries(messageContentToValues(content)).map(([key, value], _, arr) => {
                if (key === SPECIAL_NAMES.common) {
                    const hasOtherContent = arr.length > 1;
                    return (
                        <CommonItem
                            key={key}
                            className={twJoin('p-2 border-dashed', hasOtherContent && '!border-b')}
                            value={value}
                            last={last}
                        />
                    );
                }

                const descriptor = fieldDescriptors.find(descriptor => descriptor.name === key);
                if (!descriptor) {
                    return undefined;
                }

                return (
                    <ElementItem
                        key={key}
                        className={'p-2 border-dashed last:!border-b'}
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
