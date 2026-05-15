import path from 'path';
import type { AppConfig, Stage } from '@shared/types';
import { resolvePlatform } from './platform-matcher';
import { buildDailyPath } from './daily-path';

// Browser temp files — never route these
const BROWSER_TEMP_EXTENSIONS = new Set(['.crdownload', '.part', '.tmp', '.opdownload']);

export interface DestinationInfo {
  destDir: string;
  platform: string;
  stageKey: Stage;
  stageFolderName: string;
}

/**
 * Port of Resolve-PhasmaDestination from Phasma-Core.ps1.
 * Pure function — no filesystem side effects.
 * Returns null when the file should be left in Downloads.
 */
export function resolveDestination(
  fileName: string,
  config: AppConfig,
  date: Date = new Date(),
): DestinationInfo | null {
  if (!config.activeClient) return null;
  if (!config.routingEnabled) return null;

  const ext = path.extname(fileName).toLowerCase();

  if (BROWSER_TEMP_EXTENSIONS.has(ext)) return null;
  if (config.ignoreExtensions.includes(ext)) return null;

  const platform = resolvePlatform(fileName, config.platforms);
  if (!platform) return null;

  // Project files (PSD, AI, PRPROJ, AEP) always go to src stage
  if (config.projectExtensions.includes(ext)) {
    const stageKey: Stage = 'src';
    return {
      destDir: buildDailyPath(config, stageKey, platform, date),
      platform,
      stageKey,
      stageFolderName: config.stages[stageKey],
    };
  }

  // Image / video files go to the active stage
  if (config.imageExtensions.includes(ext) || config.videoExtensions.includes(ext)) {
    const stageKey = config.activeStage;
    return {
      destDir: buildDailyPath(config, stageKey, platform, date),
      platform,
      stageKey,
      stageFolderName: config.stages[stageKey],
    };
  }

  return null;
}
