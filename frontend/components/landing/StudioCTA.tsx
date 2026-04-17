import Button from '../ui/Button';

export default function StudioCTA() {
  return (
    <section className="section-container subsection-block pb-16">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-[var(--border-soft)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_14%,var(--bg-primary)),color-mix(in_srgb,var(--accent-2)_10%,var(--bg-primary)))] px-8 py-10 shadow-[var(--shadow-xl)] md:px-12 md:py-14">
        <div className="absolute right-[-4rem] top-[-4rem] h-40 w-40 rounded-full bg-[color:var(--accent)]/20 blur-3xl" />
        <div className="absolute left-[-3rem] bottom-[-3rem] h-36 w-36 rounded-full bg-[color:var(--accent-2)]/16 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--accent)]">Studio Ready</p>
          <h2 className="mt-5 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.02] text-[color:var(--text-primary)]">
            İlk 5 saniyede “bu ürün ciddiye alınmış” hissi veren yüzey
          </h2>
          <p className="mt-5 max-w-[60ch] text-base leading-8 text-[color:var(--text-secondary)]">
            Şimdi studio akışına girip auto draft, upload analyze ve template-aware output zincirini tek bir premium
            yüzeyde kullanabilirsin.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="#studio" size="lg">
              CV Studioya Git
            </Button>
            <Button href="/profile" variant="secondary" size="lg">
              Profili Düzenle
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
