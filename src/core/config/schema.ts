import { z } from 'zod';
import type { AppConfig } from '@shared/types';

const StageSchema = z.enum(['src', 'img', 'out', 'ost', 'liv']);

export const SlotKeySchema = z.enum(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']);

export const AppConfigSchema = z.object({
  version: z.string().default('2.0.0'),
  root: z.string().default(''),
  downloadsPath: z.string().default(''),
  activeClient: z.string().nullable().default(null),
  activeStage: StageSchema.default('out'),
  stages: z
    .object({
      src: z.string().default('01_SRC Inits'),
      img: z.string().default('02_IMG Inits'),
      out: z.string().default('03_Outputs'),
      ost: z.string().default('04_OST'),
      liv: z.string().default('05_Renders'),
    })
    .default({
      src: '01_SRC Inits',
      img: '02_IMG Inits',
      out: '03_Outputs',
      ost: '04_OST',
      liv: '05_Renders',
    }),
  platforms: z
    .record(z.string(), z.array(z.string()))
    .default({
      runway: ['Gen-3', 'Gen-4', 'runway', 'Runway', 'RunwayML'],
      kling: ['kling', 'Kling', 'KLING'],
      luma: ['Luma', 'luma', 'Dream_Machine', 'DreamMachine'],
      higgsfield: ['higgsfield', 'Higgsfield', 'HF_'],
      sora: ['sora', 'Sora', 'SORA'],
      veo: ['veo', 'Veo', 'VEO'],
      midjourney: ['midjourney', 'MJ_', '_mj_', 'mj-'],
      krea: ['krea', 'Krea', 'KREA'],
      topaz: ['topaz', 'Topaz', '_enhance_', '_upscale_'],
      photoshop: ['.psd'],
      premiere: ['.prproj'],
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
    }),
  videoExtensions: z
    .array(z.string())
    .default(['.mp4', '.mov', '.webm', '.mkv', '.avi']),
  imageExtensions: z
    .array(z.string())
    .default(['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.exr']),
  audioExtensions: z
    .array(z.string())
    .default(['.mp3', '.wav', '.flac', '.aac', '.m4a', '.ogg', '.opus', '.aiff']),
  projectExtensions: z.array(z.string()).default(['.psd', '.ai', '.prproj', '.aep']),
  ignoreExtensions: z.array(z.string()).default(['.drp', '.dra']),
  slots: z
    .object({
      '1': z.string().nullable(),
      '2': z.string().nullable(),
      '3': z.string().nullable(),
      '4': z.string().nullable(),
      '5': z.string().nullable(),
      '6': z.string().nullable(),
      '7': z.string().nullable(),
      '8': z.string().nullable(),
      '9': z.string().nullable(),
      // Slot '0' added after v0.1.0: defaults to null so configs persisted
      // with only '1'–'9' migrate seamlessly on the next AppConfigSchema.parse().
      '0': z.string().nullable().default(null),
    })
    .default({
      '1': null,
      '2': null,
      '3': null,
      '4': null,
      '5': null,
      '6': null,
      '7': null,
      '8': null,
      '9': null,
      '0': null,
    }),
  routingEnabled: z.boolean().default(true),
  preferences: z
    .object({
      theme: z
        .enum(['obsidian', 'carbon', 'ivory', 'mica', 'liquid-glass', 'aurora'])
        .default('obsidian'),
      dailyFolderFormat: z.string().default('J{yyyy-MM-dd}'),
      dailyFoldersEnabled: z.boolean().default(true),
      lazyDailyFolders: z.boolean().default(true),
      groupByPlatform: z.boolean().default(false),
      routeAllAudio: z.boolean().default(false),
      logRetentionDays: z.number().int().positive().default(30),
      notifyOnRoute: z.boolean().default(true),
      confirmBeforeRescan: z.boolean().default(true),
      startOnLogin: z.boolean().default(true),
      overlay: z
        .object({ x: z.number().default(100), y: z.number().default(100) })
        .default({ x: 100, y: 100 }),
      openFoldersLast: z
        .object({
          src: z.boolean().default(true),
          img: z.boolean().default(false),
          out: z.boolean().default(false),
          ost: z.boolean().default(false),
          liv: z.boolean().default(false),
        })
        .default({ src: true, img: false, out: false, ost: false, liv: false }),
      openFoldersToday: z.boolean().default(true),
      settingsAccordionState: z
        .record(z.string(), z.boolean())
        .default({ audio: true, image: false, video: false, project: false }),
    })
    .default({
      theme: 'obsidian',
      dailyFolderFormat: 'J{yyyy-MM-dd}',
      dailyFoldersEnabled: true,
      lazyDailyFolders: true,
      groupByPlatform: false,
      routeAllAudio: false,
      logRetentionDays: 30,
      notifyOnRoute: true,
      confirmBeforeRescan: true,
      startOnLogin: true,
      overlay: { x: 100, y: 100 },
      openFoldersLast: { src: true, img: false, out: false, ost: false, liv: false },
      openFoldersToday: true,
      settingsAccordionState: { audio: true, image: false, video: false, project: false },
    }),
});

// Verify the inferred type matches AppConfig at compile time
type InferredConfig = z.infer<typeof AppConfigSchema>;
type _Check = InferredConfig extends AppConfig ? true : never;
const _check: _Check = true;
void _check;

export const defaultConfig: AppConfig = AppConfigSchema.parse({});
