import { describe, it, expect } from 'vitest';
import { extractAudioMetadata, type AudioMetadata } from './audio-metadata';

/**
 * Sprint 8c (ADR-036) — interface stub locked. These tests freeze the
 * contract so Sprint 16's music-metadata integration cannot silently
 * break the signature.
 */
describe('extractAudioMetadata (stub)', () => {
  it('returns an empty object for any path (stub behavior)', () => {
    expect(extractAudioMetadata('/Downloads/anything.mp3')).toEqual({});
  });

  it('returns an empty object regardless of file extension', () => {
    expect(extractAudioMetadata('/x.flac')).toEqual({});
    expect(extractAudioMetadata('/x.wav')).toEqual({});
    expect(extractAudioMetadata('/x.unknown')).toEqual({});
  });

  it('returns an empty object for an empty path (no crash)', () => {
    expect(extractAudioMetadata('')).toEqual({});
  });

  it('returns a value assignable to AudioMetadata', () => {
    // Compile-time + runtime check: the stub return type satisfies AudioMetadata
    const result: AudioMetadata = extractAudioMetadata('/anything.mp3');
    expect(typeof result).toBe('object');
  });

  it('AudioMetadata fields are all optional (Sprint 16 will populate)', () => {
    // If the type ever flips a field to required, this assignment fails to compile.
    const meta: AudioMetadata = {};
    expect(meta).toEqual({});
  });
});
