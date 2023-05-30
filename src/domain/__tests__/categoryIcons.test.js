import {
  getCategoryIcon,
  registerCategoryIcon,
  registeredCategoryNames,
  resetCategoryIcons,
} from '../categoryIcons';

describe('category icon registry', () => {
  afterEach(resetCategoryIcons);

  it('returns bundled artwork for the seeded categories', () => {
    expect(getCategoryIcon({ name: 'Travel' }).kind).toBe('image');
    expect(getCategoryIcon({ name: 'Food and Drink' }).kind).toBe('image');
  });

  it('matches case-insensitively and ignores stray whitespace', () => {
    expect(getCategoryIcon({ name: '  travel ' }).kind).toBe('image');
  });

  it('falls back to the emoji the API sends for an unknown category', () => {
    // "Taxes" is seeded by the backend but has no bundled illustration.
    expect(getCategoryIcon({ name: 'Taxes', emoji: '💸' })).toEqual({
      kind: 'emoji',
      emoji: '💸',
    });
  });

  it('falls back to an initial when there is no emoji either', () => {
    expect(getCategoryIcon({ name: 'Gifts' })).toEqual({ kind: 'initial', initial: 'G' });
  });

  it('never renders blank, even with no category at all', () => {
    expect(getCategoryIcon(null)).toEqual({ kind: 'initial', initial: '?' });
  });

  it('lets a new category be given artwork without touching a screen', () => {
    const artwork = { uri: 'taxes.png' };
    registerCategoryIcon('Taxes', artwork);
    expect(getCategoryIcon({ name: 'Taxes', emoji: '💸' })).toEqual({
      kind: 'image',
      source: artwork,
    });
    expect(registeredCategoryNames()).toContain('taxes');
  });
});
