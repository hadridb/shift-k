import { describe, it, expect } from 'vitest';
import path from 'path';
import { resolveDestination } from './resolver';
import { defaultConfig } from '../config/schema';
import type { AppConfig } from '@shared/types';

const FIXED_DATE = new Date('2026-05-15');

const baseConfig: AppConfig = {
  ...defaultConfig,
  root: 'E:\\Projects',
  downloadsPath: 'C:\\Users\\Test\\Downloads',
  activeClient: 'YSL - PURESHOTS',
  activeStage: 'out',
  routingEnabled: true,
};

describe('resolveDestination', () => {
  it('returns null when no active client', () => {
    const cfg = { ...baseConfig, activeClient: null };
    expect(resolveDestination('Gen-4_clip.mp4', cfg, FIXED_DATE)).toBeNull();
  });

  it('returns null when routing is disabled', () => {
    const cfg = { ...baseConfig, routingEnabled: false };
    expect(resolveDestination('Gen-4_clip.mp4', cfg, FIXED_DATE)).toBeNull();
  });

  it('returns null for unrecognised platform', () => {
    expect(resolveDestination('random_file.mp4', baseConfig, FIXED_DATE)).toBeNull();
  });

  it('returns null for ignored extensions', () => {
    expect(resolveDestination('project.drp', baseConfig, FIXED_DATE)).toBeNull();
    expect(resolveDestination('project.dra', baseConfig, FIXED_DATE)).toBeNull();
  });

  it('returns null for browser temp files', () => {
    expect(resolveDestination('Gen-4_clip.mp4.crdownload', baseConfig, FIXED_DATE)).toBeNull();
    expect(resolveDestination('kling_clip.part', baseConfig, FIXED_DATE)).toBeNull();
  });

  it('routes runway mp4 to active stage (out)', () => {
    const result = resolveDestination('Gen-4_scene.mp4', baseConfig, FIXED_DATE);
    expect(result).not.toBeNull();
    expect(result!.platform).toBe('runway');
    expect(result!.stageKey).toBe('out');
    expect(result!.stageFolderName).toBe('03_Outputs');
    expect(result!.destDir).toBe(
      path.join('E:\\Projects', 'YSL - PURESHOTS', '03_Outputs', 'J2026-05-15'),
    );
  });

  it('routes kling video to img when activeStage is img', () => {
    const cfg = { ...baseConfig, activeStage: 'img' as const };
    const result = resolveDestination('Kling_render.mp4', cfg, FIXED_DATE);
    expect(result!.stageKey).toBe('img');
    expect(result!.stageFolderName).toBe('02_IMG Inits');
  });

  it('routes project files to src regardless of activeStage', () => {
    const cfg = { ...baseConfig, activeStage: 'ost' as const };
    const result = resolveDestination('Gen-4_comp.psd', cfg, FIXED_DATE);
    expect(result!.stageKey).toBe('src');
    expect(result!.stageFolderName).toBe('01_SRC Inits');
  });

  it('adds platform subfolder when groupByPlatform is true', () => {
    const cfg: AppConfig = {
      ...baseConfig,
      preferences: { ...baseConfig.preferences, groupByPlatform: true },
    };
    const result = resolveDestination('Gen-4_scene.mp4', cfg, FIXED_DATE);
    expect(result!.destDir).toBe(
      path.join('E:\\Projects', 'YSL - PURESHOTS', '03_Outputs', 'J2026-05-15', 'runway'),
    );
  });

  it('routes higgsfield HF_ pattern', () => {
    const result = resolveDestination('HF_beauty_shot.mp4', baseConfig, FIXED_DATE);
    expect(result!.platform).toBe('higgsfield');
  });

  it('routes midjourney MJ_ pattern', () => {
    const result = resolveDestination('MJ_luxury_01.png', baseConfig, FIXED_DATE);
    expect(result!.platform).toBe('midjourney');
  });

  it('routes topaz upscale pattern', () => {
    const result = resolveDestination('clip_upscale_4x.mp4', baseConfig, FIXED_DATE);
    expect(result!.platform).toBe('topaz');
  });

  it('uses custom stage folder names', () => {
    const cfg: AppConfig = {
      ...baseConfig,
      stages: { ...baseConfig.stages, out: 'OUTPUTS' },
    };
    const result = resolveDestination('Gen-4_clip.mp4', cfg, FIXED_DATE);
    expect(result!.stageFolderName).toBe('OUTPUTS');
  });

  it('uses custom daily folder format', () => {
    const cfg: AppConfig = {
      ...baseConfig,
      preferences: { ...baseConfig.preferences, dailyFolderFormat: 'D{yyyy-MM-dd}' },
    };
    const result = resolveDestination('Gen-4_clip.mp4', cfg, FIXED_DATE);
    expect(result!.destDir).toContain('D2026-05-15');
  });

  // dailyFoldersEnabled toggle × format with/without {stage}

  it('routes to stage root when dailyFoldersEnabled is false (simple format)', () => {
    const cfg: AppConfig = {
      ...baseConfig,
      preferences: { ...baseConfig.preferences, dailyFoldersEnabled: false },
    };
    const result = resolveDestination('Gen-4_scene.mp4', cfg, FIXED_DATE);
    expect(result!.destDir).toBe(
      path.join('E:\\Projects', 'YSL - PURESHOTS', '03_Outputs'),
    );
  });

  it('routes to stage root when dailyFoldersEnabled is false (even if format has {stage})', () => {
    const cfg: AppConfig = {
      ...baseConfig,
      preferences: {
        ...baseConfig.preferences,
        dailyFoldersEnabled: false,
        dailyFolderFormat: '{stage} J{yyyy-MM-dd}',
      },
    };
    const result = resolveDestination('Gen-4_scene.mp4', cfg, FIXED_DATE);
    expect(result!.destDir).toBe(
      path.join('E:\\Projects', 'YSL - PURESHOTS', '03_Outputs'),
    );
  });

  it('substitutes {stage} placeholder in daily folder name', () => {
    const cfg: AppConfig = {
      ...baseConfig,
      preferences: {
        ...baseConfig.preferences,
        dailyFoldersEnabled: true,
        dailyFolderFormat: '{stage} J{yyyy-MM-dd}',
      },
    };
    const result = resolveDestination('Gen-4_scene.mp4', cfg, FIXED_DATE);
    expect(result!.destDir).toBe(
      path.join('E:\\Projects', 'YSL - PURESHOTS', '03_Outputs', '03_Outputs J2026-05-15'),
    );
  });

  it('substitutes {stage} with hyphen format', () => {
    const cfg: AppConfig = {
      ...baseConfig,
      preferences: {
        ...baseConfig.preferences,
        dailyFoldersEnabled: true,
        dailyFolderFormat: '{stage}-{yyyy-MM-dd}',
      },
    };
    const result = resolveDestination('Gen-4_scene.mp4', cfg, FIXED_DATE);
    expect(result!.destDir).toBe(
      path.join('E:\\Projects', 'YSL - PURESHOTS', '03_Outputs', '03_Outputs-2026-05-15'),
    );
  });

  // Audio routing + per-platform stage map (ADR-024)

  it('routes Suno mp3 to OST regardless of active stage', () => {
    const cfg = { ...baseConfig, activeStage: 'out' as const };
    const result = resolveDestination('Suno_track_01.mp3', cfg, FIXED_DATE);
    expect(result!.platform).toBe('suno');
    expect(result!.stageKey).toBe('ost');
    expect(result!.stageFolderName).toBe('04_OST');
  });

  it('routes ElevenLabs wav to OST', () => {
    const result = resolveDestination('ElevenLabs_voice.wav', baseConfig, FIXED_DATE);
    expect(result!.platform).toBe('elevenlabs');
    expect(result!.stageKey).toBe('ost');
  });

  it('routes Splice loop via _splice_ infix pattern', () => {
    const result = resolveDestination('drums_splice_kit_03.wav', baseConfig, FIXED_DATE);
    expect(result!.platform).toBe('splice');
    expect(result!.stageKey).toBe('ost');
  });

  it('routes stable-audio file to OST', () => {
    const result = resolveDestination('stable-audio_pad.flac', baseConfig, FIXED_DATE);
    expect(result!.platform).toBe('stable_audio');
    expect(result!.stageKey).toBe('ost');
  });

  it('returns null for an audio file with no platform match (routeAllAudio off by default)', () => {
    // Pure orphan audio — no pattern, no toggle yet (routeAllAudio added in next commit)
    expect(resolveDestination('my_personal_song.mp3', baseConfig, FIXED_DATE)).toBeNull();
  });

  it('returns null when extension is audio but not in audioExtensions list', () => {
    // .opus is in default audioExtensions, simulate a config that removed it
    const cfg: AppConfig = {
      ...baseConfig,
      audioExtensions: ['.mp3', '.wav'], // .opus excluded
    };
    // file matches suno pattern, but extension isn't recognized as audio/video/image/project
    expect(resolveDestination('Suno_track.opus', cfg, FIXED_DATE)).toBeNull();
  });

  it('regression: Gen-4 mp4 still routes to active stage (video unaffected by audio map)', () => {
    const cfg = { ...baseConfig, activeStage: 'img' as const };
    const result = resolveDestination('Gen-4_scene.mp4', cfg, FIXED_DATE);
    expect(result!.platform).toBe('runway');
    expect(result!.stageKey).toBe('img'); // active stage wins for non-overridden platforms
  });

  it('audio file matching a non-audio platform stays on active stage', () => {
    // Edge case: a .mp3 named "Gen-4_voiceover.mp3" matches runway first.
    // Runway is not in the override map → audio extension does NOT force OST here.
    const result = resolveDestination('Gen-4_voiceover.mp3', baseConfig, FIXED_DATE);
    expect(result!.platform).toBe('runway');
    expect(result!.stageKey).toBe('out'); // active stage, not 'ost'
  });
});
