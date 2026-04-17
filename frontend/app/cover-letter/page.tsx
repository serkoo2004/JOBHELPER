import CoverLetterBuilder from '../../components/CoverLetterBuilder';
import PageShell from '../../components/PageShell';

const aside = (
  <div className="soft-panel rounded-[2rem] p-6">
    <p className="eyebrow">
      <span className="eyebrow-dot" />
      Writing Goal
    </p>
    <div className="mt-5 space-y-3">
      {[
        'CV tekrarina dusmeden role uygun deger teklifini acikla.',
        'Sirket adini, pozisyonu ve motivasyonu dogru dengele.',
        'Kullanima hazir ama gerekli oldugunda hizla duzenlenebilir bir cikti ver.',
      ].map((item) => (
        <div key={item} className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4 text-sm leading-7 text-[color:var(--text-secondary)]">
          {item}
        </div>
      ))}
    </div>
  </div>
);

export default function CoverLetterPage() {
  return (
    <PageShell
      eyebrow="Cover Letter"
      title="Genel degil, role ve sirkete oturan on yazilar."
      description="Bu modul sirf paragraf uretmez. Basvuru rolune, ilandaki ihtiyaca ve senin profil guclerine gore daha ikna edici bir ilk temas metni kurar."
      aside={aside}
    >
      <CoverLetterBuilder />
    </PageShell>
  );
}
