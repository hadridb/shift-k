import type {
  AppConfig,
  Stage,
  SlotKey,
  ScanResult,
  RescanPreview,
  RescanPreviewItem,
  ActivityEntry,
  ThemeId,
} from './types';

export interface ShiftKBridge {
  getConfig: () => Promise<AppConfig>;
  setActiveClient: (client: string | null) => Promise<void>;
  cycleStage: () => Promise<Stage>;
  setActiveStage: (stage: Stage) => Promise<void>;
  toggleRouting: () => Promise<boolean>;
  previousSlot: () => Promise<string | null>;
  nextSlot: () => Promise<string | null>;
  triggerRescan: () => Promise<ScanResult>;
  previewRescan: () => Promise<RescanPreview>;
  executeRescan: (items: RescanPreviewItem[]) => Promise<ScanResult>;
  onConfigChange: (callback: (config: AppConfig) => void) => () => void;

  setSlots: (slots: Record<SlotKey, string | null>) => Promise<void>;
  createProject: (client: string, mission: string) => Promise<string>;
  listProjects: () => Promise<string[]>;
  openFolders: (stages: Stage[], todayOnly: boolean) => Promise<void>;

  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  pickFolder: (title?: string) => Promise<string | null>;
  openSettings: () => Promise<void>;
  completeOnboarding: () => Promise<void>;

  getRecentActivity: () => Promise<ActivityEntry[]>;
  onActivityRouted: (callback: (entry: ActivityEntry) => void) => () => void;

  applyTheme: (themeId: ThemeId) => Promise<void>;
  onGlassFallback: (callback: (enabled: boolean) => void) => () => void;
  getPlatformInfo: () => Promise<{ platform: 'windows' | 'macos' | 'linux'; release: string }>;
}
