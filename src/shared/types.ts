// Shared types between main process and renderer — no Electron or Node imports here

export type Stage = 'src' | 'img' | 'out' | 'ost' | 'liv';

export type SlotKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type StageLabels = Record<Stage, string>;

export interface Preferences {
  dailyFolderFormat: string;
  lazyDailyFolders: boolean;
  groupByPlatform: boolean;
  logRetentionDays: number;
  notifyOnRoute: boolean;
  overlay: { x: number; y: number };
  openFoldersLast: Record<Stage, boolean>;
  openFoldersToday: boolean;
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
