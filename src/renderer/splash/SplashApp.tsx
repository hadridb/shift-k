import React from 'react';
import { motion } from 'framer-motion';

/**
 * Splash content — wordmark + animated underline + tagline + fade-out.
 * Container is the full BrowserWindow (290×300, frameless, transparent).
 * Black rounded card centred inside paints `#0A0A0A`; the surrounding
 * pixels stay transparent (so the desktop shows through the rounded
 * corners — same identity as the overlay).
 *
 * Timing :
 *   0 ms     card fade-in (200 ms)
 *   200 ms   wordmark fade-in (300 ms)
 *   400 ms   underline draws left → right (400 ms ease-out)
 *   700 ms   tagline fade-in (300 ms)
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
          gap: 14,
          paddingTop: 16,
        }}
      >
        {/* Wordmark with animated underline beneath "shift" */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: 'easeOut' }}
          style={{ position: 'relative' }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#F5F5F5',
              lineHeight: 1,
              fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            }}
          >
            shift-k
          </span>
          {/* Underline draws left → right under "shift" (not the whole word) */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute',
              left: 0,
              bottom: -4,
              // Underline only the "shift" part — approx 60 % of wordmark width.
              width: '58%',
              height: 2,
              background: '#FFFFFF',
              transformOrigin: 'left center',
              borderRadius: 1,
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 0.3, delay: 0.7, ease: 'easeOut' }}
          style={{
            fontSize: 12,
            color: '#F5F5F5',
            letterSpacing: '0.04em',
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          Le workflow OS pour les directeurs IA
        </motion.div>
      </motion.div>
    </div>
  );
}
