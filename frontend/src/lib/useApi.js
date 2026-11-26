import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';

// GET simples com estados de carregando/erro. path = null não busca nada.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: !!path });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    let alive = true;
    setState((s) => ({ ...s, error: null, loading: true }));
    api(path)
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => {
      alive = false;
    };
  }, [path, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
