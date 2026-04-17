import PageShell from '../../components/PageShell';
import ProfileBuilder from '../../components/ProfileBuilder';

const aside = (
  <div className="soft-panel rounded-[2rem] p-6">
    <p className="eyebrow">
      <span className="eyebrow-dot" />
      Why It Matters
    </p>
    <div className="mt-5 space-y-3">
      {[
        'Bu profil, tum AI ciktilarinin ortak kaynagidir.',
        'Hedef rol ve ozet ne kadar netse CV ve on yazi o kadar guclu olur.',
        'Ayni veriyle ilerlemek urun icinde tutarlilik saglar.',
      ].map((item) => (
        <div key={item} className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4 text-sm leading-7 text-[color:var(--text-secondary)]">
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
