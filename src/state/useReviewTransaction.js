import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useApiState } from './apiState';
import apiActions from '../../app/actions/apiActions';

/** Looks a transaction up in the store by id. */
export function useTransaction(transactionId) {
  const state = useApiState();
  return useMemo(
    () => state.transactions.data.find((tx) => String(tx.id) === String(transactionId)) ?? null,
    [state.transactions.data, transactionId],
  );
}

/**
 * Drives one PATCH /transactions/:id. Exposes an explicit status so the screen
 * can disable its button while saving and surface a failure instead of
 * navigating away as though the write had succeeded.
 */
export function useReviewTransaction() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const stopCompleted = apiActions.reviewTransaction.completed.listen(() => {
      if (mounted.current) {
        setStatus('done');
        setError(null);
      }
    });
    const stopFailed = apiActions.reviewTransaction.failed.listen((failure) => {
      if (mounted.current) {
        setStatus('error');
        setError(failure?.message ?? 'Could not save this transaction');
      }
    });
    return () => {
      mounted.current = false;
      stopCompleted();
      stopFailed();
    };
  }, []);

  const submit = useCallback((transactionId, changes) => {
    setStatus('saving');
    setError(null);
    apiActions.reviewTransaction(transactionId, changes);
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, submit, reset, isSaving: status === 'saving' };
}
