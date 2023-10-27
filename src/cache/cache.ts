import RNFS from "react-native-fs";
import { NHentaiCache } from "./nhentai";

interface DownloadAndCacheImageProps {
    uri: string;
    onImageCached?: (path: string) => void;
}
const downloadAndCacheImage = async ({
    uri,
    onImageCached = console.log,
}: DownloadAndCacheImageProps) => {
    const localImagePath = getCachePath(NHentaiCache.getFileName(uri));

    const exists = await RNFS.exists(localImagePath);

    if (!exists) {
        try {
            console.log("loading image:", uri);
            await new Promise<void>((res) => setTimeout(() => res(), 1000));

            const request = RNFS.downloadFile({
                fromUrl: uri,
                toFile: localImagePath,
            });

            await request.promise
                .then((response) => {
                    if (response.statusCode !== 200)
                        console.error("Error downlading ", uri);
                })
                .catch((err) => console.error(err));
        } catch (error) {
            console.error("Error downloading image:", error);
            return null;
        }
    }

    onImageCached("file://" + localImagePath);
};

const getCachePath = (filename: string) => {
    return `${RNFS.DocumentDirectoryPath}/${filename}`;
};
interface StartLoadingImagesProps {
    data: string[];
    onImageCached: (url: string) => void;
}

const startLoadingImages = ({
    data,
    onImageCached,
}: StartLoadingImagesProps) => {
    downloadAndCacheImage({
        uri: data[0],
        onImageCached: (url) => {
            onImageCached(url);
            loadNextImage({ data, currentIndex: 0, onImageCached });
        },
    });
};

interface LoadNextImageProps {
    data: string[];
    currentIndex: number;
    onImageCached: (url: string) => void;
}

const loadNextImage = async ({
    data,
    currentIndex,
    onImageCached,
}: LoadNextImageProps) => {
    try {
        // Load the next image if there are more images
        if (currentIndex >= data.length - 1) {
            return console.log(
                `Finished loading ${currentIndex + 1} of ${
                    data.length
                } entries.`,
            );
        }
        console.log("Finished loading image:", currentIndex);

        const nextIndex = currentIndex + 1;
        downloadAndCacheImage({
            uri: data[nextIndex],
            onImageCached: (url) => {
                onImageCached(url);
                loadNextImage({ data, currentIndex: nextIndex, onImageCached });
            },
        });
    } catch (error) {
        console.error("Error loading image:", error);
    }
};
const clearSpecificFile = async (filePath: string) => {
    try {
        const exists = await RNFS.exists(filePath);

        if (exists) {
            await RNFS.unlink(filePath);
            console.log("File deleted successfully.");
        } else {
            console.log("File not found.");
        }
    } catch (error) {
        console.error("Error deleting file:", error);
    }
};

const redownloadImage = (filePath: string, imageUri: string) => {
    clearSpecificFile(filePath).then(() => {
        downloadAndCacheImage({
            uri: imageUri,
        });
    });
};

const calculateCacheSize = async (): Promise<number> => {
    try {
        const cachePath = RNFS.CachesDirectoryPath; // Get the path to the cache directory
        const info = await RNFS.stat(cachePath); // Get information about the cache directory

        const cacheSizeInBytes = info.size; // Cache size in bytes
        const cacheSizeInMegabytes = cacheSizeInBytes / (1024 * 1024); // Cache size in megabytes

        return cacheSizeInMegabytes;
    } catch (error) {
        console.error("Error calculating cache size:", error);
        return 0; // Return 0 if there's an error
    }
};

const clearCache = async (): Promise<void> => {
    try {
        const cacheDirectory = `${RNFS.DocumentDirectoryPath}`;
        const files = await RNFS.readDir(cacheDirectory);

        // Iterate through the files and remove them
        for (const file of files) {
            await RNFS.unlink(file.path);
        }

        console.log("Cache cleared successfully.");
    } catch (error) {
        console.error("Error clearing cache:", error);
    }
};

export const DeviceCache = {
    downloadAndCacheImage,
    getCachePath,
    startLoadingImages,
    redownloadImage,
    calculateCacheSize,
    clearCache,
};
