import chokidar, { type FSWatcher } from 'chokidar';
import path from 'path';
import type { AppConfig, RouteResult } from '@shared/types';
import { resolveDestination } from '../router/resolver';
import { moveFile } from './move-file';

export type WatcherEvent =
  | { type: 'routed'; result: RouteResult }
  | { type: 'error'; file: string; error: string };

export interface WatcherOptions {
  getConfig: () => AppConfig;
  onEvent: (event: WatcherEvent) => void;
}

async function processFile(
  filePath: string,
  getConfig: () => AppConfig,
  onEvent: (event: WatcherEvent) => void,
): Promise<void> {
  const config = getConfig();
  const fileName = path.basename(filePath);

  const dest = resolveDestination(fileName, config);
  if (!dest) return;

  try {
    const destinationPath = await moveFile(filePath, dest.destDir);
    onEvent({
      type: 'routed',
      result: {
        sourcePath: filePath,
        destinationPath,
        platform: dest.platform,
        stageKey: dest.stageKey,
        stageFolderName: dest.stageFolderName,
        movedAt: new Date(),
      },
    });
  } catch (err: unknown) {
    onEvent({
      type: 'error',
      file: fileName,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Port of Phasma-Watcher.ps1.
 * Watches downloadsPath (non-recursive), routes recognised AI platform files
 * to the active client/stage/daily folder.
 *
 * Uses chokidar awaitWriteFinish so files are processed only after the
 * downloader has finished writing (replaces the 1500ms sleep in V1).
 */
export function createWatcher(options: WatcherOptions): FSWatcher {
  const { getConfig, onEvent } = options;
  const config = getConfig();

  const watcher = chokidar.watch(config.downloadsPath, {
    depth: 0,
    // Existing files at startup or after a pause/resume cycle are NOT auto-routed.
    // The user must trigger Rescan explicitly. This avoids the timing window
    // where pause + drop + quick-resume would have routed the file anyway via
    // chokidar's awaitWriteFinish buffer.
    ignoreInitial: true,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 200,
    },
  });

  const handle = (filePath: string): void => {
    void processFile(filePath, getConfig, onEvent);
  };

  watcher.on('add', handle);
  watcher.on('change', handle);

  return watcher;
}
