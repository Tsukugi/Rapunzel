import "react-native";
// Note: import explicitly to use the types shiped with jest.
import { test, describe, jest, expect } from "@jest/globals";

const size = 52428800; // 50 MB in bytes
const cachePath = "cache";
const imageName = "image.jpg";
const bookId = "123123";
const testDomain = "nhentai.net";

const useLocalFilename = () => `${bookId}.${imageName}`;
const useDomainFilename = () => `${testDomain}/${bookId}/${imageName}`;
const useLocalFullPathFilename = () =>
    `file://${cachePath}/${useLocalFilename()}`;

const usePromise = <T,>(returnValue: T): Promise<T> =>
    new Promise((res) => res(returnValue));
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
        );
        expect(images).toEqual(useLocalFullPathFilename());
    });

    test("Start loading images", async () => {
        let testIndex = 0;
        const images = await DeviceCache.startLoadingImages({
            data: [
                useDomainFilename(),
                useDomainFilename(),
                useDomainFilename(),
                useDomainFilename(),
                useDomainFilename(),
            ],
            onImageLoaded: (url, index) => {
                expect(url).toEqual(useLocalFullPathFilename());
                expect(index).toEqual(testIndex);
                testIndex++;
            },
        });
        expect(images).toEqual([useLocalFullPathFilename()]);
    });
});
