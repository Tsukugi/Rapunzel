# Release Automation Script

This project includes an automated release script to streamline the APK building process.

## Overview

The release script automates the following tasks:
- Updates the version in `package.json`
- Updates the version in `android/app/build.gradle`
- Builds the release APK using Gradle
- Moves the generated APK to the `builds/` folder with the naming convention `Rapunzel-{version}.apk`

## Usage

### Command Line Interface

To run a release with a specific version:

```bash
npm run release -- --version 0.8.3
```

Or using the shorthand:

```bash
npm run release -- -v 0.8.3
```

To run a release with the current package.json version:

```bash
npm run release
```

To see help information:

```bash
npm run release -- --help
```

### Examples

```bash
# Release version 0.8.3
npm run release -- --version 0.8.3

# Release version 0.8.3 using shorthand
npm run release -- -v 0.8.3

# Release using current package.json version
npm run release
```

## Generated Files

The release script creates a `builds/` directory (if it doesn't exist) and places the APK file there with the naming scheme:
`Rapunzel-{version}.apk`

For example, if you release version 0.8.3, the APK will be located at:
`builds/Rapunzel-0.8.3.apk`

## Requirements

- Node.js and npm installed
- Android development environment set up
- Access to Gradle and Android SDK
- Project dependencies installed (`npm install`)

## How It Works

The script performs the following steps:

1. **Version Check**: Determines the target version from command line arguments or package.json
2. **Directory Setup**: Creates the builds directory if it doesn't exist
3. **Version Update**: Updates the version in both package.json and Android build.gradle
4. **APK Build**: Executes `./gradlew assembleRelease` in the android directory
5. **File Management**: Moves the generated APK to the builds folder with the correct naming