import { describe, expect, jest, test } from "@jest/globals";
import RNFS from "react-native-fs";
import {
    activatePendingBundle,
    createBundleReference,
    isValidOtaActiveRecord,
    markPendingBundleSuccessful,
} from "../src/ota/bundleStore";

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

describe("OTA active bundle records", () => {
    test("accepts a safe current record", () => {
        expect(
            isValidOtaActiveRecord({
                schema: 1,
                nativeCompatibility: "rn-0.72.6-hermes",
                current: {
                    version: "0.9.2",
                    nativeCompatibility: "rn-0.72.6-hermes",
                    bundlePath:
                        "/documents/ota/android/0.9.2/index.android.bundle",
                    assetRoot: "/documents/ota/android/0.9.2",
                },
            }),
        ).toBe(true);
    });

    test("rejects records that escape the OTA directory", () => {
        expect(
            isValidOtaActiveRecord({
                schema: 1,
                nativeCompatibility: "rn-0.72.6-hermes",
                current: {
                    version: "0.9.2",
                    nativeCompatibility: "rn-0.72.6-hermes",
                    bundlePath: "/documents/other/index.bundle",
                    assetRoot: "/documents/ota/android/0.9.2",
                },
            }),
        ).toBe(false);
    });

    test("creates a bundle reference under the release root", () => {
        expect(
            createBundleReference(
                "/documents/ota/android/0.9.2",
                {
                    version: "0.9.2",
                    nativeCompatibility: "rn-0.72.6-hermes",
                },
                "index.android.bundle",
            ),
        ).toEqual({
            version: "0.9.2",
            nativeCompatibility: "rn-0.72.6-hermes",
            bundlePath: "/documents/ota/android/0.9.2/index.android.bundle",
            assetRoot: "/documents/ota/android/0.9.2",
        });
    });

    test("writes a pending bundle without replacing the current bundle", async () => {
        const fs = jest.mocked(RNFS);
        fs.exists.mockImplementation(
            async (path) => path === "/documents/ota/active.json",
        );
        fs.readFile.mockResolvedValue(
            JSON.stringify({
                schema: 1,
                nativeCompatibility: "rn-0.72.6-hermes",
                current: {
                    version: "0.9.1",
                    nativeCompatibility: "rn-0.72.6-hermes",
                    bundlePath:
                        "/documents/ota/android/0.9.1/index.android.bundle",
                    assetRoot: "/documents/ota/android/0.9.1",
                },
            }),
        );

        await activatePendingBundle({
            version: "0.9.2",
            nativeCompatibility: "rn-0.72.6-hermes",
            bundlePath: "/documents/ota/android/0.9.2/index.android.bundle",
            assetRoot: "/documents/ota/android/0.9.2",
        });

        expect(fs.writeFile).toHaveBeenCalledWith(
            "/documents/ota/active.json.tmp",
            expect.stringContaining('"version":"0.9.1"'),
            "utf8",
        );
        expect(fs.mkdir).toHaveBeenCalledWith("/documents/ota");
        expect(fs.moveFile).toHaveBeenCalledWith(
            "/documents/ota/active.json.tmp",
            "/documents/ota/active.json",
        );
    });

    test("promotes a pending bundle only after the app has started", async () => {
        const fs = jest.mocked(RNFS);
        fs.exists.mockResolvedValue(true);
        fs.readFile.mockResolvedValue(
            JSON.stringify({
                schema: 1,
                nativeCompatibility: "rn-0.72.6-hermes",
                current: {
                    version: "0.9.1",
                    nativeCompatibility: "rn-0.72.6-hermes",
                    bundlePath:
                        "/documents/ota/android/0.9.1/index.android.bundle",
                    assetRoot: "/documents/ota/android/0.9.1",
                },
                pending: {
                    version: "0.9.2",
                    nativeCompatibility: "rn-0.72.6-hermes",
                    bundlePath:
                        "/documents/ota/android/0.9.2/index.android.bundle",
                    assetRoot: "/documents/ota/android/0.9.2",
                    attempted: true,
                },
            }),
        );

        await markPendingBundleSuccessful();

        expect(fs.writeFile).toHaveBeenCalledWith(
            "/documents/ota/active.json.tmp",
            expect.stringContaining('"version":"0.9.2"'),
            "utf8",
        );
        expect(fs.writeFile).toHaveBeenCalledWith(
            "/documents/ota/active.json.tmp",
            expect.not.stringContaining('"pending"'),
            "utf8",
        );
    });
});
