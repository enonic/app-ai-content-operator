namespace Java {
    declare interface ConcurrentHashMap<K = unknown, V = unknown> {
        get(key: K): V | undefined;
        put(key: K, value: V): V | undefined;
        remove(key: K): V | undefined;
        forEach(action: (key: K, value: V) => void): void;
    }
}

interface XpBeans {
    'java.util.concurrent.ConcurrentHashMap': Java.ConcurrentHashMap;
}
