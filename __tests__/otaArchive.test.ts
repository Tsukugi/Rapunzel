import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { fromByteArray } from "base64-js";
import { zipSync } from "fflate";
import RNFS from "react-native-fs";

import { extractOtaArchive } from "../src/ota/archive";

jest.mock("react-native-fs", () => ({
    exists: jest.fn(async () => false),
    mkdir: jest.fn(async () => undefined),
    unlink: jest.fn(async () => undefined),
    readFile: jest.fn(async () => ""),
    writeFile: jest.fn(async () => undefined),
}));

describe("OTA archive extraction", () => {
    afterEach(() => {
        jest.mocked(RNFS).writeFile.mockClear();
    });

    test("extracts the bundle and assets under the release root", async () => {
        const fs = jest.mocked(RNFS);
        fs.readFile.mockResolvedValue(
            fromByteArray(
                zipSync({
                    "index.android.bundle": new Uint8Array([
                        0xc6, 0x1f, 0xbc, 0x03, 1,
                    ]),
                    "drawable-mdpi/mascot.png": new Uint8Array([2]),
                }),
            ),
        );

        await extractOtaArchive(
            "/documents/ota/android/0.9.4/archive.zip",
            "/documents/ota/android/0.9.4",
            "index.android.bundle",
            "android",
        );

        expect(fs.writeFile).toHaveBeenCalledWith(
            "/documents/ota/android/0.9.4/index.android.bundle",
            "xh+8AwE=",
            "base64",
        );
        expect(fs.writeFile).toHaveBeenCalledWith(
            "/documents/ota/android/0.9.4/drawable-mdpi/mascot.png",
            "Ag==",
            "base64",
        );
    });

    test("rejects archive paths that escape the release root", async () => {
        const fs = jest.mocked(RNFS);
        fs.readFile.mockResolvedValue(
            fromByteArray(
                zipSync({
                    "../escape.js": new Uint8Array([1]),
                    "index.android.bundle": new Uint8Array([2]),
                }),
            ),
        );

        await expect(
            extractOtaArchive(
                "/documents/ota/android/0.9.4/archive.zip",
                "/documents/ota/android/0.9.4",
                "index.android.bundle",
            ),
        ).rejects.toThrow("Unsafe OTA archive path");
        expect(fs.writeFile).not.toHaveBeenCalled();
    });

    test("rejects a plain Android bundle before activating it", async () => {
        const fs = jest.mocked(RNFS);
        fs.readFile.mockResolvedValue(
            fromByteArray(
                zipSync({
                    "index.android.bundle": new TextEncoder().encode(
                        "var answer = 42;",
                    ),
                }),
            ),
        );

        await expect(
            extractOtaArchive(
                "/documents/ota/android/0.9.4/archive.zip",
                "/documents/ota/android/0.9.4",
                "index.android.bundle",
                "android",
            ),
        ).rejects.toThrow("Android OTA bundle is not Hermes bytecode");
        expect(fs.writeFile).not.toHaveBeenCalled();
    });
});
