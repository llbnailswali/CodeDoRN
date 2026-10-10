module.exports = {
  preset: 'react-native',
  // web-editor/ has its own tests, run with tsx (`npm run check:all` there); Jest's Babel cannot compile them.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/web-editor/'],
  // AsyncStorage and the react-native-* libraries (pager-view, svg, ...) ship untranspiled code, so Jest must compile them like the
  // react-native packages the preset already lists.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|react-native-[^/]+|@react-native(-community)?|@react-native-async-storage)/)',
  ],
  // setupFilesAfterEnv, not setupFiles: setupFiles would replace the react-native preset's own setup file.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
