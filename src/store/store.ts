import { TaihouOptions, useState } from "@atsu/taihou";
import { LilithLanguage } from "@atsu/lilith";
import { ViewNames } from "../components/navigators/interfaces";
import {
    AutoFetchWebview,
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
    UseReactTaihou,
} from "./interfaces";

import { useEffect } from "react";
import { ImageCacheLocations } from "../cache/interfaces";

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

export interface InitRapunzelStoreProps {
    onGetConfig: () => Partial<TaihouOptions>;
}
export const initRapunzelStore = (props: InitRapunzelStoreProps) => {
    const { onGetConfig }: InitRapunzelStoreProps = {
        ...{ onGetConfig: getDefaultConfig },
        ...props,
    };

    const useReactConfig = <T>(
        name: string,
        initialState: T,
    ): UseReactTaihou<T> => {
        const [state, watch, unwatch] = useState<T>(initialState, {
            ...onGetConfig(),
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

    RapunzelState.router = useReactConfig<RouterState>("router", {
        currentRoute: ViewNames.RapunzelBrowse,
        history: [],
    });

    RapunzelState.config = useReactConfig<ConfigState>("config", {
        debug: false,
        useFallbackExtensionOnDownload: false,
        cachelibraryLocation: ImageCacheLocations.Downloads,
        cacheTempImageLocation: ImageCacheLocations.Temp,
        apiLoaderConfig: {
            "User-Agent": "",
            cookie: "",
        },
        webviewUrl: `https://nhentai.net/`,
        repository: LilithRepo.NHentai,
        languages: [
            LilithLanguage.english,
            LilithLanguage.spanish,
            LilithLanguage.japanese,
            LilithLanguage.mandarin,
        ],
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

    RapunzelState.library = useReactConfig<LibraryState>("library", {
        saved: {},
        rendered: [],
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
