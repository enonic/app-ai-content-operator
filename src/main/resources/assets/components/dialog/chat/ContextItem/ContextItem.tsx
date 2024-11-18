import {useStore} from '@nanostores/react';
import {t} from 'i18next';
import {twJoin} from 'tailwind-merge';

import {setContext} from '../../../../stores/context';
import {$allFormItemsWithPaths} from '../../../../stores/data';
import {Path} from '../../../../stores/data/Path';
import {getPathLabel, pathsEqual, pathToString} from '../../../../stores/utils/path';
import ActionButton from '../../../shared/ActionButton/ActionButton';

type Props = {
    className?: string;
    path: Path;
    last: boolean;
};

export default function ContextItem({className, path, last}: Props): React.ReactNode {
    const allFormItemsWithPaths = useStore($allFormItemsWithPaths);
    const formItem = allFormItemsWithPaths.find(p => pathsEqual(p, path));
    const name = formItem ? getPathLabel(formItem) : '';
    const clickHandler = name && !last ? () => setContext(pathToString(path)) : undefined;

    return (
        <ActionButton
            className={twJoin('rounded-sm disabled:opacity-100', !last && 'text-enonic-blue-light', className)}
            size='sm'
            mode='text-with-title'
            title={t('action.switchContextTo', {name})}
            name={name}
            clickHandler={clickHandler}
        />
    );
}
