import React from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, SCREEN_EASE, H1, Body, Caption } from '../ScreenLayout';

interface Props {
  onNext: () => void;
}

/**
 * Welcome + value proposition on a single screen. Iter 5 cues:
 *
 *  • Brand hero on top: SHIFT-K wordmark (uppercase, small, light)
 *    with the sober "réalisateurs IA" tagline directly under it.
 *  • Value prop block underneath: short title + the routing explainer
 *    that previously lived on screen 2, plus the italic caption.
 *  • Cascading fade-ins so the eye reads the wordmark first, the
 *    tagline next, the explainer last.
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
          gap: 0,
          maxWidth: 600,
          textAlign: 'center',
        }}
      >
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: SCREEN_EASE }}
          style={{
            fontSize: 56,
            fontWeight: 300,
            letterSpacing: '0.06em',
            color: '#F5F5F5',
            lineHeight: 1,
            fontFamily:
              '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          SHIFT-K
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 0.55, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: SCREEN_EASE }}
          style={{
            marginTop: 22,
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: '0.04em',
            color: '#F5F5F5',
            lineHeight: 1.4,
            textTransform: 'uppercase',
          }}
        >
          Le workflow OS pour les réalisateurs IA
        </motion.div>

        {/* Value-prop block */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1, ease: SCREEN_EASE }}
          style={{
            marginTop: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <H1>Tes fichiers savent où aller.</H1>
          <Body style={{ maxWidth: 540 }}>
            Quand tu génères une image, une vidéo ou un son depuis Higgsfield,
            Runway, Kling, Suno, ElevenLabs ou n'importe quelle autre IA, le
            fichier atterrit dans ton dossier Downloads.
            <br />
            <br />
            Shift-K le détecte, reconnaît la plateforme, et le range
            automatiquement dans le bon client, la bonne étape, le bon jour.
          </Body>
          <Caption style={{ fontStyle: 'italic', marginTop: 8 }}>
            Tu continues de générer. Shift-K s'occupe du reste.
          </Caption>
        </motion.div>
      </div>
    </ScreenLayout>
  );
}
