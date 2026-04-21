"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, FileText, Shield, Users } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";

type Overview = {
  profiles: number;
  resumes: number;
  resume_versions: number;
  applications: number;
  ai_sessions: number;
  ai_messages: number;
  audit_logs: number;
};

type DashboardData = {
  overview: Overview;
  system: {
    database_backend: string;
    admin_guard_enabled: boolean;
    rate_limit_enabled: boolean;
    rate_limit_max_requests: number;
    rate_limit_window_seconds: number;
    google_ai_configured: boolean;
    openai_ai_configured: boolean;
    requests_last_24h: number;
    errors_last_24h: number;
  };
  application_statuses: { status: string; count: number }[];
  recent_profiles: { user_id: string; full_name: string; email: string; target_role?: string | null; created_at: string }[];
  recent_resume_versions: { resume_id: string; version_number: number; title: string; template?: string | null; status: string; created_at: string }[];
  recent_applications: { application_id: string; company_name: string; role_name: string; status: string; source?: string | null; created_at: string }[];
  recent_audit_logs: { log_id: string; method: string; path: string; status_code: number; client_ip?: string | null; duration_ms: number; created_at: string }[];
};

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("cc_admin_key") : null;
    if (!stored) {
      router.replace("/dashboard");
      setChecked(true);
      return;
    }
    setAuthed(true);
    setChecked(true);
  }, [router]);

  useEffect(() => {
    const loadAdmin = async () => {
      if (!authed) return;

      setLoading(true);
      try {
        const [dashboardResponse, auditResponse] = await Promise.all([adminApi.dashboard(), adminApi.auditLogs(50)]);
        setDashboard(dashboardResponse);
        setAuditLogs(auditResponse || []);
      } catch (error) {
        console.error(error);
        toast.error("Admin data could not be loaded.");
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    void loadAdmin();
  }, [authed, router]);

  const metrics = useMemo(() => {
    if (!dashboard) return [];
    return [
      { label: "Profiles", value: dashboard.overview.profiles, icon: Users },
      { label: "Resume versions", value: dashboard.overview.resume_versions, icon: FileText },
      { label: "Applications", value: dashboard.overview.applications, icon: Shield },
      { label: "Requests 24h", value: dashboard.system.requests_last_24h, icon: Activity },
    ];
  }, [dashboard]);

  if (!checked || !authed) {
    return null;
  }

  return (
    <div className="space-y-8" data-testid="admin-page">
      <div className="flex items-center justify-between">
        <div>
          <div className="label-mono mb-3">System</div>
          <h1 className="font-heading text-4xl font-medium">Admin Dashboard</h1>
        </div>
        <Badge variant="success" dot>
          Authenticated
        </Badge>
      </div>

      {loading && !dashboard ? (
        <Card className="p-10 text-center text-sm text-[hsl(var(--muted-foreground))]">Loading admin data...</Card>
      ) : null}

      {dashboard ? (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <metric.icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <div className="label-mono">{metric.label}</div>
                </div>
                <div className="font-heading font-mono text-3xl font-medium">{metric.value}</div>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="p-6">
              <div className="label-mono mb-4">System health</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span>Database</span><Badge variant="outline">{dashboard.system.database_backend}</Badge></div>
                <div className="flex items-center justify-between"><span>Admin guard</span><Badge variant={dashboard.system.admin_guard_enabled ? "success" : "danger"}>{String(dashboard.system.admin_guard_enabled)}</Badge></div>
                <div className="flex items-center justify-between"><span>Rate limit</span><Badge variant={dashboard.system.rate_limit_enabled ? "success" : "outline"}>{dashboard.system.rate_limit_enabled ? "enabled" : "disabled"}</Badge></div>
                <div className="flex items-center justify-between"><span>Window</span><span className="font-mono text-xs">{dashboard.system.rate_limit_max_requests}/{dashboard.system.rate_limit_window_seconds}s</span></div>
                <div className="flex items-center justify-between"><span>Google AI</span><Badge variant={dashboard.system.google_ai_configured ? "success" : "outline"}>{dashboard.system.google_ai_configured ? "configured" : "off"}</Badge></div>
                <div className="flex items-center justify-between"><span>OpenAI</span><Badge variant={dashboard.system.openai_ai_configured ? "success" : "outline"}>{dashboard.system.openai_ai_configured ? "configured" : "off"}</Badge></div>
                <div className="flex items-center justify-between"><span>Errors 24h</span><Badge variant={dashboard.system.errors_last_24h > 0 ? "warning" : "success"}>{dashboard.system.errors_last_24h}</Badge></div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="label-mono mb-4">Recent profiles</div>
              <div className="space-y-3">
                {dashboard.recent_profiles.map((profile) => (
                  <div key={profile.user_id} className="rounded-lg border border-[hsl(var(--border))] p-3">
                    <div className="text-sm font-medium">{profile.full_name}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{profile.email}</div>
                    {profile.target_role ? (
                      <div className="mt-2">
                        <Badge variant="outline">{profile.target_role}</Badge>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="label-mono mb-4">Application statuses</div>
              <div className="space-y-3">
                {dashboard.application_statuses.map((item) => (
                  <div key={item.status} className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3">
                    <span className="text-sm">{item.status}</span>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <div className="border-b border-[hsl(var(--border))] p-6">
              <h3 className="font-heading text-lg font-medium">Audit log</h3>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">Recent request activity from backend middleware</p>
            </div>
            <div className="font-mono text-xs">
              <div className="grid grid-cols-[80px_1fr_80px_140px_90px] gap-4 border-b border-[hsl(var(--border))] px-6 py-2.5 label-mono">
                <div>Method</div>
                <div>Path</div>
                <div>Status</div>
                <div>IP</div>
                <div className="text-right">Duration</div>
              </div>
              {(auditLogs.length ? auditLogs : dashboard.recent_audit_logs).map((log) => (
                <div key={log.log_id} className="grid grid-cols-[80px_1fr_80px_140px_90px] gap-4 border-b border-[hsl(var(--border))] px-6 py-3 last:border-0 hover:bg-[hsl(var(--accent))]/40">
                  <div><Badge variant={log.method === "POST" ? "default" : "outline"}>{log.method}</Badge></div>
                  <div className="truncate">{log.path}</div>
                  <div><Badge variant={log.status_code >= 400 ? "danger" : "success"}>{log.status_code}</Badge></div>
                  <div className="text-[hsl(var(--muted-foreground))]">{log.client_ip || "—"}</div>
                  <div className="text-right">{log.duration_ms}ms</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
