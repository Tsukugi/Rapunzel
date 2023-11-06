import { TaihouOptions, UseState, useState } from "@atsu/taihou";
import { RapunzelConfigBase } from "../config/interfaces";
import { Book, CloudFlareConfig, Thumbnail } from "@atsu/lilith";

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
    repoHtml: string;
}

export interface BrowseState {
    activeProcessId: string;
    bookListRecord: Record<string, Thumbnail>; // Key as Ids
    bookList: Thumbnail[];
    cachedImages: string[];
}

interface Store {
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
    const defaultConfig: Partial<TaihouOptions> = { debug: false };

    const useConfig = <T>(name: string, state: T) =>
        useState(state, { ...defaultConfig, name });

    RapunzelState.config = useConfig<ConfigState>("config", {
        debug: true,
        useFallbackExtensionOnDownload: true,
        apiLoaderConfig: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            cookie: "cf_clearance=No07bTPjTPG8ay4yw6Swd2YWsl3OOQEyUD5k3CrfLV0-1698867081-0-1-6fa998a8.7d6487d8.38a8c748-160.0.0; csrftoken=GVZOyHvhqPkKd294OAxMu2szdWS9pbU4Pp6uHPOQ2EbDjzTlePBtaF3aF8kNVnNV",
        },
        repoHtml: ``,
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
