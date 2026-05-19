import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  colors: string[];
  durationSeconds: number;
}

/**
 * Animated gradient backdrop for the Aurora theme. Mounted conditionally
 * by OverlayApp when the active theme exposes `animatedBackground`.
 *
 * The animation is driven by framer-motion rather than CSS keyframes —
 * the keyframes approach (themes.css `@keyframes aurora-shift`) was
 * fragile: a CSS rule that lives in a separately-imported stylesheet
 * sometimes failed to apply on the very first paint, and there's no
 * way to verify "animation is running" from JS. framer-motion's
 * `animate` prop runs through requestAnimationFrame deterministically.
 */
export function AuroraBackground({ colors, durationSeconds }: Props) {
  const [c1, c2, c3] = colors;

  useEffect(() => {
    console.log('[aurora] mounted', { colors, durationSeconds });
  }, [colors, durationSeconds]);

  return (
    <motion.div
      aria-hidden="true"
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{
        duration: durationSeconds,
        ease: 'easeInOut',
        repeat: Infinity,
      }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: `linear-gradient(135deg, ${c1 ?? '#1A1530'}, ${c2 ?? '#0A1428'}, ${c3 ?? '#15203A'})`,
        backgroundSize: '400% 400%',
        // Force a compositing layer so the animation runs on the GPU.
        willChange: 'background-position',
        transform: 'translateZ(0)',
      }}
    />
  );
}
