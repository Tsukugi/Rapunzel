import { describe, expect, test } from "@jest/globals";
import {
    compareVersions,
    getPlatformManifest,
    isNewerVersion,
    parseOtaManifest,
} from "../src/ota/manifest";

const hash = "a".repeat(64);

const validManifest = {
    schema: 1,
    platforms: {
        android: {
            version: "0.9.2",
            nativeCompatibility: "rn-0.72.6-hermes",
            bundle: {
                path: "index.android.bundle",
                url: "https://example.com/index.android.bundle",
                sha256: hash,
                bytes: 100,
            },
            assets: [
                {
                    path: "drawable-mdpi/assets_mascot.png",
                    url: "https://example.com/assets_mascot.png",
                    sha256: hash,
                    bytes: 20,
                },
            ],
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
                        bundle: {
                            ...validManifest.platforms.android.bundle,
                            path: "../bundle",
                            url: "http://example.com/bundle",
                        },
                    },
                },
            }),
        ).toThrow();
    });

    test("rejects duplicate asset paths", () => {
        expect(() =>
            parseOtaManifest({
                ...validManifest,
                platforms: {
                    android: {
                        ...validManifest.platforms.android,
                        assets: [
                            validManifest.platforms.android.assets[0],
                            validManifest.platforms.android.assets[0],
                        ],
                    },
                },
            }),
        ).toThrow("Duplicate OTA file path");
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
