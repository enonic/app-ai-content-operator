import { Button, cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { t } from 'i18next';
import { X } from 'lucide-react';

import { getAllPathsFromString, pathToString } from '@/store/content';
import { $context, resetContext } from '@/store/context';

import type { Path } from '@/store/content';

import { ContextItem } from '../context-item/ContextItem';

const CONTEXT_CONTROLS_NAME = 'ContextControls';

export type ContextControlsProps = {
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
        <span key={`${key}-sep`} className="text-subtle shrink-0 cursor-default select-none">
          /
        </span>,
      ];
  });
}

export const ContextControls = ({ className }: ContextControlsProps): React.ReactNode => {
  const context = useStore($context);
  const paths = context ? getAllPathsFromString(context) : [];
  const isEmpty = paths.length === 0;

  return (
    <div
      data-component={CONTEXT_CONTROLS_NAME}
      className={cn(
        CONTEXT_CONTROLS_NAME,
        'flex items-center justify-start gap-2',
        'text-xs',
        'overflow-hidden',
        'transition-all duration-150 ease-in-out',
        isEmpty ? 'pointer-events-none invisible mb-0 h-0 opacity-0' : 'mb-2.5 h-9 opacity-100',
        className,
      )}
    >
      <div className="flex w-fit items-center overflow-hidden">{createItems(paths)}</div>
      <Button
        variant="filled"
        size="sm"
        endIcon={X}
        endIconClassName='shrink-0'
        iconSize="md"
        aria-label={t('action.resetContext')}
        className="ml-auto h-7"
        onClick={resetContext}
      >
        <span className="truncate">{t('action.resetContext')}</span>
      </Button>
    </div>
  );
};
ContextControls.displayName = CONTEXT_CONTROLS_NAME;
