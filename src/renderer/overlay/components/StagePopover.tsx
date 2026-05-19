import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Stage, StageLabels } from '@shared/types';
import { useEscapeClose } from '@renderer/hooks/useEscapeClose';

const STAGE_ORDER: Stage[] = ['src', 'img', 'out', 'ost', 'liv'];

interface Props {
  open: boolean;
  stages: StageLabels;
  activeStage: Stage;
  onSelect: (stage: Stage) => void;
  onClose: () => void;
}

export function StagePopover({ open, stages, activeStage, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEscapeClose(open, onClose);

  // Click-outside dismissal — listen at document while open.
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Defer one tick so the same click that opens the popover doesn't close it.
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.96, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          style={{
            // Opens UPWARD from the chevron, with scale-origin at the bottom
            // so the popover blooms out of the button rather than into it.
            // 44 px = StageBar height (40) + 4 px gap.
            position: 'absolute',
            bottom: 44,
            left: 8,
            zIndex: 50,
            transformOrigin: 'bottom left',
            background: '#0F0F0F',
            border: '1px solid #1F1F1F',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            padding: '4px 0',
            minWidth: 160,
            maxHeight: 200,
            overflowY: 'auto',
          }}
          role="menu"
        >
          {STAGE_ORDER.map((stage) => {
            const isActive = stage === activeStage;
            return (
              <button
                key={stage}
                role="menuitem"
                onClick={() => {
                  onSelect(stage);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 12px 8px 0',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: isActive ? '#FFFFFF' : '#9A9A9A',
                  fontSize: 12,
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                <span
                  style={{
                    width: 2,
                    height: 14,
                    marginLeft: 8,
                    marginRight: 10,
                    borderRadius: 1,
                    background: isActive ? '#FFFFFF' : 'transparent',
                  }}
                />
                {stages[stage]}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
