/**
 * Theme registry. Each entry defines:
 *  - the CSS variables that drive every component's inline styles
 *    (applied via `:root[data-theme="<id>"]` blocks in themes.css)
 *  - whether the theme needs a native OS window-material call from
 *    the main process (currently only macOS vibrancy)
 *  - the metadata the picker UI needs to render mini-previews and
 *    grey out unavailable cards
 *
 * The single source of truth is this object — themes.css mirrors the
 * cssVars for runtime application, and tests assert the two stay in
 * sync. See ADR-029 + ADR-030 for architecture + the Sprint 7.6 decisions
 * (Mica + Aurora removed, Liquid Glass renamed per-platform).
 */

export type ThemeId = 'obsidian' | 'carbon' | 'ivory' | 'liquid-glass';

export type ThemeCategory = 'standard' | 'translucent';

export type Platform = 'windows' | 'macos' | 'linux';

export type ThemeAvailability =
  | { kind: 'universal' }
  | { kind: 'native-or-fallback'; native: Platform[]; cssFallback: boolean };

export type Vibrancy =
  | 'hud'
  | 'sidebar'
  | 'window'
  | 'fullscreen-ui'
  | 'titlebar'
  | 'menu'
  | 'popover'
  | 'selection'
  | 'under-window'
  | 'header'
  | 'sheet'
  | 'content'
  | 'under-page';

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  category: ThemeCategory;
  availability: ThemeAvailability;
  cssVars: Record<string, string>;
  vibrancy?: Vibrancy;
}

/**
 * Token names follow a flat namespacing: `--<scope>-<role>`. Components
 * consume them via inline style or Tailwind classes that map to vars.
 * The full set is defined here so every theme MUST set every key.
 */
const TOKEN_KEYS = [
  'bg-primary',
  'bg-elevated',
  'bg-hover',
  'bg-modal',
  'border-subtle',
  'border-divider',
  'text-primary',
  'text-secondary',
  'text-muted',
  'text-disabled',
  'accent',
  // Contrasting text colour for buttons / chips painted with --accent.
  // CRITICAL for the translucent themes where --bg-primary is transparent —
  // before this token, buttons that used `color: var(--bg-primary)` over an
  // `--accent` background rendered as invisible-on-white.
  'accent-text',
  'shadow-overlay',
] as const;

export type TokenKey = (typeof TOKEN_KEYS)[number];

function vars(map: Record<TokenKey, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map).map(([k, v]) => [`--${k}`, v]),
  );
}

// --- 1. Obsidian (default, universal, deep black) ----------------------

const obsidian: Theme = {
  id: 'obsidian',
  label: 'Obsidian',
  description: 'Noir profond, signature Shift-K.',
  category: 'standard',
  availability: { kind: 'universal' },
  cssVars: vars({
    'bg-primary': '#0A0A0A',
    'bg-elevated': '#141414',
    'bg-hover': '#161616',
    'bg-modal': 'rgba(10,10,10,0.95)',
    'border-subtle': '#1A1A1A',
    'border-divider': '#191919',
    'text-primary': '#F5F5F5',
    'text-secondary': '#9A9A9A',
    'text-muted': '#666666',
    'text-disabled': '#444444',
    'accent': '#FFFFFF',
    'accent-text': '#0A0A0A',
    'shadow-overlay': '0 8px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
  }),
};

// --- 2. Carbon (warm dark, universal) ---------------------------------

const carbon: Theme = {
  id: 'carbon',
  label: 'Carbon',
  description: 'Dark chaleureux, accents ivoire.',
  category: 'standard',
  availability: { kind: 'universal' },
  cssVars: vars({
    'bg-primary': '#13141A',
    'bg-elevated': '#1B1D24',
    'bg-hover': '#232530',
    'bg-modal': 'rgba(19,20,26,0.95)',
    'border-subtle': '#252830',
    'border-divider': '#1F2128',
    'text-primary': '#F4ECD8',
    'text-secondary': '#A8A294',
    'text-muted': '#6B665C',
    'text-disabled': '#4A453E',
    'accent': '#F4ECD8',
    'accent-text': '#13141A',
    'shadow-overlay': '0 8px 40px rgba(50,30,0,0.4), 0 2px 8px rgba(0,0,0,0.5)',
  }),
};

// --- 3. Ivory (editorial light, universal) ----------------------------

const ivory: Theme = {
  id: 'ivory',
  label: 'Ivory',
  description: 'Mode clair éditorial, accents or sourd.',
  category: 'standard',
  availability: { kind: 'universal' },
  cssVars: vars({
    'bg-primary': '#FAF8F3',
    'bg-elevated': '#F2EFE8',
    'bg-hover': '#EAE6DC',
    'bg-modal': 'rgba(250,248,243,0.96)',
    'border-subtle': '#E0DBCF',
    'border-divider': '#D8D2C4',
    'text-primary': '#1A1A1A',
    'text-secondary': '#5C5650',
    'text-muted': '#8C857B',
    'text-disabled': '#B5AFA3',
    'accent': '#A28C5B',
    'accent-text': '#FAF8F3',
    'shadow-overlay': '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
  }),
};

// --- 4. Liquid Glass (macOS native vibrancy, Windows CSS fallback) ----
//
// Renders as "Liquid Glass" on macOS where AppKit's vibrancy gives a true
// refracting glass material, and as "Transparency" on Windows / Linux
// where the effect is a CSS backdrop-filter approximation. See ADR-030
// for the label rationale.

const liquidGlass: Theme = {
  id: 'liquid-glass',
  label: 'Liquid Glass', // overridden per-platform by `getThemeLabel()`
  description: 'Verre dépoli translucide.', // overridden per-platform
  category: 'translucent',
  availability: { kind: 'native-or-fallback', native: ['macos'], cssFallback: true },
  // Sprint 8d: 'hud' → 'fullscreen-ui'. Sprint 8d.2: 'fullscreen-ui'
  // → 'sidebar'. `sidebar` (NSVisualEffectMaterialSidebar) is the
  // thinnest stock material on macOS — same one Finder/Mail/Notes
  // use for their sidebars. Most translucent option that keeps text
  // legible. See ADR-030 + ADR-030 (Sprint 8d.2 revision).
  vibrancy: 'sidebar',
  cssVars: vars({
    'bg-primary': 'rgba(20,20,20,0.55)',
    'bg-elevated': 'rgba(20,20,20,0.55)',
    'bg-hover': 'rgba(255,255,255,0.06)',
    'bg-modal': 'rgba(0,0,0,0.5)',
    'border-subtle': 'rgba(255,255,255,0.12)',
    'border-divider': 'rgba(255,255,255,0.08)',
    'text-primary': '#F5F5F5',
    'text-secondary': 'rgba(245,245,245,0.7)',
    'text-muted': 'rgba(245,245,245,0.45)',
    'text-disabled': 'rgba(245,245,245,0.3)',
    'accent': '#FFFFFF',
    'accent-text': '#0A0A0A',
    'shadow-overlay': '0 8px 40px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)',
  }),
};

export const THEMES: Record<ThemeId, Theme> = {
  obsidian,
  carbon,
  ivory,
  'liquid-glass': liquidGlass,
};

export const THEME_ORDER: ThemeId[] = ['obsidian', 'carbon', 'ivory', 'liquid-glass'];

export const DEFAULT_THEME_ID: ThemeId = 'obsidian';

/**
 * Returns the platform-localised label for a theme. Currently only the
 * Liquid Glass card varies — "Liquid Glass" on macOS where vibrancy
 * is the real thing, "Transparency" on Windows / Linux where the CSS
 * fallback is honest about what it is. See ADR-030.
 */
export function getThemeLabel(theme: Theme, platform: Platform): string {
  if (theme.id === 'liquid-glass') {
    return platform === 'macos' ? 'Liquid Glass' : 'Transparency';
  }
  return theme.label;
}

export function getThemeDescription(theme: Theme, platform: Platform): string {
  if (theme.id === 'liquid-glass') {
    return platform === 'macos'
      ? 'Vibrancy native macOS, profondeur translucide.'
      : 'Verre dépoli translucide. Approximation CSS.';
  }
  return theme.description;
}

/**
 * Detect whether a theme can run on the current platform with its native
 * material/vibrancy effects.
 */
export function checkAvailability(
  theme: Theme,
  platform: Platform,
  _osRelease: string,
): { available: boolean; usesFallback: boolean; reason?: string } {
  if (theme.availability.kind === 'universal') {
    return { available: true, usesFallback: false };
  }
  const { native, cssFallback } = theme.availability;
  const isNative = native.includes(platform);
  if (isNative) {
    return { available: true, usesFallback: false };
  }
  if (cssFallback) {
    return {
      available: true,
      usesFallback: true,
      reason: `Effet natif disponible sur ${native.join(', ')}. Fallback CSS utilisé sur cette plateforme.`,
    };
  }
  return {
    available: false,
    usesFallback: false,
    reason: `Disponible uniquement sur ${native.join(', ')}.`,
  };
}

/**
 * Parses `os.release()` strings like "10.0.22631" and compares against a
 * minimum like "10.0.22000". Returns true if current ≥ min. Kept for
 * future re-introduction of Mica or other Win-build-gated effects.
 */
export function isWindowsAtLeast(currentRelease: string, minRelease: string): boolean {
  const cur = currentRelease.split('.').map((n) => parseInt(n, 10) || 0);
  const min = minRelease.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(cur.length, min.length); i++) {
    const c = cur[i] ?? 0;
    const m = min[i] ?? 0;
    if (c > m) return true;
    if (c < m) return false;
  }
  return true;
}
