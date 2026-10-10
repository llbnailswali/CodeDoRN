// The in-memory AsyncStorage mock the package provides for Jest (the native module does not exist in tests).
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest'));
// Safe-area insets come from a native module; the package's mock provides fixed insets.
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
