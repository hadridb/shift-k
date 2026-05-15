import fs from 'fs/promises';
import path from 'path';
import type { AppConfig, ScanResult, RouteResult } from '@shared/types';
import { resolveDestination } from '../router/resolver';
import { moveFile } from '../watcher/move-file';

const SKIP_EXTENSIONS = new Set(['.crdownload', '.part', '.tmp', '.opdownload']);

/**
 * Port of Phasma-Scan.ps1.
 * Scans downloadsPath and routes all matching files to the active client.
 * Used for manual rescan and boot catch-up.
 */
export async function scanDownloads(config: AppConfig): Promise<ScanResult> {
  const routed: RouteResult[] = [];
  let skipped = 0;
  const errors: Array<{ file: string; error: string }> = [];

  let entries: string[];
  try {
    const dirents = await fs.readdir(config.downloadsPath, { withFileTypes: true });
    entries = dirents
      .filter((d) => d.isFile())
      .map((d) => path.join(config.downloadsPath, d.name));
  } catch (err: unknown) {
    return {
      routed,
      skipped,
      errors: [{ file: config.downloadsPath, error: String(err) }],
    };
  }

  const now = new Date();

  for (const filePath of entries) {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();

    if (SKIP_EXTENSIONS.has(ext)) {
      skipped++;
      continue;
    }

    const dest = resolveDestination(fileName, config, now);
    if (!dest) {
      skipped++;
      continue;
    }

    try {
      const destinationPath = await moveFile(filePath, dest.destDir);
      routed.push({
        sourcePath: filePath,
        destinationPath,
        platform: dest.platform,
        stageKey: dest.stageKey,
        stageFolderName: dest.stageFolderName,
        movedAt: now,
      });
    } catch (err: unknown) {
      errors.push({ file: fileName, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return { routed, skipped, errors };
}
