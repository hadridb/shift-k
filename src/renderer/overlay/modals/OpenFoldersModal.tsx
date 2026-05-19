import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { AppConfig, Stage } from '@shared/types';

const MODAL_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] } as const;
const MODAL_VARIANTS = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

const ALL_STAGES: Stage[] = ['src', 'img', 'out', 'ost', 'liv'];

interface Props {
  config: AppConfig;
  onClose: () => void;
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-subtle)'}`,
          background: checked ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
        }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path
              d="M1 3L3 5L7 1"
              stroke="var(--bg-primary)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <span
        style={{
          fontSize: 12,
          color: checked ? 'var(--text-primary)' : 'var(--text-muted)',
        }}
      >
        {label}
      </span>
    </label>
  );
}

export function OpenFoldersModal({ config, onClose }: Props) {
  const [stageChecked, setStageChecked] = useState<Record<Stage, boolean>>(
    () => ({ ...config.preferences.openFoldersLast }),
  );
  const [todayOnly, setTodayOnly] = useState(config.preferences.openFoldersToday);
  const [opening, setOpening] = useState(false);

  const selectedStages = ALL_STAGES.filter((s) => stageChecked[s]);
  const canOpen = selectedStages.length > 0;

  function toggleStage(stage: Stage, value: boolean) {
    setStageChecked((prev) => ({ ...prev, [stage]: value }));
  }

  async function handleOpen() {
    if (!canOpen || opening) return;
    setOpening(true);
    try {
      await window.shiftK.openFolders(selectedStages, todayOnly);
      onClose();
    } finally {
      setOpening(false);
    }
  }

  return (
    <motion.div
      initial={MODAL_VARIANTS.initial}
      animate={MODAL_VARIANTS.animate}
      exit={MODAL_VARIANTS.exit}
      transition={MODAL_TRANSITION}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--bg-modal)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 14,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px 16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--text-primary)',
          }}
        >
          OUVRIR DOSSIERS
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 14,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Active client info */}
      {config.activeClient && (
        <div
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            marginBottom: 16,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {config.activeClient}
        </div>
      )}

      {/* Stage checkboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ALL_STAGES.map((stage) => (
          <Checkbox
            key={stage}
            checked={stageChecked[stage]}
            onChange={(v) => toggleStage(stage, v)}
            label={config.stages[stage]}
          />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border-divider)', margin: '16px 0' }} />

      {/* Today toggle */}
      <Checkbox
        checked={todayOnly}
        onChange={setTodayOnly}
        label="Dossier du jour"
      />

      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={onClose}
          disabled={opening}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 11,
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          Annuler
        </button>
        <button
          onClick={() => void handleOpen()}
          disabled={!canOpen || opening}
          style={{
            background: canOpen && !opening ? 'var(--accent)' : 'var(--bg-elevated)',
            border: 'none',
            borderRadius: 6,
            color: canOpen && !opening ? 'var(--bg-primary)' : 'var(--text-disabled)',
            fontSize: 11,
            fontWeight: 600,
            cursor: canOpen && !opening ? 'pointer' : 'default',
            padding: '8px 16px',
          }}
        >
          {opening ? '…' : 'Ouvrir'}
        </button>
      </div>
    </motion.div>
  );
}
