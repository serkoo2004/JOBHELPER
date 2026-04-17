import ResumeBuilder from '../components/ResumeBuilder';
import TopNav from '../components/TopNav';

const pillars = [
  {
    title: 'Career Understanding',
    text: 'Sistem önce kullanıcıyı ve hedef rolü anlamaya çalışır. Çıktı üretmek ilk adım değil, son adımdır.',
  },
  {
    title: 'AI Editorial Layer',
    text: 'CV, ön yazı ve başvuru dili körü körüne yazılmaz; danışman mantığıyla yeniden kurulur.',
  },
  {
    title: 'Versioned Output',
    text: 'Draft, warnings, version history ve export aynı ürün zincirine bağlanır.',
  },
];

const flow = [
  'Kayıtlı profil + deneyim + foto veri tabanından alınır',
  'AI güçlü ve zayıf alanları inceler',
  'Template seçilmezse smart mode karar verir',
  'Draft, warnings ve export-ready yapı oluşur',
];

const products = [
  'Auto Draft + canlı uyarılar',
  'CV upload analizi',
  'Template-aware export',
  'Foto profesyonelleştirme',
  'Başvuru takibi ve koçluk',
  'AI session history',
];

export default function Home() {
  return (
    <main className="min-h-screen bg-surface text-white">
      <TopNav />

      <section className="mx-auto max-w-7xl px-6 pb-12 pt-10 md:px-10 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel relative overflow-hidden rounded-[2.8rem] p-8 md:p-10">
            <div className="animate-drift absolute right-[-3rem] top-[-2rem] h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
            <div className="animate-drift absolute bottom-[-2rem] left-10 h-36 w-36 rounded-full bg-accent/25 blur-3xl" />
            <div className="absolute inset-0 grid-overlay opacity-15" />

            <div className="relative">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-cyan">
                AI Career Studio
                <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">Backend-first</span>
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.95] text-white md:text-7xl">
                CV üretmekten fazlası.
                <span className="mt-2 block text-cyan"> Kariyerini birlikte kurgulayan </span>
                premium bir AI copilot.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Bu deneyim form doldurtan klasik araç gibi davranmıyor. Önce seni okuyor, sonra eksikleri gösteriyor,
                sonra belgeyi kuruyor. Backend artık bu mantığı gerçekten taşıyor; arayüz de bunu hissettirmek için tasarlandı.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#studio"
                  className="rounded-full bg-[linear-gradient(135deg,#60a5fa,#22d3ee)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:opacity-90"
                >
                  Studioyu Aç
                </a>
                <a
                  href="/applications"
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/10"
                >
                  Takip Alanı
                </a>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {pillars.map((item) => (
                  <div key={item.title} className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
                    <p className="text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="glass-panel rounded-[2.3rem] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Backend Intelligence</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">Üretimden önce gelen düşünme katmanı</h2>
              <div className="mt-6 space-y-3">
                {flow.map((item, index) => (
                  <div key={item} className="animate-float rounded-[1.35rem] border border-white/10 bg-[#0a1324]/90 p-4 text-sm leading-7 text-slate-200" style={{ animationDelay: `${index * 0.7}s` }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2.3rem] p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Platform Surface</p>
                  <h2 className="mt-4 text-2xl font-semibold text-white">Artık tek ürün hissi var</h2>
                </div>
                <div className="rounded-full border border-emerald/30 bg-emerald/10 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-emerald">
                  Live
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {products.map((item) => (
                  <div key={item} className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 md:px-10 lg:px-8">
        <div className="glass-panel overflow-hidden rounded-[2.6rem] p-7 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[2rem] border border-white/10 bg-[#0b1424]/85 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan/80">Why It Feels Different</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">Klasik bir CV generator değil</h2>
              <p className="mt-4 text-sm leading-8 text-slate-300">
                Ürünün farkı sadece şık görünmesi değil. Profil, photo, AI review, version history ve export aynı
                akışta birleşiyor. Kullanıcı belge üreten bir makineye değil, profesyonel bir stüdyo deneyimine giriyor.
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">Recruiter View</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">
                    Hedef ilk 8 saniyede etki yaratmak. Arayüz de bunu hissettiriyor; output yüzeyleri hızlı ve net taranıyor.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">AI Studio</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">
                    Smart template seçimi, warning kartları ve versiyon mantığı artık landing’den itibaren ürün diliyle anlatılıyor.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,14,26,0.96),rgba(12,20,34,0.98))] p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.15),transparent_24%)]" />
              <div className="relative grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.6rem] border border-white/10 bg-[#08101b]/95 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">Draft Surface</p>
                  <div className="mt-4 space-y-3">
                    <div className="h-3 w-40 rounded-full bg-white/80" />
                    <div className="h-2 w-24 rounded-full bg-cyan" />
                    <div className="h-2 w-full rounded-full bg-white/10" />
                    <div className="h-2 w-5/6 rounded-full bg-white/10" />
                    <div className="grid grid-cols-2 gap-3 pt-3">
                      <div className="rounded-[1.2rem] bg-white/5 p-4">
                        <div className="h-2 w-16 rounded-full bg-white/60" />
                        <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                        <div className="mt-2 h-2 w-4/5 rounded-full bg-white/10" />
                      </div>
                      <div className="rounded-[1.2rem] bg-white/5 p-4">
                        <div className="h-2 w-14 rounded-full bg-white/60" />
                        <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                        <div className="mt-2 h-2 w-3/5 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">Warnings</p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">Summary daha netleştirilebilir, experience metric eklenebilir.</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">Template Fit</p>
                    <p className="mt-3 text-sm leading-7 text-slate-200">AI Smart, profile ve role göre en uygun premium aileyi seçer.</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(255,255,255,0.04))] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#c8fbff]">Export Ready</p>
                    <p className="mt-3 text-sm leading-7 text-slate-100">Finalize sonrası PDF, DOCX ve version geçmişi aynı zincirde kalıyor.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="studio" className="mx-auto max-w-7xl px-6 pb-16 md:px-10 lg:px-8">
        <ResumeBuilder />
      </section>
    </main>
  );
}
