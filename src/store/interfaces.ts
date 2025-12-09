import {
    Book,
    BookBase,
    LilithHeaders,
    Chapter,
    LilithLanguage,
    LilithImage,
} from "@atsu/lilith";
import { ViewNames } from "../components/navigators/interfaces";
import { RapunzelConfigBase } from "../config/interfaces";
import { VirtualItem } from "../components/virtualList/interfaces";

export enum LilithRepo {
    NHentai = "NHentai",
    HenTag = "HenTag",
    MangaDex = "MangaDex",
    EHentai = "EHentai",
}

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
    cachedImages: VirtualItem<RapunzelImage>[];
    chapterPage: number;
}
export interface ConfigState extends RapunzelConfigBase {
    apiLoaderConfig: LilithHeaders;
    apiLoaderTimestamps: ApiLoaderTimestamps;
    webviewUrl: string;
    initialView: ViewNames;
    repository: LilithRepo;
    languages: LilithLanguage[];
    cachelibraryLocation: string;
    cacheTempImageLocation: string;
}

export interface BookBaseList {
    activeProcessId: string;
    bookListRecord: Record<string, BookBase>; // Key as Ids
    cachedImagesRecord: Record<string, VirtualItem<string>>; // Key as Ids // Should be deprecated soon
    rendered: string[]; // Ordered list of book ids to render
}

export interface BrowseState extends BookBaseList {
    page: number;
}

export interface PopularBooksState extends BookBaseList {}
export interface LibraryState {
    saved: Record<string, LibraryBook>;
    rendered: string[];
}

export interface LatestBooksState extends BookBaseList {
    page: number;
}

export interface LoadingState {
    browse: boolean;
    reader: boolean;
    trending: boolean;
    latest: boolean;
}

export interface UIState {
    snackMessage: string;
}

export enum EAutoFetchWebviewStep {
    Standby,
    Started,
    WaitForData,
    ValidData,
    Finished,
}

export interface AutoFetchWebviewState {
    step: EAutoFetchWebviewStep;
    returnRoute: ViewNames | null;
}

export interface ApiLoaderTimestamps {
    cookie: number | null;
    userAgent: number | null;
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
    library: UseReactTaihou<LibraryState>;
    autoFetchWebview: UseReactTaihou<AutoFetchWebviewState>;
    ui: UseReactTaihou<UIState>;
}

export interface RapunzelImage extends LilithImage {}

export interface LibraryBook extends Book {
    savedAt: number; // epoch
}

export type StoredLibrary = Record<string, LibraryBook>; // <Repo.BookId, LibraryBook>
