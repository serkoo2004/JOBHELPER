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
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 md:px-10 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-6">
            <div className="glass-panel relative overflow-hidden rounded-[2.4rem] p-7">
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
