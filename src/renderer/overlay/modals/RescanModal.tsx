import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { RescanPreview, RescanPreviewItem } from '@shared/types';

const MODAL_TRANSITION = { duration: 0.18, ease: [0.4, 0, 0.2, 1] } as const;
const MODAL_VARIANTS = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

interface Props {
  preview: RescanPreview;
  onClose: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function relativeTime(date: Date): string {
  const ms = Date.now() - date.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

function CheckSquare({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{
        width: 14,
        height: 14,
        marginTop: 2,
        borderRadius: 3,
        border: `1px solid ${checked ? '#ffffff' : '#3a3a3a'}`,
        background: checked ? '#ffffff' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3L3 5L7 1" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

export function RescanModal({ preview, onClose }: Props) {
  const items = preview.items;
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(items.map((i) => i.sourcePath)),
  );
  const [busy, setBusy] = useState(false);

  const allChecked = items.length > 0 && selected.size === items.length;
  const selectedCount = selected.size;

  function toggle(path: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(items.map((i) => i.sourcePath)));
  }

  const selectedItems = useMemo<RescanPreviewItem[]>(
    () => items.filter((i) => selected.has(i.sourcePath)),
    [items, selected],
  );

  async function handleExecute() {
    if (selectedCount === 0 || busy) return;
    setBusy(true);
    try {
      await window.shiftK.executeRescan(selectedItems);
      onClose();
    } finally {
      setBusy(false);
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
        background: 'rgba(10,10,10,0.97)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        borderRadius: 14,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px 14px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span
          style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#FFFFFF' }}
        >
          RESCAN · {items.length}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666666',
            fontSize: 14,
            cursor: 'pointer',
            padding: 4,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ fontSize: 13, color: '#888' }}>Rien à router.</div>
          {preview.skipped > 0 && (
            <div style={{ fontSize: 10, color: '#555' }}>
              {preview.skipped} fichier{preview.skipped > 1 ? 's' : ''} ignoré
              {preview.skipped > 1 ? 's' : ''}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Select all */}
          <div
            onClick={toggleAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 0 10px',
              cursor: 'pointer',
              borderBottom: '1px solid #1a1a1a',
              userSelect: 'none',
            }}
          >
            <CheckSquare checked={allChecked} onToggle={toggleAll} />
            <span style={{ fontSize: 10, color: '#888', letterSpacing: '0.05em' }}>
              {allChecked ? 'TOUT DÉCOCHER' : 'TOUT COCHER'}
            </span>
            {preview.skipped > 0 && (
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#444' }}>
                {preview.skipped} ignoré{preview.skipped > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Item list */}
          <div style={{ flex: 1, overflowY: 'auto', marginTop: 4 }}>
            {items.map((item) => {
              const isChecked = selected.has(item.sourcePath);
              return (
                <div
                  key={item.sourcePath}
                  onClick={() => toggle(item.sourcePath)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '10px 0',
                    borderBottom: '1px solid #141414',
                    cursor: 'pointer',
                    opacity: isChecked ? 1 : 0.4,
                  }}
                >
                  <CheckSquare
                    checked={isChecked}
                    onToggle={() => toggle(item.sourcePath)}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.fileName}
                    >
                      {item.fileName}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: '#888',
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span style={{ color: '#aaa' }}>{item.platform}</span>
                      <span style={{ margin: '0 6px', color: '#333' }}>→</span>
                      <span>{item.stageFolderName}</span>
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: '#555',
                        marginTop: 2,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatSize(item.size)} · {relativeTime(new Date(item.modifiedAt))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid #1a1a1a',
        }}
      >
        <button
          onClick={onClose}
          disabled={busy}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#888',
            fontSize: 11,
            cursor: 'pointer',
            padding: '8px 12px',
          }}
        >
          {items.length === 0 ? 'Fermer' : 'Annuler'}
        </button>
        {items.length > 0 && (
          <button
            onClick={() => void handleExecute()}
            disabled={selectedCount === 0 || busy}
            style={{
              background: selectedCount > 0 && !busy ? '#FFFFFF' : '#2a2a2a',
              border: 'none',
              borderRadius: 6,
              color: selectedCount > 0 && !busy ? '#000000' : '#555555',
              fontSize: 11,
              fontWeight: 600,
              cursor: selectedCount > 0 && !busy ? 'pointer' : 'default',
              padding: '8px 16px',
            }}
          >
            {busy ? '…' : `Déplacer ${selectedCount}`}
          </button>
        )}
      </div>
    </motion.div>
  );
}
