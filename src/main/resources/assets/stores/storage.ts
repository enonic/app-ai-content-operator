import merge from 'lodash.merge';
import {BaseDeepMap, DeepMapStore, MapStore} from 'nanostores';

type SyncStore<T extends BaseDeepMap> = MapStore<T> | DeepMapStore<T>;

function putData<T>(key: string, data: T): void {
    const value = JSON.stringify(data || {});
    localStorage.setItem(key, value);
}

function getData<T>(key: string): T | Record<string, never> {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : {};
}

export function syncWithLocalStorage<T extends BaseDeepMap>(store: SyncStore<T>, storeName: string): () => void {
    const storeKey = `Enonic AI Content Operator (${storeName})`;

    const storeData = store.get();
    const localData = getData<T>(storeKey);
    const mergedData = merge(storeData, localData);

    store.set(mergedData);

    return store.subscribe((data: T) => putData(storeKey, data));
}
