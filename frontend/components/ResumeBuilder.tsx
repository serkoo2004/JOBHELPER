'use client';

import { FormEvent, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { ResumeResponse, UserProfilePayload } from '../lib/types';

const initialProfile = {
  full_name: '',
  email: '',
  target_role: '',
  summary: '',
  skills: '',
};

const initialAnalysis = {
  content: '',
  target_role: '',
};

type Mode = 'build' | 'analyze';

export default function ResumeBuilder() {
  const [mode, setMode] = useState<Mode>('build');
  const [profile, setProfile] = useState(initialProfile);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeResponse | null>(null);
  const [status, setStatus] = useState<string>('');

  const handleProfileChange = (field: keyof typeof initialProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleAnalysisChange = (field: keyof typeof initialAnalysis, value: string) => {
    setAnalysis((current) => ({ ...current, [field]: value }));
  };

  const handleBuildSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('AI ile yeni CV taslagi hazirlaniyor...');

    const payload: {
      profile: UserProfilePayload;
      template: string;
      tone: string;
      target_role: string;
    } = {
      profile: {
        full_name: profile.full_name,
        email: profile.email,
        summary: profile.summary,
        target_role: profile.target_role,
        skills: profile.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      },
      template: 'smart',
      tone: 'professional',
      target_role: profile.target_role,
    };

    try {
      const data = await apiFetch<ResumeResponse>('/resumes/generate', {
        method: 'POST',
        body: payload,
      });
      setResult(data);
      setStatus('CV taslagi hazir. Simdi deneyim ve basari metrikleriyle zenginlestirebiliriz.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'CV olusturulamadi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Mevcut CV analiz ediliyor...');

    try {
      const data = await apiFetch<ResumeResponse>('/resumes/analyze', {
        method: 'POST',
        body: analysis,
      });
      setResult(data);
      setStatus('CV analizi tamamlandi. Asagidaki maddelerden baslayabiliriz.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'CV analizi tamamlanamadi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-white/10 bg-[#0f1322]/90 p-6 shadow-2xl shadow-black/30">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
          <button
            className={`rounded-full px-4 py-2 transition ${mode === 'build' ? 'bg-accent text-slate-950' : 'text-gray-300'}`}
            type="button"
            onClick={() => setMode('build')}
          >
            Sifirdan Olustur
          </button>
          <button
            className={`rounded-full px-4 py-2 transition ${mode === 'analyze' ? 'bg-accent text-slate-950' : 'text-gray-300'}`}
            type="button"
            onClick={() => setMode('analyze')}
          >
            CV Analiz Et
          </button>
        </div>

        {mode === 'build' ? (
          <form className="mt-6 space-y-4" onSubmit={handleBuildSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-300">Ad Soyad</label>
              <input
                className="mt-2 w-full rounded-[1.25rem] border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent"
                value={profile.full_name}
                onChange={(event) => handleProfileChange('full_name', event.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input
                className="mt-2 w-full rounded-[1.25rem] border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent"
                type="email"
                value={profile.email}
                onChange={(event) => handleProfileChange('email', event.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Hedef Rol</label>
              <input
                className="mt-2 w-full rounded-[1.25rem] border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent"
                value={profile.target_role}
                onChange={(event) => handleProfileChange('target_role', event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Kisa Profil Ozeti</label>
              <textarea
                className="mt-2 w-full rounded-[1.5rem] border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent"
                rows={4}
                value={profile.summary}
                onChange={(event) => handleProfileChange('summary', event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Beceriler</label>
              <input
                className="mt-2 w-full rounded-[1.25rem] border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent"
                value={profile.skills}
                onChange={(event) => handleProfileChange('skills', event.target.value)}
                placeholder="Python, FastAPI, Product Design"
              />
            </div>

            <button
              className="w-full rounded-[1.5rem] bg-accent px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-[#9ff3d2]"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Hazirlaniyor...' : 'CV Taslagi Olustur'}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleAnalyzeSubmit}>
            <div>
              <label className="text-sm font-medium text-gray-300">Hedef Rol</label>
              <input
                className="mt-2 w-full rounded-[1.25rem] border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent"
                value={analysis.target_role}
                onChange={(event) => handleAnalysisChange('target_role', event.target.value)}
                placeholder="Backend Engineer"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">CV Metni</label>
              <textarea
                className="mt-2 w-full rounded-[1.5rem] border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent"
                rows={10}
                value={analysis.content}
                onChange={(event) => handleAnalysisChange('content', event.target.value)}
                placeholder="Mevcut CV metnini buraya yapistir..."
                required
              />
            </div>

            <button
              className="w-full rounded-[1.5rem] bg-accent px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-[#9ff3d2]"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Analiz ediliyor...' : 'CV Analizi Baslat'}
            </button>
          </form>
        )}

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
          <p className="font-medium text-white">Durum</p>
          <p className="mt-2">{status || 'Hazir. Ilk akisi baslatabiliriz.'}</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-[#0d111d]/90 p-6 shadow-2xl shadow-black/30">
        {result ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-accent/80">AI Cikti</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">{result.title}</h3>
                <p className="mt-3 max-w-2xl text-gray-300">{result.summary}</p>
              </div>
              {result.template ? (
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {result.template}
                </span>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {result.recommendations.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
                  {item}
                </div>
              ))}
            </div>

            <pre className="mt-6 max-h-[30rem] overflow-auto whitespace-pre-wrap rounded-[1.75rem] border border-white/10 bg-surface/90 p-5 text-sm leading-7 text-gray-100">
              {result.content}
            </pre>
          </>
        ) : (
          <div className="flex h-full min-h-[28rem] flex-col justify-between rounded-[1.75rem] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(18,24,40,0.92),rgba(11,15,27,0.92))] p-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-accent/80">Canli Onizleme</p>
              <h3 className="mt-4 text-3xl font-semibold text-white">Danisman modunda bir ilk cikti</h3>
              <p className="mt-4 max-w-xl text-gray-300">
                Sistem once seni anlar, sonra belgeyi uretir. Bu panelde CV taslagi, analiz notlari ve
                iyilestirme kartlari gorunecek.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-accent/80">AI Onerisi</p>
                <p className="mt-2 text-sm text-gray-200">Deneyim maddelerini sayisal etkiyle guclendirirsek CV daha inandirici gorunecek.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-accent/80">ATS Notu</p>
                <p className="mt-2 text-sm text-gray-200">Hedef role gore anahtar kelime dagilimini yeniden duzenlemek gorunurlugu artirir.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
