import AssetManager from '../../components/AssetManager';
import PageShell from '../../components/PageShell';

const aside = (
  <div className="soft-panel rounded-[2rem] p-6">
    <p className="eyebrow">
      <span className="eyebrow-dot" />
      Asset Layer
    </p>
    <div className="mt-5 space-y-3">
      {[
        'Fotograflar ve sablonlar urunun premium cikti kalitesini dogrudan etkiler.',
        'Bu alan daha sonra AI photo ve template engine ile baglanmaya hazir.',
        'Yuklenen dosyalar secilebilir kutuphane mantigiyla listelenir.',
      ].map((item) => (
        <div key={item} className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4 text-sm leading-7 text-[color:var(--text-secondary)]">
          {item}
        </div>
      ))}
    </div>
  </div>
);

export default function AssetsPage() {
  return (
    <PageShell
      eyebrow="Asset Manager"
      title="Fotograf ve sablon kutuphanesini ayni yerde yonet."
      description="Profil fotografi, vesikalik varyasyonlari ve CV sablonlarini tek merkezde tutarak daha sonra AI destekli export ve secim akislarina temel hazirlar."
      aside={aside}
    >
      <AssetManager />
    </PageShell>
  );
}
