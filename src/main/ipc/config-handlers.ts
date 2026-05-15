import path from 'path';
import fs from 'fs/promises';
import { ipcMain, BrowserWindow, shell } from 'electron';
import { getConfig, setConfigKey } from '@core/config/store';
import { scanDownloads } from '@core/scanner/scanner';
import { createProject, listProjects } from '@core/projects/scaffolder';
import { formatDailyFolderName } from '@core/router/daily-path';
import type { Stage, SlotKey } from '@shared/types';

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

  ipcMain.handle('config:set-slots', (_e, slots: Record<SlotKey, string | null>) => {
    setConfigKey('slots', slots);
    broadcastConfigChange();
  });

  ipcMain.handle('scanner:rescan', async () => {
    const config = getConfig();
    return scanDownloads(config);
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

      // Persist selection
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

      // Open each selected stage folder
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
