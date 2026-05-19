import React from 'react';

interface Props {
  colors: string[];
  durationSeconds: number;
}

/**
 * Animated gradient backdrop for the Aurora theme. Mounted conditionally
 * by OverlayApp when the active theme exposes `animatedBackground`.
 *
 * Pure CSS animation via the `aurora-shift` keyframes declared in
 * themes.css. The colour stops are passed as inline CSS variables so
 * the same component instance handles future palette tweaks without a
 * stylesheet change.
 */
export function AuroraBackground({ colors, durationSeconds }: Props) {
  const [c1, c2, c3] = colors;
  const style: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    background: `linear-gradient(135deg, ${c1 ?? '#1A1530'}, ${c2 ?? '#0A1428'}, ${c3 ?? '#15203A'})`,
    backgroundSize: '400% 400%',
    animation: `aurora-shift ${durationSeconds}s ease-in-out infinite`,
    // Force a compositing layer so the animation runs on the GPU.
    willChange: 'background-position',
    transform: 'translateZ(0)',
  };
  return <div aria-hidden="true" style={style} />;
}
