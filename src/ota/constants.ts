import packageJson from "../../package.json";

export const OTA_MANIFEST_SCHEMA = 2 as const;
export const OTA_ACTIVE_RECORD_SCHEMA = 1 as const;
export const OTA_NATIVE_COMPATIBILITY = "rn-0.72.6-hermes";
export const OTA_MANIFEST_URL =
    "https://github.com/Tsukugi/Rapunzel/releases/latest/download/latest.json";
export const OTA_BUILD_VERSION = packageJson.version;
