import clsx from 'clsx';

import {animateScroll} from '../../../../common/animations';
import {getFormItemByPath} from '../../../../stores/data';
import {Path} from '../../../../stores/data/Path';
import {getParentPath, getPathLabel, pathToPrettifiedString, pathToString} from '../../../../stores/pathUtil';
import {resetScope, setScope} from '../../../../stores/scope';
import Icon from '../../../shared/Icon/Icon';

type Props = {
    className?: string;
    path: Path;
    active?: boolean;
};

export default function ScopeItem({className, path, active}: Props): JSX.Element {
    const formItem = path ? getFormItemByPath(path) : null;
    const parentPath = getParentPath(path);
    const parentFormItem = parentPath ? getFormItemByPath(parentPath) : null;
    const label = getPathLabel(formItem ?? path);

    return (
        <div className={clsx(['flex bg-sky-50 rounded-md border border-solid border-gray-400', className])}>
            <button
                className={clsx(['flex items-center px-1 max-w-32 ', {'opacity-70': !active}])}
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
                    <Icon name={'close'} className={clsx(['shrink-0', 'w-3 h-3'])} />
                </button>
            ) : null}
        </div>
    );
}
