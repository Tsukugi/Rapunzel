import { MMKVLoader } from "react-native-mmkv-storage";
import { useRapunzelStore } from "../store/store";
import {
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

    const { setBool, setString, setInt, setArray, setMap, getItem } =
        RapunzelStorage.instance;

    const buildTypedExecutor =
        <T, ET>(executor: TypeExecutor<ET>) =>
        (key: string, value: T): T => {
            executor(key, value);
            return value;
        };

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
        instance: RapunzelStorage.instance,
    };
};

export const initRapunzelStorage = () => {
    RapunzelStorage.instance = new MMKVLoader().initialize();

    const { getBool, getString, getInt, getArray, getMap, getItem } =
        RapunzelStorage.instance;

    const {
        config: [config],
        header: [header],
    } = useRapunzelStore();

    const setIfValid = <T>(setter: (value: T) => void) => {
        const onLoadValue = (err: any, value: T | null | undefined) => {
            if (err) console.error("[initRapunzelStorage]", err);
            if (value !== null && value !== undefined) {
                setter(value);
            }
        };
        return onLoadValue;
    };

    getString(
        StorageEntries.searchText,
        setIfValid((value) => {
            header.searchValue = value;
            console.log("[initRapunzelStorage]", header, "=>", value);
        }),
    );
    getBool(
        StorageEntries.debug,
        setIfValid((value) => {
            config.debug = value;
            console.log("[initRapunzelStorage]", config, "=>", value);
        }),
    );
    getBool(
        StorageEntries.useFallbackExtensionOnDownload,
        setIfValid((value) => {
            config.useFallbackExtensionOnDownload = value;
            console.log("[initRapunzelStorage]", config, "=>", value);
        }),
    );
};
