import path from 'path';
import fs from 'fs/promises';
import { ipcMain, BrowserWindow, shell, dialog } from 'electron';
import { getConfig, setConfig, setConfigKey } from '@core/config/store';
import { scanDownloads, previewRescan, executeRescan } from '@core/scanner/scanner';
import { createProject, listProjects } from '@core/projects/scaffolder';
import { formatDailyFolderName } from '@core/router/daily-path';
import { createSettingsWindow } from '@main/windows/settings';
import { createOverlayWindow } from '@main/windows/overlay';
import { syncWatcher } from '@main/services/watcher-manager';
import {
  broadcastConfigChange,
  setActiveClient,
  cycleStage,
  toggleRouting,
  previousSlot,
  nextSlot,
} from '@main/services/actions';
import type {
  AppConfig,
  Stage,
  SlotKey,
  RescanPreviewItem,
} from '@shared/types';

export function registerConfigHandlers(): void {
  ipcMain.handle('config:get', () => getConfig());

  ipcMain.handle('config:set-active-client', (_e, client: string | null) => {
    setActiveClient(client);
  });

  ipcMain.handle('config:cycle-stage', () => cycleStage());

  ipcMain.handle('config:toggle-routing', () => toggleRouting());

  ipcMain.handle('config:previous-slot', () => previousSlot());

  ipcMain.handle('config:next-slot', () => nextSlot());

  ipcMain.handle('config:set-slots', (_e, slots: Record<SlotKey, string | null>) => {
    setConfigKey('slots', slots);
    broadcastConfigChange();
  });

  ipcMain.handle('config:update', async (_e, updates: Partial<AppConfig>) => {
    setConfig(updates);
    broadcastConfigChange();
    await syncWatcher();
  });

  ipcMain.handle('dialog:pick-folder', async (e, title?: string) => {
    const senderWin = BrowserWindow.fromWebContents(e.sender);
    const options: Electron.OpenDialogOptions = {
      properties: ['openDirectory'],
      ...(title ? { title } : {}),
    };
    const result = senderWin
      ? await dialog.showOpenDialog(senderWin, options)
      : await dialog.showOpenDialog(options);
    if (result.canceled) return null;
    return result.filePaths[0] ?? null;
  });

  ipcMain.handle('window:open-settings', () => {
    createSettingsWindow();
  });

  ipcMain.handle('onboarding:complete', async (e) => {
    const senderWin = BrowserWindow.fromWebContents(e.sender);
    createOverlayWindow();
    await syncWatcher();
    senderWin?.close();
  });

  ipcMain.handle('scanner:rescan', async () => {
    const config = getConfig();
    return scanDownloads(config);
  });

  ipcMain.handle('scanner:preview', async () => {
    const config = getConfig();
    return previewRescan(config);
  });

  ipcMain.handle('scanner:execute', async (_e, items: RescanPreviewItem[]) => {
    return executeRescan(items);
  });

  ipcMain.handle('projects:create', async (_e, client: string, mission: string) => {
    const config = getConfig();
    const projectName = await createProject(config, client, mission);
    setConfigKey('activeClient', projectName);
    broadcastConfigChange();
    return projectName;
  });

  ipcMain.handle('projects:list', async () => {
    const config = getConfig();
    return listProjects(config.root);
  });

  ipcMain.handle(
    'projects:open-folders',
    async (_e, stages: Stage[], todayOnly: boolean) => {
      const config = getConfig();
      if (!config.activeClient || !config.root) return;

      const openFoldersLast: Record<Stage, boolean> = {
        src: false,
        img: false,
        out: false,
        ost: false,
        liv: false,
      };
      for (const stage of stages) {
        openFoldersLast[stage] = true;
      }
      setConfigKey('preferences', {
        ...config.preferences,
        openFoldersLast,
        openFoldersToday: todayOnly,
      });
      broadcastConfigChange();

      const dailyFolder = formatDailyFolderName(config.preferences.dailyFolderFormat);
      for (const stage of stages) {
        const stageFolderName = config.stages[stage];
        let folderPath = path.join(config.root, config.activeClient, stageFolderName);

        if (todayOnly && stage !== 'ost') {
          const dailyPath = path.join(folderPath, dailyFolder);
          await fs.mkdir(dailyPath, { recursive: true });
          folderPath = dailyPath;
        }

        await shell.openPath(folderPath);
      }
    },
  );
}
