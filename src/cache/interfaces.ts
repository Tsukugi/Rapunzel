import { MMKVInstance } from "react-native-mmkv-storage";
import RNFS from "react-native-fs";

export enum StorageEntries {
    debug = "debug",
    searchText = "searchText",
    useFallbackExtensionOnDownload = "useFallbackExtensionOnDownload",
    currentRoute = "currentRoute",
    apiLoaderConfig = "apiLoaderConfig",
    repository = "repository",
    config = "config",
    library = "library",
    readerSettings = "readerSettings",
    feedLatest = "feed.latest",
    feedTrending = "feed.trending",
    browse = "browse",
}

export namespace Storage {
    export type SetItem = <T>(key: StorageEntries, value: T) => T;
    export type GetItem<T> = (key: StorageEntries) => Promise<T>;
}

export interface UseStorage {
    setItem: Storage.SetItem;
    instance: MMKVInstance;
    ready?: Promise<void>;
}

export interface RapunzelStorageBase {
    instance: MMKVInstance;
    ready: Promise<void>;
}

export const ImageCacheLocations = {
    Document: RNFS.DocumentDirectoryPath,
    Downloads: RNFS.DownloadDirectoryPath,
    Temp: RNFS.TemporaryDirectoryPath,
};
