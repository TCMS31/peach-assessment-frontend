import { createPeachApi } from '../peachApi';

function stubClient() {
  return {
    get: jest.fn(async () => []),
    patch: jest.fn(async () => ({})),
  };
}

describe('createPeachApi', () => {
  it('maps the collection endpoints to the Rails routes', async () => {
    const client = stubClient();
    const api = createPeachApi(client);

    await api.getCategories();
    await api.getMerchants();
    await api.getTransactions();

    expect(client.get.mock.calls.map(([path]) => path)).toEqual([
      '/categories',
      '/merchants',
      '/transactions',
    ]);
  });

  it('filters server-side so the client never downloads the whole ledger', async () => {
    const client = stubClient();
    await createPeachApi(client).getTransactions({ pendingReview: true });
    expect(client.get).toHaveBeenCalledWith('/transactions?pending_review=true');
  });

  it('does not send a filter that was not asked for', async () => {
    const client = stubClient();
    await createPeachApi(client).getTransactions({ pendingReview: false, reviewed: false });
    expect(client.get).toHaveBeenCalledWith('/transactions');
  });

  it('escapes the id in a member route', async () => {
    const client = stubClient();
    await createPeachApi(client).getTransaction('1 2');
    expect(client.get).toHaveBeenCalledWith('/transactions/1%202');
  });

  it('sends the nested shape TransactionsController permits', async () => {
    const client = stubClient();
    await createPeachApi(client).updateTransaction(7, {
      reviewed: true,
      category: { name: 'Travel', emoji: '✈️' },
    });

    expect(client.patch).toHaveBeenCalledWith('/transactions/7', {
      transaction: {
        reviewed: true,
        category_attributes: { name: 'Travel', emoji: '✈️' },
      },
    });
  });

  it('omits keys that were not supplied rather than sending undefined', async () => {
    const client = stubClient();
    await createPeachApi(client).updateTransaction(7, { reviewed: true });
    expect(client.patch).toHaveBeenCalledWith('/transactions/7', {
      transaction: { reviewed: true },
    });
  });
});
