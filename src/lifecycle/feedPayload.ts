import {
    BookBaseList,
    BrowseState,
    LatestBooksState,
} from "../store/interfaces";

export const buildPayload = <T extends BookBaseList>(
    state: T,
    maxItems: number,
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
        page:
            "page" in state
                ? (state as unknown as BrowseState | LatestBooksState).page
                : undefined,
    };
};
