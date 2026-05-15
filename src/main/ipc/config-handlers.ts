import { ipcMain, BrowserWindow } from 'electron';
import { getConfig, setConfigKey } from '@core/config/store';
import { scanDownloads } from '@core/scanner/scanner';
import type { Stage } from '@shared/types';

const STAGE_ORDER: Stage[] = ['src', 'img', 'out', 'ost', 'liv'];

function broadcastConfigChange(): void {
  const config = getConfig();
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('config:changed', config);
  });
}

export function registerConfigHandlers(): void {
  ipcMain.handle('config:get', () => getConfig());

  ipcMain.handle('config:set-active-client', (_e, client: string | null) => {
    setConfigKey('activeClient', client);
    broadcastConfigChange();
  });

  ipcMain.handle('config:cycle-stage', () => {
    const config = getConfig();
    const idx = STAGE_ORDER.indexOf(config.activeStage);
    const next = STAGE_ORDER[(idx + 1) % STAGE_ORDER.length] as Stage;
    setConfigKey('activeStage', next);
    broadcastConfigChange();
    return next;
  });

  ipcMain.handle('config:toggle-routing', () => {
    const config = getConfig();
    const next = !config.routingEnabled;
    setConfigKey('routingEnabled', next);
    broadcastConfigChange();
    return next;
  });

  ipcMain.handle('scanner:rescan', async () => {
    const config = getConfig();
    return scanDownloads(config);
  });
}
