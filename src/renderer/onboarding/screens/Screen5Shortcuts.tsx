import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE } from '../ScreenLayout';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Three keyboard "chord" rows that light up in sequence. Each row is a
 * small set of key chips with a caption underneath. The lighting timing
 * mirrors the brief: chord 1 at t=200ms, chord 2 at t=700ms, chord 3 at
 * t=1200ms — staggered enough to read each one individually.
 */
interface Chord {
  keys: string[];
  caption: string;
  delay: number;
}

const CHORDS: Chord[] = [
  {
    keys: ['Ctrl', 'Shift', 'K'],
    caption: 'Afficher / masquer l\'overlay',
    delay: 0.4,
  },
  {
    keys: ['Ctrl', 'Alt', '1..0'],
    caption: 'Switcher de client direct',
    delay: 0.9,
  },
  {
    keys: ['Shift', 'J', 'K', 'L'],
    caption: 'Navigation NLE — précédent / pause / suivant',
    delay: 1.4,
  },
];

function KeyChip({ label, lit }: { label: string; lit: boolean }) {
  return (
    <motion.span
      animate={{
        background: lit ? '#FFFFFF' : 'transparent',
        color: lit ? '#0A0A0A' : 'rgba(245,245,245,0.7)',
        borderColor: lit ? '#FFFFFF' : 'rgba(245,245,245,0.18)',
      }}
      transition={{ duration: 0.3, ease: SCREEN_EASE }}
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: 6,
        border: '1px solid',
        fontSize: 12,
        fontFamily: 'ui-monospace, "SFMono-Regular", Consolas, monospace',
        fontWeight: 600,
        minWidth: 24,
        textAlign: 'center',
      }}
    >
      {label}
    </motion.span>
  );
}

export function Screen5Shortcuts({ onNext, onBack }: Props) {
  // Light each chord sequentially after a small initial delay.
  const [litIndex, setLitIndex] = useState(-1);
  useEffect(() => {
    const timers = CHORDS.map((c, i) =>
      window.setTimeout(() => setLitIndex(i), c.delay * 1000),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <ScreenLayout
      step={5}
      totalSteps={7}
      back={{ onClick: onBack }}
      primary={{ label: 'Continuer', onClick: onNext }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          maxWidth: 640,
          textAlign: 'center',
        }}
      >
        <ScreenItem index={0}>
          <h1 style={{ fontSize: 32, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
            Trois raccourcis à connaître
          </h1>
        </ScreenItem>

        <ScreenItem index={1}>
          <p
            style={{
              fontSize: 13,
              color: 'rgba(245,245,245,0.5)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Tu pourras tous les personnaliser dans Réglages plus tard.
          </p>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 16 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 28,
              alignItems: 'center',
            }}
          >
            {CHORDS.map((chord, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {chord.keys.map((k, j) => (
                    <React.Fragment key={k}>
                      <KeyChip label={k} lit={litIndex >= i} />
                      {j < chord.keys.length - 1 && (
                        <span style={{ color: 'rgba(245,245,245,0.3)', fontSize: 11 }}>
                          +
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <motion.div
                  animate={{ opacity: litIndex >= i ? 0.7 : 0.25 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: 12, color: '#F5F5F5' }}
                >
                  {chord.caption}
                </motion.div>
              </div>
            ))}
          </div>
        </ScreenItem>
      </div>
    </ScreenLayout>
  );
}
