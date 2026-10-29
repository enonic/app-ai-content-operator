import { Avatar, cn } from '@enonic/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { JukeIcon } from '@/ui/primitives/juke-icon/JukeIcon';

const LOADING_MESSAGE_NAME = 'LoadingMessage';

const THINKING_STAGES = [
  { key: 'text.thinking', delay: 0 },
  { key: 'text.thinking.still', delay: 15_000 },
  { key: 'text.thinking.almost', delay: 35_000 },
] as const;

export type LoadingMessageProps = {
  className?: string;
};

export const LoadingMessage = ({ className }: LoadingMessageProps): React.ReactNode => {
  const { t } = useTranslation();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = THINKING_STAGES.slice(1).map(({ delay }, index) =>
      window.setTimeout(() => setStage(index + 1), delay),
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <section
      data-component={LOADING_MESSAGE_NAME}
      className={cn(LOADING_MESSAGE_NAME, 'grid-cols-fit-1fr grid gap-x-4 py-2.5 pr-5', className)}
    >
      <Avatar.Root size="md" shape="circle" className="bg-transparent">
        <Avatar.Fallback className="bg-transparent p-0">
          <JukeIcon className="size-full" />
        </Avatar.Fallback>
      </Avatar.Root>
      <article className="flex flex-1 items-center text-sm">
        <span className="bg-gradient-middle bg-text-gradient-size to-muted animate-move-gradient from-main bg-clip-text text-left text-transparent">
          {t(THINKING_STAGES[stage].key)}
        </span>
      </article>
    </section>
  );
};
LoadingMessage.displayName = LOADING_MESSAGE_NAME;
