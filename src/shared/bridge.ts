import type { AppConfig, Stage, SlotKey, ScanResult } from './types';

export interface ShiftKBridge {
  getConfig: () => Promise<AppConfig>;
  setActiveClient: (client: string | null) => Promise<void>;
  cycleStage: () => Promise<Stage>;
  toggleRouting: () => Promise<boolean>;
  previousSlot: () => Promise<string | null>;
  nextSlot: () => Promise<string | null>;
  triggerRescan: () => Promise<ScanResult>;
  onConfigChange: (callback: (config: AppConfig) => void) => () => void;

  setSlots: (slots: Record<SlotKey, string | null>) => Promise<void>;
  createProject: (client: string, mission: string) => Promise<string>;
  listProjects: () => Promise<string[]>;
  openFolders: (stages: Stage[], todayOnly: boolean) => Promise<void>;

  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  pickFolder: (title?: string) => Promise<string | null>;
  openSettings: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}
