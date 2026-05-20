import { app, BrowserWindow, Notification } from 'electron';
import path from 'path';
import { registerConfigHandlers } from './ipc/config-handlers';
import { createOverlayWindow } from './windows/overlay';
import { createOnboardingWindow } from './windows/onboarding';
import {
  syncWatcher,
  setWatcherEventHandler,
  closeWatcher,
} from './services/watcher-manager';
import { registerShortcuts, unregisterShortcuts } from './shortcuts';
import { createTray, destroyTray } from './tray';
import { applyAutostart, wasOpenedAtLogin } from './services/autostart';
import { addActivity } from './services/activity-log';
import { applyTheme } from './services/theme-applier';
import { showSplash } from './windows/splash';
import {
  logDiagnosticsAtStartup,
  registerThemeDiagnosticsIpc,
} from './debug/theme-diagnostics';
import { classifyExtension } from '@shared/i18n/activity';
import { getConfig, onConfigChange } from '@core/config/store';

function isConfigComplete(): boolean {
  const config = getConfig();
  return Boolean(config.root && config.downloadsPath);
}

// Hidden launch detection: either the OS-reported wasOpenedAtLogin flag
// or the explicit --hidden arg we add to the login-item command line.
function wasLaunchedHidden(): boolean {
  return wasOpenedAtLogin() || process.argv.includes('--hidden');
}

function notifyRouted(platform: string, destinationPath: string): void {
  if (!Notification.isSupported()) return;
  const fileName = path.basename(destinationPath);
  const folder = path.basename(path.dirname(destinationPath));
  new Notification({
    title: `Shift-K · ${platform}`,
    body: `${fileName} → ${folder}`,
    silent: true,
  }).show();
}

if (process.platform === 'win32') {
  app.setAppUserModelId('com.shiftk.app');
}

// Make sure Chromium's backdrop-filter + Skia renderer are enabled for the
// Liquid Glass CSS fallback on Windows / Linux. Recent Chromium versions
// ship them on by default, but bundled Electron sometimes lags; the
// explicit switches are no-ops when already enabled. Must be set BEFORE
// app is ready.
app.commandLine.appendSwitch('enable-features', 'CSSBackdropFilter,UseSkiaRenderer');

app.whenReady().then(() => {
  logDiagnosticsAtStartup();
  registerThemeDiagnosticsIpc();
  registerConfigHandlers();

  setWatcherEventHandler((event) => {
    if (event.type === 'routed') {
      const cfg = getConfig();
      if (cfg.preferences.notifyOnRoute) {
        notifyRouted(event.result.platform, event.result.destinationPath);
      }
      const filename = path.basename(event.result.destinationPath);
      const entry = {
        filename,
        client: cfg.activeClient ?? '',
        stage: event.result.stageKey,
        stageFolderName: event.result.stageFolderName,
        platform: event.result.platform,
        type: classifyExtension(filename, cfg),
        timestamp: event.result.movedAt.getTime(),
      };
      addActivity(entry);
      BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send('activity:routed', entry);
      });
    } else if (event.type === 'error') {
      // Sprint 8c (ADR-037): surface move failures. Pre-fix these were
      // silently swallowed, which is how the EXDEV cross-volume bug went
      // undetected for so long. Console-only for now — a UX-facing toast
      // is a separate design decision (see ADR-037 § "follow-up").
      console.error(`[watcher] route failed for ${event.file}: ${event.error}`);
    }
  });
  registerShortcuts();
  createTray();

  // Reconcile the OS login-item state with the user's preference on every
  // launch (cheap, idempotent). Also re-apply whenever the pref changes.
  applyAutostart(getConfig().preferences.startOnLogin);
  let lastStartOnLogin = getConfig().preferences.startOnLogin;
  onConfigChange((cfg) => {
    if (cfg.preferences.startOnLogin !== lastStartOnLogin) {
      lastStartOnLogin = cfg.preferences.startOnLogin;
      applyAutostart(lastStartOnLogin);
    }
  });

  const hidden = wasLaunchedHidden();
  // Sprint 8: optional dev-mode override to force the onboarding flow
  // even on configs that have already completed it. Set via
  // `npm run dev:onboarding` (see scripts/dev-onboarding.js).
  const forceOnboarding = process.env['SHIFTK_FORCE_ONBOARDING'] === '1';
  const firstLaunch =
    forceOnboarding || !getConfig().preferences.firstLaunchCompleted;

  void (async () => {
    // Splash on every normal launch — skipped on hidden / autostart since
    // a flash of UI would be jarring with no overlay following.
    if (!hidden) {
      await showSplash();
    }

    if (firstLaunch && !hidden) {
      // First launch (or replay) — go straight to the cinematic onboarding.
      // The overlay is created when the user clicks "Lancer Shift-K" on
      // screen 7 (onboarding:complete IPC).
      createOnboardingWindow();
    } else {
      // Standard launch path — overlay + watcher + native theme effects.
      if (!hidden) createOverlayWindow();
      void syncWatcher();
      applyTheme(getConfig().preferences.theme);
    }
  })();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (isConfigComplete()) {
        createOverlayWindow();
      } else {
        createOnboardingWindow();
      }
    }
  });
});

app.on('will-quit', () => {
  unregisterShortcuts();
  void closeWatcher();
  destroyTray();
});

// Keep the app alive when all windows close — the tray icon is the entry
// point back into the app. Only an explicit quit (tray menu) terminates.
app.on('window-all-closed', () => {
  // no-op
});
