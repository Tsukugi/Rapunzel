import { SearchQueryOptions } from "@atsu/lilith/dist/interfaces/base";
import { DeviceCache, StartLoadingImagesProps } from "../cache/cache";
import { RapunzelLog } from "../config/log";
import { useRapunzelStore } from "../store/store";
import { RandomTools } from "../tools/random";

import { Book, BookBase, useAPILoader } from "@atsu/lilith";
import { BrowseState } from "../store/interfaces";

interface LoadImageListProps extends StartLoadingImagesProps {}
const loadImageList = async ({
    id = RandomTools.generateRandomId(10),
    data,
    onImageLoaded,
    shouldCancelLoad,
}: LoadImageListProps): Promise<string[]> => {
    if (data.length === 0) return [];

    const imageSet = data.filter((data) => !!data);
    RapunzelLog.log(
        `[loadImageList]: Start loading images, size ${imageSet.length}, id ${id}`,
    );

    try {
        const indexes = await DeviceCache.startLoadingImages({
            id,
            data: imageSet,
            onImageLoaded,
            shouldCancelLoad,
        });
        return indexes;
    } catch (error) {
        return [];
    }
};

export const useRapunzelLoader = (
    setLocalState: (newState: string[]) => void = (value) => value,
) => {
    const getNewId = () => RandomTools.generateRandomId(10);

    const {
        loader: [loader],
        reader: [reader],
        browse: [browse],
        config: [config],
    } = useRapunzelStore();

    const apiLoader = useAPILoader({
        repo: config.repository,
        configurations: {
            headers: config.apiLoaderConfig,
        },
    });

    /**
     * Handler for onImageLoaded event, it will trigger events for localState and StoreState.
     * @param setStoreState
     * @returns
     */
    const imageStateLoader = (setStoreState: (newValue: string[]) => void) => {
        let loadedImages = [] as string[];
        let index = 0;

        const onImageLoaded = async (url: string) => {
            loadedImages[index] = url;
            setStoreState(loadedImages);
            setLocalState(loadedImages);
            index++;
        };
        return onImageLoaded;
    };

    /**
     * Loads a book based on its code, it will force return the first chapter and automatically download and cache the image list to the Reader state.
     * @param code Unique id of a book
     * @returns
     */
    const loadFirstChapter = async (code: string) => {
        RapunzelLog.log("[loadBook] Loading first chapter from code", code);
        const book = await loadBook(code);
        if (!book) return null;
        const promise = await loadChapter(book.chapters[0].id);
        return promise;
    };

    /**
     * Loads a book based on its code, and then save it on the state.
     * @param code Unique id of a book
     * @returns
     */
    const loadBook = async (code: string): Promise<Book | null> => {
        RapunzelLog.log("[loadBook] Loading book with code", code);
        const book = await apiLoader.getBook(code).catch(RapunzelLog.error);
        if (!book || book.chapters.length === 0) return null;

        reader.book = book;

        const promise = Promise.resolve(book);
        return promise;
    };

    /**
     * Loads a chapter based on its id, it will automatically download and cache the image list to the Reader state.
     * @param code Unique id of a book
     * @returns
     */
    const loadChapter = async (id: string) => {
        loader.reader = true;
        RapunzelLog.log("[loadBook] Loading  chapter from id", id);
        const chapter = await apiLoader.getChapter(id).catch(RapunzelLog.error);

        const onFinish = () => {
            loader.reader = false;
        };

        if (!chapter) {
            onFinish();
            return null;
        }

        const images = chapter.pages.map((page) => page.uri);
        reader.chapter = chapter;

        reader.activeProcessId = getNewId();

        const promise = loadImageList({
            id: reader.activeProcessId,
            data: images,
            onImageLoaded: imageStateLoader((value) => {
                reader.cachedImages = value;
            }),
            shouldCancelLoad: (id) => {
                const cancel = id !== reader.activeProcessId;
                if (cancel) RapunzelLog.log("[loadBook] Skipping id ", id);
                return cancel;
            },
        });

        promise.finally(onFinish);
        return promise;
    };

    const getSearch = async (
        searchValue: string,
        searchOptions?: Partial<SearchQueryOptions>,
    ) => {
        const searchResult = await apiLoader.search(searchValue, searchOptions);
        if (!searchResult || searchResult.results.length === 0) {
            RapunzelLog.error(`[loadSearch] Search returned no results`);
            return null;
        }
        const imagesToCache: string[] = [];
        const bookDict: Record<string, BookBase> = {};

        searchResult.results.forEach((manga) => {
            imagesToCache.push(manga.cover.uri);
            bookDict[manga.id] = manga;
        });

        return { imagesToCache, bookDict, searchResult };
    };

    /**
     * Loads the matching books from a given string, the book list will be saved into the Browse state, and the images will be automatically downloaded and cached.
     * @param searchValue
     * @returns
     */
    const loadSearch = async (
        searchValue: string,
        searchOptions?: Partial<SearchQueryOptions>,
        clean: boolean = true,
    ) => {
        if (loader.browse) return;
        loader.browse = true;

        const onFinish = () => {
            loader.browse = false;
        };

        if (clean) {
            browse.cachedImages = [];
            browse.bookList = [];
            browse.bookListRecord = {};
            browse.activeProcessId = getNewId();
            browse.page = 1;
        }

        RapunzelLog.log(
            "[loadSearch] Searching for the following",
            searchValue,
        );
        const values = await getSearch(searchValue, searchOptions);
        if (!values) {
            onFinish();
            return null;
        }

        const { searchResult, imagesToCache, bookDict } = values;

        const promise = loadImageList({
            id: browse.activeProcessId,
            data: imagesToCache,
            onImageLoaded: async () => {},
            shouldCancelLoad: (id) => {
                const cancel = id !== browse.activeProcessId;
                if (cancel) RapunzelLog.log("[loadBook] Skipping id ", id);
                return cancel;
            },
        });

        promise
            .then((value) => {
                browse.bookList = [...browse.bookList, ...searchResult.results];
                browse.bookListRecord = {
                    ...browse.bookListRecord,
                    ...bookDict,
                };
                browse.cachedImages = [...browse.cachedImages, ...value];
                if (searchOptions?.page) {
                    browse.page = searchOptions.page;
                }
            })
            .catch(() => {})
            .finally(onFinish);

        return promise;
    };

    return { loadSearch, loadFirstChapter, loadBook, loadChapter };
};
