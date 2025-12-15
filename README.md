# Rapunzel - React Native Reader App

A modern reader application built with React Native and Expo that supports multiple book sources. This project implements contemporary development practices with TypeScript, Redux Toolkit, and React Navigation.

## Features

- **React Native** with Expo managed workflow
- **TypeScript** for type safety
- **React Navigation** for seamless navigation with drawer, bottom tabs, and stack navigators
- **Redux Toolkit** for centralized state management
- **ESLint** and **Prettier** for code quality and consistent formatting
- **Jest** and **React Native Testing Library** for comprehensive testing
- Modular project structure organized by features
- Cross-platform compatibility (Android, iOS, and Web)

## Prerequisites

Before getting started, ensure you have the following installed:

- Node.js (>= 18.x)
- npm/yarn package manager
- Android Studio (for Android emulator/device testing)
- Android Debug Bridge (adb) - comes with Android Studio
- For iOS development (macOS only): Xcode with iOS Simulator

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Link Local Packages

Link the local `@atsu/*` packages required by the project:

```bash
npm run link:atsu
```

### 3. Start the Development Server

```bash
npm start
```

Then follow the prompts to run on your chosen platform.

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run on web browser
- `npm run dev` - Run with Expo development client
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Automatically fix lint issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage reports
- `npm run build:android` - Build Android APK

## Navigation and Architecture

- Navigation uses React Navigation Drawer to mirror the Rapunzel V1 view mapping
- `react-native-gesture-handler` is initialized before other components; `App.tsx` imports it at the top and wraps the tree in `GestureHandlerRootView`
- Drawer screens are declared in `src/navigation/viewConfig.ts`; edit this file to add, hide, or rename screens in the drawer
- The project follows a modular architecture with components organized by feature:

```
├── assets/                 # Asset files (images, fonts, etc.)
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   └── store/              # Redux store configuration
```

## Core Dependencies

- `expo` - Expo SDK for managed workflow
- `react-native` - React Native framework
- `@react-navigation/*` - Navigation solution
- `react-redux` & `@reduxjs/toolkit` - State management
- `react-native-gesture-handler` - Gesture recognition
- `@atsu/lilith*` - Custom libraries for book sources (MangaDex, NHentai, Hentag, etc.)

## Building for Production

For production builds, this project is configured with EAS Build:

- For Android builds: `eas build --platform android --profile production`
- For iOS builds: `eas build --platform ios --profile production`

Note: Building for production requires:
- An Expo account (`eas login`)
- Proper app signing credentials
- A paid Expo account for cloud builds (or local build tools)

See the BUILDING_ANDROID.md file for detailed instructions on building the APK.

## Documentation

Complete documentation is available in the [docs](./docs/) folder:

- [Main Project README](./docs/README.md) - Project overview, setup, and development guide
- [Building for Android](./docs/BUILDING_ANDROID.md) - Instructions for building Android APK
- [Development Guide](./docs/DevelopmentGuide.md) - Detailed development practices
- [Agent Documentation](./docs/AGENTS.md) - Information about AI-assisted development features

## Contributing

1. Make sure all tests pass: `npm test`
2. Run linting: `npm run lint`
3. Format code: `npm run format`
4. Follow conventional commits when making changes

The project follows modern React Native best practices and is structured to support ongoing development with comprehensive testing, linting, and formatting configurations.

## Learn More

To learn more about the technologies used in this project:

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev) - Official React Native documentation
- [React Navigation](https://reactnavigation.org/) - Navigation for React Native
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
