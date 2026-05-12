import { useStore } from '@nanostores/react';
import { t } from 'i18next';
import { twMerge } from 'tailwind-merge';

import { $context, resetContext } from '@/store/context/context.store';
import type { Path } from '@/store/content/Path';
import { getAllPathsFromString, pathToString } from '@/store/utils/path';
import ActionButton from '@/ui/primitives/ActionButton/ActionButton';
import ContextItem from '../ContextItem/ContextItem';

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
            className="text-enonic-gray-400 flex-shrink-0 cursor-default select-none"
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
      className={twMerge(
        'flex gap-0.5 justify-start items-center',
        'bg-white rounded-lg',
        'text-xs',
        'overflow-hidden',
        'transition-all duration-200 ease-in-out',
        isEmpty ? 'h-0 opacity-0 pointer-events-none invisible' : 'h-7 opacity-100',
        className,
      )}
    >
      <div className="flex w-fit items-center overflow-hidden">{createItems(paths)}</div>
      <ActionButton
        className="text-enonic-gray-600 ml-auto w-8 rounded-lg enabled:hover:bg-white enabled:hover:text-black"
        name={t('action.resetContext')}
        mode="icon-with-title"
        size="sm"
        icon="close"
        clickHandler={resetContext}
      />
    </div>
  );
}
