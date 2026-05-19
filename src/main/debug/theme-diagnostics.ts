import os from 'os';
import { app, ipcMain, BrowserWindow } from 'electron';

export interface ThemeDiagnostics {
  platform: NodeJS.Platform;
  osRelease: string;
  windowsBuild: number | null;
  micaSupported: boolean;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  hasSetBackgroundMaterial: boolean;
  hasSetVibrancy: boolean;
}

export function collectThemeDiagnostics(): ThemeDiagnostics {
  const release = os.release();
  const windowsBuild =
    process.platform === 'win32'
      ? parseInt(release.split('.')[2] ?? '0', 10)
      : null;
  // Probe both APIs without actually calling them — `prototype` access just
  // tells us whether the method exists on this Electron build.
  const proto = BrowserWindow.prototype as unknown as Record<string, unknown>;
  return {
    platform: process.platform,
    osRelease: release,
    windowsBuild,
    micaSupported: windowsBuild !== null && windowsBuild >= 22000,
    electronVersion: process.versions.electron ?? 'unknown',
    chromeVersion: process.versions.chrome ?? 'unknown',
    nodeVersion: process.versions.node,
    hasSetBackgroundMaterial: typeof proto['setBackgroundMaterial'] === 'function',
    hasSetVibrancy: typeof proto['setVibrancy'] === 'function',
  };
}

export function logDiagnosticsAtStartup(): void {
  const d = collectThemeDiagnostics();
  console.log('═══ Shift-K theme diagnostics ═══');
  console.log('  platform           :', d.platform);
  console.log('  os.release()       :', d.osRelease);
  console.log('  windows build      :', d.windowsBuild ?? '(not Windows)');
  console.log('  Mica supported     :', d.micaSupported);
  console.log('  Electron version   :', d.electronVersion);
  console.log('  Chrome version     :', d.chromeVersion);
  console.log('  Node version       :', d.nodeVersion);
  console.log('  setBackgroundMaterial available :', d.hasSetBackgroundMaterial);
  console.log('  setVibrancy available           :', d.hasSetVibrancy);
  console.log('  app version        :', app.getVersion());
  console.log('═══════════════════════════════════');
}

export function registerThemeDiagnosticsIpc(): void {
  ipcMain.handle('debug:theme-info', () => collectThemeDiagnostics());
}
