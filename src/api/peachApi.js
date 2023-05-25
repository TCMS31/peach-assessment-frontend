import { createHttpClient, withQuery } from './httpClient';
import { resolveApiBaseUrl } from '../config/env';

/**
 * Typed-ish wrapper over the peach-take-home-back-end Rails API.
 *
 * Routes (config/routes.rb in the backend):
 *   GET   /categories
 *   GET   /merchants
 *   GET   /transactions[?pending_review=true|?reviewed=true]
 *   GET   /transactions/:id
 *   PATCH /transactions/:id
 */
export function createPeachApi(httpClient) {
  return {
    getCategories: () => httpClient.get('/categories'),

    getMerchants: () => httpClient.get('/merchants'),

    /**
     * The backend filters server-side, so the client never downloads the whole
     * ledger just to count what still needs reviewing.
     */
    getTransactions: ({ pendingReview, reviewed } = {}) =>
      httpClient.get(
        withQuery('/transactions', {
          pending_review: pendingReview === true ? true : undefined,
          reviewed: reviewed === true ? true : undefined,
        }),
      ),

    getTransaction: (id) => httpClient.get(`/transactions/${encodeURIComponent(id)}`),

    /**
     * Rails expects the nested form permitted by TransactionsController:
     *   params.require(:transaction).permit(:reviewed, category_attributes: [:name, :emoji])
     */
    updateTransaction: (id, { reviewed, category } = {}) =>
      httpClient.patch(`/transactions/${encodeURIComponent(id)}`, {
        transaction: {
          ...(reviewed === undefined ? {} : { reviewed }),
          ...(category === undefined
            ? {}
            : { category_attributes: { name: category.name, emoji: category.emoji } }),
        },
      }),
  };
}

/** Default singleton used by the app; tests build their own with a fake fetch. */
export const peachApi = createPeachApi(createHttpClient({ baseUrl: resolveApiBaseUrl() }));
