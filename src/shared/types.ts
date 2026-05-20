// Shared types between main process and renderer — no Electron or Node imports here

export type Stage = 'src' | 'img' | 'out' | 'ost' | 'liv';

// Slot keys map to the keyboard number row: 1–9 then 0 (the 10th slot is
// surfaced as "0" so Ctrl+Alt+0 is the natural next key after Ctrl+Alt+9).
export type SlotKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '0';

export type StageLabels = Record<Stage, string>;

export type ThemeId = 'obsidian' | 'carbon' | 'ivory' | 'liquid-glass';

export interface Preferences {
  theme: ThemeId;
  firstLaunchCompleted: boolean;
  dailyFolderFormat: string;
  dailyFoldersEnabled: boolean;
  lazyDailyFolders: boolean;
  groupByPlatform: boolean;
  routeAllAudio: boolean;
  audioFallbackStage: Stage;
  audioRoutingDefaultMigrated: boolean;
  logRetentionDays: number;
  notifyOnRoute: boolean;
  confirmBeforeRescan: boolean;
  startOnLogin: boolean;
  overlay: { x: number; y: number };
  openFoldersLast: Record<Stage, boolean>;
  openFoldersToday: boolean;
  settingsAccordionState: Record<string, boolean>;
}

export interface AppConfig {
  version: string;
  root: string;
  downloadsPath: string;
  activeClient: string | null;
  activeStage: Stage;
  stages: StageLabels;
  platforms: Record<string, string[]>;
  videoExtensions: string[];
  imageExtensions: string[];
  audioExtensions: string[];
  projectExtensions: string[];
  ignoreExtensions: string[];
  slots: Record<SlotKey, string | null>;
  routingEnabled: boolean;
  preferences: Preferences;
}

export interface RouteResult {
  sourcePath: string;
  destinationPath: string;
  platform: string;
  stageKey: Stage;
  stageFolderName: string;
  movedAt: Date;
}

export interface ScanResult {
  routed: RouteResult[];
  skipped: number;
  errors: Array<{ file: string; error: string }>;
}

export interface RescanPreviewItem {
  sourcePath: string;
  fileName: string;
  size: number;
  modifiedAt: Date;
  platform: string;
  stageKey: Stage;
  stageFolderName: string;
  destDir: string;
}

export interface RescanPreview {
  items: RescanPreviewItem[];
  skipped: number;
  errors: Array<{ file: string; error: string }>;
}

export type ActivityType = 'video' | 'image' | 'audio' | 'project';

export interface ActivityEntry {
  filename: string;
  client: string;
  stage: Stage;
  stageFolderName: string;
  platform: string;
  type: ActivityType | null;
  timestamp: number;
}
