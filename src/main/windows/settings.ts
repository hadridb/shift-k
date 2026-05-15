import { app, BrowserWindow } from 'electron';
import path from 'path';

const SETTINGS_WIDTH = 540;
const SETTINGS_HEIGHT = 720;

const isDev = !app.isPackaged;

let settingsWindow: BrowserWindow | null = null;

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return settingsWindow;
  }

  settingsWindow = new BrowserWindow({
    width: SETTINGS_WIDTH,
    height: SETTINGS_HEIGHT,
    title: 'Shift-K · Réglages',
    backgroundColor: '#0A0A0A',
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  if (isDev) {
    void settingsWindow.loadURL('http://localhost:5173/settings.html');
  } else {
    void settingsWindow.loadFile(path.join(__dirname, '../../renderer/settings.html'));
  }

  return settingsWindow;
}
