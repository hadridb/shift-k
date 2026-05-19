import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { getConfig, setConfigKey } from '@core/config/store';

const OVERLAY_WIDTH = 290;
// 520 px (was 468) gives the toast room above the footer without overlapping
// the slot list, and the stage popover room to open upward without clipping.
const OVERLAY_HEIGHT = 520;

const isDev = !app.isPackaged;

let overlayWindow: BrowserWindow | null = null;

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow && !overlayWindow.isDestroyed() ? overlayWindow : null;
}

export function createOverlayWindow(): BrowserWindow {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.show();
    overlayWindow.focus();
    return overlayWindow;
  }

  const config = getConfig();
  const { x: storedX, y: storedY } = config.preferences.overlay;

  // Default position: right side of primary display
  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  const defaultX = Math.round(screenW - OVERLAY_WIDTH - 24);
  const defaultY = Math.round((screenH - OVERLAY_HEIGHT) / 2);

  const x = storedX > 0 ? storedX : defaultX;
  const y = storedY > 0 ? storedY : defaultY;

  overlayWindow = new BrowserWindow({
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

  overlayWindow.setAlwaysOnTop(true, 'floating');

  if (isDev) {
    void overlayWindow.loadURL('http://localhost:5173/overlay.html');
  } else {
    void overlayWindow.loadFile(path.join(__dirname, '../../renderer/overlay.html'));
  }

  // Persist position on move
  overlayWindow.on('moved', () => {
    if (!overlayWindow) return;
    const [winX, winY] = overlayWindow.getPosition();
    setConfigKey('preferences', {
      ...getConfig().preferences,
      overlay: { x: winX ?? 0, y: winY ?? 0 },
    });
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

export function toggleOverlayWindow(): void {
  const win = getOverlayWindow();
  if (!win) {
    createOverlayWindow();
    return;
  }
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}
