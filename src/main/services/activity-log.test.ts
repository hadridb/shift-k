import { describe, it, expect, beforeEach } from 'vitest';
import {
  addActivity,
  getRecentActivity,
  _clearActivityForTests,
  ACTIVITY_MAX,
} from './activity-log';
import type { ActivityEntry } from './activity-log';

function entry(i: number): ActivityEntry {
  return {
    filename: `file_${i}.mp4`,
    client: 'YSL - PURESHOTS',
    stage: 'out',
    stageFolderName: '03_Outputs',
    platform: 'runway',
    timestamp: Date.now() + i,
  };
}

describe('activity-log', () => {
  beforeEach(() => {
    _clearActivityForTests();
  });

  it('returns empty when nothing logged', () => {
    expect(getRecentActivity()).toEqual([]);
  });

  it('records entries in insertion order (newest last)', () => {
    addActivity(entry(1));
    addActivity(entry(2));
    addActivity(entry(3));
    const recent = getRecentActivity();
    expect(recent.map((e) => e.filename)).toEqual([
      'file_1.mp4',
      'file_2.mp4',
      'file_3.mp4',
    ]);
  });

  it('caps at ACTIVITY_MAX, drops oldest first (FIFO)', () => {
    for (let i = 0; i < ACTIVITY_MAX + 5; i++) addActivity(entry(i));
    const recent = getRecentActivity();
    expect(recent).toHaveLength(ACTIVITY_MAX);
    // The first 5 entries should have been dropped.
    expect(recent[0]!.filename).toBe(`file_${5}.mp4`);
    expect(recent[recent.length - 1]!.filename).toBe(`file_${ACTIVITY_MAX + 4}.mp4`);
  });

  it('getRecentActivity returns a copy — caller cannot mutate internal log', () => {
    addActivity(entry(1));
    const recent = getRecentActivity();
    recent.push(entry(99));
    expect(getRecentActivity()).toHaveLength(1);
  });
});
