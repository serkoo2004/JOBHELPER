"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, LayoutGrid, Plus, RefreshCw, Rows, Sparkles, Target } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Textarea } from "@/components/ui/input";
import { applicationsApi, careerApi } from "@/lib/api";

type Status = "saved" | "pending" | "applied" | "screen" | "onsite" | "offer" | "rejected";

type ApplicationRecord = {
  application_id: string;
  company_name: string;
  role_name: string;
  status: string;
  source?: string | null;
  job_url?: string | null;
  notes?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  applied_at?: string | null;
  interview_date?: string | null;
};

const COLUMNS: { id: Status; label: string }[] = [
  { id: "saved", label: "Saved" },
  { id: "pending", label: "Pending" },
  { id: "applied", label: "Applied" },
  { id: "screen", label: "Phone screen" },
  { id: "onsite", label: "Onsite" },
  { id: "offer", label: "Offer" },
  { id: "rejected", label: "Closed" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "offer":
      return "success" as const;
    case "rejected":
      return "danger" as const;
    case "screen":
    case "onsite":
      return "warning" as const;
    case "applied":
    case "pending":
      return "default" as const;
    default:
      return "outline" as const;
  }
};

const normalizeStatus = (status?: string | null): Status => {
  const value = (status || "saved").toLowerCase();
  if (["saved", "pending", "applied", "screen", "onsite", "offer", "rejected"].includes(value)) {
    return value as Status;
  }
  return "saved";
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState<ApplicationRecord[]>([]);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coachId, setCoachId] = useState<string | null>(null);
  const [coachOutput, setCoachOutput] = useState<{
    title: string;
    summary: string;
    content: string;
    recommendations: string[];
  } | null>(null);
  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "saved",
    link: "",
    notes: "",
    source: "manual",
    nextAction: "",
  });

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationsApi.list();
      setApps(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Applications could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const createApplication = async () => {
    if (!form.company || !form.role) {
      toast.error("Company and role are required.");
      return;
    }

    setSaving(true);
    try {
      const created = await applicationsApi.create({
        company_name: form.company,
        role_name: form.role,
        source: form.source || "manual",
        job_url: form.link || null,
        status: form.status,
        notes: form.notes || null,
        next_action: form.nextAction || null,
        applied_at: form.status === "applied" ? new Date().toISOString().slice(0, 10) : null,
      });

      setApps((prev) => [created, ...prev]);
      setForm({
        company: "",
        role: "",
        status: "saved",
        link: "",
        notes: "",
        source: "manual",
        nextAction: "",
      });
      setOpen(false);
      toast.success("Application added.");
    } catch (error) {
      console.error(error);
      toast.error("Application could not be created.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (applicationId: string, status: Status) => {
    try {
      const updated = await applicationsApi.update(applicationId, {
        status,
        ...(status === "applied" ? { next_action: "Wait for recruiter response." } : {}),
      });
      setApps((prev) => prev.map((app) => (app.application_id === applicationId ? updated : app)));
      toast.success("Application updated.");
    } catch (error) {
      console.error(error);
      toast.error("Status could not be updated.");
    }
  };

  const requestCoach = async (applicationId: string) => {
    setCoachId(applicationId);
    setCoachOutput(null);
    try {
      const result = await careerApi.coachApplication(applicationId);
      setCoachOutput(result);
      toast.success("AI coaching ready.");
    } catch (error) {
      console.error(error);
      toast.error("Coach guidance could not be loaded.");
    }
  };

  const grouped = useMemo(
    () =>
      COLUMNS.map((column) => ({
        ...column,
        items: apps.filter((app) => normalizeStatus(app.status) === column.id),
      })),
    [apps],
  );

  const summary = useMemo(() => {
    const applied = apps.filter((app) => normalizeStatus(app.status) === "applied").length;
    const interviewing = apps.filter((app) => ["screen", "onsite"].includes(normalizeStatus(app.status))).length;
    const offers = apps.filter((app) => normalizeStatus(app.status) === "offer").length;
    return { applied, interviewing, offers };
  }, [apps]);

  return (
    <div className="space-y-8" data-testid="applications-page">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div>
          <div className="label-mono mb-3">Opportunity pipeline</div>
          <h1 className="font-heading text-4xl font-medium">Applications</h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
            This is where you track whether you actually applied, where each role sits in the pipeline, and what to do next.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => void loadApplications()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="flex rounded-md border border-[hsl(var(--border))] p-0.5">
            <Button size="sm" variant={view === "kanban" ? "primary" : "ghost"} onClick={() => setView("kanban")}>
              <LayoutGrid className="h-3.5 w-3.5" /> Board
            </Button>
            <Button size="sm" variant={view === "table" ? "primary" : "ghost"} onClick={() => setView("table")}>
              <Rows className="h-3.5 w-3.5" /> Table
            </Button>
          </div>
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button size="sm" data-testid="applications-new">
                <Plus className="h-3.5 w-3.5" /> New
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-xl">
                <Dialog.Title className="font-heading text-xl">New application</Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  Track the role first, then move it through the pipeline as real events happen.
                </Dialog.Description>
                <div className="mt-6 space-y-3">
                  <div className="space-y-1.5">
                    <Label>Company</Label>
                    <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Status</Label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="flex h-11 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3.5 py-2 text-sm"
                      >
                        {COLUMNS.map((column) => (
                          <option key={column.id} value={column.id}>
                            {column.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Source</Label>
                      <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="LinkedIn" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Job URL</Label>
                    <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Next action</Label>
                    <Input value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })} placeholder="Send follow-up on Tuesday" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notes</Label>
                    <Textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => void createApplication()} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-mono">Applied</div>
            <Briefcase className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="font-heading text-3xl">{summary.applied}</div>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Roles you have actually submitted.</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-mono">Interviewing</div>
            <Target className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="font-heading text-3xl">{summary.interviewing}</div>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Roles that moved into a live conversation stage.</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="label-mono">Offers</div>
            <Sparkles className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="font-heading text-3xl">{summary.offers}</div>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Positive end states across your tracked pipeline.</p>
        </Card>
      </div>

      <Dialog.Root open={Boolean(coachId)} onOpenChange={(value) => !value && setCoachId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-xl">
            <Dialog.Title className="font-heading text-xl">Application Coach</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Tactical next steps for the selected application.
            </Dialog.Description>
            <div className="mt-6 space-y-4">
              {!coachOutput ? (
                <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  Loading coach guidance...
                </div>
              ) : (
                <>
                  <div>
                    <div className="label-mono mb-2">Summary</div>
                    <h3 className="font-heading text-xl">{coachOutput.title}</h3>
                    <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{coachOutput.summary}</p>
                  </div>
                  <Card className="p-5">
                    <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{coachOutput.content}</pre>
                  </Card>
                  {coachOutput.recommendations?.length > 0 && (
                    <div className="space-y-2">
                      <div className="label-mono">Recommendations</div>
                      <div className="flex flex-wrap gap-2">
                        {coachOutput.recommendations.map((item, index) => (
                          <Badge key={`${item}-${index}`} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setCoachId(null)}>
                Close
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {loading ? (
        <Card className="p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">Loading applications...</Card>
      ) : view === "kanban" ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {grouped.map((column) => (
            <div key={column.id} className="min-h-[260px]">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="label-mono">{column.label}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{column.items.length}</div>
              </div>
              <div className="space-y-2">
                {column.items.map((app) => (
                  <Card key={app.application_id} className="p-4">
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{app.company_name}</div>
                    <div className="mt-1 text-sm font-medium">{app.role_name}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(app.status)}>{normalizeStatus(app.status)}</Badge>
                      {app.source ? <Badge variant="outline">{app.source}</Badge> : null}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {app.next_action || "No next action set yet."}
                      </div>
                      <select
                        value={normalizeStatus(app.status)}
                        onChange={(e) => void updateStatus(app.application_id, e.target.value as Status)}
                        className="flex h-9 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-xs"
                      >
                        {COLUMNS.map((status) => (
                          <option key={status.id} value={status.id}>
                            Move to {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button variant="secondary" size="xs" className="mt-4 w-full" onClick={() => void requestCoach(app.application_id)}>
                      <Sparkles className="h-3 w-3" /> Coach
                    </Button>
                  </Card>
                ))}
                {column.items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-3 text-center text-xs text-[hsl(var(--muted-foreground))]">
                    Empty
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-[hsl(var(--border))]">
            <div className="grid grid-cols-12 gap-3 px-6 py-3 label-mono">
              <div className="col-span-3">Company</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Next action</div>
              <div className="col-span-2 text-right">AI</div>
            </div>
            {apps.map((app) => (
              <div key={app.application_id} className="grid grid-cols-12 items-center gap-3 px-6 py-4 hover:bg-[hsl(var(--accent))]/40">
                <div className="col-span-3">
                  <div className="text-sm font-medium">{app.company_name}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">{app.source || "manual"}</div>
                </div>
                <div className="col-span-3 text-sm">{app.role_name}</div>
                <div className="col-span-2">
                  <select
                    value={normalizeStatus(app.status)}
                    onChange={(e) => void updateStatus(app.application_id, e.target.value as Status)}
                    className="flex h-9 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-xs"
                  >
                    {COLUMNS.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 text-xs text-[hsl(var(--muted-foreground))]">
                  {app.next_action || "No action set"}
                </div>
                <div className="col-span-2 text-right">
                  <Button variant="ghost" size="xs" onClick={() => void requestCoach(app.application_id)}>
                    Coach
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
