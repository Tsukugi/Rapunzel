# Development Guide for RapunzelV2

## Overview
This guide provides instructions for setting up, developing, and building the RapunzelV2 React Native application with Expo.

## Prerequisites
Before starting development, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn package manager
- Android Studio (for Android development)
- Android SDK with platform tools
- For iOS development: Xcode with command-line tools
- Expo CLI: `npm install -g @expo/cli`

For Android development, ensure your device has:
- Developer Options enabled
- USB Debugging enabled
- Connected via USB (for physical device testing)

## Getting Started

### 1. Clone and Setup the Project
```bash
git clone <repository-url>
cd RapunzelV2
npm install
```

### 2. Environment Variables
If your project requires environment variables, create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Then update the values as needed.

### 3. Available Scripts

#### `npm start` or `npx expo start`
Starts the Expo development server. From here you can:
- Press `a` to run on Android
- Press `i` to run on iOS
- Press `w` to run on web

#### `npm run android`
Builds and runs the app directly on an Android device/emulator with development mode.

#### `npm run ios`
Builds and runs the app directly on an iOS simulator/device with development mode.

#### `npm run web`
Runs the app in a web browser using Expo Web.

#### `npm run dev`
Starts the app with the development client, allowing you to run the app with additional native modules and custom development workflows.

#### `npm run lint`
Checks code for linting errors using ESLint.

#### `npm run lint:fix`
Fixes auto-fixable linting errors and reports remaining issues.

#### `npm run format`
Formats all code using Prettier according to project standards.

#### `npm run test`
Runs all unit tests using Jest.

#### `npm run test:watch`
Runs tests in watch mode, automatically re-running when files change.

#### `npm run test:coverage`
Generates test coverage reports.

#### `npm run build:android`
Builds an APK for Android distribution.

## Development Workflow

### Development with Hot Reload
To develop with live reloading:
1. Ensure your device (physical or emulator) is connected
2. Run `npm run dev` to start the development server with hot reload
3. Make changes to your code - they should reflect immediately on your device

For Android:
```bash
npm run dev
# The app will deploy to your connected device or emulator
```

### Using the Expo Development Build
For more advanced development with custom native modules:
1. Run `npx expo run:android` to build and deploy natively to Android
2. Or `npx expo run:ios` for iOS

This creates a native build with your JavaScript bundle that has access to all Expo APIs and additional native modules.

#### Native Modules (AsyncStorage)
- After installing, rebuild your dev client (`npx expo run:android` / `npx expo run:ios` or `eas build --profile development`) so the native module is available.

### State Management
This project uses Redux Toolkit for state management:
- Store configuration: `src/store/index.ts`
- Slices: Add new slices to the `src/store/slices/` directory
- Actions and selectors: Keep these in the respective slice files

### Navigation
Navigation is handled with React Navigation:
- Main navigator: `src/navigation/AppNavigator.tsx`
- Add new navigators or modify existing routes in the `src/navigation/` directory

### Theming
The application uses a consistent theme defined in `src/theme/index.ts`:
- Colors are defined in the `colors` object
- Spacing is defined in the `spacing` object
- Typography is defined in the `typography` object

## Building for Distribution

### Android
To build an APK for distribution:
```bash
npm run build:android
```

Or using EAS Build:
```bash
eas build --platform android
```

### iOS
Using EAS Build:
```bash
eas build --platform ios
```

## Troubleshooting

### Common Issues

#### Device not detected
- Ensure USB debugging is enabled
- Try unplugging and reconnecting the device
- Run `adb devices` to verify device detection

#### Metro bundler not responding
- Kill the Metro process: `kill $(lsof -ti:8081)`
- Restart the development server

#### Build fails with native modules
- Clean the project: `npx expo prebuild --clean`
- Reinstall node_modules: `rm -rf node_modules && npm install`

#### Hot reload not working
- Ensure the device and development machine are on the same network
- Try disabling and re-enabling hot reload in the development menu
- In Android, shake the device or press Ctrl+M to open the development menu

## Best Practices

### Code Quality
- Always run `npm run lint` and `npm run format` before committing
- Write unit tests for new functionality
- Follow the existing code structure and naming conventions

### Performance
- Use React.memo for components that rarely change
- Implement proper Redux state normalization
- Implement proper list virtualization for large lists
- Carefully manage re-renders and state updates

### Security
- Never hardcode sensitive information in the source code
- Use secure storage for sensitive user data (e.g., Expo SecureStore)
- Sanitize user inputs appropriately

## Contributing
When contributing to this project:
1. Create a feature branch from `develop`
2. Make your changes with appropriate tests
3. Run `npm run lint && npm run format && npm test` to ensure all checks pass
4. Submit a pull request with a clear description of your changes
