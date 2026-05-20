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
 *
 * Sprint 8d switched the macOS Liquid Glass vibrancy material from
 * `'hud'` (dark, opaque HUD plate) to `'fullscreen-ui'`.
 *
 * Sprint 8d.2 pushed further: `'fullscreen-ui'` → `'sidebar'`
 * (`NSVisualEffectMaterialSidebar`). `sidebar` is the thinnest stock
 * NSVisualEffectMaterial — the same material Apple uses for the
 * Finder / Mail / Notes sidebars. It produces a noticeably more
 * transparent + dynamic backdrop than `fullscreen-ui` (which was
 * still reading as a fairly thick HUD plate in 8d). Text stays
 * legible because the overlay paints its own --text-primary tokens
 * on top, and slot rows have their own --bg-hover state.
 *
 * Electron 33 doesn't expose NSGlassEffectView (the macOS 26 Liquid
 * Glass API), so `sidebar` + the renderer-side CSS / SVG passes are
 * the best stock approximation available. See ADR-030 + ADR-030
 * (Sprint 8d / 8d.2 revisions).
 */

const MICA_MIN_BUILD = 22000;

export function isWindows11OrLater(): boolean {
  if (process.platform !== 'win32') return false;
  const parts = os.release().split('.');
  const build = parseInt(parts[2] ?? '0', 10);
  return build >= MICA_MIN_BUILD;
}

interface Plan {
  macosVibrancy: 'sidebar' | null;
  /** Render the CSS backdrop-filter fallback in the renderer (Windows liquid-glass). */
  cssGlassFallback: boolean;
}

function planFor(themeId: ThemeId): Plan {
  if (themeId === 'liquid-glass') {
    return {
      macosVibrancy: 'sidebar',
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
  // True on Windows / Linux (no native vibrancy → CSS does everything),
  // false on macOS (native vibrancy + subtle CSS layered on top).
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
