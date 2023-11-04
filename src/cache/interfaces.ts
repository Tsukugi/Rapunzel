import { MMKVInstance } from "react-native-mmkv-storage";

export enum StorageEntries {
    debug = "debug",
    searchText = "searchText",
}
export type StorageKeys = keyof typeof StorageEntries;

export namespace Storage {
    export type SetItem = <T>(key: StorageEntries, value: T) => T;
    export type GetItem = <T>(key: StorageEntries) => Promise<T>;
}

export interface UseStorage {
    setItem: Storage.SetItem;
    getItem: Storage.GetItem;
}

export interface RapunzelStorageBase {
    instance: MMKVInstance;
}
