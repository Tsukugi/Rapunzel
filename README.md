# Welcome to Rapunzel!

A reader made in React Native for books that supports multiple sources.

## Dependencies

You would need the following as a dev environment

-   node >= 16
-   Android Studio set up (For android emulator, from here https://developer.android.com/studio)
-   adb (For android device testing, should come with android studio, you'd like to have the `adb` command available in your console)
-   `ESLint` and `Prettier` plugins for your IDE (For linting, formatting, etc.). Please find a plugin that helps you follow these rulesets defined in the project. Personally I use VSCode.

## How to build?

### Step 1: Dependencies

First, you will need to install the dependencies, a normal `npm` install should suffice

```bash
npm i
```

### Step 2: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
npm run start
```

### Step 3: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
npm run android
```

### For iOS

```bash
npm run ios
```

### Build APK

To avoid having a build requiring the debug server, do the following

- Open Android Studio and make a signed build/APK
- Use the debug credentials android/app/build.gradle
- Make a "Release" build.

### Automated Release

Alternatively, you can use the automated release script to build a release APK with version management:

```bash
# Release version 0.8.3
npm run release -- --version 0.8.3

# Or using the shorthand
npm run release -- -v 0.8.3

# To see help information:
npm run release -- --help
```

The script will update the version in both `package.json` and `android/app/build.gradle`, build the release APK, and place it in the `builds/` directory with the naming convention `Rapunzel-{version}.apk`.

### GitHub Releases

You can also automatically create GitHub releases with your APK:

```bash
# First build the APK (if not already done)
npm run release -- --version 0.8.3

# Then create the GitHub release (with auto-generated release notes from commits)
npm run release-github -- --version 0.8.3

# Or with custom options
npm run release-github -- -v 0.8.3 -t "v0.8.3-stable" -T "Stable Release 0.8.3"

# Or with custom release notes (bypassing auto-generation)
npm run release-github -- -v 0.8.3 --notes "Custom release notes here"
```

Before using this feature, ensure you have:
1. Installed the GitHub CLI from https://cli.github.com/
2. Authenticated with `gh auth login`
3. Built the APK using the release script

For more details, see the [GitHub Release Script Documentation](scripts/GITHUB_RELEASE_README.md).


If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

### Step 4: Modifying Rapunzel

Now that you have successfully run the app, let's modify it.

1. Open `src/App.tsx`, `index.js` or any component inside `src/` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

    For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

### Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

## Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

## Learn More

To learn more about React Native, take a look at the following resources:

-   [React Native Website](https://reactnative.dev) - learn more about React Native.
-   [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
-   [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
-   [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
-   [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
