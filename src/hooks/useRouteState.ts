import { useMemo, useState } from 'react';
import type { RouteState } from '../types';

export function useRouteState<T>(value: T) {
  const [state, setState] = useState<T>(value);
  return useMemo(() => ({ state, setState }), [state]);
}

export function useRouteStatus(initialState: RouteState = 'loading') {
  const [status, setStatus] = useState<RouteState>(initialState);
  return { status, setStatus };
}
