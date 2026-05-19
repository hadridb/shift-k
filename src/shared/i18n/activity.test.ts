import { describe, it, expect } from 'vitest';
import { formatActivityLine, classifyExtension } from './activity';

describe('formatActivityLine', () => {
  it('video singular: "1 vidéo envoyée vers 03_Outputs"', () => {
    expect(formatActivityLine(1, 'video', '03_Outputs')).toBe(
      '1 vidéo envoyée vers 03_Outputs',
    );
  });

  it('video plural: "2 vidéos envoyées vers 03_Outputs"', () => {
    expect(formatActivityLine(2, 'video', '03_Outputs')).toBe(
      '2 vidéos envoyées vers 03_Outputs',
    );
  });

  it('image singular: "1 image envoyée vers 02_IMG Inits"', () => {
    expect(formatActivityLine(1, 'image', '02_IMG Inits')).toBe(
      '1 image envoyée vers 02_IMG Inits',
    );
  });

  it('image plural: "3 images envoyées vers 02_IMG Inits"', () => {
    expect(formatActivityLine(3, 'image', '02_IMG Inits')).toBe(
      '3 images envoyées vers 02_IMG Inits',
    );
  });

  it('audio singular: "1 fichier audio envoyé vers 04_OST"', () => {
    expect(formatActivityLine(1, 'audio', '04_OST')).toBe(
      '1 fichier audio envoyé vers 04_OST',
    );
  });

  it('audio plural: "fichiers audio" with audio invariable, "envoyés" masc plur', () => {
    expect(formatActivityLine(4, 'audio', '04_OST')).toBe(
      '4 fichiers audio envoyés vers 04_OST',
    );
  });

  it('project singular: "1 fichier projet envoyé vers 01_SRC Inits"', () => {
    expect(formatActivityLine(1, 'project', '01_SRC Inits')).toBe(
      '1 fichier projet envoyé vers 01_SRC Inits',
    );
  });

  it('project plural: "fichiers projet" with projet invariable, "envoyés" masc plur', () => {
    expect(formatActivityLine(7, 'project', '01_SRC Inits')).toBe(
      '7 fichiers projet envoyés vers 01_SRC Inits',
    );
  });

  it('interpolates a custom stage name verbatim', () => {
    expect(formatActivityLine(1, 'video', 'Outputs HD')).toBe(
      '1 vidéo envoyée vers Outputs HD',
    );
  });

  it('handles large counts (still plural)', () => {
    expect(formatActivityLine(47, 'video', '03_Outputs')).toBe(
      '47 vidéos envoyées vers 03_Outputs',
    );
  });
});

describe('classifyExtension', () => {
  const cfg = {
    audioExtensions: ['.mp3', '.wav'],
    videoExtensions: ['.mp4', '.mov'],
    imageExtensions: ['.png', '.jpg'],
    projectExtensions: ['.psd', '.aep'],
  };

  it('buckets each known extension into its type', () => {
    expect(classifyExtension('Suno_track.mp3', cfg)).toBe('audio');
    expect(classifyExtension('Gen-4_clip.mp4', cfg)).toBe('video');
    expect(classifyExtension('MJ_image.png', cfg)).toBe('image');
    expect(classifyExtension('comp.psd', cfg)).toBe('project');
  });

  it('returns null for unknown extensions', () => {
    expect(classifyExtension('readme.txt', cfg)).toBeNull();
    expect(classifyExtension('no-extension', cfg)).toBeNull();
  });

  it('is case-insensitive on the extension', () => {
    expect(classifyExtension('CLIP.MP4', cfg)).toBe('video');
  });

  it('project wins over other lists when an extension is in both', () => {
    const overlapped = { ...cfg, projectExtensions: ['.png'], imageExtensions: ['.png'] };
    expect(classifyExtension('weird.png', overlapped)).toBe('project');
  });
});
