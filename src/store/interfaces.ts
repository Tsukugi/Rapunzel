import {
    Book,
    LilithRepo,
    BookBase,
    LilithHeaders,
    Chapter,
    LilithLanguage,
} from "@atsu/lilith";
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
    cachedImages: RapunzelImage[];
    chapterPage: number;
}
export interface ConfigState extends RapunzelConfigBase {
    apiLoaderConfig: LilithHeaders;
    webviewUrl: string;
    repository: LilithRepo;
    languages: LilithLanguage[];
}

export interface BookBaseList {
    activeProcessId: string;
    bookList: BookBase[];
    bookListRecord: Record<string, BookBase>; // Key as Ids
    cachedImages: CachedImage[];
    cachedImagesRecord: Record<string, string>; // Key as Ids // Should be deprecated soon
}

export interface CachedImage {
    id: string;
    url: string;
}
export interface BrowseState extends BookBaseList {
    page: number;
}

export interface PopularBooksState extends BookBaseList {}

export interface LatestBooksState extends BookBaseList {
    page: number;
}

export interface LoadingState {
    browse: boolean;
    reader: boolean;
    trending: boolean;
    latest: boolean;
}

export enum EAutoFetchWebviewStep {
    Standby,
    Started,
    WaitForData,
    ValidData,
    Finished,
}

export interface AutoFetchWebview {
    step: EAutoFetchWebviewStep;
}

export type TaihouEffect<T> = (onUpdate: (newValue: T) => void) => void;
export type UseReactTaihou<T> = [T, TaihouEffect<T>];

export interface Store {
    loading: UseReactTaihou<LoadingState>;
    config: UseReactTaihou<ConfigState>;
    router: UseReactTaihou<RouterState>;
    header: UseReactTaihou<HeaderState>;
    reader: UseReactTaihou<ReaderState>;
    browse: UseReactTaihou<BrowseState>;
    latest: UseReactTaihou<LatestBooksState>;
    trending: UseReactTaihou<PopularBooksState>;
    autoFetchWebview: UseReactTaihou<AutoFetchWebview>;
}

export interface RapunzelImage {
    uri: string;
    width: number | null;
    height: number | null;
}
