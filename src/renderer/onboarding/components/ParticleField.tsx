import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export type ParticleFieldPhase = 'burst' | 'idle' | 'implode';

interface Particle {
  id: number;
  x: number;            // final scattered position
  y: number;
  r: number;            // 0.5 → 1.5 (= 1 → 3 px diameter)
  burstDelay: number;   // 0 → 0.4 s, organic stagger
  idleAmpX: number;     // 2 → 7 px breath amplitude
  idleAmpY: number;
  idleDelay: number;    // 0 → 2 s phase offset
  idleDuration: number; // 5 → 11 s cycle
  opacity: number;      // 0.4 → 1, varied for depth
}

const PARTICLE_COUNT = 140;
const BURST_DURATION_S = 1.5;
const BURST_DELAY_MAX_S = 0.4;
const IMPLODE_DURATION_S = 0.8;

function rng(seed: number) {
  // Deterministic small PRNG — same seed gives the same point cloud, so
  // hot-reload during dev doesn't shuffle the layout under the user.
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function generateParticles(count: number, w: number, h: number): Particle[] {
  const random = rng(1042);
  const cx = w / 2;
  const cy = h / 2;
  const halfW = w * 0.5;
  const halfH = h * 0.5;
  const out: Particle[] = [];
  let id = 0;
  let attempts = 0;
  while (out.length < count && attempts < count * 4) {
    attempts++;
    const x = random() * w;
    const y = random() * h;
    // Reject points outside a soft ellipse so the cloud feels organic
    // (denser centre, fewer particles at the corners) without being
    // perfectly geometric.
    const nx = (x - cx) / halfW;
    const ny = (y - cy) / halfH;
    if (nx * nx + ny * ny > 0.95) continue;
    out.push({
      id: id++,
      x,
      y,
      r: 0.5 + random() * 1.0,
      burstDelay: random() * BURST_DELAY_MAX_S,
      idleAmpX: 2 + random() * 5,
      idleAmpY: 2 + random() * 5,
      idleDelay: random() * 2,
      idleDuration: 5 + random() * 6,
      opacity: 0.35 + random() * 0.6,
    });
  }
  return out;
}

interface Props {
  phase: ParticleFieldPhase;
}

/**
 * Touch-Designer-flavoured point cloud — 140 tiny white circles spread
 * across the screen. Three phases:
 *
 *  • `burst`   particles fade in from the screen centre to their final
 *              scattered positions over ~1.5 s with a 0–0.4 s organic
 *              stagger. Once complete, the parent flips to `idle`.
 *
 *  • `idle`    each particle drifts ±2–7 px around its anchor on a
 *              5–11 s cycle with an individual phase offset, so the
 *              field breathes without ever syncing into a wave. Strong
 *              ease-in-out keeps the motion organic.
 *
 *  • `implode` all particles converge back to the centre with their
 *              opacity going to zero over 0.8 s. Used when the user
 *              clicks "Lancer Shift-K" — the dissolution gestures the
 *              transition to the overlay.
 *
 * The cloud is rendered in a single SVG to keep the compositor cost
 * low. Particle positions are seeded so HMR doesn't reshuffle the
 * layout mid-iteration.
 */
export function ParticleField({ phase }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 980, h: 680 });

  // Measure the wrapper on mount + resize so the cloud spans whatever
  // the surrounding container actually is.
  useEffect(() => {
    function measure() {
      if (wrapperRef.current) {
        setSize({
          w: wrapperRef.current.clientWidth,
          h: wrapperRef.current.clientHeight,
        });
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const particles = useMemo(
    () => generateParticles(PARTICLE_COUNT, size.w, size.h),
    [size.w, size.h],
  );
  const cx = size.w / 2;
  const cy = size.h / 2;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, display: 'block' }}
        aria-hidden="true"
      >
        {particles.map((p) => {
          const animate =
            phase === 'burst'
              ? { cx: p.x, cy: p.y, opacity: p.opacity }
              : phase === 'idle'
                ? {
                    cx: [p.x - p.idleAmpX, p.x + p.idleAmpX, p.x - p.idleAmpX],
                    cy: [p.y + p.idleAmpY, p.y - p.idleAmpY, p.y + p.idleAmpY],
                    opacity: p.opacity,
                  }
                : { cx, cy, opacity: 0 };

          const transition =
            phase === 'burst'
              ? {
                  duration: BURST_DURATION_S,
                  delay: p.burstDelay,
                  ease: [0.16, 1, 0.3, 1] as const,
                }
              : phase === 'idle'
                ? {
                    duration: p.idleDuration,
                    delay: p.idleDelay,
                    ease: 'easeInOut' as const,
                    repeat: Infinity,
                  }
                : {
                    duration: IMPLODE_DURATION_S,
                    ease: [0.7, 0, 0.84, 0] as const,
                  };

          return (
            <motion.circle
              key={p.id}
              fill="#FFFFFF"
              r={p.r}
              initial={{ cx, cy, opacity: 0 }}
              animate={animate}
              transition={transition}
            />
          );
        })}
      </svg>
    </div>
  );
}

export const PARTICLE_FIELD_BURST_MS =
  (BURST_DURATION_S + BURST_DELAY_MAX_S) * 1000;
export const PARTICLE_FIELD_IMPLODE_MS = IMPLODE_DURATION_S * 1000;
