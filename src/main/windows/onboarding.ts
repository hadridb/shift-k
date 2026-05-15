import { app, BrowserWindow } from 'electron';
import path from 'path';

const ONBOARDING_WIDTH = 540;
const ONBOARDING_HEIGHT = 500;

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
