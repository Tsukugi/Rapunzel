import "react-native";
// Note: import explicitly to use the types shiped with jest.
import { test, describe, jest, expect } from "@jest/globals";

const size = 52428800; // 50 MB in bytes
const cachePath = "cache";
const imageName = "image.jpg";
const bookId = "123123";
const testDomain = "nhentai.net";

const useLocalFilename = (mockPrefix = "") =>
    `${bookId}.${mockPrefix}${imageName}`;
const useDomainFilename = (mockPrefix = "") =>
    `${testDomain}/${bookId}/${mockPrefix}${imageName}`;
const useLocalFullPathFilename = (mockPrefix = "") =>
    `file://${cachePath}/${useLocalFilename(mockPrefix)}`;

const usePromise = <T,>(returnValue: T): Promise<T> =>
    new Promise((res) => res(returnValue));

jest.mock("./../src/config/log", () => ({ RapunzelLog: console }));
jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: cachePath,
    exists: () => true,
    unlink: () => {},
    readDir: (path: string) =>
        usePromise([
            {
                name: useLocalFilename(),
                path: cachePath,
            },
        ]),
    downloadFile: (options: object) => ({
        jobId: 0,
        promise: usePromise(null),
    }),
    stat: (path: string) => usePromise({ size }),
}));

import { DeviceCache } from "../src/cache/cache";

describe("Use device cache", () => {
    test("Calculate cache size", async () => {
        const size = await DeviceCache.calculateCacheSize();
        expect(size).toEqual(50);
    });

    test("Get cache path", async () => {
        const cachePathToTest = DeviceCache.getCachePath(imageName);
        expect(cachePathToTest).toBe(`${cachePath}/${imageName}`);
    });

    test("Download with fallback", async () => {
        const image = await DeviceCache.downloadImageWithFallback({
            url: imageName,
            downloadHandler: () => usePromise({ statusCode: 200 }),
        });
        expect(image).toEqual(imageName);
    });

    test("Download and cache image", async () => {
        const image = await DeviceCache.downloadAndCacheImage({
            uri: `${testDomain}/${bookId}/${imageName}`,
            onImageCached: (path) => {
                expect(path).toEqual(useLocalFullPathFilename());
            },
        });

        expect(image).toEqual(useLocalFullPathFilename());
    });

    test("List cached images", async () => {
        const images = await DeviceCache.listCachedImages();
        expect(images).toEqual([useLocalFullPathFilename()]);
    });

    test("Redownload Image", async () => {
        const images = await DeviceCache.redownloadImage(
            cachePath,
            useDomainFilename(),
            (uri) => {
                expect(uri).toEqual(useLocalFullPathFilename());
            },
        );
        expect(images).toEqual(useLocalFullPathFilename());
    });

    test("Start loading images", async () => {
        let testIndex = 0;
        const images = await DeviceCache.startLoadingImages({
            data: [
                useDomainFilename("0"),
                useDomainFilename("1"),
                useDomainFilename("2"),
                useDomainFilename("3"),
                useDomainFilename("4"),
            ],
            onImageLoaded: async (url) => {
                expect(url).toEqual(useLocalFullPathFilename(`${testIndex}`));
                testIndex++;
            },
        });
        expect(images).toEqual([
            useLocalFullPathFilename("0"),
            useLocalFullPathFilename("1"),
            useLocalFullPathFilename("2"),
            useLocalFullPathFilename("3"),
            useLocalFullPathFilename("4"),
        ]);
    });
});
