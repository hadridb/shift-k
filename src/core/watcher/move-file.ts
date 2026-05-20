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

// Lock-related transient errors — same retry policy across rename/copy/unlink.
const TRANSIENT_LOCK_CODES = new Set(['EBUSY', 'EPERM', 'EACCES']);

function isTransientLock(code: string | undefined): boolean {
  return code !== undefined && TRANSIENT_LOCK_CODES.has(code);
}

/**
 * Cross-volume fallback for fs.rename. Used when rename throws EXDEV
 * (source and destination on different drives — typical on Windows where
 * Downloads is on C: and project root is on E:). Copy then unlink, with
 * the same lock-retry policy as the rename path.
 *
 * Note: this is not atomic. If copyFile succeeds and unlink fails after
 * MAX_ATTEMPTS, the file ends up at BOTH source and destination. We
 * prefer that to "destination never received the file" — at least the
 * routing succeeded semantically, and the duplicate in Downloads can be
 * cleaned manually (or by a future rescan that finds the file already
 * matched at the destination and skips it).
 */
async function crossVolumeMove(sourcePath: string, destPath: string): Promise<string> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await fs.copyFile(sourcePath, destPath);
      break;
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (attempt < MAX_ATTEMPTS && isTransientLock(code)) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await fs.unlink(sourcePath);
      return destPath;
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (attempt < MAX_ATTEMPTS && isTransientLock(code)) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to remove source ${sourcePath} after ${MAX_ATTEMPTS} attempts`);
}

/**
 * Port of Move-PhasmaFile from Phasma-Watcher.ps1.
 * Creates destDir lazily, resolves name collisions with _v02/_v03 suffix,
 * retries up to MAX_ATTEMPTS with 500ms delay if the file is locked.
 * Returns the final destination path.
 *
 * Handles cross-volume moves transparently: when fs.rename throws EXDEV
 * (Downloads on C: + project root on E: is the canonical case for our
 * persona), falls back to copy + unlink. See ADR-037.
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
      // EXDEV is permanent (volume layout doesn't change between retries),
      // so we exit the rename loop immediately and switch to copy + unlink.
      if (code === 'EXDEV') {
        return crossVolumeMove(sourcePath, destPath);
      }
      // EBUSY / EPERM / EACCES = file still locked by downloader
      if (attempt < MAX_ATTEMPTS && isTransientLock(code)) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }

  // Unreachable but satisfies TypeScript
  throw new Error(`Failed to move ${fileName} after ${MAX_ATTEMPTS} attempts`);
}
