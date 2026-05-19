import os from 'os';
import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { getConfig, setConfigKey } from '@core/config/store';

const MICA_MIN_BUILD = 22000;

function isWindows11OrLater(): boolean {
  if (process.platform !== 'win32') return false;
  const build = parseInt(os.release().split('.')[2] ?? '0', 10);
  return build >= MICA_MIN_BUILD;
}

const OVERLAY_WIDTH = 290;
// 460 px: header 44 + 10 slots × 32 + stage 40 + footer 44 + 3 dividers = 451.
// 9 px of bottom buffer. Slot list is now adjacent to the stage bar (no flex
// spacer between them) for a denser, more luxury-product look. See ADR-028
// for the locking contract.
const OVERLAY_HEIGHT = 460;

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

  // CRITICAL: dimensions are LOCKED. No setBounds / setSize / setContentSize
  // calls anywhere in the codebase. The DOM never drives window size — modals
  // and the activity toast must render *inside* the rounded container (via
  // position: absolute, see OverlayApp). See ADR-028.
  //
  // Mica timing: if the persisted theme already wants Mica, pass it as the
  // constructor `backgroundMaterial` option so DWM picks it up on the very
  // first paint — calling setBackgroundMaterial after creation works but can
  // race the first frame and leave the user staring at the default grey for
  // a few ms. See ADR-029.
  const initialMaterial: 'mica' | 'none' =
    config.preferences.theme === 'mica' && isWindows11OrLater() ? 'mica' : 'none';
  console.log(
    '[overlay] creating window —',
    'platform=', process.platform,
    'os.release=', os.release(),
    'persistedTheme=', config.preferences.theme,
    'initialMaterial=', initialMaterial,
  );

  overlayWindow = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x,
    y,
    frame: false,
    transparent: true,
    // Fully transparent background so Mica/vibrancy themes can paint
    // the OS material behind the renderer. Opaque themes (Obsidian,
    // Carbon, Ivory) paint their own --bg-primary on the container,
    // hiding this transparency.
    backgroundColor: '#00000000',
    backgroundMaterial: initialMaterial, // Electron 25+ — first-paint Mica.
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    useContentSize: false, // explicit: window size is the OUTER frame size
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
    // Auto-open detached devtools in dev — the overlay is frameless so
    // the user can't right-click → Inspect. Detached mode keeps the
    // 290×460 frame intact while the devtools panel floats next to it.
    overlayWindow.webContents.openDevTools({ mode: 'detach' });
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
