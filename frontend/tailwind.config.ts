import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#07111f',
        panel: '#0f172a',
        accent: '#60a5fa',
        ink: '#f8fafc',
        muted: '#94a3b8',
        line: 'rgba(255,255,255,0.1)',
        cyan: '#22d3ee',
        emerald: '#86efac',
      },
      boxShadow: {
        panel: '0 20px 80px rgba(2,6,23,0.28)',
        glow: '0 24px 90px rgba(96,165,250,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
