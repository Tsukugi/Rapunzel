import { beforeEach, describe, expect, jest, test } from "@jest/globals";

let mockExists: jest.Mock;
let mockUnlink: jest.Mock;
let mockReadDir: jest.Mock;
let mockDownloadFile: jest.Mock;
let mockStat: jest.Mock;
let mockMkdir: jest.Mock;
let mockCopyFile: jest.Mock;
let mockMoveFile: jest.Mock;

jest.mock("../src/config/log", () => ({
    RapunzelLog: {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: "DocPath",
    exists: (...args: any[]) => mockExists(...args),
    unlink: (...args: any[]) => mockUnlink(...args),
    readDir: (...args: any[]) => mockReadDir(...args),
    downloadFile: (options: any) => mockDownloadFile(options),
    stat: (...args: any[]) => mockStat(...args),
    mkdir: (...args: any[]) => mockMkdir(...args),
    copyFile: (...args: any[]) => mockCopyFile(...args),
    moveFile: (...args: any[]) => mockMoveFile(...args),
}));

jest.mock("@atsu/lilith", () => ({
    LilithImageExtension: {
        jpg: "jpg",
        jpeg: "jpeg",
        png: "png",
        webp: "webp",
    },
}));

const { DeviceCache } = require("../src/cache/cache");

describe("DeviceCache extra branches", () => {
    beforeEach(() => {
        mockExists = jest.fn().mockResolvedValue(true);
        mockUnlink = jest.fn().mockResolvedValue(null);
        mockReadDir = jest.fn().mockResolvedValue([]);
        mockDownloadFile = jest.fn().mockReturnValue({
            promise: Promise.resolve({ statusCode: 200 }),
        });
        mockStat = jest.fn().mockResolvedValue({ size: 0 });
        mockMkdir = jest.fn().mockResolvedValue(null);
        mockCopyFile = jest.fn().mockResolvedValue(null);
        mockMoveFile = jest.fn().mockResolvedValue(null);
        jest.useRealTimers();
    });

    test("downloadImageWithFallback returns null on thrown error", async () => {
        const res = await DeviceCache.downloadImageWithFallback({
            url: "image.jpg",
            downloadHandler: () => {
                throw new Error("network fail");
            },
        });
        expect(res).toBeNull();
    });

    test("downloadImageWithFallback tries compound extensions", async () => {
        const tried: string[] = [];
        const res = await DeviceCache.downloadImageWithFallback({
            url: "https://example.com/cover.webp.webp",
            downloadHandler: async (url) => {
                tried.push(url);
                return {
                    statusCode: url.endsWith("cover.jpg.webp") ? 200 : 404,
                };
            },
        });

        expect(res).toBe("https://example.com/cover.jpg.webp");
        expect(tried).toContain("https://example.com/cover.jpg.webp");
    });

    test("downloadAndCacheImage returns null after all downloads fail", async () => {
        mockExists.mockResolvedValue(false);
        mockDownloadFile = jest.fn().mockReturnValue({
            promise: Promise.resolve({ statusCode: 404 }),
        });
        const onImageCached = jest.fn();

        const res = await DeviceCache.downloadAndCacheImage({
            uri: "https://example.com/missing.jpg",
            downloadPath: "/cache",
            imageFileName: "missing.jpg",
            onImageCached,
        });

        expect(res).toBeNull();
        expect(onImageCached).not.toHaveBeenCalled();
    });

    test("downloadAndCacheImage forces download when file exists", async () => {
        mockExists.mockResolvedValue(true);
        const onImageCached = jest.fn();
        const res = await DeviceCache.downloadAndCacheImage({
            uri: "https://example.com/image.jpg",
            downloadPath: "/cache",
            imageFileName: "image.jpg",
            forceDownload: true,
            onImageCached,
        });

        expect(mockDownloadFile).toHaveBeenCalled();
        expect(onImageCached).toHaveBeenCalledWith("file:///cache/image.jpg");
        expect(res).toBe("file:///cache/image.jpg");
    });

    test("downloadAndCacheImage renames file when fallback changes extension", async () => {
        mockExists.mockResolvedValue(false);
        mockDownloadFile = jest.fn(({ fromUrl, toFile }) => {
            const statusCode = fromUrl.endsWith(".jpg") ? 404 : 200;
            return { promise: Promise.resolve({ statusCode }) };
        });
        const onImageCached = jest.fn();

        const res = await DeviceCache.downloadAndCacheImage({
            uri: "https://example.com/image.jpg",
            downloadPath: "/cache",
            imageFileName: "image.jpg",
            onImageCached,
        });

        expect(mockMoveFile).toHaveBeenCalledWith(
            "/cache/image.jpg",
            "/cache/image.jpeg",
        );
        expect(onImageCached).toHaveBeenCalledWith("file:///cache/image.jpeg");
        expect(res).toBe("file:///cache/image.jpeg");
    });

    test("downloadAndCacheImage keeps original extension when no fallback", async () => {
        mockExists.mockResolvedValue(false);
        mockDownloadFile = jest
            .fn()
            .mockReturnValue({ promise: Promise.resolve({ statusCode: 200 }) });
        const onImageCached = jest.fn();

        const res = await DeviceCache.downloadAndCacheImage({
            uri: "https://example.com/image.jpg",
            downloadPath: "/cache",
            imageFileName: "image.jpg",
            onImageCached,
        });

        expect(mockMoveFile).not.toHaveBeenCalled();
        expect(onImageCached).toHaveBeenCalledWith("file:///cache/image.jpg");
        expect(res).toBe("file:///cache/image.jpg");
    });

    test("startLoadingImages stops when shouldCancelLoad is true", async () => {
        const spy = jest
            .spyOn(DeviceCache, "downloadAndCacheImage")
            .mockResolvedValue("cached-url");

        const loaded: string[] = [];
        const result = await DeviceCache.startLoadingImages({
            data: ["a", "b"],
            imagesPath: "/cache",
            onFileNaming: ({ index }) => `${index}.jpg`,
            onImageLoaded: async (url) => loaded.push(url),
            shouldCancelLoad: () => true,
        });

        expect(result).toEqual([]);
        expect(loaded).toEqual([]);
        spy.mockRestore();
    });

    test("startLoadingImages propagates cached extension from downloader", async () => {
        mockExists.mockResolvedValue(false);
        mockDownloadFile = jest.fn(({ fromUrl }) => {
            const statusCode = fromUrl.endsWith(".jpeg") ? 200 : 404;
            return { promise: Promise.resolve({ statusCode }) };
        });

        const loaded: string[] = [];

        const result = await DeviceCache.startLoadingImages({
            data: ["https://example.com/image"],
            imagesPath: "/cache",
            onFileNaming: ({ index }) => `${index}.jpg`,
            onImageLoaded: async (url) => loaded.push(url),
        });

        expect(result).toEqual(["file:///cache/0.jpeg"]);
        expect(loaded).toEqual(["file:///cache/0.jpeg"]);
    });

    test("startLoadingImages tries fallbackUri when primary fails", async () => {
        mockExists.mockResolvedValue(false);
        mockDownloadFile = jest.fn(({ fromUrl }) => {
            const statusCode = fromUrl.includes("fallback.com") ? 200 : 404;
            return { promise: Promise.resolve({ statusCode }) };
        });

        const result = await DeviceCache.startLoadingImages({
            data: [
                {
                    uri: "https://example.com/image.jpg",
                    fallbackUri: "https://fallback.com/image.jpg",
                },
            ],
            imagesPath: "/cache",
            onFileNaming: ({ index }) => `${index}.jpg`,
            onImageLoaded: async () => {},
        });

        expect(mockDownloadFile).toHaveBeenCalledWith(
            expect.objectContaining({
                fromUrl: expect.stringContaining("fallback.com/image.jpg"),
            }),
        );
        expect(result).toEqual(["file:///cache/0.jpg"]);
    });

    test("preserves the original page index when a previous page fails", async () => {
        mockExists.mockResolvedValue(false);
        mockDownloadFile = jest.fn(({ fromUrl }) => ({
            promise: Promise.resolve({
                statusCode: fromUrl.includes("page-2") ? 404 : 200,
            }),
        }));

        const loaded: Array<{ url: string; index: number }> = [];
        const result = await DeviceCache.startLoadingImages({
            data: [
                "https://example.com/page-1.jpg",
                "https://example.com/page-2.jpg",
                "https://example.com/page-3.jpg",
            ],
            imagesPath: "/cache",
            onFileNaming: ({ index }) => `${index}.jpg`,
            onImageLoaded: async (url: string, index: number) =>
                loaded.push({ url, index }),
        });

        expect(result).toEqual(["file:///cache/0.jpg", "file:///cache/2.jpg"]);
        expect(loaded.map(({ index }) => index)).toEqual([0, 2]);
    });

    test("ensureCreateDeepFolders creates nested paths", async () => {
        jest.useFakeTimers();
        const promise = DeviceCache.ensureCreateDeepFolders("a/b", "/root");
        jest.runAllTimers();
        await promise;

        expect(mockMkdir).toHaveBeenCalledTimes(2);
        expect(mockMkdir).toHaveBeenNthCalledWith(1, "/root/a");
        expect(mockMkdir).toHaveBeenNthCalledWith(2, "/root/a/b");
    });

    test("copyFolder copies files reported by readDir", async () => {
        mockReadDir.mockResolvedValue([{ name: "one.txt" }]);
        const transfers = await DeviceCache.copyFolder("from", "to");

        expect(mockCopyFile).toHaveBeenCalledWith("from/one.txt", "to/one.txt");
        expect(transfers.length).toBe(1);
        await Promise.all(transfers);
    });

    test("clearCache logs error when readDir fails", async () => {
        mockReadDir.mockRejectedValue(new Error("fail"));
        await DeviceCache.clearCache("/cache");
        expect(mockReadDir).toHaveBeenCalledWith("/cache");
    });
});
