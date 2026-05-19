import { IconButton, cn } from '@enonic/ui';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { delay } from '@/common/delay';

const COPY_CONTROL_NAME = 'CopyControl';

type CopyType = 'text' | 'html';

type Props = {
  className?: string;
  content: string;
  type?: CopyType;
};

async function copyContent(content: string, type?: CopyType): Promise<void> {
  if (type === 'html') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    const item = new ClipboardItem({
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
      'text/html': new Blob([content], { type: 'text/html' }),
    });
    await navigator.clipboard.write([item]);
  } else {
    await navigator.clipboard.writeText(content);
  }
}

export default function CopyControl({ className, content, type }: Props): React.ReactNode {
  const { t } = useTranslation();
  const [copying, setCopying] = useState(false);

  const handleCopy = async (): Promise<void> => {
    setCopying(true);
    await Promise.all([copyContent(content, type), delay(500)]);
    setCopying(false);
  };

  return (
    <IconButton
      data-component={COPY_CONTROL_NAME}
      variant="text"
      size="sm"
      icon={copying ? Check : Copy}
      title={t('action.copy')}
      aria-label={t('action.copy')}
      className={cn(COPY_CONTROL_NAME, copying && 'text-success', 'size-8', className)}
      onClick={() => void handleCopy()}
    />
  );
}
