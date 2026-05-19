import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE } from '../ScreenLayout';

interface Props {
  initialPath: string;
  onNext: (downloadsPath: string) => void;
  onBack: () => void;
}

/**
 * Minimal SVG folder illustration with 3 particles drifting out to the
 * right in a slow infinite loop — represents the watcher monitoring
 * the Downloads folder. Hand-drawn line art, monochrome white.
 */
function FolderWithParticles() {
  const particles = [0, 1, 2];
  return (
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
      {/* Folder body */}
      <path
        d="M 12 36 L 12 96 Q 12 102 18 102 L 88 102 Q 94 102 94 96 L 94 42 Q 94 36 88 36 L 50 36 L 42 28 L 18 28 Q 12 28 12 34 Z"
        stroke="#F5F5F5"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Particles drifting right */}
      {particles.map((i) => (
        <motion.circle
          key={i}
          cx={94}
          cy={66}
          r={1.5}
          fill="#F5F5F5"
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: [0, 30, 60], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </svg>
  );
}

export function Screen2Downloads({ initialPath, onNext, onBack }: Props) {
  const [path, setPath] = useState(initialPath);
  const canContinue = path.trim().length > 0;

  async function pick() {
    const picked = await window.shiftK.pickFolder('Dossier Downloads');
    if (picked) setPath(picked);
  }

  return (
    <ScreenLayout
      step={2}
      totalSteps={7}
      back={{ onClick: onBack }}
      primary={{
        label: 'Confirmer',
        onClick: () => onNext(path.trim()),
        disabled: !canContinue,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          maxWidth: 560,
          textAlign: 'center',
        }}
      >
        <ScreenItem index={0}>
          <h1 style={{ fontSize: 26, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>
            Où sont tes téléchargements ?
          </h1>
        </ScreenItem>

        <ScreenItem index={1}>
          <p
            style={{
              fontSize: 14,
              color: 'rgba(245,245,245,0.5)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 480,
            }}
          >
            Shift-K surveille ce dossier en temps réel pour router tes générations IA
            vers le bon projet.
          </p>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 16 }}>
          <FolderWithParticles />
        </ScreenItem>

        <ScreenItem index={3} style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={path}
              onChange={(e) => setPath(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                background: '#141414',
                border: '1px solid #232323',
                borderRadius: 8,
                color: '#F5F5F5',
                fontSize: 13,
                padding: '12px 14px',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              placeholder="C:\Users\…\Downloads"
            />
            <button
              onClick={() => void pick()}
              style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: 8,
                color: '#CCCCCC',
                fontSize: 12,
                cursor: 'pointer',
                padding: '0 16px',
                fontFamily: 'inherit',
              }}
            >
              Choisir un autre dossier
            </button>
          </div>
        </ScreenItem>
      </div>
    </ScreenLayout>
  );
}

// Suppress unused-import warning while still importing SCREEN_EASE for
// the FolderWithParticles motion timing if we ever switch to it.
void SCREEN_EASE;
