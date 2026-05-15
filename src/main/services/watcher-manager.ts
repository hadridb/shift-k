import { type FSWatcher } from 'chokidar';
import { createWatcher, type WatcherEvent } from '@core/watcher/watcher';
import { getConfig } from '@core/config/store';

let watcher: FSWatcher | null = null;
let currentPath = '';
let currentRoutingEnabled = false;
let eventHandler: (event: WatcherEvent) => void = () => {};

export function setWatcherEventHandler(handler: (event: WatcherEvent) => void): void {
  eventHandler = handler;
}

/**
 * Sync the watcher to the current config.
 *
 * The watcher is only running when BOTH:
 *  - config.downloadsPath is set
 *  - config.routingEnabled is true
 *
 * Pausing routing fully closes the watcher (drops any pending
 * awaitWriteFinish queue), so files dropped during a pause cannot be
 * routed by a subsequent resume — they sit in Downloads until the user
 * triggers Rescan. Resuming spins up a fresh watcher with
 * ignoreInitial:true so existing files aren't auto-processed.
 */
export async function syncWatcher(): Promise<void> {
  const config = getConfig();
  const newPath = config.downloadsPath;
  const newRouting = config.routingEnabled;

  const sameState =
    !!watcher && currentPath === newPath && currentRoutingEnabled === newRouting;
  if (sameState) return;

  // Await the close so any in-flight awaitWriteFinish queue from the
  // previous watcher is drained before we either spin up a new one or
  // leave the system in a closed state. Without await, a chokidar event
  // could still fire after we think the watcher is gone.
  if (watcher) {
    await watcher.close();
    watcher = null;
  }
  currentPath = newPath;
  currentRoutingEnabled = newRouting;

  if (newPath && newRouting) {
    watcher = createWatcher({
      getConfig,
      onEvent: (event) => eventHandler(event),
    });
  }
}

export async function closeWatcher(): Promise<void> {
  if (watcher) {
    await watcher.close();
    watcher = null;
    currentPath = '';
    currentRoutingEnabled = false;
  }
}
