import os from 'os';
import { BrowserWindow } from 'electron';
import type { ThemeId } from '@shared/types';
import { getOverlayWindow } from '@main/windows/overlay';

/**
 * Theme-applier: translates a theme id into native window-level effects
 * on the platform that supports them. The renderer drives the visual
 * theme through CSS variables; this service applies the parts that
 * can't be expressed in CSS (macOS vibrancy).
 *
 * Sprint 7.6 removed Mica entirely — the Electron / Chromium rendering
 * of `setBackgroundMaterial('mica')` didn't match the WinUI 3 fidelity
 * users associate with Windows 11 Mica, so the theme was retired and
 * its code paths along with it. The `isWindows11OrLater` helper stays
 * exported in case a future sprint reintroduces a Windows-build-gated
 * effect. See ADR-029.
 */

const MICA_MIN_BUILD = 22000;

export function isWindows11OrLater(): boolean {
  if (process.platform !== 'win32') return false;
  const parts = os.release().split('.');
  const build = parseInt(parts[2] ?? '0', 10);
  return build >= MICA_MIN_BUILD;
}

interface Plan {
  macosVibrancy: 'hud' | null;
  /** Render the CSS backdrop-filter fallback in the renderer (Windows liquid-glass). */
  cssGlassFallback: boolean;
}

function planFor(themeId: ThemeId): Plan {
  if (themeId === 'liquid-glass') {
    return {
      macosVibrancy: 'hud',
      cssGlassFallback: process.platform !== 'darwin',
    };
  }
  return { macosVibrancy: null, cssGlassFallback: false };
}

function applyToWindow(win: BrowserWindow, themeId: ThemeId, plan: Plan): void {
  console.log(
    '[theme] applying',
    themeId,
    '— platform=', process.platform,
    'os.release=', os.release(),
    'plan=', plan,
  );

  if (process.platform === 'darwin') {
    try {
      // setVibrancy(null) explicitly clears any previous vibrancy.
      win.setVibrancy(plan.macosVibrancy as Parameters<BrowserWindow['setVibrancy']>[0]);
      console.log('[theme] setVibrancy(', plan.macosVibrancy, ') applied');
    } catch (err) {
      console.error('[theme] setVibrancy failed:', err);
    }
  }

  // Tell the renderer whether to draw the CSS backdrop-filter fallback.
  win.webContents.send('theme:glass-fallback', plan.cssGlassFallback);
  console.log('[theme] glass-fallback signal sent:', plan.cssGlassFallback);
}

export function applyTheme(themeId: ThemeId): void {
  const plan = planFor(themeId);
  const overlay = getOverlayWindow();
  if (!overlay) {
    console.warn('[theme] applyTheme called but no overlay window');
    return;
  }
  applyToWindow(overlay, themeId, plan);
}

/** Re-apply on every newly created window. */
export function applyThemeToWindow(win: BrowserWindow, themeId: ThemeId): void {
  applyToWindow(win, themeId, planFor(themeId));
}
