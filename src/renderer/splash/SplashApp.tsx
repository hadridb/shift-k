import React from 'react';
import { motion } from 'framer-motion';

/**
 * Splash — sober black card centred in a frameless transparent window.
 * Wordmark "SHIFT-K" (UPPERCASE, no underline) + tagline. 1.2 s total.
 *
 * Timing :
 *   0 ms     card fade-in (200 ms)
 *   200 ms   wordmark fade-in + tiny rise (400 ms)
 *   600 ms   tagline fade-in (300 ms)
 *   900 ms   ─ hold ─
 *   1000 ms  card fade-out begins (200 ms)
 *   1200 ms  main process destroys the window
 */
export function SplashApp() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
        transition={{
          opacity: { duration: 1.2, times: [0, 0.17, 0.83, 1], ease: 'easeInOut' },
          scale: { duration: 0.2, ease: 'easeOut' },
        }}
        style={{
          width: 360,
          height: 240,
          background: '#0A0A0A',
          borderRadius: 14,
          boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#F5F5F5',
            lineHeight: 1,
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          }}
        >
          SHIFT-K
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ duration: 0.3, delay: 0.6, ease: 'easeOut' }}
          style={{
            fontSize: 11,
            color: '#F5F5F5',
            letterSpacing: '0.06em',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          Workflow OS
        </motion.div>
      </motion.div>
    </div>
  );
}
