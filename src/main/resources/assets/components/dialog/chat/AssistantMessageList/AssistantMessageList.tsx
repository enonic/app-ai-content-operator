import {useStore} from '@nanostores/react';
import {useEffect, useMemo, useRef} from 'react';
import {twJoin} from 'tailwind-merge';

import {SPECIAL_NAMES} from '../../../../../shared/enums';
import {messageContentToValues} from '../../../../common/messages';
import {$fieldDescriptors, $orderedPaths} from '../../../../stores/data';
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
    const orderedPaths = useStore($orderedPaths);

    const ref = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (last && ref.current) {
            ref.current.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
        }
    }, [ref, last]);

    const sortedEntries = useMemo(() => {
        const entries = Object.entries(messageContentToValues(content));
        const commonEntries = entries.filter(([key]) => key === SPECIAL_NAMES.common);
        const elementEntries = entries.filter(([key]) => key !== SPECIAL_NAMES.common);

        elementEntries.sort((a, b) => {
            const indexA = orderedPaths.indexOf(a[0]);
            const indexB = orderedPaths.indexOf(b[0]);

            // If path not found in orderedPaths, place at the end
            if (indexA === -1) {
                return 1;
            }
            if (indexB === -1) {
                return -1;
            }

            return indexA - indexB;
        });

        return [...commonEntries, ...elementEntries];
    }, [content, orderedPaths]);

    return (
        <ul className='flex flex-col divide-y rounded overflow-hidden' ref={ref}>
            {sortedEntries.map(([key, value], _, arr) => {
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
