import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async function when its dependencies change and tracks
 * loading / error / data. Stale responses from earlier calls are ignored.
 */
export function useAsync(asyncFn, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: enabled });
  const callId = useRef(0);

  const run = useCallback(async () => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await asyncFn();
      if (id === callId.current) setState({ data, error: null, loading: false });
    } catch (error) {
      if (id === callId.current) setState({ data: null, error, loading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (enabled) run();
    else setState({ data: null, error: null, loading: false });
    return () => {
      callId.current += 1; // invalidate in-flight call on unmount/change
    };
  }, [run, enabled]);

  const setData = useCallback((updater) => {
    setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}
