const logos = [
  "STRIPE", "LINEAR", "VERCEL", "NOTION", "FIGMA",
  "RAYCAST", "ARC", "FRAMER", "DESCRIPT", "PERPLEXITY"
];

export function LogoBar() {
  return (
    <section className="border-y border-[hsl(var(--border))] py-10 overflow-hidden">
      <div className="container-custom">
        <p className="label-mono text-center mb-6">Used by teams at</p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[hsl(var(--background))] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[hsl(var(--background))] to-transparent z-10" />
        <div className="marquee-track gap-16">
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={`${logo}-${i}`}
              className="font-heading text-2xl md:text-3xl font-medium tracking-tight text-[hsl(var(--muted-foreground))]/60 whitespace-nowrap"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
