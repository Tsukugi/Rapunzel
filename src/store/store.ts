import { TaihouOptions, UseState, useState } from "@atsu/taihou";
import { RapunzelConfigBase } from "../config/interfaces";
import { Book, CloudFlareConfig, Thumbnail } from "@atsu/lilith";
import { ViewNames } from "../components/navigators/interfaces";

export interface RouterState {
    currentRoute: ViewNames;
}

export interface HeaderState {
    searchValue: string;
}
export interface ReaderState {
    activeProcessId: string;
    book: Book | null;
    cachedImages: string[];
}
export interface ConfigState extends RapunzelConfigBase {
    apiLoaderConfig: CloudFlareConfig;
    webviewUrl: string;
}

export interface BrowseState {
    activeProcessId: string;
    bookListRecord: Record<string, Thumbnail>; // Key as Ids
    bookList: Thumbnail[];
    cachedImages: string[];
}

interface Store {
    router: UseState<RouterState>;
    config: UseState<ConfigState>;
    header: UseState<HeaderState>;
    reader: UseState<ReaderState>;
    browse: UseState<BrowseState>;
}

const RapunzelState = {} as Store;
export const useRapunzelStore = () => {
    if (Object.keys(RapunzelState).length === 0) {
        throw Error("Taihou Store not initialized");
    }
    return RapunzelState;
};

export const initRapunzelStore = () => {
    const defaultConfig: Partial<TaihouOptions> = { debug: true };

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
};
