import {atom} from 'nanostores';

import {addGlobalOpenDialogHandler} from '../common/events';
import {getParentPath, pathFromString, pathToString} from './utils/path';

export const $scope = atom<Optional<string>>(undefined);

export const setScope = (value: Optional<string>): void => $scope.set(value);

export const resetScope = (): void => $scope.set(undefined);

export const isScopeEmpty = (): boolean => $scope.get() == null;

addGlobalOpenDialogHandler(event => {
    const dataPath = event.detail.sourceDataPath;

    if (dataPath) {
        const scopePath = getParentPath(pathFromString(dataPath));
        const scope = scopePath ? pathToString(scopePath) : null;

        setScope(scope);
    }
});
