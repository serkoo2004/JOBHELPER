import type { ReactNode } from 'react';

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  tone?: 'glass' | 'soft';
};

export default function SurfaceCard({ children, className = '', tone = 'soft' }: SurfaceCardProps) {
  const toneClass = tone === 'glass' ? 'glass-panel' : 'soft-panel';
  return <div className={`${toneClass} rounded-[1.75rem] p-6 ${className}`.trim()}>{children}</div>;
}
