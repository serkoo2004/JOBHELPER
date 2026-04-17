import SurfaceCard from '../ui/SurfaceCard';

const features = [
  ['Auto Draft', 'Stored profile üzerinden warning ve danışman notlarıyla draft üretir.'],
  ['Upload Analysis', 'Mevcut CV dosyasını parse edip güçlendirme sinyalleri çıkarır.'],
  ['Photo Studio', 'Yüklenen görseli template’e uygun profesyonel headshot akışına sokar.'],
  ['Application Ops', 'Belge üretimini başvuru pipeline takibiyle aynı ürün içinde toplar.'],
  ['Version History', 'Finalize edilen her resume sürümü geri dönülebilir şekilde saklanır.'],
  ['Admin Visibility', 'Sistem sağlığı, audit ve son üretim hareketleri ayrı yönetim yüzeyinde görünür.'],
];

export default function FeatureGrid() {
  return (
    <section className="section-container subsection-block">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--accent)]">Product Capabilities</p>
        <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-[color:var(--text-primary)]">
          Tekil araçlar değil, aynı dili konuşan bir career operating system
        </h2>
        <p className="mt-4 max-w-[65ch] text-[15px] leading-8 text-[color:var(--text-secondary)]">
          Ürün, CV üretimi etrafında büyüyen modülleri tek bir tasarım ve karar zincirine bağlıyor. Böylece deneyim
          parçalanmıyor.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map(([title, text]) => (
          <SurfaceCard key={title} className="group transition duration-300 hover:translate-y-[-3px] hover:shadow-[var(--shadow-md)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-sm font-bold text-white shadow-[var(--shadow-accent)]">
              {title.slice(0, 2).toUpperCase()}
            </div>
            <h3 className="mt-5 text-xl font-semibold text-[color:var(--text-primary)]">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{text}</p>
          </SurfaceCard>
        ))}
      </div>
    </section>
  );
}
