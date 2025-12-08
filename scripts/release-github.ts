import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface PackageJson {
    version: string;
    [key: string]: any;
}

export class GitHubReleaseAutomation {
    private projectRoot: string;
    private buildsDir: string;

    constructor() {
        this.projectRoot = path.resolve(__dirname, "..");
        this.buildsDir = path.join(this.projectRoot, "builds");
    }

    public async run(version?: string, tagName?: string, releaseTitle?: string, notes?: string): Promise<void> {
        try {
            console.log("🤖 Starting GitHub release automation process...");

            // Determine version to use
            const targetVersion = version || this.getCurrentVersion();
            console.log(`📦 Target version: ${targetVersion}`);

            // Create or check for the APK file
            const apkPath = path.join(this.buildsDir, `Rapunzel-${targetVersion}.apk`);
            if (!fs.existsSync(apkPath)) {
                throw new Error(`APK file not found at ${apkPath}. Please build the APK first.`);
            }

            // Prepare release details
            const tag = tagName || `v${targetVersion}`;
            const title = releaseTitle || `Release v${targetVersion}`;

            // If notes are not provided, generate them from commit messages
            let releaseNotes = notes || await this.generateReleaseNotes(tag);

            console.log(`📝 Creating GitHub release with tag: ${tag}`);
            console.log(`📝 Title: ${title}`);
            console.log(`📝 Notes: ${releaseNotes}`);

            // Check if GitHub CLI is installed
            this.checkGitHubCLI();

            // Create the GitHub release and upload the APK
            this.createGitHubRelease(tag, title, releaseNotes, apkPath);

            console.log(`✅ GitHub release created successfully!`);
            console.log(`🔗 Release URL: https://github.com/<owner>/<repo>/releases/tag/${tag}`);
        } catch (error) {
            console.error("❌ GitHub release process failed:", error);
            process.exit(1);
        }
    }

    private getCurrentVersion(): string {
        const packageJsonPath = path.join(this.projectRoot, "package.json");
        const packageJson: PackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        return packageJson.version;
    }

    private async generateReleaseNotes(currentTag: string): Promise<string> {
        console.log("📝 Generating release notes from commit messages...");

        try {
            // Find the tag of the previous release
            let previousTag = '';
            try {
                // Get the previous tag before the current one
                const tagsResult = execSync('git tag --sort=-v:refname', { encoding: 'utf8' });
                const tags = tagsResult.trim().split('\n').filter(Boolean);

                if (tags.length > 0) {
                    // Find the current tag and get the one before it
                    const currentIndex = tags.indexOf(currentTag.replace('v', '')); // Try without 'v' prefix
                    const currentIndexWithV = tags.indexOf(currentTag); // Try with 'v' prefix
                    const actualIndex = currentIndex !== -1 ? currentIndex : currentIndexWithV;

                    if (actualIndex > 0) {
                        previousTag = tags[actualIndex - 1];
                    } else if (currentIndex === 0 || currentIndexWithV === 0) {
                        // If current tag is the latest, we'll use the second tag as previous
                        previousTag = tags.length > 1 ? tags[1] : '';
                    }
                }

                // If we couldn't find a previous tag with the exact current tag name,
                // search for it in a more flexible way
                if (!previousTag && tags.length > 0) {
                    const currentVersion = currentTag.startsWith('v') ? currentTag.substring(1) : currentTag;
                    const currentIndex = tags.findIndex(tag => tag === currentTag || tag === currentVersion);
                    if (currentIndex > 0) {
                        previousTag = tags[currentIndex - 1];
                    } else if (tags.length > 0 && !tags.includes(currentTag)) {
                        // If the current tag doesn't exist yet, use the latest existing tag
                        previousTag = tags[0];
                    }
                }
            } catch (e) {
                console.log("⚠️  Could not determine previous tag, using initial commit for release notes");
            }

            // Get commit messages between previous tag and current state
            let commitRange = '';
            if (previousTag) {
                commitRange = `${previousTag}..HEAD`;
            } else {
                // If no previous tag, get all commits
                commitRange = 'HEAD';
            }

            let commits = '';
            if (previousTag) {
                try {
                    commits = execSync(`git log ${commitRange} --oneline --first-parent`, { encoding: 'utf8' });
                } catch (e) {
                    // If the tag doesn't exist yet (we're creating a new release), use a different approach
                    commits = execSync('git log --oneline -20', { encoding: 'utf8' }); // Last 20 commits
                }
            } else {
                commits = execSync('git log --oneline -20', { encoding: 'utf8' }); // Last 20 commits
            }

            // Format commits for release notes
            if (commits.trim()) {
                const commitLines = commits.trim().split('\n').filter(line => line.trim());
                const formattedCommits = commitLines.map(commit => `- ${commit.trim()}`).join('\n');
                return `## Changes in this release\n\n${formattedCommits}`;
            } else {
                return `## Release v${currentTag.replace('v', '')}\n\nAutomated release with commit history.`;
            }
        } catch (error) {
            console.error("⚠️  Could not generate release notes from commits, using default notes:", error);
            return `Release version ${currentTag.replace('v', '')}`;
        }
    }

    private checkGitHubCLI(): void {
        try {
            execSync("gh --version", { stdio: "pipe" });
            console.log("✅ GitHub CLI is installed");
        } catch (error) {
            throw new Error("GitHub CLI is not installed. Please install it from https://cli.github.com/");
        }
    }

    private createGitHubRelease(tag: string, title: string, notes: string, apkPath: string): void {
        console.log("🚀 Creating GitHub release...");

        try {
            // Create the release with the APK asset
            const cmd = `gh release create ${tag} -t "${title}" -n "${notes}" --draft=false "${apkPath}"`;
            execSync(cmd, { stdio: "inherit", cwd: this.projectRoot });
        } catch (error) {
            throw new Error(`Failed to create GitHub release: ${error}`);
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
let version: string | null = null;
let tagName: string | null = null;
let releaseTitle: string | null = null;
let releaseNotes: string | null = null;

// Check for help flag first
if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: npm run release-github -- [options]

Options:
  --version, -v <version>      Set the version to release (e.g., 0.8.3)
  --tag, -t <tag>              Set the git tag for the release (default: v<version>)
  --title, -T <title>          Set the release title (default: Release v<version>)
  --notes, -n <notes>          Set the release notes (default: auto-generated from commits)
  --help, -h                   Show this help message

Examples:
  npm run release-github -- --version 0.8.3
  npm run release-github -- -v 0.8.3 -t "v0.8.3-stable" -T "Stable Release 0.8.3"
  npm run release-github -- --version 0.8.3 --notes "Custom release notes"
    `);
    process.exit(0);
}

// Parse arguments
for (let i = 0; i < args.length; i++) {
    if (args[i] === "--version" || args[i] === "-v") {
        version = args[i + 1];
        i++; // Skip next argument
    } else if (args[i] === "--tag" || args[i] === "-t") {
        tagName = args[i + 1];
        i++; // Skip next argument
    } else if (args[i] === "--title" || args[i] === "-T") {
        releaseTitle = args[i + 1];
        i++; // Skip next argument
    } else if (args[i] === "--notes" || args[i] === "-n") {
        releaseNotes = args[i + 1];
        i++; // Skip next argument
    }
}

// Only run the main process if this file is executed directly (not imported)
if (require.main === module) {
    // Run the GitHub release automation
    const releaseAutomation = new GitHubReleaseAutomation();
    releaseAutomation.run(
        version || undefined,
        tagName || undefined,
        releaseTitle || undefined,
        releaseNotes || undefined
    ).catch((error) => {
        console.error("GitHub release automation failed:", error);
        process.exit(1);
    });
}