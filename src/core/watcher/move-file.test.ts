import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { moveFile } from './move-file';

function exdevError(): NodeJS.ErrnoException {
  const err = new Error('EXDEV: cross-device link not permitted') as NodeJS.ErrnoException;
  err.code = 'EXDEV';
  return err;
}

function ebusyError(): NodeJS.ErrnoException {
  const err = new Error('EBUSY: resource busy or locked') as NodeJS.ErrnoException;
  err.code = 'EBUSY';
  return err;
}

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

  // Sprint 8c (ADR-037) — EXDEV cross-volume fallback.
  // We can't create a real cross-volume scenario in CI (no second drive),
  // so we mock fs.rename to throw EXDEV and verify the copy+unlink fallback
  // runs correctly. The fallback uses the real fs.copyFile + fs.unlink so
  // the test still exercises the actual filesystem semantics for those calls.

  it('falls back to copy + unlink when fs.rename throws EXDEV', async () => {
    const src = await createFile(tmpDir, 'cross_volume.mp3', 'audio bytes');
    const destDir = path.join(tmpDir, 'dest');

    const renameSpy = vi.spyOn(fs, 'rename').mockImplementationOnce(async () => {
      throw exdevError();
    });

    const result = await moveFile(src, destDir);

    expect(result).toBe(path.join(destDir, 'cross_volume.mp3'));
    await expect(fs.access(src)).rejects.toThrow();
    const content = await fs.readFile(result, 'utf8');
    expect(content).toBe('audio bytes');

    renameSpy.mockRestore();
  });

  it('EXDEV bypasses the rename retry loop (rename called once, not 10 times)', async () => {
    const src = await createFile(tmpDir, 'no_retry.mp3', 'x');
    const destDir = path.join(tmpDir, 'dest');

    const renameSpy = vi.spyOn(fs, 'rename').mockImplementationOnce(async () => {
      throw exdevError();
    });

    await moveFile(src, destDir);

    expect(renameSpy).toHaveBeenCalledTimes(1);
    renameSpy.mockRestore();
  });

  it('EXDEV + name collision still resolves _v02 suffix correctly', async () => {
    const destDir = path.join(tmpDir, 'dest');
    await fs.mkdir(destDir);
    await createFile(destDir, 'clip.mp3', 'existing');
    const src = await createFile(tmpDir, 'clip.mp3', 'new');

    const renameSpy = vi.spyOn(fs, 'rename').mockImplementationOnce(async () => {
      throw exdevError();
    });

    const result = await moveFile(src, destDir);

    expect(path.basename(result)).toBe('clip_v02.mp3');
    const content = await fs.readFile(result, 'utf8');
    expect(content).toBe('new');
    renameSpy.mockRestore();
  });

  it('non-EXDEV non-transient rename errors still throw (not silently swallowed)', async () => {
    const src = await createFile(tmpDir, 'genuine_failure.mp3', 'x');
    const destDir = path.join(tmpDir, 'dest');

    const enoent = new Error('ENOENT: no such file') as NodeJS.ErrnoException;
    enoent.code = 'ENOENT';
    const renameSpy = vi.spyOn(fs, 'rename').mockImplementation(async () => {
      throw enoent;
    });

    await expect(moveFile(src, destDir)).rejects.toThrow(/ENOENT/);
    renameSpy.mockRestore();
  });

  it('EXDEV path retries copyFile on EBUSY (transient lock)', async () => {
    const src = await createFile(tmpDir, 'locked.mp3', 'bytes');
    const destDir = path.join(tmpDir, 'dest');

    const renameSpy = vi.spyOn(fs, 'rename').mockImplementationOnce(async () => {
      throw exdevError();
    });
    // First copyFile attempt throws EBUSY, second succeeds (real impl)
    let copyAttempts = 0;
    const realCopyFile = fs.copyFile.bind(fs);
    const copySpy = vi.spyOn(fs, 'copyFile').mockImplementation(async (s: Parameters<typeof fs.copyFile>[0], d: Parameters<typeof fs.copyFile>[1]) => {
      copyAttempts += 1;
      if (copyAttempts === 1) throw ebusyError();
      return realCopyFile(s, d);
    });

    const result = await moveFile(src, destDir);

    expect(result).toBe(path.join(destDir, 'locked.mp3'));
    expect(copyAttempts).toBeGreaterThanOrEqual(2);
    renameSpy.mockRestore();
    copySpy.mockRestore();
  });
});
