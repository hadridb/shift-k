import React, { useEffect, useState } from 'react';
import { ScreenLayout, ScreenItem, H1, Body, Caption } from '../ScreenLayout';
import {
  ParticleField,
  PARTICLE_FIELD_BURST_MS,
  PARTICLE_FIELD_IMPLODE_MS,
  type ParticleFieldPhase,
} from '../components/ParticleField';

interface Props {
  onLaunch: () => void;
  onBack: () => void;
}

/**
 * Final screen. The visual lead is a 140-particle Touch Designer-style
 * point cloud that fills the whole window: bursts out from centre on
 * mount, settles into an infinite slow drift, and implodes back to a
 * single point when the user clicks "Lancer Shift-K". Text content
 * sits above the field on z-index 1.
 */
export function Screen7Ready({ onLaunch, onBack }: Props) {
  const [phase, setPhase] = useState<ParticleFieldPhase>('burst');

  // burst → idle once every particle has finished its outward animation.
  useEffect(() => {
    if (phase !== 'burst') return;
    const id = window.setTimeout(() => setPhase('idle'), PARTICLE_FIELD_BURST_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  function handleLaunch() {
    setPhase('implode');
    // Fire the launch IPC a hair before the implosion finishes so the
    // overlay-window cold-start overlaps with the last frames of the
    // animation. Caps the user-perceived latency between click and the
    // overlay appearing on screen.
    const LAUNCH_LEAD_MS = 80;
    window.setTimeout(
      onLaunch,
      Math.max(0, PARTICLE_FIELD_IMPLODE_MS - LAUNCH_LEAD_MS),
    );
  }

  return (
    <ScreenLayout
      step={7}
      totalSteps={7}
      back={{ onClick: onBack }}
      primary={{ label: 'Lancer Shift-K', onClick: handleLaunch }}
    >
      {/* Particle field — absolute, behind the content. */}
      <ParticleField phase={phase} />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          maxWidth: 540,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <ScreenItem index={0}>
          <H1>Tout est prêt.</H1>
        </ScreenItem>

        <ScreenItem index={1}>
          <Body style={{ maxWidth: 440 }}>
            Shift-K va maintenant surveiller tes téléchargements et router chaque
            génération vers le bon projet.
          </Body>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 20 }}>
          <Caption>
            L'overlay s'ouvrira en haut à droite. Clic droit sur l'icône tray
            pour quitter.
          </Caption>
        </ScreenItem>
      </div>
    </ScreenLayout>
  );
}
