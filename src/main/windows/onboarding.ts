import { app, BrowserWindow } from 'electron';
import path from 'path';

// Sprint 8 cinematic onboarding lives in a centred golden-ratio window:
// 980 × 605 ≈ 1.619, which keeps the hero typography + SVG illustrations
// breathing without the dead vertical space the 680-px draft left under
// each screen. Resizing is locked — the layout is tuned to this exact box.
const ONBOARDING_WIDTH = 980;
const ONBOARDING_HEIGHT = 605;

const isDev = !app.isPackaged;

let onboardingWindow: BrowserWindow | null = null;

export function createOnboardingWindow(): BrowserWindow {
  if (onboardingWindow && !onboardingWindow.isDestroyed()) {
    onboardingWindow.focus();
    return onboardingWindow;
  }

  onboardingWindow = new BrowserWindow({
    width: ONBOARDING_WIDTH,
    height: ONBOARDING_HEIGHT,
    title: 'Shift-K · Bienvenue',
    backgroundColor: '#0A0A0A',
    // Frameless — no Windows / macOS title bar. Cinematic full-bleed black
    // canvas. A custom drag region lives at the top of OnboardingApp so
    // the window can still be moved.
    frame: false,
    autoHideMenuBar: true,
    minimizable: false,
    maximizable: false,
    resizable: false,
    center: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  onboardingWindow.once('ready-to-show', () => {
    onboardingWindow?.show();
  });

  onboardingWindow.on('closed', () => {
    onboardingWindow = null;
  });

  if (isDev) {
    void onboardingWindow.loadURL('http://localhost:5173/onboarding.html');
  } else {
    void onboardingWindow.loadFile(path.join(__dirname, '../../renderer/onboarding.html'));
  }

  return onboardingWindow;
}
