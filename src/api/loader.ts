import { DeviceCache, StartLoadingImagesProps } from "../cache/cache";
import { RapunzelLog } from "../config/log";
import { useRapunzelStore } from "../store/store";
import { RandomTools } from "../tools/random";

import { LilithRepo, Sort, Thumbnail, useAPILoader } from "@atsu/lilith";

interface LoadImageListProps extends StartLoadingImagesProps {}
const loadImageList = async ({
    id = RandomTools.generateRandomId(10),
    data,
    onImageLoaded,
    shouldCancelLoad,
}: LoadImageListProps): Promise<string[]> => {
    if (data.length === 0) return [];

    RapunzelLog.log(
        `[loadImageList]: Start loading images, size ${data.length}, id ${id}`,
    );
    try {
        const indexes = await DeviceCache.startLoadingImages({
            id,
            data,
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
        reader: [reader],
        browse: [browse],
        config: [config],
    } = useRapunzelStore();

    const loader = useAPILoader({
        repo: LilithRepo.NHentai,
        configurations: {
            headers: config.apiLoaderConfig,
        },
    });

    /**
     * Handler for onImageLoaded event, it will trigger events for localState and StoreState.
     * @param updateState
     * @returns
     */
    const imageStateLoader = (
        setStoreState: (newValue: string[]) => void,
        length: number,
    ) => {
        let loadedImages = new Array(length).fill(null) as string[];
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
    const loadBook = async (code: string) => {
        const book = await loader.get(code);
        if (!book) return null;

        const images = book.chapters[0].pages.map((page) => page.uri);
        reader.book = book;

        reader.activeProcessId = getNewId();

        const promise = loadImageList({
            id: reader.activeProcessId,
            data: images,
            onImageLoaded: imageStateLoader((value) => {
                reader.cachedImages = value;
            }, images.length),
            shouldCancelLoad: (id) => {
                const cancel = id !== reader.activeProcessId;
                if (cancel) RapunzelLog.log("[loadBook] Skipping id ", id);
                return cancel;
            },
        });

        return promise;
    };

    /**
     * Loads the matching books from a given string, the book list will be saved into the Browse state, and the images will be automatically downloaded and cached.
     * @param searchValue
     * @returns
     */
    const loadSearch = async (searchValue: string) => {
        const data = await loader.search(searchValue, 1, Sort.POPULAR);
        console.log(data);
        if (!data || data.results.length === 0) {
            RapunzelLog.error(`[loadSearch] Search returned no results`);
            return null;
        }
        const covers: string[] = [];
        const bookDict: Record<string, Thumbnail> = {};

        data.results.forEach((manga) => {
            covers.push(manga.cover.uri);
            bookDict[manga.id] = manga;
        });

        browse.bookList = data.results;
        browse.bookListRecord = bookDict;

        browse.activeProcessId = getNewId();

        const promise = loadImageList({
            id: browse.activeProcessId,
            data: covers,
            onImageLoaded: imageStateLoader((value) => {
                browse.cachedImages = value;
            }, covers.length),
            shouldCancelLoad: (id) => {
                const cancel = id !== browse.activeProcessId;
                if (cancel) RapunzelLog.log("[loadBook] Skipping id ", id);
                return cancel;
            },
        });

        return promise;
    };

    return { loadSearch, loadBook };
};
