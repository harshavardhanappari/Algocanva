import { useCallback, useEffect, useRef, useState } from 'react';

// Runs `fn` whenever `deps` change. Ignores responses from outdated requests.
export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });
  const counter = useRef(0);

  const run = useCallback(() => {
    const id = ++counter.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((res) => id === counter.current && setState({ data: res.data, meta: res.meta || null, loading: false, error: null }))
      .catch((err) => id === counter.current && setState((s) => ({ ...s, loading: false, error: err })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}
