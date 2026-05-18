import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { delay } from '@/common/delay';
import { dispatchResultApplied } from '@/common/events';
import { messageContentToValues, pickValue } from '@/common/messages';
import ActionButton from '@/ui/primitives/action-button/ActionButton';

import type { ApplyMessage, ModelChatMessageContent, MultipleValues } from '@/store/content';

type Props = {
  className?: string;
  content: ModelChatMessageContent;
};

function extractItems(content: ModelChatMessageContent): ApplyMessage[] {
  return Object.entries(messageContentToValues(content))
    .filter((value): value is [string, string | MultipleValues] => value[1] != null)
    .map(([name, value]) => ({
      path: name,
      text: pickValue(value),
    }));
}

export default function ApplyControl({ className, content }: Props): React.ReactNode {
  const { t } = useTranslation();
  const [applying, setApplying] = useState(false);

  const handleApply = useCallback(() => {
    setApplying(true);

    const items = extractItems(content);
    dispatchResultApplied(items);

    void delay(500).then(() => {
      setApplying(false);
    });
  }, [content]);

  return (
    <ActionButton
      className={clsx(applying && 'text-enonic-green', className)}
      name={t('action.insertAll')}
      icon={applying ? 'check' : 'applyAll'}
      mode="icon-with-title"
      clickHandler={handleApply}
    />
  );
}
