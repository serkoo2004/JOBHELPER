'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { apiFetch } from '../lib/api';
import type { JobApplication } from '../lib/types';
import Badge from './ui/Badge';
import Button from './ui/Button';
import SurfaceCard from './ui/SurfaceCard';

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
  interview: 'Mülakat',
  offer: 'Teklif',
  rejected: 'Red',
};

const fieldClass =
  'mt-2 w-full rounded-[1.2rem] border border-[var(--border-medium)] bg-[color:var(--bg-primary)] px-4 py-3 text-[color:var(--text-primary)] outline-none transition focus:border-[var(--border-accent)] focus:bg-[color:var(--bg-secondary)]';

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
      setStatus(error instanceof Error ? error.message : 'Başvurular yüklenemedi.');
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
    setStatus('Başvuru kaydediliyor...');

    try {
      await apiFetch<JobApplication>('/applications', {
        method: 'POST',
        body: form,
      });
      setStatus('Başvuru kaydedildi ve panel güncellendi.');
      setForm(initialApplication);
      const nextApplications = await fetchApplications();
      setApplications(nextApplications);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Başvuru kaydedilemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <SurfaceCard className="rounded-[1.5rem] p-5">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Toplam
            </p>
            <p className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">{metrics.total}</p>
          </SurfaceCard>
          <SurfaceCard className="rounded-[1.5rem] p-5">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Mülakat
            </p>
            <p className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">{metrics.interviews}</p>
          </SurfaceCard>
          <SurfaceCard className="rounded-[1.5rem] p-5">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Teklif
            </p>
            <p className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">{metrics.offers}</p>
          </SurfaceCard>
        </div>

        <SurfaceCard tone="glass" className="relative overflow-hidden rounded-[2rem] p-8">
          <div className="absolute inset-0 grid-overlay opacity-20" />
          <div className="relative">
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Application Intake
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[color:var(--text-primary)]">Yeni başvuru ekle</h2>

            <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-[color:var(--text-secondary)]">
                  Şirket
                  <input className={fieldClass} value={form.company_name} onChange={(event) => handleChange('company_name', event.target.value)} required />
                </label>
                <label className="block text-sm text-[color:var(--text-secondary)]">
                  Pozisyon
                  <input className={fieldClass} value={form.role_name} onChange={(event) => handleChange('role_name', event.target.value)} required />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-[color:var(--text-secondary)]">
                  Kaynak
                  <input className={fieldClass} value={form.source} onChange={(event) => handleChange('source', event.target.value)} />
                </label>
                <label className="block text-sm text-[color:var(--text-secondary)]">
                  Durum
                  <select className={fieldClass} value={form.status} onChange={(event) => handleChange('status', event.target.value)}>
                    <option value="pending">Beklemede</option>
                    <option value="interview">Mülakat</option>
                    <option value="offer">Teklif</option>
                    <option value="rejected">Red</option>
                  </select>
                </label>
              </div>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                İlan Linki
                <input className={fieldClass} value={form.job_url} onChange={(event) => handleChange('job_url', event.target.value)} />
              </label>
              <label className="block text-sm text-[color:var(--text-secondary)]">
                Notlar
                <textarea className={fieldClass} rows={4} value={form.notes} onChange={(event) => handleChange('notes', event.target.value)} />
              </label>
              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Başvuru Ekle'}
              </Button>
            </form>

            <div className="mt-5 text-sm text-[color:var(--text-secondary)]">
              {status || 'Yeni bir başvuru ekleyip süreci panelden takip edebilirsin.'}
            </div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" />
              Pipeline
            </p>
            <h3 className="mt-4 text-2xl font-semibold text-[color:var(--text-primary)]">Kayıtlı başvurular</h3>
          </div>
          <Badge tone="accent">Live</Badge>
        </div>

        <div className="mt-6 space-y-4">
          {applications.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-5 text-sm leading-7 text-[color:var(--text-secondary)]">
              Henüz başvuru yok. İlk kayıt eklendiğinde burada durum kartları görünecek.
            </div>
          ) : (
            applications.map((application) => (
              <div key={application.application_id} className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[color:var(--bg-secondary)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-[color:var(--text-primary)]">{application.company_name}</p>
                    <p className="mt-1 text-sm text-[color:var(--text-muted)]">{application.role_name}</p>
                  </div>
                  <Badge tone={application.status === 'offer' ? 'success' : application.status === 'rejected' ? 'warning' : 'accent'}>
                    {statusConfig[application.status] || application.status}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Kaynak</p>
                    <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{application.source || 'Belirtilmedi'}</p>
                  </div>
                  <div className="rounded-[1.2rem] border border-[var(--border-soft)] bg-[color:var(--bg-primary)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Link</p>
                    <p className="mt-2 truncate text-sm text-[color:var(--text-secondary)]">{application.job_url || 'Yok'}</p>
                  </div>
                </div>
                {application.notes ? <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">Not: {application.notes}</p> : null}
              </div>
            ))
          )}
        </div>
      </SurfaceCard>
    </div>
  );
}
