/* eslint-env jest */
import '@testing-library/react-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Expo's config object is not available outside a running app; tests that care
// about configuration inject their own value into `resolveApiBaseUrl`.
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { extra: {} } } }));

// No test may reach the network. Anything that tries gets a loud failure rather
// than a hang, which is how a forgotten mock is meant to look.
global.fetch = jest.fn(() => {
  throw new Error('Unmocked network call: every test must stub fetch explicitly');
});

beforeEach(() => {
  global.fetch.mockClear();
});
