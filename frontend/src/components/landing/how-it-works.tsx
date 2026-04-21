const steps = [
  {
    n: "01",
    title: "Pour your story in",
    desc: "Upload an existing CV or answer a guided flow. We extract skills, experiences, and tone."
  },
  {
    n: "02",
    title: "AI reviews, warns, decides",
    desc: "It thinks like an editor. Flags weak phrasing, picks the best template, rebalances sections."
  },
  {
    n: "03",
    title: "Export. Apply. Track.",
    desc: "One click PDF/DOCX. Multi-version history. Per-application coaching from a single inbox."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 border-t border-[hsl(var(--border))]">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="label-mono mb-4">02 — Flow</div>
            <h2 className="font-heading text-display-md font-medium text-balance">
              Three moves. <br />
              <span className="text-[hsl(var(--muted-foreground))]">Offer in hand.</span>
            </h2>
            <p className="mt-6 text-[hsl(var(--muted-foreground))] leading-relaxed max-w-md">
              No prompts to babysit. No empty forms. The system asks only what it needs — and keeps
              every decision traceable.
            </p>
          </div>

          <div className="md:col-span-7 relative">
            <div className="absolute left-[22px] top-6 bottom-6 w-px bg-[hsl(var(--border))] md:left-[26px]" />
            <div className="space-y-10">
              {steps.map((s) => (
                <div key={s.n} className="relative pl-16">
                  <div className="absolute left-0 top-0 h-12 w-12 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] flex items-center justify-center font-mono text-xs tracking-wider">
                    {s.n}
                  </div>
                  <h3 className="font-heading text-2xl font-medium leading-tight">{s.title}</h3>
                  <p className="mt-3 text-[hsl(var(--muted-foreground))] leading-relaxed max-w-lg">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
