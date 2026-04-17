'use client';

import { useTheme } from '../../hooks/useTheme';

const modes = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[color:var(--bg-primary)]/70 p-1 shadow-[var(--shadow-xs)] backdrop-blur">
      {modes.map((mode) => {
        const active = theme === mode.key;
        return (
          <button
            key={mode.key}
            type="button"
            onClick={() => setTheme(mode.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] transition ${
              active
                ? 'bg-[color:var(--text-primary)] text-[color:var(--bg-primary)] shadow-[var(--shadow-xs)]'
                : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)]'
            }`}
            aria-label={`${mode.label} tema`}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
