import type { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'warning';
  className?: string;
};

const toneClasses = {
  default: 'border-[var(--border-soft)] bg-[color:var(--bg-primary)]/70 text-[color:var(--text-secondary)]',
  accent: 'border-[var(--border-accent)] bg-[color:var(--accent-muted)] text-[color:var(--accent)]',
  success: 'border-transparent bg-[color:var(--success-muted)] text-[color:var(--success)]',
  warning: 'border-transparent bg-[color:var(--warning-muted)] text-[color:var(--warning)]',
};

export default function Badge({ children, tone = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${toneClasses[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
