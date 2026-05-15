import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { getConfig, setConfigKey } from '@core/config/store';

const OVERLAY_WIDTH = 290;
const OVERLAY_HEIGHT = 468;

const isDev = !app.isPackaged;

export function createOverlayWindow(): BrowserWindow {
  const config = getConfig();
  const { x: storedX, y: storedY } = config.preferences.overlay;

  // Default position: right side of primary display
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const defaultX = Math.round(screenW - OVERLAY_WIDTH - 24);
  const defaultY = Math.round((screenH - OVERLAY_HEIGHT) / 2);

  const x = storedX > 0 ? storedX : defaultX;
  const y = storedY > 0 ? storedY : defaultY;

  const win = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setAlwaysOnTop(true, 'floating');

  if (isDev) {
    void win.loadURL('http://localhost:5173/overlay.html');
  } else {
    void win.loadFile(path.join(__dirname, '../../renderer/overlay.html'));
  }

  // Persist position on move
  win.on('moved', () => {
    const [winX, winY] = win.getPosition();
    setConfigKey('preferences', {
      ...getConfig().preferences,
      overlay: { x: winX ?? 0, y: winY ?? 0 },
    });
  });

  return win;
}
