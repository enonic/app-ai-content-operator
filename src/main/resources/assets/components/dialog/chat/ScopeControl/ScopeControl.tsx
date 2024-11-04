import {Fragment} from 'react';
import {twMerge} from 'tailwind-merge';

import {Path} from '../../../../stores/data/Path';
import {getParentPath, pathFromString, pathToString} from '../../../../stores/utils/path';
import ScopeItem from '../ScopeItem/ScopeItem';

type Props = {
    className?: string;
    scope: Optional<string>;
};

export default function ScopeControl({className, scope}: Props): React.ReactNode {
    const scopePath = scope ? pathFromString(scope) : null;
    const scopeBreadcrumbItems: Path[] = [];
    let scopeParentPath: Optional<Path> = scopePath;

    while (scopeParentPath) {
        scopeBreadcrumbItems.unshift(scopeParentPath);
        scopeParentPath = getParentPath(scopeParentPath);
    }

    return (
        // TODO: Check if empty:hidden can be applied here
        <div className={twMerge('h-5 flex gap-0.5 justify-center items-center', className)}>
            {scopeBreadcrumbItems.map((path, i) => (
                <Fragment key={pathToString(path)}>
                    <span className='text-xs'>/</span>
                    <ScopeItem path={path} active={i === scopeBreadcrumbItems.length - 1} />
                </Fragment>
            ))}
        </div>
    );
}
