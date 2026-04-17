'use client';

import { FormEvent, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { CoverLetterResponse } from '../lib/types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import SurfaceCard from './ui/SurfaceCard';

const initialData = {
  full_name: '',
  email: '',
  company_name: '',
  position: '',
  job_description: '',
  tone: 'professional',
};

const prompts = [
  'Şirketin neden ilgini çektiğini bir cümlede netleştir.',
  'Role en yakın iki güçlü deneyimini seç.',
  'CV tekrarına düşmeden katkını açıkla.',
];

const fieldClass =
  'mt-2 w-full rounded-[1.2rem] border border-[var(--border-medium)] bg-[color:var(--bg-primary)] px-4 py-3 text-[color:var(--text-primary)] outline-none transition focus:border-[var(--border-accent)] focus:bg-[color:var(--bg-secondary)]';

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
    setStatus('Ön yazı hazırlanıyor...');

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
      setStatus('Ön yazı hazır. Tonu daha kurumsal ya da daha cesur hale getirmek istersek buradan devam edebiliriz.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Backend ile iletişim kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <SurfaceCard tone="glass" className="relative overflow-hidden rounded-[2rem] p-8">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Letter Engine
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">Pozisyona özel ön yazı</h2>
            </div>
            <Badge tone="accent">Tailored</Badge>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Ad Soyad
                <input className={fieldClass} value={form.full_name} onChange={(event) => handleChange('full_name', event.target.value)} required />
              </label>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Email
                <input className={fieldClass} type="email" value={form.email} onChange={(event) => handleChange('email', event.target.value)} required />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Şirket Adı
                <input className={fieldClass} value={form.company_name} onChange={(event) => handleChange('company_name', event.target.value)} required />
              </label>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Pozisyon
                <input className={fieldClass} value={form.position} onChange={(event) => handleChange('position', event.target.value)} required />
              </label>
            </div>

            <label className="block text-sm text-[color:var(--text-secondary)]">
              İş İlanı Açıklaması
              <textarea className={fieldClass} rows={7} value={form.job_description} onChange={(event) => handleChange('job_description', event.target.value)} />
            </label>

            <label className="block text-sm text-[color:var(--text-secondary)]">
              Ton
              <select className={fieldClass} value={form.tone} onChange={(event) => handleChange('tone', event.target.value)}>
                <option value="professional">Profesyonel</option>
                <option value="warm">Sıcak</option>
              </select>
            </label>

            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Ön Yazı Üret'}
            </Button>
          </form>
        </div>
      </SurfaceCard>

      <div className="space-y-6">
        <SurfaceCard className="rounded-[2rem] p-6">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            Writing Strategy
          </p>
          <div className="mt-5 space-y-3">
            {prompts.map((item) => (
              <div key={item} className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4 text-sm leading-7 text-[color:var(--text-secondary)]">
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-[2rem] p-6">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            Output
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
            {status || 'Sistem role, şirkete ve tona göre kullanıma hazır bir taslak üretecek.'}
          </p>
          {result ? (
            <div className="mt-5 space-y-4">
              <h3 className="text-2xl font-semibold text-[color:var(--text-primary)]">{result.title}</h3>
              <p className="text-sm text-[color:var(--text-secondary)]">{result.summary}</p>
              <div className="flex flex-wrap gap-2">
                {result.recommendations.map((item) => (
                  <Badge key={item} tone="accent">
                    {item}
                  </Badge>
                ))}
              </div>
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-5 text-sm leading-7 text-[color:var(--text-primary)]">
                {result.content}
              </pre>
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-5 text-sm leading-7 text-[color:var(--text-secondary)]">
              Burada role özel açılış, neden uyumlu olduğun ve kapanış dili tek bir premium metinde toplanacak.
            </div>
          )}
        </SurfaceCard>
      </div>
    </div>
  );
}
