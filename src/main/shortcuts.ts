import { globalShortcut } from 'electron';
import { activateSlot, cycleStage, toggleRouting } from './services/actions';
import type { SlotKey } from '@shared/types';

const SLOT_KEYS: SlotKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

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
  // Ctrl+Alt+1..9 — activate slot
  for (const key of SLOT_KEYS) {
    register(`Control+Alt+${key}`, () => {
      activateSlot(key);
    });
  }

  // Ctrl+Alt+S — cycle stage
  register('Control+Alt+S', () => {
    cycleStage();
  });

  // Ctrl+Alt+P — toggle pause routing
  register('Control+Alt+P', () => {
    toggleRouting();
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
