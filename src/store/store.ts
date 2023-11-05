import { TaihouOptions, UseState, useState } from "@atsu/taihou";
import { NHentai } from "../api/interfaces";
import { RapunzelConfigBase } from "../config/interfaces";

export interface HeaderState {
    searchValue: string;
}
export interface ReaderState {
    activeProcessId: string;
    book: NHentai.Book | null;
    cachedImages: string[];
}
export interface ConfigState extends RapunzelConfigBase {}

export interface BrowseState {
    activeProcessId: string;
    bookListRecord: Record<string, NHentai.Book>; // Key as Ids
    bookList: NHentai.Book[];
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
