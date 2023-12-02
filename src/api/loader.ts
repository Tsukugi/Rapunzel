import { Image } from "react-native";
import { Book, BookBase, SearchResult, useAPILoader } from "@atsu/lilith";

import { DeviceCache, StartLoadingImagesProps } from "../cache/cache";
import { RapunzelLog } from "../config/log";
import { useRapunzelStore } from "../store/store";
import { RandomTools } from "../tools/random";

import { CachedImage, RapunzelImage } from "../store/interfaces";
import {
    BookListResults,
    GetBookOptions,
    SearchQueryOptions,
} from "@atsu/lilith/dist/repo/base/interfaces";

interface LoadImageListProps extends StartLoadingImagesProps {}
/**
 * Asynchronously loads images using the provided data and options.
 * @param {LoadImageListProps} props - The properties needed for loading images, extends StartLoadingImagesProps.
 * @returns {Promise<string[]>} - A Promise that resolves to an array of indexes representing the loaded images. If no images are loaded, an empty array is returned.
 */
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

/**
 * Retrieves the sizes (width and height) of images from the provided URIs using asynchronous calls.
 * @param {string[]} uris - An array of image URIs.
 * @returns {Promise<RapunzelImage[]>} - A Promise that resolves to an array of RapunzelImage objects containing image URIs, widths, and heights.
 */
const getImageListSizes = (uris: string[]): Promise<RapunzelImage[]> => {
    return Promise.all(uris.map((uri) => getImageSize(uri)));
};

/**
 * Gets the size (width and height) of an image from the provided URI using asynchronous Image.getSize method.
 * @param {string} uri - The URI of the image.
 * @returns {Promise<RapunzelImage>} - A Promise that resolves to a RapunzelImage object containing the image URI, width, and height.
 */
const getImageSize = async (uri: string): Promise<RapunzelImage> => {
    return await new Promise<RapunzelImage>((resolve) =>
        Image.getSize(
            uri,
            (width, height) => resolve({ uri, width, height }),
            () => resolve({ uri, width: null, height: null }),
        ),
    );
};

export const useRapunzelLoader = () => {
    const getNewId = () => RandomTools.generateRandomId(10);

    const {
        loading: [loading],
        reader: [reader],
        browse: [browse],
        config: [config],
        latest: [latest],
        popular: [popular],
    } = useRapunzelStore();

    const apiLoader = useAPILoader({
        repo: config.repository,
        config: {
            headers: config.apiLoaderConfig,
            options: {
                debug: config.debug,
                requiredLanguages: config.languages,
            },
        },
    });

    type OnImageLoadedEvent = (url: string) => Promise<void>;
    /**
     * Handler for the onImageLoaded event; it triggers events for localState and StoreState.
     * @param {Function} setStoreState - A function to update the state with the loaded images.
     * @returns {Function} - A function that handles the onImageLoaded event and updates the state.
     */
    const imageStateLoader = (
        setStoreState: (newValue: string[]) => void,
    ): OnImageLoadedEvent => {
        // Initialize variables to store loaded images and the current index
        let loadedImages = [] as string[];
        let index = 0;

        // Function to be called when an image is loaded
        const onImageLoaded = async (url: string) => {
            // Store the loaded image URL at the current index
            loadedImages[index] = url;

            // Update the state with the loaded images
            setStoreState(loadedImages);

            // Increment the index for the next loaded image
            index++;
        };

        // Return the onImageLoaded function for event handling
        return onImageLoaded;
    };

    /**
     * Loads a book based on its code, then saves it to the state.
     * @param {string} code - Unique id of a book.
     * @param {GetBookOptions} options - Unique id of a book.
     * @param {boolean} clean - Unique id of a book.
     * @returns {Promise<Book | null>} - A Promise that resolves to the loaded book. Returns null if the book loading fails or has no chapters.
     */
    const loadBook = async (
        code: string,
        options: Partial<GetBookOptions> = {},
        clean: boolean = true,
    ): Promise<Book | null> => {
        // If not cleaning and a search is already in progress, return an empty array
        if (!clean && loading.browse) return null;

        // Set the loader.browse flag to true to indicate that a search is in progress
        loading.browse = true;

        const onFinish = () => {
            loading.browse = false;
        };

        // Log information about the start of the book loading process
        RapunzelLog.log("[loadBook] Loading book with code", code);

        // Retrieve the book information from the API, including language preferences from the configuration
        const book = await apiLoader
            .getBook(code, options)
            .catch(RapunzelLog.error);
        // If book retrieval fails or the book has no chapters, return null
        if (!book || book.chapters.length === 0) {
            onFinish();
            return null;
        }

        // Update the Reader state with the loaded book
        let newBook: Book | null = reader.book;
        if (clean) {
            newBook = book;
        } else {
            newBook = {
                ...book,
                chapters: [...(newBook?.chapters || []), ...book.chapters],
            };

            if (options.chapterList && options.chapterList.page) {
                reader.chapterPage = options.chapterList.page;
            }
        }
        reader.book = newBook;

        // Return a resolved Promise with the loaded book for further handling, if needed
        const promise = Promise.resolve(book);

        onFinish();
        return promise;
    };

    /**
     * Loads a chapter based on its id, automatically downloading and caching the image list to the Reader state.
     * @param {string} id - Unique id of a chapter.
     * @returns {Promise<string[] >} - A Promise that resolves to an array of cached image paths corresponding to the loaded images. Returns null if the chapter loading fails.
     */
    const loadChapter = async (id: string): Promise<string[]> => {
        // Set the loader.reader flag to true to indicate that a chapter is being loaded
        loading.reader = true;

        RapunzelLog.log("[loadBook] Loading chapter from id", id);

        // Retrieve the chapter information from the API
        const chapter = await apiLoader.getChapter(id).catch(RapunzelLog.error);

        // Define a callback to execute when the chapter loading process finishes
        const onFinish = () => {
            loading.reader = false;
        };

        if (!chapter) {
            onFinish();
            return [];
        }

        // Extract image URIs from the chapter pages
        const images = chapter.pages.map((page) => page.uri);

        // Update the Reader state with the loaded chapter information
        reader.chapter = chapter;
        reader.activeProcessId = getNewId();

        // Load images asynchronously using loadImageList utility
        const promise = loadImageList({
            id: reader.activeProcessId,
            data: images,
            onImageLoaded: imageStateLoader(async (value) => {
                // Update the Reader state with the cached images and their sizes
                reader.cachedImages = await getImageListSizes(value);
            }),
            shouldCancelLoad: (id) => {
                // Check if the loading process should be canceled
                const cancel = id !== reader.activeProcessId;
                if (cancel) RapunzelLog.log("[loadBook] Skipping id ", id);
                return cancel;
            },
        });

        // Execute the onFinish callback when the image loading process finishes
        promise.finally(onFinish);

        // Return the Promise for further handling, if needed
        return promise;
    };

    /**
     * Performs a search using the provided search value and options, loading data from an API.
     * @param {string} searchValue - The search query value.
     * @param {Partial<SearchQueryOptions>} [searchOptions] - Optional search query options.
     * @returns {Promise<SearchResult | null>} - A Promise that resolves to an object containing search results, images to cache, and a dictionary of books. Returns null if no results are found.
     */
    const getSearch = async (
        searchValue: string,
        searchOptions?: Partial<SearchQueryOptions>,
    ): Promise<SearchResult | null> => {
        // Perform a search using the apiLoader, including requiredLanguages from the configuration
        const searchResult = await apiLoader.search(searchValue, {
            ...searchOptions,
        });

        // If no search results or the results array is empty, log an error and return null
        if (!searchResult || searchResult.results.length === 0) {
            RapunzelLog.error(`[loadSearch] Search returned no results`);
            return null;
        }

        return searchResult;
    };

    interface BookBaseData {
        imagesToCache: string[];
        bookDict: Record<string, BookBase>;
        imageDict: Record<string, string>;
        imageList: CachedImage[];
    }
    const getBookBaseData = (bookBaseList: BookBase[]): BookBaseData => {
        // Initialize arrays and dictionary to store images to cache and book information
        const imagesToCache: string[] = [];
        const bookDict: Record<string, BookBase> = {};
        const imageDict: Record<string, string> = {};
        const imageList: CachedImage[] = [];

        // Iterate through search results and populate imagesToCache and bookDict
        bookBaseList.forEach((manga) => {
            imagesToCache.push(manga.cover.uri);
            bookDict[manga.id] = manga;
            imageDict[manga.id] = manga.cover.uri;
            imageList.push({
                id: manga.id,
                url: manga.cover.uri,
            });
        });

        // Return an object containing imagesToCache, bookDict, and searchResult
        return { imagesToCache, bookDict, imageDict, imageList };
    };

    /**
     * Loads the matching books from a given search string. The book list is saved into the Browse state,
     * and the images are automatically downloaded and cached.
     * @param {string} searchValue - The search query value.
     * @param {Partial<SearchQueryOptions>} [searchOptions] - Optional search query options.
     * @param {boolean} [clean=true] - If true, clears the existing Browse state before loading the new search results.
     * @returns {Promise<string[]>} - A Promise that resolves to an array of cached image paths corresponding to the loaded images.
     */
    const loadSearch = async (
        searchValue: string,
        searchOptions?: Partial<SearchQueryOptions>,
        clean: boolean = true,
    ): Promise<string[]> => {
        // If not cleaning and a search is already in progress, return an empty array
        if (!clean && loading.browse) return [];

        // Set the loader.browse flag to true to indicate that a search is in progress
        loading.browse = true;

        // Define a callback to execute when the search process finishes, either successfully or not
        const onFinish = () => {
            loading.browse = false;
        };

        // If cleaning, reset Browse state variables
        if (clean) {
            browse.cachedImages = [];
            browse.cachedImagesRecord = {};
            browse.bookList = [];
            browse.bookListRecord = {};
            browse.activeProcessId = getNewId();
            browse.page = 1;
        }

        RapunzelLog.log(
            "[loadSearch] Searching for the following",
            searchValue,
        );

        // Perform the search and retrieve book information, image URIs, and book dictionary
        const searchResult: SearchResult | null = await getSearch(
            searchValue,
            searchOptions,
        );

        // If no search results, finish and return an empty array
        if (!searchResult) {
            onFinish();
            return [];
        }

        const { imagesToCache, bookDict, imageDict, imageList } =
            getBookBaseData(searchResult.results);

        // Load images asynchronously using loadImageList utility
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

        // Handle the result of the image loading process
        promise
            .then(() => {
                // Update the Browse state with search results and loaded images
                browse.bookList = [...browse.bookList, ...searchResult.results];
                browse.bookListRecord = {
                    ...browse.bookListRecord,
                    ...bookDict,
                };

                browse.cachedImagesRecord = {
                    ...browse.cachedImagesRecord,
                    ...imageDict,
                };
                browse.cachedImages = [...browse.cachedImages, ...imageList];

                // If a specific page is provided in searchOptions, update the Browse page
                if (searchOptions?.page) {
                    browse.page = searchOptions.page;
                }
            })
            .catch(() => {})
            .finally(onFinish);

        // Return the Promise for further handling, if needed
        return promise;
    };

    const getLatestBooks = async (
        page: number = 1,
        clean: boolean = true,
    ): Promise<string[]> => {
        // If not cleaning and a search is already in progress, return an empty array
        if (!clean && loading.latest) return [];

        // Set the loader.browse flag to true to indicate that a search is in progress
        loading.latest = true;

        // Define a callback to execute when the search process finishes, either successfully or not
        const onFinish = () => {
            loading.latest = false;
        };

        // If cleaning, reset Browse state variables
        if (clean) {
            latest.cachedImages = [];
            latest.cachedImagesRecord = {};
            latest.bookList = [];
            latest.bookListRecord = {};
            latest.activeProcessId = getNewId();
            latest.page = 1;
        }

        RapunzelLog.log("[getLatestBooks] Retrieving latest books");

        // Perform the search and retrieve book information, image URIs, and book dictionary
        const bookListResults: BookListResults = await apiLoader.getLatestBooks(
            page,
        );

        // If no search results, finish and return an empty array
        if (!bookListResults) {
            onFinish();
            return [];
        }

        const { imagesToCache, bookDict, imageDict, imageList } =
            getBookBaseData(bookListResults.results);

        // Load images asynchronously using loadImageList utility
        const promise = loadImageList({
            id: latest.activeProcessId,
            data: imagesToCache,
            onImageLoaded: async () => {},
            shouldCancelLoad: (id) => {
                const cancel = id !== latest.activeProcessId;
                if (cancel) RapunzelLog.log("[loadBook] Skipping id ", id);
                return cancel;
            },
        });

        // Handle the result of the image loading process
        promise
            .then((value) => {
                // Update the LatestBooks state with search results and loaded images
                latest.bookList = [
                    ...latest.bookList,
                    ...bookListResults.results,
                ];
                latest.bookListRecord = {
                    ...latest.bookListRecord,
                    ...bookDict,
                };

                latest.cachedImagesRecord = {
                    ...latest.cachedImagesRecord,
                    ...imageDict,
                };

                latest.cachedImages = [...latest.cachedImages, ...imageList];

                // If a specific page is provided in searchOptions, update the latest page
                if (page) {
                    latest.page = page;
                }
            })
            .catch(() => {})
            .finally(onFinish);

        // Return the Promise for further handling, if needed
        return promise;
    };

    return {
        loadSearch,
        loadBook,
        loadChapter,
        getLatestBooks,
    };
};
