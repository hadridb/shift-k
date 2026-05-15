import { BrowserWindow } from 'electron';
import { getConfig, setConfigKey } from '@core/config/store';
import type { Stage, SlotKey } from '@shared/types';

const STAGE_ORDER: Stage[] = ['src', 'img', 'out', 'ost', 'liv'];

export function broadcastConfigChange(): void {
  const config = getConfig();
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send('config:changed', config);
  });
}

export function setActiveClient(client: string | null): void {
  setConfigKey('activeClient', client);
  broadcastConfigChange();
}

/**
 * Sets activeClient to the project assigned to the given slot.
 * Returns false (no-op) if the slot is empty.
 */
export function activateSlot(slotKey: SlotKey): boolean {
  const client = getConfig().slots[slotKey];
  if (!client) return false;
  setActiveClient(client);
  return true;
}

export function cycleStage(): Stage {
  const config = getConfig();
  const idx = STAGE_ORDER.indexOf(config.activeStage);
  const next = STAGE_ORDER[(idx + 1) % STAGE_ORDER.length] as Stage;
  setConfigKey('activeStage', next);
  broadcastConfigChange();
  return next;
}

export function toggleRouting(): boolean {
  const next = !getConfig().routingEnabled;
  setConfigKey('routingEnabled', next);
  broadcastConfigChange();
  return next;
}
