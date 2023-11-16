import { TaihouOptions, useState } from "@atsu/taihou";
import { LilithRepo } from "@atsu/lilith";
import { ViewNames } from "../components/navigators/interfaces";
import { onHeaderStoreEvents } from "./header";
import {
    BrowseState,
    ConfigState,
    HeaderState,
    ReaderState,
    RouterState,
    Store,
} from "./interfaces";

const RapunzelState = {} as Store;
export const useRapunzelStore = () => {
    if (Object.keys(RapunzelState).length === 0) {
        throw Error("Taihou Store not initialized");
    }
    return RapunzelState;
};

export const initRapunzelStore = () => {
    const defaultConfig: Partial<TaihouOptions> = { debug: false };

    const useConfig = <T>(name: string, state: T) =>
        useState(state, { ...defaultConfig, name });

    RapunzelState.router = useConfig<RouterState>("router", {
        currentRoute: ViewNames.RapunzelBrowse,
    });
    RapunzelState.config = useConfig<ConfigState>("config", {
        debug: true,
        useFallbackExtensionOnDownload: true,
        apiLoaderConfig: {
            "User-Agent": "",
            cookie: "",
        },
        webviewUrl: `https://nhentai.net/`,
        repository: LilithRepo.NHentai,
    });
    RapunzelState.reader = useConfig<ReaderState>("reader", {
        activeProcessId: "",
        book: null,
        cachedImages: [],
    });
    RapunzelState.header = useConfig<HeaderState>("header", {
        searchValue: "ass",
    });

    RapunzelState.browse = useConfig<BrowseState>("browse", {
        activeProcessId: "",
        bookListRecord: {},
        bookList: [],
        cachedImages: [],
    });

    onHeaderStoreEvents(RapunzelState);
};
