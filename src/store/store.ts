import { TaihouOptions, useState as taihouState } from "@atsu/taihou";
import { LilithLanguage } from "@atsu/lilith";
import { ViewNames } from "../components/navigators/interfaces";
import {
    AutoFetchWebviewState,
    BookBaseList,
    BrowseState,
    ConfigState,
    EAutoFetchWebviewStep,
    HeaderState,
    LatestBooksState,
    LibraryState,
    LilithRepo,
    LoadingState,
    PopularBooksState,
    ReaderState,
    RouterState,
    Store,
    TaihouEffect,
    UIState,
    UseReactTaihou,
    ReaderImageFit,
    ReaderMode,
} from "./interfaces";

import { useEffect } from "react";
import { ImageCacheLocations } from "../cache/interfaces";

const RapunzelState = {} as Store;
export const getRapunzelStore = () => {
    if (Object.keys(RapunzelState).length === 0) {
        throw Error("Taihou Store not initialized");
    }
    return RapunzelState;
};

const getDefaultConfig: () => Partial<TaihouOptions> = () => {
    return { debug: false };
};

export interface InitRapunzelStoreProps {
    onGetConfig: () => Partial<TaihouOptions>;
}
export const initRapunzelStore = (props: InitRapunzelStoreProps) => {
    const { onGetConfig }: InitRapunzelStoreProps = {
        ...{ onGetConfig: getDefaultConfig },
        ...props,
    };

    const createReactConfig = <T>(
        name: string,
        initialState: T,
    ): UseReactTaihou<T> => {
        const [state, watch, unwatch] = taihouState<T>(initialState, {
            ...onGetConfig(),
            name,
        });

        const useStoreEffect: TaihouEffect<T> = (onUpdate) => {
            useEffect(() => {
                watch(onUpdate);

                return () => {
                    unwatch(onUpdate);
                };
            }, [onUpdate]);
        };

        return [state, useStoreEffect];
    };

    RapunzelState.router = createReactConfig<RouterState>("router", {
        currentRoute: ViewNames.RapunzelBrowse,
        history: [],
    });

    RapunzelState.config = createReactConfig<ConfigState>("config", {
        debug: false,
        enableCache: true,
        useFallbackExtensionOnDownload: false,
        cachelibraryLocation: ImageCacheLocations.Downloads,
        cacheTempImageLocation: ImageCacheLocations.Temp,
        apiLoaderConfig: {
            "User-Agent": "",
            cookie: "",
        },
        apiLoaderTimestamps: {
            cookie: null,
            userAgent: null,
        },
        initialView: ViewNames.RapunzelMainFeed,
        webviewUrl: `https://nhentai.net/`,
        repository: LilithRepo.NHentai,
        languages: [
            LilithLanguage.english,
            LilithLanguage.spanish,
            LilithLanguage.japanese,
            LilithLanguage.mandarin,
        ],
    });

    RapunzelState.reader = createReactConfig<ReaderState>("reader", {
        activeProcessId: "",
        book: null,
        chapter: null,
        cachedImages: [],
        chapterPage: 1,
        mode: ReaderMode.Scroll,
        imageFit: ReaderImageFit.Width,
    });

    RapunzelState.header = createReactConfig<HeaderState>("header", {
        searchValue: "",
    });

    const getDefaultBookBaseList = (): BookBaseList => ({
        activeProcessId: "",
        bookListRecord: {},
        cachedImagesRecord: {},
        rendered: [],
        cacheKey: "",
        loadedPages: {},
        entryMetaRecord: {},
        lastFetchedAt: null,
        hasNextPage: true,
        scrollOffset: 0,
    });

    RapunzelState.browse = createReactConfig<BrowseState>("browse", {
        ...getDefaultBookBaseList(),
        page: 1,
    });

    RapunzelState.library = createReactConfig<LibraryState>("library", {
        saved: {},
        rendered: [],
    });

    RapunzelState.latest = createReactConfig<LatestBooksState>("latest", {
        ...getDefaultBookBaseList(),
        page: 1,
    });

    RapunzelState.trending = createReactConfig<PopularBooksState>("trending", {
        ...getDefaultBookBaseList(),
    });

    RapunzelState.loading = createReactConfig<LoadingState>("loading", {
        browse: false,
        reader: false,
        latest: false,
        trending: false,
    });

    RapunzelState.autoFetchWebview = createReactConfig<AutoFetchWebviewState>(
        "autoFetchWebview",
        {
            step: EAutoFetchWebviewStep.Standby,
            returnRoute: null,
        },
    );

    RapunzelState.ui = createReactConfig<UIState>("ui", {
        snackMessage: "",
    });
};
