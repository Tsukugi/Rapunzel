# GitHub Release Automation Script

This project includes a script to automate GitHub releases with APK uploads.

## Overview

The GitHub release script automates the following tasks:
- Creates a GitHub release with the specified version
- Uploads the APK file to the release
- Tags the release with the appropriate version tag
- **Auto-generates release notes from commit history** since the last release (if not specified)

## Prerequisites

Before using this script, you need:

1. **GitHub CLI installed**: Install from [https://cli.github.com/](https://cli.github.com/)
2. **Authentication**: Run `gh auth login` to authenticate with GitHub
3. **Built APK**: The APK must already exist in the `builds/` directory (use `npm run release` first)

## Usage

### Command Line Interface

To create a GitHub release:

```bash
npm run release-github -- --version 0.8.3
```

This will automatically generate release notes from commit messages since the last tag.

You can also specify additional options:

```bash
# With custom tag and title (auto-generated release notes)
npm run release-github -- --version 0.8.3 --tag "v0.8.3-stable" --title "Stable Release 0.8.3"

# With custom release notes (bypasses auto-generation)
npm run release-github -- --version 0.8.3 --notes "Custom release notes for version 0.8.3"
```

To see help information:

```bash
npm run release-github -- --help
```

### Options

- `--version, -v <version>`: Set the version to release (e.g., 0.8.3)
- `--tag, -t <tag>`: Set the git tag for the release (default: v<version>)
- `--title, -T <title>`: Set the release title (default: Release v<version>)
- `--notes, -n <notes>`: Set the release notes (default: auto-generated from commits since last release)
- `--help, -h`: Show help message

### Examples

```bash
# Create a release with auto-generated release notes
npm run release-github -- --version 0.8.3

# Create a release with custom tag and title (auto-generated notes)
npm run release-github -- -v 0.8.3 -t "v0.8.3-stable" -T "Stable Release 0.8.3"

# Create a release with custom release notes (bypasses auto-generation)
npm run release-github -- --version 0.8.3 --notes "Fixed critical bugs and improved performance"

# Create a release with all custom options
npm run release-github -- -v 0.8.3 -t "v0.8.3-beta" -T "Beta Release 0.8.3" -n "Beta release with new features"
```

## Auto-Generated Release Notes

The script automatically generates release notes by:

1. Finding the previous git tag (the most recent tag before the one being created)
2. Collecting all commit messages between the previous tag and the current HEAD
3. Formatting these commits as a list in the release notes

This provides a complete changelog of what has changed since the last release.

## Workflow

The script follows this workflow:

1. **Validate inputs**: Checks if the APK file exists
2. **Prepare release details**: Sets up tag, title, and release notes
3. **Auto-generate notes** (if not provided): Fetches commits since last tag
4. **Verify GitHub CLI**: Ensures GitHub CLI is installed and authenticated
5. **Create release**: Creates the GitHub release and uploads the APK

## Notes

- The APK file must already exist in the `builds/` directory before running this script
- Use `npm run release -- --version X.X.X` to build the APK first
- The script assumes you're running it from the root of the repository
- The GitHub repository is determined from the git remote origin
- If no previous tag is found, the script will use recent commits (last 20) for the release notes