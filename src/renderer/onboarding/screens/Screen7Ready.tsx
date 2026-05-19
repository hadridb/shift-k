import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE } from '../ScreenLayout';
import { ParticleBurst } from '@renderer/overlay/components/ParticleBurst';

interface Props {
  onLaunch: () => void;
  onBack: () => void;
}

export function Screen7Ready({ onLaunch, onBack }: Props) {
  // Trigger one burst on mount, then a second when the user clicks Launch
  // (right before the window closes — the second burst plays for ~700 ms
  // while the overlay is opening).
  const [burstSeq, setBurstSeq] = useState(0);
  useEffect(() => {
    setBurstSeq(1);
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
          // Brief delay so the burst is visible before the window closes.
          window.setTimeout(onLaunch, 400);
        },
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          maxWidth: 640,
          textAlign: 'center',
        }}
      >
        <ScreenItem index={0}>
          <h1
            style={{
              fontSize: 44,
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
              fontSize: 15,
              color: 'rgba(245,245,245,0.6)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 520,
            }}
          >
            Shift-K va maintenant surveiller tes téléchargements et router chaque
            génération vers le bon projet.
          </p>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 12 }}>
          {/* Bigger particle burst — reuses the component from Sprint 6.
              Scaled up via a wrapper so the same component reads bigger
              here than it does inside the overlay's 16×16 toast slot. */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1 }}
            style={{
              width: 80,
              height: 80,
              transform: 'scale(2.4)',
              transformOrigin: 'center',
              position: 'relative',
            }}
          >
            <ParticleBurst trigger={burstSeq} />
          </motion.div>
        </ScreenItem>

        <ScreenItem index={3} style={{ marginTop: 16 }}>
          <p
            style={{
              fontSize: 11,
              color: 'rgba(245,245,245,0.4)',
              margin: 0,
            }}
          >
            Tu trouveras l'overlay dans le coin haut-droit. Clic droit sur l'icône
            tray pour quitter.
          </p>
        </ScreenItem>
      </div>
    </ScreenLayout>
  );
}

void SCREEN_EASE;
