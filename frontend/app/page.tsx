import ResumeBuilder from '../components/ResumeBuilder';
import TopNav from '../components/TopNav';

const metrics = [
  { value: 'ATS+', label: 'Role-aware structure' },
  { value: '4X', label: 'Stronger first impression' },
  { value: '1 Hub', label: 'CV, cover letter, tracker' },
];

const advisorNotes = [
  'Summary bolumunu role gore sivrilt.',
  'Deneyim maddelerine etki ve kapsam ekle.',
  'Basvuru sonrasi aksiyonlari tek panelde tut.',
];

const panels = [
  {
    title: 'Career Intake',
    text: 'Kullanici hedef rolunu, deneyim seviyesini ve basvuru ulkesini sohbette netlestirir.',
  },
  {
    title: 'Live Rewrite',
    text: 'AI zayif cumleleri guclu ama gercekci versiyonlara cevirir ve ATS uyumunu korur.',
  },
  {
    title: 'Application Flow',
    text: 'CV, on yazi ve sonraki adimlar ayni platform deneyimine baglanir.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-surface text-white">
      <TopNav />

      <section className="mx-auto max-w-7xl px-6 pb-12 pt-10 md:px-10">
        <div className="grid gap-8 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(12,18,30,0.97),rgba(6,10,18,0.98))] p-8 shadow-[0_45px_140px_rgba(0,0,0,0.42)] md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(159,243,210,0.18),transparent_23%),radial-gradient(circle_at_78%_0%,rgba(124,132,255,0.16),transparent_28%),linear-gradient(180deg,transparent,rgba(255,255,255,0.03))]" />
            <div className="absolute right-[-4rem] top-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute bottom-[-3rem] left-16 h-32 w-32 rounded-full bg-[#9ff3d2]/20 blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.34em] text-accent/85">
                AI Career Copilot
                <span className="rounded-full bg-white/10 px-2 py-1 tracking-[0.2em] text-white">Premium</span>
              </div>

              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[0.96] text-white md:text-7xl">
                Sadece guzel gorunen degil,
                <span className="mt-2 block text-[#c8ffef]"> ise alinmaya yardim eden </span>
                kariyer deneyimi.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Bu platform CV ureten bir form degil. Seni anlayan, eksikleri gosteren, daha guclu bir
                hikaye kuran ve basvuru surecini yoneten bir AI kariyer studiousu.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#studio"
                  className="rounded-full bg-[#9ff3d2] px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-white"
                >
                  Studioyu Baslat
                </a>
                <a
                  href="/applications"
                  className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/10"
                >
                  Takip Paneli
                </a>
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {metrics.map((item) => (
                  <div key={item.label} className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
                    <p className="text-3xl font-semibold text-white">{item.value}</p>
                    <p className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-300">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(14,19,33,0.98),rgba(7,11,21,0.98))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Advisor Feed</p>
                  <h2 className="mt-3 text-2xl font-semibold">Canli yonlendirme hissi</h2>
                </div>
                <div className="rounded-full border border-[#9ff3d2]/30 bg-[#9ff3d2]/10 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#9ff3d2]">
                  Active
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {advisorNotes.map((note, index) => (
                  <div
                    key={note}
                    className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200 animate-float"
                    style={{ animationDelay: `${index * 0.8}s` }}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,25,41,0.96),rgba(8,12,22,0.98))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.3)]">
              <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Product Architecture</p>
              <div className="mt-5 space-y-4">
                {panels.map((panel) => (
                  <div key={panel.title} className="rounded-[1.5rem] border border-white/10 bg-[#0d1423] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-white">{panel.title}</h3>
                      <span className="h-2.5 w-2.5 rounded-full bg-[#9ff3d2]" />
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{panel.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 md:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,23,0.98),rgba(13,20,34,0.96))] p-7 shadow-[0_35px_120px_rgba(0,0,0,0.32)]">
            <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Experience Map</p>
            <h2 className="mt-4 text-3xl font-semibold">Landing sayfasi artik sadece tanitim degil, urun hissi veriyor</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-slate-300">
              Hero alanindan itibaren AI danismanligi, ATS bilinci ve basvuru operasyonu bir arada hissettiriliyor.
              Ama amac sadece havali gorunmek degil; kullaniciyi dogrudan aksiyona sokmak.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-accent/75">CV Builder</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Sifirdan uretme ve mevcut CV analizini ayni akista sunar.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-accent/75">Cover Letter</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Sirket ve role gore farkli tonlarda kullanima hazir yazi olusturur.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-accent/75">Application Tracker</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Basvuru, not, durum ve sonraki aksiyonlari tek panelde tutar.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-accent/75">AI Skills</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Skill markdownlari artik sistemin varsayilan davranislarini yonlendiriyor.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(160deg,rgba(14,21,36,0.98),rgba(6,10,18,0.98))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.38)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(159,243,210,0.15),transparent_25%)]" />
            <div className="relative grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.9rem] border border-white/10 bg-[#0c1220]/90 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-accent/80">Recruiter Preview</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Ilk 8 saniyede ne gorunuyor?</h3>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">Preview</span>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-3 w-40 rounded-full bg-white/90" />
                  <div className="h-2 w-24 rounded-full bg-[#9ff3d2]" />
                  <div className="h-2 w-full rounded-full bg-white/15" />
                  <div className="h-2 w-5/6 rounded-full bg-white/15" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-[1.2rem] bg-white/5 p-4">
                      <div className="h-2 w-20 rounded-full bg-white/70" />
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                      <div className="mt-2 h-2 w-4/5 rounded-full bg-white/10" />
                    </div>
                    <div className="rounded-[1.2rem] bg-white/5 p-4">
                      <div className="h-2 w-16 rounded-full bg-white/70" />
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
                      <div className="mt-2 h-2 w-3/5 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.7rem] border border-white/10 bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-accent/80">ATS Signal</p>
                  <p className="mt-3 text-3xl font-semibold text-white">82%</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Role alignment ve keyword coverage iyi, deneyim maddeleri daha da guclendirilebilir.</p>
                </div>
                <div className="rounded-[1.7rem] border border-white/10 bg-white/6 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-accent/80">Next Move</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Son iki deneyim maddesine metrik ve teknik kapsam eklendiginde profil daha ikna edici olacak.
                  </p>
                </div>
                <div className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(135deg,rgba(159,243,210,0.15),rgba(255,255,255,0.02))] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#baffe9]">Application Pulse</p>
                  <p className="mt-3 text-sm leading-7 text-slate-100">
                    4 aktif basvuru, 1 mulakat asamasi, 2 takip emaili icin zaman geldi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="studio" className="mx-auto max-w-7xl px-6 pb-16 md:px-10">
        <ResumeBuilder />
      </section>
    </main>
  );
}
