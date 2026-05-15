import React from 'react';
import type { Stage, StageLabels } from '@shared/types';

interface Props {
  stages: StageLabels;
  activeStage: Stage;
  routingEnabled: boolean;
  onCycle: () => void;
}

export function StageBar({ stages, activeStage, routingEnabled, onCycle }: Props) {
  const label = stages[activeStage];

  return (
    <div className="no-drag flex items-center justify-between px-3 h-10">
      <button
        onClick={onCycle}
        className="flex items-center gap-2 px-2 py-1 rounded transition-colors duration-100 focus:outline-none"
        style={{ background: 'transparent' }}
        title="Cycle stage (Ctrl+Alt+S) — Shift+J/L pour slot précédent/suivant"
      >
        <span style={{ fontSize: 11, color: '#666666' }}>STAGE</span>
        <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 500 }}>{label}</span>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
          <path d="M1 1L4 4L7 1" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {!routingEnabled && (
        <span
          style={{
            fontSize: 10,
            color: '#FF4444',
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          PAUSED
        </span>
      )}
    </div>
  );
}
