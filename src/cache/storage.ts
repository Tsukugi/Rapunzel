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
import {
    BookBaseList,
    ConfigState,
    EntryCacheMetadata,
    LatestBooksState,
    LibraryBook,
    normalizeLilithRepo,
    PopularBooksState,
} from "../store/interfaces";
import { LibraryUtils } from "../tools/library";
import RNFS from "react-native-fs";
import { VirtualItem } from "../components/virtualList/interfaces";
import { MaxBrowseItems, MaxFeedItems } from "./feedConstants";
import { BookBase } from "@atsu/lilith";
import {
    getBrowseCacheKey,
    getEntryUid,
    getFeedCacheKey,
    getTrendingCacheKey,
} from "./listCache";

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
    RapunzelStorage.ready = Promise.resolve();

    const {
        getBool,
        getString,
        getInt,
        getArray,
        getMap,
        getItem,
        getMapAsync,
    } = RapunzelStorage.instance;

    const store = useRapunzelStore() as any;
    const [config] = store.config;
    const [header] = store.header;
    const [library] = store.library;
    const [router] = store.router;
    const browse = store.browse?.[0];
    const [latest] = store.latest;
    const [trending] = store.trending;

    const setIfValid = <T>(setter: (key: T) => void) => {
        const onLoadValue = (err: any, value: T | null | undefined) => {
            if (err) console.error("[initRapunzelStorage]", err);
            if (value !== null && value !== undefined) {
                setter(value);
                // RapunzelLog.log("[initRapunzelStorage]", "=>", value);
            }
        };
        return onLoadValue;
    };

    getString(
        StorageEntries.searchText,
        setIfValid((value) => {
            header.searchValue = value;
        }),
    );
    getString(
        StorageEntries.currentRoute,
        setIfValid((value) => {
            router.currentRoute = value as ViewNames;
        }),
    );

    getMap(
        StorageEntries.config,
        setIfValid((value: ConfigState) => {
            const normalizedConfig = {
                ...value,
                repository: normalizeLilithRepo(String(value.repository)),
            };
            Object.keys(normalizedConfig).forEach((key) => {
                (config as any)[key] = (normalizedConfig as any)[key];
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

    interface SafeBookBaseList<T extends BookBaseList> {
        snapshot: T;
        localFiles: Array<{ id: string; path: string }>;
    }

    const sanitizeBookBaseList = <T extends BookBaseList>(
        snapshot: T,
        repository: string,
        fallbackCacheKey: string,
        maxItems: number,
    ): SafeBookBaseList<T> => {
        if (!snapshot)
            throw Error("[sanitizeBookBaseList] No snapshot provided");

        const idMap: Record<string, string> = {};
        const bookListRecord: Record<string, BookBase> = {};
        Object.entries(snapshot.bookListRecord || {}).forEach(
            ([storedId, book]) => {
                const uid = getEntryUid(repository, book?.id || storedId);
                idMap[storedId] = uid;
                bookListRecord[uid] = book;
            },
        );

        const imageRecord: Record<string, VirtualItem<string>> = {};
        Object.entries(snapshot.cachedImagesRecord || {}).forEach(
            ([storedId, image]) => {
                const uid = idMap[storedId] || getEntryUid(repository, storedId);
                imageRecord[uid] = { ...image, id: uid };
            },
        );

        const metadataRecord: Record<string, EntryCacheMetadata> = {};
        Object.entries(snapshot.entryMetaRecord || {}).forEach(
            ([storedId, metadata]) => {
                const uid =
                    idMap[storedId] || getEntryUid(repository, storedId);
                metadataRecord[uid] = { ...metadata, uid };
            },
        );

        const renderedIds = (snapshot.rendered || []).map(
            (storedId) =>
                idMap[storedId] || getEntryUid(repository, storedId),
        );
        const safeRendered: string[] = [];
        const safeBookListRecord: Record<string, BookBase> = {};
        const safeCachedImagesRecord: Record<string, VirtualItem<string>> = {};
        const safeEntryMetaRecord: Record<string, EntryCacheMetadata> = {};
        const localFiles: Array<{ id: string; path: string }> = [];
        const now = Date.now();

        for (const id of renderedIds) {
            if (safeRendered.length >= maxItems) break;
            const imageEntry = imageRecord[id];
            const bookEntry = bookListRecord[id];
            if (!bookEntry) continue;

            let imageValue = imageEntry?.value || bookEntry.cover?.uri || "";
            let coverCachedAt = metadataRecord[id]?.coverCachedAt;
            if (imageValue.startsWith("file://")) {
                const path = imageValue.replace("file://", "");
                localFiles.push({ id, path });
            }

            safeRendered.push(id);
            safeBookListRecord[id] = bookEntry;
            safeCachedImagesRecord[id] = { id, value: imageValue };
            const metadata = metadataRecord[id];
            safeEntryMetaRecord[id] = {
                uid: id,
                firstSeenAt: metadata?.firstSeenAt || now,
                lastFetchedAt:
                    metadata?.lastFetchedAt || snapshot.lastFetchedAt || now,
                coverCachedAt: coverCachedAt || null,
            };
        }

        const loadedPages = Object.fromEntries(
            Object.entries(snapshot.loadedPages || {}).map(
                ([page, pageState]) => [
                    page,
                    {
                        ...pageState,
                        status:
                            pageState.status === "loading"
                                ? "loaded"
                                : pageState.status,
                        entryIds: (pageState.entryIds || [])
                            .map(
                                (storedId) =>
                                    idMap[storedId] ||
                                    getEntryUid(repository, storedId),
                            )
                            .filter((id) => safeRendered.includes(id)),
                    },
                ],
            ),
        );

        if (loadedPages["1"] === undefined && safeRendered.length > 0) {
            loadedPages["1"] = {
                status: "loaded",
                loadedAt: snapshot.lastFetchedAt || null,
                entryIds: safeRendered,
            };
        }

        return {
            snapshot: {
                ...snapshot,
                rendered: safeRendered,
                bookListRecord: safeBookListRecord,
                cachedImagesRecord: safeCachedImagesRecord,
                cacheKey: snapshot.cacheKey || fallbackCacheKey,
                loadedPages,
                entryMetaRecord: safeEntryMetaRecord,
                lastFetchedAt: snapshot.lastFetchedAt ?? null,
                hasNextPage: snapshot.hasNextPage ?? true,
                scrollOffset: snapshot.scrollOffset ?? 0,
            },
            localFiles,
        };
    };

    const validateLocalImages = <T extends BookBaseList>(
        targetState: T,
        localFiles: Array<{ id: string; path: string }>,
    ): void => {
        void Promise.all(
            localFiles.map(async ({ id, path }) => {
                if (await RNFS.exists(path)) return;
                const book = targetState.bookListRecord[id];
                if (!book) return;
                const currentImage = targetState.cachedImagesRecord[id];
                if (currentImage?.value !== `file://${path}`) return;

                targetState.cachedImagesRecord[id] = {
                    id,
                    value: book.cover?.uri || "",
                };
                const metadata = targetState.entryMetaRecord?.[id];
                if (metadata) metadata.coverCachedAt = null;
            }),
        ).catch((err) =>
            RapunzelLog.warn(
                "[initRapunzelStorage] Local image validation failed",
                err,
            ),
        );
    };

    const hydrateBookBaseList = <T extends BookBaseList>(
        storageEntry: StorageEntries,
        targetState: T,
        repository: string,
        fallbackCacheKey: string,
        maxItems: number,
    ): T | undefined => {
        try {
            const snapshot = getMap<T>(storageEntry);
            if (!snapshot) return;
            const safeSnapshot = sanitizeBookBaseList(
                snapshot,
                repository,
                fallbackCacheKey,
                maxItems,
            );
            targetState.rendered = safeSnapshot.snapshot.rendered;
            targetState.bookListRecord = safeSnapshot.snapshot.bookListRecord;
            targetState.cachedImagesRecord =
                safeSnapshot.snapshot.cachedImagesRecord;
            targetState.cacheKey = safeSnapshot.snapshot.cacheKey;
            targetState.loadedPages = safeSnapshot.snapshot.loadedPages;
            targetState.entryMetaRecord = safeSnapshot.snapshot.entryMetaRecord;
            targetState.lastFetchedAt = safeSnapshot.snapshot.lastFetchedAt;
            targetState.hasNextPage = safeSnapshot.snapshot.hasNextPage;
            targetState.scrollOffset = safeSnapshot.snapshot.scrollOffset;
            if ("page" in targetState && "page" in safeSnapshot.snapshot) {
                (targetState as any).page = (safeSnapshot.snapshot as any).page;
            }
            validateLocalImages(targetState, safeSnapshot.localFiles);
            return safeSnapshot.snapshot;
        } catch (err) {
            RapunzelLog.warn(
                "[initRapunzelStorage] Latest hydrate failed",
                err,
            );
        }
    };

    const hydrationTasks: Promise<unknown>[] = [
        Promise.resolve(
            hydrateBookBaseList<LatestBooksState>(
                StorageEntries.feedLatest,
                latest,
                config.repository,
                getFeedCacheKey(config.repository),
                MaxFeedItems,
            ),
        ),
        Promise.resolve(
            hydrateBookBaseList<PopularBooksState>(
                StorageEntries.feedTrending,
                trending,
                config.repository,
                getTrendingCacheKey(config.repository),
                MaxFeedItems,
            ),
        ),
    ];
    if (browse) {
        hydrationTasks.push(
            Promise.resolve(
                hydrateBookBaseList<LatestBooksState>(
                    StorageEntries.browse,
                    browse,
                    config.repository,
                    getBrowseCacheKey(config.repository, header.searchValue),
                    MaxBrowseItems,
                ),
            ),
        );
    }
    RapunzelStorage.ready = Promise.all(hydrationTasks).then(() => undefined);
};
