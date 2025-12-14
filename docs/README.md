# Rapunzel React Native App

This is a React Native application built with Expo, featuring a complete development setup with modern tools and best practices.

## Features

- **React Native** with Expo managed workflow
- **TypeScript** for type safety
- **React Navigation** for navigation between screens
- **Redux Toolkit** for state management
- **ESLint** and **Prettier** for code quality and formatting
- **Jest** and **React Native Testing Library** for testing
- Modular project structure organized by features

## Project Structure

```
├── assets/                 # Asset files (images, fonts, etc.)
├── src/
│   ├── components/         # Reusable UI components
│   ├── screens/            # Screen components
│   ├── navigation/         # Navigation configuration
│   └── store/              # Redux store configuration
├── .eslintrc.js           # ESLint configuration
├── .prettierrc.json       # Prettier configuration
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup file
├── App.tsx                # Main application component
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. To run on Android:
```bash
npm run android
```

4. To run on iOS (requires macOS):
```bash
npm run ios
```

5. To run on web:
```bash
npm run web
```

## Development Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run on web browser
- `npm run dev` - Run with development client
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Automatically fix lint issues
- `npm run format` - Format code with Prettier
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage
- `npm run build:android` - Build Android APK

## Building for Production

This project is configured for both development and production builds:

- For Android builds, run: `eas build --platform android --profile production`
- For iOS builds, run: `eas build --platform ios --profile production`

Note: Building for production requires:
- An Expo account (`eas login`)
- Proper app signing credentials
- A paid Expo account for cloud builds (or local build tools)

See the BUILDING_ANDROID.md file for detailed instructions on building the APK.

## Dependencies

### Core Dependencies
- `expo` - Expo SDK
- `react-native` - React Native framework
- `@react-navigation/*` - Navigation solution
- `react-redux` & `@reduxjs/toolkit` - State management

### Development Dependencies
- `eslint` - JavaScript linter
- `prettier` - Code formatter
- `jest` - JavaScript testing framework
- `@testing-library/react-native` - React Native testing utilities

## Contributing

1. Make sure all tests pass: `npm test`
2. Run linting: `npm run lint`
3. Format code: `npm run format`
4. Commit your changes following conventional commits