# Building the Android App

To build the Android APK for this project, you have two main options:

## Option 1: Using EAS Build (Recommended)

1. Install the EAS CLI:
```bash
npm install -g eas-cli
```

2. Log in to your Expo account:
```bash
eas login
```

3. Run the build command:
```bash
eas build --platform android
```

### Build Profiles
The project includes three build profiles in `eas.json`:

1. **development** - Creates a development build with debugging capabilities
2. **preview** - Creates an APK for internal testing
3. **production** - Creates an optimized app bundle for the Google Play Store

To build a specific profile:
```bash
eas build --platform android --profile production
```

## Option 2: Local Development Build
For local testing without a full native build, you can run:

```bash
npx expo start --dev-client
```

Then scan the QR code with the Expo Go app on your Android device.

## Prerequisites
- Node.js and npm
- Expo account (for EAS Build)
- Android Studio (optional, for testing on emulator)

## Android-Specific Configuration
The app's Android configuration is located in `app.json` under the `plugins` section. The package name is set to `com.anonymous.RapunzelApp`.

## Building for Production
For production builds, the project uses app bundles (aab format) which are more efficient for distribution on Google Play Store.