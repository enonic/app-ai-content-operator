import { twMerge } from 'tailwind-merge';

import AssistantIcon from '@/ui/primitives/assistant-icon/AssistantIcon';
import LoadingIcon from '@/ui/primitives/loading-icon/LoadingIcon';

type Props = {
  className?: string;
};

export default function LoadingMessage({ className }: Props): React.ReactNode {
  return (
    <div className={twMerge('flex gap-2', className)}>
      <AssistantIcon className="text-enonic-blue-400 shrink-0" animated />
      <article className="flex items-center">
        <LoadingIcon className="h-2 w-8" />
      </article>
    </div>
  );
}
