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
    LatestBooks = "LatestBooks",
    ReadBooks = "ReadBooks",
}

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
            const libraryRoot = `${DeviceCache.ImageCacheDirectory}/${StaticLibraryPaths.RootFolderName}`;

            await RNFS.mkdir(libraryRoot);
            await DeviceCache.ensureCreateDeepFolders(folderPath, libraryRoot);

            const imageListFolderPath = `${libraryRoot}/${folderPath}`;
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
};
