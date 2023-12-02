import RNFS from "react-native-fs";
import { NHentaiCache } from "./nhentai";
import { RapunzelLog } from "../config/log";
import { PromiseTools } from "../tools/promise";
import { RandomTools } from "../tools/random";

/**
 * Constant representing the path to the directory used for caching images.
 * Uses the React Native File System's Document Directory.
 */
const ImageCacheDirectory = RNFS.DocumentDirectoryPath;

/**
 * Type representing supported image file extensions.
 */
type Extension = ".jpg" | ".jpeg" | ".png" | ".gif";

/**
 * Array containing supported image file extensions in the order of preference for fallbacks.
 */
const SupportedExtensions: Extension[] = [".jpg", ".png", ".jpeg", ".gif"];

interface RequestImageWithFallback {
    url: string;
    downloadHandler: (url: string) => Promise<{ statusCode: number }>;
}
/**
 * Asynchronously downloads an image with fallback mechanisms in case the initial download fails.
 * @param {RequestImageWithFallback} props - The properties needed for downloading an image with fallback.
 * @returns {Promise<string | null>} - A Promise that resolves to the URL of the successfully downloaded image. Returns null if all fallbacks fail.
 */
const downloadImageWithFallback = async ({
    url,
    downloadHandler,
}: RequestImageWithFallback): Promise<string | null> => {
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
                    onSuccess(await downloadWithExtension(nextFallbackIndex));
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
/**
 * Asynchronously downloads and caches an image. If the image is already cached, returns the local path immediately.
 * @param {DownloadAndCacheImageProps} props - The properties needed for downloading and caching an image.
 * @returns {Promise<string>} - A Promise that resolves to the local path of the cached or newly downloaded image.
 */
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

/**
 * Generates the full path for a file in the ImageCacheDirectory based on the provided filename.
 * @param {string} filename - The name of the file for which to generate the cache path.
 * @returns {string} - The full path to the file in the ImageCacheDirectory.
 */
const getCachePath = (filename: string) => {
    return `${ImageCacheDirectory}/${filename}`;
};

export interface StartLoadingImagesProps {
    id?: string;
    data: string[];
    onImageLoaded: (url: string) => Promise<void>;
    shouldCancelLoad: (id: string) => boolean;
}

/**
 * Asynchronously starts loading a list of images, downloading and caching each image in the provided data array.
 * @param {StartLoadingImagesProps} props - The properties needed for starting the image loading process.
 * @returns {Promise<string[]>} - A Promise that resolves to an array of indexes representing the loaded images.
 * The indexes are the URLs of the loaded images. If the loading process is interrupted or encounters an error,
 * the Promise may resolve with fewer indexes.
 */
const startLoadingImages = async ({
    id = RandomTools.generateRandomId(10),
    data,
    onImageLoaded,
    shouldCancelLoad,
}: StartLoadingImagesProps): Promise<string[]> => {
    const indexes: string[] = [];

    const onImageLoadedHandler = async (url: string) => {
        if (!url) return; // If no url is passed we expect a load interruption, so we will skip
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

/**
 * Asynchronously clears a specific file by deleting it.
 * @param {string} filePath - The path to the file to be deleted.
 */
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

/**
 * Asynchronously redownloads and caches an image, replacing the existing image file at the specified filePath.
 * @param {string} filePath - The path to the existing image file that will be replaced.
 * @param {string} imageUri - The URI of the image to be redownloaded and cached.
 * @param {(localImagePath: string) => void} onImageCached - A callback function called when the image is successfully cached, providing the local image path.
 * @returns {Promise<string | null>} - A Promise that resolves to the local image path after redownloading and caching. Returns null if the imageUri is falsy.
 */
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

/**
 * Asynchronously calculates the size of the ImageCacheDirectory in megabytes.
 * @returns {Promise<number>} - A Promise that resolves to the size of the cache directory in megabytes.
 * If an error occurs during the process, the Promise is rejected with the error, and 0 is returned.
 */
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

/**
 * Asynchronously clears the contents of the ImageCacheDirectory by removing all cached files.
 * @returns {Promise<void>} - A Promise that resolves once the cache is successfully cleared.
 */
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

/**
 * Asynchronously lists the URIs of cached images in the ImageCacheDirectory.
 * @returns {Promise<string[]>} - A Promise that resolves to an array of image URIs for the cached images.
 * If no cached images are found or an error occurs, an empty array is returned.
 */
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
