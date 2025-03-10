import { MMKVLoader } from "react-native-mmkv-storage";
import { useRapunzelStore } from "../store/store";
import {
    StorageEntries,
    RapunzelStorageBase,
    UseStorage,
    Storage,
} from "./interfaces";
import { TypeExecutor, TypeTools, UseTypedExecutorProps } from "../tools/type";
import { ViewNames } from "../components/navigators/interfaces";
import { RapunzelLog } from "../config/log";
import { ConfigState, LibraryBook } from "../store/interfaces";
import { Book } from "@atsu/lilith";
import { LibraryUtils } from "../tools/library";

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

    const {
        getBool,
        getString,
        getInt,
        getArray,
        getMap,
        getItem,
        getMapAsync,
    } = RapunzelStorage.instance;

    const {
        config: [config],
        header: [header],
        library: [library],
        router: [router],
    } = useRapunzelStore();

    const setIfValid = <T>(setter: (key: T) => void) => {
        const onLoadValue = (err: any, value: T | null | undefined) => {
            if (err) console.error("[initRapunzelStorage]", err);
            if (value !== null && value !== undefined) {
                setter(value);
                RapunzelLog.log("[initRapunzelStorage]", "=>", value);
            }
        };
        return onLoadValue;
    };

    // getString(
    //     StorageEntries.searchText,
    //     setIfValid((value) => {
    //         header.searchValue = value;
    //     }),
    // );
    getString(
        StorageEntries.currentRoute,
        setIfValid((value) => {
            router.currentRoute = value as ViewNames;
        }),
    );

    getMap(
        StorageEntries.config,
        setIfValid((value: ConfigState) => {
            Object.keys(value).forEach((key) => {
                (config as any)[key] = (value as any)[key];
            });
        }),
    );

    getMap<Record<string, LibraryBook>>(
        StorageEntries.library,
        setIfValid((storedLibrary: Record<string, LibraryBook>) => {
            if (!storedLibrary) return;
            const { rendered, saved } = LibraryUtils.buildLibraryState(
                storedLibrary,
                config,
            );
            library.saved = saved;
            library.rendered = rendered;
        }),
    );
};
