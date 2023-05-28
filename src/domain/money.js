/**
 * Rails serialises `decimal` columns as JSON strings ("45.12"), so every amount
 * arriving from the API has to be coerced before any arithmetic. Adding them as
 * strings is how "$45.12" + "$129.97" silently becomes "45.12129.97".
 */
export function toAmount(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatCurrency(value, { signed = false, currency = 'USD', locale = 'en-US' } = {}) {
  const amount = toAmount(value);
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (!signed) {
    return amount < 0 ? `-${formatted}` : formatted;
  }
  return amount < 0 ? `-${formatted}` : `+${formatted}`;
}

export function formatPercentage(fraction, { digits = 0 } = {}) {
  const value = Number.isFinite(fraction) ? fraction : 0;
  return `${(value * 100).toFixed(digits)}%`;
}
