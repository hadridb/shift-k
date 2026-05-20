import React from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE, H1, Body, Caption } from '../ScreenLayout';

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const PLATFORMS = ['Higgsfield', 'Runway', 'Sora'];

/**
 * Three platform labels at the perimeter of a 320×120 stage, with a
 * faint line drawn from each toward the central wordmark. The lines
 * stroke-dash in as the screen mounts. Hand-drawn vector — placeholder
 * for real platform logos when the extension is published.
 */
function PlatformsConverge() {
  return (
    <svg width="360" height="140" viewBox="0 0 360 140" fill="none">
      {/* Three converging lines from outer points to centre */}
      {[
        { x1: 36, y1: 30 },
        { x1: 324, y1: 30 },
        { x1: 180, y1: 120 },
      ].map((p, i) => (
        <motion.line
          key={i}
          x1={p.x1}
          y1={p.y1}
          x2={180}
          y2={70}
          stroke="rgba(245,245,245,0.25)"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 + i * 0.18, ease: SCREEN_EASE }}
        />
      ))}

      {/* Central wordmark */}
      <text
        x={180}
        y={75}
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={16}
        fontWeight={700}
        letterSpacing="0.04em"
        fill="#F5F5F5"
      >
        SHIFT-K
      </text>

      {/* Platform labels at the three perimeter points */}
      {[
        { x: 36, y: 22, label: PLATFORMS[0] },
        { x: 324, y: 22, label: PLATFORMS[1] },
        { x: 180, y: 132, label: PLATFORMS[2] },
      ].map((p) => (
        <text
          key={p.label}
          x={p.x}
          y={p.y}
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontSize={11}
          fill="rgba(245,245,245,0.7)"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

export function Screen6Extension({ onNext, onBack }: Props) {
  return (
    <ScreenLayout
      step={6}
      totalSteps={7}
      back={{ onClick: onBack }}
      secondary={{ label: 'Plus tard, depuis Réglages', onClick: onNext }}
      primary={{
        label: 'Bientôt disponible',
        onClick: onNext,
        // Extension not yet published — keep CTA but make it a no-op forward.
        disabled: true,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          maxWidth: 580,
          textAlign: 'center',
        }}
      >
        <ScreenItem index={0}>
          <H1>Capture les métadonnées de tes générations</H1>
        </ScreenItem>

        <ScreenItem index={1}>
          <Body style={{ maxWidth: 480 }}>
            Notre extension Chrome enregistre le prompt, le seed et les paramètres
            de chaque fichier que tu télécharges depuis Runway, Higgsfield, Kling,
            Luma, Sora, Midjourney…
          </Body>
        </ScreenItem>

        <ScreenItem index={2}>
          <PlatformsConverge />
        </ScreenItem>

        <ScreenItem index={3}>
          <Caption style={{ fontStyle: 'italic' }}>
            Disponible en Phase Gamma. Tu pourras l'installer depuis Réglages.
          </Caption>
        </ScreenItem>
      </div>
    </ScreenLayout>
  );
}
