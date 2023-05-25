import { formatCurrency, formatPercentage, toAmount } from '../money';

describe('toAmount', () => {
  it('parses the decimal strings Rails sends', () => {
    expect(toAmount('45.12')).toBe(45.12);
    expect(toAmount('2400.0')).toBe(2400);
  });

  it('passes finite numbers through', () => {
    expect(toAmount(12.5)).toBe(12.5);
  });

  it.each([null, undefined, {}, [], 'abc', NaN, Infinity])('coerces %p to 0', (value) => {
    expect(toAmount(value)).toBe(0);
  });

  it('adds correctly, which string concatenation does not', () => {
    // '45.12' + '129.97' === '45.12129.97'
    expect(toAmount('45.12') + toAmount('129.97')).toBeCloseTo(175.09, 2);
  });
});

describe('formatCurrency', () => {
  it('formats a positive amount', () => {
    expect(formatCurrency('45.12')).toBe('$45.12');
  });

  it('always shows two decimal places', () => {
    expect(formatCurrency('6.9')).toBe('$6.90');
    expect(formatCurrency(2400)).toBe('$2,400.00');
  });

  it('adds an explicit plus only when asked', () => {
    expect(formatCurrency('2400.00', { signed: true })).toBe('+$2,400.00');
    expect(formatCurrency('2400.00')).toBe('$2,400.00');
  });

  it('renders negatives with a single leading minus', () => {
    expect(formatCurrency(-10)).toBe('-$10.00');
    expect(formatCurrency(-10, { signed: true })).toBe('-$10.00');
  });
});

describe('formatPercentage', () => {
  it('renders a 0..1 fraction as a percentage', () => {
    expect(formatPercentage(0.355)).toBe('36%');
    expect(formatPercentage(0.5, { digits: 1 })).toBe('50.0%');
  });

  it('treats a non-finite share as zero', () => {
    expect(formatPercentage(NaN)).toBe('0%');
  });
});
