'use client';

import { FormEvent, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { CoverLetterResponse } from '../lib/types';

const initialData = {
  full_name: '',
  email: '',
  company_name: '',
  position: '',
  job_description: '',
  tone: 'professional',
};

const prompts = [
  'Sirketin neden ilgini cektigini bir cumlede netlestir.',
  'Role en yakin 2 guclu deneyimini sec.',
  'CV tekrarina dusmeden katki acikla.',
];

export default function CoverLetterBuilder() {
  const [form, setForm] = useState(initialData);
  const [result, setResult] = useState<CoverLetterResponse | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('On yazi hazirlaniyor...');

    try {
      const payload = {
        profile: {
          full_name: form.full_name,
          email: form.email,
          target_role: form.position,
          summary: '',
        },
        company_name: form.company_name,
        position: form.position,
        tone: form.tone,
        job_description: form.job_description,
      };

      const data = await apiFetch<CoverLetterResponse>('/cover-letters/generate', {
        method: 'POST',
        body: payload,
      });
      setResult(data);
      setStatus('On yazi hazir. Tonu daha kurumsal ya da daha cesur hale getirmek istersek buradan devam edebiliriz.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Backend ile iletisim kurulamadi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,33,0.95),rgba(9,13,24,0.98))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Letter Engine</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Pozisyona ozel on yazi</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
            Tailored
          </span>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-300">
              Ad Soyad
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.full_name} onChange={(event) => handleChange('full_name', event.target.value)} required />
            </label>
            <label className="block text-sm text-gray-300">
              Email
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} required />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-300">
              Sirket Adi
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.company_name} onChange={(event) => handleChange('company_name', event.target.value)} required />
            </label>
            <label className="block text-sm text-gray-300">
              Pozisyon
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.position} onChange={(event) => handleChange('position', event.target.value)} required />
            </label>
          </div>

          <label className="block text-sm text-gray-300">
            Is Ilani Aciklamasi
            <textarea className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" rows={7} value={form.job_description} onChange={(event) => handleChange('job_description', event.target.value)} />
          </label>

          <label className="block text-sm text-gray-300">
            Ton
            <select className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.tone} onChange={(event) => handleChange('tone', event.target.value)}>
              <option value="professional">Profesyonel</option>
              <option value="warm">Sicak</option>
            </select>
          </label>

          <button className="w-full rounded-3xl bg-accent px-6 py-3 text-base font-semibold text-surface transition hover:bg-[#9ff3d2]" type="submit" disabled={loading}>
            {loading ? 'Olusturuluyor...' : 'On Yazi Uret'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Writing Strategy</p>
          <div className="mt-5 space-y-3">
            {prompts.map((item) => (
              <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.32)]">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Output</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">{status || 'Sistem role, sirkete ve tona gore kullanima hazir bir taslak uretecek.'}</p>
          {result ? (
            <div className="mt-5 space-y-4">
              <h3 className="text-2xl font-semibold text-white">{result.title}</h3>
              <p className="text-sm text-slate-300">{result.summary}</p>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.map((item) => (
                  <span key={item} className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent">
                    {item}
                  </span>
                ))}
              </div>
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-[1.7rem] border border-white/10 bg-surface/90 p-5 text-sm leading-7 text-slate-100">{result.content}</pre>
            </div>
          ) : (
            <div className="mt-5 rounded-[1.7rem] border border-dashed border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              Burada role ozel acilis, neden uyumlu oldugun ve kapanis dili tek bir premium metinde toplanacak.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
