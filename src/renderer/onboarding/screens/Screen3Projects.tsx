import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE, H1, Body } from '../ScreenLayout';

interface Props {
  initialPath: string;
  onNext: (root: string) => void;
  onBack: () => void;
}

const TREE_LINES = [
  { text: 'Gucci - Holiday 26', depth: 0 },
  { text: '01_SRC Inits',      depth: 1 },
  { text: '02_IMG Inits',      depth: 1 },
  { text: '03_Outputs',        depth: 1 },
  { text: '04_OST',            depth: 1 },
  { text: '05_Renders',        depth: 1 },
];

/**
 * Animated ASCII-ish tree rendered with a leading vertical pipe + branch
 * glyphs. Each line cascades in with a 180 ms stagger — the impression is
 * a directory being scaffolded live.
 */
function TreeIllustration() {
  return (
    <div
      style={{
        fontFamily: 'ui-monospace, "SFMono-Regular", Consolas, monospace',
        fontSize: 13,
        color: 'rgba(245,245,245,0.8)',
        lineHeight: 1.7,
        textAlign: 'left',
      }}
    >
      {TREE_LINES.map((line, i) => {
        const prefix =
          line.depth === 0
            ? '▸ '
            : i === TREE_LINES.length - 1
              ? '  └─ '
              : '  ├─ ';
        return (
          <motion.div
            key={line.text}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.18, ease: SCREEN_EASE }}
          >
            <span style={{ color: 'rgba(245,245,245,0.4)' }}>{prefix}</span>
            {line.text}
          </motion.div>
        );
      })}
    </div>
  );
}

export function Screen3Projects({ initialPath, onNext, onBack }: Props) {
  const [path, setPath] = useState(initialPath);
  const canContinue = path.trim().length > 0;

  async function pick() {
    const picked = await window.shiftK.pickFolder('Dossier racine projets');
    if (picked) setPath(picked);
  }

  return (
    <ScreenLayout
      step={3}
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
          <H1>Où veux-tu que vivent tes projets&nbsp;?</H1>
        </ScreenItem>

        <ScreenItem index={1}>
          <Body style={{ maxWidth: 480 }}>
            Shift-K créera la structure de dossiers pour chaque nouveau projet ici.
          </Body>
        </ScreenItem>

        <ScreenItem index={2} style={{ marginTop: 16 }}>
          <TreeIllustration />
        </ScreenItem>

        <ScreenItem index={3} style={{ width: '100%', maxWidth: 480, marginTop: 8 }}>
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
              placeholder="C:\Users\…\Documents\Shift-K"
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
