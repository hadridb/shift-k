import { app, BrowserWindow } from 'electron';
import { registerConfigHandlers } from './ipc/config-handlers';
import { createOverlayWindow } from './windows/overlay';
import { createOnboardingWindow } from './windows/onboarding';
import {
  syncWatcher,
  setWatcherEventHandler,
  closeWatcher,
} from './services/watcher-manager';
import { registerShortcuts, unregisterShortcuts } from './shortcuts';
import { getConfig } from '@core/config/store';

function isConfigComplete(): boolean {
  const config = getConfig();
  return Boolean(config.root && config.downloadsPath);
}

app.whenReady().then(() => {
  registerConfigHandlers();

  setWatcherEventHandler((event) => {
    if (event.type === 'routed') {
      // TODO Sprint 4+: native notification
    }
  });
  registerShortcuts();

  if (isConfigComplete()) {
    createOverlayWindow();
    syncWatcher();
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
  closeWatcher();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
