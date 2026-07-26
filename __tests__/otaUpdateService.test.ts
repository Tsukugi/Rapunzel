import { afterEach, describe, expect, jest, test } from "@jest/globals";
import RNFS from "react-native-fs";

import { checkForOtaUpdate, downloadOtaUpdate } from "../src/ota/updateService";

jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: "/documents",
    exists: jest.fn(async () => false),
    mkdir: jest.fn(async () => undefined),
    unlink: jest.fn(async () => undefined),
    writeFile: jest.fn(async () => undefined),
    moveFile: jest.fn(async () => undefined),
    readFile: jest.fn(async () => ""),
    downloadFile: jest.fn(() => ({
        promise: Promise.resolve({ statusCode: 200 }),
    })),
    stat: jest.fn(async () => ({ size: 1 })),
    hash: jest.fn(async () => "a".repeat(64)),
}));

const manifest = {
    schema: 1,
    platforms: {
        android: {
            version: "0.9.4",
            nativeCompatibility: "rn-0.72.6-hermes",
            bundle: {
                path: "index.android.bundle",
                url: "https://example.com/index.android.bundle",
                sha256: "a".repeat(64),
                bytes: 1,
            },
            assets: [
                {
                    path: "drawable-mdpi/assets_mascot.png",
                    url: "https://example.com/assets_mascot.png",
                    sha256: "a".repeat(64),
                    bytes: 1,
                },
            ],
        },
    },
};

describe("OTA update service", () => {
    const fetchMock = jest.fn() as jest.MockedFunction<typeof fetch>;

    afterEach(() => {
        fetchMock.mockReset();
        jest.mocked(RNFS).exists.mockResolvedValue(false);
        jest.mocked(RNFS).readFile.mockResolvedValue("");
    });

    test("checks the selected platform and compares it with installed code", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => manifest,
        } as Response);
        global.fetch = fetchMock;

        const update = await checkForOtaUpdate("android");

        expect(update?.platformManifest.version).toBe("0.9.4");
        expect(fetchMock).toHaveBeenCalledWith(
            "https://github.com/Tsukugi/Rapunzel/releases/latest/download/latest.json",
            { headers: { "Cache-Control": "no-cache" } },
        );
    });

    test("verifies every file before activating the pending bundle", async () => {
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => manifest,
        } as Response);
        global.fetch = fetchMock;

        const update = await checkForOtaUpdate("android");
        if (update === null) throw new Error("Expected an available update");

        await downloadOtaUpdate(update);

        expect(jest.mocked(RNFS).downloadFile).toHaveBeenCalledTimes(2);
        expect(jest.mocked(RNFS).downloadFile).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                fromUrl: "https://example.com/index.android.bundle",
                toFile: "/documents/ota/android/0.9.4/index.android.bundle",
            }),
        );
        expect(jest.mocked(RNFS).downloadFile).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                fromUrl: "https://example.com/assets_mascot.png",
                toFile: "/documents/ota/android/0.9.4/drawable-mdpi/assets_mascot.png",
            }),
        );
        expect(jest.mocked(RNFS).moveFile).toHaveBeenCalledWith(
            "/documents/ota/active.json.tmp",
            "/documents/ota/active.json",
        );
    });
});
