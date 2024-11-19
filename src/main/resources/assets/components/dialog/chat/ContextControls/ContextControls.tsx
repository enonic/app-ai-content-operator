import {useStore} from '@nanostores/react';
import {t} from 'i18next';
import {twJoin} from 'tailwind-merge';

import {$context, resetContext} from '../../../../stores/context';
import {Path} from '../../../../stores/data/Path';
import {getAllPathsFromString, pathToString} from '../../../../stores/utils/path';
import ActionButton from '../../../shared/ActionButton/ActionButton';
import ContextItem from '../ContextItem/ContextItem';

function createItems(paths: Path[]): React.ReactNode[] {
    return paths.flatMap((path, i) => {
        const isLast = i === paths.length - 1;
        const key = pathToString(path);
        return isLast
            ? [<ContextItem key={`${key}-item-last`} path={path} last={isLast} />]
            : [
                  <ContextItem key={`${key}-item`} path={path} last={isLast} />,
                  <span key={`${key}-sep`} className='text-enonic-gray-400 cursor-default select-none flex-shrink-0'>
                      /
                  </span>,
              ];
    });
}

export default function ContextControl(): React.ReactNode {
    const context = useStore($context);
    const paths = context ? getAllPathsFromString(context) : [];
    const isEmpty = paths.length === 0;

    return (
        <div
            className={twJoin(
                'flex gap-0.5 justify-start items-center',
                'box-content',
                'ml-17 mr-6',
                'text-xs',
                'transition-all duration-200 ease-in-out',
                isEmpty ? 'h-0 -mb-2 opacity-0 pointer-events-none' : 'h-6 mb-0 opacity-100',
            )}
        >
            <div className='flex items-center w-fit overflow-hidden'>{createItems(paths)}</div>
            <ActionButton
                name={t('action.resetContext')}
                mode='icon-with-title'
                size='sm'
                icon='close'
                clickHandler={resetContext}
            />
        </div>
    );
}
