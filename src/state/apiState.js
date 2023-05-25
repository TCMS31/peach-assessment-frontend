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
 * Fires the initial loads once per mount. The ref guard keeps React's
 * development double-invoke of effects from sending every request twice.
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

/** A slice that has been answered before keeps showing its data while it reloads. */
function hasAnswer(slice) {
  return slice.updatedAt !== null || slice.data.length > 0;
}

/**
 * Collapses several slices into one status for a whole-screen state machine.
 * Errors only surface when there is nothing to show instead, and a refresh of
 * data already on screen stays 'ready' so a pull-to-refresh never blanks it.
 */
export function combineStatus(slices) {
  if (slices.some((slice) => slice.status === 'error')) {
    return 'error';
  }
  if (slices.every((slice) => slice.status === 'ready' || hasAnswer(slice))) {
    return 'ready';
  }
  return 'loading';
}

export function isRefreshing(slices) {
  return combineStatus(slices) === 'ready' && slices.some((slice) => slice.status === 'loading');
}

export const RECENT_TRANSACTION_LIMIT = 20;

export function useDashboard() {
  const state = useApiState();

  return useMemo(() => {
    const transactions = state.transactions.data;
    const sorted = sortByDateDescending(transactions);
    const slices = [state.transactions, state.categories];
    return {
      status: combineStatus(slices),
      isRefreshing: isRefreshing(slices),
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

export function useCategories() {
  const state = useApiState();
  return useMemo(
    () => ({
      status: combineStatus([state.categories]),
      error: state.categories.error,
      categories: state.categories.data,
    }),
    [state.categories],
  );
}
