import RNFS from "react-native-fs";
import { OTA_MANIFEST_SCHEMA, OTA_NATIVE_COMPATIBILITY } from "./constants";
import { compareVersions, isSafeRelativePath } from "./manifest";
import {
    OtaActiveRecord,
    OtaBundleReference,
    OtaFileManifest,
} from "./interfaces";

const OTA_DIRECTORY = `${RNFS.DocumentDirectoryPath}/ota`;
const ACTIVE_RECORD_PATH = `${OTA_DIRECTORY}/active.json`;
const ACTIVE_RECORD_TEMP_PATH = `${OTA_DIRECTORY}/active.json.tmp`;

const joinPath = (...parts: string[]): string => {
    const isAbsolute = /^[/\\]/.test(parts[0] ?? "");
    const joined = parts
        .map((part) => part.replace(/^[/\\]+|[/\\]+$/g, ""))
        .filter(Boolean)
        .join("/");

    return isAbsolute ? `/${joined}` : joined;
};

const isPathInside = (root: string, candidate: string): boolean => {
    const normalizedRoot = root.replace(/[/\\]+$/, "");
    return (
        candidate === normalizedRoot ||
        candidate.startsWith(`${normalizedRoot}/`)
    );
};

const getSafePath = (root: string, relativePath: string): string => {
    if (!isSafeRelativePath(relativePath)) {
        throw new Error(`Unsafe OTA path: ${relativePath}`);
    }

    const result = joinPath(root, relativePath);
    if (!isPathInside(root, result)) {
        throw new Error(`OTA path escapes its root: ${relativePath}`);
    }

    return result;
};

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

const isBundleReference = (value: unknown): value is OtaBundleReference => {
    if (typeof value !== "object" || value === null) return false;
    const reference = value as Record<string, unknown>;
    try {
        compareVersions(String(reference.version), String(reference.version));
    } catch {
        return false;
    }
    return (
        typeof reference.version === "string" &&
        typeof reference.nativeCompatibility === "string" &&
        reference.nativeCompatibility === OTA_NATIVE_COMPATIBILITY &&
        typeof reference.bundlePath === "string" &&
        typeof reference.assetRoot === "string" &&
        isPathInside(OTA_DIRECTORY, reference.bundlePath) &&
        isPathInside(OTA_DIRECTORY, reference.assetRoot)
    );
};

export const isValidOtaActiveRecord = (
    value: unknown,
): value is OtaActiveRecord => {
    if (typeof value !== "object" || value === null) return false;
    const record = value as Record<string, unknown>;
    if (
        record.schema !== OTA_MANIFEST_SCHEMA ||
        record.nativeCompatibility !== OTA_NATIVE_COMPATIBILITY
    ) {
        return false;
    }
    if (record.current !== undefined && !isBundleReference(record.current)) {
        return false;
    }
    if (record.pending !== undefined) {
        if (!isBundleReference(record.pending)) return false;
        if (
            typeof (record.pending as unknown as Record<string, unknown>)
                .attempted !== "boolean"
        ) {
            return false;
        }
    }

    return true;
};

export const readOtaActiveRecord =
    async (): Promise<OtaActiveRecord | null> => {
        if (!(await RNFS.exists(ACTIVE_RECORD_PATH))) return null;

        try {
            const value = JSON.parse(
                await RNFS.readFile(ACTIVE_RECORD_PATH, "utf8"),
            );
            return isValidOtaActiveRecord(value) ? value : null;
        } catch {
            return null;
        }
    };

export const writeOtaActiveRecord = async (
    record: OtaActiveRecord,
): Promise<void> => {
    if (!isValidOtaActiveRecord(record)) {
        throw new Error("Cannot write an invalid OTA active record");
    }

    await ensureParentDirectory(ACTIVE_RECORD_PATH);
    await removeIfExists(ACTIVE_RECORD_TEMP_PATH);
    await RNFS.writeFile(
        ACTIVE_RECORD_TEMP_PATH,
        JSON.stringify(record),
        "utf8",
    );
    await RNFS.moveFile(ACTIVE_RECORD_TEMP_PATH, ACTIVE_RECORD_PATH);
};

export const createBundleReference = (
    root: string,
    manifest: { version: string; nativeCompatibility: string },
    bundle: OtaFileManifest,
): OtaBundleReference => ({
    version: manifest.version,
    nativeCompatibility: manifest.nativeCompatibility,
    bundlePath: getSafePath(root, bundle.path),
    assetRoot: root,
});

export const getOtaPaths = () => ({
    otaDirectory: OTA_DIRECTORY,
    activeRecordPath: ACTIVE_RECORD_PATH,
});

export const getOtaReleaseRoot = (
    platform: "android" | "ios",
    version: string,
): string => getSafePath(OTA_DIRECTORY, `${platform}/${version}`);

export const getOtaFilePath = (root: string, relativePath: string): string =>
    getSafePath(root, relativePath);

export const activatePendingBundle = async (
    reference: OtaBundleReference,
): Promise<void> => {
    const current = await readOtaActiveRecord();
    await writeOtaActiveRecord({
        schema: OTA_MANIFEST_SCHEMA,
        nativeCompatibility: OTA_NATIVE_COMPATIBILITY,
        ...(current?.current ? { current: current.current } : {}),
        pending: {
            ...reference,
            attempted: false,
        },
    });
};

export const markPendingBundleSuccessful = async (): Promise<void> => {
    const current = await readOtaActiveRecord();
    if (!current?.pending) return;

    const reference: OtaBundleReference = {
        version: current.pending.version,
        nativeCompatibility: current.pending.nativeCompatibility,
        bundlePath: current.pending.bundlePath,
        assetRoot: current.pending.assetRoot,
    };
    await writeOtaActiveRecord({
        schema: OTA_MANIFEST_SCHEMA,
        nativeCompatibility: OTA_NATIVE_COMPATIBILITY,
        current: reference,
    });
};

export const downloadAndVerifyOtaFile = async (
    file: OtaFileManifest,
    targetPath: string,
    onProgress?: (bytesWritten: number, contentLength: number) => void,
): Promise<void> => {
    await ensureParentDirectory(targetPath);
    await removeIfExists(targetPath);

    const download = RNFS.downloadFile({
        fromUrl: file.url,
        toFile: targetPath,
        progressDivider: 1,
        progress: (progress) =>
            onProgress?.(progress.bytesWritten, progress.contentLength),
    });
    const result = await download.promise;
    if (result.statusCode < 200 || result.statusCode >= 300) {
        throw new Error(`OTA download failed with HTTP ${result.statusCode}`);
    }

    const stat = await RNFS.stat(targetPath);
    if (Number(stat.size) !== file.bytes) {
        throw new Error(`OTA file size mismatch for ${file.path}`);
    }

    const hash = (await RNFS.hash(targetPath, "sha256")).toLowerCase();
    if (hash !== file.sha256) {
        throw new Error(`OTA SHA-256 mismatch for ${file.path}`);
    }
};
