import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

// Minimal bridge — expanded progressively in Phase Alpha
contextBridge.exposeInMainWorld('shiftK', {
  onConfigChange: (callback: (config: unknown) => void) => {
    const handler = (_event: IpcRendererEvent, config: unknown) => callback(config);
    ipcRenderer.on('config:change', handler);
    return () => ipcRenderer.removeListener('config:change', handler);
  },
});
