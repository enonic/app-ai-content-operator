import { Avatar, cn } from '@enonic/ui';
import { useTranslation } from 'react-i18next';

import { JukeIcon } from '@/ui/primitives/juke-icon/JukeIcon';

const LOADING_MESSAGE_NAME = 'LoadingMessage';

type Props = {
  className?: string;
};

export default function LoadingMessage({ className }: Props): React.ReactNode {
  const { t } = useTranslation();

  return (
    <section
      data-component={LOADING_MESSAGE_NAME}
      className={cn(LOADING_MESSAGE_NAME, 'grid-cols-fit-1fr grid gap-x-4 pl-2.5 pr-5 py-2.5', className)}
    >
      <Avatar.Root size="md" shape="circle" className="bg-transparent">
        <Avatar.Fallback className="bg-transparent p-0">
          <JukeIcon className="size-full" />
        </Avatar.Fallback>
      </Avatar.Root>
      <article className="flex flex-1 items-center text-sm">
        <span className="bg-gradient-middle bg-text-gradient-size to-muted animate-move-gradient from-main bg-clip-text text-left text-transparent">
          {t('text.thinking')}
        </span>
      </article>
    </section>
  );
}
