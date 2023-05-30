import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  categoriesPayload,
  merchantsPayload,
  transactionsPayload,
} from '../../../src/test-support/fixtures';
import apiActions, { configureApi } from '../../actions/apiActions';
import apiStore, {
  initialState,
  mergeCachedState,
  PERSIST_DEBOUNCE_MS,
  STORAGE_KEY,
} from '../apiStore';

/** Reflux dispatches on a microtask; this lets the queue drain. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function fakeApi(overrides = {}) {
  return {
    getCategories: jest.fn(async () => categoriesPayload),
    getMerchants: jest.fn(async () => merchantsPayload),
    getTransactions: jest.fn(async () => transactionsPayload),
    updateTransaction: jest.fn(async () => transactionsPayload[1]),
    ...overrides,
  };
}

describe('mergeCachedState', () => {
  it('fills slices that have not been answered yet', () => {
    const merged = mergeCachedState(initialState(), { categories: categoriesPayload });
    expect(merged.categories.status).toBe('ready');
    expect(merged.categories.data).toHaveLength(7);
    expect(merged.categories.fromCache).toBe(true);
  });

  it('never overwrites a slice the network has already filled', () => {
    const current = initialState();
    current.categories = { status: 'ready', data: [{ name: 'Fresh' }], error: null, updatedAt: 1 };
    const merged = mergeCachedState(current, { categories: categoriesPayload });
    expect(merged.categories.data).toEqual([{ name: 'Fresh' }]);
  });

  it.each([null, undefined, 'garbage', { categories: 'not a list' }, { categories: [] }])(
    'ignores the unusable cache %p',
    (cached) => {
      const merged = mergeCachedState(initialState(), cached);
      expect(merged.categories.status).toBe('idle');
    },
  );
});

describe('apiStore', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    apiStore.resetForTests();
    configureApi(fakeApi());
  });

  afterEach(() => apiStore.resetForTests());

  afterAll(() => configureApi(null));

  it('starts empty rather than undefined', () => {
    const state = apiStore.getCurrentState();
    expect(state.categories.data).toEqual([]);
    expect(state.transactions.status).toBe('idle');
  });

  it('records a loading state and then the normalised data', async () => {
    apiActions.getTransactions();
    await settle();

    const state = apiStore.getCurrentState();
    expect(state.transactions.status).toBe('ready');
    expect(state.transactions.data).toHaveLength(6);
    expect(state.transactions.data[0].amount).toBe(45.12);
  });

  it('notifies subscribers and hands back a working unsubscribe', async () => {
    const listener = jest.fn();
    const unsubscribe = apiStore.listen(listener);

    apiActions.getCategories();
    await settle();
    expect(listener).toHaveBeenCalled();

    const callsBefore = listener.mock.calls.length;
    unsubscribe();
    apiActions.getMerchants();
    await settle();
    expect(listener.mock.calls).toHaveLength(callsBefore);
  });

  it('records a failure as an error and does NOT write it into data', async () => {
    // The original called `completed({ data: error })`, so an Error object was
    // stored as if it were the category list and then persisted to disk.
    configureApi(
      fakeApi({
        getCategories: jest.fn(async () => {
          throw new Error('offline');
        }),
      }),
    );

    apiActions.getCategories();
    await settle();

    const slice = apiStore.getCurrentState().categories;
    expect(slice.status).toBe('error');
    expect(slice.error).toBe('offline');
    expect(slice.data).toEqual([]);
  });

  it('keeps showing cached data when a refresh fails', async () => {
    apiActions.getCategories();
    await settle();

    configureApi(
      fakeApi({
        getCategories: jest.fn(async () => {
          throw new Error('offline');
        }),
      }),
    );
    apiActions.getCategories();
    await settle();

    const slice = apiStore.getCurrentState().categories;
    expect(slice.status).toBe('ready');
    expect(slice.data).toHaveLength(7);
    expect(slice.error).toBe('offline');
  });

  it('applies a reviewed transaction in place without refetching the list', async () => {
    apiActions.getTransactions();
    await settle();

    apiActions.reviewTransaction(2, { reviewed: true });
    await settle();

    const updated = apiStore.getCurrentState().transactions.data.find((tx) => tx.id === 2);
    expect(updated.reviewed).toBe(false); // the stub echoes the unmodified fixture
    expect(apiStore.getCurrentState().transactions.data).toHaveLength(6);
  });

  it('persists a snapshot that can be read back and rehydrated', async () => {
    apiActions.getTransactions();
    await settle();
    await apiStore.persistNow();

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const cached = JSON.parse(raw);
    expect(cached.transactions).toHaveLength(6);

    const merged = mergeCachedState(initialState(), cached);
    expect(merged.transactions.data[0].date).toBeInstanceOf(Date);
    expect(merged.transactions.data[0].amount).toBe(45.12);
  });

  it('debounces persistence instead of serialising on every trigger', async () => {
    // The original store stringified the entire payload on every trigger. Three
    // slices landing in quick succession must produce exactly one disk write.
    // Driven directly rather than through Reflux so no timing is left to chance.
    jest.useFakeTimers();
    // The AsyncStorage jest mock is itself a jest.fn, so the spy inherits its
    // call history from earlier tests - clear it before measuring.
    const setItem = jest.spyOn(AsyncStorage, 'setItem').mockResolvedValue(undefined);
    setItem.mockClear();
    try {
      apiStore.markReady('categories', categoriesPayload);
      apiStore.markReady('merchants', merchantsPayload);
      apiStore.markReady('transactions', transactionsPayload);

      expect(setItem).not.toHaveBeenCalled();

      jest.advanceTimersByTime(PERSIST_DEBOUNCE_MS + 1);
      expect(setItem).toHaveBeenCalledTimes(1);

      const [, serialised] = setItem.mock.calls[0];
      const snapshot = JSON.parse(serialised);
      expect(snapshot.categories).toHaveLength(7);
      expect(snapshot.transactions).toHaveLength(6);
    } finally {
      setItem.mockRestore();
      jest.useRealTimers();
    }
  });
});
