import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { AppConfig, SlotKey } from '@shared/types';

const MODAL_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] } as const;
const MODAL_VARIANTS = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

const SLOT_KEYS: SlotKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const EMPTY_SENTINEL = '__null__';

interface Props {
  config: AppConfig;
  onClose: () => void;
}

const selectStyle: React.CSSProperties = {
  flex: 1,
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 5,
  color: 'var(--text-primary)',
  fontSize: 11,
  padding: '5px 8px',
  outline: 'none',
  cursor: 'pointer',
};

export function EditSlotsModal({ config, onClose }: Props) {
  const [slots, setSlots] = useState<Record<SlotKey, string | null>>({ ...config.slots });
  const [projects, setProjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void window.shiftK.listProjects().then(setProjects);
  }, []);

  function handleChange(key: SlotKey, raw: string) {
    setSlots((prev) => ({ ...prev, [key]: raw === EMPTY_SENTINEL ? null : raw }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await window.shiftK.setSlots(slots);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={MODAL_VARIANTS.initial}
      animate={MODAL_VARIANTS.animate}
      exit={MODAL_VARIANTS.exit}
      transition={MODAL_TRANSITION}
      style={{
        // position: absolute — clipped by parent overlay container. ADR-028.
        position: 'absolute',
        inset: 0,
        background: 'var(--bg-modal)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
          marginBottom: 14,
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
          SLOTS
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

      {/* Slot rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
        {SLOT_KEYS.map((key) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
                minWidth: 14,
                textAlign: 'right',
              }}
            >
              {key === '0' ? '10' : key}
            </span>
            <select
              style={selectStyle}
              value={slots[key] ?? EMPTY_SENTINEL}
              onChange={(e) => handleChange(key, e.target.value)}
              disabled={saving}
            >
              <option value={EMPTY_SENTINEL}>(vide)</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
        <button
          onClick={onClose}
          disabled={saving}
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
          onClick={() => void handleSave()}
          disabled={saving}
          style={{
            background: saving ? 'var(--bg-elevated)' : 'var(--accent)',
            border: 'none',
            borderRadius: 6,
            color: saving ? 'var(--text-disabled)' : 'var(--bg-primary)',
            fontSize: 11,
            fontWeight: 600,
            cursor: saving ? 'default' : 'pointer',
            padding: '8px 16px',
          }}
        >
          {saving ? '…' : 'Enregistrer'}
        </button>
      </div>
    </motion.div>
  );
}
