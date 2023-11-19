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
}

export interface Store {
    router: UseState<RouterState>;
    config: UseState<ConfigState>;
    header: UseState<HeaderState>;
    reader: UseState<ReaderState>;
    browse: UseState<BrowseState>;
}
