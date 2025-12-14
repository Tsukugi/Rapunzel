import { Book, BookBase, LilithHeaders, Chapter, LilithLanguage } from '@atsu/lilith';

export enum LilithRepo {
  NHentai = 'NHentai',
  HenTag = 'HenTag',
  MangaDex = 'MangaDex',
  EHentai = 'EHentai',
}

/*
 * ViewNames provides context to navigation methods about which views we registered.
 */
export enum ViewNames {
  RapunzelWebView = 'RapunzelWebView',
  RapunzelBrowse = 'RapunzelBrowse',
  RapunzelReader = 'RapunzelReader',
  RapunzelSettings = 'RapunzelSettings',
  RapunzelChapterSelect = 'RapunzelChapterSelect',
  RapunzelMainFeed = 'RapunzelMainFeed',
  RapunzelLibrary = 'RapunzelLibrary',
}

export type ViewNameKeys = keyof typeof ViewNames;

export interface VirtualItem<T = string> {
  id: string;
  value: T;
}

export interface RapunzelImage {
  uri: string;
  width: number | null;
  height: number | null;
}

export interface RapunzelConfigBase {
  useFallbackExtensionOnDownload: boolean;
  debug: boolean;
  enableCache: boolean;
}

export type CacheLocation = string;

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
  webviewUrl: string;
  initialView: ViewNames;
  repository: LilithRepo;
  languages: LilithLanguage[];
  cachelibraryLocation: CacheLocation;
  cacheTempImageLocation: CacheLocation;
}

export interface BookBaseList {
  activeProcessId: string;
  bookListRecord: Record<string, BookBase>;
  cachedImagesRecord: Record<string, VirtualItem<string>>;
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

export interface LibraryBook extends Book {
  savedAt: number;
}

export type StoredLibrary = Record<string, LibraryBook>;
