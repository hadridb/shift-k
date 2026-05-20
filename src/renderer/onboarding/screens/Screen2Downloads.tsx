import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScreenLayout,
  ScreenItem,
  SCREEN_EASE,
  H1,
  Body,
  Caption,
} from '../ScreenLayout';

interface Props {
  initialPath: string;
  onNext: (downloadsPath: string) => void;
  onBack: () => void;
}

/**
 * Minimal SVG folder illustration with 3 particles drifting out to the
 * right in a slow infinite loop. Represents the watcher monitoring
 * the Downloads folder.
 */
function FolderWithParticles() {
  const particles = [0, 1, 2];
  return (
    <svg width="160" height="92" viewBox="0 0 160 92" fill="none">
      <path
        d="M 12 26 L 12 76 Q 12 82 18 82 L 88 82 Q 94 82 94 76 L 94 32 Q 94 26 88 26 L 50 26 L 42 18 L 18 18 Q 12 18 12 24 Z"
        stroke="#F5F5F5"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {particles.map((i) => (
        <motion.circle
          key={i}
          cx={94}
          cy={50}
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
  const isDefault = path === initialPath && initialPath.length > 0;

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
          gap: 20,
          maxWidth: 560,
          textAlign: 'center',
        }}
      >
        <ScreenItem index={0}>
          <H1>Où sont tes téléchargements&nbsp;?</H1>
        </ScreenItem>

        <ScreenItem index={1}>
          <Body style={{ maxWidth: 500 }}>
            C'est le dossier que Shift-K va surveiller en continu. On a
            pré-rempli ton dossier Downloads système ci-dessous, tu peux le
            laisser tel quel ou choisir un autre emplacement si tu télécharges
            tes fichiers IA ailleurs.
          </Body>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 4 }}>
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

        {isDefault && (
          <ScreenItem index={4}>
            <Caption style={{ fontStyle: 'italic' }}>
              Suggéré&nbsp;: ton dossier Downloads système.
            </Caption>
          </ScreenItem>
        )}
      </div>
    </ScreenLayout>
  );
}

void SCREEN_EASE;
