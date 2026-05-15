import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { scanDownloads } from './scanner';
import { defaultConfig } from '../config/schema';
import type { AppConfig } from '@shared/types';

let tmpDir: string;
let downloadsDir: string;
let projectsDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shift-k-scan-'));
  downloadsDir = path.join(tmpDir, 'Downloads');
  projectsDir = path.join(tmpDir, 'Projects');
  await fs.mkdir(downloadsDir);
  await fs.mkdir(projectsDir);
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

const baseConfig: AppConfig = {
  ...defaultConfig,
  root: '',
  downloadsPath: '',
  activeClient: 'YSL - PURESHOTS',
  activeStage: 'out',
  routingEnabled: true,
};

function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...baseConfig,
    root: projectsDir,
    downloadsPath: downloadsDir,
    ...overrides,
  };
}

async function createDownload(name: string, content = 'data'): Promise<string> {
  const p = path.join(downloadsDir, name);
  await fs.writeFile(p, content);
  return p;
}

describe('scanDownloads', () => {
  it('returns empty result when Downloads is empty', async () => {
    const result = await scanDownloads(makeConfig());
    expect(result.routed).toHaveLength(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
  });

  it('routes a matching runway mp4', async () => {
    await createDownload('Gen-4_beauty.mp4');
    const result = await scanDownloads(makeConfig());

    expect(result.routed).toHaveLength(1);
    expect(result.routed[0]!.platform).toBe('runway');
    expect(result.routed[0]!.stageKey).toBe('out');
    // Source file no longer in Downloads
    await expect(fs.access(path.join(downloadsDir, 'Gen-4_beauty.mp4'))).rejects.toThrow();
  });

  it('skips browser temp files', async () => {
    await createDownload('Gen-4_clip.mp4.crdownload');
    await createDownload('kling_render.part');
    const result = await scanDownloads(makeConfig());

    expect(result.routed).toHaveLength(0);
    expect(result.skipped).toBe(2);
  });

  it('skips files with no matching platform', async () => {
    await createDownload('random_document.pdf');
    const result = await scanDownloads(makeConfig());

    expect(result.routed).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it('skips everything when activeClient is null', async () => {
    await createDownload('Gen-4_beauty.mp4');
    const result = await scanDownloads(makeConfig({ activeClient: null }));

    expect(result.routed).toHaveLength(0);
    expect(result.skipped).toBe(1);
  });

  it('skips everything when routingEnabled is false', async () => {
    await createDownload('Gen-4_beauty.mp4');
    const result = await scanDownloads(makeConfig({ routingEnabled: false }));

    expect(result.skipped).toBe(1);
  });

  it('routes multiple files in one scan', async () => {
    await createDownload('Gen-4_clip1.mp4');
    await createDownload('Kling_render.mp4');
    await createDownload('HF_beauty.mp4');
    const result = await scanDownloads(makeConfig());

    expect(result.routed).toHaveLength(3);
    const platforms = result.routed.map((r) => r.platform).sort();
    expect(platforms).toEqual(['higgsfield', 'kling', 'runway']);
  });

  it('returns error when downloadsPath does not exist', async () => {
    const result = await scanDownloads(makeConfig({ downloadsPath: '/nonexistent/path' }));
    expect(result.errors).toHaveLength(1);
  });
});
