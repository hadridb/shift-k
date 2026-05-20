import path from 'path';
import type { AppConfig, Stage } from '@shared/types';
import { resolvePlatform } from './platform-matcher';
import { buildDailyPath } from './daily-path';

// Browser temp files — never route these
const BROWSER_TEMP_EXTENSIONS = new Set(['.crdownload', '.part', '.tmp', '.opdownload']);

// Platforms that always route to a specific stage, regardless of the
// currently active stage. Audio platforms all go to OST (musique,
// dialogue, sound design). Photoshop/Premiere project files go to src.
// See ADR-024 for the rationale and the routeAllAudio fallback.
export const PLATFORM_STAGE_OVERRIDES: Readonly<Record<string, Stage>> = {
  suno: 'ost',
  elevenlabs: 'ost',
  udio: 'ost',
  stable_audio: 'ost',
  aiva: 'ost',
  mubert: 'ost',
  soundraw: 'ost',
  splice: 'ost',
  loopcloud: 'ost',
  cymatics: 'ost',
  photoshop: 'src',
  premiere: 'src',
};

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

  const isVideo = config.videoExtensions.includes(ext);
  const isImage = config.imageExtensions.includes(ext);
  const isAudio = config.audioExtensions.includes(ext);
  const isProject = config.projectExtensions.includes(ext);

  const platform = resolvePlatform(fileName, config.platforms);

  // No platform match: route only known media types via project-file rule,
  // or — when routeAllAudio is on (ADR-024) — capture any audio file to OST
  // so that sound banks with no recognizable naming still get filed.
  if (!platform) {
    if (isProject) {
      const stageKey: Stage = 'src';
      return {
        destDir: buildDailyPath(config, stageKey, null, date),
        platform: 'project',
        stageKey,
        stageFolderName: config.stages[stageKey],
      };
    }
    if (isAudio && config.preferences.routeAllAudio) {
      // Sprint 8c (ADR-036): stage cible configurable via audioFallbackStage.
      // PLATFORM_STAGE_OVERRIDES garde son hardcode 'ost' pour Suno/ElevenLabs
      // etc. (semantique : ces plateformes sont audio par definition) ; seul
      // le fallback orphan respecte la pref user.
      const stageKey: Stage = config.preferences.audioFallbackStage;
      return {
        destDir: buildDailyPath(config, stageKey, null, date),
        platform: 'audio',
        stageKey,
        stageFolderName: config.stages[stageKey],
      };
    }
    return null;
  }

  // Platform matched but extension is unknown to us — don't route.
  if (!isVideo && !isImage && !isAudio && !isProject) return null;

  // Platforms with a forced stage win over the active stage.
  const overrideStage = PLATFORM_STAGE_OVERRIDES[platform];
  const stageKey: Stage = overrideStage ?? (isProject ? 'src' : config.activeStage);

  return {
    destDir: buildDailyPath(config, stageKey, platform, date),
    platform,
    stageKey,
    stageFolderName: config.stages[stageKey],
  };
}
