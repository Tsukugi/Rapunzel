import RNFS from "react-native-fs";
import { NHentaiCache } from "./nhentai";

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
                    console.error("No extension supported for ", url);
                    onError(null);
                } else {
                    console.error(
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
                            console.log("Successful download  ", createdUrl);
                            return onSuccess(createdUrl);
                        }
                        return onDownloadFailed();
                    })
                    .catch((res) => {
                        console.warn(
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
interface DownloadAndCacheImageProps {
    uri: string;
    onImageCached?: (path: string) => void;
}
const downloadAndCacheImage = async ({
    uri,
    onImageCached = () => {},
}: DownloadAndCacheImageProps) => {
    const localImagePath = getCachePath(NHentaiCache.getFileName(uri));

    const exists = await RNFS.exists(localImagePath);

    if (!exists) {
        const onError = (error: unknown) => {
            console.warn("Error downloading image:", error);
        };

        try {
            console.log("Downloading image:", uri);
            await new Promise<void>((res) => setTimeout(() => res(), 500));

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
    onImageLoaded: (url: string, index: number) => void;
}

const startLoadingImages = async ({
    data,
    onImageLoaded,
}: StartLoadingImagesProps): Promise<string[]> => {
    const indexes: string[] = [];
    await downloadAndCacheImage({
        uri: data[0],
        onImageCached: (url) => {
            indexes.push(url);
            onImageLoaded(url, 0);
            loadNextImage({
                data,
                currentIndex: 0,
                onImageLoaded,
            });
        },
    });

    return indexes;
};

interface LoadNextImageProps extends StartLoadingImagesProps {
    currentIndex: number;
}

const loadNextImage = async ({
    data,
    currentIndex,
    onImageLoaded,
}: LoadNextImageProps) => {
    try {
        console.log(
            `Finished loading image: ${
                currentIndex + 1
            } - index: ${currentIndex}`,
        );
        if (currentIndex >= data.length - 1) {
            return console.log(
                `Finished loading ${currentIndex + 1} of ${
                    data.length
                } entries.`,
            );
        }

        const nextIndex = currentIndex + 1;
        downloadAndCacheImage({
            uri: data[nextIndex],
            onImageCached: (url) => {
                onImageLoaded(url, nextIndex);
                loadNextImage({
                    data,
                    currentIndex: nextIndex,
                    onImageLoaded,
                });
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

const redownloadImage = async (
    filePath: string,
    imageUri: string,
): Promise<string | null> => {
    if (!imageUri) return null;
    await clearSpecificFile(filePath);
    const image = await downloadAndCacheImage({
        uri: imageUri,
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
        console.error("Error calculating cache size:", error);
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
        console.log("Cache cleared successfully.");
    } catch (error) {
        console.error("Error clearing cache:", error);
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
        console.error("Error reading cached images:", error);
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
