import { describe, it, expect } from 'vitest';
import {
  THEMES,
  THEME_ORDER,
  DEFAULT_THEME_ID,
  checkAvailability,
  isWindowsAtLeast,
  getThemeLabel,
  getThemeDescription,
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
  it('exposes exactly 4 themes (Sprint 7.6: Mica + Aurora removed)', () => {
    expect(Object.keys(THEMES)).toHaveLength(4);
    expect(THEME_ORDER).toHaveLength(4);
  });

  it('does NOT include mica or aurora', () => {
    expect(Object.keys(THEMES)).not.toContain('mica');
    expect(Object.keys(THEMES)).not.toContain('aurora');
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
    for (const id of ['obsidian', 'carbon', 'ivory'] as ThemeId[]) {
      for (const platform of ['windows', 'macos', 'linux'] as const) {
        const r = checkAvailability(THEMES[id], platform, '10.0.22631');
        expect(r.available).toBe(true);
        expect(r.usesFallback).toBe(false);
      }
    }
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

describe('getThemeLabel / getThemeDescription (ADR-030)', () => {
  it('non-liquid-glass themes return their static label everywhere', () => {
    for (const id of ['obsidian', 'carbon', 'ivory'] as ThemeId[]) {
      const t = THEMES[id];
      expect(getThemeLabel(t, 'windows')).toBe(t.label);
      expect(getThemeLabel(t, 'macos')).toBe(t.label);
    }
  });

  it('Liquid Glass: "Liquid Glass" on macOS, "Transparency" on Windows / Linux', () => {
    const t = THEMES['liquid-glass'];
    expect(getThemeLabel(t, 'macos')).toBe('Liquid Glass');
    expect(getThemeLabel(t, 'windows')).toBe('Transparency');
    expect(getThemeLabel(t, 'linux')).toBe('Transparency');
  });

  it('Liquid Glass description: vibrancy mention on macOS, approximation CSS elsewhere', () => {
    const t = THEMES['liquid-glass'];
    expect(getThemeDescription(t, 'macos')).toMatch(/[Vv]ibrancy/);
    expect(getThemeDescription(t, 'windows')).toMatch(/[Aa]pproximation CSS/);
  });
});
