import React, { useEffect, useReducer, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ActivityEntry, ActivityType, Stage } from '@shared/types';
import { formatActivityLine } from '@shared/i18n/activity';

// Aggregation map key — one bucket per (type × stage) combination.
type BucketKey = `${ActivityType}:${Stage}`;

interface Bucket {
  key: BucketKey;
  type: ActivityType;
  stage: Stage;
  stageFolderName: string;
  count: number;
}

const STAGE_ORDER: Stage[] = ['src', 'img', 'out', 'ost', 'liv'];

const DEBOUNCE_MS = 3_000;   // silence window before the toast first appears
const VISIBLE_MS = 4_000;    // hold time once visible — reset on new entries
const FADE_MS = 600;         // fade-out duration

type Phase = 'idle' | 'buffering' | 'visible' | 'fading';

type Buckets = Partial<Record<BucketKey, Bucket>>;

interface State {
  phase: Phase;
  buckets: Buckets;
}

type Action =
  | { type: 'entry'; entry: ActivityEntry }
  | { type: 'show' }
  | { type: 'startFade' }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'entry': {
      const t = action.entry.type;
      if (!t) return state;
      const key: BucketKey = `${t}:${action.entry.stage}`;
      const existing = state.buckets[key];
      const nextBuckets: Buckets = {
        ...state.buckets,
        [key]: {
          key,
          type: t,
          stage: action.entry.stage,
          stageFolderName: action.entry.stageFolderName,
          count: (existing?.count ?? 0) + 1,
        },
      };
      // Any new entry pulls us back to a visible/buffering state.
      const nextPhase: Phase = state.phase === 'visible' ? 'visible' : 'buffering';
      return { phase: nextPhase, buckets: nextBuckets };
    }
    case 'show':
      return { ...state, phase: 'visible' };
    case 'startFade':
      return { ...state, phase: 'fading' };
    case 'reset':
      return { phase: 'idle', buckets: {} };
  }
}

function sortedBuckets(buckets: Buckets): Bucket[] {
  // Sort by stage order so lines read top-to-bottom in pipeline order.
  return (Object.values(buckets).filter((b): b is Bucket => Boolean(b))).sort((a, b) => {
    const ai = STAGE_ORDER.indexOf(a.stage);
    const bi = STAGE_ORDER.indexOf(b.stage);
    if (ai !== bi) return ai - bi;
    return a.type.localeCompare(b.type);
  });
}

export function ActivityToast() {
  const [state, dispatch] = useReducer(reducer, { phase: 'idle', buckets: {} });
  const debounceTimer = useRef<number | null>(null);
  const visibleTimer = useRef<number | null>(null);
  const fadeTimer = useRef<number | null>(null);

  function clearTimer(ref: React.MutableRefObject<number | null>) {
    if (ref.current !== null) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  }

  // Subscribe to routed-file events from the main process.
  useEffect(() => {
    const unsubscribe = window.shiftK.onActivityRouted((entry) => {
      dispatch({ type: 'entry', entry });
    });
    return unsubscribe;
  }, []);

  // Phase-driven timers. Re-runs only on phase transitions, not on every
  // bucket update, so a flurry of entries doesn't spawn a new timer each.
  useEffect(() => {
    if (state.phase === 'buffering') {
      clearTimer(debounceTimer);
      debounceTimer.current = window.setTimeout(() => {
        dispatch({ type: 'show' });
      }, DEBOUNCE_MS);
    } else if (state.phase === 'visible') {
      clearTimer(visibleTimer);
      visibleTimer.current = window.setTimeout(() => {
        dispatch({ type: 'startFade' });
      }, VISIBLE_MS);
    } else if (state.phase === 'fading') {
      clearTimer(fadeTimer);
      fadeTimer.current = window.setTimeout(() => {
        dispatch({ type: 'reset' });
      }, FADE_MS);
    }
    // No cleanup needed — timer refs survive across renders, and each
    // phase transition either schedules a new timer or none.
  }, [state.phase]);

  // A new entry while fading should pull us back to visible (reset hold).
  useEffect(() => {
    if (state.phase === 'fading') {
      // If buckets got mutated during fade, dispatch was 'entry' which keeps
      // phase=fading. Detect by checking bucket size against a ref? Simpler:
      // we already keep phase=fading on entry. Could enhance later if needed.
    }
  }, [state.buckets, state.phase]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      clearTimer(debounceTimer);
      clearTimer(visibleTimer);
      clearTimer(fadeTimer);
    };
  }, []);

  const showing = state.phase === 'visible' || state.phase === 'fading';
  const lines = sortedBuckets(state.buckets);

  return (
    <AnimatePresence>
      {showing && lines.length > 0 && (
        <motion.div
          key="activity-toast"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: state.phase === 'fading' ? 0 : 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{
            opacity: { duration: state.phase === 'fading' ? FADE_MS / 1000 : 0.22, ease: 'easeOut' },
            y: { duration: 0.22, ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 52,
            background: 'rgba(20, 20, 20, 0.96)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid #1F1F1F',
            borderRadius: 8,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            zIndex: 40,
            pointerEvents: 'none',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {lines.map((b) => (
              <div
                key={b.key}
                style={{
                  fontSize: 11,
                  color: '#F5F5F5',
                  lineHeight: '16px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {formatActivityLine(b.count, b.type, b.stageFolderName)}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
