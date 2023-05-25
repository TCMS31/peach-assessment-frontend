import Reflux from 'reflux';

import { peachApi } from '../../src/api/peachApi';

/**
 * Reflux action layer: dispatch, await, and report success or failure. The
 * transport lives in `src/api`.
 *
 * `configureApi` lets tests swap the client without monkey-patching fetch.
 */
let client = peachApi;

export function configureApi(nextClient) {
  client = nextClient ?? peachApi;
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
