import { MMKVLoader } from "react-native-mmkv-storage";
import { useRapunzelStore } from "../store/store";
import {
    StorageKeys,
    StorageEntries,
    RapunzelStorageBase,
    UseStorage,
    Storage,
} from "./interfaces";
import { TypeExecutor, TypeTools, UseTypedExecutorProps } from "../tools/type";

const RapunzelStorage = {} as RapunzelStorageBase;

export const useRapunzelStorage = (): UseStorage => {
    if (!RapunzelStorage.instance) {
        throw Error("Storage not initialized");
    }

    const useStorageLogWrapper = <T>(
        key: string,
        value: T,
        exec: TypeExecutor<T>,
    ) => {
        console.log("[useStorageLogWrapper]", key, value);
        return exec(key, value);
    };

    const {
        setBool,
        setString,
        getItem: innerGetItem,
        setInt,
        setArray,
        setMap,
    } = RapunzelStorage.instance;

    const buildTypedExecutor =
        <T, ET>(executor: TypeExecutor<ET>) =>
        (key: string, value: T): T => {
            executor(key, value);
            return value;
        };

    const getItem: Storage.GetItem = <T>(key: StorageEntries) =>
        innerGetItem(key) as T;
    const setItem: Storage.SetItem = <T>(key: StorageEntries, value: T) => {
        const executors: UseTypedExecutorProps<T> = {
            string: buildTypedExecutor(setString),
            boolean: setBool,
            number: buildTypedExecutor(setInt),
            object: buildTypedExecutor(setMap),
            array: buildTypedExecutor(setArray),
        };

        const executor = TypeTools.useTypedExecutor(executors, value);

        return useStorageLogWrapper<T>(key, value, executor);
    };

    return {
        setItem,
        getItem,
    };
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
