import Button from '../ui/Button';
import SurfaceCard from '../ui/SurfaceCard';

const pillars = [
  {
    title: 'Career Understanding',
    text: 'Sistem önce kullanıcıyı ve hedef rolü anlıyor; üretim ondan sonra geliyor.',
  },
  {
    title: 'AI Editorial Layer',
    text: 'CV ve output kör kopya değil, danışman gözüyle yeniden kurgulanıyor.',
  },
  {
    title: 'Versioned Output',
    text: 'Draft, warning, finalize ve export tek ürün zincirinde ilerliyor.',
  },
];

export default function HeroSection() {
  return (
    <section className="section-container section-block pb-12">
      <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="hero-gradient glass-panel relative overflow-hidden rounded-[2.25rem] p-8 md:p-10">
          <div className="animate-drift absolute right-[-3rem] top-[-2rem] h-40 w-40 rounded-full bg-[color:var(--accent)]/15 blur-3xl" />
          <div className="animate-drift absolute bottom-[-2rem] left-10 h-36 w-36 rounded-full bg-[color:var(--accent-2)]/15 blur-3xl" />
          <div className="grid-overlay absolute inset-0 opacity-20" />

          <div className="relative">
            <div className="fade-up">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                AI Career Studio
              </span>
            </div>

            <h1 className="fade-up fade-delay-1 mt-8 max-w-4xl font-[600] leading-[0.92] text-[clamp(3rem,7vw,4.8rem)] text-[color:var(--text-primary)]">
              CV üreten değil,
              <span className="text-gradient mt-2 block">kariyer aklını kuran</span>
              premium bir product studio.
            </h1>

            <p className="fade-up fade-delay-2 mt-6 max-w-[65ch] text-[clamp(1rem,1.8vw,1.1rem)] leading-8 text-[color:var(--text-secondary)]">
              Bu deneyim klasik bir form ekranı değil. Profil, belge, fotoğraf, template ve export akışını tek bir
              profesyonel üretim yüzeyinde birleştiriyor.
            </p>

            <div className="fade-up fade-delay-3 mt-10 flex flex-wrap gap-4">
              <Button href="#studio" size="lg">
                Studioyu Aç
              </Button>
              <Button href="/applications" variant="secondary" size="lg">
                Pipeline Gör
              </Button>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {pillars.map((item) => (
                <SurfaceCard key={item.title} tone="glass" className="p-5">
                  <p className="text-lg font-semibold text-[color:var(--text-primary)]">{item.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{item.text}</p>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <SurfaceCard tone="glass" className="p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--accent)]">Backend Intelligence</p>
            <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold text-[color:var(--text-primary)]">
              Önce anlar, sonra üretir
            </h2>
            <div className="mt-6 space-y-3">
              {[
                'Kayıtlı profil + deneyim + foto veri tabanından alınır',
                'AI güçlü ve zayıf alanları analiz eder',
                'Template seçilmezse smart mode karar verir',
                'Draft, warning ve export-ready çıktı oluşur',
              ].map((item, index) => (
                <div
                  key={item}
                  className="animate-float rounded-[1.2rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)]/70 p-4 text-sm leading-7 text-[color:var(--text-secondary)]"
                  style={{ animationDelay: `${index * 0.7}s` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard tone="glass" className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--accent)]">Platform Surface</p>
                <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.2rem)] font-semibold text-[color:var(--text-primary)]">
                  Tek ürün hissi
                </h2>
              </div>
              <span className="rounded-full border border-[var(--border-soft)] bg-[color:var(--success-muted)] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--success)]">
                Live
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Auto Draft + canlı warning',
                'Upload analizi',
                'Template-aware export',
                'Foto profesyonelleştirme',
                'Başvuru takibi',
                'AI session history',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)]/62 px-4 py-4 text-sm text-[color:var(--text-secondary)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </section>
  );
}
