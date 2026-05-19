import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Regression test for ADR-028 — the overlay BrowserWindow must stay locked
 * at fixed dimensions across all interactions (modal open/close, toast
 * appearance, etc.). The bug we're guarding against is the May 19 2026
 * visual regression where opening a modal made the rounded corners
 * disappear because the renderer pushed the body height past the window.
 *
 * We inspect the source rather than instantiating BrowserWindow (which
 * needs an Electron context) — crude but catches the specific patterns
 * that historically caused this class of bug.
 */
const SOURCE = readFileSync(
  join(__dirname, 'overlay.ts'),
  'utf-8',
);

describe('overlay BrowserWindow source contract (ADR-028)', () => {
  it('declares OVERLAY_WIDTH = 290', () => {
    expect(SOURCE).toMatch(/const OVERLAY_WIDTH\s*=\s*290\b/);
  });

  it('declares OVERLAY_HEIGHT = 460', () => {
    expect(SOURCE).toMatch(/const OVERLAY_HEIGHT\s*=\s*460\b/);
  });

  it('passes width: OVERLAY_WIDTH to BrowserWindow', () => {
    expect(SOURCE).toMatch(/width:\s*OVERLAY_WIDTH/);
  });

  it('passes height: OVERLAY_HEIGHT to BrowserWindow', () => {
    expect(SOURCE).toMatch(/height:\s*OVERLAY_HEIGHT/);
  });

  it('explicitly opts out of resize', () => {
    expect(SOURCE).toMatch(/resizable:\s*false/);
  });

  it('explicitly opts out of useContentSize (window is the OUTER frame)', () => {
    expect(SOURCE).toMatch(/useContentSize:\s*false/);
  });

  it('uses transparent background so themes can paint OS materials', () => {
    expect(SOURCE).toMatch(/transparent:\s*true/);
    expect(SOURCE).toMatch(/backgroundColor:\s*['"]#00000000['"]/);
  });

  it('never calls setSize / setBounds / setContentSize', () => {
    expect(SOURCE).not.toMatch(/\.setSize\s*\(/);
    expect(SOURCE).not.toMatch(/\.setBounds\s*\(/);
    expect(SOURCE).not.toMatch(/\.setContentSize\s*\(/);
  });

  it('never installs a did-finish-load listener (typical resize trigger)', () => {
    expect(SOURCE).not.toMatch(/did-finish-load/);
  });
});
