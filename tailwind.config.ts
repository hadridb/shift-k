import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/renderer/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        overlay: {
          bg: '#0A0A0A',
          divider: '#191919',
          hover: '#161616',
          inactive: '#9A9A9A',
          icon: '#666666',
        },
      },
    },
  },
  plugins: [],
};

export default config;
