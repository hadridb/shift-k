import { BrowserWindow } from 'electron';
import { getConfig, setConfigKey } from '@core/config/store';
import { syncWatcher } from './watcher-manager';
import type { AppConfig, Stage, SlotKey } from '@shared/types';

const STAGE_ORDER: Stage[] = ['src', 'img', 'out', 'ost', 'liv'];
const SLOT_KEYS: SlotKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface FilledSlot {
  key: SlotKey;
  client: string;
}

function getFilledSlots(config: AppConfig): FilledSlot[] {
  return SLOT_KEYS
    .map((key) => ({ key, client: config.slots[key] }))
    .filter((s): s is FilledSlot => s.client !== null);
}

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
  // Closes the chokidar watcher entirely on pause, restarts fresh
  // (with ignoreInitial:true) on resume. Drops any pending
  // awaitWriteFinish events so files added during pause can't be
  // re-routed by a quick resume.
  syncWatcher();
  return next;
}

/**
 * Navigate to the slot before the currently active one, cycling through
 * filled slots only. No-op if no slot is filled. Wraps around at the
 * boundary (Shift+J on first filled slot → last filled slot).
 */
export function previousSlot(): string | null {
  const config = getConfig();
  const slots = getFilledSlots(config);
  if (slots.length === 0) return null;

  const currentIdx = config.activeClient
    ? slots.findIndex((s) => s.client === config.activeClient)
    : -1;
  const newIdx =
    currentIdx === -1 ? slots.length - 1 : (currentIdx - 1 + slots.length) % slots.length;

  const newClient = slots[newIdx]?.client ?? null;
  setActiveClient(newClient);
  return newClient;
}

/**
 * Navigate to the slot after the currently active one. Cycles through
 * filled slots only, wraps around.
 */
export function nextSlot(): string | null {
  const config = getConfig();
  const slots = getFilledSlots(config);
  if (slots.length === 0) return null;

  const currentIdx = config.activeClient
    ? slots.findIndex((s) => s.client === config.activeClient)
    : -1;
  const newIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % slots.length;

  const newClient = slots[newIdx]?.client ?? null;
  setActiveClient(newClient);
  return newClient;
}
