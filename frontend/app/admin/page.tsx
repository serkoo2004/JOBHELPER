'use client';

import { useEffect, useState } from 'react';

import PageShell from '../../components/PageShell';
import { apiFetch } from '../../lib/api';
import type { AdminDashboard } from '../../lib/types';

const aside = (
  <div className="soft-panel rounded-[2rem] p-6">
    <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Restricted View</p>
    <div className="mt-5 space-y-3">
      {[
        'Bu alan normal navigasyonda görünmez.',
        'Backend tarafında da ADMIN_API_KEY ile korunur.',
        'Swagger’da endpointler görünür ama anahtar olmadan erişilemez.',
      ].map((item) => (
        <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200">
          {item}
        </div>
      ))}
    </div>
  </div>
);

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => {
    if (typeof window === 'undefined') {
      return '';
    }

    return window.sessionStorage.getItem('career-copilot-admin-key') ?? '';
  });
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [status, setStatus] = useState('Admin erişimi için anahtar gir.');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && adminKey.trim()) {
      window.sessionStorage.setItem('career-copilot-admin-key', adminKey);
    }
  }, [adminKey]);

  const loadAdminData = async () => {
    if (!adminKey.trim()) {
      setStatus('Admin key gerekli.');
      return;
    }

    setLoading(true);
    setStatus('Admin verileri çekiliyor...');
    try {
      const headers = { 'x-admin-key': adminKey };
      const dashboardData = await apiFetch<AdminDashboard>('/admin/dashboard', { headers });
      setDashboard(dashboardData);
      setStatus('Admin panel hazır.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Admin verileri alınamadı.');
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  const cards = dashboard
    ? [
        { label: 'Profiles', value: dashboard.overview.profiles },
        { label: 'Resumes', value: dashboard.overview.resumes },
        { label: 'Versions', value: dashboard.overview.resume_versions },
        { label: 'Applications', value: dashboard.overview.applications },
        { label: 'AI Sessions', value: dashboard.overview.ai_sessions },
        { label: 'Audit Logs', value: dashboard.overview.audit_logs },
      ]
    : [];

  return (
    <PageShell
      eyebrow="Admin Console"
      title="Sadece admin için ayrılmış kontrol yüzeyi"
      description="Bu alan normal kullanıcı akışına ait değil. Sistem sağlığı, audit akışı ve temel içerik sayıları burada izlenir."
      aside={aside}
    >
      <div className="space-y-6">
        <div className="glass-panel rounded-[2rem] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Access Gate</p>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              type="password"
              className="w-full rounded-[1.2rem] border border-white/10 bg-[#0b1424] px-4 py-3 text-white outline-none transition focus:border-cyan"
              placeholder="ADMIN_API_KEY"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
            />
            <button
              className="rounded-[1.2rem] bg-[linear-gradient(135deg,#60a5fa,#22d3ee)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:opacity-90"
              type="button"
              onClick={() => void loadAdminData()}
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : 'Admin Verisini Getir'}
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">{status}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="soft-panel rounded-[1.6rem] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan/80">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {dashboard ? (
          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-6">
              <div className="glass-panel rounded-[2rem] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">System Health</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1424]/90 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Database</p>
                    <p className="mt-2 text-lg font-semibold text-white">{dashboard.system.database_backend}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1424]/90 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin Guard</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {dashboard.system.admin_guard_enabled ? 'Aktif' : 'Kapalı'}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1424]/90 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rate Limit</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {dashboard.system.rate_limit_enabled
                        ? `${dashboard.system.rate_limit_max_requests}/${dashboard.system.rate_limit_window_seconds}s`
                        : 'Kapalı'}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-[#0b1424]/90 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">AI Providers</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {[
                        dashboard.system.google_ai_configured ? 'Google' : null,
                        dashboard.system.openai_ai_configured ? 'OpenAI' : null,
                      ]
                        .filter(Boolean)
                        .join(' + ') || 'Yok'}
                    </p>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-cyan/15 bg-cyan/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan/80">24 Saat İstek</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{dashboard.system.requests_last_24h}</p>
                  </div>
                  <div className="rounded-[1.4rem] border border-rose-400/15 bg-rose-400/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-rose-200">24 Saat Hata</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{dashboard.system.errors_last_24h}</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-[2rem] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Pipeline Snapshot</p>
                <div className="mt-5 space-y-3">
                  {dashboard.application_statuses.length === 0 ? (
                    <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                      Başvuru pipeline verisi henüz oluşmadı.
                    </div>
                  ) : (
                    dashboard.application_statuses.map((item) => (
                      <div key={item.status} className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-[#0b1424]/90 px-4 py-3">
                        <span className="text-sm font-medium uppercase tracking-[0.16em] text-slate-200">{item.status}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white">{item.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-[2rem] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Recent Profiles</p>
                <div className="mt-5 space-y-3">
                  {dashboard.recent_profiles.map((item) => (
                    <div key={item.user_id} className="rounded-[1.4rem] border border-white/10 bg-[#0b1424]/90 p-4">
                      <p className="text-sm font-semibold text-white">{item.full_name}</p>
                      <p className="mt-1 text-sm text-slate-300">{item.email}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {item.target_role || 'Rol belirtilmedi'} · {item.created_at}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel rounded-[2rem] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Recent Resume Versions</p>
                <div className="mt-5 space-y-3">
                  {dashboard.recent_resume_versions.map((item) => (
                    <div key={`${item.resume_id}-${item.version_number}`} className="rounded-[1.4rem] border border-white/10 bg-[#0b1424]/90 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-200">
                          v{item.version_number}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {item.template || 'template yok'} · {item.status}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{item.created_at}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[2rem] p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Recent Applications</p>
                <div className="mt-5 space-y-3">
                  {dashboard.recent_applications.map((item) => (
                    <div key={item.application_id} className="rounded-[1.4rem] border border-white/10 bg-[#0b1424]/90 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-white">{item.company_name}</p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-200">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        {item.role_name} · {item.source || 'kaynak yok'}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{item.created_at}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-[2rem] p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan/80">Recent Audit Logs</p>
                    <h2 className="mt-3 text-2xl font-semibold text-white">Son sistem izleri</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {dashboard.recent_audit_logs.map((log) => (
                    <div key={log.log_id} className="rounded-[1.5rem] border border-white/10 bg-[#0b1424]/90 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {log.method} {log.path}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                            request {log.request_id}
                          </p>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-slate-200">
                          {log.status_code} · {log.duration_ms}ms
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {log.client_ip || 'unknown'} · {log.created_at}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
