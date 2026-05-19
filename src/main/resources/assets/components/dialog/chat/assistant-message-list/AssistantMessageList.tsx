import { cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { t } from 'i18next';
import { useEffect, useMemo, useRef } from 'react';

import { $fieldDescriptors, $orderedPaths } from '@/store/content';

import type { MessageItem, ModelChatMessageContent } from '@/store/content';

import { SPECIAL_NAMES } from '../../../../../shared/enums';
import { messageContentToValues } from '../../../../common/messages';
import { CommonItem } from '../items/common-item/CommonItem';
import { ElementItem } from '../items/element-item/ElementItem';

const ASSISTANT_MESSAGE_LIST_NAME = 'AssistantMessageList';

export type AssistantMessageListProps = {
  messageId: string;
  content: Required<ModelChatMessageContent>;
  last: boolean;
};

export const AssistantMessageList = ({
  messageId,
  content,
  last,
}: AssistantMessageListProps): React.ReactNode => {
  const fieldDescriptors = useStore($fieldDescriptors);
  const orderedPaths = useStore($orderedPaths);

  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (last && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  }, [ref, last]);

  const sortedEntries = useMemo((): [string, MessageItem][] => {
    const descriptorNames = fieldDescriptors.map((descriptor) => descriptor.name);

    const entries = Object.entries(messageContentToValues(content));
    const commonEntries = entries.filter(([key]) => key === SPECIAL_NAMES.common);
    const elementEntries = entries.filter(([key]) => descriptorNames.includes(key));

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

    const sortedEntries = [...commonEntries, ...elementEntries];

    return sortedEntries.length > 0
      ? sortedEntries
      : [[SPECIAL_NAMES.common, t('field.error.entries.empty')]];
  }, [content, fieldDescriptors, orderedPaths]);

  return (
    <ul
      ref={ref}
      data-component={ASSISTANT_MESSAGE_LIST_NAME}
      className={cn(ASSISTANT_MESSAGE_LIST_NAME, 'flex flex-col gap-5')}
    >
      {sortedEntries.map(([key, value]) => {
        if (key === SPECIAL_NAMES.common) {
          return <CommonItem key={key} value={value} last={last} />;
        }

        const descriptor = fieldDescriptors.find((descriptor) => descriptor.name === key);
        if (!descriptor) {
          return undefined;
        }

        return (
          <ElementItem
            key={key}
            messageId={messageId}
            descriptor={descriptor}
            value={value}
            last={last}
          />
        );
      })}
    </ul>
  );
};
AssistantMessageList.displayName = ASSISTANT_MESSAGE_LIST_NAME;
