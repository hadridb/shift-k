// Pure migration helpers — no electron-store dependency so they can run
// in Vitest without an Electron context.

/**
 * Platforms introduced after v0.1.0 that must be merged into existing
 * user configs without overwriting their custom additions. Add new keys
 * here when shipping new platform support to back-fill old installs.
 */
export const POST_V1_PLATFORM_PATTERNS: Readonly<Record<string, string[]>> = {
  suno: ['suno', 'Suno', 'SUNO_'],
  elevenlabs: ['elevenlabs', 'ElevenLabs', 'eleven_', 'EL_'],
  // stable_audio before udio: 'udio' is a substring of 'stable-audio'
  stable_audio: ['stable-audio', 'stable_audio', 'StableAudio'],
  udio: ['udio', 'Udio'],
  aiva: ['aiva', 'AIVA'],
  mubert: ['mubert', 'Mubert'],
  soundraw: ['soundraw', 'Soundraw'],
  splice: ['splice', 'Splice', '_splice_'],
  loopcloud: ['loopcloud', 'Loopcloud', '_LC_'],
  cymatics: ['cymatics', 'Cymatics'],
};

/**
 * Returns a new platforms map with every key from `additions` added unless
 * it already exists in `existing`. User-customized values on existing keys
 * are preserved untouched.
 */
export function mergeNewPlatformPatterns(
  existing: Record<string, string[]>,
  additions: Record<string, string[]>,
): Record<string, string[]> {
  const merged: Record<string, string[]> = { ...existing };
  for (const [key, patterns] of Object.entries(additions)) {
    if (!(key in merged)) merged[key] = patterns;
  }
  return merged;
}

/**
 * Sprint 8c (ADR-036) — one-shot migration for the routeAllAudio default flip.
 *
 * Before Sprint 8c: `routeAllAudio` defaulted to false (ADR-024). Configs
 * persisted under that regime carry `routeAllAudio: false` even though the
 * user never explicitly chose it (Zod defaults get serialized).
 *
 * After Sprint 8c: default is true. To bring existing installs in line —
 * which is the whole point of the sprint, "Suno works out of the box" — we
 * force-flip `routeAllAudio` to true once, then stamp
 * `audioRoutingDefaultMigrated: true` so the migration never re-runs.
 *
 * A user who explicitly opts out via the Settings toggle after the migration
 * has run will keep their `routeAllAudio: false` choice — the migration
 * checks the marker, not the current value.
 *
 * Pure function: takes a partial Preferences shape (because we call it on
 * the raw persisted JSON before Zod parse), returns a tuple of the new
 * shape and a `changed` flag so the caller knows whether to persist.
 */
export function applyAudioRoutingDefaultMigration<
  T extends { routeAllAudio?: boolean; audioRoutingDefaultMigrated?: boolean },
>(
  prefs: T,
): { prefs: T & { routeAllAudio: boolean; audioRoutingDefaultMigrated: boolean }; changed: boolean } {
  if (prefs.audioRoutingDefaultMigrated === true) {
    // Marker already set: respect the persisted choice. We cast to satisfy the
    // wider return type — if the marker was set by a previous run, both fields
    // were populated then.
    return {
      prefs: prefs as T & { routeAllAudio: boolean; audioRoutingDefaultMigrated: boolean },
      changed: false,
    };
  }
  return {
    prefs: { ...prefs, routeAllAudio: true, audioRoutingDefaultMigrated: true },
    changed: true,
  };
}
