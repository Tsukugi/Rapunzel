import { MMKVInstance } from "react-native-mmkv-storage";

export enum StorageEntries {
    debug = "debug",
    searchText = "searchText",
}
export type StorageKeys = keyof typeof StorageEntries;

export type UseStorage = <T>(
    name: StorageKeys,
    value: T,
) => [T, (newValue: T | ((prevValue: T) => T)) => void];

export interface RapunzelStorageBase {
    instance: MMKVInstance;
}
