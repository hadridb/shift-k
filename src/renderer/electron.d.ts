import type { ShiftKBridge } from '../shared/bridge';

declare global {
  interface Window {
    shiftK: ShiftKBridge;
  }
}
