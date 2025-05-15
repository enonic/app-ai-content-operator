import {useStore} from '@nanostores/react';
import {t} from 'i18next';
import {twJoin} from 'tailwind-merge';

import {setContext} from '../../../../stores/context';
import {$allFormItemsWithPaths} from '../../../../stores/data';
import {FormItemWithPath} from '../../../../stores/data/FormItemWithPath';
import {Path} from '../../../../stores/data/Path';
import {getPathLabel, isChildPath, pathsEqual, pathToString} from '../../../../stores/utils/path';
import {isInput} from '../../../../stores/utils/schema';
import ActionButton from '../../../base/ActionButton/ActionButton';

type Props = {
    className?: string;
    path: Path;
    last: boolean;
};

function hasChildrenInputs(allPaths: FormItemWithPath[], path: Path): boolean {
    return allPaths.filter(p => isChildPath(p, path) && isInput(p)).length > 0;
}

export default function ContextItem({className, path, last}: Props): React.ReactNode {
    const allFormItemsWithPaths = useStore($allFormItemsWithPaths);
    const formItem = allFormItemsWithPaths.find(p => pathsEqual(p, path));
    const isEnabled = hasChildrenInputs(allFormItemsWithPaths, path) && !last && formItem != null;

    const name = formItem ? getPathLabel(formItem) : '';

    const clickHandler = isEnabled ? () => setContext(pathToString(path)) : undefined;

    return (
        <ActionButton
            className={twJoin(
                'max-w-none min-w-0',
                'disabled:opacity-100 enabled:hover:bg-white text-xs rounded-lg',
                isEnabled && 'text-enonic-blue-400 hover:text-enonic-blue-500',
                last && 'font-medium flex-shrink-0',
                className,
            )}
            size='sm'
            mode='text-with-title'
            title={t('action.switchContextTo', {name})}
            name={name}
            clickHandler={clickHandler}
        />
    );
}
