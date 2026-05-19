import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ParticleBurst } from '@renderer/overlay/components/ParticleBurst';

/**
 * Dev-only playground for iterating on the ParticleBurst animation
 * without having to drop a real file in Downloads and wait for the
 * 3 s debounce + 4 s visible + 600 ms fade cycle of the toast.
 *
 * Accessible in dev at http://localhost:5173/particle-demo.html.
 * The HTML entry is registered in vite.config.ts; in a production
 * build it gets emitted to dist/renderer/ but is never referenced
 * by Electron — harmless dead weight.
 */
function ParticleDemo() {
  const [trigger, setTrigger] = useState(0);
  const [auto, setAuto] = useState(false);

  React.useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => setTrigger((n) => n + 1), 1200);
    return () => window.clearInterval(id);
  }, [auto]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        padding: 40,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.18em',
          color: 'var(--text-muted)',
        }}
      >
        PARTICLE BURST — DEV PLAYGROUND
      </div>

      {/* Burst stage — generous neutral background so particles read clearly */}
      <div
        style={{
          width: 160,
          height: 160,
          border: '1px dashed var(--border-subtle)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <ParticleBurst trigger={trigger} />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setTrigger((n) => n + 1)}
          style={{
            background: 'var(--accent)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: 6,
            padding: '10px 18px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Trigger burst
        </button>
        <button
          onClick={() => setAuto((a) => !a)}
          style={{
            background: auto ? 'var(--bg-elevated)' : 'transparent',
            color: auto ? 'var(--text-primary)' : 'var(--text-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            padding: '10px 18px',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          {auto ? 'Stop loop' : 'Loop ×1.2s'}
        </button>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-disabled)', marginTop: 8 }}>
        trigger sequence: {trigger}
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) createRoot(root).render(<ParticleDemo />);
