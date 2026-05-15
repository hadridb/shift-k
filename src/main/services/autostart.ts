import { app } from 'electron';

/**
 * Whether the current process was launched by the OS at user login
 * (rather than by the user double-clicking the app). We use this to
 * suppress the overlay window on autostart — the tray icon is the
 * entry point back into the app.
 */
export function wasOpenedAtLogin(): boolean {
  if (process.platform !== 'win32' && process.platform !== 'darwin') return false;
  return app.getLoginItemSettings().wasOpenedAtLogin;
}

/**
 * Apply the user's autostart preference to the OS login items.
 * No-op in dev mode (we don't want `npm run dev` to register a login
 * item pointing at electron.exe).
 */
export function applyAutostart(enabled: boolean): void {
  if (!app.isPackaged) return;
  if (process.platform !== 'win32' && process.platform !== 'darwin') return;

  app.setLoginItemSettings({
    openAtLogin: enabled,
    // On Windows, this places `--hidden` in the registry command so the
    // packaged app can detect autostart vs manual launch. Electron also
    // exposes wasOpenedAtLogin via getLoginItemSettings().
    args: ['--hidden'],
  });
}
