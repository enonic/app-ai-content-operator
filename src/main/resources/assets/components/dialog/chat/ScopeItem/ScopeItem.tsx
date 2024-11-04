import {useStore} from '@nanostores/react';
import {twJoin, twMerge} from 'tailwind-merge';

import {animateScroll} from '../../../../common/animations';
import {$allFormItemsWithPaths} from '../../../../stores/data';
import {Path} from '../../../../stores/data/Path';
import {resetScope, setScope} from '../../../../stores/scope';
import {
    getParentPath,
    getPathLabel,
    pathsEqual,
    pathToPrettifiedString,
    pathToString,
} from '../../../../stores/utils/path';
import Icon from '../../../shared/Icon/Icon';

type Props = {
    className?: string;
    path: Path;
    active?: boolean;
};

export default function ScopeItem({className, path, active}: Props): React.ReactNode {
    const paths = useStore($allFormItemsWithPaths);
    const formItem = path && paths.find(p => pathsEqual(p, path));
    const parentPath = getParentPath(path);
    const parentFormItem = parentPath && paths.find(p => pathsEqual(p, parentPath));
    const label = getPathLabel(formItem ?? path);

    return (
        <div className={twMerge('flex bg-sky-50 rounded-md border border-solid border-gray-400', className)}>
            <button
                className={twJoin('flex items-center px-1 max-w-32', !active && 'opacity-70')}
                title={formItem ? pathToPrettifiedString(formItem) : ''}
                onClick={() => animateScroll(pathToString(path))}
            >
                <span className='text-sm truncate'>{`${label}`}</span>
            </button>
            {active ? (
                <button
                    className='p-0.5'
                    onClick={parentFormItem ? () => setScope(pathToString(parentFormItem)) : () => resetScope()}
                >
                    <Icon name={'close'} className={'shrink-0 w-3 h-3'} />
                </button>
            ) : null}
        </div>
    );
}
