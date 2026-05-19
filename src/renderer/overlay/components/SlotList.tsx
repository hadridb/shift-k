import React from 'react';
import { motion } from 'framer-motion';
import type { SlotKey } from '@shared/types';

const SLOT_KEYS: SlotKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

interface Props {
  slots: Record<SlotKey, string | null>;
  activeClient: string | null;
  onSelect: (client: string | null) => void;
}

export function SlotList({ slots, activeClient, onSelect }: Props) {
  return (
    <div>
      {SLOT_KEYS.map((key) => {
        const client = slots[key];
        const isActive = client !== null && client === activeClient;
        const isEmpty = client === null;

        return (
          <button
            key={key}
            className="no-drag w-full flex items-center h-8 px-0 text-left transition-colors duration-150 focus:outline-none"
            style={{
              background: 'transparent',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isEmpty) {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
            onClick={() => !isEmpty && onSelect(client)}
            disabled={isEmpty}
            title={`Ctrl+Alt+${key}${client ? ` — ${client}` : ''}`}
          >
            {/* Active indicator — animated slide via shared layoutId */}
            <div
              style={{
                width: 2,
                height: 14,
                marginLeft: 12,
                marginRight: 10,
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="slot-active-indicator"
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--accent)',
                    borderRadius: 999,
                  }}
                />
              )}
            </div>

            {/* Slot number — key '0' is displayed as "10" (10th slot) even
                though the hotkey is Ctrl+Alt+0 (the number-row key). */}
            <span
              style={{
                fontSize: 11,
                color: isEmpty
                  ? 'var(--text-disabled)'
                  : isActive
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                marginRight: 8,
                fontVariantNumeric: 'tabular-nums',
                minWidth: 14,
              }}
            >
              {key === '0' ? '10' : key}
            </span>

            {/* Client name */}
            <span
              className="truncate"
              style={{
                fontSize: 13,
                color: isEmpty
                  ? 'var(--text-disabled)'
                  : isActive
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
                letterSpacing: isActive ? '0.01em' : '0',
              }}
            >
              {client ?? '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
