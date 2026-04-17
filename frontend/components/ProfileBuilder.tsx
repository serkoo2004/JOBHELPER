'use client';

import { FormEvent, useMemo, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { UserProfilePayload } from '../lib/types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import SurfaceCard from './ui/SurfaceCard';

const initialProfile = {
  full_name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  target_role: '',
  seniority_level: '',
  years_of_experience: '',
  linkedin_url: '',
  github_url: '',
  portfolio_url: '',
  skills: '',
  languages: '',
  certifications: '',
};

const fieldClass =
  'mt-2 w-full rounded-[1.2rem] border border-[var(--border-medium)] bg-[color:var(--bg-primary)] px-4 py-3 text-[color:var(--text-primary)] outline-none transition focus:border-[var(--border-accent)] focus:bg-[color:var(--bg-secondary)]';

export default function ProfileBuilder() {
  const [profile, setProfile] = useState(initialProfile);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const skillChips = useMemo(
    () => profile.skills.split(',').map((item) => item.trim()).filter(Boolean),
    [profile.skills],
  );

  const languageChips = useMemo(
    () => profile.languages.split(',').map((item) => item.trim()).filter(Boolean),
    [profile.languages],
  );

  const handleChange = (field: string, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Profil kaydediliyor...');

    try {
      const payload = {
        user_id: '',
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        summary: profile.summary,
        target_role: profile.target_role,
        seniority_level: profile.seniority_level,
        years_of_experience: profile.years_of_experience ? Number(profile.years_of_experience) : undefined,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
        skills: profile.skills.split(',').map((item) => item.trim()).filter(Boolean),
        languages: profile.languages.split(',').map((item) => item.trim()).filter(Boolean),
        certifications: profile.certifications.split(',').map((item) => item.trim()).filter(Boolean),
      } satisfies UserProfilePayload;
      const data = await apiFetch('/profiles', {
        method: 'POST',
        body: payload,
      });
      setResult(JSON.stringify(data, null, 2));
      setStatus('Profil oluşturuldu. Artık CV, ön yazı ve takip akışlarında aynı profil kullanılabilir.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Profil kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <SurfaceCard tone="glass" className="relative overflow-hidden rounded-[2rem] p-8">
        <div className="absolute inset-0 grid-overlay opacity-20" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                Career Identity
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)] md:text-4xl">
                Kariyer profilini tek yerde sabitle
              </h2>
            </div>
            <Badge tone="accent">Reusable</Badge>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Ad Soyad
                <input className={fieldClass} value={profile.full_name} onChange={(event) => handleChange('full_name', event.target.value)} required />
              </label>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Email
                <input className={fieldClass} type="email" value={profile.email} onChange={(event) => handleChange('email', event.target.value)} required />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Telefon
                <input className={fieldClass} value={profile.phone} onChange={(event) => handleChange('phone', event.target.value)} />
              </label>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Lokasyon
                <input className={fieldClass} value={profile.location} onChange={(event) => handleChange('location', event.target.value)} />
              </label>
            </div>

            <label className="block text-sm text-[color:var(--text-secondary)]">
              Kısa Özet
              <textarea className={fieldClass} rows={4} value={profile.summary} onChange={(event) => handleChange('summary', event.target.value)} />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Hedef Rol
                <input className={fieldClass} value={profile.target_role} onChange={(event) => handleChange('target_role', event.target.value)} />
              </label>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Deneyim Seviyesi
                <input className={fieldClass} value={profile.seniority_level} onChange={(event) => handleChange('seniority_level', event.target.value)} placeholder="Junior, Mid, Senior" />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Portföy URL
                <input className={fieldClass} value={profile.portfolio_url} onChange={(event) => handleChange('portfolio_url', event.target.value)} />
              </label>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Deneyim Yılı
                <input className={fieldClass} value={profile.years_of_experience} onChange={(event) => handleChange('years_of_experience', event.target.value)} />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-[color:var(--text-secondary)]">
                LinkedIn
                <input className={fieldClass} value={profile.linkedin_url} onChange={(event) => handleChange('linkedin_url', event.target.value)} />
              </label>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Github
                <input className={fieldClass} value={profile.github_url} onChange={(event) => handleChange('github_url', event.target.value)} />
              </label>
            </div>

            <label className="block text-sm text-[color:var(--text-secondary)]">
              Beceriler
              <input className={fieldClass} value={profile.skills} onChange={(event) => handleChange('skills', event.target.value)} placeholder="Python, FastAPI, Product Strategy" />
            </label>
            <label className="block text-sm text-[color:var(--text-secondary)]">
              Diller
              <input className={fieldClass} value={profile.languages} onChange={(event) => handleChange('languages', event.target.value)} />
            </label>
            <label className="block text-sm text-[color:var(--text-secondary)]">
              Sertifikalar
              <input className={fieldClass} value={profile.certifications} onChange={(event) => handleChange('certifications', event.target.value)} />
            </label>

            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Profili Kaydet'}
            </Button>
          </form>
        </div>
      </SurfaceCard>

      <div className="space-y-6">
        <SurfaceCard className="rounded-[2rem] p-6">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            Preview
          </p>
          <h3 className="mt-4 text-2xl font-semibold text-[color:var(--text-primary)]">Kariyer kimliği</h3>
          <div className="mt-6 rounded-[1.5rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)] p-5">
            <p className="text-2xl font-semibold text-[color:var(--text-primary)]">{profile.full_name || 'Ad Soyad'}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[color:var(--accent)]">{profile.target_role || 'Hedef Rol'}</p>
            <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
              {profile.summary || 'Buradaki özet, AI tarafının seni nasıl konumlandıracağını belirler. Kısa ama net yazman en iyi sonucu verir.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(skillChips.length ? skillChips : ['Core skills', 'ATS ready', 'Role aligned']).map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.2rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Diller</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(languageChips.length ? languageChips : ['Türkçe', 'English']).map((item) => (
                    <Badge key={item} tone="accent">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Hızlı Kontrol</p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--text-secondary)]">
                  Rol, özet ve skill dili ne kadar netse CV, cover letter ve AI yorumları o kadar kaliteli olur.
                </p>
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="rounded-[2rem] p-6">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            Status
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
            {status || 'Profili doldurduğunda tüm belge akışlarının ortak veri kaynağı hazır olur.'}
          </p>
          {result ? (
            <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-[1.5rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-4 text-xs text-[color:var(--text-secondary)]">
              {result}
            </pre>
          ) : null}
        </SurfaceCard>
      </div>
    </div>
  );
}
