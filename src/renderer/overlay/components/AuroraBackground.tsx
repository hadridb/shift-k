import React, { useEffect } from 'react';

interface Props {
  colors: string[];
  durationSeconds: number;
}

/**
 * Animated gradient backdrop for the Aurora theme. Mounted conditionally
 * by OverlayApp when the active theme exposes `animatedBackground`.
 *
 * Implementation: pure CSS animation against the `@keyframes aurora-shift`
 * declared in globals.css. Tried framer-motion in Sprint 7.1 — turns out
 * the `backgroundPosition` keyframe interpolation didn't trigger
 * consistently on first mount, so we're back to plain CSS which is the
 * most reliable path now that globals.css is unconditionally loaded by
 * every renderer entry point.
 *
 * border-radius + overflow keep the gradient clipped to the rounded
 * overlay shape — prevents the corner artefacts reported in Sprint 7.5.
 */
export function AuroraBackground({ colors, durationSeconds }: Props) {
  const [c1, c2, c3] = colors;

  useEffect(() => {
    console.log('[aurora] mounted', { colors, durationSeconds });
  }, [colors, durationSeconds]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `linear-gradient(135deg, ${c1 ?? '#1A1530'}, ${c2 ?? '#0A1428'}, ${c3 ?? '#15203A'})`,
        backgroundSize: '400% 400%',
        animation: `aurora-shift ${durationSeconds}s ease-in-out infinite`,
        borderRadius: 14,
        overflow: 'hidden',
        willChange: 'background-position',
        transform: 'translateZ(0)', // GPU compositing
      }}
    />
  );
}
