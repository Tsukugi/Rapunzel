import AsyncStorage from "@react-native-async-storage/async-storage";
import { RapunzelLog } from "../config/log";
import {
    ConfigState,
    LatestBooksState,
    LibraryBook,
    PopularBooksState,
    StoredLibrary,
} from "../store";

const StorageKeys = {
    config: "rapunzel.config",
    library: "rapunzel.library",
    feed: "rapunzel.feed",
};

type StorageLayer = Pick<typeof AsyncStorage, 'getItem' | 'setItem'>;

const inMemoryStore = new Map<string, string>();
const memoryStorage: StorageLayer = {
    getItem: async (key: string) => inMemoryStore.get(key) ?? null,
    setItem: async (key: string, value: string) => {
        inMemoryStore.set(key, value);
    },
};

const hasAsyncStorage = !!AsyncStorage && typeof AsyncStorage.getItem === "function";

const storage: StorageLayer = hasAsyncStorage ? AsyncStorage : memoryStorage;

const ensureNative = () => {
    if (hasAsyncStorage) return;
    RapunzelLog.warn(
        "[RapunzelStorage] AsyncStorage missing. Using in-memory fallback; data will reset on restart.",
    );
};

const readJson = async <T>(key: string): Promise<T | null> => {
    try {
        ensureNative();
        const raw = await storage.getItem(key);
        if (!raw) return null;
        return JSON.parse(raw) as T;
    } catch (error) {
        RapunzelLog.warn(`[RapunzelStorage] Failed to read ${key}`, error);
        return null;
    }
};

const writeJson = async <T>(key: string, value: T): Promise<void> => {
    try {
        ensureNative();
        await storage.setItem(key, JSON.stringify(value));
    } catch (error) {
        RapunzelLog.warn(`[RapunzelStorage] Failed to write ${key}`, error);
    }
};

export interface StoredFeedCache {
    latest?: LatestBooksState;
    trending?: PopularBooksState;
}

export const RapunzelStorage = {
    loadConfig: async (): Promise<Partial<ConfigState>> => {
        return (await readJson<ConfigState>(StorageKeys.config)) || {};
    },
    saveConfig: async (config: ConfigState) => {
        await writeJson(StorageKeys.config, config);
    },
    loadLibrary: async (): Promise<StoredLibrary> => {
        return (await readJson<StoredLibrary>(StorageKeys.library)) || {};
    },
    saveLibrary: async (library: Record<string, LibraryBook>) => {
        await writeJson(StorageKeys.library, library);
    },
    clearLibrary: async () => {
        await writeJson(StorageKeys.library, {});
    },
    loadFeed: async (): Promise<StoredFeedCache> => {
        return (await readJson<StoredFeedCache>(StorageKeys.feed)) || {};
    },
    saveFeed: async (feed: StoredFeedCache) => {
        await writeJson(StorageKeys.feed, feed);
    },
    clearFeed: async () => {
        await writeJson(StorageKeys.feed, {});
    },
};
