import CoverLetterBuilder from '../../components/CoverLetterBuilder';
import PageShell from '../../components/PageShell';

const aside = (
  <div className="rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6">
    <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Writing Goal</p>
    <div className="mt-5 space-y-3">
      {[
        'CV tekrarina dusmeden role uygun deger teklifini acikla.',
        'Sirket adini, pozisyonu ve motivasyonu dogru dengele.',
        'Kullanima hazir ama gerekli oldugunda hizla duzenlenebilir bir cikti ver.',
      ].map((item) => (
        <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
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
