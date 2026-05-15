import { describe, it, expect } from 'vitest';
import { AppConfigSchema, defaultConfig } from './schema';

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

  it('includes all 11 platforms with correct patterns', () => {
    const { platforms } = defaultConfig;
    expect(platforms['runway']).toContain('Gen-4');
    expect(platforms['higgsfield']).toContain('HF_');
    expect(platforms['midjourney']).toContain('MJ_');
    expect(platforms['topaz']).toContain('_enhance_');
    expect(Object.keys(platforms)).toHaveLength(11);
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
      slots: { '1': 'YSL - PURESHOTS', '2': null, '3': null, '4': null, '5': null, '6': null, '7': null, '8': null, '9': null },
    });
    expect(result.slots['1']).toBe('YSL - PURESHOTS');
    expect(result.slots['2']).toBeNull();
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
});
