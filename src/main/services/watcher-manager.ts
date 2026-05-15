import { type FSWatcher } from 'chokidar';
import { createWatcher, type WatcherEvent } from '@core/watcher/watcher';
import { getConfig } from '@core/config/store';

let watcher: FSWatcher | null = null;
let currentPath = '';
let eventHandler: (event: WatcherEvent) => void = () => {};

export function setWatcherEventHandler(handler: (event: WatcherEvent) => void): void {
  eventHandler = handler;
}

/**
 * Sync the watcher to the current config.downloadsPath.
 * - Starts a watcher if path is set and none is running.
 * - Restarts the watcher if path changed.
 * - Stops the watcher if path is cleared.
 */
export function syncWatcher(): void {
  const config = getConfig();
  const newPath = config.downloadsPath;

  if (newPath === currentPath && watcher) return;

  if (watcher) {
    void watcher.close();
    watcher = null;
  }
  currentPath = newPath;

  if (newPath) {
    watcher = createWatcher({
      getConfig,
      onEvent: (event) => eventHandler(event),
    });
  }
}

export function closeWatcher(): void {
  if (watcher) {
    void watcher.close();
    watcher = null;
    currentPath = '';
  }
}
