import { TaihouOptions, useState } from "@atsu/taihou";
import { LilithLanguage, LilithRepo } from "@atsu/lilith";
import { ViewNames } from "../components/navigators/interfaces";
import {
    AutoFetchWebview,
    BookBaseList,
    BrowseState,
    ConfigState,
    EAutoFetchWebviewStep,
    HeaderState,
    LatestBooksState,
    LoadingState,
    PopularBooksState,
    ReaderState,
    RouterState,
    Store,
    TaihouEffect,
    UseReactTaihou,
} from "./interfaces";

import { useEffect } from "react";

const RapunzelState = {} as Store;
export const useRapunzelStore = () => {
    if (Object.keys(RapunzelState).length === 0) {
        throw Error("Taihou Store not initialized");
    }
    return RapunzelState;
};

const getDefaultConfig: () => Partial<TaihouOptions> = () => {
    return { debug: false };
};

const useReactConfig = <T>(
    name: string,
    initialState: T,
): UseReactTaihou<T> => {
    const [state, watch, unwatch] = useState<T>(initialState, {
        ...getDefaultConfig(),
        name,
    });

    const effect: TaihouEffect<T> = (onUpdate) => {
        useEffect(() => {
            watch(onUpdate);

            return () => {
                unwatch(onUpdate);
            };
        }, []);
    };

    return [state, effect];
};

export const initRapunzelStore = () => {
    RapunzelState.router = useReactConfig<RouterState>("router", {
        currentRoute: ViewNames.RapunzelBrowse,
        history: [],
    });

    RapunzelState.config = useReactConfig<ConfigState>("config", {
        debug: true,
        useFallbackExtensionOnDownload: true,
        apiLoaderConfig: {
            "User-Agent": "",
            cookie: "",
        },
        webviewUrl: `https://nhentai.net/`,
        repository: LilithRepo.NHentai,
        languages: [LilithLanguage.english, LilithLanguage.spanish],
    });

    RapunzelState.reader = useReactConfig<ReaderState>("reader", {
        activeProcessId: "",
        book: null,
        chapter: null,
        cachedImages: [],
        chapterPage: 1,
    });

    RapunzelState.header = useReactConfig<HeaderState>("header", {
        searchValue: "",
    });

    const getDefaultBookBaseList = (): BookBaseList => ({
        activeProcessId: "",
        bookListRecord: {},
        bookList: [],
        cachedImages: [],
        cachedImagesRecord: {},
    });

    RapunzelState.browse = useReactConfig<BrowseState>("browse", {
        ...getDefaultBookBaseList(),
        page: 1,
    });

    RapunzelState.latest = useReactConfig<LatestBooksState>("latest", {
        ...getDefaultBookBaseList(),
        page: 1,
    });

    RapunzelState.trending = useReactConfig<PopularBooksState>("trending", {
        ...getDefaultBookBaseList(),
    });

    RapunzelState.loading = useReactConfig<LoadingState>("loading", {
        browse: false,
        reader: false,
        latest: false,
        trending: false,
    });

    RapunzelState.autoFetchWebview = useReactConfig<AutoFetchWebview>(
        "autoFetchWebview",
        {
            step: EAutoFetchWebviewStep.Standby,
        },
    );
};
