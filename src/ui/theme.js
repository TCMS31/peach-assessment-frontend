/**
 * Design tokens. Every colour, space and text style in the app comes from here
 * so a change is made once rather than hunted through inline style objects.
 * Palette is lifted from the backend seed data so chart slices and category
 * chips agree with the server's own colours.
 */
export const colors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  border: '#E6EBF0',
  borderStrong: '#D3DBE4',
  textPrimary: '#1B2230',
  textSecondary: '#6C727C',
  textMuted: '#949CA8',
  textInverse: '#FFFFFF',
  accent: '#323A47',
  positive: '#2E9E6B',
  negative: '#D1495B',
  focusRing: '#3B6FE0',
  gradientStart: '#C0CEFF',
  gradientEnd: '#F4D9D0',
  skeleton: '#EDF1F5',
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
