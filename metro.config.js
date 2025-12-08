const path = require("path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const toPlatformPath = (...segments) =>
    path.resolve(__dirname, ...segments).replace(/[/\\]+/g, "[/\\\\]");

const blockList = exclusionList([
    // Ignore native build outputs and other heavy folders to speed up Metro.
    new RegExp(`${toPlatformPath("android", "app", "build")}.*`),
    new RegExp(`${toPlatformPath("android", ".gradle")}.*`),
    new RegExp(`${toPlatformPath("ios", "Pods")}.*`),
    new RegExp(`${toPlatformPath("ios", "build")}.*`),
    new RegExp(`${toPlatformPath("coverage")}.*`),
    new RegExp(`${toPlatformPath("dist")}.*`),
    new RegExp(`${toPlatformPath("__tests__")}.*`),
]);

const config = {
    resolver: {
        blockList,
    },
    transformer: {
        // Inline requires can reduce startup time by deferring module evaluation.
        experimentalImportSupport: false,
        inlineRequires: true,
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
