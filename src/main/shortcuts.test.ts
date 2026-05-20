import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Cross-platform contract for globalShortcut accelerators. On macOS, hotkeys
 * must reach the user as Cmd+Option+... (not Ctrl+Option+...). We rely on
 * Electron's `CommandOrControl` token to map Cmd on Darwin and Ctrl elsewhere
 * — using the literal `Control+...` form would force Ctrl on Mac too, which
 * is non-idiomatic for the platform.
 *
 * Source-inspection mirrors the overlay.test.ts approach: we cannot
 * instantiate globalShortcut without an Electron context.
 */
const SOURCE = readFileSync(join(__dirname, 'shortcuts.ts'), 'utf-8');

describe('globalShortcut accelerators (cross-platform contract)', () => {
  it('never uses the literal `Control+` form for register() calls', () => {
    // Find every `register('XYZ', ...)` call inside the registerShortcuts body
    // and assert none of them start with `Control+`.
    const calls = [...SOURCE.matchAll(/register\(\s*[`'"]([^`'"]+)[`'"]/g)];
    expect(calls.length).toBeGreaterThan(0);
    for (const [, accel] of calls) {
      expect(accel, `accelerator "${accel}" should use CommandOrControl, not Control`).not.toMatch(/^Control\+/);
    }
  });

  it('uses CommandOrControl for the overlay toggle (Cmd+Shift+K on Mac)', () => {
    expect(SOURCE).toMatch(/register\(\s*[`'"]CommandOrControl\+Shift\+K[`'"]/);
  });

  it('uses CommandOrControl+Alt for the slot accelerator template', () => {
    expect(SOURCE).toMatch(/CommandOrControl\+Alt\+\$\{key\}/);
  });

  it('uses CommandOrControl+Alt+S for stage cycle', () => {
    expect(SOURCE).toMatch(/register\(\s*[`'"]CommandOrControl\+Alt\+S[`'"]/);
  });

  it('uses CommandOrControl+Alt+P for pause toggle', () => {
    expect(SOURCE).toMatch(/register\(\s*[`'"]CommandOrControl\+Alt\+P[`'"]/);
  });

  it('iterates the 10 slot keys (1..9 + 0)', () => {
    expect(SOURCE).toMatch(/SLOT_KEYS:\s*SlotKey\[\]\s*=\s*\[\s*'1',\s*'2',\s*'3',\s*'4',\s*'5',\s*'6',\s*'7',\s*'8',\s*'9',\s*'0'\s*\]/);
  });
});
