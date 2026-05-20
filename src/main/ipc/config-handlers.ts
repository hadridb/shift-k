import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import { app, ipcMain, BrowserWindow, shell, dialog } from 'electron';
import { getConfig, setConfig, setConfigKey } from '@core/config/store';
import { scanDownloads, previewRescan, executeRescan } from '@core/scanner/scanner';
import { createProject, listProjects } from '@core/projects/scaffolder';
import { formatDailyFolderName } from '@core/router/daily-path';
import { createSettingsWindow } from '@main/windows/settings';
import { createOverlayWindow } from '@main/windows/overlay';
import { createOnboardingWindow } from '@main/windows/onboarding';
import { syncWatcher } from '@main/services/watcher-manager';
import { getRecentActivity } from '@main/services/activity-log';
import { applyTheme } from '@main/services/theme-applier';
import {
  broadcastConfigChange,
  setActiveClient,
  cycleStage,
  setActiveStage,
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
  ipcMain.handle('config:set-active-stage', (_e, stage: Stage) => setActiveStage(stage));

  ipcMain.handle('activity:get-recent', () => getRecentActivity());

  ipcMain.handle('theme:apply', (_e, themeId: string) => {
    // Apply native window-level effects on the overlay (Mica / vibrancy).
    applyTheme(themeId as Parameters<typeof applyTheme>[0]);
    // CRITICAL: broadcast to EVERY BrowserWindow so each renderer flips its
    // own <html data-theme>. Without this, switching theme from the Settings
    // window only changes the Settings DOM — the overlay keeps its previous
    // theme and overlays opaque CSS on top of Mica/vibrancy, hiding the
    // material entirely. This is the root cause of Sprint 7.1's "Mica looks
    // grey" bug. See docs/THEME_DEBUG.md.
    for (const w of BrowserWindow.getAllWindows()) {
      w.webContents.send('theme:changed', themeId);
    }
  });

  ipcMain.handle('system:platform-info', () => {
    const platform =
      process.platform === 'win32'
        ? 'windows'
        : process.platform === 'darwin'
          ? 'macos'
          : 'linux';
    return { platform, release: os.release() };
  });

  // Onboarding uses this to pre-seed the Downloads picker on screen 2
  // when the user has no persisted downloadsPath yet (first launch).
  ipcMain.handle('system:default-downloads', () => {
    return app.getPath('downloads');
  });

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
    // Flip the first-launch flag so subsequent boots skip the cinematic
    // onboarding and go straight to splash → overlay (see Sprint 8 /
    // main/index.ts boot flow). Persisted via the existing config store.
    const cfg = getConfig();
    setConfig({
      preferences: { ...cfg.preferences, firstLaunchCompleted: true },
    });
    createOverlayWindow();
    await syncWatcher();
    applyTheme(cfg.preferences.theme);
    senderWin?.close();
  });

  // Sprint 8: replay the onboarding from Settings → À PROPOS. Doesn't
  // reset firstLaunchCompleted — the user explicitly asked to see the
  // flow again, the flag stays true so a quit / relaunch still goes
  // straight to overlay.
  ipcMain.handle('onboarding:replay', () => {
    createOnboardingWindow();
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

      const dailyEnabled = config.preferences.dailyFoldersEnabled;
      for (const stage of stages) {
        const stageFolderName = config.stages[stage];
        let folderPath = path.join(config.root, config.activeClient, stageFolderName);

        if (todayOnly && dailyEnabled && stage !== 'ost') {
          const dailyFolder = formatDailyFolderName(
            config.preferences.dailyFolderFormat,
            stageFolderName,
          );
          const dailyPath = path.join(folderPath, dailyFolder);
          await fs.mkdir(dailyPath, { recursive: true });
          folderPath = dailyPath;
        }

        await shell.openPath(folderPath);
      }
    },
  );
}
