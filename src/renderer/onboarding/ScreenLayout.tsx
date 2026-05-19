import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  primary?: { label: string; onClick: () => void; disabled?: boolean };
  secondary?: { label: string; onClick: () => void };
  back?: { onClick: () => void };
}

const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Shared chrome for every onboarding screen — Apple Keynote / Linear
 * sign-up aesthetic: black canvas, sparse typography, single accent
 * action on the right, optional back action on the left, a thin dot
 * progress indicator at the top. Screen content (titles + visuals)
 * lives in `children` and should self-orchestrate via its own
 * cascading framer-motion entries (see Screen1Welcome for the
 * canonical pattern).
 */
export function ScreenLayout({
  step,
  totalSteps,
  children,
  primary,
  secondary,
  back,
}: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0A',
        color: '#F5F5F5',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      {/* Progress dots */}
      <div
        style={{
          padding: '28px 40px',
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {Array.from({ length: totalSteps }).map((_, i) => {
          const active = i + 1 === step;
          const done = i + 1 < step;
          return (
            <motion.div
              key={i}
              animate={{
                background: active
                  ? '#FFFFFF'
                  : done
                    ? 'rgba(255,255,255,0.4)'
                    : 'rgba(255,255,255,0.15)',
                width: active ? 16 : 6,
              }}
              transition={{ duration: 0.25, ease: EASE }}
              style={{ height: 6, borderRadius: 3 }}
            />
          );
        })}
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 64px',
          overflow: 'auto',
        }}
      >
        {children}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '24px 40px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {back && (
            <button
              onClick={back.onClick}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(245,245,245,0.5)',
                fontSize: 13,
                cursor: 'pointer',
                padding: '10px 18px',
                fontFamily: 'inherit',
              }}
            >
              Retour
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {secondary && (
            <button
              onClick={secondary.onClick}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(245,245,245,0.7)',
                fontSize: 13,
                cursor: 'pointer',
                padding: '10px 18px',
                fontFamily: 'inherit',
              }}
            >
              {secondary.label}
            </button>
          )}
          {primary && (
            <button
              onClick={primary.onClick}
              disabled={primary.disabled}
              style={{
                background: primary.disabled ? '#2A2A2A' : '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                color: primary.disabled ? '#555555' : '#0A0A0A',
                fontSize: 13,
                fontWeight: 600,
                cursor: primary.disabled ? 'default' : 'pointer',
                padding: '12px 28px',
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
              }}
            >
              {primary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Cascading framer-motion preset for screen content. Wrap each major
 * block (title, subtitle, visual, form) in a `<ScreenItem index={n}>`
 * to get a 100-ms staggered fade-in.
 */
export function ScreenItem({
  index,
  children,
  style,
}: {
  index: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: EASE }}
      style={style as Record<string, string | number>}
    >
      {children}
    </motion.div>
  );
}

export const SCREEN_EASE = EASE;
