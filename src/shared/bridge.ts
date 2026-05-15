import type { AppConfig, Stage, ScanResult } from './types';

export interface ShiftKBridge {
  getConfig: () => Promise<AppConfig>;
  setActiveClient: (client: string | null) => Promise<void>;
  cycleStage: () => Promise<Stage>;
  toggleRouting: () => Promise<boolean>;
  triggerRescan: () => Promise<ScanResult>;
  onConfigChange: (callback: (config: AppConfig) => void) => () => void;
}
