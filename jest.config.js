module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-gesture-handler|reflux.*)',
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    'app/actions/**/*.js',
    'app/stores/**/*.js',
    '!**/__tests__/**',
  ],
  testEnvironment: 'node',
};
