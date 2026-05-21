import { Button, cn, Tooltip } from '@enonic/ui';
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
    <Tooltip side="top" delay={500} value={title} asChild>
      <Button
        size="sm"
        variant="filled"
        data-component={CONTEXT_ITEM_NAME}
        disabled={!isEnabled}
        onClick={onClick}
        className={cn(
          CONTEXT_ITEM_NAME,
          'inline-flex items-center justify-center',
          'h-7 max-w-40 min-w-0  px-2.5',
          'text-sm disabled:text-main',
          last && 'max-w-none shrink-0',
          'disabled:pointer-auto disabled:select-text disabled:opacity-100 disabled:font-normal',
          className,
        )}
      >
        <span className="truncate">{name}</span>
        {index != null && (
          <span className={cn('pl-0.5', !isEnabled && 'font-semibold')}>[{index}]</span>
        )}
      </Button>
    </Tooltip>
  );
};
ContextItem.displayName = CONTEXT_ITEM_NAME;
