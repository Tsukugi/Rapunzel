import "react-native";
// Note: import explicitly to use the types shiped with jest.
import { test, describe, jest, expect } from "@jest/globals";

const size = 52428800; // 50 MB in bytes
const cachePath = "RapunzelLibrary";
const imageName = "image.jpg";
const bookId = "123123";
const testDomain = "testdomain.net";

const useLocalFilename = (mockPrefix = "") => {
    if (!mockPrefix) return imageName;
    return `${mockPrefix}.${imageName}`;
};
const usePath = () => {
    return `${cachePath}/${bookId}`;
};
const useDomainFilename = (mockPrefix = "") =>
    `${testDomain}/${bookId}/${useLocalFilename(mockPrefix)}`;
const useLocalFullPathFilename = (mockPrefix = "") =>
    `file://${usePath()}/${useLocalFilename(mockPrefix)}`;

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
                path: `${cachePath}/${bookId}`,
            },
        ]),
    downloadFile: (options: object) => ({
        jobId: 0,
        promise: usePromise(null),
    }),
    stat: (path: string) => usePromise({ size }),
}));

import { DeviceCache } from "../src/cache/cache";
import { RandomTools } from "../src/tools/random";

describe("Use device cache", () => {
    test("Calculate cache size", async () => {
        const size = await DeviceCache.calculateCacheSize();
        expect(size).toEqual(50);
    });

    test("Download with fallback", async () => {
        const image = await DeviceCache.downloadImageWithFallback({
            url: imageName,
            downloadHandler: () => usePromise({ statusCode: 200 }),
        });
        expect(image).toEqual(imageName);

        const image2 = await DeviceCache.downloadImageWithFallback({
            url: imageName,
            downloadHandler: () => usePromise({ statusCode: 404 }),
        }).catch((error) => {
            console.log(error);
        });
        expect(image2).toEqual(null);
    });

    test("Download and cache image", async () => {
        const image = await DeviceCache.downloadAndCacheImage({
            uri: `${testDomain}/${bookId}/${imageName}`,
            downloadPath: `${cachePath}/${bookId}`,
            imageFileName: `${imageName}`,
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
            usePath(),
            useDomainFilename(),
            useLocalFilename(),
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
            downloadPath: usePath(),
            onFileNaming: ({ index }) => `${index}.${imageName}`,
            onImageLoaded: async (url) => {
                expect(url).toEqual(useLocalFullPathFilename(`${testIndex}`));
                testIndex++;
            },
            shouldCancelLoad: () => false,
        });
        expect(images).toEqual([
            useLocalFullPathFilename("0"),
            useLocalFullPathFilename("1"),
            useLocalFullPathFilename("2"),
            useLocalFullPathFilename("3"),
            useLocalFullPathFilename("4"),
        ]);
    });

    test("Interrupt loading", async () => {
        let testIndex = 0;
        const images = await DeviceCache.startLoadingImages({
            data: [
                useDomainFilename("0"),
                useDomainFilename("1"),
                useDomainFilename("2"),
                useDomainFilename("3"),
                useDomainFilename("4"),
            ],
            downloadPath: usePath(),
            onFileNaming: ({ index }) => `${index}.${imageName}`,
            onImageLoaded: async (url) => {
                testIndex++;
            },

            shouldCancelLoad: () => testIndex >= 2,
        });
        expect(images).toEqual([
            useLocalFullPathFilename("0"),
            useLocalFullPathFilename("1"),
        ]);
    });

    test("Interrupt loading through another process", async () => {
        let testIndex = 0;

        const loadData = [
            useDomainFilename("0"),
            useDomainFilename("1"),
            useDomainFilename("2"),
            useDomainFilename("3"),
            useDomainFilename("4"),
        ];

        let activeId = RandomTools.generateRandomId(10);

        const images = await DeviceCache.startLoadingImages({
            id: activeId,
            data: loadData,
            downloadPath: usePath(),
            onFileNaming: ({ index }) => `${index}.${imageName}`,
            onImageLoaded: async () => {
                testIndex++;

                if (testIndex === 2) {
                    activeId = RandomTools.generateRandomId(10);
                    await DeviceCache.startLoadingImages({
                        id: activeId,
                        data: loadData,
                        downloadPath: "",
                        onFileNaming: () => "",
                        onImageLoaded: () => Promise.resolve(),
                        shouldCancelLoad: () => false,
                    });
                }
            },
            shouldCancelLoad: (id) => {
                console.log(id, activeId, id !== activeId);
                return id !== activeId;
            },
        });
        expect(images).toEqual([
            useLocalFullPathFilename("0"),
            useLocalFullPathFilename("1"),
        ]);
    });
});
