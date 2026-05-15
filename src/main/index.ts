import { app, BrowserWindow } from 'electron';
import { registerConfigHandlers } from './ipc/config-handlers';
import { createOverlayWindow } from './windows/overlay';
import {
  syncWatcher,
  setWatcherEventHandler,
  closeWatcher,
} from './services/watcher-manager';
import { registerShortcuts, unregisterShortcuts } from './shortcuts';

app.whenReady().then(() => {
  registerConfigHandlers();
  createOverlayWindow();

  setWatcherEventHandler((event) => {
    if (event.type === 'routed') {
      // TODO Sprint 4+: native notification
    }
  });
  syncWatcher();

  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlayWindow();
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
