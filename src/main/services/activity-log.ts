import type { ActivityEntry } from '@shared/types';

export type { ActivityEntry };

const MAX_ENTRIES = 20;
const log: ActivityEntry[] = [];

/**
 * In-memory ring buffer of routed-file events for the overlay's activity
 * feed. FIFO at MAX_ENTRIES — oldest dropped silently. The buffer is
 * intentionally not persisted: events older than the current session
 * are not useful for the "recent activity" affordance.
 */
export function addActivity(entry: ActivityEntry): void {
  log.push(entry);
  while (log.length > MAX_ENTRIES) {
    log.shift();
  }
}

/** Returns a copy of the recent entries, newest last. */
export function getRecentActivity(): ActivityEntry[] {
  return [...log];
}

/** Exposed for unit tests. */
export function _clearActivityForTests(): void {
  log.length = 0;
}

export { MAX_ENTRIES as ACTIVITY_MAX };
