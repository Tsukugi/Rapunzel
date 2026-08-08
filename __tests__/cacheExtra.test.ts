import { beforeEach, describe, expect, jest, test } from "@jest/globals";

type DownloadResult = { promise: Promise<{ statusCode: number }> };
type DownloadArguments = { fromUrl: string; toFile: string };
type AsyncMock<Result, Arguments extends unknown[] = []> = jest.MockedFunction<
    (...args: Arguments) => Promise<Result>
>;
type DownloadMock = jest.MockedFunction<
    (options: DownloadArguments) => DownloadResult
>;

let mockExists: AsyncMock<boolean, [string]>;
let mockUnlink: AsyncMock<void, [string]>;
let mockReadDir: AsyncMock<Array<{ name: string }>, [string]>;
let mockDownloadFile: DownloadMock;
let mockStat: AsyncMock<{ size: number }, [string]>;
let mockMkdir: AsyncMock<void, [string]>;
let mockCopyFile: AsyncMock<void, [string, string]>;
let mockMoveFile: AsyncMock<void, [string, string]>;

jest.mock("../src/config/log", () => ({
    RapunzelLog: {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: "DocPath",
    exists: (path: string) => mockExists(path),
    unlink: (path: string) => mockUnlink(path),
    readDir: (path: string) => mockReadDir(path),
    downloadFile: (options: DownloadArguments) => mockDownloadFile(options),
    stat: (path: string) => mockStat(path),
    mkdir: (path: string) => mockMkdir(path),
    copyFile: (from: string, to: string) => mockCopyFile(from, to),
    moveFile: (from: string, to: string) => mockMoveFile(from, to),
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
        mockExists = jest
            .fn<(path: string) => Promise<boolean>>()
            .mockResolvedValue(true);
        mockUnlink = jest
            .fn<(path: string) => Promise<void>>()
            .mockResolvedValue(undefined);
        mockReadDir = jest
            .fn<(path: string) => Promise<Array<{ name: string }>>>()
            .mockResolvedValue([]);
        mockDownloadFile = jest
            .fn<(options: DownloadArguments) => DownloadResult>()
            .mockReturnValue({
                promise: Promise.resolve({ statusCode: 200 }),
            });
        mockStat = jest
            .fn<(path: string) => Promise<{ size: number }>>()
            .mockResolvedValue({ size: 0 });
        mockMkdir = jest
            .fn<(path: string) => Promise<void>>()
            .mockResolvedValue(undefined);
        mockCopyFile = jest
            .fn<(from: string, to: string) => Promise<void>>()
            .mockResolvedValue(undefined);
        mockMoveFile = jest
            .fn<(from: string, to: string) => Promise<void>>()
            .mockResolvedValue(undefined);
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
            downloadHandler: async (url: string) => {
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
        mockDownloadFile = jest
            .fn<(options: DownloadArguments) => DownloadResult>()
            .mockReturnValue({
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
        mockDownloadFile = jest.fn(({ fromUrl }: DownloadArguments) => {
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
            .fn<(options: DownloadArguments) => DownloadResult>()
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
            onFileNaming: ({ index }: { index: number }) => `${index}.jpg`,
            onImageLoaded: async (url: string) => loaded.push(url),
            shouldCancelLoad: () => true,
        });

        expect(result).toEqual([]);
        expect(loaded).toEqual([]);
        spy.mockRestore();
    });

    test("startLoadingImages propagates cached extension from downloader", async () => {
        mockExists.mockResolvedValue(false);
        mockDownloadFile = jest.fn(({ fromUrl }: DownloadArguments) => {
            const statusCode = fromUrl.endsWith(".jpeg") ? 200 : 404;
            return { promise: Promise.resolve({ statusCode }) };
        });

        const loaded: string[] = [];

        const result = await DeviceCache.startLoadingImages({
            data: ["https://example.com/image"],
            imagesPath: "/cache",
            onFileNaming: ({ index }: { index: number }) => `${index}.jpg`,
            onImageLoaded: async (url: string) => loaded.push(url),
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
            onFileNaming: ({ index }: { index: number }) => `${index}.jpg`,
            onImageLoaded: async () => undefined,
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
        mockDownloadFile = jest.fn(({ fromUrl }: DownloadArguments) => ({
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
            onFileNaming: ({ index }: { index: number }) => `${index}.jpg`,
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
