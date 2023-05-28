import { toAmount } from './money';

export const INCOME_CATEGORY = 'Income';
export const FALLBACK_CATEGORY_COLOR = '#E6EBF0';

/**
 * Collapses the API shape into something the UI can rely on: amounts are
 * numbers, dates are Date objects, and merchant/category are always present.
 */
export function normalizeTransaction(raw) {
  if (raw === null || typeof raw !== 'object') {
    return null;
  }
  const date = raw.date ? new Date(raw.date) : null;
  return {
    id: raw.id ?? null,
    name: raw.name ?? 'Unknown transaction',
    amount: toAmount(raw.amount),
    reviewed: raw.reviewed === true,
    date: date !== null && !Number.isNaN(date.getTime()) ? date : null,
    merchant: {
      id: raw.merchant?.id ?? null,
      name: raw.merchant?.name ?? 'Unknown merchant',
    },
    category: normalizeCategory(raw.category),
  };
}

export function normalizeCategory(raw) {
  if (raw === null || raw === undefined) {
    return null;
  }
  return {
    id: raw.id ?? null,
    name: raw.name ?? 'Uncategorised',
    emoji: raw.emoji ?? null,
    color: raw.color ?? FALLBACK_CATEGORY_COLOR,
  };
}

export function normalizeTransactions(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(normalizeTransaction).filter((tx) => tx !== null);
}

export function normalizeCategories(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map(normalizeCategory).filter((category) => category !== null);
}

/** Income is money in, not money out, so it never counts toward spending. */
export function isSpend(transaction) {
  return transaction.category?.name !== INCOME_CATEGORY && transaction.amount > 0;
}

export function totalSpend(transactions) {
  return transactions.filter(isSpend).reduce((sum, tx) => sum + tx.amount, 0);
}

export function pendingReviewCount(transactions) {
  return transactions.filter((tx) => !tx.reviewed).length;
}

export function pendingReview(transactions) {
  return transactions.filter((tx) => !tx.reviewed);
}

/**
 * Totals spend per category, largest first. `share` is a 0..1 fraction of the
 * overall spend, so the slices of the donut always add up to exactly 100% -
 * the original hardcoded chart used 35% + 55% and lost 10% of the circle.
 */
export function categoryTotals(transactions) {
  const buckets = new Map();

  for (const tx of transactions) {
    if (!isSpend(tx)) {
      continue;
    }
    const name = tx.category?.name ?? 'Uncategorised';
    const existing = buckets.get(name);
    if (existing === undefined) {
      buckets.set(name, {
        name,
        emoji: tx.category?.emoji ?? null,
        color: tx.category?.color ?? FALLBACK_CATEGORY_COLOR,
        total: tx.amount,
        count: 1,
      });
    } else {
      existing.total += tx.amount;
      existing.count += 1;
    }
  }

  const overall = [...buckets.values()].reduce((sum, bucket) => sum + bucket.total, 0);

  return [...buckets.values()]
    .map((bucket) => ({ ...bucket, share: overall === 0 ? 0 : bucket.total / overall }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

/**
 * The top `limit` categories, with everything else folded into a single "Other"
 * slice so the chart stays readable and the shares still sum to 1.
 */
export function topCategories(transactions, { limit = 4, otherLabel = 'Other' } = {}) {
  const totals = categoryTotals(transactions);
  if (totals.length <= limit) {
    return totals;
  }
  const head = totals.slice(0, limit);
  const tail = totals.slice(limit);
  return [
    ...head,
    {
      name: otherLabel,
      emoji: null,
      color: FALLBACK_CATEGORY_COLOR,
      total: tail.reduce((sum, bucket) => sum + bucket.total, 0),
      count: tail.reduce((sum, bucket) => sum + bucket.count, 0),
      share: tail.reduce((sum, bucket) => sum + bucket.share, 0),
    },
  ];
}

/** Most recent first; transactions without a date sort last. */
export function sortByDateDescending(transactions) {
  return [...transactions].sort((a, b) => {
    if (a.date === null && b.date === null) return 0;
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return b.date.getTime() - a.date.getTime();
  });
}

export function formatTransactionDate(date, { locale = 'en-US' } = {}) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
