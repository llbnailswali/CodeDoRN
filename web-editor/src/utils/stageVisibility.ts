import { useSyncExternalStore } from 'react';

/**
 * Whether the stage is actually on screen. The Android stage is covered by a native loading overlay until the page reports it is ready,
 * so anything meant to happen "when the learner sees the stage" (the Task dialog opening, for example) must wait for this. It is true by
 * default: the normal web app has no overlay. main.tsx sets it to false for a stage launch and NativeStageHost sets it back to true once
 * the overlay has gone.
 */
let visible = true;
const listeners = new Set<() => void>();

export const setStageVisible = (value: boolean): void => {
  if (visible === value) return;
  visible = value;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useStageVisible = (): boolean => useSyncExternalStore(subscribe, () => visible, () => true);
