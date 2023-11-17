import { Book, LilithRepo, Thumbnail, Headers, Chapter } from "@atsu/lilith";
import { UseState } from "@atsu/taihou";
import { ViewNames } from "../components/navigators/interfaces";
import { RapunzelConfigBase } from "../config/interfaces";

export interface RouterState {
    currentRoute: ViewNames;
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
    bookListRecord: Record<string, Thumbnail>; // Key as Ids
    bookList: Thumbnail[];
    cachedImages: string[];
}

export interface Store {
    router: UseState<RouterState>;
    config: UseState<ConfigState>;
    header: UseState<HeaderState>;
    reader: UseState<ReaderState>;
    browse: UseState<BrowseState>;
}
