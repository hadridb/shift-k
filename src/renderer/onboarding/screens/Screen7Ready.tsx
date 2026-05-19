import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE } from '../ScreenLayout';
import { ParticleBurst } from '@renderer/overlay/components/ParticleBurst';

interface Props {
  onLaunch: () => void;
  onBack: () => void;
}

/**
 * Final screen — particle burst as visual payoff.
 *
 * Sprint 8 iter 1: the burst fired at mount (0 ms) while the screen
 * itself was still mid-transition (slide-up 350 ms + content stagger).
 * The particle motion is 700 ms total, so it was over before the user
 * even registered the screen. Iter 2 delays the first burst to 1100 ms
 * (after all cascading content has settled) and increases scale 2.4 → 3.2
 * so the motes carry visibly across the canvas.
 */
export function Screen7Ready({ onLaunch, onBack }: Props) {
  const [burstSeq, setBurstSeq] = useState(0);

  // Defer the first burst until the screen entrance is over.
  useEffect(() => {
    const id = window.setTimeout(() => setBurstSeq(1), 1100);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <ScreenLayout
      step={7}
      totalSteps={7}
      back={{ onClick: onBack }}
      primary={{
        label: 'Lancer Shift-K',
        onClick: () => {
          setBurstSeq((n) => n + 1);
          // Hold a bit longer than before so the second burst is unmistakable
          // before the window destroys.
          window.setTimeout(onLaunch, 650);
        },
      }}
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
          <h1
            style={{
              fontSize: 36,
              fontWeight: 500,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Tout est prêt.
          </h1>
        </ScreenItem>

        <ScreenItem index={1}>
          <p
            style={{
              fontSize: 13,
              color: 'rgba(245,245,245,0.6)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 480,
            }}
          >
            Shift-K va maintenant surveiller tes téléchargements et router chaque
            génération vers le bon projet.
          </p>
        </ScreenItem>

        {/* Burst container — 3.2× scale so the particles read across the
            canvas, not as a 16 px confetti puff. Wrapper is 96×96 so
            absolute child sizing stays predictable. */}
        <ScreenItem index={2} style={{ marginTop: 28 }}>
          <div
            style={{
              width: 96,
              height: 96,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                transform: 'scale(3.2)',
                transformOrigin: 'center',
                position: 'relative',
                width: 16,
                height: 16,
              }}
            >
              <ParticleBurst trigger={burstSeq} />
            </div>
          </div>
        </ScreenItem>

        <ScreenItem index={3} style={{ marginTop: 8 }}>
          <p
            style={{
              fontSize: 11,
              color: 'rgba(245,245,245,0.4)',
              margin: 0,
            }}
          >
            L'overlay s'ouvrira en haut à droite. Clic droit sur l'icône tray pour quitter.
          </p>
        </ScreenItem>
      </div>
    </ScreenLayout>
  );
}

void SCREEN_EASE;
