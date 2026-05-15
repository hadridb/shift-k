import { Tray, Menu, nativeImage, app } from 'electron';
import { toggleOverlayWindow, getOverlayWindow } from './windows/overlay';
import { createSettingsWindow } from './windows/settings';

// 16x16 white "K" on transparent — generated via System.Drawing.
const TRAY_ICON_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACDSURBVDhP7ZBRDYAwDEQnYAYwgAEMoAAFOEAKFqYBQYi5I0e6pFsyMn4J72e75q7rGsI3AXAAWJzeVCM5l84GJKmQ7mpkeq99TXIDktPrsLBQ0mnE2vOIC2b6/p7JKQADgNNk/xQWvpfo9pBqXxPfQGiJVltLZwO9qvGdjlYbS+ePuAAdPaUSvPv7NgAAAABJRU5ErkJggg==';

let tray: Tray | null = null;
let isQuitting = false;

export function isAppQuitting(): boolean {
  return isQuitting;
}

export function createTray(): Tray {
  if (tray && !tray.isDestroyed()) return tray;

  const icon = nativeImage.createFromBuffer(Buffer.from(TRAY_ICON_PNG_BASE64, 'base64'));
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip('Shift-K');

  function rebuildMenu(): void {
    const overlay = getOverlayWindow();
    const overlayVisible = overlay?.isVisible() ?? false;

    const menu = Menu.buildFromTemplate([
      {
        label: overlayVisible ? "Masquer l'overlay" : "Afficher l'overlay",
        click: () => toggleOverlayWindow(),
      },
      {
        label: 'Réglages…',
        click: () => createSettingsWindow(),
      },
      { type: 'separator' },
      {
        label: 'Quitter Shift-K',
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);
    tray?.setContextMenu(menu);
  }

  rebuildMenu();

  // Refresh menu label before showing so 'Afficher/Masquer' is accurate.
  tray.on('right-click', () => {
    rebuildMenu();
    tray?.popUpContextMenu();
  });

  // Single click on Windows/Linux toggles the overlay.
  tray.on('click', () => {
    toggleOverlayWindow();
  });

  return tray;
}

export function destroyTray(): void {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
  }
  tray = null;
}
