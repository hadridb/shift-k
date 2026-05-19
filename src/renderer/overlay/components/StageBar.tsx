import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Stage, StageLabels } from '@shared/types';
import { StagePopover } from './StagePopover';

interface Props {
  stages: StageLabels;
  activeStage: Stage;
  routingEnabled: boolean;
  onCycle: () => void;
  onSelect: (stage: Stage) => void;
}

export function StageBar({ stages, activeStage, routingEnabled, onCycle, onSelect }: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const label = stages[activeStage];

  return (
    <div className="no-drag flex items-center justify-between px-3 h-10" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          onClick={onCycle}
          className="flex items-center gap-2 px-2 py-1 rounded transition-colors duration-150 focus:outline-none hover:bg-[#161616]"
          style={{ background: 'transparent' }}
          title="Cycle stage (Ctrl+Alt+S) — Shift+J/L pour slot précédent/suivant"
        >
          <span style={{ fontSize: 11, color: '#666666' }}>STAGE</span>
          {/* Flip-on-change badge */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={activeStage}
              initial={{ opacity: 0, rotateX: -45 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, rotateX: 45 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 500, display: 'inline-block' }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Chevron — separate click target for the peek popover */}
        <button
          onClick={() => setPopoverOpen((o) => !o)}
          className="rounded transition-colors duration-150 focus:outline-none hover:bg-[#161616]"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Choisir un stage"
          aria-haspopup="menu"
          aria-expanded={popoverOpen}
        >
          <motion.svg
            width={12}
            height={12}
            viewBox="0 0 12 12"
            fill="none"
            animate={{ rotate: popoverOpen ? 180 : 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          >
            <path
              d="M3 5L6 8L9 5"
              stroke={popoverOpen ? '#FFFFFF' : '#666666'}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </motion.svg>
        </button>
      </div>

      {!routingEnabled && (
        <motion.span
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          style={{
            fontSize: 10,
            color: '#FF4444',
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          PAUSED
        </motion.span>
      )}

      <StagePopover
        open={popoverOpen}
        stages={stages}
        activeStage={activeStage}
        onSelect={onSelect}
        onClose={() => setPopoverOpen(false)}
      />
    </div>
  );
}
