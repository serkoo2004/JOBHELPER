import type { ReactNode } from 'react';

import TopNav from './TopNav';

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export default function PageShell({ eyebrow, title, description, children, aside }: PageShellProps) {
  return (
    <main className="min-h-screen bg-surface text-white">
      <TopNav />
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:px-10">
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(155deg,rgba(14,20,33,0.98),rgba(6,10,18,0.98))] p-7 shadow-[0_35px_120px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(159,243,210,0.16),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(127,140,255,0.14),transparent_24%)]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.34em] text-accent/80">{eyebrow}</p>
                <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>
                <p className="mt-5 max-w-xl text-sm leading-8 text-slate-300 md:text-base">{description}</p>
              </div>
            </div>
            {aside}
          </div>

          <div>{children}</div>
        </div>
      </section>
    </main>
  );
}
