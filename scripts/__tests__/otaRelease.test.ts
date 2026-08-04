import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { afterEach, describe, expect, test } from "@jest/globals";
import { unzipSync } from "fflate";

import {
    compileAndroidBundle,
    createOtaManifest,
    getUploadFiles,
    REACT_NATIVE_RUNNER,
} from "../otaRelease";

describe("OTA release manifest", () => {
    const temporaryDirectories: string[] = [];

    afterEach(() => {
        for (const directory of temporaryDirectories.splice(0)) {
            fs.rmSync(directory, { recursive: true, force: true });
        }
    });

    test("lets Metro finish writing before the runner exits", () => {
        expect(REACT_NATIVE_RUNNER).toContain(
            "waitForBundle(args.bundleOutput).then(() => process.exit(0)",
        );
        expect(REACT_NATIVE_RUNNER).toContain(
            "Date.now() - stableSince >= 100",
        );
    });

    test("compiles Android OTA bundles to Hermes bytecode", () => {
        const root = fs.mkdtempSync(path.join(os.tmpdir(), "rapunzel-hermes-"));
        temporaryDirectories.push(root);
        const bundlePath = path.join(root, "index.android.bundle");
        fs.writeFileSync(bundlePath, "var answer = 42;");

        compileAndroidBundle(path.resolve(__dirname, "..", ".."), bundlePath);

        expect(fs.readFileSync(bundlePath).subarray(0, 4).toString("hex")).toBe(
            "c61fbc03",
        );
        expect(fs.existsSync(`${bundlePath}.hbc`)).toBe(false);
    });

    test("describes one archive per platform with release URLs and hashes", () => {
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
        fs.writeFileSync(
            path.join(root, "latest.json"),
            JSON.stringify(manifest),
        );

        expect(manifest.platforms.android.bundlePath).toBe(
            "index.android.bundle",
        );
        expect(manifest.platforms.android.archive.path).toBe(
            "Rapunzel-0.9.2.android.ota.zip",
        );
        expect(manifest.platforms.android.archive.bytes).toBeGreaterThan(0);
        expect(manifest.platforms.android.archive.url).toContain(
            "ota-android-Rapunzel-0.9.2.android.ota.zip",
        );

        const archive = unzipSync(
            new Uint8Array(
                fs.readFileSync(
                    path.join(
                        root,
                        "android",
                        "Rapunzel-0.9.2.android.ota.zip",
                    ),
                ),
            ),
        );
        expect(Object.keys(archive).sort()).toEqual([
            "drawable-mdpi/mascot.png",
            "index.android.bundle",
        ]);

        const uploadFiles = getUploadFiles(root, manifest);
        expect(
            new Set(uploadFiles.map((file) => path.basename(file))).size,
        ).toBe(uploadFiles.length);
        expect(uploadFiles).toHaveLength(3);
        expect(uploadFiles).toContain(
            path.join(
                root,
                "upload",
                "ota-android-Rapunzel-0.9.2.android.ota.zip",
            ),
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
