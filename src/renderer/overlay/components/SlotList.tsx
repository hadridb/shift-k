import React from 'react';
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
            className="no-drag w-full flex items-center h-9 px-0 text-left transition-colors duration-100 focus:outline-none"
            style={{ background: 'transparent' }}
            onClick={() => !isEmpty && onSelect(client)}
            disabled={isEmpty}
            {...(client ? { title: client } : {})}
          >
            {/* Active indicator — 2px × 14px white bar */}
            <div
              className="flex-shrink-0 rounded-full"
              style={{
                width: 2,
                height: 14,
                marginLeft: 12,
                marginRight: 10,
                background: isActive ? '#FFFFFF' : 'transparent',
              }}
            />

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
