'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#07111fd9] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#60a5fa,#22d3ee)] text-sm font-bold text-slate-950 shadow-glow">
            AC
            <span className="animate-pulse-soft absolute inset-0 rounded-2xl border border-white/20" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-accent/80">AI Career Studio</p>
            <p className="text-base font-semibold text-white">Career Copilot</p>
          </div>
        </Link>

        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  active
                    ? 'bg-white text-slate-950 shadow-[0_8px_24px_rgba(255,255,255,0.12)]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-slate-300">
            AI Review + Export
          </div>
          <Link
            href="/profile"
            className="rounded-full bg-[linear-gradient(135deg,#60a5fa,#22d3ee)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:opacity-90"
          >
            Basla
          </Link>
        </div>
      </div>
    </nav>
  );
}
