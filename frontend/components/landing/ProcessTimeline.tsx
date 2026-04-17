const steps = [
  ['01', 'Profil çekilir', 'Kayıtlı veriler, deneyimler, projeler ve fotoğraf doğrudan sistem tarafından okunur.'],
  ['02', 'AI editorial review', 'Eksikler, zayıf alanlar ve fırsatlar danışman mantığıyla analiz edilir.'],
  ['03', 'Draft + warning oluşur', 'Kullanıcıya sadece düzenlemesi gereken yerler öne çıkarılır.'],
  ['04', 'Finalize + export', 'Onay sonrası sürüm kaydedilir ve PDF/DOCX çıktısı alınır.'],
];

export default function ProcessTimeline() {
  return (
    <section className="section-container subsection-block">
      <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--accent)]">How It Works</p>
          <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[color:var(--text-primary)]">
            Akış, kullanıcıya yük bindirmeden ilerliyor
          </h2>
          <p className="mt-4 max-w-[60ch] text-sm leading-8 text-[color:var(--text-secondary)]">
            Hedef kullanıcıdan prompt yazmasını beklemek değil. Sistem bilgiyi kendi bağlamında okuyup, gerekli yerde
            görünür uyarı veriyor.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map(([number, title, text]) => (
            <div key={number} className="relative rounded-[1.75rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)]/86 p-6 shadow-[var(--shadow-sm)]">
              <div className="absolute left-6 top-0 h-full w-px bg-[linear-gradient(180deg,var(--border-accent),transparent)]" />
              <div className="relative pl-8">
                <div className="absolute left-[-8px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-xs font-bold text-white shadow-[var(--shadow-accent)]">
                  {number}
                </div>
                <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
