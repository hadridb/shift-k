import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { ShiftKBridge } from '../shared/bridge';
import type { AppConfig } from '../shared/types';

const bridge: ShiftKBridge = {
  getConfig: () => ipcRenderer.invoke('config:get') as Promise<AppConfig>,

  setActiveClient: (client) => ipcRenderer.invoke('config:set-active-client', client),

  cycleStage: () => ipcRenderer.invoke('config:cycle-stage'),

  toggleRouting: () => ipcRenderer.invoke('config:toggle-routing'),

  previousSlot: () => ipcRenderer.invoke('config:previous-slot'),

  nextSlot: () => ipcRenderer.invoke('config:next-slot'),

  triggerRescan: () => ipcRenderer.invoke('scanner:rescan'),

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
};

contextBridge.exposeInMainWorld('shiftK', bridge);
