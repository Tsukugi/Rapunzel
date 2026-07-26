# Rapunzel OTA code updater plan

## Goal

Let a directly distributed Rapunzel build download a new React Native
JavaScript bundle without installing a new APK or IPA.

The update is a compiled release bundle, not TypeScript source. The native
application remains the loader and security boundary.

## Decisions

- Support Android and iOS in the implementation.
- Use a GitHub Release asset and a small `latest.json` manifest as the default
  update source.
- Check for updates from a visible Settings action. Do not start a silent
  background code download.
- Download and validate the update while the current bundle is running.
- Activate a validated update on the next application launch.
- Keep the last known-good bundle and reject updates that do not match the
  native compatibility contract.
- Use HTTPS and SHA-256 checks for the first implementation. Add a signed
  manifest before treating the updater as suitable for an untrusted release
  channel.
- Do not allow an OTA bundle to add native modules, permissions, native assets,
  or native configuration. Those changes still require a new application
  binary.

## Current constraints

- Android uses React Native 0.72.6 with Hermes enabled. The Android host
  currently loads the embedded bundle because `getJSBundleFile()` is not
  overridden.
- iOS currently returns the embedded `main.jsbundle` from
  `sourceURLForBridge`.
- `react-native-fs` is already available for internal file storage, download,
  atomic moves, and SHA-256 hashing.
- Rapunzel has three statically required mascot PNGs. An OTA release must ship
  the bundle and its Metro assets together in one archive per platform.
- The existing worktree contains user changes to the mascot feature. Those
  changes must not be reverted or reformatted as part of this work.

## Update format

The manifest is versioned and contains one verified ZIP archive per platform:

```json
{
  "schema": 2,
  "platforms": {
    "android": {
      "version": "0.9.2",
      "nativeCompatibility": "rn-0.72.6-hermes",
      "archive": {
        "path": "Rapunzel-0.9.4.android.ota.zip",
        "url": "https://github.com/Tsukugi/Rapunzel/releases/download/v0.9.4/ota-android-Rapunzel-0.9.4.android.ota.zip",
        "sha256": "...",
        "bytes": 123456
      },
      "bundlePath": "index.android.bundle",
      "notes": "..."
    },
    "ios": {
      "version": "0.9.2",
      "nativeCompatibility": "rn-0.72.6-hermes",
      "archive": {
        "path": "Rapunzel-0.9.4.ios.ota.zip",
        "url": "https://github.com/Tsukugi/Rapunzel/releases/download/v0.9.4/ota-ios-Rapunzel-0.9.4.ios.ota.zip",
        "sha256": "...",
        "bytes": 123456
      },
      "bundlePath": "main.jsbundle"
    }
  }
}
```

The current manifest URL is a build constant in the updater. A release must
not be activated when the schema, version, native compatibility, archive URL,
archive size, or archive hash is invalid.

## Runtime design

1. A small native bootstrap reads the active bundle record from app-private
   storage before creating the React Native bridge.
2. The native host returns the active bundle path when one exists; otherwise it
   returns the embedded bundle.
3. The React Native Settings action fetches and validates the manifest.
4. The updater downloads one platform ZIP archive to a temporary path.
5. It checks the exact byte count and SHA-256 value before extraction.
6. It rejects unsafe ZIP paths, excessive entry counts, and oversized expanded
   data, then extracts the bundle and assets into a versioned private directory
   and writes an atomic active-bundle record.
7. The next launch uses the new bundle. The old record remains available until
   the new bundle has started successfully.
8. If the app restarts after failing to start the pending bundle, the native
   bootstrap sees the attempted marker, removes the pending record, and starts
   the embedded or previous known-good bundle.

The first implementation should apply on the next launch. Hot-swapping the
current bridge would add unnecessary lifecycle risk.

## Native integration

### Android

- Add a small bundle-state reader used by `MainApplication`.
- Override `getJSBundleFile()` and return a filesystem path only after the
  active record has been validated.
- Keep the embedded `index.android.bundle` fallback.
- Expose a small native status/reset bridge only if JavaScript needs to report
  a successful boot or a failed boot.

### iOS

- Add the same bundle-state rules in `AppDelegate.mm`.
- Return a file URL for the active bundle from `sourceURLForBridge`.
- Keep the embedded `main.jsbundle` fallback.
- Use the same manifest and file layout as Android where possible.

## Release tooling

Add a release command that:

- builds Android and iOS release bundles with the repository's current Metro
  configuration;
- collects Metro assets needed by the bundle;
- calculates SHA-256 and byte counts;
- writes `latest.json`;
- publishes one ZIP archive per platform and the manifest as GitHub Release
  assets;
- never commits generated bundles, archives, or private signing material.

The release command must refuse to publish a bundle whose native compatibility
identifier does not match the app build configuration.

Android release APKs must be signed with the private `release.keystore`. The
keystore is part of the app's update identity, must stay outside the public
repository, and must not be replaced. Release credentials stay in the ignored
`android/local.properties` file.

## Test and review passes

### Pass 1: shared updater core

- Manifest schema validation.
- ZIP path and expanded-size validation.
- Version and native-compatibility comparison.
- Archive file-size and SHA-256 validation.
- Temporary-file and atomic-activation behavior.
- Rejection leaves the active record unchanged.

Review gate: inspect all failure paths and confirm no unverified file becomes
active.

### Pass 2: Android loader

- Load an active file bundle.
- Fall back to the embedded bundle when no record exists.
- Reset an invalid active record.
- Add Android-focused tests or a small native smoke check where the local
  toolchain supports it.

Review gate: inspect the process-start order and confirm the updater cannot
change native modules or permissions.

### Pass 3: iOS loader

- Load an active file bundle.
- Fall back to `main.jsbundle`.
- Keep the native implementation aligned with Android.

Review gate: inspect the file URL handling and report that iOS build verification
requires macOS/Xcode if unavailable locally.

### Pass 4: Settings and release tooling

- Add visible update status, progress, success, and failure feedback.
- Add the release bundle command and documentation.
- Add a manual smoke-test procedure for installing an OTA bundle and forcing a
  rollback.

Review gate: inspect the complete diff, generated-file rules, release metadata,
and user-data preservation.

## Out of scope

- Downloading and compiling TypeScript on the device.
- Downloading arbitrary native code or new React Native modules.
- Silent updates.
- APK or IPA installation from inside the app.
- Store-specific update APIs.

## Manual smoke test

1. Install a directly distributed build whose embedded version is lower than
   the test release.
2. Build OTA files with
   `npm run ota-release -- --version 0.9.4 --notes "OTA smoke test"`.
3. Publish the generated files to the matching GitHub release, or use
   `--upload` when that release already exists.
4. Open Settings, choose Check for code update, download the update, close the
   app, and open it again.
5. Confirm the new behavior and mascot/assets load. To test rollback, publish
   a bundle that fails before the root component renders, open it once, close
   the app, and open it again. The native loader should discard the pending
   bundle and use the embedded or previous bundle.

## Completion criteria

- A valid platform ZIP can be downloaded, verified, extracted, activated on
  next launch, and loaded on Android.
- The same manifest and bundle format is supported by the iOS native loader.
- Invalid, incompatible, incomplete, or tampered updates never become active.
- A failed new bundle can return to the embedded or previous bundle.
- The release command produces reproducible metadata and no generated release
  artifacts are added to Git.
- Focused tests, the full Jest suite, lint, and TypeScript checks are run and
  their results are recorded.
