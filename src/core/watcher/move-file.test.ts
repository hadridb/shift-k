import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { moveFile } from './move-file';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'shift-k-test-'));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

async function createFile(dir: string, name: string, content = 'data'): Promise<string> {
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, content);
  return filePath;
}

describe('moveFile', () => {
  it('moves a file to destDir', async () => {
    const src = await createFile(tmpDir, 'Gen-4_clip.mp4');
    const destDir = path.join(tmpDir, 'dest');

    const result = await moveFile(src, destDir);

    expect(result).toBe(path.join(destDir, 'Gen-4_clip.mp4'));
    await expect(fs.access(result)).resolves.toBeUndefined();
    await expect(fs.access(src)).rejects.toThrow();
  });

  it('creates destDir recursively if it does not exist', async () => {
    const src = await createFile(tmpDir, 'clip.mp4');
    const destDir = path.join(tmpDir, 'a', 'b', 'c');

    await moveFile(src, destDir);

    await expect(fs.access(destDir)).resolves.toBeUndefined();
  });

  it('appends _v02 when destination file already exists', async () => {
    const src = await createFile(tmpDir, 'clip.mp4', 'new');
    const destDir = path.join(tmpDir, 'dest');
    // Pre-create collision
    await fs.mkdir(destDir);
    await createFile(destDir, 'clip.mp4', 'existing');

    const result = await moveFile(src, destDir);

    expect(path.basename(result)).toBe('clip_v02.mp4');
  });

  it('appends _v03 when _v02 also exists', async () => {
    const src = await createFile(tmpDir, 'clip.mp4', 'new');
    const destDir = path.join(tmpDir, 'dest');
    await fs.mkdir(destDir);
    await createFile(destDir, 'clip.mp4', 'v1');
    await createFile(destDir, 'clip_v02.mp4', 'v2');

    const result = await moveFile(src, destDir);

    expect(path.basename(result)).toBe('clip_v03.mp4');
  });

  it('preserves file content after move', async () => {
    const content = 'binary-ish content 🎬';
    const src = await createFile(tmpDir, 'clip.mov', content);
    const destDir = path.join(tmpDir, 'dest');

    const result = await moveFile(src, destDir);
    const readBack = await fs.readFile(result, 'utf8');

    expect(readBack).toBe(content);
  });

  it('handles files without extension for collision', async () => {
    const src = path.join(tmpDir, 'noext');
    await fs.writeFile(src, 'data');
    const destDir = path.join(tmpDir, 'dest');
    await fs.mkdir(destDir);
    await fs.writeFile(path.join(destDir, 'noext'), 'existing');

    const result = await moveFile(src, destDir);

    expect(path.basename(result)).toBe('noext_v02');
  });
});
