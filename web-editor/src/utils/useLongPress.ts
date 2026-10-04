import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  /** Fired on a normal (short) tap/click */
  onClick: () => void;
  /** Fired once the press has been held past `thresholdMs` */
  onLongPress: () => void;
  /** How long the press must be held to count as a long-press (default 550ms) */
  thresholdMs?: number;
}

/**
 * Attaches long-press detection to a single interactive element (button)
 * while preserving its normal short-tap/click behavior. Works uniformly for
 * mouse and touch via Pointer Events.
 *
 * A held-past-threshold press fires `onLongPress` and suppresses the
 * ordinary click that the browser still dispatches on pointerup.
 */
export function useLongPress({ onClick, onLongPress, thresholdMs = 550 }: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedLongPressRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(() => {
    firedLongPressRef.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      firedLongPressRef.current = true;
      onLongPress();
    }, thresholdMs);
  }, [clearTimer, onLongPress, thresholdMs]);

  const handlePointerUp = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handlePointerLeave = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handleClick = useCallback(() => {
    if (firedLongPressRef.current) {
      // The long-press already fired for this press; swallow the click
      // event the browser still dispatches on release.
      firedLongPressRef.current = false;
      return;
    }
    onClick();
  }, [onClick]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Prevent the OS/browser long-press context menu from appearing.
    e.preventDefault();
  }, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerLeave,
    onPointerCancel: handlePointerLeave,
    onContextMenu: handleContextMenu,
    onClick: handleClick,
  };
}
