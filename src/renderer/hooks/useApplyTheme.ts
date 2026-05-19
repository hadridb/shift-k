import { useEffect } from 'react';
import type { ThemeId } from '@shared/types';

/**
 * Applies a theme by mutating `<html data-theme>` and asking the main
 * process to flip native window-level effects (Mica / macOS vibrancy).
 *
 * Two effects:
 *
 * 1. When the theme prop changes (a user-initiated change in this window
 *    OR config reloaded from disk), set data-theme locally AND fire IPC
 *    `theme:apply`. Main applies native effects on the overlay then
 *    broadcasts `theme:changed` back to every window.
 *
 * 2. Subscribe to `theme:changed` from the main process. This is how
 *    *other* windows learn that the user clicked a theme card — the
 *    overlay can't see the Settings window's local state but receives
 *    the broadcast and flips its own data-theme attribute. Without
 *    this listener, the overlay's CSS variables would stay frozen on
 *    the persisted theme even when the user is live-previewing a
 *    different one, hiding Mica / Aurora / Liquid Glass behind opaque
 *    CSS. See ADR-029 + docs/THEME_DEBUG.md.
 *
 * 3. Subscribe to `theme:glass-fallback` so the renderer knows whether
 *    to draw the CSS backdrop-filter fallback for Liquid Glass on
 *    non-macOS platforms.
 */
export function useApplyTheme(themeId: ThemeId): void {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    void window.shiftK.applyTheme?.(themeId);
  }, [themeId]);

  useEffect(() => {
    if (!window.shiftK.onThemeChanged) return;
    const unsubscribe = window.shiftK.onThemeChanged((id) => {
      document.documentElement.setAttribute('data-theme', id);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!window.shiftK.onGlassFallback) return;
    const unsubscribe = window.shiftK.onGlassFallback((enabled) => {
      if (enabled) {
        document.documentElement.setAttribute('data-glass-fallback', 'true');
      } else {
        document.documentElement.removeAttribute('data-glass-fallback');
      }
    });
    return unsubscribe;
  }, []);
}
