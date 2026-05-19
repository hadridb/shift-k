import React from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE } from '../ScreenLayout';

interface Props {
  onNext: () => void;
}

/**
 * Welcome — sober. Iter 2 cues from user feedback:
 *
 *  • Wordmark cut to 48 px (down from 64) so it reads as identity,
 *    not as a billboard.
 *  • Tagline presents what the tool does rather than re-branding it.
 *    "Réalisateur IA" instead of "Directeur IA luxury".
 *  • Single thin pulsing dot under the body — sole ambient motion.
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
          maxWidth: 580,
          textAlign: 'center',
        }}
      >
        <ScreenItem index={0}>
          <motion.div
            initial={{ opacity: 0, y: 8, letterSpacing: '0.10em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.04em' }}
            transition={{ duration: 1.2, delay: 0.1, ease: SCREEN_EASE }}
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#F5F5F5',
              lineHeight: 1,
            }}
          >
            SHIFT-K
          </motion.div>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 4 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              lineHeight: 1.4,
              color: '#F5F5F5',
            }}
          >
            Bienvenue.
          </div>
        </ScreenItem>

        <ScreenItem index={3}>
          <div
            style={{
              fontSize: 13,
              color: 'rgba(245,245,245,0.55)',
              lineHeight: 1.7,
              maxWidth: 460,
            }}
          >
            Le compagnon de bureau des réalisateurs IA.
            <br />
            Capte tes générations, range les fichiers, garde tes projets clairs.
          </div>
        </ScreenItem>

        {/* Ambient pulse */}
        <motion.div
          animate={{ opacity: [0.1, 0.35, 0.1] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            marginTop: 48,
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
