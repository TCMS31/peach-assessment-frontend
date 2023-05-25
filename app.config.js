/**
 * Dynamic Expo config.
 *
 * The static `app.json` is the base; this file layers the one value that must
 * come from the environment. Reading it here (rather than in the bundle) keeps
 * the URL out of source control and out of the JS source itself.
 *
 *   PEACH_API_URL=http://192.168.1.20:3000 yarn ios
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.PEACH_API_URL ?? null,
  },
});
