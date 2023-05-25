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
 * The original code called `completed({ data: error, loadFail: true })` on
 * failure, so the error object was written into the store as if it were data
 * and then persisted to AsyncStorage. Failures now go to `.failed`.
 */
function wire(action, run) {
  action.listen(async (...args) => {
    try {
      action.completed(await run(...args));
    } catch (error) {
      action.failed(error);
    }
  });
}

wire(apiActions.getCategories, () => client.getCategories());
wire(apiActions.getMerchants, () => client.getMerchants());
wire(apiActions.getTransactions, (options) => client.getTransactions(options));
wire(apiActions.reviewTransaction, (id, changes) => client.updateTransaction(id, changes));

export default apiActions;
