import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import apiActions from '../../app/actions/apiActions';
import apiStore from '../../app/stores/apiStore';
import {
  pendingReview,
  sortByDateDescending,
  topCategories,
  totalSpend,
} from '../domain/transactions';

/**
 * Bridges the Reflux singleton into React with `useSyncExternalStore`, which is
 * the supported way to read an external store in React 18 - it keeps renders
 * consistent under concurrent rendering, where a bare `listen` + `setState`
 * can tear.
 */
function subscribe(onStoreChange) {
  return apiStore.listen(onStoreChange);
}

function getSnapshot() {
  return apiStore.getCurrentState();
}

export function useApiState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Fires the initial loads exactly once per mount. The original effect returned
 * `() => unsubscribe` - a function returning the unsubscribe function rather
 * than calling it - so the listener was never removed.
 */
export function useBootstrap() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    apiActions.getCategories();
    apiActions.getMerchants();
    apiActions.getTransactions();
  }, []);
}

export function refresh() {
  apiActions.getCategories();
  apiActions.getMerchants();
  apiActions.getTransactions();
}

/**
 * Collapses the three slices into one status for a whole-screen state machine.
 * Errors only surface when there is nothing cached to show instead.
 */
export function combineStatus(slices) {
  if (slices.some((slice) => slice.status === 'error')) {
    return 'error';
  }
  if (slices.every((slice) => slice.status === 'ready')) {
    return 'ready';
  }
  return 'loading';
}

export function useDashboard() {
  const state = useApiState();

  return useMemo(() => {
    const transactions = state.transactions.data;
    const sorted = sortByDateDescending(transactions);
    return {
      status: combineStatus([state.transactions, state.categories]),
      error: state.transactions.error ?? state.categories.error,
      transactions: sorted,
      recentTransactions: sorted.slice(0, RECENT_TRANSACTION_LIMIT),
      pendingTransactions: pendingReview(sorted),
      totalSpend: totalSpend(transactions),
      topCategories: topCategories(transactions),
      categories: state.categories.data,
      isFromCache: state.transactions.fromCache === true,
    };
  }, [state]);
}

export const RECENT_TRANSACTION_LIMIT = 20;

export function useCategories() {
  const state = useApiState();
  return useMemo(
    () => ({
      status: state.categories.status,
      error: state.categories.error,
      categories: state.categories.data,
    }),
    [state.categories],
  );
}
