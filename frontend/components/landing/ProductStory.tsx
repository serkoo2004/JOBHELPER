import SurfaceCard from '../ui/SurfaceCard';

export default function ProductStory() {
  return (
    <section className="section-container pb-12">
      <SurfaceCard tone="glass" className="overflow-hidden rounded-[2rem] p-7 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-[1.8rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)]/72 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--accent)]">Why It Feels Different</p>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.5rem)] font-semibold text-[color:var(--text-primary)]">
              Klasik bir CV generator değil
            </h2>
            <p className="mt-4 text-sm leading-8 text-[color:var(--text-secondary)]">
              Farkı sadece güzel görünmesi değil. Profil, foto, AI review, version history ve export aynı akışta
              birleşiyor. Kullanıcı araç değil, profesyonel bir stüdyo deneyimine giriyor.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Recruiter View</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                  Hedef ilk 8 saniyede etki yaratmak. Arayüz ve output yüzeyleri buna göre kuruluyor.
                </p>
              </div>
              <div className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">AI Studio</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                  Smart template seçimi, warning kartları ve export zinciri artık aynı dille konuşuyor.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.8rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)]/80 p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_24%)]" />
            <div className="relative grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.45rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Draft Surface</p>
                <div className="mt-4 space-y-3">
                  <div className="h-3 w-40 rounded-full bg-[color:var(--text-primary)]/85" />
                  <div className="h-2 w-24 rounded-full bg-[color:var(--accent)]" />
                  <div className="h-2 w-full rounded-full bg-[color:var(--bg-tertiary)]" />
                  <div className="h-2 w-5/6 rounded-full bg-[color:var(--bg-tertiary)]" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.2rem] border border-transparent bg-[color:var(--warning-muted)] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--warning)]">Warnings</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                    Summary daha netleştirilebilir, experience içine metrik eklenebilir.
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Template Fit</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                    AI Smart, role ve profile göre en uygun premium aileyi seçer.
                  </p>
                </div>
                <div className="rounded-[1.2rem] border border-[var(--border-accent)] bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(6,182,212,0.08))] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--accent)]">Export Ready</p>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                    Finalize sonrası PDF, DOCX ve version geçmişi aynı zincirde kalır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>
    </section>
  );
}
