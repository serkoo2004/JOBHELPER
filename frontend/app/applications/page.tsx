import ApplicationTracker from '../../components/ApplicationTracker';
import PageShell from '../../components/PageShell';

const aside = (
  <div className="soft-panel rounded-[2rem] p-6">
    <p className="eyebrow">
      <span className="eyebrow-dot" />
      Ops View
    </p>
    <div className="mt-5 space-y-3">
      {[
        'Basvuru surecini da tek urun deneyiminin parcasi haline getirir.',
        'Sirket, rol, kaynak ve notlar bir arada tutulur.',
        'Mulakat ve teklif asamasi gibi sinyaller daha gorunur hale gelir.',
      ].map((item) => (
        <div key={item} className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4 text-sm leading-7 text-[color:var(--text-secondary)]">
          {item}
        </div>
      ))}
    </div>
  </div>
);

export default function ApplicationsPage() {
  return (
    <PageShell
      eyebrow="Application Tracker"
      title="CV uretilsin, basvuru da yonetilsin."
      description="Kariyer platformunun farki sadece belge uretmesi degil; gonderilen basvurulari, pipeline durumlarini ve sonraki adimlari da takip etmesi."
      aside={aside}
    >
      <ApplicationTracker />
    </PageShell>
  );
}
