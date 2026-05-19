import { cn } from '@enonic/ui';
import { useStore } from '@nanostores/react';
import { t } from 'i18next';

import {
  $allFormItemsWithPaths,
  isChildPath,
  isInput,
  pathToLabelAndIndex,
  pathToPrettifiedLabel,
  pathToString,
  pathsEqual,
} from '@/store/content';
import { setContext } from '@/store/context';

import type { FormItemWithPath, Path } from '@/store/content';

const CONTEXT_ITEM_NAME = 'ContextItem';

export type ContextItemProps = {
  className?: string;
  path: Path;
  last: boolean;
};

function hasChildrenInputs(allPaths: FormItemWithPath[], path: Path): boolean {
  return allPaths.filter((p) => isChildPath(p, path) && isInput(p)).length > 0;
}

export const ContextItem = ({ className, path, last }: ContextItemProps): React.ReactNode => {
  const allFormItemsWithPaths = useStore($allFormItemsWithPaths);
  const formItem = allFormItemsWithPaths.find((p) => pathsEqual(p, path));
  const isEnabled = hasChildrenInputs(allFormItemsWithPaths, path) && !last && formItem != null;

  const [name, index] = (formItem && pathToLabelAndIndex(formItem)) ?? ['', undefined];
  const titleText = (formItem && pathToPrettifiedLabel(formItem)) ?? '';
  const title = isEnabled ? t('action.switchContextTo', { name: titleText }) : titleText;

  const onClick = isEnabled ? () => setContext(pathToString(path)) : undefined;

  return (
    <button
      type="button"
      data-component={CONTEXT_ITEM_NAME}
      disabled={!isEnabled}
      onClick={onClick}
      title={title}
      className={cn(
        CONTEXT_ITEM_NAME,
        'inline-flex items-center justify-center',
        'h-6 max-w-40 min-w-0 truncate rounded-lg px-1.5',
        'text-main text-sm',
        'enabled:hover:bg-surface-neutral disabled:opacity-100',
        isEnabled && 'text-info hover:text-info-rev',
        last && 'max-w-none shrink-0',
        className,
      )}
    >
      <span className="truncate">{name}</span>
      {index != null && (
        <span className={cn('pl-0.5', !isEnabled && 'font-semibold')}>[{index}]</span>
      )}
    </button>
  );
};
ContextItem.displayName = CONTEXT_ITEM_NAME;
