import RNFS from "react-native-fs";
import { NHentaiCache } from "./nhentai";
import { RapunzelLog } from "../config/log";
import { RapunzelPromise } from "../utils/promise";

const ImageCacheDirectory = RNFS.DocumentDirectoryPath;

type Extension = ".jpg" | ".jpeg" | ".png" | ".gif"; // Fallback extensions to try
const SupportedExtensions: Extension[] = [".jpg", ".png", ".jpeg"];

interface RequestImageWithFallback {
    url: string;
    downloadHandler: (url: string) => Promise<{ statusCode: number }>;
}
const downloadImageWithFallback = async ({
    url,
    downloadHandler,
}: RequestImageWithFallback) => {
    let extensionIndex = 0;

    const onFallback = (extensionIndex: number) =>
        new Promise<string | null>((onSuccess, onError) => {
            const onDownloadFailed = (): void => {
                // Error occurred, try next extension if available
                const nextFallbackIndex = extensionIndex + 1;
                if (nextFallbackIndex >= SupportedExtensions.length) {
                    // All fallbacks failed, handle error as needed
                    RapunzelLog.error("No extension supported for ", url);
                    onError(null);
                } else {
                    RapunzelLog.error(
                        "Retrying download with ",
                        SupportedExtensions[nextFallbackIndex],
                    );
                    onFallback(nextFallbackIndex);
                }
            };

            try {
                const createdUrl =
                    NHentaiCache.removeFileExtension(url) +
                    SupportedExtensions[extensionIndex];
                return downloadHandler(createdUrl)
                    .then((res) => {
                        if (res.statusCode === 200) {
                            RapunzelLog.log("Successful download ", createdUrl);
                            return onSuccess(createdUrl);
                        }
                        return onDownloadFailed();
                    })
                    .catch((res) => {
                        RapunzelLog.warn(
                            "Image download failed for ",
                            createdUrl,
                            res.statusCode,
                        );
                        return onDownloadFailed();
                    });
            } catch (error) {
                return onDownloadFailed();
            }
        });

    const res = await onFallback(extensionIndex);
    return res;
};

const getRandomDelay = () => Math.floor(Math.random() * (1000 - 500 + 1)) + 500;
interface DownloadAndCacheImageProps {
    uri: string;
    onImageCached?: (path: string) => void;
}
const downloadAndCacheImage = async ({
    uri,
    onImageCached = (path) => {},
}: DownloadAndCacheImageProps) => {
    const localImagePath = getCachePath(NHentaiCache.getFileName(uri));

    const exists = await RNFS.exists(localImagePath);

    if (!exists) {
        const onError = (error: unknown) => {
            RapunzelLog.warn("Error downloading image:", error);
        };

        try {
            await new Promise<void>((res) =>
                setTimeout(() => res(), getRandomDelay()),
            );
            RapunzelLog.log("Downloading image:", uri);
            await downloadImageWithFallback({
                url: uri,
                downloadHandler: (downloadUri) => {
                    const request = RNFS.downloadFile({
                        fromUrl: downloadUri,
                        toFile: localImagePath,
                    });
                    return request.promise;
                },
            });
        } catch (error) {
            onError(error);
        }
    }

    const result = "file://" + localImagePath;
    onImageCached(result);
    return result;
};

const getCachePath = (filename: string) => {
    return `${ImageCacheDirectory}/${filename}`;
};
export interface StartLoadingImagesProps {
    data: string[];
    onImageLoaded: (url: string) => Promise<void>;
    cancelProcess?: boolean;
}

const startLoadingImages = async ({
    data,
    onImageLoaded,
    cancelProcess = false,
}: StartLoadingImagesProps): Promise<string[]> => {
    const indexes: string[] = [];

    //  RapunzelLog.log("[startLoadingImages] Start", indexes);

    const onImageLoadedHandler = async (url: string) => {
        indexes.push(url);
        // RapunzelLog.log("[startLoadingImages] onImageLoadedHandler", indexes);

        await onImageLoaded(url);
    };

    await RapunzelPromise.recursivePromiseChain({
        promises: data.map((uri) => () => {
            if (cancelProcess) {
                RapunzelLog.log(cancelProcess);
                return Promise.reject<string>();
            }
            return downloadAndCacheImage({ uri });
        }),
        onPromiseSettled: onImageLoadedHandler,
    });

    RapunzelLog.log(
        `[startLoadingImages] Finished loading ${data.length} entries.`,
    );
    // RapunzelLog.log("[startLoadingImages] Finished", indexes);

    return indexes;
};

const clearSpecificFile = async (filePath: string) => {
    try {
        const exists = await RNFS.exists(filePath);

        if (exists) {
            await RNFS.unlink(filePath);
            RapunzelLog.log("[clearSpecificFile] File deleted successfully.");
        } else {
            RapunzelLog.log("[clearSpecificFile] File not found.");
        }
    } catch (error) {
        RapunzelLog.error("[clearSpecificFile] Error deleting file:", error);
    }
};

const redownloadImage = async (
    filePath: string,
    imageUri: string,
    onImageCached: (localImagePath: string) => void,
): Promise<string | null> => {
    if (!imageUri) return null;
    await clearSpecificFile(filePath);
    const image = await downloadAndCacheImage({
        uri: imageUri,
        onImageCached,
    });
    return image;
};

const calculateCacheSize = async (): Promise<number> => {
    try {
        const cachePath = ImageCacheDirectory; // Get the path to the cache directory
        const info = await RNFS.stat(cachePath); // Get information about the cache directory

        const cacheSizeInBytes = info.size; // Cache size in bytes
        const cacheSizeInMegabytes = cacheSizeInBytes / (1024 * 1024); // Cache size in megabytes

        return cacheSizeInMegabytes;
    } catch (error) {
        RapunzelLog.error("Error calculating cache size:", error);
        return 0; // Return 0 if there's an error
    }
};

const clearCache = async (): Promise<void> => {
    try {
        const cachePath = ImageCacheDirectory;
        const files = await RNFS.readDir(cachePath);

        // Iterate through the files and remove them
        for (const file of files) {
            await RNFS.unlink(file.path);
        }
        RapunzelLog.log("[clearCache] Cache cleared successfully.");
    } catch (error) {
        RapunzelLog.error("[clearCache] Error clearing cache:", error);
    }
};

const listCachedImages = async (): Promise<string[]> => {
    try {
        const files = await RNFS.readDir(ImageCacheDirectory);

        // Filter files that have image extensions
        const imageFiles = files.filter((file) =>
            /\.(jpg|jpeg|png|gif)$/i.test(file.name),
        );

        // Extract URIs for image files
        const imageUris = imageFiles.map(
            (file) => `file://${file.path}/${file.name}`,
        );

        return imageUris;
    } catch (error) {
        RapunzelLog.error("Error reading cached images:", error);
        return [];
    }
};

export const DeviceCache = {
    downloadImageWithFallback,
    downloadAndCacheImage,
    getCachePath,
    startLoadingImages,
    redownloadImage,
    calculateCacheSize,
    clearCache,
    listCachedImages,
};
