import { Button, cn } from '@enonic/ui';
import { Astroid, Check } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { delay } from '@/common/delay';
import { messageContentToValues, pickValue } from '@/common/messages';
import { applyResults } from '@/store/host';

import type { ApplyMessage, ModelChatMessageContent, MultipleValues } from '@/store/content';

const APPLY_ALL_CONTROL_NAME = 'ApplyAllControl';

export type ApplyAllControlProps = {
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

export const ApplyAllControl = ({ className, content }: ApplyAllControlProps): React.ReactNode => {
  const { t } = useTranslation();
  const [applying, setApplying] = useState(false);

  const handleApply = useCallback(() => {
    setApplying(true);

    const items = extractItems(content);
    applyResults(items);

    void delay(300).then(() => {
      setApplying(false);
    });
  }, [content]);

  return (
    <Button
      data-component={APPLY_ALL_CONTROL_NAME}
      variant="outline"
      size="sm"
      label={t('action.insertAll')}
      endIcon={applying ? Check : Astroid}
      className={cn(
        APPLY_ALL_CONTROL_NAME,
        applying && 'text-success hover:text-success',
        className,
      )}
      onClick={handleApply}
    />
  );
};
ApplyAllControl.displayName = APPLY_ALL_CONTROL_NAME;
