import { describe, it, expect } from 'vitest';
import {
  THEMES,
  THEME_ORDER,
  DEFAULT_THEME_ID,
  checkAvailability,
  isWindowsAtLeast,
  type Theme,
  type ThemeId,
} from './themes';

const REQUIRED_TOKENS = [
  '--bg-primary',
  '--bg-elevated',
  '--bg-hover',
  '--bg-modal',
  '--border-subtle',
  '--border-divider',
  '--text-primary',
  '--text-secondary',
  '--text-muted',
  '--text-disabled',
  '--accent',
  '--accent-text',
  '--shadow-overlay',
];

describe('THEMES registry', () => {
  it('exposes exactly 6 themes', () => {
    expect(Object.keys(THEMES)).toHaveLength(6);
    expect(THEME_ORDER).toHaveLength(6);
  });

  it('THEME_ORDER matches the registry keys', () => {
    for (const id of THEME_ORDER) {
      expect(THEMES[id]).toBeDefined();
    }
  });

  it('DEFAULT_THEME_ID is one of the registered themes', () => {
    expect(THEMES[DEFAULT_THEME_ID]).toBeDefined();
  });

  it.each(Object.entries(THEMES))(
    'theme %s defines all required tokens',
    (id, theme) => {
      for (const token of REQUIRED_TOKENS) {
        expect(theme.cssVars[token], `${id} missing ${token}`).toBeDefined();
      }
    },
  );

  it.each(Object.entries(THEMES))(
    'theme %s has matching id/key',
    (id, theme) => {
      expect(theme.id).toBe(id as ThemeId);
    },
  );

  it('only Mica declares a Windows-specific minOSVersion', () => {
    const themesWithVersionGate = Object.values(THEMES).filter((t: Theme) => t.minOSVersion?.windows);
    expect(themesWithVersionGate.map((t) => t.id)).toEqual(['mica']);
  });

  it('Aurora is the only theme with an animated background', () => {
    const animated = Object.values(THEMES).filter((t: Theme) => t.animatedBackground);
    expect(animated.map((t) => t.id)).toEqual(['aurora']);
  });
});

describe('isWindowsAtLeast', () => {
  it('returns true when current is equal', () => {
    expect(isWindowsAtLeast('10.0.22000', '10.0.22000')).toBe(true);
  });

  it('returns true when current is newer', () => {
    expect(isWindowsAtLeast('10.0.22631', '10.0.22000')).toBe(true);
    expect(isWindowsAtLeast('11.0.0', '10.0.22000')).toBe(true);
  });

  it('returns false when current is older', () => {
    expect(isWindowsAtLeast('10.0.19044', '10.0.22000')).toBe(false);
    expect(isWindowsAtLeast('10.0.0', '10.0.22000')).toBe(false);
  });

  it('handles short version strings gracefully', () => {
    expect(isWindowsAtLeast('10.0', '10.0.22000')).toBe(false);
    expect(isWindowsAtLeast('10', '10.0.22000')).toBe(false);
  });
});

describe('checkAvailability', () => {
  it('universal themes are available everywhere with no fallback', () => {
    for (const id of ['obsidian', 'carbon', 'ivory', 'aurora'] as ThemeId[]) {
      for (const platform of ['windows', 'macos', 'linux'] as const) {
        const r = checkAvailability(THEMES[id], platform, '10.0.22631');
        expect(r.available).toBe(true);
        expect(r.usesFallback).toBe(false);
      }
    }
  });

  it('Mica: available on Windows 11+ without fallback', () => {
    const r = checkAvailability(THEMES['mica'], 'windows', '10.0.22631');
    expect(r.available).toBe(true);
    expect(r.usesFallback).toBe(false);
  });

  it('Mica: unavailable on Windows 10 (no CSS fallback)', () => {
    const r = checkAvailability(THEMES['mica'], 'windows', '10.0.19044');
    expect(r.available).toBe(false);
    expect(r.reason).toMatch(/Windows/);
  });

  it('Mica: unavailable on macOS and Linux', () => {
    expect(checkAvailability(THEMES['mica'], 'macos', '0').available).toBe(false);
    expect(checkAvailability(THEMES['mica'], 'linux', '0').available).toBe(false);
  });

  it('Liquid Glass: native on macOS', () => {
    const r = checkAvailability(THEMES['liquid-glass'], 'macos', '0');
    expect(r.available).toBe(true);
    expect(r.usesFallback).toBe(false);
  });

  it('Liquid Glass: CSS fallback on Windows and Linux', () => {
    const win = checkAvailability(THEMES['liquid-glass'], 'windows', '10.0.22631');
    expect(win.available).toBe(true);
    expect(win.usesFallback).toBe(true);
    const lin = checkAvailability(THEMES['liquid-glass'], 'linux', '0');
    expect(lin.available).toBe(true);
    expect(lin.usesFallback).toBe(true);
  });
});
