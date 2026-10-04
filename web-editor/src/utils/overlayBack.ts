import { useEffect, useRef } from 'react';

/**
 * Android's hardware Back button must close the topmost open dialog / sheet / menu before it navigates anywhere.
 * Each overlay registers a close callback while it is open (useBackClosesOverlay); the back-button handler calls
 * closeTopOverlay() first and only navigates when it returns false. Opening order is stacking order.
 */
type Entry = { id: number; close: () => void };

const stack: Entry[] = [];
let nextId = 1;

/** Closes the most recently opened overlay. Returns true if there was one (the back press is then consumed). */
export const closeTopOverlay = (): boolean => {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.close();
  return true;
};

/** While `isOpen` is true, Back closes this overlay by calling `close`. */
export const useBackClosesOverlay = (isOpen: boolean, close: () => void): void => {
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!isOpen) return;
    const entry: Entry = { id: nextId++, close: () => closeRef.current() };
    stack.push(entry);
    return () => {
      const i = stack.findIndex((e) => e.id === entry.id);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [isOpen]);
};

const guards: Entry[] = [];

/**
 * Runs the most recently registered back guard (a screen that wants to intercept Back, for example to ask "leave without
 * saving?"). Call it after closeTopOverlay() returned false. Returns true if a guard took the back press.
 */
export const runBackGuard = (): boolean => {
  const top = guards[guards.length - 1];
  if (!top) return false;
  top.close();
  return true;
};

/** While `active` is true, Back calls `onBack` instead of navigating (open overlays are still closed first). */
export const useBackGuard = (active: boolean, onBack: () => void): void => {
  const ref = useRef(onBack);
  ref.current = onBack;

  useEffect(() => {
    if (!active) return;
    const entry: Entry = { id: nextId++, close: () => ref.current() };
    guards.push(entry);
    return () => {
      const i = guards.findIndex((e) => e.id === entry.id);
      if (i >= 0) guards.splice(i, 1);
    };
  }, [active]);
};
