import AsyncStorage from '@react-native-async-storage/async-storage';
import Reflux from 'reflux';

import { normalizeCategories, normalizeTransactions } from '../../src/domain/transactions';
import apiActions from '../actions/apiActions';

export const STORAGE_KEY = 'peach.apiData.v2';

/**
 * Writes are batched behind this delay. The original store called
 * `AsyncStorage.setItem(JSON.stringify(everything))` on every single trigger,
 * which serialises the whole ledger on the JS thread each time a slice lands.
 */
export const PERSIST_DEBOUNCE_MS = 400;

export const SLICES = ['categories', 'merchants', 'transactions'];

const identity = (value) => (Array.isArray(value) ? value : []);

const SLICE_NORMALIZERS = {
  categories: normalizeCategories,
  merchants: identity,
  transactions: normalizeTransactions,
};

function emptySlice() {
  return { status: 'idle', data: [], error: null, updatedAt: null };
}

export function initialState() {
  return {
    hydrated: false,
    categories: emptySlice(),
    merchants: emptySlice(),
    transactions: emptySlice(),
  };
}

/**
 * Cached data only fills slices the network has not already answered, so a slow
 * disk read can never overwrite a fresh response.
 */
export function mergeCachedState(current, cached) {
  if (cached === null || typeof cached !== 'object') {
    return current;
  }
  const next = { ...current };
  for (const slice of SLICES) {
    if (current[slice].status !== 'idle') {
      continue;
    }
    const cachedData = cached[slice];
    if (!Array.isArray(cachedData) || cachedData.length === 0) {
      continue;
    }
    next[slice] = {
      status: 'ready',
      data: SLICE_NORMALIZERS[slice](cachedData),
      error: null,
      updatedAt: cached.updatedAt ?? null,
      fromCache: true,
    };
  }
  return next;
}

const apiStore = Reflux.createStore({
  init() {
    this.state = initialState();
    this.persistTimer = null;

    // Registered synchronously. The original registered these inside an
    // AsyncStorage callback, so any response that arrived before the disk read
    // finished - or at all, if the read errored - was dropped on the floor.
    for (const slice of SLICES) {
      const action = apiActions[actionNameFor(slice)];
      this.listenTo(action, () => this.markLoading(slice));
      this.listenTo(action.completed, (payload) => this.markReady(slice, payload));
      this.listenTo(action.failed, (error) => this.markFailed(slice, error));
    }

    this.listenTo(apiActions.reviewTransaction.completed, (transaction) =>
      this.applyTransaction(transaction),
    );

    this.hydrate();
  },

  async hydrate() {
    let cached = null;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      cached = raw ? JSON.parse(raw) : null;
    } catch (error) {
      // A missing or corrupt cache is not an application error.
      cached = null;
    }
    this.setState((current) => ({ ...mergeCachedState(current, cached), hydrated: true }), {
      persist: false,
    });
  },

  setState(updater, { persist = true } = {}) {
    const next = updater(this.state);
    if (next === this.state) {
      return;
    }
    this.state = next;
    this.trigger(this.state);
    if (persist) {
      this.schedulePersist();
    }
  },

  markLoading(slice) {
    this.setState(
      (current) => ({
        ...current,
        [slice]: { ...current[slice], status: 'loading', error: null },
      }),
      { persist: false },
    );
  },

  markReady(slice, payload) {
    this.setState((current) => ({
      ...current,
      [slice]: {
        status: 'ready',
        data: SLICE_NORMALIZERS[slice](payload),
        error: null,
        updatedAt: Date.now(),
      },
    }));
  },

  markFailed(slice, error) {
    this.setState(
      (current) => ({
        ...current,
        [slice]: {
          ...current[slice],
          status: current[slice].data.length > 0 ? 'ready' : 'error',
          error: error?.message ?? 'Something went wrong',
        },
      }),
      { persist: false },
    );
  },

  /** Applies a single updated transaction in place; no refetch of the list. */
  applyTransaction(payload) {
    const [updated] = normalizeTransactions([payload]);
    if (!updated || updated.id === null) {
      return;
    }
    this.setState((current) => {
      const existing = current.transactions.data;
      const index = existing.findIndex((tx) => tx.id === updated.id);
      if (index === -1) {
        return current;
      }
      const data = [...existing];
      data[index] = updated;
      return { ...current, transactions: { ...current.transactions, data, updatedAt: Date.now() } };
    });
  },

  schedulePersist() {
    if (this.persistTimer !== null) {
      clearTimeout(this.persistTimer);
    }
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      this.persistNow();
    }, PERSIST_DEBOUNCE_MS);
  },

  async persistNow() {
    const snapshot = { updatedAt: Date.now() };
    for (const slice of SLICES) {
      snapshot[slice] = this.state[slice].data;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (error) {
      // Persistence is best-effort; the in-memory state remains authoritative.
    }
  },

  getCurrentState() {
    return this.state;
  },

  /** Test hook: returns the store to a known state without reloading the app. */
  resetForTests() {
    if (this.persistTimer !== null) {
      clearTimeout(this.persistTimer);
      this.persistTimer = null;
    }
    this.state = initialState();
    this.trigger(this.state);
  },
});

function actionNameFor(slice) {
  return `get${slice.charAt(0).toUpperCase()}${slice.slice(1)}`;
}

export default apiStore;
