// Shared types between main process and renderer — no Electron imports here

export type Stage = 'src' | 'img' | 'out' | 'ost' | 'liv';

export type StageLabels = Record<Stage, string>;

export interface Project {
  id: string;
  client: string;
  mission: string;
  folderPath: string;
}

export interface AppConfig {
  version: number;
  projectsRoot: string;
  downloadsPath: string;
  activeSlot: number | null;
  slots: Array<string | null>;
  stageLabels: StageLabels;
  activeStage: Stage;
  routingEnabled: boolean;
  groupByPlatform: boolean;
}

export interface RouteResult {
  sourcePath: string;
  destinationPath: string;
  platform: string | null;
  stage: Stage;
  movedAt: Date;
}
