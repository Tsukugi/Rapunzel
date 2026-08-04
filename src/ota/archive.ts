import { toByteArray, fromByteArray } from "base64-js";
import { unzipSync } from "fflate";
import RNFS from "react-native-fs";

import { getOtaFilePath } from "./bundleStore";
import { isSafeRelativePath } from "./manifest";
import { OtaPlatform } from "./interfaces";

const MAX_ARCHIVE_ENTRIES = 512;
const MAX_EXTRACTED_BYTES = 64 * 1024 * 1024;
const HERMES_BYTECODE_HEADER = new Uint8Array([0xc6, 0x1f, 0xbc, 0x03]);

const isHermesBytecode = (content: Uint8Array): boolean =>
    HERMES_BYTECODE_HEADER.every((byte, index) => content[index] === byte);

const ensureDirectory = async (path: string): Promise<void> => {
    if (!(await RNFS.exists(path))) {
        await RNFS.mkdir(path);
    }
};

const ensureParentDirectory = async (path: string): Promise<void> => {
    const parent = path.split("/").slice(0, -1).join("/");
    if (parent.length > 0) await ensureDirectory(parent);
};

const removeIfExists = async (path: string): Promise<void> => {
    if (await RNFS.exists(path)) {
        await RNFS.unlink(path);
    }
};

export const extractOtaArchive = async (
    archivePath: string,
    root: string,
    bundlePath: string,
    platform: OtaPlatform = "ios",
): Promise<void> => {
    if (!isSafeRelativePath(bundlePath)) {
        throw new Error(`Unsafe OTA bundle path: ${bundlePath}`);
    }

    let entries: Record<string, Uint8Array>;
    try {
        entries = unzipSync(
            toByteArray(await RNFS.readFile(archivePath, "base64")),
        );
    } catch {
        throw new Error("OTA archive is not a valid ZIP file");
    }

    const files = Object.entries(entries);
    if (files.length === 0) {
        throw new Error("OTA archive contains no files");
    }
    if (files.length > MAX_ARCHIVE_ENTRIES) {
        throw new Error("OTA archive contains too many files");
    }

    let totalBytes = 0;
    let bundleBytes = 0;
    for (const [relativePath, content] of files) {
        if (!isSafeRelativePath(relativePath)) {
            throw new Error(`Unsafe OTA archive path: ${relativePath}`);
        }

        totalBytes += content.byteLength;
        if (totalBytes > MAX_EXTRACTED_BYTES) {
            throw new Error("OTA archive expands beyond the allowed size");
        }
        if (relativePath === bundlePath) {
            bundleBytes = content.byteLength;
            if (platform === "android" && !isHermesBytecode(content)) {
                throw new Error(
                    "Android OTA bundle is not Hermes bytecode",
                );
            }
        }
    }

    if (bundleBytes === 0) {
        throw new Error("OTA archive does not contain a non-empty bundle");
    }

    for (const [relativePath, content] of files) {
        const targetPath = getOtaFilePath(root, relativePath);
        await ensureParentDirectory(targetPath);
        await removeIfExists(targetPath);
        await RNFS.writeFile(targetPath, fromByteArray(content), "base64");
    }
};
