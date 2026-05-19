import fs from 'fs/promises';
import path from 'path';
import type { AppConfig, Stage } from '@shared/types';
import { formatDailyFolderName } from '@core/router/daily-path';

const DAILY_STAGES: Stage[] = ['src', 'img', 'out', 'liv'];

function sanitizeName(name: string): string {
  // eslint-disable-next-line no-control-regex
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, '').trim();
}

async function pathExists(p: string): Promise<boolean> {
  return fs.access(p).then(() => true).catch(() => false);
}

export async function createProject(
  config: AppConfig,
  client: string,
  mission: string,
): Promise<string> {
  const clientName = sanitizeName(client);
  const missionName = sanitizeName(mission);
  if (!clientName || !missionName) throw new Error('Client and mission names are required');

  const projectName = `${clientName} - ${missionName}`;
  const projectPath = path.join(config.root, projectName);

  if (!(await pathExists(projectPath))) {
    const templatePath = path.join(config.root, '_TEMPLATE');
    if (await pathExists(templatePath)) {
      await fs.cp(templatePath, projectPath, { recursive: true });
    } else {
      await fs.mkdir(projectPath, { recursive: true });
    }

    const dailyEnabled = config.preferences.dailyFoldersEnabled;
    const stageEntries = Object.entries(config.stages) as [Stage, string][];

    for (const [stageKey, stageFolderName] of stageEntries) {
      const stagePath = path.join(projectPath, stageFolderName);
      await fs.mkdir(stagePath, { recursive: true });
      if (dailyEnabled && DAILY_STAGES.includes(stageKey)) {
        const dailyFolder = formatDailyFolderName(
          config.preferences.dailyFolderFormat,
          stageFolderName,
        );
        await fs.mkdir(path.join(stagePath, dailyFolder), { recursive: true });
      }
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const readme = `Projet : ${projectName}\nCréé : ${dateStr}\nClient : ${clientName}\nMission : ${missionName}\n`;
    await fs.writeFile(path.join(projectPath, '_README.txt'), readme, 'utf-8');
  }

  return projectName;
}

export async function listProjects(root: string): Promise<string[]> {
  if (!root) return [];
  const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);
  return entries
    .filter((e) => e.isDirectory() && !e.name.startsWith('_'))
    .map((e) => e.name)
    .sort();
}
