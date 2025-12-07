import { beforeEach, describe, expect, jest, test } from "@jest/globals";

let mockExists: jest.Mock;
let mockUnlink: jest.Mock;
let mockReadDir: jest.Mock;
let mockDownloadFile: jest.Mock;
let mockStat: jest.Mock;
let mockMkdir: jest.Mock;
let mockCopyFile: jest.Mock;

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
}));

jest.mock("@atsu/lilith", () => ({
    LilithImageExtension: { jpeg: "jpeg", png: "png", webp: "webp" },
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

        expect(mockCopyFile).toHaveBeenCalledWith(
            "from/one.txt",
            "to/one.txt",
        );
        expect(transfers.length).toBe(1);
        await Promise.all(transfers);
    });

    test("clearCache logs error when readDir fails", async () => {
        mockReadDir.mockRejectedValue(new Error("fail"));
        await DeviceCache.clearCache("/cache");
        expect(mockReadDir).toHaveBeenCalledWith("/cache");
    });
});
