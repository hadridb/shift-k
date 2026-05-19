import os from 'os';
import { BrowserWindow } from 'electron';
import type { ThemeId } from '@shared/types';
import { getOverlayWindow } from '@main/windows/overlay';

/**
 * Theme-applier: translates a theme id into native window-level effects
 * on the platform that supports them. The renderer drives the visual
 * theme through CSS variables; this service applies the parts that
 * can't be expressed in CSS (Windows Mica background material, macOS
 * vibrancy). See ADR-029.
 */

const MICA_MIN_BUILD = 22000; // Windows 11 release; setBackgroundMaterial gated on this

function isWindows11OrLater(): boolean {
  if (process.platform !== 'win32') return false;
  const parts = os.release().split('.');
  const build = parseInt(parts[2] ?? '0', 10);
  return build >= MICA_MIN_BUILD;
}

interface Plan {
  windowsMaterial: 'mica' | 'acrylic' | 'tabbed' | 'none';
  macosVibrancy: 'hud' | null;
  /** Render the CSS backdrop-filter fallback in the renderer (Windows liquid-glass). */
  cssGlassFallback: boolean;
}

function planFor(themeId: ThemeId): Plan {
  switch (themeId) {
    case 'mica':
      return { windowsMaterial: 'mica', macosVibrancy: null, cssGlassFallback: false };
    case 'liquid-glass':
      // macOS gets real vibrancy; Windows/Linux fall back to backdrop-filter in CSS.
      return {
        windowsMaterial: 'none',
        macosVibrancy: 'hud',
        cssGlassFallback: process.platform !== 'darwin',
      };
    default:
      return { windowsMaterial: 'none', macosVibrancy: null, cssGlassFallback: false };
  }
}

function applyToWindow(win: BrowserWindow, plan: Plan): void {
  if (process.platform === 'win32') {
    if (plan.windowsMaterial !== 'none' && isWindows11OrLater()) {
      // setBackgroundMaterial is gated on Win 11 build 22000+.
      try {
        win.setBackgroundMaterial?.(plan.windowsMaterial);
      } catch {
        // Older Electron / unsupported — silently ignore.
      }
    } else {
      try {
        win.setBackgroundMaterial?.('none');
      } catch {
        // ignore
      }
    }
  } else if (process.platform === 'darwin') {
    try {
      // setVibrancy(null) explicitly clears any previous vibrancy.
      win.setVibrancy(plan.macosVibrancy as Parameters<BrowserWindow['setVibrancy']>[0]);
    } catch {
      // ignore
    }
  }

  // Tell the renderer whether to draw the CSS backdrop-filter fallback.
  win.webContents.send('theme:glass-fallback', plan.cssGlassFallback);
}

export function applyTheme(themeId: ThemeId): void {
  const plan = planFor(themeId);
  const overlay = getOverlayWindow();
  if (overlay) applyToWindow(overlay, plan);
}

/** Re-apply on every newly created window so toggling Mica before the
 *  settings window is opened still produces the right look. */
export function applyThemeToWindow(win: BrowserWindow, themeId: ThemeId): void {
  applyToWindow(win, planFor(themeId));
}
