// Mock the react-native modules for testing
import { jest } from '@jest/globals';

// Mock AsyncStorage or other native modules if needed
jest.mock('@react-native-async-storage/async-storage', () => 
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Additional setup if needed