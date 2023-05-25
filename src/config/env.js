import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Port the Rails API (`rails s`) listens on by default. */
export const DEFAULT_API_PORT = 3000;

/**
 * Host aliases that reach the developer machine from a device/emulator.
 * An Android emulator cannot see `localhost` - that resolves to the emulator
 * itself - so it has to go through the well-known 10.0.2.2 loopback alias.
 */
export const HOST_ALIASES = {
  android: '10.0.2.2',
  default: 'localhost',
};

/**
 * Values that look configured but are not. These show up when a shell variable
 * is unset and gets interpolated anyway, producing strings like "undefined/api".
 */
const PLACEHOLDER_VALUES = new Set(['', 'undefined', 'null', 'nil', 'none']);

function stripTrailingSlashes(value) {
  return value.replace(/\/+$/, '');
}

/**
 * Returns a usable base URL, or `null` when the value is missing/placeholder.
 * Trimming is deliberate: a trailing space in an env file silently produces a
 * URL that every HTTP client rejects, and the error message never says why.
 */
export function sanitizeBaseUrl(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) {
    return null;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }
  const withoutTrailingSlash = stripTrailingSlashes(trimmed);
  return withoutTrailingSlash === '' ? null : withoutTrailingSlash;
}

/**
 * Resolves the API base URL.
 *
 * Precedence: explicit argument -> `extra.apiBaseUrl` from app config (fed by
 * the PEACH_API_URL environment variable in app.config.js) -> platform default.
 *
 * Both inputs are injectable so this stays a pure function under test.
 */
export function resolveApiBaseUrl({ configured, platform } = {}) {
  const fromArgument = sanitizeBaseUrl(configured);
  if (fromArgument) {
    return fromArgument;
  }

  const fromAppConfig = sanitizeBaseUrl(Constants?.expoConfig?.extra?.apiBaseUrl);
  if (fromAppConfig) {
    return fromAppConfig;
  }

  const os = platform ?? Platform.OS;
  const host = HOST_ALIASES[os] ?? HOST_ALIASES.default;
  return `http://${host}:${DEFAULT_API_PORT}`;
}
