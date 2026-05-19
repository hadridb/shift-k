import React from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE } from '../ScreenLayout';

interface Props {
  onNext: () => void;
}

export function Screen1Welcome({ onNext }: Props) {
  return (
    <ScreenLayout
      step={1}
      totalSteps={7}
      primary={{ label: 'Commencer la configuration', onClick: onNext }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          maxWidth: 720,
          textAlign: 'center',
        }}
      >
        {/* Hero wordmark with animated underline beneath "shift" */}
        <ScreenItem index={0}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span
              style={{
                fontSize: 96,
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: '#F5F5F5',
                lineHeight: 1,
              }}
            >
              shift-k
            </span>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.0, delay: 0.6, ease: SCREEN_EASE }}
              style={{
                position: 'absolute',
                left: 0,
                bottom: -8,
                width: '58%',
                height: 3,
                background: '#FFFFFF',
                transformOrigin: 'left center',
                borderRadius: 2,
              }}
            />
          </div>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 400, lineHeight: 1.3 }}>
            Le workflow OS pour les directeurs IA luxury.
          </div>
        </ScreenItem>

        <ScreenItem index={3}>
          <div
            style={{
              fontSize: 14,
              color: 'rgba(245,245,245,0.5)',
              lineHeight: 1.6,
              maxWidth: 540,
            }}
          >
            Routage automatique de tes générations IA. Multi-clients, multi-projets, jamais perdu.
          </div>
        </ScreenItem>
      </div>
    </ScreenLayout>
  );
}
