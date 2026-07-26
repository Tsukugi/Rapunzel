import { Platform } from "react-native";

import { OTA_BUILD_VERSION, OTA_MANIFEST_URL } from "./constants";
import {
    downloadAndVerifyOtaFile,
    activatePendingBundle,
    createBundleReference,
    getOtaFilePath,
    getOtaReleaseRoot,
    readOtaActiveRecord,
} from "./bundleStore";
import {
    compareVersions,
    getPlatformManifest,
    isNewerVersion,
    parseOtaManifest,
} from "./manifest";
import {
    OtaFileManifest,
    OtaManifest,
    OtaPlatform,
    OtaPlatformManifest,
    OtaBundleReference,
} from "./interfaces";

export interface OtaUpdate {
    manifest: OtaManifest;
    platform: OtaPlatform;
    platformManifest: OtaPlatformManifest;
    currentVersion: string;
}

export interface OtaDownloadProgress {
    file: string;
    fileIndex: number;
    fileCount: number;
    bytesWritten: number;
    contentLength: number;
}

const getCurrentPlatform = (): OtaPlatform | null => {
    if (Platform.OS === "android" || Platform.OS === "ios") {
        return Platform.OS;
    }

    return null;
};

const fetchManifest = async (): Promise<OtaManifest> => {
    const response = await fetch(OTA_MANIFEST_URL, {
        headers: { "Cache-Control": "no-cache" },
    });
    if (!response.ok) {
        throw new Error(
            `OTA manifest request failed with HTTP ${response.status}`,
        );
    }

    return parseOtaManifest(await response.json());
};

export const checkForOtaUpdate = async (
    platform: OtaPlatform | null = getCurrentPlatform(),
): Promise<OtaUpdate | null> => {
    if (platform === null) return null;

    const manifest = await fetchManifest();
    const platformManifest = getPlatformManifest(manifest, platform);
    if (platformManifest === null) return null;

    const active = await readOtaActiveRecord();
    const currentVersion =
        active?.current?.version !== undefined &&
        compareVersions(active.current.version, OTA_BUILD_VERSION) > 0
            ? active.current.version
            : OTA_BUILD_VERSION;
    if (!isNewerVersion(currentVersion, platformManifest.version)) return null;

    return { manifest, platform, platformManifest, currentVersion };
};

const downloadFile = async (
    file: OtaFileManifest,
    root: string,
    fileIndex: number,
    fileCount: number,
    onProgress?: (progress: OtaDownloadProgress) => void,
): Promise<void> => {
    await downloadAndVerifyOtaFile(
        file,
        getOtaFilePath(root, file.path),
        (bytesWritten, contentLength) =>
            onProgress?.({
                file: file.path,
                fileIndex,
                fileCount,
                bytesWritten,
                contentLength,
            }),
    );
};

export const downloadOtaUpdate = async (
    update: OtaUpdate,
    onProgress?: (progress: OtaDownloadProgress) => void,
): Promise<OtaBundleReference> => {
    const root = getOtaReleaseRoot(
        update.platform,
        update.platformManifest.version,
    );
    const files = [
        update.platformManifest.bundle,
        ...update.platformManifest.assets,
    ];

    for (const [index, file] of files.entries()) {
        await downloadFile(file, root, index + 1, files.length, onProgress);
    }

    const reference = createBundleReference(
        root,
        update.platformManifest,
        update.platformManifest.bundle,
    );
    await activatePendingBundle(reference);
    return reference;
};
