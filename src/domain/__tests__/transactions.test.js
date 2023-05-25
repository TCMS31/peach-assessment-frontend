import { transactionsPayload } from '../../test-support/fixtures';
import {
  categoryTotals,
  formatTransactionDate,
  isSpend,
  normalizeTransaction,
  normalizeTransactions,
  pendingReview,
  pendingReviewCount,
  sortByDateDescending,
  topCategories,
  totalSpend,
} from '../transactions';

const transactions = normalizeTransactions(transactionsPayload);

describe('normalizeTransaction', () => {
  it('turns the API payload into numbers and dates', () => {
    const tx = normalizeTransaction(transactionsPayload[0]);
    expect(tx.amount).toBe(45.12);
    expect(tx.date).toBeInstanceOf(Date);
    expect(tx.date.toISOString()).toMatch(/^2023-05-29/);
    expect(tx.merchant.name).toBe('Uber');
    expect(tx.category.name).toBe('Travel');
  });

  it('survives a payload with everything missing', () => {
    const tx = normalizeTransaction({});
    expect(tx.name).toBe('Unknown transaction');
    expect(tx.amount).toBe(0);
    expect(tx.date).toBeNull();
    expect(tx.merchant.name).toBe('Unknown merchant');
    expect(tx.category).toBeNull();
  });

  it('rejects an unparseable date instead of producing Invalid Date', () => {
    expect(normalizeTransaction({ date: 'not-a-date' }).date).toBeNull();
  });

  it.each([null, undefined, 'x', 7])('returns null for the non-object %p', (value) => {
    expect(normalizeTransaction(value)).toBeNull();
  });

  it('returns an empty array when the API sends something that is not a list', () => {
    // The old error path wrote an Error object into this slot.
    expect(normalizeTransactions(new Error('boom'))).toEqual([]);
    expect(normalizeTransactions(null)).toEqual([]);
  });
});

describe('spend classification', () => {
  it('excludes income from spending', () => {
    const salary = transactions.find((tx) => tx.category.name === 'Income');
    expect(isSpend(salary)).toBe(false);
  });

  it('totals only the spend rows', () => {
    // 45.12 + 129.97 + 6.99 + 12.88 + 61.40, salary excluded
    expect(totalSpend(transactions)).toBeCloseTo(256.36, 2);
  });
});

describe('categoryTotals', () => {
  const totals = categoryTotals(transactions);

  it('groups by category and sorts largest first', () => {
    expect(totals.map((bucket) => bucket.name)).toEqual([
      'Travel',
      'Shops',
      'Food and Drink',
      'Subscription Service',
    ]);
    expect(totals[0].total).toBeCloseTo(175.09, 2);
    expect(totals[0].count).toBe(2);
  });

  it('carries the colour the backend assigned', () => {
    expect(totals[0].color).toBe('#FFECC6');
  });

  it('produces shares that add up to exactly 100%', () => {
    // The original chart hardcoded 35% + 55% and lost a tenth of the circle.
    const sum = totals.reduce((acc, bucket) => acc + bucket.share, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it('returns nothing, and divides by nothing, for an empty ledger', () => {
    expect(categoryTotals([])).toEqual([]);
  });
});

describe('topCategories', () => {
  it('leaves a short list alone', () => {
    expect(topCategories(transactions, { limit: 10 })).toHaveLength(4);
  });

  it('folds the tail into a single Other slice whose shares still sum to 1', () => {
    const top = topCategories(transactions, { limit: 2 });
    expect(top).toHaveLength(3);
    expect(top[2].name).toBe('Other');
    expect(top.reduce((acc, bucket) => acc + bucket.share, 0)).toBeCloseTo(1, 10);
  });
});

describe('review queue', () => {
  it('counts only unreviewed transactions', () => {
    expect(pendingReviewCount(transactions)).toBe(2);
    expect(pendingReview(transactions).map((tx) => tx.name)).toEqual([
      'SFO to JFK',
      'Amazon order',
    ]);
  });
});

describe('sortByDateDescending', () => {
  it('puts the newest first and does not mutate its input', () => {
    const input = [...transactions];
    const sorted = sortByDateDescending(input);
    expect(sorted[0].date.getTime()).toBeGreaterThanOrEqual(sorted[1].date.getTime());
    expect(input).toEqual(transactions);
  });

  it('sorts undated rows last', () => {
    const withUndated = sortByDateDescending([...transactions, normalizeTransaction({})]);
    expect(withUndated[withUndated.length - 1].date).toBeNull();
  });
});

describe('formatTransactionDate', () => {
  it('formats in UTC so a date does not slip a day by timezone', () => {
    expect(formatTransactionDate(new Date('2023-05-29'))).toBe('May 29, 2023');
  });

  it('returns an empty string rather than "Invalid Date"', () => {
    expect(formatTransactionDate(null)).toBe('');
    expect(formatTransactionDate(new Date('nope'))).toBe('');
  });
});
