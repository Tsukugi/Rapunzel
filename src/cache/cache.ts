import RNFS from "react-native-fs";
import { CacheUtils } from "./CacheUtils";
import { RapunzelLog } from "../config/log";
import { PromiseTools } from "../tools/promise";
import { RandomTools } from "../tools/random";
import { LilithImageExtension } from "@atsu/lilith";

/**
 * Array containing supported image file extensions in the order of preference for fallbacks.
 */
const SupportedExtensions: LilithImageExtension[] =
    Object.values(LilithImageExtension);

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

            const createdUrl = `${CacheUtils.removeFileExtension(url)}.${
                SupportedExtensions[extensionIndex]
            }`;
            RapunzelLog.warn(createdUrl);

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
    downloadPath: string;
    imageFileName: string;
    forceDownload?: boolean;
    onImageCached?: (path: string) => void;
}
/**
 * Asynchronously downloads and caches an image. If the image is already cached, returns the local path immediately.
 * @param {DownloadAndCacheImageProps} props - The properties needed for downloading and caching an image.
 * @returns {Promise<string>} - A Promise that resolves to the local path of the cached or newly downloaded image.
 */
const downloadAndCacheImage = async ({
    uri,
    downloadPath,
    imageFileName,
    forceDownload = false,
    onImageCached = (path) => {},
}: DownloadAndCacheImageProps): Promise<string> => {
    let imageFullPath = `${downloadPath}/${imageFileName}`;

    const exists = await RNFS.exists(imageFullPath);

    if (!exists || forceDownload) {
        RapunzelLog.log(`[downloadAndCacheImage] Download ${imageFullPath}`);

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

            const successUri = await downloadImageWithFallback({
                url: uri,
                downloadHandler: (downloadUri) => {
                    const request = RNFS.downloadFile({
                        fromUrl: downloadUri,
                        toFile: `${imageFullPath}`,
                    });
                    return request.promise;
                },
            });

            if (!successUri) throw new Error("Couldn't download image");
            const { removeFileExtension, getExtensionFromUri } = CacheUtils;
            const diffExtensionFound =
                getExtensionFromUri(imageFullPath) !==
                getExtensionFromUri(successUri);

            if (diffExtensionFound) {
                imageFullPath = `${removeFileExtension(
                    imageFullPath,
                )}.${getExtensionFromUri(successUri)}`;
                RapunzelLog.warn(
                    `[downloadAndCacheImage] Caching new extension as ${imageFullPath}`,
                );
            }
        } catch (error) {
            onError(error);
        }
    } else {
        RapunzelLog.log(
            `[downloadAndCacheImage] ${uri} is already cached in ${imageFullPath}`,
        );
    }

    const result = "file://" + imageFullPath;
    onImageCached(result);
    return result;
};

interface FileNamingProps {
    index: number;
}

export interface StartLoadingImagesProps {
    id?: string;
    data: string[];
    imagesPath: string;
    forceDownload?: boolean;
    onFileNaming: (imageInfo: FileNamingProps) => string;
    onImageLoaded: (url: string, index: number) => Promise<void>;
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
    imagesPath: downloadPath,
    forceDownload = false,
    onFileNaming,
    onImageLoaded,
    shouldCancelLoad,
}: StartLoadingImagesProps): Promise<string[]> => {
    const indexes: string[] = [];

    const onImageLoadedHandler = async (url: string) => {
        const cancelProcess = shouldCancelLoad(id);
        if (!url || cancelProcess) return; // If no url is passed we expect a load interruption, so we will skip
        indexes.push(url);
        await onImageLoaded(url, indexes.length - 1);
    };

    await PromiseTools.recursivePromiseChain<string>({
        promises: data.map((uri, index) => () => {
            const cancelProcess = shouldCancelLoad(id);
            if (cancelProcess) return Promise.resolve(""); // This will interrupt the load chain;

            return downloadAndCacheImage({
                uri,
                downloadPath,
                forceDownload,
                imageFileName: onFileNaming({
                    index,
                }),
            });
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
    imageFileName: string,
    onImageCached: (localImagePath: string) => void,
): Promise<string | null> => {
    if (!imageUri) return null;
    await clearSpecificFile(filePath);
    const image = await downloadAndCacheImage({
        uri: imageUri,
        downloadPath: filePath,
        imageFileName,
        onImageCached,
    });
    return image;
};

/**
 * Asynchronously calculates the size of the folder in megabytes.
 * @returns {Promise<number>} - A Promise that resolves to the size of the cache directory in megabytes.
 * If an error occurs during the process, the Promise is rejected with the error, and 0 is returned.
 */
const calculateCacheSize = async (path: string): Promise<number> => {
    const mbRatio = 1048576;
    const size = await getRecursiveFolderSize(path);
    const megabytes = size / mbRatio; // Bytes to MegaBytes
    RapunzelLog.log(`Result from ${path}: ${size} bytes -> ${megabytes} MB`);
    return megabytes;
};

const getRecursiveFolderSize = async (cachePath: string): Promise<number> => {
    try {
        return new Promise(async (resolve) => {
            const items = await RNFS.readDir(cachePath);

            const onItemFile = async (item: RNFS.ReadDirItem) => {
                if (item.isDirectory()) {
                    return await getRecursiveFolderSize(item.path);
                } else {
                    return item.size;
                }
            };

            const processes = items.map(onItemFile);
            const size: number = await Promise.allSettled(processes).then(
                (values) =>
                    values.reduce((acc, val) => {
                        if (val.status === "rejected") {
                            RapunzelLog.error(val.reason);
                            return acc;
                        }
                        if (val.value === 0) return acc;
                        const message = `${cachePath
                            .split("/")
                            .pop()}: ${acc} + ${val.value}`;
                        RapunzelLog.log(message);
                        acc = acc + val.value;
                        return acc;
                    }, 0),
            );
            return resolve(size);
        });
    } catch (error) {
        RapunzelLog.error(
            `[calculateCacheSize] Error calculating cache size of ${cachePath}: ${error}`,
        );
        return 0; // Return 0 if there's an error
    }
};

/**
 * Copies a folder from the source path to the destination path based on the platform.
 *
 * @param {string} source - The relative path to the source file within the assets or main bundle.
 * @param {string} destination - The full path where the file should be copied to.
 * @returns {Promise<Promise<void>[]>} A promise that resolves if we start copying data.
 * Await for the promises with something like Promise.all to wait until it finishes.
 */
const copyFolder = async (
    source: string,
    destination: string,
): Promise<Promise<void>[]> => {
    const items = await RNFS.readDir(source);

    const transfers: Promise<void>[] = [];
    items.forEach((item) => {
        transfers.push(
            RNFS.copyFile(
                `${source}/${item.name}`,
                `${destination}/${item.name}`,
            ).catch(console.error),
        );
    });

    return transfers;
};

/**
 * Asynchronously clears the contents of the path by removing all cached files.
 * @returns {Promise<void>} - A Promise that resolves once the cache is successfully cleared.
 */
const clearCache = async (path: string): Promise<void> => {
    try {
        const files = await RNFS.readDir(path);

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
 * @Deprecated
 * Asynchronously lists the URIs of cached images in the specified path.
 * @returns {Promise<string[]>} - A Promise that resolves to an array of image URIs for the cached images.
 * If no cached images are found or an error occurs, an empty array is returned.
 */
const listCachedImages = async (path: string): Promise<string[]> => {
    try {
        const files = await RNFS.readDir(path);

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

/**
 * Ensures the creation of deep folder structures asynchronously.
 *
 * This function takes a complete path and iteratively creates each folder in the path structure,
 * starting from the root path.
 *
 * @async
 * @function ensureCreateDeepFolders
 * @param {string} completePath - The full path for which folders should be created.
 * @param {string} rootPath - The root path from which folder creation begins.
 * @returns {Promise<void>} - A promise that resolves when all folders have been created.
 *
 * @example
 * await ensureCreateDeepFolders("folder/subfolder/subsubfolder", "/root");
 * This will create the folder structure: /root/folder, /root/folder/subfolder, /root/folder/subfolder/subsubfolder
 */
const ensureCreateDeepFolders = async (
    completePath: string,
    rootPath: string,
): Promise<void> => {
    return await new Promise((resolve) => {
        const paths = completePath.split("/");

        RapunzelLog.log(paths);

        let progress = 0;

        const onEachItemMigration = async (currentPath: string) => {
            const imageListFolderPath = `${rootPath}/${currentPath}`;
            await RNFS.mkdir(imageListFolderPath);
        };

        const interval = setInterval(() => {
            if (progress >= paths.length) {
                clearInterval(interval);
                RapunzelLog.log(`Created ${paths.length} folders`);
                resolve();
            } else {
                progress++;

                const currentPath = paths.slice(0, progress).join("/");
                RapunzelLog.log(
                    `${currentPath} - Progress ${progress}/${paths.length}.`,
                );
                onEachItemMigration(currentPath).catch(RapunzelLog.error);
            }
        }, 20);
    });
};

const getFolderInfo = async (folderPath: string): Promise<RNFS.StatResult> => {
    return await new Promise(async (resolve, reject) => {
        const exists = await RNFS.exists(folderPath);
        if (!exists) return reject(null);
        const stats = await RNFS.stat(folderPath);
        resolve(stats);
    });
};

export const DeviceCache = {
    ensureCreateDeepFolders,
    downloadImageWithFallback,
    downloadAndCacheImage,
    startLoadingImages,
    redownloadImage,
    calculateCacheSize,
    clearCache,
    listCachedImages,
    copyFolder,
    getFolderInfo,
};
