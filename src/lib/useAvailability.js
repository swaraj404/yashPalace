import { useCallback, useEffect, useState } from 'react';
import { todayInIndia } from '../../shared/dates';

const EMPTY = new Set();

export function useAvailability(from, to, version = 0) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    status: 'loading',
    today: todayInIndia(),
    unavailable: EMPTY,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, status: 'loading' }));
    fetch(`/api/availability?from=${from}&to=${to}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) =>
        setState({ status: 'ready', today: data.today, unavailable: new Set(data.unavailable) })
      )
      .catch((err) => {
        if (err.name !== 'AbortError') setState((s) => ({ ...s, status: 'error' }));
      });
    return () => controller.abort();
  }, [from, to, version, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
