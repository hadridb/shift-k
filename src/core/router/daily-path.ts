import path from 'path';
import type { AppConfig, Stage } from '@shared/types';

export function formatDailyFolderName(format: string, date: Date = new Date()): string {
  const yyyy = date.getFullYear().toString();
  const MM = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return format.replace('{yyyy-MM-dd}', `${yyyy}-${MM}-${dd}`);
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
  const dailyFolder = formatDailyFolderName(config.preferences.dailyFolderFormat, date);

  const parts = [config.root, client, stageFolderName, dailyFolder];
  if (config.preferences.groupByPlatform && platform) {
    parts.push(platform);
  }

  return path.join(...parts);
}
