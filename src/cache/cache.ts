import RNFS from "react-native-fs";
import { NHentaiCache } from "./nhentai";

const ImageCacheDirectory = RNFS.DocumentDirectoryPath;

type Extension = ".jpg" | ".jpeg" | ".png" | ".gif"; // Fallback extensions to try
const SupportedExtensions: Extension[] = [".jpg", ".png", ".jpeg"];

interface RequestImageWithFallback {
    url: string;
    extensionIndex?: number;
    downloadHandler: (url: string) => Promise<{ statusCode: number }>;
}
async function downloadImageWithFallback({
    url,
    extensionIndex = 0,
    downloadHandler,
}: RequestImageWithFallback) {
    return new Promise<void>((onSuccess, onError) => {
        const onDownloadFailed = () => {
            // Error occurred, try next extension if available
            const nextFallbackIndex = extensionIndex + 1;
            if (nextFallbackIndex >= SupportedExtensions.length) {
                // All fallbacks failed, handle error as needed
                console.error("No extension supported for ", url);
                return onError();
            }

            return downloadImageWithFallback({
                url,
                extensionIndex: nextFallbackIndex,
                downloadHandler,
            });
        };
        try {
            const createdUrl =
                NHentaiCache.removeFileExtension(url) +
                SupportedExtensions[extensionIndex];
            const response = downloadHandler(createdUrl);
            response
                .then(({ statusCode }) => {
                    if (statusCode === 200) {
                        return onSuccess();
                    }
                    console.warn(
                        "Image download failed for ",
                        createdUrl,
                        statusCode,
                    );
                    onDownloadFailed();
                })
                .catch(onDownloadFailed);
        } catch (error) {
            onDownloadFailed();
        }
    });
}
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
            return null;
        }
    }

    onImageCached("file://" + localImagePath);
};

const getCachePath = (filename: string) => {
    return `${ImageCacheDirectory}/${filename}`;
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

        // Filter files that have image extensions (adjust this according to your use case)
        const imageFiles = files.filter((file) =>
            /\.(jpg|jpeg|png|gif)$/i.test(file.name),
        );

        // Extract URIs for image files
        const imageUris = imageFiles.map((file) => "file://" + file.path);

        return imageUris;
    } catch (error) {
        console.error("Error reading cached images:", error);
        return [];
    }
};

export const DeviceCache = {
    downloadAndCacheImage,
    getCachePath,
    startLoadingImages,
    redownloadImage,
    calculateCacheSize,
    clearCache,
    listCachedImages,
};
