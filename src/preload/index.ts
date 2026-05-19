import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { ShiftKBridge } from '../shared/bridge';
import type { AppConfig, ActivityEntry, ThemeId } from '../shared/types';

const bridge: ShiftKBridge = {
  getConfig: () => ipcRenderer.invoke('config:get') as Promise<AppConfig>,

  setActiveClient: (client) => ipcRenderer.invoke('config:set-active-client', client),

  cycleStage: () => ipcRenderer.invoke('config:cycle-stage'),

  setActiveStage: (stage) => ipcRenderer.invoke('config:set-active-stage', stage),

  toggleRouting: () => ipcRenderer.invoke('config:toggle-routing'),

  previousSlot: () => ipcRenderer.invoke('config:previous-slot'),

  nextSlot: () => ipcRenderer.invoke('config:next-slot'),

  triggerRescan: () => ipcRenderer.invoke('scanner:rescan'),

  previewRescan: () => ipcRenderer.invoke('scanner:preview'),

  executeRescan: (items) => ipcRenderer.invoke('scanner:execute', items),

  onConfigChange: (callback) => {
    const handler = (_event: IpcRendererEvent, config: AppConfig) => callback(config);
    ipcRenderer.on('config:changed', handler);
    return () => ipcRenderer.removeListener('config:changed', handler);
  },

  setSlots: (slots) => ipcRenderer.invoke('config:set-slots', slots),

  createProject: (client, mission) => ipcRenderer.invoke('projects:create', client, mission),

  listProjects: () => ipcRenderer.invoke('projects:list'),

  openFolders: (stages, todayOnly) =>
    ipcRenderer.invoke('projects:open-folders', stages, todayOnly),

  updateConfig: (updates) => ipcRenderer.invoke('config:update', updates),

  pickFolder: (title) => ipcRenderer.invoke('dialog:pick-folder', title),

  openSettings: () => ipcRenderer.invoke('window:open-settings'),

  completeOnboarding: () => ipcRenderer.invoke('onboarding:complete'),

  getRecentActivity: () => ipcRenderer.invoke('activity:get-recent') as Promise<ActivityEntry[]>,

  onActivityRouted: (callback) => {
    const handler = (_event: IpcRendererEvent, entry: ActivityEntry) => callback(entry);
    ipcRenderer.on('activity:routed', handler);
    return () => ipcRenderer.removeListener('activity:routed', handler);
  },

  applyTheme: (themeId: ThemeId) => ipcRenderer.invoke('theme:apply', themeId) as Promise<void>,

  onThemeChanged: (callback) => {
    const handler = (_event: IpcRendererEvent, themeId: ThemeId) => callback(themeId);
    ipcRenderer.on('theme:changed', handler);
    return () => ipcRenderer.removeListener('theme:changed', handler);
  },

  onGlassFallback: (callback) => {
    const handler = (_event: IpcRendererEvent, enabled: boolean) => callback(enabled);
    ipcRenderer.on('theme:glass-fallback', handler);
    return () => ipcRenderer.removeListener('theme:glass-fallback', handler);
  },

  getPlatformInfo: () =>
    ipcRenderer.invoke('system:platform-info') as Promise<{
      platform: 'windows' | 'macos' | 'linux';
      release: string;
    }>,
};

contextBridge.exposeInMainWorld('shiftK', bridge);
