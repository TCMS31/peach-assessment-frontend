/**
 * Design tokens. Every colour, space and text style in the app comes from here
 * so a change is made once rather than hunted through inline style objects.
 *
 * Category colours come from the backend seed data, so chart slices and
 * category chips agree with the server. The chrome around them is a warm
 * peach-on-slate scheme. Every text colour clears WCAG AA (4.5:1) on both
 * `surface` and `background`.
 */
export const colors = {
  background: '#FAF7F4',
  surface: '#FFFFFF',
  border: '#ECE6E1',
  borderStrong: '#DCD3CC',
  textPrimary: '#1B2230',
  textSecondary: '#656D7A',
  textMuted: '#656D7A',
  textInverse: '#FFFFFF',
  accent: '#323A47',
  peach: '#F28C5B',
  link: '#A8461F',
  positive: '#237A53',
  negative: '#B83A4B',
  bannerStart: '#FFD3BA',
  bannerEnd: '#FDEBDD',
  skeleton: '#F2EDE8',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700', color: colors.textPrimary },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400', color: colors.textPrimary },
  bodyStrong: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400', color: colors.textSecondary },
  overline: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
};

export const elevation = {
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
  },
};

/**
 * The app is phone-first. On a tablet or on the web target the content column
 * is capped and centred rather than stretched across the full width.
 */
export const MAX_CONTENT_WIDTH = 560;

/** Minimum touch target recommended by both the iOS HIG and Material. */
export const MIN_TOUCH_TARGET = 44;
