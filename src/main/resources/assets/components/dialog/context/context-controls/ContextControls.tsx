import { IconButton, cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { t } from 'i18next';
import { X } from 'lucide-react';

import { getAllPathsFromString, pathToString } from '@/store/content';
import { $context, resetContext } from '@/store/context';

import type { Path } from '@/store/content';

import ContextItem from '../context-item/ContextItem';

const CONTEXT_CONTROLS_NAME = 'ContextControls';

type Props = {
  className?: string;
};

function createItems(paths: Path[]): React.ReactNode[] {
  return paths.flatMap((path, i) => {
    const isLast = i === paths.length - 1;
    const key = pathToString(path);
    return isLast
      ? [<ContextItem key={`${key}-item-last`} path={path} last={isLast} />]
      : [
          <ContextItem key={`${key}-item`} path={path} last={isLast} />,
          <span
            key={`${key}-sep`}
            className="text-decorative flex-shrink-0 cursor-default select-none"
          >
            /
          </span>,
        ];
  });
}

export default function ContextControl({ className }: Props): React.ReactNode {
  const context = useStore($context);
  const paths = context ? getAllPathsFromString(context) : [];
  const isEmpty = paths.length === 0;

  return (
    <div
      data-component={CONTEXT_CONTROLS_NAME}
      className={cn(
        CONTEXT_CONTROLS_NAME,
        'flex items-center justify-start gap-0.5',
        'bg-surface-neutral rounded-lg',
        'text-xs',
        'overflow-hidden',
        'transition-all duration-200 ease-in-out',
        isEmpty ? 'pointer-events-none invisible h-0 opacity-0' : 'h-7 opacity-100',
        className,
      )}
    >
      <div className="flex w-fit items-center overflow-hidden">{createItems(paths)}</div>
      <IconButton
        variant="text"
        size="sm"
        icon={X}
        title={t('action.resetContext')}
        aria-label={t('action.resetContext')}
        className="text-subtle enabled:hover:bg-surface-neutral enabled:hover:text-main ml-auto w-8 rounded-lg"
        onClick={resetContext}
      />
    </div>
  );
}
