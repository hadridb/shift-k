import React from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE } from '../ScreenLayout';

interface Props {
  onNext: () => void;
}

/**
 * Welcome screen — sober. Hand-set typography rather than text-heavy
 * marketing copy. The original (Sprint 8 iter 1) was too verbose and
 * promised "directeurs IA luxury" which read like a brochure. This
 * version sticks to one word + one factual line + button.
 *
 * Ambient motion: a single dim dot pulses slowly at the bottom of the
 * canvas. Subtle, never distracting — the kind of micro-detail
 * Apple Keynote uses to make a static screen feel alive.
 */
export function Screen1Welcome({ onNext }: Props) {
  return (
    <ScreenLayout
      step={1}
      totalSteps={7}
      primary={{ label: 'Commencer', onClick: onNext }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          maxWidth: 720,
          textAlign: 'center',
        }}
      >
        {/* Hero wordmark — UPPERCASE, no underline, smaller than iter 1
            so it stops shouting and starts reading as identity. */}
        <ScreenItem index={0}>
          <motion.div
            initial={{ opacity: 0, y: 8, letterSpacing: '0.08em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.04em' }}
            transition={{ duration: 1.1, delay: 0.1, ease: SCREEN_EASE }}
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#F5F5F5',
              lineHeight: 1,
            }}
          >
            SHIFT-K
          </motion.div>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.4 }}>
            Bienvenue.
          </div>
        </ScreenItem>

        <ScreenItem index={3}>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(245,245,245,0.5)',
              lineHeight: 1.6,
              maxWidth: 420,
            }}
          >
            Deux dossiers à configurer pour démarrer.
          </div>
        </ScreenItem>

        {/* Ambient pulse — single dim dot drifting in opacity. Pure
            visual breath. */}
        <motion.div
          animate={{ opacity: [0.1, 0.35, 0.1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            marginTop: 56,
            width: 4,
            height: 4,
            borderRadius: 999,
            background: '#FFFFFF',
          }}
        />
      </div>
    </ScreenLayout>
  );
}
