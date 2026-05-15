import fs from 'fs/promises';
import path from 'path';
import type {
  AppConfig,
  ScanResult,
  RouteResult,
  RescanPreview,
  RescanPreviewItem,
} from '@shared/types';
import { resolveDestination } from '../router/resolver';
import { moveFile } from '../watcher/move-file';

const SKIP_EXTENSIONS = new Set(['.crdownload', '.part', '.tmp', '.opdownload']);

/**
 * Scan the Downloads folder without moving anything. Returns the list of
 * matching files with their would-be destinations, plus the skipped count
 * and any errors encountered while reading the directory or stat-ing files.
 *
 * Used to drive the dry-run rescan modal (Sprint 4, ADR coming) before the
 * user confirms.
 */
export async function previewRescan(config: AppConfig): Promise<RescanPreview> {
  const items: RescanPreviewItem[] = [];
  let skipped = 0;
  const errors: Array<{ file: string; error: string }> = [];

  let entries: { fullPath: string; name: string }[];
  try {
    const dirents = await fs.readdir(config.downloadsPath, { withFileTypes: true });
    entries = dirents
      .filter((d) => d.isFile())
      .map((d) => ({ fullPath: path.join(config.downloadsPath, d.name), name: d.name }));
  } catch (err: unknown) {
    return {
      items: [],
      skipped: 0,
      errors: [{ file: config.downloadsPath, error: String(err) }],
    };
  }

  const now = new Date();

  for (const entry of entries) {
    const ext = path.extname(entry.name).toLowerCase();
    if (SKIP_EXTENSIONS.has(ext)) {
      skipped++;
      continue;
    }

    const dest = resolveDestination(entry.name, config, now);
    if (!dest) {
      skipped++;
      continue;
    }

    try {
      const stat = await fs.stat(entry.fullPath);
      items.push({
        sourcePath: entry.fullPath,
        fileName: entry.name,
        size: stat.size,
        modifiedAt: stat.mtime,
        platform: dest.platform,
        stageKey: dest.stageKey,
        stageFolderName: dest.stageFolderName,
        destDir: dest.destDir,
      });
    } catch (err: unknown) {
      errors.push({
        file: entry.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { items, skipped, errors };
}

/**
 * Move a previously-previewed list of files to their resolved destinations.
 * The destDir on each item is trusted — the renderer's selection drives the
 * exact moves, so there's no re-resolution here. Returns a ScanResult.
 */
export async function executeRescan(items: RescanPreviewItem[]): Promise<ScanResult> {
  const routed: RouteResult[] = [];
  const errors: Array<{ file: string; error: string }> = [];
  const now = new Date();

  for (const item of items) {
    try {
      const destinationPath = await moveFile(item.sourcePath, item.destDir);
      routed.push({
        sourcePath: item.sourcePath,
        destinationPath,
        platform: item.platform,
        stageKey: item.stageKey,
        stageFolderName: item.stageFolderName,
        movedAt: now,
      });
    } catch (err: unknown) {
      errors.push({
        file: item.fileName,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { routed, skipped: 0, errors };
}

/**
 * Port of Phasma-Scan.ps1.
 * Scans downloadsPath and routes all matching files to the active client.
 * Used when confirmBeforeRescan is false, and for boot catch-up.
 *
 * Now implemented as previewRescan + executeRescan so there's a single source
 * of truth for matching logic.
 */
export async function scanDownloads(config: AppConfig): Promise<ScanResult> {
  const preview = await previewRescan(config);
  const result = await executeRescan(preview.items);
  return {
    routed: result.routed,
    skipped: preview.skipped,
    errors: [...preview.errors, ...result.errors],
  };
}
