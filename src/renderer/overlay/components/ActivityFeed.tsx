import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ActivityEntry } from '@shared/types';

const VISIBLE_COUNT = 5;
const FRESH_WINDOW_MS = 30_000;

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + '…';
}

function relativeTime(ts: number, now: number): string {
  const delta = Math.max(0, Math.round((now - ts) / 1000));
  if (delta < 60) return `il y a ${delta}s`;
  const min = Math.round(delta / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  return `il y a ${h} h`;
}

export function ActivityFeed() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [now, setNow] = useState(Date.now());

  // Load initial history from the main-process ring buffer, then subscribe.
  useEffect(() => {
    let mounted = true;
    void window.shiftK.getRecentActivity().then((items) => {
      if (mounted) setEntries(items);
    });
    const unsubscribe = window.shiftK.onActivityRouted((entry) => {
      setEntries((prev) => [...prev, entry].slice(-VISIBLE_COUNT - 5));
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Tick "now" so relative timestamps and the fresh-window fade refresh.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const visible = entries.slice(-VISIBLE_COUNT);

  if (visible.length === 0) {
    return (
      <div
        style={{
          padding: '12px 14px',
          fontSize: 11,
          color: '#3a3a3a',
          fontStyle: 'italic',
          textAlign: 'center',
        }}
      >
        Aucune activité récente
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      <AnimatePresence initial={false}>
        {visible.map((entry) => {
          const isFresh = now - entry.timestamp < FRESH_WINDOW_MS;
          return (
            <motion.div
              key={`${entry.timestamp}-${entry.filename}`}
              layout
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: isFresh ? 1 : 0.45 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: isFresh ? 0.15 : 0.8 },
                y: { duration: 0.15 },
                layout: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 14px',
                fontSize: 11,
                gap: 8,
              }}
              title={`${entry.filename} → ${entry.client} / ${entry.stageFolderName}`}
            >
              <span
                style={{
                  color: '#9A9A9A',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <span style={{ color: '#555', marginRight: 4 }}>↳</span>
                {truncate(entry.filename, 28)}
                <span style={{ color: '#555', margin: '0 4px' }}>→</span>
                <span style={{ color: '#aaa' }}>{truncate(entry.client, 14)}</span>
                <span style={{ color: '#555' }}> / {entry.stage}</span>
              </span>
              <span
                style={{
                  color: '#3a3a3a',
                  fontSize: 10,
                  whiteSpace: 'nowrap',
                }}
              >
                {relativeTime(entry.timestamp, now)}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
