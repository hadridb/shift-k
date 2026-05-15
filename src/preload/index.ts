import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import type { ShiftKBridge } from '../shared/bridge';
import type { AppConfig } from '../shared/types';

const bridge: ShiftKBridge = {
  getConfig: () => ipcRenderer.invoke('config:get') as Promise<AppConfig>,

  setActiveClient: (client) => ipcRenderer.invoke('config:set-active-client', client),

  cycleStage: () => ipcRenderer.invoke('config:cycle-stage'),

  toggleRouting: () => ipcRenderer.invoke('config:toggle-routing'),

  triggerRescan: () => ipcRenderer.invoke('scanner:rescan'),

  onConfigChange: (callback) => {
    const handler = (_event: IpcRendererEvent, config: AppConfig) => callback(config);
    ipcRenderer.on('config:changed', handler);
    return () => ipcRenderer.removeListener('config:changed', handler);
  },
};

contextBridge.exposeInMainWorld('shiftK', bridge);
