import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#12141f',
        panel: '#181c2c',
        accent: '#6b72ff',
      },
      boxShadow: {
        panel: '0 20px 80px rgba(0,0,0,0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
