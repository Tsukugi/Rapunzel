import RNFS from "react-native-fs";

import { DeviceCache, StartLoadingImagesProps } from "./cache";
import { RapunzelLog } from "../config/log";
import { useRapunzelStore } from "../store/store";
import { LibraryBook } from "../store/interfaces";
import { DateUtils } from "../tools/date";

export interface DownloadBookProps extends StartLoadingImagesProps {
    id: string;
    imagesPath: string; // This accepts nesting (eg a/b/c => ImageCacheDirectory/a/b/c)
    deviceDownloadPath: string;
}

export enum StaticLibraryPaths {
    RootFolderName = "RapunzelLibrary",
    MainFeed = `MainFeed`,
    Trending = `Trending`,
    SearchResults = "SearchResults",
    ReadBooks = "ReadBooks",
}

export const RapunzelCache = {
    downloadImageList: async ({
        id,
        imagesPath,
        deviceDownloadPath,
        data,
        onFileNaming,
        onImageLoaded,
        shouldCancelLoad,
    }: DownloadBookProps) => {
        if (data.length === 0) return [];

        const RapunzelLibrary = `${deviceDownloadPath}/${StaticLibraryPaths.RootFolderName}`;

        const imageSet = data.filter((data) => !!data);
        RapunzelLog.log(
            `[loadImageList]: Start loading images, size ${imageSet.length}, id ${id}`,
        );

        try {
            await RNFS.mkdir(RapunzelLibrary);
            await DeviceCache.ensureCreateDeepFolders(
                imagesPath,
                RapunzelLibrary,
            );
            const imageListFolderPath = `${RapunzelLibrary}/${imagesPath}`;
            return await DeviceCache.startLoadingImages({
                id,
                data: imageSet,
                imagesPath: imageListFolderPath,
                onFileNaming,
                onImageLoaded,
                shouldCancelLoad,
            });
        } catch (error) {
            return [];
        }
    },

    /**
     * Asynchronously clears temp directory covers.
     * @returns {Promise<void>} - A Promise that resolves once the covers is successfully cleared.
     */
    clearTempCache: async (): Promise<void> => {
        const {
            config: [config],
        } = useRapunzelStore();

        const RapunzelLibrary = `${config.cacheTempImageLocation}/${StaticLibraryPaths.RootFolderName}`;

        const removeContents = async (folder: string) => {
            await RNFS.unlink(`${RapunzelLibrary}/${folder}`);
        };

        try {
            const processes = [
                removeContents(StaticLibraryPaths.MainFeed),
                removeContents(StaticLibraryPaths.Trending),
                removeContents(StaticLibraryPaths.SearchResults),
                removeContents(StaticLibraryPaths.ReadBooks),
            ];

            await Promise.allSettled(processes);

            RapunzelLog.log(
                "[clearTempCache] Temp cache cleared successfully.",
            );
        } catch (error) {
            RapunzelLog.error("[clearTempCache] Error clearing cache:", error);
        }
    },

    /**
     * Asynchronously clears Library directory covers.
     * @returns {Promise<void>} - A Promise that resolves once the covers is successfully cleared.
     */ clearLibraryCache: async (): Promise<void> => {
        const {
            config: [config],
        } = useRapunzelStore();

        try {
            const RapunzelLibrary = `${config.cachelibraryLocation}/${StaticLibraryPaths.RootFolderName}`;
            const items = await RNFS.readDir(
                `${RapunzelLibrary}/${StaticLibraryPaths.ReadBooks}`,
            );
            const processes = items.map((item) => RNFS.unlink(item.path));

            await Promise.allSettled(processes);

            RapunzelLog.log(
                "[clearLibraryCache] Library cache cleared successfully.",
            );
        } catch (error) {
            RapunzelLog.error(
                "[clearLibraryCache] Error clearing cache:",
                error,
            );
        }
    },

    //! Update for legacy systems that didn't use LibraryBook
    applyLibraryBookAndCoverStoragePatch: (
        storedLibrary: Record<string, LibraryBook>,
        onSuccess: (newLibrary: Record<string, LibraryBook>) => void,
    ) => {
        const {
            config: [config],
        } = useRapunzelStore();
        const newLib: Record<string, LibraryBook> = {};
        Promise.all(
            Object.keys(storedLibrary).map(async (key) => {
                const [savedRepo, bookId] = key.split(".");
                const bookPath = `${config.cachelibraryLocation}/${StaticLibraryPaths.RootFolderName}/${StaticLibraryPaths.ReadBooks}/${savedRepo}/${bookId}`;
                const value = await DeviceCache.getFolderInfo(bookPath).catch(
                    () => null,
                );

                // ! This fixes errors in cover names
                const newUri = storedLibrary[key].cover.uri
                    .replace(".webp.webp", ".webp")
                    .replace("t.nhentai.net", "t4.nhentai.net");

                const result: LibraryBook = {
                    ...storedLibrary[key],
                    cover: {
                        ...storedLibrary[key].cover,
                        uri: newUri,
                    },
                    // ! This adds the new prop to sort
                    savedAt: value
                        ? DateUtils.getEpoch(value.ctime)
                        : DateUtils.getEpoch(new Date(2000, 11, 32)), // Old time
                };

                newLib[key] = result;
                return result;
            }),
        ).then(() => {
            onSuccess(newLib);
        });
    },
};
