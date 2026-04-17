import type { ReactNode } from 'react';

import TopNav from './TopNav';
import SurfaceCard from './ui/SurfaceCard';
import Badge from './ui/Badge';

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export default function PageShell({ eyebrow, title, description, children, aside }: PageShellProps) {
  return (
    <main className="app-shell min-h-screen text-[color:var(--text-primary)]">
      <TopNav />
      <section className="section-container pb-16 pt-10">
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <SurfaceCard tone="glass" className="hero-gradient relative overflow-hidden rounded-[2rem] p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(37,99,235,0.14),transparent_24%)]" />
              <div className="relative">
                <Badge tone="accent">{eyebrow}</Badge>
                <h1 className="mt-5 text-[clamp(2.5rem,5vw,3.6rem)] font-semibold leading-tight">{title}</h1>
                <p className="mt-5 max-w-xl text-sm leading-8 text-[color:var(--text-secondary)] md:text-base">{description}</p>
              </div>
            </SurfaceCard>
            {aside}
          </div>

          <div>{children}</div>
        </div>
      </section>
    </main>
  );
}
