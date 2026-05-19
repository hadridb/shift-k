import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        overlay: 'overlay.html',
        settings: 'settings.html',
        onboarding: 'onboarding.html',
        splash: 'splash.html',
        // Dev-only playground for iterating on ParticleBurst. Registered
        // so Vite serves it at /particle-demo.html during `npm run dev`.
        // The production build still emits it, but Electron never loads it.
        'particle-demo': 'particle-demo.html',
      },
    },
  },
  base: './',
});
