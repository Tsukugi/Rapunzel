import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { afterEach, describe, expect, test } from "@jest/globals";

import { createOtaManifest } from "../otaRelease";

describe("OTA release manifest", () => {
    const temporaryDirectories: string[] = [];

    afterEach(() => {
        for (const directory of temporaryDirectories.splice(0)) {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    test("describes bundles and assets with release URLs and hashes", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "rapunzel-ota-"));
        temporaryDirectories.push(root);
        fs.mkdirSync(path.join(root, "android"), { recursive: true });
        fs.mkdirSync(path.join(root, "android", "drawable-mdpi"));
        fs.mkdirSync(path.join(root, "ios"), { recursive: true });
        fs.writeFileSync(
            path.join(root, "android", "index.android.bundle"),
            "android",
        );
        fs.writeFileSync(
            path.join(root, "android", "drawable-mdpi", "mascot.png"),
            "asset",
        );
        fs.writeFileSync(path.join(root, "ios", "main.jsbundle"), "ios");

        const manifest = createOtaManifest(root, "0.9.2");

        expect(manifest.platforms.android.bundle.bytes).toBe(7);
        expect(manifest.platforms.android.bundle.sha256).toBe(
            "f60ed56a9c8275894022fe5a7a1625c33bdb55b729bb4e38962af4d1613eda25",
        );
        expect(manifest.platforms.android.assets[0].path).toBe(
            "drawable-mdpi/mascot.png",
        );
        expect(manifest.platforms.android.assets[0].url).toContain(
            "ota-android-drawable-mdpi--mascot.png",
        );
    });

    test("requires both platform bundles", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "rapunzel-ota-"));
        temporaryDirectories.push(root);
        fs.mkdirSync(path.join(root, "android"), { recursive: true });
        fs.writeFileSync(
            path.join(root, "android", "index.android.bundle"),
            "android",
        );

        expect(() => createOtaManifest(root, "0.9.2")).toThrow(
            "Missing ios OTA bundle",
        );
    });
});
