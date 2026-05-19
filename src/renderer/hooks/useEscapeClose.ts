import { useEffect } from 'react';

/**
 * Pure predicate: should this keyboard event trigger an Escape-driven close?
 *
 * Returns true only when the user pressed Escape outside of a form control
 * (so typing in an input or textarea doesn't hijack the IME or autocomplete
 * dismissal). Exported separately from the hook so it can be unit-tested
 * without a React render environment.
 */
export function isEscapeForClose(e: {
  key: string;
  target: EventTarget | null;
}): boolean {
  if (e.key !== 'Escape') return false;
  const tag = (e.target as HTMLElement | null)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return false;
  return true;
}

/**
 * Calls `onClose` when the user presses Escape, while `enabled` is true.
 * Listener attaches to `document` so it fires regardless of focus.
 */
export function useEscapeClose(enabled: boolean, onClose: () => void): void {
  useEffect(() => {
    if (!enabled) return;
    function handler(e: KeyboardEvent) {
      if (!isEscapeForClose(e)) return;
      e.stopPropagation();
      onClose();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled, onClose]);
}
