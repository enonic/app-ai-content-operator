import {atom} from 'nanostores';

import {$context} from './context';
import {getParentPath, pathFromString, pathToString} from './utils/path';

export const $scope = atom<Optional<string>>(undefined);

export const setScope = (value: Optional<string>): void => $scope.set(value);

export const resetScope = (): void => $scope.set(undefined);

export const isScopeEmpty = (): boolean => $scope.get() == null;

$context.subscribe(context => {
    const scopePath = context ? getParentPath(pathFromString(context)) : null;
    const scope = scopePath ? pathToString(scopePath) : null;

    setScope(scope);
});
