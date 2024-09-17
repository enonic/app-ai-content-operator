import {atom} from 'nanostores';

const scope = atom<Optional<string>>(undefined);

export default scope;

export const setScope = (value: Optional<string>): void => scope.set(value);

export const resetScope = (): void => scope.set(undefined);

export const getScope = (): Optional<string> => scope.get();

export const isScopeSet = (): boolean => scope.get() != null;
