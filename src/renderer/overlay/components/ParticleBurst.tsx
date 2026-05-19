import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// Burst tuning — kept loose enough for organic variation, tight enough to
// stay readable. Each remount of the inner component (via key change)
// reseeds the randomness, so every trigger looks different.
const PARTICLE_MIN = 12;
const PARTICLE_MAX = 16;
const RADIUS_MIN = 14;
const RADIUS_MAX = 22;
const SIZE_MIN = 2;
const SIZE_MAX = 3;
const DURATION_S = 0.7;
const FLASH_SIZE_FROM = 7;
const FLASH_SIZE_TO = 12;
const FLASH_DURATION_S = 0.2;

// Strong ease-out — fast off the line then settles, the way a firework
// silhouette actually moves. cubic-bezier(0.16, 1, 0.3, 1).
const PARTICLE_EASE = [0.16, 1, 0.3, 1] as const;

interface Particle {
  id: number;
  size: number;
  dx: number;
  dy: number;
}

function generateParticles(): Particle[] {
  const count = PARTICLE_MIN + Math.floor(Math.random() * (PARTICLE_MAX - PARTICLE_MIN + 1));
  return Array.from({ length: count }, (_, id) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN);
    const size = SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN);
    return {
      id,
      size,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
    };
  });
}

/**
 * One burst instance — animation plays once on mount, then sits dormant.
 * Wrapped in a remount strategy by the parent (key prop on
 * <ParticleBurst trigger={n} />) so each new trigger value spawns a fresh
 * burst with re-randomised particle positions.
 */
function BurstInstance() {
  const particles = useMemo(generateParticles, []);

  return (
    <svg
      width={32}
      height={32}
      viewBox="-16 -16 32 32"
      style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* Central flash — short bloom signalling the moment of explosion */}
      <motion.circle
        cx={0}
        cy={0}
        fill="var(--accent)"
        initial={{ r: FLASH_SIZE_FROM / 2, opacity: 0.9 }}
        animate={{ r: FLASH_SIZE_TO / 2, opacity: 0 }}
        transition={{ duration: FLASH_DURATION_S, ease: PARTICLE_EASE }}
      />

      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={0}
          cy={0}
          r={p.size / 2}
          fill="var(--accent)"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: p.dx,
            y: p.dy,
            // 200 ms hold at full opacity, then fade across the rest. We
            // can express that as opacity keyframes + matching times array.
            opacity: [1, 1, 0],
            scale: 0.3,
          }}
          transition={{
            duration: DURATION_S,
            ease: PARTICLE_EASE,
            opacity: { duration: DURATION_S, times: [0, 0.286, 1] }, // 200 / 700 ≈ 0.286
          }}
        />
      ))}
    </svg>
  );
}

interface Props {
  /**
   * Change this to fire a new burst — the inner instance is remounted
   * with a fresh random seed. Pass 0 for "no burst yet" and increment
   * from there.
   */
  trigger: number;
}

export function ParticleBurst({ trigger }: Props) {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* 32×32 SVG container is positioned to centre on this 16×16 slot,
          so particles can overshoot the spinner footprint without clipping. */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: -8,
          width: 32,
          height: 32,
          pointerEvents: 'none',
        }}
      >
        {trigger > 0 && <BurstInstance key={trigger} />}
      </div>
    </div>
  );
}
