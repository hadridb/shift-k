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

function applyToWindow(win: BrowserWindow, themeId: ThemeId, plan: Plan): void {
  console.log(
    '[theme] applying',
    themeId,
    '— platform=', process.platform,
    'os.release=', os.release(),
    'plan=', plan,
  );

  if (process.platform === 'win32') {
    const win11 = isWindows11OrLater();
    console.log('[theme] win11 detected:', win11, '(build threshold', MICA_MIN_BUILD, ')');
    if (plan.windowsMaterial !== 'none' && win11) {
      try {
        win.setBackgroundMaterial?.(plan.windowsMaterial);
        console.log('[theme] setBackgroundMaterial(', plan.windowsMaterial, ') succeeded');
      } catch (err) {
        console.error('[theme] setBackgroundMaterial failed:', err);
      }
    } else {
      try {
        win.setBackgroundMaterial?.('none');
        console.log('[theme] setBackgroundMaterial(none) — cleared');
      } catch (err) {
        console.error('[theme] setBackgroundMaterial(none) failed:', err);
      }
    }
  } else if (process.platform === 'darwin') {
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

/** Re-apply on every newly created window so toggling Mica before the
 *  settings window is opened still produces the right look. */
export function applyThemeToWindow(win: BrowserWindow, themeId: ThemeId): void {
  applyToWindow(win, themeId, planFor(themeId));
}
