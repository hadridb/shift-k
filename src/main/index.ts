import { app, BrowserWindow, Notification } from 'electron';
import path from 'path';
import { registerConfigHandlers } from './ipc/config-handlers';
import { createOverlayWindow } from './windows/overlay';
import { createOnboardingWindow } from './windows/onboarding';
import {
  syncWatcher,
  setWatcherEventHandler,
  closeWatcher,
} from './services/watcher-manager';
import { registerShortcuts, unregisterShortcuts } from './shortcuts';
import { createTray, destroyTray } from './tray';
import { applyAutostart, wasOpenedAtLogin } from './services/autostart';
import { addActivity } from './services/activity-log';
import { applyTheme } from './services/theme-applier';
import { classifyExtension } from '@shared/i18n/activity';
import { getConfig, onConfigChange } from '@core/config/store';

function isConfigComplete(): boolean {
  const config = getConfig();
  return Boolean(config.root && config.downloadsPath);
}

// Hidden launch detection: either the OS-reported wasOpenedAtLogin flag
// or the explicit --hidden arg we add to the login-item command line.
function wasLaunchedHidden(): boolean {
  return wasOpenedAtLogin() || process.argv.includes('--hidden');
}

function notifyRouted(platform: string, destinationPath: string): void {
  if (!Notification.isSupported()) return;
  const fileName = path.basename(destinationPath);
  const folder = path.basename(path.dirname(destinationPath));
  new Notification({
    title: `Shift-K · ${platform}`,
    body: `${fileName} → ${folder}`,
    silent: true,
  }).show();
}

if (process.platform === 'win32') {
  app.setAppUserModelId('com.shiftk.app');
}

// Make sure Chromium's backdrop-filter implementation is enabled for the
// Liquid Glass CSS fallback on Windows / Linux. Recent Chromium versions
// ship it on by default, but bundled Electron sometimes lags; the explicit
// switch is a no-op if already enabled. Must be set BEFORE app is ready.
app.commandLine.appendSwitch('enable-features', 'CSSBackdropFilter');

app.whenReady().then(() => {
  registerConfigHandlers();

  setWatcherEventHandler((event) => {
    if (event.type === 'routed') {
      const cfg = getConfig();
      if (cfg.preferences.notifyOnRoute) {
        notifyRouted(event.result.platform, event.result.destinationPath);
      }
      const filename = path.basename(event.result.destinationPath);
      const entry = {
        filename,
        client: cfg.activeClient ?? '',
        stage: event.result.stageKey,
        stageFolderName: event.result.stageFolderName,
        platform: event.result.platform,
        type: classifyExtension(filename, cfg),
        timestamp: event.result.movedAt.getTime(),
      };
      addActivity(entry);
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('activity:routed', entry);
      });
    }
  });
  registerShortcuts();
  createTray();

  // Reconcile the OS login-item state with the user's preference on every
  // launch (cheap, idempotent). Also re-apply whenever the pref changes.
  applyAutostart(getConfig().preferences.startOnLogin);
  let lastStartOnLogin = getConfig().preferences.startOnLogin;
  onConfigChange((cfg) => {
    if (cfg.preferences.startOnLogin !== lastStartOnLogin) {
      lastStartOnLogin = cfg.preferences.startOnLogin;
      applyAutostart(lastStartOnLogin);
    }
  });

  const hidden = wasLaunchedHidden();

  if (isConfigComplete()) {
    if (!hidden) createOverlayWindow();
    void syncWatcher();
    // Apply the persisted theme's native material once the overlay exists.
    applyTheme(getConfig().preferences.theme);
  } else {
    // Onboarding always shows even on autostart — config is incomplete,
    // there's nothing useful for the user to do via the tray alone.
    createOnboardingWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (isConfigComplete()) {
        createOverlayWindow();
      } else {
        createOnboardingWindow();
      }
    }
  });
});

app.on('will-quit', () => {
  unregisterShortcuts();
  void closeWatcher();
  destroyTray();
});

// Keep the app alive when all windows close — the tray icon is the entry
// point back into the app. Only an explicit quit (tray menu) terminates.
app.on('window-all-closed', () => {
  // no-op
});
