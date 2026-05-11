import {useStore} from '@nanostores/react';
import {t} from 'i18next';
import {twJoin} from 'tailwind-merge';

import {setContext} from '@/store/context/context.store';
import {$allFormItemsWithPaths} from '@/store/content/content.store';
import type {FormItemWithPath} from '@/store/content/FormItemWithPath';
import type {Path} from '@/store/content/Path';
import {
    isChildPath,
    pathsEqual,
    pathToLabelAndIndex,
    pathToPrettifiedLabel,
    pathToString,
} from '@/store/utils/path';
import {isInput} from '@/store/utils/schema';
import ActionButton from '@/ui/primitives/ActionButton/ActionButton';

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

    const [name, index] = (formItem && pathToLabelAndIndex(formItem)) ?? ['', undefined];
    const titleText = (formItem && pathToPrettifiedLabel(formItem)) ?? '';
    const title = isEnabled ? t('action.switchContextTo', {name: titleText}) : titleText;

    const clickHandler = isEnabled ? () => setContext(pathToString(path)) : undefined;

    return (
        <ActionButton
            className={twJoin(
                'max-w-none min-w-0',
                'disabled:opacity-100 enabled:hover:bg-white text-xs rounded-lg',
                isEnabled && 'text-enonic-blue-400 hover:text-enonic-blue-500',
                last && 'max-w-none flex-shrink-0',
                className,
            )}
            size='sm'
            mode='text-with-title'
            forceTitle={true}
            title={title}
            name={name}
            clickHandler={clickHandler}
        >
            {index != null && (
                <span className={twJoin('pl-0.5', isEnabled ? 'text-enonic-gray-400' : 'text-enonic-gray-600')}>
                    [{index}]
                </span>
            )}
        </ActionButton>
    );
}
