import Reflux from 'reflux';

import { peachApi } from '../../src/api/peachApi';

/**
 * Reflux action layer.
 *
 * The take-home skeleton put `fetch` calls straight in here with a hardcoded
 * URL. The transport now lives in `src/api`, so this file only does what an
 * action layer should: dispatch, await, and report success or failure.
 *
 * `configureApi` exists so tests (and a future offline/demo mode) can swap the
 * client without monkey-patching global fetch.
 */
let client = peachApi;

export function configureApi(nextClient) {
  client = nextClient ?? peachApi;
}

export function currentApi() {
  return client;
}

const apiActions = Reflux.createActions({
  getCategories: { asyncResult: true },
  getMerchants: { asyncResult: true },
  getTransactions: { asyncResult: true },
  reviewTransaction: { asyncResult: true },
});

/**
 * Failures go to `.failed`, never into `.completed` as data, so an error object
 * can't be stored and persisted as if the server had sent it. Both outcomes
 * carry the original call arguments after the result, which lets a caller tell
 * its own request apart from someone else's.
 */
function wire(action, run) {
  action.listen(async (...args) => {
    try {
      action.completed(await run(...args), ...args);
    } catch (error) {
      action.failed(error, ...args);
    }
  });
}

wire(apiActions.getCategories, () => client.getCategories());
wire(apiActions.getMerchants, () => client.getMerchants());
wire(apiActions.getTransactions, (options) => client.getTransactions(options));
wire(apiActions.reviewTransaction, (id, changes) => client.updateTransaction(id, changes));

export default apiActions;
