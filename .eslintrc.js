module.exports = {
  root: true,
  extends: ['universe/native'],
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'web-build/',
    'dist/',
    'coverage/',
    'docs/',
  ],
  env: {
    es2022: true,
  },
  globals: {
    // Provided by the React Native runtime (and by Node when running Jest).
    AbortController: 'readonly',
    Intl: 'readonly',
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    eqeqeq: ['error', 'smart'],
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.js', 'jest.setup.js', 'src/test-support/**/*.js'],
      env: { jest: true },
    },
    {
      files: ['*.config.js', '.eslintrc.js', 'jest.setup.js'],
      env: { node: true },
    },
  ],
};
