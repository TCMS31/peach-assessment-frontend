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
 *
 * The review card and the category picker are both mounted while the picker
 * is open, and the Reflux action is global. Each hook therefore only reacts to
 * the request object it sent itself; otherwise saving a category would also
 * close the review card underneath it.
 */
export function useReviewTransaction() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const pending = useRef(null);

  useEffect(() => {
    mounted.current = true;
    const isOwn = (changes) =>
      mounted.current && changes !== undefined && changes === pending.current;

    const stopCompleted = apiActions.reviewTransaction.completed.listen(
      (_transaction, _id, changes) => {
        if (isOwn(changes)) {
          pending.current = null;
          setStatus('done');
          setError(null);
        }
      },
    );
    const stopFailed = apiActions.reviewTransaction.failed.listen((failure, _id, changes) => {
      if (isOwn(changes)) {
        pending.current = null;
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
    const request = { ...changes };
    pending.current = request;
    setStatus('saving');
    setError(null);
    apiActions.reviewTransaction(transactionId, request);
  }, []);

  const reset = useCallback(() => {
    pending.current = null;
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, submit, reset, isSaving: status === 'saving' };
}
