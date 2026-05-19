import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScreenLayout, ScreenItem, SCREEN_EASE } from '../ScreenLayout';

interface Props {
  onCreate: (client: string, mission: string) => Promise<void>;
  onSkip: () => void;
  onBack: () => void;
}

/**
 * Mini slot-list mock on the left, with the first row carrying a thin
 * vertical pulsing indicator (matching the overlay's active-slot
 * indicator). Pure decoration — gives the user a glimpse of where
 * their first project will land in the overlay.
 */
function SlotMock() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const isFirst = i === 0;
        const slotLabel = i === 9 ? '10' : String(i + 1);
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              height: 22,
              fontSize: 11,
              color: isFirst ? '#F5F5F5' : 'rgba(245,245,245,0.35)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <div
              style={{
                width: 2,
                height: 12,
                marginRight: 10,
                borderRadius: 999,
                background: isFirst ? '#FFFFFF' : 'transparent',
                position: 'relative',
              }}
            >
              {isFirst && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    inset: -2,
                    background: '#FFFFFF',
                    borderRadius: 999,
                    filter: 'blur(2px)',
                  }}
                />
              )}
            </div>
            <span style={{ minWidth: 14 }}>{slotLabel}</span>
            <span style={{ marginLeft: 4 }}>
              {isFirst ? 'Ton premier client' : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Screen4FirstProject({ onCreate, onSkip, onBack }: Props) {
  const [client, setClient] = useState('');
  const [mission, setMission] = useState('');
  const [busy, setBusy] = useState(false);
  const canCreate =
    client.trim().length > 0 && mission.trim().length > 0 && !busy;

  async function handleCreate() {
    if (!canCreate) return;
    setBusy(true);
    try {
      await onCreate(client.trim(), mission.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScreenLayout
      step={4}
      totalSteps={7}
      back={{ onClick: onBack }}
      secondary={{ label: 'Skip pour l\'instant', onClick: onSkip }}
      primary={{
        label: busy ? '…' : 'Créer ce projet',
        onClick: () => void handleCreate(),
        disabled: !canCreate,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 64,
          alignItems: 'center',
          width: '100%',
          maxWidth: 720,
        }}
      >
        {/* Left: animated slot mock */}
        <ScreenItem index={2} style={{ flexShrink: 0 }}>
          <SlotMock />
        </ScreenItem>

        {/* Right: title + form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <ScreenItem index={0}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 500,
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Crée ton premier client
            </h1>
          </ScreenItem>

          <ScreenItem index={1}>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(245,245,245,0.5)',
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Ou skippe et fais-le plus tard depuis l'overlay.
            </p>
          </ScreenItem>

          <ScreenItem index={3} style={{ marginTop: 8 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                color: 'rgba(245,245,245,0.5)',
                letterSpacing: '0.1em',
                marginBottom: 6,
              }}
            >
              CLIENT
            </label>
            <input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="ex : Gucci"
              spellCheck={false}
              autoFocus
              disabled={busy}
              style={{
                width: '100%',
                background: '#141414',
                border: '1px solid #232323',
                borderRadius: 8,
                color: '#F5F5F5',
                fontSize: 14,
                padding: '12px 14px',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </ScreenItem>

          <ScreenItem index={4}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                color: 'rgba(245,245,245,0.5)',
                letterSpacing: '0.1em',
                marginBottom: 6,
              }}
            >
              MISSION
            </label>
            <input
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="ex : Holiday 26"
              spellCheck={false}
              disabled={busy}
              style={{
                width: '100%',
                background: '#141414',
                border: '1px solid #232323',
                borderRadius: 8,
                color: '#F5F5F5',
                fontSize: 14,
                padding: '12px 14px',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </ScreenItem>
        </div>
      </div>
    </ScreenLayout>
  );
}

void SCREEN_EASE;
