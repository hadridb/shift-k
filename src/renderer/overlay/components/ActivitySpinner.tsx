import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SIZE = 16;
const CENTER = SIZE / 2;
const PARTICLE_COUNT = 6;
const PARTICLE_RADIUS = 14; // how far particles travel before fading
const PARTICLE_DURATION_S = 0.55;
const ACCENT = '#9090E0';

// Precompute particle target offsets — evenly distributed around the circle.
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2 - Math.PI / 2;
  return {
    id: i,
    dx: Math.cos(angle) * PARTICLE_RADIUS,
    dy: Math.sin(angle) * PARTICLE_RADIUS,
  };
});

interface Props {
  /** When true, the spinner dissolves into a particle burst. */
  dispersing: boolean;
}

/**
 * Activity-toast leading glyph: a thin rotating arc while the toast is
 * visible, then a quick particle burst (6 motes radiating out + fading)
 * during the toast's fade-out window.
 */
export function ActivitySpinner({ dispersing }: Props) {
  return (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <AnimatePresence>
        {!dispersing && (
          <motion.svg
            key="spinner"
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{
              rotate: { duration: 1.1, ease: 'linear', repeat: Infinity },
              opacity: { duration: 0.15 },
            }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <circle
              cx={CENTER}
              cy={CENTER}
              r={6}
              fill="none"
              stroke={ACCENT}
              strokeOpacity={0.25}
              strokeWidth={1.5}
            />
            <path
              d={`M ${CENTER} ${CENTER - 6} A 6 6 0 0 1 ${CENTER + 6} ${CENTER}`}
              fill="none"
              stroke={ACCENT}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </motion.svg>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dispersing && (
          <div
            key="particles"
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            {PARTICLES.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.dx, y: p.dy, opacity: 0, scale: 0.3 }}
                transition={{ duration: PARTICLE_DURATION_S, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: 'absolute',
                  left: CENTER - 1.5,
                  top: CENTER - 1.5,
                  width: 3,
                  height: 3,
                  borderRadius: 999,
                  background: ACCENT,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
