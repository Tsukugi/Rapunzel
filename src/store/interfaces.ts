import { Book, LilithRepo, BookBase, Headers, Chapter } from "@atsu/lilith";
import { UseState } from "@atsu/taihou";
import { ViewNames } from "../components/navigators/interfaces";
import { RapunzelConfigBase } from "../config/interfaces";

export interface RouterState {
    currentRoute: ViewNames;
    history: ViewNames[];
}

export interface HeaderState {
    searchValue: string;
}
export interface ReaderState {
    activeProcessId: string;
    book: Book | null;
    chapter: Chapter | null;
    cachedImages: string[];
}
export interface ConfigState extends RapunzelConfigBase {
    apiLoaderConfig: Headers;
    webviewUrl: string;
    repository: LilithRepo;
}

export interface BrowseState {
    activeProcessId: string;
    bookListRecord: Record<string, BookBase>; // Key as Ids
    bookList: BookBase[];
    cachedImages: string[];
    page: number;
}

export interface LoadingState {
    browse: boolean;
    reader: boolean;
}

export type TaihouEffect<T> = (onUpdate: (newValue: T) => void) => void;
export type UseReactTaihou<T> = [T, TaihouEffect<T>];

export interface Store {
    router: UseReactTaihou<RouterState>;
    config: UseReactTaihou<ConfigState>;
    header: UseReactTaihou<HeaderState>;
    reader: UseReactTaihou<ReaderState>;
    browse: UseReactTaihou<BrowseState>;
    loader: UseReactTaihou<LoadingState>;
}
