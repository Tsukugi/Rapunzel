import { useState, TaihouOptions } from '@atsu/taihou';
import { LilithLanguage } from '@atsu/lilith';
import { useEffect } from 'react';
import {
  AutoFetchWebviewState,
  BookBaseList,
  BrowseState,
  ConfigState,
  EAutoFetchWebviewStep,
  HeaderState,
  LatestBooksState,
  LibraryState,
  LilithRepo,
  LoadingState,
  PopularBooksState,
  ReaderState,
  RouterState,
  Store,
  TaihouEffect,
  UseReactTaihou,
  UIState,
  ViewNames,
} from './types';

export const ImageCacheLocations = {
  Downloads: 'Downloads',
  Temp: 'Temp',
};

const RapunzelState = {} as Store;
let isInitialized = false;

export const useRapunzelStore = () => {
  if (!isInitialized) {
    throw new Error('Taihou store not initialized. Call initRapunzelStore() first.');
  }
  return RapunzelState;
};

const getDefaultConfig = (): Partial<TaihouOptions> => {
  return { debug: false, name: 'RapunzelStore' };
};

export interface InitRapunzelStoreProps {
  onGetConfig?: () => Partial<TaihouOptions>;
}

export const initRapunzelStore = (props: InitRapunzelStoreProps = {}) => {
  if (isInitialized) return;
  const { onGetConfig = getDefaultConfig } = props;

  const useReactConfig = <T>(name: string, initialState: T): UseReactTaihou<T> => {
    const taihou = useState<T>({
      state: initialState,
      options: {
        ...onGetConfig(),
        name,
      },
    });

    const effect: TaihouEffect<T> = (onUpdate) => {
      useEffect(() => {
        taihou.watch(onUpdate);
        return () => {
          taihou.unwatch(onUpdate);
        };
      }, []);
    };

    return [taihou.getState(), effect];
  };

  RapunzelState.router = useReactConfig<RouterState>('router', {
    currentRoute: ViewNames.RapunzelBrowse,
    history: [],
  });

  RapunzelState.config = useReactConfig<ConfigState>('config', {
    debug: false,
    enableCache: true,
    useFallbackExtensionOnDownload: false,
    cachelibraryLocation: ImageCacheLocations.Downloads,
    cacheTempImageLocation: ImageCacheLocations.Temp,
    apiLoaderConfig: {
      'User-Agent': '',
      cookie: '',
    },
    initialView: ViewNames.RapunzelMainFeed,
    webviewUrl: 'https://nhentai.net/',
    repository: LilithRepo.NHentai,
    languages: [
      LilithLanguage.english,
      LilithLanguage.spanish,
      LilithLanguage.japanese,
      LilithLanguage.mandarin,
    ],
  });

  RapunzelState.reader = useReactConfig<ReaderState>('reader', {
    activeProcessId: '',
    book: null,
    chapter: null,
    cachedImages: [],
    chapterPage: 1,
  });

  RapunzelState.header = useReactConfig<HeaderState>('header', {
    searchValue: '',
  });

  const getDefaultBookBaseList = (): BookBaseList => ({
    activeProcessId: '',
    bookListRecord: {},
    cachedImagesRecord: {},
  });

  RapunzelState.browse = useReactConfig<BrowseState>('browse', {
    ...getDefaultBookBaseList(),
    page: 1,
  });

  RapunzelState.library = useReactConfig<LibraryState>('library', {
    saved: {},
    rendered: [],
  });

  RapunzelState.latest = useReactConfig<LatestBooksState>('latest', {
    ...getDefaultBookBaseList(),
    page: 1,
  });

  RapunzelState.trending = useReactConfig<PopularBooksState>('trending', {
    ...getDefaultBookBaseList(),
  });

  RapunzelState.loading = useReactConfig<LoadingState>('loading', {
    browse: false,
    reader: false,
    latest: false,
    trending: false,
  });

  RapunzelState.autoFetchWebview = useReactConfig<AutoFetchWebviewState>(
    'autoFetchWebview',
    {
      step: EAutoFetchWebviewStep.Standby,
    },
  );

  RapunzelState.ui = useReactConfig<UIState>('ui', {
    snackMessage: '',
  });

  isInitialized = true;
};
