import React, { useEffect, useRef } from "react";
import { getRapunzelStore } from "../store/store";
import { getRapunzelStorage } from "../cache/storage";
import { StorageEntries } from "../cache/interfaces";
import { MaxBrowseItems, MaxFeedItems } from "../cache/feedConstants";
import {
    BrowseState,
    LatestBooksState,
    PopularBooksState,
} from "../store/interfaces";
import { useDebouncedCallback } from "use-debounce";
import { buildPayload } from "./feedPayload";

const FeedPersistence: React.FC = () => {
    const storage = React.useMemo(() => getRapunzelStorage(), []);
    const store = getRapunzelStore();
    const [latest, useLatestEffect] = store.latest;
    const [trending, useTrendingEffect] = store.trending;
    const [browse, useBrowseEffect] = store.browse;
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
            persistBrowse(browse);
        });
        return () => {
            active = false;
        };
    }, [
        browse,
        latest,
        persistBrowse,
        persistLatest,
        persistTrending,
        storage.ready,
        trending,
    ]);

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
