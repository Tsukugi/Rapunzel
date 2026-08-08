import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { fromByteArray } from "base64-js";
import { zipSync } from "fflate";
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
    schema: 2,
    platforms: {
        android: {
            version: "0.10.0",
            nativeCompatibility: "rn-0.72.6-hermes",
            archive: {
                path: "Rapunzel-0.10.0.android.ota.zip",
                url: "https://example.com/Rapunzel-0.10.0.android.ota.zip",
                sha256: "a".repeat(64),
                bytes: 1,
            },
            bundlePath: "index.android.bundle",
        },
    },
};

const archiveBase64 = fromByteArray(
    zipSync({
        "index.android.bundle": new Uint8Array([
            0xc6, 0x1f, 0xbc, 0x03, 1,
        ]),
        "drawable-mdpi/assets_mascot.png": new Uint8Array([2]),
    }),
);

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

        expect(update?.platformManifest.version).toBe("0.10.0");
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

        jest.mocked(RNFS).readFile.mockResolvedValue(archiveBase64);
        await downloadOtaUpdate(update);

        expect(jest.mocked(RNFS).downloadFile).toHaveBeenCalledTimes(1);
        expect(jest.mocked(RNFS).downloadFile).toHaveBeenCalledWith(
            expect.objectContaining({
                fromUrl:
                    "https://example.com/Rapunzel-0.10.0.android.ota.zip",
                toFile:
                    "/documents/ota/android/0.10.0/Rapunzel-0.10.0.android.ota.zip",
            }),
        );
        expect(jest.mocked(RNFS).writeFile).toHaveBeenCalledWith(
            "/documents/ota/android/0.10.0/index.android.bundle",
            "xh+8AwE=",
            "base64",
        );
        expect(jest.mocked(RNFS).writeFile).toHaveBeenCalledWith(
            "/documents/ota/android/0.10.0/drawable-mdpi/assets_mascot.png",
            "Ag==",
            "base64",
        );
        expect(jest.mocked(RNFS).downloadFile).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                fromUrl:
                    "https://example.com/Rapunzel-0.10.0.android.ota.zip",
            }),
        );
        expect(jest.mocked(RNFS).moveFile).toHaveBeenCalledWith(
            "/documents/ota/active.json.tmp",
            "/documents/ota/active.json",
        );
    });
});
