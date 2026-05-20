import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onClose: () => void;
}

const MODAL_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] } as const;
const MODAL_VARIANTS = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 6,
  color: 'var(--text-primary)',
  fontSize: 13,
  padding: '8px 10px',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: 'var(--text-muted)',
  letterSpacing: '0.1em',
  marginBottom: 5,
  display: 'block',
};

export function NewProjectModal({ onClose }: Props) {
  const [client, setClient] = useState('');
  const [mission, setMission] = useState('');
  const [loading, setLoading] = useState(false);

  const canCreate = client.trim().length > 0 && mission.trim().length > 0;

  async function handleCreate() {
    if (!canCreate || loading) return;
    setLoading(true);
    try {
      await window.shiftK.createProject(client.trim(), mission.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && canCreate) void handleCreate();
    if (e.key === 'Escape') onClose();
  }

  return (
    <motion.div
      className="modal-panel"
      initial={MODAL_VARIANTS.initial}
      animate={MODAL_VARIANTS.animate}
      exit={MODAL_VARIANTS.exit}
      transition={MODAL_TRANSITION}
      style={{
        // position: absolute — clipped by parent overlay container. ADR-028.
        position: 'absolute',
        inset: 0,
        background: 'var(--bg-modal)',
        backdropFilter: 'blur(20px) saturate(160%) brightness(108%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%) brightness(108%)',
        borderRadius: 14,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px 16px',
      }}
      onKeyDown={handleKeyDown}
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
          NOUVEAU PROJET
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

      {/* Client field */}
      <label style={labelStyle}>CLIENT</label>
      <input
        style={inputStyle}
        value={client}
        onChange={(e) => setClient(e.target.value)}
        placeholder="ex : Gucci"
        autoFocus
        disabled={loading}
      />

      {/* Mission field */}
      <label style={{ ...labelStyle, marginTop: 14 }}>MISSION</label>
      <input
        style={inputStyle}
        value={mission}
        onChange={(e) => setMission(e.target.value)}
        placeholder="ex : Campagne Printemps 2026"
        disabled={loading}
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          onClick={onClose}
          disabled={loading}
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
          onClick={() => void handleCreate()}
          disabled={!canCreate || loading}
          style={{
            background: canCreate && !loading ? 'var(--accent)' : 'var(--bg-elevated)',
            border: 'none',
            borderRadius: 6,
            color: canCreate && !loading ? 'var(--accent-text)' : 'var(--text-disabled)',
            fontSize: 11,
            fontWeight: 600,
            cursor: canCreate && !loading ? 'pointer' : 'default',
            padding: '8px 16px',
          }}
        >
          {loading ? '…' : 'Créer'}
        </button>
      </div>
    </motion.div>
  );
}
