'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './shared/ThemeToggle';
import Button from './ui/Button';
import Badge from './ui/Badge';

const links = [
  { href: '/', label: 'Studio' },
  { href: '/profile', label: 'Profil' },
  { href: '/cover-letter', label: 'On Yazi' },
  { href: '/applications', label: 'Takip' },
  { href: '/assets', label: 'Varliklar' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[color:var(--bg-primary)]/78 backdrop-blur-2xl">
      <div className="section-container flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-sm font-bold text-white shadow-[var(--shadow-accent)]">
            AC
            <span className="animate-pulse-soft absolute inset-0 rounded-[1rem] border border-white/20" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--accent)]">AI Career Studio</p>
            <p className="text-base font-semibold text-[color:var(--text-primary)]">Career Copilot</p>
          </div>
        </Link>

        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-full border border-[var(--border-soft)] bg-[color:var(--bg-primary)]/68 p-1 shadow-[var(--shadow-xs)]">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-[color:var(--text-primary)] text-[color:var(--bg-primary)] shadow-[var(--shadow-xs)]'
                    : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-hover)] hover:text-[color:var(--text-primary)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Badge tone="default">AI Review + Export</Badge>
          <ThemeToggle />
          <Button href="/profile" size="sm">
            Başla
          </Button>
        </div>
      </div>
    </nav>
  );
}
