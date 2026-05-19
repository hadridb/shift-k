import { useEffect, useState } from 'react';
import type { ThemeId } from '@shared/types';

/**
 * Applies the given theme to this window AND returns the currently
 * effective theme id so callers can drive conditional rendering off
 * the live value (e.g. "mount the Aurora gradient component", "mount
 * the .glass-layer div").
 *
 * Three effects:
 *
 * 1. When the prop changes (config reload, or in-window state change),
 *    set local state + `<html data-theme>` + fire IPC `theme:apply`
 *    so the main process applies any native window-level material
 *    (Mica / vibrancy).
 *
 * 2. Subscribe to `theme:changed`, broadcast by the main process to
 *    every BrowserWindow whenever `theme:apply` IPC fires anywhere
 *    (typically from the Settings picker). Update local state +
 *    `<html data-theme>`. This is the channel through which the
 *    overlay window learns that the user is live-previewing a theme
 *    in the Settings window — without it, the overlay's React tree
 *    would never see the new theme and `.glass-layer` /
 *    `<AuroraBackground />` would never mount.
 *
 * 3. Subscribe to `theme:glass-fallback` to flip the
 *    `<html data-glass-fallback>` attribute on Liquid Glass / non-mac.
 *
 * All three handlers `console.log` what they receive so the dev terminal
 * shows the IPC handshake when chasing a theme bug (see ADR-029 +
 * docs/THEME_DEBUG.md).
 */
export function useApplyTheme(themeId: ThemeId): ThemeId {
  const [activeTheme, setActiveTheme] = useState<ThemeId>(themeId);

  // Effect 1 — prop drives initial state + native effect
  useEffect(() => {
    setActiveTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    console.log('[renderer] useApplyTheme prop —', themeId);
    void window.shiftK.applyTheme?.(themeId);
  }, [themeId]);

  // Effect 2 — broadcast from main keeps every window in sync
  useEffect(() => {
    if (!window.shiftK.onThemeChanged) return;
    const unsubscribe = window.shiftK.onThemeChanged((id) => {
      console.log('[renderer] theme:changed received —', id);
      setActiveTheme(id);
      document.documentElement.setAttribute('data-theme', id);
    });
    return unsubscribe;
  }, []);

  // Effect 3 — glass fallback flag for Liquid Glass on non-macOS
  useEffect(() => {
    if (!window.shiftK.onGlassFallback) return;
    const unsubscribe = window.shiftK.onGlassFallback((enabled) => {
      console.log('[renderer] glass-fallback received —', enabled);
      if (enabled) {
        document.documentElement.setAttribute('data-glass-fallback', 'true');
      } else {
        document.documentElement.removeAttribute('data-glass-fallback');
      }
    });
    return unsubscribe;
  }, []);

  return activeTheme;
}
