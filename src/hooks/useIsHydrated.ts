import { useSyncExternalStore } from 'react'

const subscribe = () => () => {};

/**
 * Returns whether the component has completed React hydration.
 */
export default function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
