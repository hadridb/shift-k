import path from 'path';
import type { AppConfig, Stage } from '@shared/types';

export function formatDailyFolderName(
  format: string,
  stageName: string,
  date: Date = new Date(),
): string {
  const yyyy = date.getFullYear().toString();
  const MM = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return format
    .replace('{stage}', stageName)
    .replace('{yyyy-MM-dd}', `${yyyy}-${MM}-${dd}`);
}

export function buildDailyPath(
  config: AppConfig,
  stageKey: Stage,
  platform: string | null,
  date: Date = new Date(),
): string {
  const client = config.activeClient;
  if (!client) throw new Error('No active client');

  const stageFolderName = config.stages[stageKey];
  const parts: string[] = [config.root, client, stageFolderName];

  if (config.preferences.dailyFoldersEnabled) {
    parts.push(
      formatDailyFolderName(config.preferences.dailyFolderFormat, stageFolderName, date),
    );
  }

  if (config.preferences.groupByPlatform && platform) {
    parts.push(platform);
  }

  return path.join(...parts);
}
