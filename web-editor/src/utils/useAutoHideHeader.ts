import { useCallback, useRef, useState } from 'react';

/**
 * Lets an editor screen's header slide away while the learner scrolls the code down and come back when they scroll up,
 * so the code gets the screen. Put `ref` and `style` on the header and pass `onScrollDirection` to the editor.
 * `forceShow` keeps it visible (e.g. while its overflow menu is open).
 */
export function useAutoHideHeader(forceShow: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const lockUntil = useRef(0);
  const onScrollDirection = useCallback((direction: 'up' | 'down') => {
    // Hiding the header makes the code area taller, which can itself nudge the scroll position: ignore that for a moment.
    if (Date.now() < lockUntil.current) return;
    setHidden((previous) => {
      const next = direction === 'down';
      if (next !== previous) lockUntil.current = Date.now() + 450;
      return next;
    });
  }, []);
  const height = ref.current?.offsetHeight ?? 0;
  const style: React.CSSProperties = { marginTop: hidden && !forceShow ? -height : 0, transition: 'margin-top 200ms ease' };
  return { ref, style, onScrollDirection };
}
