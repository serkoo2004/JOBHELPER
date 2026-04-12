import ApplicationTracker from '../../components/ApplicationTracker';
import PageShell from '../../components/PageShell';

const aside = (
  <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6">
    <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Ops View</p>
    <div className="mt-5 space-y-3">
      {[
        'Basvuru surecini da tek urun deneyiminin parcasi haline getirir.',
        'Sirket, rol, kaynak ve notlar bir arada tutulur.',
        'Mulakat ve teklif asamasi gibi sinyaller daha gorunur hale gelir.',
      ].map((item) => (
        <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
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
