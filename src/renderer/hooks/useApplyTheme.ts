import { useEffect } from 'react';
import type { ThemeId } from '@shared/types';

/**
 * Applies the given theme by mutating <html data-theme="..."> and asking
 * the main process to flip any native window-level effects (Mica /
 * macOS vibrancy). The main then echoes back a `theme:glass-fallback`
 * event indicating whether the renderer should draw the CSS
 * backdrop-filter fallback (Liquid Glass on non-macOS); we flip a
 * `data-glass-fallback` attribute on <html> in response.
 *
 * Components that consume CSS vars update immediately thanks to the
 * `:root[data-theme=...]` selectors in themes.css.
 */
export function useApplyTheme(themeId: ThemeId): void {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId);
    void window.shiftK.applyTheme?.(themeId);
  }, [themeId]);

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
