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
    <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#08101bcc]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#9ff3d2,#7f8cff)] text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/10">
            CC
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-accent/80">AI Career Studio</p>
            <p className="text-base font-semibold text-white">Career Copilot</p>
          </div>
        </Link>

        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
                  active ? 'bg-white text-slate-950' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
