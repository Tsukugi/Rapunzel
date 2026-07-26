import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface PackageJson {
    version: string;
    [key: string]: any;
}

interface AndroidBuildConfig {
    versionName: string;
    versionCode: number;
    [key: string]: any;
}

export class ReleaseAutomation {
    private projectRoot: string;
    private buildsDir: string;

    constructor() {
        this.projectRoot = path.resolve(__dirname, "..");
        this.buildsDir = path.join(this.projectRoot, "builds");
    }

    public async run(version?: string, doGitHubRelease: boolean = false): Promise<void> {
        try {
            console.log("🤖 Starting Rapunzel release automation process...");

            // Create builds directory if it doesn't exist
            this.createBuildsDirectory();

            // Determine version to use
            const targetVersion = version || this.getCurrentVersion();
            console.log(`📦 Target version: ${targetVersion}`);

            // Update package.json with new version
            this.updatePackageJsonVersion(targetVersion);

            // Update Android build.gradle with new version
            this.updateAndroidVersion(targetVersion);

            // Build the release APK
            this.buildReleaseAPK();

            // Move the APK to builds folder with proper naming
            this.moveAPKToBuildsFolder(targetVersion);

            // Commit and push the generated artifacts so the release leaves the repo clean
            this.stageReleaseChanges(targetVersion);
            const committed = this.commitReleaseChanges(targetVersion);
            if (committed) {
                this.pushReleaseChanges();
            } else {
                console.log("ℹ️ No release changes to push");
            }

            // If GitHub release is requested, run the GitHub release script
            if (doGitHubRelease) {
                await this.runGitHubReleaseScript(targetVersion);
            }

            console.log("✅ Release process completed successfully!");
            console.log(
                ` apk is located at: ${path.join(
                    this.buildsDir,
                    `Rapunzel-${targetVersion}.apk`,
                )}`,
            );
        } catch (error) {
            console.error("❌ Release process failed:", error);
            process.exit(1);
        }
    }

    private createBuildsDirectory(): void {
        if (!fs.existsSync(this.buildsDir)) {
            fs.mkdirSync(this.buildsDir);
            console.log("📁 Created builds directory");
        }
    }

    private getCurrentVersion(): string {
        const packageJsonPath = path.join(this.projectRoot, "package.json");
        const packageJson: PackageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf8"),
        );
        return packageJson.version;
    }

    private updatePackageJsonVersion(version: string): void {
        const packageJsonPath = path.join(this.projectRoot, "package.json");
        const packageJson: PackageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf8"),
        );

        console.log(
            `🔄 Updating package.json version from ${packageJson.version} to ${version}`,
        );

        packageJson.version = version;
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        this.updatePackageLockVersion(version);

        console.log("✅ Updated package.json version");
    }

    private updatePackageLockVersion(version: string): void {
        const packageLockPath = path.join(this.projectRoot, "package-lock.json");
        if (!fs.existsSync(packageLockPath)) return;

        const packageLock = JSON.parse(
            fs.readFileSync(packageLockPath, "utf8"),
        );
        packageLock.version = version;
        if (packageLock.packages?.[""]) {
            packageLock.packages[""].version = version;
        }

        fs.writeFileSync(
            packageLockPath,
            JSON.stringify(packageLock, null, 2),
        );
    }

    private updateAndroidVersion(version: string): void {
        const buildGradlePath = path.join(
            this.projectRoot,
            "android",
            "app",
            "build.gradle",
        );
        let buildGradleContent = fs.readFileSync(buildGradlePath, "utf8");

        // Extract the current versionName
        const versionNameRegex = /versionName\s+"([^"]+)"/;
        const currentVersionMatch = buildGradleContent.match(versionNameRegex);
        if (!currentVersionMatch) {
            throw new Error("Could not find versionName in build.gradle");
        }

        // Extract the current versionCode
        const versionCodeRegex = /versionCode\s+(\d+)/;
        const currentCodeMatch = buildGradleContent.match(versionCodeRegex);
        if (!currentCodeMatch) {
            throw new Error("Could not find versionCode in build.gradle");
        }

        const currentVersion = currentVersionMatch[1];
        const currentCode = parseInt(currentCodeMatch[1], 10);
        const newCode = currentCode + 1;  // Increment versionCode by 1

        console.log(
            `🔄 Updating Android build.gradle versionName from ${currentVersion} to ${version} and versionCode from ${currentCode} to ${newCode}`,
        );

        // Replace the versionName
        buildGradleContent = buildGradleContent.replace(
            versionNameRegex,
            `versionName "${version}"`,
        );

        // Replace the versionCode
        buildGradleContent = buildGradleContent.replace(
            versionCodeRegex,
            `versionCode ${newCode}`,
        );

        fs.writeFileSync(buildGradlePath, buildGradleContent);

        console.log("✅ Updated Android build.gradle version");
    }

    private stageReleaseChanges(version: string): string[] {
        console.log("🗂️ Staging release artifacts...");
        const gitPath = (...segments: string[]) =>
            path.join(...segments).replace(/\\/g, "/");
        const releaseFiles = [
            "package.json",
            "package-lock.json",
            gitPath("android", "app", "build.gradle"),
        ];

        const existingFiles = releaseFiles
            .map((relativePath) => ({
                relativePath,
                absolutePath: path.join(this.projectRoot, relativePath),
            }))
            .filter(({ absolutePath }) => fs.existsSync(absolutePath))
            .map(({ relativePath }) => relativePath);

        if (existingFiles.length === 0) {
            console.log("ℹ️ No release files found to stage");
            return [];
        }

        const addCommand = `git add ${existingFiles
            .map((file) => `"${file}"`)
            .join(" ")}`;

        execSync(addCommand, { cwd: this.projectRoot, stdio: "inherit" });
        return existingFiles;
    }

    private commitReleaseChanges(version: string): boolean {
        if (!this.hasStagedChanges()) {
            console.log("ℹ️ No staged changes to commit");
            return false;
        }

        const commitMessage = `chore(release): v${version}`;
        execSync(`git commit -m "${commitMessage}"`, {
            cwd: this.projectRoot,
            stdio: "inherit",
        });
        console.log("✅ Release changes committed");
        return true;
    }

    private pushReleaseChanges(): void {
        console.log("📤 Pushing release commit to remote...");
        execSync("git push", { cwd: this.projectRoot, stdio: "inherit" });
        console.log("✅ Release changes pushed");
    }

    private hasStagedChanges(): boolean {
        try {
            execSync("git diff --cached --quiet", {
                cwd: this.projectRoot,
                stdio: "ignore",
            });
            return false;
        } catch {
            return true;
        }
    }

    private buildReleaseAPK(): void {
        console.log("🔨 Building release APK...");

        // Change to android directory and run gradle build
        const androidDir = path.join(this.projectRoot, "android");

        try {
            // Run the gradle assembleRelease command
            const gradleCommand =
                process.platform === "win32" ? "gradlew.bat" : "./gradlew";
            execSync(`${gradleCommand} assembleRelease`, {
                cwd: androidDir,
                stdio: "inherit",
                env: { ...process.env },
            });

            console.log("✅ Release APK built successfully");
        } catch (error) {
            throw new Error(`Failed to build APK: ${error}`);
        }
    }

    private moveAPKToBuildsFolder(version: string): void {
        // Source APK path
        const sourceAPKPath = path.join(
            this.projectRoot,
            "android",
            "app",
            "build",
            "outputs",
            "apk",
            "release",
            "app-release.apk",
        );

        // Destination APK path
        const destinationAPKPath = path.join(
            this.buildsDir,
            `Rapunzel-${version}.apk`,
        );

        if (!fs.existsSync(sourceAPKPath)) {
            throw new Error(`APK file not found at ${sourceAPKPath}`);
        }

        console.log(
            `🚚 Moving APK from ${sourceAPKPath} to ${destinationAPKPath}`,
        );

        // Move the APK to the builds directory with the new name
        fs.renameSync(sourceAPKPath, destinationAPKPath);

        console.log("✅ APK moved to builds folder with proper naming");
    }

    private async runGitHubReleaseScript(version: string): Promise<void> {
        console.log("🚀 Running GitHub release script...");

        // Execute the GitHub release script with the current version
        const scriptPath = path.join(this.projectRoot, "scripts", "release-github.ts");
        const cmd = `ts-node ${scriptPath} --version ${version}`;

        try {
            execSync(cmd, { stdio: "inherit", cwd: this.projectRoot });
            console.log("✅ GitHub release completed successfully!");
        } catch (error) {
            throw new Error(`Failed to run GitHub release script: ${error}`);
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
let version: string = "";
let doGitHubRelease: boolean = false;

// Check for help flag first
if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npm run release -- [options]

Options:
  --version, -v <version>      Set the version to release (e.g., 0.8.3)
  --github, -g                 Also create a GitHub release after building APK
  --help, -h                   Show this help message
  (the script will git add/commit/push release files automatically)

Examples:
  npm run release -- --version 0.8.3              # Build APK only
  npm run release -- -v 0.8.3 -g                  # Build APK and create GitHub release
  npm run release                                 # Uses current version from package.json
    `);
    process.exit(0);
}

// Look for version in --version or -v flags and check for github flag
for (let i = 0; i < args.length; i++) {
    if (args[i] === "--version" || args[i] === "-v") {
        version = args[i + 1];
        i++; // Skip next argument
    } else if (args[i] === "--github" || args[i] === "-g") {
        doGitHubRelease = true;
    }
}

// Only run the main process if this file is executed directly (not imported)
if (require.main === module) {
    // Run the release automation
    const releaseAutomation = new ReleaseAutomation();
    releaseAutomation.run(version, doGitHubRelease).catch((error) => {
        console.error("Release automation failed:", error);
        process.exit(1);
    });
}
