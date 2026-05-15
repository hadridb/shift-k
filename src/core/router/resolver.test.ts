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
});
