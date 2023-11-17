import { MMKVInstance } from "react-native-mmkv-storage";

export enum StorageEntries {
    debug = "debug",
    searchText = "searchText",
    useFallbackExtensionOnDownload = "useFallbackExtensionOnDownload",
    currentRoute = "currentRoute",
    apiLoaderConfig = "apiLoaderConfig",
    repository = "repository",
    config = "config",
    library = "library",
}

export namespace Storage {
    export type SetItem = <T>(key: StorageEntries, value: T) => T;
    export type GetItem<T> = (key: StorageEntries) => Promise<T>;
}

export interface UseStorage {
    setItem: Storage.SetItem;
    instance: MMKVInstance;
}

export interface RapunzelStorageBase {
    instance: MMKVInstance;
}
