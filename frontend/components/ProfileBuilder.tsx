'use client';

import { FormEvent, useMemo, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { UserProfilePayload } from '../lib/types';

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

export default function ProfileBuilder() {
  const [profile, setProfile] = useState(initialProfile);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const skillChips = useMemo(
    () => profile.skills.split(',').map((item) => item.trim()).filter(Boolean),
    [profile.skills],
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
      setStatus('Profil olusturuldu. Artik CV, on yazi ve takip akislarinda ayni profil kullanilabilir.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Profil kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,33,0.95),rgba(9,13,24,0.98))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Career Identity</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Profil temeli</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
            Reusable
          </span>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-300">
              Ad Soyad
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.full_name} onChange={(event) => handleChange('full_name', event.target.value)} required />
            </label>
            <label className="block text-sm text-gray-300">
              Email
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" type="email" value={profile.email} onChange={(event) => handleChange('email', event.target.value)} required />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-300">
              Telefon
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.phone} onChange={(event) => handleChange('phone', event.target.value)} />
            </label>
            <label className="block text-sm text-gray-300">
              Lokasyon
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.location} onChange={(event) => handleChange('location', event.target.value)} />
            </label>
          </div>

          <label className="block text-sm text-gray-300">
            Kisa Ozet
            <textarea className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" rows={4} value={profile.summary} onChange={(event) => handleChange('summary', event.target.value)} />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-300">
              Hedef Rol
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.target_role} onChange={(event) => handleChange('target_role', event.target.value)} />
            </label>
            <label className="block text-sm text-gray-300">
              Deneyim Seviyesi
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.seniority_level} onChange={(event) => handleChange('seniority_level', event.target.value)} placeholder="Junior, Mid, Senior" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-300">
              Portfoy URL
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.portfolio_url} onChange={(event) => handleChange('portfolio_url', event.target.value)} />
            </label>
            <label className="block text-sm text-gray-300">
              Deneyim Yili
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.years_of_experience} onChange={(event) => handleChange('years_of_experience', event.target.value)} />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-300">
              LinkedIn
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.linkedin_url} onChange={(event) => handleChange('linkedin_url', event.target.value)} />
            </label>
            <label className="block text-sm text-gray-300">
              Github
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.github_url} onChange={(event) => handleChange('github_url', event.target.value)} />
            </label>
          </div>

          <label className="block text-sm text-gray-300">
            Beceriler
            <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.skills} onChange={(event) => handleChange('skills', event.target.value)} placeholder="Python, FastAPI, Product Strategy" />
          </label>
          <label className="block text-sm text-gray-300">
            Diller
            <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.languages} onChange={(event) => handleChange('languages', event.target.value)} />
          </label>
          <label className="block text-sm text-gray-300">
            Sertifikalar
            <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={profile.certifications} onChange={(event) => handleChange('certifications', event.target.value)} />
          </label>

          <button className="w-full rounded-3xl bg-accent px-6 py-3 text-base font-semibold text-surface transition hover:bg-[#9ff3d2]" type="submit" disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Profili Kaydet'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.32)]">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Preview</p>
          <h3 className="mt-3 text-2xl font-semibold">Kariyer kimligi</h3>
          <div className="mt-6 rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
            <p className="text-2xl font-semibold text-white">{profile.full_name || 'Ad Soyad'}</p>
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-accent/80">{profile.target_role || 'Hedef Rol'}</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              {profile.summary || 'Buradaki ozet, AI tarafinin seni nasil konumlandiracagini belirler. Kisa ama net yazman en iyi sonucu verir.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(skillChips.length ? skillChips : ['Core skills', 'ATS ready', 'Role aligned']).map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Status</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">{status || 'Profili doldurdugunda tum belge akislarinin ortak veri kaynagi hazir olur.'}</p>
          {result ? (
            <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-[1.7rem] border border-white/10 bg-surface/90 p-4 text-xs text-slate-200">{result}</pre>
          ) : null}
        </div>
      </div>
    </div>
  );
}
