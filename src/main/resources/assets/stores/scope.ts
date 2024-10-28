import {atom} from 'nanostores';

export const $scope = atom<Optional<string>>(undefined);

export const setScope = (value: Optional<string>): void => $scope.set(value);

export const resetScope = (): void => $scope.set(undefined);

export const isScopeEmpty = (): boolean => $scope.get() == null;
