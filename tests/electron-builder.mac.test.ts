import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Sprint 10 — Mac packaging contract.
 *
 * Asserts that electron-builder.yml carries a sane `mac:` section ready
 * for signing + notarization once Apple Developer credentials arrive.
 * The actual `dist:mac` run will happen on a Mac with real certs; this
 * test guards against regression of the static config that we author
 * here on Windows.
 *
 * Source-inspection (regex) rather than YAML parse — same crude approach
 * as overlay.test.ts to avoid pulling js-yaml as a devDependency for one
 * file.
 */
const ROOT = join(__dirname, '..');
const BUILDER_YML = readFileSync(join(ROOT, 'electron-builder.yml'), 'utf-8');
const ENTITLEMENTS_PATH = join(ROOT, 'electron', 'resources', 'entitlements.mac.plist');
const ENTITLEMENTS = readFileSync(ENTITLEMENTS_PATH, 'utf-8');
const PACKAGE_JSON = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));

describe('electron-builder.yml — mac: section (ADR-035)', () => {
  it('declares a mac: section', () => {
    expect(BUILDER_YML).toMatch(/\nmac:\s*\n/);
  });

  it('uses productivity category', () => {
    expect(BUILDER_YML).toMatch(/category:\s*public\.app-category\.productivity/);
  });

  it('targets dmg and zip', () => {
    expect(BUILDER_YML).toMatch(/-\s*target:\s*dmg/);
    expect(BUILDER_YML).toMatch(/-\s*target:\s*zip/);
  });

  it('builds for both arm64 (Apple Silicon) and x64 (Intel/Rosetta)', () => {
    // Both arches must appear within the mac: block at least once each.
    const macBlock = BUILDER_YML.match(/\nmac:[\s\S]*?(?=\n[a-z]+:\n|$)/)?.[0] ?? '';
    expect(macBlock).toMatch(/arch:[\s\S]*?-\s*arm64/);
    expect(macBlock).toMatch(/arch:[\s\S]*?-\s*x64/);
  });

  it('enables hardened runtime (required for notarization)', () => {
    expect(BUILDER_YML).toMatch(/hardenedRuntime:\s*true/);
  });

  it('disables gatekeeperAssess (skips local pre-flight check)', () => {
    expect(BUILDER_YML).toMatch(/gatekeeperAssess:\s*false/);
  });

  it('references the entitlements plist for both signing and inheriting', () => {
    expect(BUILDER_YML).toMatch(/entitlements:\s*electron\/resources\/entitlements\.mac\.plist/);
    expect(BUILDER_YML).toMatch(/entitlementsInherit:\s*electron\/resources\/entitlements\.mac\.plist/);
  });

  it('declares a notarize.teamId (placeholder is acceptable until enrollment ships)', () => {
    expect(BUILDER_YML).toMatch(/notarize:\s*\n\s*teamId:\s*\S+/);
  });

  it('sets LSUIElement so Shift-K stays out of the Dock (menu bar only)', () => {
    expect(BUILDER_YML).toMatch(/LSUIElement:\s*true/);
  });

  it('declares NSDownloadsFolderUsageDescription (macOS 10.15+ permission prompt)', () => {
    expect(BUILDER_YML).toMatch(/NSDownloadsFolderUsageDescription:/);
  });
});

describe('electron/resources/entitlements.mac.plist', () => {
  it('exists at the path referenced in electron-builder.yml', () => {
    expect(existsSync(ENTITLEMENTS_PATH)).toBe(true);
  });

  it('is a valid plist XML root', () => {
    expect(ENTITLEMENTS).toMatch(/<\?xml version="1\.0"/);
    expect(ENTITLEMENTS).toMatch(/<plist version="1\.0">/);
    expect(ENTITLEMENTS).toMatch(/<\/plist>/);
  });

  it('declares allow-unsigned-executable-memory (Electron V8 requirement)', () => {
    expect(ENTITLEMENTS).toMatch(/<key>com\.apple\.security\.cs\.allow-unsigned-executable-memory<\/key>\s*<true\/>/);
  });

  it('declares allow-jit (V8 JIT compilation)', () => {
    expect(ENTITLEMENTS).toMatch(/<key>com\.apple\.security\.cs\.allow-jit<\/key>\s*<true\/>/);
  });

  it('declares files.user-selected.read-write (path picker access)', () => {
    expect(ENTITLEMENTS).toMatch(/<key>com\.apple\.security\.files\.user-selected\.read-write<\/key>\s*<true\/>/);
  });

  it('declares files.downloads.read-write (Downloads folder watcher)', () => {
    expect(ENTITLEMENTS).toMatch(/<key>com\.apple\.security\.files\.downloads\.read-write<\/key>\s*<true\/>/);
  });
});

describe('package.json — dist:mac script', () => {
  it('exposes a dist:mac npm script', () => {
    expect(PACKAGE_JSON.scripts['dist:mac']).toBeDefined();
  });

  it('dist:mac builds before packaging and uses --mac flag', () => {
    expect(PACKAGE_JSON.scripts['dist:mac']).toMatch(/npm run build/);
    expect(PACKAGE_JSON.scripts['dist:mac']).toMatch(/electron-builder.*--mac/);
  });
});
