import { app, BrowserWindow, screen } from 'electron';
import path from 'path';

const SPLASH_WIDTH = 400;
const SPLASH_HEIGHT = 300;
const SPLASH_DURATION_MS = 1200;

const isDev = !app.isPackaged;

let splashWindow: BrowserWindow | null = null;

/**
 * Cinematic splash shown for {@link SPLASH_DURATION_MS} ms on every normal
 * launch. Skipped automatically on autostart / `--hidden` invocations —
 * the caller (main/index.ts) makes that decision.
 *
 * Returns a promise that resolves once the splash has closed, so the
 * caller can chain the next window (onboarding or overlay).
 */
export function showSplash(): Promise<void> {
  if (splashWindow && !splashWindow.isDestroyed()) {
    return Promise.resolve();
  }

  const { width: screenW, height: screenH } = screen.getPrimaryDisplay().workAreaSize;
  splashWindow = new BrowserWindow({
    width: SPLASH_WIDTH,
    height: SPLASH_HEIGHT,
    x: Math.round((screenW - SPLASH_WIDTH) / 2),
    y: Math.round((screenH - SPLASH_HEIGHT) / 2),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    focusable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    void splashWindow.loadURL('http://localhost:5173/splash.html');
  } else {
    void splashWindow.loadFile(path.join(__dirname, '../../renderer/splash.html'));
  }

  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        splashWindow?.destroy();
      } catch {
        // ignore
      }
      splashWindow = null;
      resolve();
    }, SPLASH_DURATION_MS);
  });
}
