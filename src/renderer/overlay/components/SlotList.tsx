import React from 'react';
import { motion } from 'framer-motion';
import type { SlotKey } from '@shared/types';

const SLOT_KEYS: SlotKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

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
            className="no-drag w-full flex items-center h-9 px-0 text-left transition-colors duration-150 hover:bg-[#161616] focus:outline-none disabled:hover:bg-transparent"
            style={{ background: 'transparent', position: 'relative' }}
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
                    background: '#FFFFFF',
                    borderRadius: 999,
                  }}
                />
              )}
            </div>

            {/* Slot number */}
            <span
              style={{
                fontSize: 11,
                color: isEmpty ? '#444444' : isActive ? '#FFFFFF' : '#9A9A9A',
                marginRight: 8,
                fontVariantNumeric: 'tabular-nums',
                minWidth: 10,
              }}
            >
              {key}
            </span>

            {/* Client name */}
            <span
              className="truncate"
              style={{
                fontSize: 13,
                color: isEmpty ? '#333333' : isActive ? '#FFFFFF' : '#9A9A9A',
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
