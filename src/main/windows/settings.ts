import { app, BrowserWindow } from 'electron';
import path from 'path';
import { getConfig } from '@core/config/store';
import { applyThemeToWindow } from '@main/services/theme-applier';

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
    // Transparent so the Liquid Glass / Transparency theme can paint a
    // translucent background through the renderer; the opaque themes
    // (Obsidian / Carbon / Ivory) paint `--bg-primary` over this and
    // appear fully opaque as expected. Without this, the settings
    // window stayed dark when the user picked Ivory or Liquid Glass.
    transparent: true,
    backgroundColor: '#00000000',
    // Match the overlay — vibrancy stays vivid even when this settings
    // window doesn't have focus (the user is constantly switching back
    // to the overlay to preview their picks). See ADR-030 / Sprint 8d.
    visualEffectState: 'active',
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
    if (!settingsWindow) return;
    // Sprint 8d.4: apply the persisted theme's native window-level
    // effect (macOS vibrancy) BEFORE showing, so the first paint
    // already has the Liquid Glass material. Without this, the
    // Settings window only got vibrancy on a subsequent theme switch
    // — the first open was a flat transparent rectangle.
    applyThemeToWindow(settingsWindow, getConfig().preferences.theme);
    settingsWindow.show();
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
