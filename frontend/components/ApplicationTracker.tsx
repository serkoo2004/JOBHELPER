'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { JobApplication } from '../lib/types';

const initialApplication = {
  company_name: '',
  role_name: '',
  source: '',
  job_url: '',
  status: 'pending',
  notes: '',
};

const statusConfig: Record<string, string> = {
  pending: 'Beklemede',
  interview: 'Mulakat',
  offer: 'Teklif',
  rejected: 'Red',
};

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [form, setForm] = useState(initialApplication);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      const data = await apiFetch<JobApplication[]>('/applications');
      return data || [];
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Basvurular yuklenemedi.');
      return [];
    }
  };

  useEffect(() => {
    let active = true;

    const loadApplications = async () => {
      const data = await fetchApplications();
      if (active) {
        setApplications(data);
      }
    };

    void loadApplications();

    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = applications.length;
    const interviews = applications.filter((item) => item.status === 'interview').length;
    const offers = applications.filter((item) => item.status === 'offer').length;
    return { total, interviews, offers };
  }, [applications]);

  const handleChange = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus('Basvuru kaydediliyor...');

    try {
      await apiFetch<JobApplication>('/applications', {
        method: 'POST',
        body: form,
      });
      setStatus('Basvuru kaydedildi ve panel guncellendi.');
      setForm(initialApplication);
      const nextApplications = await fetchApplications();
      setApplications(nextApplications);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Basvuru kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-accent/80">Toplam</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-accent/80">Mulakat</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metrics.interviews}</p>
          </div>
          <div className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-accent/80">Teklif</p>
            <p className="mt-3 text-3xl font-semibold text-white">{metrics.offers}</p>
          </div>
        </div>

        <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,33,0.95),rgba(9,13,24,0.98))] p-8 shadow-[0_35px_120px_rgba(0,0,0,0.35)]">
          <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Application Intake</p>
          <h2 className="mt-3 text-3xl font-semibold">Yeni basvuru ekle</h2>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-gray-300">
                Sirket
                <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.company_name} onChange={(event) => handleChange('company_name', event.target.value)} required />
              </label>
              <label className="block text-sm text-gray-300">
                Pozisyon
                <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.role_name} onChange={(event) => handleChange('role_name', event.target.value)} required />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-gray-300">
                Kaynak
                <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.source} onChange={(event) => handleChange('source', event.target.value)} />
              </label>
              <label className="block text-sm text-gray-300">
                Durum
                <select className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.status} onChange={(event) => handleChange('status', event.target.value)}>
                  <option value="pending">Beklemede</option>
                  <option value="interview">Mulakat</option>
                  <option value="offer">Teklif</option>
                  <option value="rejected">Red</option>
                </select>
              </label>
            </div>
            <label className="block text-sm text-gray-300">
              Ilan Linki
              <input className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" value={form.job_url} onChange={(event) => handleChange('job_url', event.target.value)} />
            </label>
            <label className="block text-sm text-gray-300">
              Notlar
              <textarea className="mt-2 w-full rounded-3xl border border-white/10 bg-surface px-4 py-3 text-white outline-none focus:border-accent" rows={4} value={form.notes} onChange={(event) => handleChange('notes', event.target.value)} />
            </label>
            <button className="w-full rounded-3xl bg-accent px-6 py-3 text-base font-semibold text-surface transition hover:bg-[#9ff3d2]" type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Basvuru Ekle'}
            </button>
          </form>

          <div className="mt-5 text-sm text-slate-300">{status || 'Yeni bir basvuru ekleyip sureci panelden takip edebilirsin.'}</div>
        </div>
      </div>

      <div className="rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,18,31,0.98),rgba(8,12,21,0.98))] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.32)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-accent/80">Pipeline</p>
            <h3 className="mt-3 text-2xl font-semibold">Kayitli basvurular</h3>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
            Live
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {applications.length === 0 ? (
            <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
              Henuz basvuru yok. Ilk kayit eklendiginde burada durum kartlari gorunecek.
            </div>
          ) : (
            applications.map((application) => (
              <div key={application.application_id} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-white">{application.company_name}</p>
                    <p className="mt-1 text-sm text-slate-400">{application.role_name}</p>
                  </div>
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    {statusConfig[application.status] || application.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.3rem] bg-[#0c1220] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Kaynak</p>
                    <p className="mt-2 text-sm text-slate-200">{application.source || 'Belirtilmedi'}</p>
                  </div>
                  <div className="rounded-[1.3rem] bg-[#0c1220] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Link</p>
                    <p className="mt-2 truncate text-sm text-slate-200">{application.job_url || 'Yok'}</p>
                  </div>
                </div>
                {application.notes ? <p className="mt-4 text-sm leading-7 text-slate-300">Not: {application.notes}</p> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
