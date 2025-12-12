import React, { useEffect } from "react";
import { useRapunzelStore } from "../store/store";
import { useRapunzelStorage } from "../cache/storage";
import { StorageEntries } from "../cache/interfaces";
import { MaxFeedItems } from "../cache/feedConstants";
import {
    BookBaseList,
    LatestBooksState,
    PopularBooksState,
} from "../store/interfaces";
import { useDebouncedCallback } from "use-debounce";

const buildPayload = <T extends BookBaseList>(state: T) => {
    const rendered = state.rendered.slice(0, MaxFeedItems);
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
    };
};

const FeedPersistence: React.FC = () => {
    const storage = useRapunzelStorage();
    const {
        latest: [latest, useLatestEffect],
        trending: [trending, useTrendingEffect],
    } = useRapunzelStore();

    const persistLatest = useDebouncedCallback((state: LatestBooksState) => {
        const payload = buildPayload(state);
        storage.setItem(StorageEntries.feedLatest, payload);
    }, 300);

    const persistTrending = useDebouncedCallback((state: PopularBooksState) => {
        const payload = buildPayload(state);
        storage.setItem(StorageEntries.feedTrending, payload);
    }, 300);

    useEffect(() => {
        persistLatest(latest);
        persistTrending(trending);
    }, []);

    useLatestEffect((state) => {
        persistLatest(state);
    });

    useTrendingEffect((state) => {
        persistTrending(state);
    });

    return null;
};

export default FeedPersistence;
