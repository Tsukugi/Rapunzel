import RNFS from "react-native-fs";

import { DeviceCache, StartLoadingImagesProps } from "./cache";
import { RapunzelLog } from "../config/log";

export interface DownloadBookProps extends StartLoadingImagesProps {
    id: string;
    downloadPath: string; // This accepts nesting (eg a/b/c => ImageCacheDirectory/a/b/c)
}

export enum StaticLibraryPaths {
    RootFolderName = "RapunzelLibrary",
    MainFeed = `MainFeed`,
    Trending = `Trending`,
    SearchResults = "SearchResults",
    ReadBooks = "ReadBooks",
}

const RapunzelLibrary = `${DeviceCache.ImageCacheDirectory}/${StaticLibraryPaths.RootFolderName}`;
export const RapunzelCache = {
    downloadImageList: async ({
        id,
        downloadPath: folderPath,
        data,
        onFileNaming,
        onImageLoaded,
        shouldCancelLoad,
    }: DownloadBookProps) => {
        if (data.length === 0) return [];

        const imageSet = data.filter((data) => !!data);
        RapunzelLog.log(
            `[loadImageList]: Start loading images, size ${imageSet.length}, id ${id}`,
        );

        try {
            await RNFS.mkdir(RapunzelLibrary);
            await DeviceCache.ensureCreateDeepFolders(
                folderPath,
                RapunzelLibrary,
            );

            const imageListFolderPath = `${RapunzelLibrary}/${folderPath}`;
            return await DeviceCache.startLoadingImages({
                id,
                data: imageSet,
                downloadPath: imageListFolderPath,
                onFileNaming,
                onImageLoaded,
                shouldCancelLoad,
            });
        } catch (error) {
            return [];
        }
    },
    /**
     * Asynchronously clears ImageCacheDirectory covers.
     * @returns {Promise<void>} - A Promise that resolves once the covers is successfully cleared.
     */
    clearTempCache: async (): Promise<void> => {
        try {
            const processes = [
                RNFS.unlink(
                    `${RapunzelLibrary}/${StaticLibraryPaths.MainFeed}`,
                ),
                RNFS.unlink(
                    `${RapunzelLibrary}/${StaticLibraryPaths.Trending}`,
                ),
                RNFS.unlink(
                    `${RapunzelLibrary}/${StaticLibraryPaths.SearchResults}`,
                ),
            ];

            const res = await Promise.allSettled(processes);
            RapunzelLog.log(res);
            RapunzelLog.log(
                "[clearTempCache] Temp cache cleared successfully.",
            );
        } catch (error) {
            RapunzelLog.error("[clearTempCache] Error clearing cache:", error);
        }
    },
};
