import { TaihouOptions, UseState, useState } from "@atsu/taihou";
interface HeaderState {
    searchValue: string;
}
interface ReaderState {
    title: string;
    images: string[];
}

interface BrowseState {
    bookList: Record<string, unknown>; // Key as Ids
}

interface Store {
    header: UseState<HeaderState>;
    reader: UseState<ReaderState>;
    browse: UseState<BrowseState>;
}

const TaihouStore = {} as Store;
export const useTaihouStore = () => {
    if (Object.keys(TaihouStore).length === 0) {
        throw Error("Taihou Store not initialized");
    }
    return TaihouStore;
};

export const initTaihouStore = () => {
    const defaultConfig: Partial<TaihouOptions> = { debug: true };

    const useConfig = <T>(name: string, state: T) =>
        useState(state, { ...defaultConfig, name });

    TaihouStore.reader = useConfig<ReaderState>("reader", {
        title: "",
        images: [],
    });
    TaihouStore.header = useConfig<HeaderState>("header", {
        searchValue: "ass",
    });
    TaihouStore.browse = useConfig<BrowseState>("browse", {
        bookList: {},
    });
};
