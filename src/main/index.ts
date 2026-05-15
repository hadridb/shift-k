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
import { getConfig } from '@core/config/store';

function isConfigComplete(): boolean {
  const config = getConfig();
  return Boolean(config.root && config.downloadsPath);
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

app.whenReady().then(() => {
  registerConfigHandlers();

  setWatcherEventHandler((event) => {
    if (event.type === 'routed') {
      if (getConfig().preferences.notifyOnRoute) {
        notifyRouted(event.result.platform, event.result.destinationPath);
      }
    }
  });
  registerShortcuts();
  createTray();

  if (isConfigComplete()) {
    createOverlayWindow();
    void syncWatcher();
  } else {
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
