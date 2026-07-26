import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { execFileSync } from "child_process";
import {
    OTA_MANIFEST_SCHEMA,
    OTA_NATIVE_COMPATIBILITY,
} from "../src/ota/constants";

const REPOSITORY = "Tsukugi/Rapunzel";
const VERSION_PATTERN =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

interface OtaFile {
    path: string;
    url: string;
    sha256: string;
    bytes: number;
}

interface OtaPlatform {
    version: string;
    nativeCompatibility: string;
    bundle: OtaFile;
    assets: OtaFile[];
    notes?: string;
}

export interface OtaManifest {
    schema: 1;
    platforms: {
        android: OtaPlatform;
        ios: OtaPlatform;
    };
}

const getAssetName = (platform: string, relativePath: string): string =>
    `ota-${platform}-${relativePath.replace(/[\\/]/g, "--")}`;

const REACT_NATIVE_RUNNER = [
    'const cli = require("@react-native-community/cli");',
    'const metro = require("@react-native-community/cli-plugin-metro");',
    "const args = JSON.parse(process.argv[1]);",
    "Promise.resolve(cli.loadConfig()).then((context) => metro.loadMetroConfig(context, args)).then((config) => metro.buildBundleWithConfig(args, config)).then(() => process.exit(0), (error) => {",
    "  console.error(error);",
    "  process.exit(1);",
    "});",
].join(" ");

const listFiles = (directory: string): string[] => {
    const files: string[] = [];
    const visit = (currentDirectory: string) => {
        for (const entry of fs.readdirSync(currentDirectory, {
            withFileTypes: true,
        })) {
            const entryPath = path.join(currentDirectory, entry.name);
            if (entry.isDirectory()) {
                visit(entryPath);
            } else if (entry.isFile()) {
                files.push(entryPath);
            }
        }
    };

    visit(directory);
    return files.sort();
};

const describeFile = (
    platform: string,
    directory: string,
    filePath: string,
    tag: string,
): OtaFile => {
    const relativePath = path.relative(directory, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath);
    return {
        path: relativePath,
        url: `https://github.com/${REPOSITORY}/releases/download/${tag}/${getAssetName(
            platform,
            relativePath,
        )}`,
        sha256: crypto.createHash("sha256").update(content).digest("hex"),
        bytes: content.byteLength,
    };
};

const buildPlatformManifest = (
    platform: "android" | "ios",
    directory: string,
    bundleName: string,
    version: string,
    tag: string,
    notes?: string,
): OtaPlatform => {
    const bundlePath = path.join(directory, bundleName);
    if (!fs.existsSync(bundlePath)) {
        throw new Error(`Missing ${platform} OTA bundle: ${bundlePath}`);
    }

    const files = listFiles(directory);
    const bundle = describeFile(platform, directory, bundlePath, tag);
    const assets = files
        .filter((filePath) => filePath !== bundlePath)
        .map((filePath) => describeFile(platform, directory, filePath, tag));

    return {
        version,
        nativeCompatibility: OTA_NATIVE_COMPATIBILITY,
        bundle,
        assets,
        ...(notes === undefined ? {} : { notes }),
    };
};

export const createOtaManifest = (
    releaseRoot: string,
    version: string,
    tag = `v${version}`,
    notes?: string,
): OtaManifest => {
    if (!VERSION_PATTERN.test(version)) {
        throw new Error(`Invalid OTA version: ${version}`);
    }

    return {
        schema: OTA_MANIFEST_SCHEMA,
        platforms: {
            android: buildPlatformManifest(
                "android",
                path.join(releaseRoot, "android"),
                "index.android.bundle",
                version,
                tag,
                notes,
            ),
            ios: buildPlatformManifest(
                "ios",
                path.join(releaseRoot, "ios"),
                "main.jsbundle",
                version,
                tag,
                notes,
            ),
        },
    };
};

const buildBundle = (
    projectRoot: string,
    platform: "android" | "ios",
    outputDirectory: string,
): void => {
    fs.mkdirSync(outputDirectory, { recursive: true });
    const bundleOutput = path.join(
        outputDirectory,
        platform === "android" ? "index.android.bundle" : "main.jsbundle",
    );
    const bundleArgs = {
        assetsDest: outputDirectory,
        bundleEncoding: "utf8",
        bundleOutput,
        dev: false,
        entryFile: "index.js",
        generateStaticViewConfigs: true,
        maxWorkers: 1,
        minify: true,
        platform,
        resetCache: false,
        resetGlobalCache: false,
        sourcemapUseAbsolutePath: false,
        unstableTransformProfile: "default",
    };
    execFileSync(
        process.execPath,
        ["-e", REACT_NATIVE_RUNNER, JSON.stringify(bundleArgs)],
        { cwd: projectRoot, stdio: "inherit" },
    );
};

export const getUploadFiles = (
    releaseRoot: string,
    manifest: OtaManifest,
): string[] => {
    const uploadRoot = path.join(releaseRoot, "upload");
    fs.rmSync(uploadRoot, { recursive: true, force: true });
    fs.mkdirSync(uploadRoot, { recursive: true });

    const manifestSource = path.join(releaseRoot, "latest.json");
    const manifestTarget = path.join(uploadRoot, "latest.json");
    fs.copyFileSync(manifestSource, manifestTarget);
    const files = [manifestTarget];
    for (const [platform, platformManifest] of Object.entries(
        manifest.platforms,
    )) {
        const platformRoot = path.join(releaseRoot, platform);
        for (const file of [
            platformManifest.bundle,
            ...platformManifest.assets,
        ]) {
            const localPath = path.join(platformRoot, file.path);
            const assetName = getAssetName(platform, file.path);
            const uploadPath = path.join(uploadRoot, assetName);
            fs.copyFileSync(localPath, uploadPath);
            files.push(uploadPath);
        }
    }
    return files;
};

export class OtaReleaseAutomation {
    private readonly projectRoot: string;
    private readonly buildsDirectory: string;

    constructor(projectRoot = path.resolve(__dirname, "..")) {
        this.projectRoot = projectRoot;
        this.buildsDirectory = path.join(projectRoot, "builds", "ota");
    }

    public build(
        version: string,
        tag = `v${version}`,
        notes?: string,
    ): OtaManifest {
        const releaseRoot = path.join(this.buildsDirectory, version);
        fs.rmSync(releaseRoot, { recursive: true, force: true });
        buildBundle(
            this.projectRoot,
            "android",
            path.join(releaseRoot, "android"),
        );
        buildBundle(this.projectRoot, "ios", path.join(releaseRoot, "ios"));

        const manifest = createOtaManifest(releaseRoot, version, tag, notes);
        fs.writeFileSync(
            path.join(releaseRoot, "latest.json"),
            `${JSON.stringify(manifest, null, 2)}\n`,
            "utf8",
        );
        return manifest;
    }

    public upload(version: string, tag = `v${version}`): void {
        const releaseRoot = path.join(this.buildsDirectory, version);
        const manifestPath = path.join(releaseRoot, "latest.json");
        if (!fs.existsSync(manifestPath)) {
            throw new Error(
                `Missing OTA manifest: ${manifestPath}. Build it first.`,
            );
        }

        const manifest = JSON.parse(
            fs.readFileSync(manifestPath, "utf8"),
        ) as OtaManifest;
        execFileSync(
            process.platform === "win32" ? "gh.exe" : "gh",
            [
                "release",
                "upload",
                tag,
                ...getUploadFiles(releaseRoot, manifest),
                "--clobber",
            ],
            { cwd: this.projectRoot, stdio: "inherit" },
        );
    }
}

const getArgument = (args: string[], name: string): string | undefined => {
    const index = args.indexOf(name);
    return index === -1 ? undefined : args[index + 1];
};

const printHelp = () => {
    console.log(`
Usage: npm run ota-release -- --version <version> [--tag <tag>] [--notes <text>] [--upload]

Builds Android and iOS React Native bundles, writes latest.json, and optionally
uploads the files to an existing GitHub release. This does not build or install an APK.
`);
};

if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.includes("--help") || args.includes("-h")) {
        printHelp();
        process.exit(0);
    }

    const version = getArgument(args, "--version") ?? getArgument(args, "-v");
    if (version === undefined) {
        printHelp();
        process.exit(1);
    }

    try {
        const automation = new OtaReleaseAutomation();
        const tag = getArgument(args, "--tag") ?? `v${version}`;
        automation.build(version, tag, getArgument(args, "--notes"));
        if (args.includes("--upload")) {
            automation.upload(version, tag);
        }
    } catch (error) {
        console.error("OTA release failed:", error);
        process.exit(1);
    }
}
