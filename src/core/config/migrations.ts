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
