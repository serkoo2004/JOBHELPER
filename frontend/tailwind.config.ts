import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'var(--bg-app)',
        panel: 'var(--bg-primary)',
        accent: 'var(--accent)',
        ink: 'var(--text-primary)',
        muted: 'var(--text-muted)',
        line: 'var(--border-soft)',
        cyan: 'var(--accent-2)',
        emerald: 'var(--success)',
      },
      boxShadow: {
        panel: 'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
    },
  },
  plugins: [],
};

export default config;
