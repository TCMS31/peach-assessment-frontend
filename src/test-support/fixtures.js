/**
 * Payloads shaped exactly like the Rails API responses, taken from the
 * backend's schema.rb, TransactionSerializer and db/seeds.rb. Amounts are
 * strings because Rails serialises `decimal` columns as strings.
 */
export const categoriesPayload = [
  { id: 1, name: 'Income', emoji: '🤑', color: '#DDF1A3', budget: null },
  { id: 2, name: 'Food and Drink', emoji: '🍕', color: '#FFC9C9', budget: null },
  { id: 3, name: 'Healthcare', emoji: '🏥', color: '#E5CBAF', budget: null },
  { id: 4, name: 'Shops', emoji: '🛍', color: '#B6E4FB', budget: null },
  { id: 5, name: 'Subscription Service', emoji: '📺', color: '#FFDAF9', budget: null },
  { id: 6, name: 'Travel', emoji: '✈️', color: '#FFECC6', budget: null },
  { id: 7, name: 'Taxes', emoji: '💸', color: '#C5C8FF', budget: null },
];

export const merchantsPayload = [
  { id: 1, name: 'Uber' },
  { id: 2, name: 'United' },
  { id: 3, name: 'Chipotle' },
  { id: 4, name: 'Payroll' },
  { id: 5, name: 'Hulu' },
];

function tx(id, name, merchant, amount, date, category, reviewed) {
  return {
    id,
    name,
    amount,
    date,
    reviewed,
    merchant: merchantsPayload.find((m) => m.name === merchant) ?? { id: 0, name: merchant },
    category: categoriesPayload.find((c) => c.name === category),
  };
}

export const transactionsPayload = [
  tx(1, 'Uber', 'Uber', '45.12', '2023-05-29', 'Travel', true),
  tx(2, 'SFO to JFK', 'United', '129.97', '2023-05-29', 'Travel', false),
  tx(3, 'Hulu', 'Hulu', '6.99', '2023-05-28', 'Subscription Service', true),
  tx(4, 'Chipotle', 'Chipotle', '12.88', '2023-05-28', 'Food and Drink', true),
  tx(5, 'Amazon order', 'Uber', '61.40', '2023-05-27', 'Shops', false),
  tx(6, 'May salary', 'Payroll', '2400.00', '2023-05-25', 'Income', true),
];

/** A fetch double that answers by path and records every call. */
export function createFetchStub(routes) {
  const calls = [];
  const impl = jest.fn(async (url, options = {}) => {
    calls.push({ url, options });
    const path = String(url).replace(/^https?:\/\/[^/]+/, '');
    const match = Object.keys(routes).find((key) => path === key || path.startsWith(`${key}?`));
    if (match === undefined) {
      return { ok: false, status: 404, json: async () => ({ error: 'not found' }) };
    }
    const route = routes[match];
    return {
      ok: route.status === undefined || route.status < 400,
      status: route.status ?? 200,
      json: async () => route.body,
    };
  });
  impl.calls = calls;
  return impl;
}
