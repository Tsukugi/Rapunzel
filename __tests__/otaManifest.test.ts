import { describe, expect, test } from "@jest/globals";
import {
    compareVersions,
    getPlatformManifest,
    isNewerVersion,
    parseOtaManifest,
} from "../src/ota/manifest";

const hash = "a".repeat(64);

const validManifest = {
    schema: 2,
    platforms: {
        android: {
            version: "0.9.2",
            nativeCompatibility: "rn-0.72.6-hermes",
            archive: {
                path: "Rapunzel-0.9.2.android.ota.zip",
                url: "https://example.com/index.android.bundle",
                sha256: hash,
                bytes: 100,
            },
            bundlePath: "index.android.bundle",
        },
    },
};

describe("OTA manifest", () => {
    test("parses a valid platform manifest", () => {
        const manifest = parseOtaManifest(validManifest);

        expect(getPlatformManifest(manifest, "android")?.version).toBe("0.9.2");
    });

    test("rejects insecure URLs and unsafe paths", () => {
        expect(() =>
            parseOtaManifest({
                ...validManifest,
                platforms: {
                    android: {
                        ...validManifest.platforms.android,
                        archive: {
                            ...validManifest.platforms.android.archive,
                            path: "../archive.zip",
                            url: "http://example.com/bundle",
                        },
                    },
                },
            }),
        ).toThrow();
    });

    test("rejects an unsafe extracted bundle path", () => {
        expect(() =>
            parseOtaManifest({
                ...validManifest,
                platforms: {
                    android: {
                        ...validManifest.platforms.android,
                        bundlePath: "../index.android.bundle",
                    },
                },
            }),
        ).toThrow("bundlePath must be a safe relative path");
    });
});

describe("OTA version comparison", () => {
    test("compares release versions", () => {
        expect(compareVersions("0.9.2", "0.9.1")).toBe(1);
        expect(compareVersions("0.9.1", "0.9.1")).toBe(0);
        expect(compareVersions("0.9.1", "0.9.2")).toBe(-1);
    });

    test("sorts prereleases before releases", () => {
        expect(compareVersions("1.0.0-beta.2", "1.0.0-beta.10")).toBe(-1);
        expect(compareVersions("1.0.0-beta.1", "1.0.0")).toBe(-1);
    });

    test("detects only newer candidates", () => {
        expect(isNewerVersion("0.9.1", "0.9.2")).toBe(true);
        expect(isNewerVersion("0.9.1", "0.9.1")).toBe(false);
        expect(isNewerVersion("0.9.1", "0.9.0")).toBe(false);
    });
});
