import { globalShortcut } from 'electron';
import { activateSlot, cycleStage, toggleRouting } from './services/actions';
import { toggleOverlayWindow } from './windows/overlay';
import type { SlotKey } from '@shared/types';

// Includes '0' for the 10th slot — Ctrl+Alt+0 lives just past Ctrl+Alt+9
// on the number row, intentional muscle-memory continuation.
const SLOT_KEYS: SlotKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

interface Registration {
  accelerator: string;
  registered: boolean;
}

let registrations: Registration[] = [];

function register(accelerator: string, callback: () => void): void {
  const ok = globalShortcut.register(accelerator, callback);
  registrations.push({ accelerator, registered: ok });
  if (!ok) {
    console.warn(`[shortcuts] failed to register ${accelerator} (already in use?)`);
  }
}

export function registerShortcuts(): void {
  // CmdOrCtrl resolves to Cmd on macOS, Ctrl on Windows/Linux.
  // Alt resolves to Option on macOS. Result on Mac: Cmd+Shift+K, Cmd+Option+1..0,
  // Cmd+Option+S, Cmd+Option+P — preserves the muscle memory across platforms.
  register('CommandOrControl+Shift+K', () => {
    toggleOverlayWindow();
  });

  for (const key of SLOT_KEYS) {
    register(`CommandOrControl+Alt+${key}`, () => {
      activateSlot(key);
    });
  }

  register('CommandOrControl+Alt+S', () => {
    cycleStage();
  });

  register('CommandOrControl+Alt+P', () => {
    void toggleRouting();
  });
}

export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll();
  registrations = [];
}

/** Diagnostic: list of accelerators and whether each one was successfully registered. */
export function getShortcutStatus(): Readonly<Registration[]> {
  return registrations;
}
