import React, { useEffect, useRef } from "react";
import { useRapunzelStore } from "../store/store";
import { useRapunzelStorage } from "../cache/storage";
import { StorageEntries } from "../cache/interfaces";
import { MaxBrowseItems, MaxFeedItems } from "../cache/feedConstants";
import {
    BookBaseList,
    BrowseState,
    LatestBooksState,
    PopularBooksState,
} from "../store/interfaces";
import { useDebouncedCallback } from "use-debounce";

export const buildPayload = <T extends BookBaseList>(
    state: T,
    maxItems: number = MaxFeedItems,
) => {
    const rendered = state.rendered.slice(0, maxItems);
    const entryMetaRecord = rendered.reduce((acc, id) => {
        const metadata = state.entryMetaRecord?.[id];
        if (metadata) acc[id] = metadata;
        return acc;
    }, {} as NonNullable<T["entryMetaRecord"]>);

    return {
        rendered,
        bookListRecord: rendered.reduce((acc, id) => {
            const book = state.bookListRecord[id];
            if (book) acc[id] = book;
            return acc;
        }, {} as LatestBooksState["bookListRecord"]),
        cachedImagesRecord: rendered.reduce((acc, id) => {
            const image = state.cachedImagesRecord[id];
            if (image) acc[id] = image;
            return acc;
        }, {} as LatestBooksState["cachedImagesRecord"]),
        cacheKey: state.cacheKey,
        loadedPages: state.loadedPages,
        entryMetaRecord,
        lastFetchedAt: state.lastFetchedAt ?? null,
        hasNextPage: state.hasNextPage ?? true,
        scrollOffset: state.scrollOffset ?? 0,
        page: "page" in state ? (state as any).page : undefined,
    };
};

const FeedPersistence: React.FC = () => {
    const storage = useRapunzelStorage();
    const store = useRapunzelStore() as any;
    const [latest, useLatestEffect] = store.latest;
    const [trending, useTrendingEffect] = store.trending;
    const browseEntry = store.browse;
    const browse = browseEntry?.[0] as BrowseState | undefined;
    const useBrowseEffect = browseEntry?.[1] || (() => undefined);
    const isStorageReady = useRef(false);

    const persistLatest = useDebouncedCallback((state: LatestBooksState) => {
        if (!isStorageReady.current) return;
        const payload = buildPayload(state, MaxFeedItems);
        storage.setItem(StorageEntries.feedLatest, payload);
    }, 300);

    const persistTrending = useDebouncedCallback((state: PopularBooksState) => {
        if (!isStorageReady.current) return;
        const payload = buildPayload(state, MaxFeedItems);
        storage.setItem(StorageEntries.feedTrending, payload);
    }, 300);

    const persistBrowse = useDebouncedCallback((state: BrowseState) => {
        if (!isStorageReady.current) return;
        const payload = buildPayload(state, MaxBrowseItems);
        storage.setItem(StorageEntries.browse, payload);
    }, 300);

    useEffect(() => {
        let active = true;
        const ready = storage.ready || Promise.resolve();
        ready.then(() => {
            if (!active) return;
            isStorageReady.current = true;
            persistLatest(latest);
            persistTrending(trending);
            if (browse) persistBrowse(browse);
        });
        return () => {
            active = false;
        };
    }, []);

    useLatestEffect((state: LatestBooksState) => {
        persistLatest(state);
    });

    useTrendingEffect((state: PopularBooksState) => {
        persistTrending(state);
    });

    useBrowseEffect((state: BrowseState) => {
        persistBrowse(state);
    });

    return null;
};

export default FeedPersistence;
