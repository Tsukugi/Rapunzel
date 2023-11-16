import RNFS from "react-native-fs";
import { NHentaiCache } from "./nhentai";
import { RapunzelLog } from "../config/log";
import { PromiseTools } from "../tools/promise";
import { RandomTools } from "../tools/random";

const ImageCacheDirectory = RNFS.DocumentDirectoryPath;

type Extension = ".jpg" | ".jpeg" | ".png" | ".gif"; // Fallback extensions to try
const SupportedExtensions: Extension[] = [".jpg", ".png", ".jpeg", ".gif"];

interface RequestImageWithFallback {
    url: string;
    downloadHandler: (url: string) => Promise<{ statusCode: number }>;
}
const downloadImageWithFallback = async ({
    url,
    downloadHandler,
}: RequestImageWithFallback) => {
    let extensionIndex = 0;

    const downloadWithExtension = (extensionIndex: number) =>
        new Promise<string>(async (onSuccess, onError) => {
            const onDownloadFailed = async (): Promise<void> => {
                const nextFallbackIndex = extensionIndex + 1;
                if (nextFallbackIndex >= SupportedExtensions.length) {
                    // All fallbacks failed
                    onError(`No extension supported for "${url}"`);
                } else {
                    RapunzelLog.warn(
                        `[downloadImageWithFallback] Retrying download with ${SupportedExtensions[nextFallbackIndex]} for ${url}`,
                    );
                    await downloadWithExtension(nextFallbackIndex);
                }
            };

            const createdUrl = `${NHentaiCache.removeFileExtension(url)}${
                SupportedExtensions[extensionIndex]
            }`;

            try {
                const res = await downloadHandler(createdUrl);
                if (res.statusCode === 200) {
                    RapunzelLog.log(
                        `[downloadImageWithFallback] Successful download => ${createdUrl}`,
                    );
                    return onSuccess(createdUrl);
                }
                await onDownloadFailed();
            } catch (error) {
                onError(error);
            }
        });

    try {
        const res = await downloadHandler(url);
        if (res.statusCode !== 200) {
            return await downloadWithExtension(extensionIndex);
        }
        return url;
    } catch (error) {
        RapunzelLog.error(
            `[downloadImageWithFallback] Image download failed for ${url}, reason: ${error}`,
        );
        return null;
    }
};

const getRandomDelay = () => Math.floor(Math.random() * (200 - 100 + 1)) + 100;
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
            RapunzelLog.warn(
                "[downloadAndCacheImage] Error downloading image:",
                error,
            );
        };

        try {
            await new Promise<void>((res) =>
                setTimeout(() => res(), getRandomDelay()),
            );

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
    id?: string;
    data: string[];
    onImageLoaded: (url: string) => Promise<void>;
    shouldCancelLoad: (id: string) => boolean;
}

const startLoadingImages = async ({
    id = RandomTools.generateRandomId(10),
    data,
    onImageLoaded,
    shouldCancelLoad,
}: StartLoadingImagesProps): Promise<string[]> => {
    const indexes: string[] = [];

    const onImageLoadedHandler = async (url: string) => {
        if (!url) return; // If no url is passed we expect a load inerruption, so we will skip
        indexes.push(url);
        await onImageLoaded(url);
    };

    await PromiseTools.recursivePromiseChain<string>({
        promises: data.map((uri) => () => {
            const cancelProcess = shouldCancelLoad(id);
            if (cancelProcess) return Promise.resolve(""); // This will interrupt the load chain;
            return downloadAndCacheImage({ uri });
        }),
        onPromiseSettled: onImageLoadedHandler,
    });

    RapunzelLog.log(
        `[startLoadingImages] Finished loading ${data.length} entries.`,
    );

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
        RapunzelLog.error(
            "[calculateCacheSize] Error calculating cache size:",
            error,
        );
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
        RapunzelLog.error(
            "[listCachedImages] Error reading cached images:",
            error,
        );
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
