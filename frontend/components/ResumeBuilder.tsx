'use client';

import { FormEvent, useMemo, useState } from 'react';

import { apiFetch } from '../lib/api';
import type {
  ResumeDraftResponse,
  ResumeResponse,
  ResumeTemplateOption,
} from '../lib/types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import SurfaceCard from './ui/SurfaceCard';

type BuildMode = 'auto' | 'upload';

const templateFallbacks: ResumeTemplateOption[] = [
  { key: 'smart', name: 'AI Smart', description: 'Profil ve role göre otomatik seçim.', layout_hint: 'AI kendi karar verir.' },
  { key: 'modern_sidebar', name: 'Modern Sidebar', description: 'Teknik ve hızlı taranan premium düzen.', layout_hint: 'Sidebar ağırlıklı.' },
  { key: 'executive_grid', name: 'Executive Grid', description: 'Kurumsal ve üst düzey görünüm.', layout_hint: 'Dengeli grid.' },
  { key: 'royal_timeline', name: 'Royal Timeline', description: 'Fotoğraflı güçlü premium akış.', layout_hint: 'Timeline hissi.' },
  { key: 'onyx_accent', name: 'Onyx Accent', description: 'Koyu panel ve iddialı modern görünüm.', layout_hint: 'Vurgulu dark panel.' },
];

const quickChecks = [
  'Kayıtlı profil verisini kullanır',
  'Eksik alanları uyarı olarak döndürür',
  'Template seçmezsen AI karar verir',
  'Fotoğraf varsa otomatik CV-ready hale getirir',
];

export default function ResumeBuilder() {
  const [mode, setMode] = useState<BuildMode>('auto');
  const [profileId, setProfileId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [template, setTemplate] = useState('smart');
  const [cvGoal, setCvGoal] = useState('Premium üst düzey firma başvurusu');
  const [visualPreferences, setVisualPreferences] = useState('Koyu lacivert başlıklar, premium görünüm, sade ama güçlü.');
  const [optimizationTarget, setOptimizationTarget] = useState('ATS uyumu');
  const [templates, setTemplates] = useState<ResumeTemplateOption[]>(templateFallbacks);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Profil bağlıysa tek generate ile draft üretmeye hazırım.');
  const [draft, setDraft] = useState<ResumeDraftResponse | null>(null);
  const [analysis, setAnalysis] = useState<ResumeResponse | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const activeResult = draft ?? analysis;

  const selectedTemplateMeta = useMemo(
    () => templates.find((item) => item.key === template),
    [template, templates],
  );

  const fieldClass =
    'w-full rounded-[1.2rem] border border-[var(--border-medium)] bg-[color:var(--bg-primary)] px-4 py-3 text-[color:var(--text-primary)] outline-none transition focus:border-[var(--border-accent)] focus:bg-[color:var(--bg-secondary)]';

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const data = await apiFetch<ResumeTemplateOption[]>('/resumes/templates');
      setTemplates([{ key: 'smart', name: 'AI Smart', description: 'Profil ve role göre otomatik seçim.', layout_hint: 'AI kendi karar verir.' }, ...data]);
    } catch {
      setTemplates(templateFallbacks);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleAutoDraft = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setAnalysis(null);
    setStatus('Kayıtlı profil taranıyor, AI danışman notları hazırlanıyor ve draft oluşturuluyor...');

    try {
      const data = await apiFetch<ResumeDraftResponse>('/resumes/auto-draft', {
        method: 'POST',
        body: {
          profile_id: profileId,
          template,
          tone: 'professional',
          target_role: targetRole || undefined,
          auto_professionalize_photo: true,
          generation_context: {
            cv_goal: cvGoal,
            visual_preferences: visualPreferences,
            optimization_target: optimizationTarget,
          },
        },
      });
      setDraft(data);
      setStatus('Draft hazır. Warning kartlarına bakıp düzenleme ekranını bir sonraki adımda bağlayabiliriz.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Auto draft üretilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAnalyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uploadFile) {
      setStatus('Önce analiz etmek istediğin CV dosyasını seç.');
      return;
    }

    setLoading(true);
    setDraft(null);
    setStatus('Yüklenen CV parse ediliyor ve AI danışman analizi hazırlanıyor...');

    try {
      const form = new FormData();
      form.append('file', uploadFile);
      if (targetRole) {
        form.append('target_role', targetRole);
      }
      const data = await apiFetch<ResumeResponse>('/resumes/analyze-upload', {
        method: 'POST',
        body: form,
      });
      setAnalysis(data);
      setStatus('Upload analizi tamamlandı. Şimdi zayıf alanları güçlendirebiliriz.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'CV analizi tamamlanamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
      <SurfaceCard tone="glass" className="relative overflow-hidden rounded-[2rem] p-6">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent" className="tracking-[0.3em]">
              Backend-Aware Studio
            </Badge>
            <Badge>{loadingTemplates ? 'Şablonlar...' : `${templates.length} template aktif`}</Badge>
          </div>

          <h2 className="mt-6 text-3xl font-semibold leading-tight text-[color:var(--text-primary)] md:text-4xl">
            Form doldurtan değil,
            <span className="block text-cyan"> danışman gibi çalışan </span>
            CV studio akışı
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-8 text-[color:var(--text-secondary)]">
            Bu panel artık backend’in gerçek gücüne göre çalışıyor: kayıtlı profil, auto draft, upload analyze,
            AI uyarıları, template kararı ve foto profesyonelleştirme aynı akışta düşünülüyor.
          </p>

          <div className="mt-8 inline-flex rounded-full border border-[var(--border-soft)] bg-[color:var(--bg-primary)] p-1 text-sm">
            <button
              type="button"
              className={`rounded-full px-4 py-2 transition ${mode === 'auto' ? 'bg-[color:var(--text-primary)] text-[color:var(--bg-app)]' : 'text-[color:var(--text-secondary)]'}`}
              onClick={() => setMode('auto')}
            >
              Auto Draft
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 transition ${mode === 'upload' ? 'bg-[color:var(--text-primary)] text-[color:var(--bg-app)]' : 'text-[color:var(--text-secondary)]'}`}
              onClick={() => setMode('upload')}
            >
              Upload Analyze
            </button>
          </div>

          {mode === 'auto' ? (
            <form className="mt-6 space-y-4" onSubmit={handleAutoDraft}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[color:var(--text-secondary)]">Profile ID</span>
                  <input
                    className={fieldClass}
                    value={profileId}
                    onChange={(event) => setProfileId(event.target.value)}
                    placeholder="e2f760f427b74f3c8d5f5073088fcd4a"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[color:var(--text-secondary)]">Target Role</span>
                  <input
                    className={fieldClass}
                    value={targetRole}
                    onChange={(event) => setTargetRole(event.target.value)}
                    placeholder="Senior Full Stack Developer"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[color:var(--text-secondary)]">Template Strategy</span>
                  <select
                    className={fieldClass}
                    value={template}
                    onChange={(event) => setTemplate(event.target.value)}
                  >
                    {templates.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type="button"
                  onClick={loadTemplates}
                  variant="secondary"
                  className="self-end rounded-[1.2rem]"
                >
                  Şablonları Yenile
                </Button>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--text-secondary)]">CV Goal</span>
                <input
                  className={fieldClass}
                  value={cvGoal}
                  onChange={(event) => setCvGoal(event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--text-secondary)]">Visual Preferences</span>
                <textarea
                  className={`${fieldClass} rounded-[1.4rem]`}
                  rows={3}
                  value={visualPreferences}
                  onChange={(event) => setVisualPreferences(event.target.value)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--text-secondary)]">Optimization Target</span>
                <input
                  className={fieldClass}
                  value={optimizationTarget}
                  onChange={(event) => setOptimizationTarget(event.target.value)}
                />
              </label>

              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Draft hazırlanıyor...' : 'Generate Auto Draft'}
              </Button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleUploadAnalyze}>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--text-secondary)]">Upload CV</span>
                <input
                  className="w-full rounded-[1.2rem] border border-dashed border-[var(--border-medium)] bg-[color:var(--bg-primary)] px-4 py-3 text-sm text-[color:var(--text-secondary)]"
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[color:var(--text-secondary)]">Target Role</span>
                <input
                  className={fieldClass}
                  value={targetRole}
                  onChange={(event) => setTargetRole(event.target.value)}
                  placeholder="Backend Engineer"
                />
              </label>

              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Analiz hazırlanıyor...' : 'Analyze Uploaded CV'}
              </Button>
            </form>
          )}

          <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">System Status</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">{status}</p>
          </div>

          <div className="mt-6 grid gap-3">
            {quickChecks.map((item) => (
              <div key={item} className="rounded-[1.3rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <div className="space-y-6">
        <SurfaceCard tone="glass" className="relative overflow-hidden rounded-[2rem] p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_24%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Live Output</p>
                <h3 className="mt-3 text-2xl font-semibold text-[color:var(--text-primary)]">
                  {activeResult ? activeResult.title : 'AI önce anlar, sonra üretir'}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--text-secondary)]">
                  {activeResult
                    ? activeResult.summary
                    : 'Bu panel, backend’den dönen draft, warning, template seçimi ve analiz çıktısını canlı şekilde göstermek için kurgulandı.'}
                </p>
              </div>

              <div className="min-w-[220px] rounded-[1.4rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">Template Intelligence</p>
                <p className="mt-3 text-lg font-semibold text-[color:var(--text-primary)]">
                  {draft?.template ?? selectedTemplateMeta?.name ?? 'AI Smart'}
                </p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                  {selectedTemplateMeta?.description ?? 'Template kararı backend’de veriye göre şekilleniyor.'}
                </p>
              </div>
            </div>

            {draft?.profile_warnings?.length ? (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {draft.profile_warnings.map((warning) => (
                  <div key={warning} className="rounded-[1.3rem] border border-[color:var(--warning)]/20 bg-[color:var(--warning-muted)] p-4 text-sm leading-7 text-[color:var(--warning)]">
                    {warning}
                  </div>
                ))}
              </div>
            ) : null}

            {activeResult?.recommendations?.length ? (
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {activeResult.recommendations.map((item) => (
                  <div key={item} className="rounded-[1.3rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4 text-sm leading-7 text-[color:var(--text-secondary)]">
                    {item}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-6 rounded-[1.7rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)] p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan/80">Output Surface</p>
                {draft?.version_number ? (
                  <Badge>Version {draft.version_number}</Badge>
                ) : null}
              </div>
              <pre className="mt-4 max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-app)] p-5 text-sm leading-7 text-[color:var(--text-primary)]">
                {activeResult?.content ??
                  'Burada gerçek backend çıktısı, warning kartları ve export öncesi canlı belge yüzeyi yer alacak. Auto draft ile kayıtlı profili, upload analyze ile mevcut CV’yi test edebilirsin.'}
              </pre>
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-4 md:grid-cols-3">
          <SurfaceCard className="rounded-[1.6rem] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">Stored Profile</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
              Generate butonu doğrudan DB’deki profil, deneyim, proje ve foto üzerinden çalışacak şekilde kurgulandı.
            </p>
          </SurfaceCard>
          <SurfaceCard className="rounded-[1.6rem] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">AI Review</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
              Draft üretmeden önce warning ve consultant-style iyileştirme sinyalleri backend’de hesaplanıyor.
            </p>
          </SurfaceCard>
          <SurfaceCard className="rounded-[1.6rem] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">Export Chain</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
              Aynı akış finalize ve PDF/DOCX export hattına doğrudan bağlanabilecek şekilde hazır.
            </p>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}
