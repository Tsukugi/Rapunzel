import { TaihouOptions, useState } from "@atsu/taihou";
import { LilithRepo } from "@atsu/lilith";
import { ViewNames } from "../components/navigators/interfaces";
import {
    BrowseState,
    ConfigState,
    HeaderState,
    LoadingState,
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
    });

    RapunzelState.reader = useReactConfig<ReaderState>("reader", {
        activeProcessId: "",
        book: null,
        chapter: null,
        cachedImages: [],
    });

    RapunzelState.header = useReactConfig<HeaderState>("header", {
        searchValue: "ass",
    });

    RapunzelState.browse = useReactConfig<BrowseState>("browse", {
        activeProcessId: "",
        bookListRecord: {},
        bookList: [],
        cachedImages: [],
        page: 1,
    });

    RapunzelState.loader = useReactConfig<LoadingState>("loader", {
        browse: false,
        reader: false,
    });
};
