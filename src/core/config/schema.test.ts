import { describe, it, expect } from 'vitest';
import { AppConfigSchema, defaultConfig } from './schema';
import {
  mergeNewPlatformPatterns,
  POST_V1_PLATFORM_PATTERNS,
  applyAudioRoutingDefaultMigration,
} from './migrations';

describe('AppConfigSchema', () => {
  it('parses an empty object into full defaults', () => {
    const result = AppConfigSchema.parse({});
    expect(result.version).toBe('2.0.0');
    expect(result.activeClient).toBeNull();
    expect(result.activeStage).toBe('out');
    expect(result.routingEnabled).toBe(true);
    expect(result.stages.src).toBe('01_SRC Inits');
    expect(result.stages.out).toBe('03_Outputs');
    expect(result.slots['1']).toBeNull();
  });

  it('includes all 21 platforms (11 visual + 10 audio) with correct patterns', () => {
    const { platforms } = defaultConfig;
    expect(platforms['runway']).toContain('Gen-4');
    expect(platforms['higgsfield']).toContain('HF_');
    expect(platforms['midjourney']).toContain('MJ_');
    expect(platforms['topaz']).toContain('_enhance_');
    expect(platforms['suno']).toContain('Suno');
    expect(platforms['elevenlabs']).toContain('eleven_');
    expect(platforms['splice']).toContain('_splice_');
    expect(Object.keys(platforms)).toHaveLength(21);
  });

  it('audioExtensions defaults include common audio formats', () => {
    expect(defaultConfig.audioExtensions).toEqual(
      ['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.opus', '.aiff'],
    );
  });

  it('migration: V1 platforms missing audio entries get them back-filled', () => {
    const v1Platforms: Record<string, string[]> = {
      runway: ['Gen-4', 'my-custom-pattern'],
      kling: ['kling'],
      photoshop: ['.psd'],
    };
    const merged = mergeNewPlatformPatterns(v1Platforms, POST_V1_PLATFORM_PATTERNS);
    // Existing keys: untouched, including user custom pattern
    expect(merged['runway']).toEqual(['Gen-4', 'my-custom-pattern']);
    // New audio keys: present
    expect(merged['suno']).toEqual(['suno', 'Suno', 'SUNO_']);
    expect(merged['splice']).toEqual(['splice', 'Splice', '_splice_']);
    // No platforms dropped
    expect(merged['kling']).toEqual(['kling']);
    expect(merged['photoshop']).toEqual(['.psd']);
  });

  it('migration: never overwrites a user-customized platform entry', () => {
    const v1Platforms: Record<string, string[]> = {
      // user already added a custom 'suno' entry before upgrade (unlikely but possible)
      suno: ['my_suno_only'],
    };
    const merged = mergeNewPlatformPatterns(v1Platforms, POST_V1_PLATFORM_PATTERNS);
    expect(merged['suno']).toEqual(['my_suno_only']); // user wins
  });

  it('preserves user-supplied values', () => {
    const result = AppConfigSchema.parse({
      root: 'E:\\Projects',
      downloadsPath: 'C:\\Users\\Test\\Downloads',
      activeClient: 'Gucci - Campaign',
      activeStage: 'img',
      routingEnabled: false,
    });
    expect(result.root).toBe('E:\\Projects');
    expect(result.activeClient).toBe('Gucci - Campaign');
    expect(result.activeStage).toBe('img');
    expect(result.routingEnabled).toBe(false);
  });

  it('rejects invalid activeStage', () => {
    expect(() => AppConfigSchema.parse({ activeStage: 'invalid' })).toThrow();
  });

  it('rejects negative logRetentionDays', () => {
    expect(() =>
      AppConfigSchema.parse({ preferences: { logRetentionDays: -1 } }),
    ).toThrow();
  });

  it('accepts null slots and string slots', () => {
    const result = AppConfigSchema.parse({
      slots: { '1': 'YSL - PURESHOTS', '2': null, '3': null, '4': null, '5': null, '6': null, '7': null, '8': null, '9': null, '0': null },
    });
    expect(result.slots['1']).toBe('YSL - PURESHOTS');
    expect(result.slots['2']).toBeNull();
  });

  it('migration: V1 config with 9 slots (no "0" key) gets slot 0 back-filled to null', () => {
    // Simulate a config persisted before slot '0' existed — has '1'..'9' only.
    const result = AppConfigSchema.parse({
      slots: {
        '1': 'YSL - PURESHOTS',
        '2': 'Gucci - Campaign',
        '3': null,
        '4': null,
        '5': null,
        '6': null,
        '7': null,
        '8': null,
        '9': null,
        // '0' deliberately absent
      },
    });
    expect(result.slots['0']).toBeNull();
    expect(result.slots['1']).toBe('YSL - PURESHOTS');
    expect(result.slots['9']).toBeNull();
  });

  it('migration: completely empty config defaults all 10 slots to null', () => {
    const result = AppConfigSchema.parse({});
    expect(result.slots['0']).toBeNull();
    expect(result.slots['9']).toBeNull();
    expect(Object.keys(result.slots)).toHaveLength(10);
  });

  it('defaultConfig has correct ignore extensions', () => {
    expect(defaultConfig.ignoreExtensions).toContain('.drp');
    expect(defaultConfig.ignoreExtensions).toContain('.dra');
  });

  it('defaultConfig has correct project extensions', () => {
    expect(defaultConfig.projectExtensions).toContain('.psd');
    expect(defaultConfig.projectExtensions).toContain('.prproj');
    expect(defaultConfig.projectExtensions).toContain('.aep');
  });

  it('settingsAccordionState defaults: audio open, others closed', () => {
    expect(defaultConfig.preferences.settingsAccordionState).toEqual({
      audio: true,
      image: false,
      video: false,
      project: false,
    });
  });

  it('settingsAccordionState round-trips arbitrary keys (forward-compat)', () => {
    const parsed = AppConfigSchema.parse({
      preferences: {
        settingsAccordionState: {
          audio: false,
          image: true,
          video: true,
          project: false,
          // unknown future section — should be preserved as-is
          customSection: true,
        },
      },
    });
    expect(parsed.preferences.settingsAccordionState).toEqual({
      audio: false,
      image: true,
      video: true,
      project: false,
      customSection: true,
    });
  });

  it('preferences.theme defaults to "obsidian"', () => {
    expect(defaultConfig.preferences.theme).toBe('obsidian');
    const parsed = AppConfigSchema.parse({});
    expect(parsed.preferences.theme).toBe('obsidian');
  });

  it('preferences.theme accepts each of the 4 valid theme ids (Sprint 7.6)', () => {
    for (const id of ['obsidian', 'carbon', 'ivory', 'liquid-glass']) {
      const parsed = AppConfigSchema.parse({ preferences: { theme: id } });
      expect(parsed.preferences.theme).toBe(id);
    }
  });

  it('preferences.theme migration: legacy "mica" coerced to "obsidian"', () => {
    const parsed = AppConfigSchema.parse({ preferences: { theme: 'mica' } });
    expect(parsed.preferences.theme).toBe('obsidian');
  });

  it('preferences.theme migration: legacy "aurora" coerced to "obsidian"', () => {
    const parsed = AppConfigSchema.parse({ preferences: { theme: 'aurora' } });
    expect(parsed.preferences.theme).toBe('obsidian');
  });

  it('preferences.theme rejects unknown values', () => {
    expect(() =>
      AppConfigSchema.parse({ preferences: { theme: 'midnight-blue' } }),
    ).toThrow();
  });

  // Sprint 8c (ADR-036): audioFallbackStage configurable

  it('preferences.audioFallbackStage defaults to "ost" (preserves Sprint 5a behavior)', () => {
    expect(defaultConfig.preferences.audioFallbackStage).toBe('ost');
    const parsed = AppConfigSchema.parse({});
    expect(parsed.preferences.audioFallbackStage).toBe('ost');
  });

  it('preferences.audioFallbackStage accepts each of the 5 stage keys', () => {
    for (const stage of ['src', 'img', 'out', 'ost', 'liv'] as const) {
      const parsed = AppConfigSchema.parse({ preferences: { audioFallbackStage: stage } });
      expect(parsed.preferences.audioFallbackStage).toBe(stage);
    }
  });

  it('preferences.audioFallbackStage rejects unknown stage names', () => {
    expect(() =>
      AppConfigSchema.parse({ preferences: { audioFallbackStage: 'unknown' } }),
    ).toThrow();
  });

  it('migration: configs without audioFallbackStage get the default injected', () => {
    // Simulates an existing user config persisted before Sprint 8c.
    const persistedV1: unknown = {
      version: '2.0.0',
      preferences: { routeAllAudio: true /* no audioFallbackStage */ },
    };
    const parsed = AppConfigSchema.parse(persistedV1);
    expect(parsed.preferences.audioFallbackStage).toBe('ost');
    expect(parsed.preferences.routeAllAudio).toBe(true); // user value preserved
  });

  // Sprint 8c (ADR-036): routeAllAudio default flipped false → true.
  // Supersedes ADR-024 on the default. Opt-out via toggle remains.

  it('preferences.routeAllAudio defaults to true (ADR-036 supersedes ADR-024 default)', () => {
    expect(defaultConfig.preferences.routeAllAudio).toBe(true);
    const parsed = AppConfigSchema.parse({});
    expect(parsed.preferences.routeAllAudio).toBe(true);
  });

  it('preferences.audioRoutingDefaultMigrated defaults to false (marker for one-shot migration)', () => {
    expect(defaultConfig.preferences.audioRoutingDefaultMigrated).toBe(false);
  });

  // applyAudioRoutingDefaultMigration — pure migration function

  it('migration applyAudioRoutingDefault: flips routeAllAudio false → true on first run', () => {
    // Canonical case: an old config persisted before Sprint 8c with the
    // legacy default-false carried over.
    const persisted = { routeAllAudio: false };
    const result = applyAudioRoutingDefaultMigration(persisted);
    expect(result.changed).toBe(true);
    expect(result.prefs.routeAllAudio).toBe(true);
    expect(result.prefs.audioRoutingDefaultMigrated).toBe(true);
  });

  it('migration applyAudioRoutingDefault: no-op when marker is already true (respects user opt-out)', () => {
    // A user who toggled routeAllAudio off in Settings post-Sprint-8c — the
    // marker is set, the migration must NOT overwrite their choice.
    const persisted = { routeAllAudio: false, audioRoutingDefaultMigrated: true };
    const result = applyAudioRoutingDefaultMigration(persisted);
    expect(result.changed).toBe(false);
    expect(result.prefs.routeAllAudio).toBe(false); // user wins
  });

  it('migration applyAudioRoutingDefault: still stamps marker for brand-new configs', () => {
    // A fresh install where the user hasn't touched anything — routeAllAudio
    // is true from the new default, but the marker is still false (Zod default).
    // The migration is a no-op semantically, but it stamps the marker so the
    // next load skips the check entirely.
    const persisted = { routeAllAudio: true };
    const result = applyAudioRoutingDefaultMigration(persisted);
    expect(result.changed).toBe(true);
    expect(result.prefs.routeAllAudio).toBe(true);
    expect(result.prefs.audioRoutingDefaultMigrated).toBe(true);
  });

  it('migration applyAudioRoutingDefault: preserves unrelated preference keys', () => {
    const persisted = {
      routeAllAudio: false,
      audioFallbackStage: 'src' as const,
      groupByPlatform: true,
      logRetentionDays: 60,
    };
    const result = applyAudioRoutingDefaultMigration(persisted);
    expect(result.prefs.routeAllAudio).toBe(true);
    expect(result.prefs.audioFallbackStage).toBe('src');
    expect(result.prefs.groupByPlatform).toBe(true);
    expect(result.prefs.logRetentionDays).toBe(60);
  });
});
