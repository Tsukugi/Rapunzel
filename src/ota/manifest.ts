import { OTA_MANIFEST_SCHEMA, OTA_NATIVE_COMPATIBILITY } from "./constants";
import {
    OtaFileManifest,
    OtaManifest,
    OtaPlatform,
    OtaPlatformManifest,
} from "./interfaces";

const VERSION_PATTERN =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;
const HASH_PATTERN = /^[0-9a-f]{64}$/i;
const PLATFORMS: OtaPlatform[] = ["android", "ios"];

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(`${label} must be an object`);
    }

    return value as Record<string, unknown>;
};

const asString = (value: unknown, label: string): string => {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }

    return value;
};

const asPositiveInteger = (value: unknown, label: string): number => {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
        throw new Error(`${label} must be a positive integer`);
    }

    return value;
};

export const isSafeRelativePath = (value: string): boolean => {
    if (
        value.length === 0 ||
        value.includes("\\") ||
        value.startsWith("/") ||
        value.includes(":")
    ) {
        return false;
    }

    return value
        .split("/")
        .every(
            (segment) =>
                segment.length > 0 && segment !== "." && segment !== "..",
        );
};

const parseVersion = (
    version: string,
): {
    major: number;
    minor: number;
    patch: number;
    prerelease: string[];
} => {
    const match = version.match(VERSION_PATTERN);
    if (!match) {
        throw new Error(`Invalid version: ${version}`);
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
        prerelease: match[4] ? match[4].split(".") : [],
    };
};

const parseFile = (value: unknown, label: string): OtaFileManifest => {
    const file = asRecord(value, label);
    const path = asString(file.path, `${label}.path`);
    const url = asString(file.url, `${label}.url`);
    const sha256 = asString(file.sha256, `${label}.sha256`).toLowerCase();

    if (!isSafeRelativePath(path)) {
        throw new Error(`${label}.path must be a safe relative path`);
    }
    if (!url.startsWith("https://")) {
        throw new Error(`${label}.url must use HTTPS`);
    }
    if (!HASH_PATTERN.test(sha256)) {
        throw new Error(`${label}.sha256 must be a SHA-256 hash`);
    }

    return {
        path,
        url,
        sha256,
        bytes: asPositiveInteger(file.bytes, `${label}.bytes`),
    };
};

const parsePlatform = (
    value: unknown,
    platform: OtaPlatform,
): OtaPlatformManifest => {
    const data = asRecord(value, `platforms.${platform}`);
    const version = asString(data.version, `platforms.${platform}.version`);
    parseVersion(version);

    const nativeCompatibility = asString(
        data.nativeCompatibility,
        `platforms.${platform}.nativeCompatibility`,
    );
    if (nativeCompatibility !== OTA_NATIVE_COMPATIBILITY) {
        throw new Error(
            `platforms.${platform}.nativeCompatibility is not supported`,
        );
    }

    if (!Array.isArray(data.assets)) {
        throw new Error(`platforms.${platform}.assets must be an array`);
    }

    const assets = data.assets.map((asset, index) =>
        parseFile(asset, `platforms.${platform}.assets[${index}]`),
    );
    const paths = new Set([
        parseFile(data.bundle, `platforms.${platform}.bundle`).path,
    ]);
    assets.forEach((asset) => {
        if (paths.has(asset.path)) {
            throw new Error(`Duplicate OTA file path: ${asset.path}`);
        }
        paths.add(asset.path);
    });

    const notes = data.notes;
    if (notes !== undefined && typeof notes !== "string") {
        throw new Error(`platforms.${platform}.notes must be a string`);
    }

    return {
        version,
        nativeCompatibility,
        bundle: parseFile(data.bundle, `platforms.${platform}.bundle`),
        assets,
        ...(notes === undefined ? {} : { notes }),
    };
};

export const parseOtaManifest = (value: unknown): OtaManifest => {
    const data = asRecord(value, "manifest");
    if (data.schema !== OTA_MANIFEST_SCHEMA) {
        throw new Error(
            `Unsupported OTA manifest schema: ${String(data.schema)}`,
        );
    }

    const platformsData = asRecord(data.platforms, "platforms");
    const platforms: Partial<Record<OtaPlatform, OtaPlatformManifest>> = {};

    PLATFORMS.forEach((platform) => {
        if (platformsData[platform] !== undefined) {
            platforms[platform] = parsePlatform(
                platformsData[platform],
                platform,
            );
        }
    });

    if (Object.keys(platforms).length === 0) {
        throw new Error("OTA manifest has no supported platform");
    }

    return {
        schema: OTA_MANIFEST_SCHEMA,
        platforms,
    };
};

const comparePrerelease = (left: string[], right: string[]): number => {
    if (left.length === 0 && right.length === 0) return 0;
    if (left.length === 0) return 1;
    if (right.length === 0) return -1;

    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
        const leftPart = left[index];
        const rightPart = right[index];
        if (leftPart === undefined) return -1;
        if (rightPart === undefined) return 1;
        if (leftPart === rightPart) continue;

        const leftNumber = /^\d+$/.test(leftPart) ? Number(leftPart) : null;
        const rightNumber = /^\d+$/.test(rightPart) ? Number(rightPart) : null;
        if (leftNumber !== null && rightNumber !== null) {
            return leftNumber < rightNumber ? -1 : 1;
        }
        if (leftNumber !== null) return -1;
        if (rightNumber !== null) return 1;
        return leftPart < rightPart ? -1 : 1;
    }

    return 0;
};

export const compareVersions = (left: string, right: string): number => {
    const leftVersion = parseVersion(left);
    const rightVersion = parseVersion(right);
    for (const key of ["major", "minor", "patch"] as const) {
        if (leftVersion[key] !== rightVersion[key]) {
            return leftVersion[key] < rightVersion[key] ? -1 : 1;
        }
    }

    return comparePrerelease(leftVersion.prerelease, rightVersion.prerelease);
};

export const isNewerVersion = (current: string, candidate: string): boolean =>
    compareVersions(candidate, current) > 0;

export const getPlatformManifest = (
    manifest: OtaManifest,
    platform: OtaPlatform,
): OtaPlatformManifest | null => manifest.platforms[platform] ?? null;
