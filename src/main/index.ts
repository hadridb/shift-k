import { app, BrowserWindow } from 'electron';
import { registerConfigHandlers } from './ipc/config-handlers';
import { createOverlayWindow } from './windows/overlay';
import { createWatcher } from '@core/watcher/watcher';
import { getConfig } from '@core/config/store';

app.whenReady().then(() => {
  registerConfigHandlers();
  createOverlayWindow();

  // Start file watcher (only if configured)
  const config = getConfig();
  if (config.downloadsPath) {
    createWatcher({
      getConfig,
      onEvent: (event) => {
        if (event.type === 'routed') {
          // TODO Sprint 4: native notification
        }
      },
    });
  }

  app.on('activate', () => {
    // macOS: re-create overlay if all windows closed
    if (BrowserWindow.getAllWindows().length === 0) {
      createOverlayWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
