import { MMKVLoader, useMMKVStorage } from "react-native-mmkv-storage";
import { useRapunzelStore } from "../store/store";
import {
    UseStorage,
    StorageKeys,
    StorageEntries,
    RapunzelStorageBase,
} from "./interfaces";

const RapunzelStorage = {} as RapunzelStorageBase;
export const useRapunzelStorage: UseStorage = (name, value) => {
    if (!RapunzelStorage.instance) {
        throw Error("Storage not initialized");
    }
    return useMMKVStorage(name, RapunzelStorage.instance, value);
};

export const initRapunzelStorage = () => {
    RapunzelStorage.instance = new MMKVLoader().initialize();

    const getValue = async <T>(key: StorageKeys): Promise<T | null> => {
        const value = (await RapunzelStorage.instance.getItem(key)) as T;
        if (value === null || value === undefined) return null;
        return value;
    };

    const {
        config: [config],
        header: [header],
    } = useRapunzelStore();

    const { searchText, debug } = StorageEntries;
    assignValueIfSet(getValue<string>(searchText), header.searchValue);
    assignValueIfSet(getValue<boolean>(debug), config.debug);
};

const assignValueIfSet = <StorageValue, StoreValue>(
    storageValue: Promise<StorageValue>,
    storeValue: StoreValue,
) => {
    const assign = (
        value: null | undefined | StorageValue,
        storeValue: StoreValue,
    ) => {
        if (value === null) return;
        storeValue = value as StoreValue;
    };
    storageValue.then((v) => assign(v, storeValue));
};
