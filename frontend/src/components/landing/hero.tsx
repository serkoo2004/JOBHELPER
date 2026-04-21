import Link from "next/link";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10 hero-bg opacity-70" />
      <div className="absolute inset-0 -z-10 grid-pattern opacity-40" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[600px] bg-gradient-to-b from-transparent via-transparent to-[hsl(var(--background))]" />

      <div className="container-custom relative">
        <div className="max-w-4xl animate-slide-up">
          <div>
            <Badge variant="outline" dot className="mb-6">
              <Sparkles className="h-3 w-3" />
              <span>Now with AI draft review & multi-template exports</span>
            </Badge>
          </div>

          <h1
            className="font-heading text-display-xl font-medium text-balance text-[hsl(var(--foreground))]"
            data-testid="hero-title"
          >
            The career
            <br />
            <span className="italic font-normal text-[hsl(var(--muted-foreground))]">
              operating system.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg md:text-xl text-[hsl(var(--muted-foreground))] leading-relaxed">
            Build tailored resumes, letters, and interview prep with an AI that reads the room — not
            just your profile. 9 premium templates. Live reviewer. One click export.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="group">
              <Link href="/sign-up" data-testid="hero-cta-primary">
                Start for free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#how-it-works" data-testid="hero-cta-secondary">
                <Play className="h-3.5 w-3.5" />
                Watch 60s tour
              </a>
            </Button>
          </div>

          <div className="mt-14 flex items-center gap-6 text-xs text-[hsl(var(--muted-foreground))]">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-7 w-7 rounded-full border-2 border-[hsl(var(--background))] bg-gradient-to-br from-[hsl(var(--surface-elevated))] to-[hsl(var(--muted))]"
                />
              ))}
            </div>
            <span className="label-mono">Trusted by 12,000+ operators worldwide</span>
          </div>
        </div>

        {/* Product mock */}
        <div className="mt-20 md:mt-28 relative animate-fade-in">
          <div className="absolute inset-x-10 -inset-y-10 -z-10 halo" />
          <div className="glass-strong rounded-2xl overflow-hidden border border-[hsl(var(--border))] shadow-xl">
            <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] px-4 h-10">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--muted-foreground))]/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--muted-foreground))]/30" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--muted-foreground))]/30" />
              </div>
              <span className="label-mono mx-auto">career-copilot.app/studio</span>
            </div>
            <div className="grid grid-cols-12 gap-0 min-h-[360px] md:min-h-[460px]">
              <div className="col-span-3 border-r border-[hsl(var(--border))] p-5 space-y-3">
                {["Home", "Profile", "Resume Studio", "Cover Letter", "Applications", "Coach"].map(
                  (label, i) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 text-sm py-1.5 ${
                        i === 2 ? "text-[hsl(var(--foreground))]" : "text-[hsl(var(--muted-foreground))]"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {label}
                    </div>
                  )
                )}
              </div>
              <div className="col-span-9 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="label-mono">Draft · v2.3</div>
                    <div className="font-heading text-xl mt-1">Senior Product Engineer — Acme</div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="success" dot>Live review</Badge>
                    <Badge variant="mono">ATS score 94</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-2.5 rounded-full skeleton"
                      style={{ width: `${92 - i * 8}%` }}
                    />
                  ))}
                </div>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {["Modern Sidebar", "Executive Grid", "Minimal ATS"].map((t, i) => (
                    <div
                      key={t}
                      className={`rounded-lg border p-3 text-xs ${
                        i === 1
                          ? "border-[hsl(var(--foreground))] bg-[hsl(var(--accent))]"
                          : "border-[hsl(var(--border))]"
                      }`}
                    >
                      <div className="aspect-[3/4] rounded bg-[hsl(var(--muted))] mb-2" />
                      <div className="truncate">{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
