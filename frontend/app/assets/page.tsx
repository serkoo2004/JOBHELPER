import AssetManager from '../../components/AssetManager';
import PageShell from '../../components/PageShell';

const aside = (
  <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6">
    <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Asset Layer</p>
    <div className="mt-5 space-y-3">
      {[
        'Fotograflar ve sablonlar urunun premium cikti kalitesini dogrudan etkiler.',
        'Bu alan daha sonra AI photo ve template engine ile baglanmaya hazir.',
        'Yuklenen dosyalar secilebilir kutuphane mantigiyla listelenir.',
      ].map((item) => (
        <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
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
