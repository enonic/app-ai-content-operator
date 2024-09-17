import {atom} from 'nanostores';

export const $scope = atom<Optional<string>>(undefined);

export const setScope = (value: Optional<string>): void => $scope.set(value);

export const resetScope = (): void => $scope.set(undefined);

export const getScope = (): Optional<string> => $scope.get();

export const isScopeSet = (): boolean => $scope.get() != null;
