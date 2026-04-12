import PageShell from '../../components/PageShell';
import ProfileBuilder from '../../components/ProfileBuilder';

const aside = (
  <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6">
    <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Why It Matters</p>
    <div className="mt-5 space-y-3">
      {[
        'Bu profil, tum AI ciktilarinin ortak kaynagidir.',
        'Hedef rol ve ozet ne kadar netse CV ve on yazi o kadar guclu olur.',
        'Ayni veriyle ilerlemek urun icinde tutarlilik saglar.',
      ].map((item) => (
        <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
          {item}
        </div>
      ))}
    </div>
  </div>
);

export default function ProfilePage() {
  return (
    <PageShell
      eyebrow="Profile System"
      title="Kariyer profilini bir kez kur, tum akislar onu kullansin."
      description="Bu sayfa sadece veri giris ekrani degil. CV builder, on yazi ve takip modullerinin hepsine yon veren merkezi kariyer kimligi burada olusur."
      aside={aside}
    >
      <ProfileBuilder />
    </PageShell>
  );
}
