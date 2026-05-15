import fs from 'fs/promises';
import path from 'path';

const MAX_ATTEMPTS = 10;
const RETRY_DELAY_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves a non-colliding destination path.
 * If destDir/fileName already exists, appends _v02, _v03, etc.
 */
async function resolveCollisionFreePath(destDir: string, fileName: string): Promise<string> {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  let candidate = path.join(destDir, fileName);

  let n = 2;
  while (true) {
    try {
      await fs.access(candidate);
      // File exists — try next version suffix
      candidate = path.join(destDir, `${base}_v${String(n).padStart(2, '0')}${ext}`);
      n++;
    } catch {
      // File does not exist — this path is free
      return candidate;
    }
  }
}

/**
 * Port of Move-PhasmaFile from Phasma-Watcher.ps1.
 * Creates destDir lazily, resolves name collisions with _v02/_v03 suffix,
 * retries up to MAX_ATTEMPTS with 500ms delay if the file is locked.
 * Returns the final destination path.
 */
export async function moveFile(sourcePath: string, destDir: string): Promise<string> {
  await fs.mkdir(destDir, { recursive: true });

  const fileName = path.basename(sourcePath);
  const destPath = await resolveCollisionFreePath(destDir, fileName);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await fs.rename(sourcePath, destPath);
      return destPath;
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      // EBUSY / EPERM / EACCES = file still locked by downloader
      if (attempt < MAX_ATTEMPTS && (code === 'EBUSY' || code === 'EPERM' || code === 'EACCES')) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }

  // Unreachable but satisfies TypeScript
  throw new Error(`Failed to move ${fileName} after ${MAX_ATTEMPTS} attempts`);
}
