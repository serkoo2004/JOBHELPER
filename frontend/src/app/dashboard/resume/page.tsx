"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Download,
  Eye,
  FileText,
  RotateCcw,
  Save,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resumeApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

const warningTone = (text: string) => {
  const raw = text.toLowerCase();
  if (raw.includes("eksik") || raw.includes("zayıf") || raw.includes("güçlendir")) return "warning";
  if (raw.includes("hazır") || raw.includes("uyumlu")) return "success";
  return "outline";
};

function TemplateMiniPreview({ templateKey }: { templateKey: string }) {
  const key = templateKey.toLowerCase();

  if (key.includes("sidebar") || key.includes("burgundy") || key.includes("onyx")) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded bg-[#f7f7fb]">
        <div className="absolute inset-y-0 left-0 w-[34%] bg-[#1b2645]" />
        <div className="absolute left-[8%] top-[10%] h-10 w-10 rounded-full border-2 border-white/80 bg-white/20" />
        <div className="absolute left-[8%] top-[26%] h-1.5 w-[18%] rounded bg-white/70" />
        <div className="absolute left-[8%] top-[31%] h-1.5 w-[14%] rounded bg-white/40" />
        <div className="absolute right-[8%] top-[12%] h-2 w-[40%] rounded bg-[#1b2645]" />
        <div className="absolute right-[8%] top-[18%] h-1.5 w-[48%] rounded bg-[#c5cad8]" />
        <div className="absolute right-[8%] top-[30%] h-1.5 w-[48%] rounded bg-[#1b2645]" />
        <div className="absolute right-[8%] top-[35%] h-1.5 w-[44%] rounded bg-[#d0d5e2]" />
        <div className="absolute right-[8%] top-[40%] h-1.5 w-[40%] rounded bg-[#d0d5e2]" />
        <div className="absolute right-[8%] top-[53%] h-1.5 w-[48%] rounded bg-[#1b2645]" />
        <div className="absolute right-[8%] top-[58%] h-1.5 w-[42%] rounded bg-[#d0d5e2]" />
        <div className="absolute right-[8%] top-[63%] h-1.5 w-[45%] rounded bg-[#d0d5e2]" />
      </div>
    );
  }

  if (key.includes("timeline") || key.includes("edinburgh")) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded bg-[#fbfbfd]">
        <div className="absolute inset-y-0 left-0 w-[30%] bg-[#5a5f92]" />
        <div className="absolute left-[7%] top-[10%] h-9 w-9 rounded-full border-2 border-white bg-[#d7daef]" />
        <div className="absolute right-[8%] top-[12%] h-2 w-[42%] rounded bg-[#212850]" />
        <div className="absolute left-[35%] top-[25%] h-px w-[52%] bg-[#cad0df]" />
        <div className="absolute left-[35%] top-[32%] h-1.5 w-[34%] rounded bg-[#212850]" />
        <div className="absolute left-[35%] top-[37%] h-1.5 w-[48%] rounded bg-[#d7daef]" />
        <div className="absolute left-[35%] top-[42%] h-1.5 w-[44%] rounded bg-[#d7daef]" />
        <div className="absolute left-[35%] top-[56%] h-1.5 w-[34%] rounded bg-[#212850]" />
        <div className="absolute left-[35%] top-[61%] h-1.5 w-[48%] rounded bg-[#d7daef]" />
        <div className="absolute left-[35%] top-[66%] h-1.5 w-[43%] rounded bg-[#d7daef]" />
      </div>
    );
  }

  if (key.includes("grid") || key.includes("crimson") || key.includes("classic")) {
    return (
      <div className="relative aspect-[3/4] overflow-hidden rounded bg-[#ffffff]">
        <div className="absolute left-[8%] top-[10%] h-2 w-[45%] rounded bg-[#1e293b]" />
        <div className="absolute left-[8%] top-[16%] h-1.5 w-[60%] rounded bg-[#c7d0dd]" />
        <div className="absolute left-[8%] top-[28%] grid w-[84%] grid-cols-2 gap-2">
          <div className="h-16 rounded border border-[#dbe2ea] bg-[#f8fafc]" />
          <div className="h-16 rounded border border-[#dbe2ea] bg-[#f8fafc]" />
        </div>
        <div className="absolute left-[8%] top-[58%] h-1.5 w-[30%] rounded bg-[#1e293b]" />
        <div className="absolute left-[8%] top-[63%] h-1.5 w-[76%] rounded bg-[#d7dee7]" />
        <div className="absolute left-[8%] top-[68%] h-1.5 w-[72%] rounded bg-[#d7dee7]" />
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded bg-[#f8fafc]">
      <div className="absolute left-[8%] top-[10%] h-2 w-[40%] rounded bg-[#111827]" />
      <div className="absolute left-[8%] top-[16%] h-1.5 w-[60%] rounded bg-[#d1d5db]" />
      <div className="absolute left-[8%] top-[30%] h-1.5 w-[28%] rounded bg-[#111827]" />
      <div className="absolute left-[8%] top-[35%] h-1.5 w-[80%] rounded bg-[#d1d5db]" />
      <div className="absolute left-[8%] top-[40%] h-1.5 w-[76%] rounded bg-[#d1d5db]" />
      <div className="absolute left-[8%] top-[52%] h-1.5 w-[28%] rounded bg-[#111827]" />
      <div className="absolute left-[8%] top-[57%] h-1.5 w-[80%] rounded bg-[#d1d5db]" />
      <div className="absolute left-[8%] top-[62%] h-1.5 w-[74%] rounded bg-[#d1d5db]" />
    </div>
  );
}

export default function ResumeStudioPage() {
  const { profileId } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("smart");
  const [targetRole, setTargetRole] = useState("");
  const [jd, setJd] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<any | null>(null);
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [editableTitle, setEditableTitle] = useState("");
  const [editableSummary, setEditableSummary] = useState("");
  const [editableContent, setEditableContent] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await resumeApi.templates();
        setTemplates([{ key: "smart", name: "AI Smart", description: "Backend chooses template." }, ...data]);
      } catch {
        toast.error("Template list could not be loaded.");
      }
    };
    void loadTemplates();
  }, []);

  useEffect(() => {
    const loadSaved = async () => {
      if (!profileId) {
        setSavedResumes([]);
        return;
      }
      try {
        const data = await resumeApi.listSaved(profileId);
        setSavedResumes(data || []);
      } catch {
        setSavedResumes([]);
      }
    };
    void loadSaved();
  }, [profileId]);

  useEffect(() => {
    setEditableTitle(draft?.title || "");
    setEditableSummary(draft?.summary || "");
    setEditableContent(draft?.content || "");
    if (draft?.template) {
      setSelectedTemplate(draft.template);
    }
  }, [draft]);

  const warnings = useMemo(
    () => (draft?.profile_warnings || []).map((msg: string) => ({ msg, variant: warningTone(msg) })),
    [draft]
  );

  const hasUnsavedDraftChanges =
    Boolean(draft) &&
    (editableTitle !== (draft?.title || "") ||
      editableSummary !== (draft?.summary || "") ||
      editableContent !== (draft?.content || "") ||
      selectedTemplate !== (draft?.template || selectedTemplate));

  const onGenerate = async () => {
    if (!profileId) {
      toast.error("Save your profile first.");
      return;
    }

    setGenerating(true);
    try {
      const response = await resumeApi.autoDraft({
        profile_id: profileId,
        template: selectedTemplate,
        tone: "professional",
        target_role: targetRole || undefined,
        auto_professionalize_photo: true,
        generation_context: {
          cv_goal: "Premium üst düzey firma başvurusu",
          visual_preferences: "Clean premium studio layout",
          optimization_target: jd ? "ATS uyumu" : "Kurumsal görünüm",
          job_description: jd || undefined,
        },
      });
      setDraft(response);
      toast.success("Auto-draft ready.");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Auto-draft failed.");
    } finally {
      setGenerating(false);
    }
  };

  const saveDraftChanges = async () => {
    if (!draft?.draft_id) return;
    setSaving(true);
    try {
      const updated = await resumeApi.updateDraft(draft.draft_id, {
        title: editableTitle,
        summary: editableSummary,
        content: editableContent,
        template: selectedTemplate,
      });
      setDraft(updated);
      toast.success("Draft updated.");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Draft update failed.");
    } finally {
      setSaving(false);
    }
  };

  const finalizeDraft = async () => {
    if (!draft?.draft_id) return null;
    if (hasUnsavedDraftChanges) {
      const saved = await resumeApi.updateDraft(draft.draft_id, {
        title: editableTitle,
        summary: editableSummary,
        content: editableContent,
        template: selectedTemplate,
      });
      setDraft(saved);
    }
    try {
      const finalized = await resumeApi.finalize(draft.draft_id);
      setDraft(finalized);
      toast.success("Draft finalized.");
      return finalized;
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Finalize failed.");
      return null;
    }
  };

  const exportDraft = async (format: "pdf" | "docx") => {
    if (!draft?.draft_id) {
      toast.error("Generate a draft first.");
      return;
    }
    const activeDraft = draft.finalized ? draft : await finalizeDraft();
    if (!activeDraft?.draft_id) return;
    try {
      await resumeApi.export(activeDraft.draft_id, format);
      toast.success(`${format.toUpperCase()} download started.`);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Export failed.");
    }
  };

  const restoreLatest = async (resumeId: string, versionNumber: number) => {
    try {
      const restored = await resumeApi.restoreVersion(resumeId, versionNumber);
      setDraft(restored);
      toast.success(`Version v${versionNumber} restored.`);
    } catch {
      toast.error("Restore failed.");
    }
  };

  return (
    <div className="space-y-8" data-testid="resume-studio">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="label-mono mb-3">Studio</div>
          <h1 className="font-heading text-4xl font-medium">Resume Studio</h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
            Real backend flow: stored profile, AI review, editable draft, finalize, then export.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/upload-cv" className="inline-flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> Import existing
            </Link>
          </Button>
          <Button size="sm" onClick={onGenerate} disabled={generating}>
            <Wand2 className="h-3.5 w-3.5" />
            {generating ? "Drafting…" : "Auto-draft"}
          </Button>
        </div>
      </div>

      {!profileId ? (
        <Card className="border-[hsl(var(--warning))]/30 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-[hsl(var(--warning))]" />
            <div>
              <div className="font-medium">Profile required</div>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                Resume Studio works from the stored profile in the backend. First fill the Profile screen, then generate here.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="label-mono">Generation setup</div>
              <Badge variant="success" dot>{profileId ? "profile linked" : "profile missing"}</Badge>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Target role</Label>
                <Input placeholder="Senior Product Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Template</Label>
                <select
                  className="flex h-11 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3.5 py-2 text-sm"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {templates.map((template) => (
                    <option key={template.key} value={template.key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Job description</Label>
                <Textarea
                  placeholder="Paste a JD. The backend will tailor positioning and warnings."
                  rows={6}
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="label-mono">Coach review</div>
              <Badge variant="success" dot>{warnings.length ? `${warnings.length} notes` : "Ready"}</Badge>
            </div>
            <div className="space-y-3">
              {warnings.length === 0 ? (
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Generate a draft and the backend will return real warning cards here.
                </div>
              ) : (
                warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-none ${
                        w.variant === "success"
                          ? "bg-[hsl(var(--success))]"
                          : w.variant === "warning"
                          ? "bg-[hsl(var(--warning))]"
                          : "bg-[hsl(var(--muted-foreground))]"
                      }`}
                    />
                    <p className="text-sm leading-relaxed">{w.msg}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="label-mono mb-3">Saved resumes</div>
            <div className="space-y-2">
              {savedResumes.length === 0 ? (
                <div className="text-sm text-[hsl(var(--muted-foreground))]">No saved resumes yet.</div>
              ) : (
                savedResumes.map((v) => (
                  <div
                    key={v.resume_id}
                    className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3 transition-colors hover:bg-[hsl(var(--accent))]/50"
                  >
                    <div className="w-10 font-mono text-xs">v{v.latest_version}</div>
                    <div className="flex-1">
                      <div className="text-sm">{v.title}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))]">{v.template || "smart"}</div>
                    </div>
                    <Button size="xs" variant="ghost" className="gap-1" onClick={() => void restoreLatest(v.resume_id, v.latest_version)}>
                      <RotateCcw className="h-3 w-3" /> Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4 xl:col-span-5">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="label-mono">Draft editor</div>
                <div className="mt-1 font-heading text-xl">Edit before finalize</div>
              </div>
              {draft?.finalized ? <Badge variant="success">Finalized</Badge> : <Badge variant="outline">Draft</Badge>}
            </div>

            {!draft ? (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                No draft yet. Generate one from the backend first.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Title</Label>
                  <Input value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Summary</Label>
                  <Textarea rows={4} value={editableSummary} onChange={(e) => setEditableSummary(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Content</Label>
                  <Textarea rows={18} value={editableContent} onChange={(e) => setEditableContent(e.target.value)} className="font-mono text-sm leading-relaxed" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => void saveDraftChanges()} disabled={!hasUnsavedDraftChanges || saving}>
                    <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button onClick={() => void finalizeDraft()}>
                    <Check className="h-4 w-4" /> Finalize
                  </Button>
                  <Button variant="secondary" onClick={() => void exportDraft("pdf")}>
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                  <Button variant="secondary" onClick={() => void exportDraft("docx")}>
                    <Download className="h-4 w-4" /> DOCX
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4 xl:col-span-3">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <div className="label-mono">Template gallery</div>
            </div>
            <p className="mb-4 text-xs text-[hsl(var(--muted-foreground))]">
              These are protected visual previews generated in the interface, not downloadable image files.
            </p>
            <div className="max-h-[340px] space-y-2.5 overflow-y-auto pr-1">
              {templates.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedTemplate(t.key)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    selectedTemplate === t.key
                      ? "border-[hsl(var(--foreground))] bg-[hsl(var(--accent))]"
                      : "border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]/60"
                  }`}
                >
                  <div className="mb-2 pointer-events-none select-none">
                    <TemplateMiniPreview templateKey={t.key} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium">{t.name}</div>
                      <div className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                        {t.layout_hint || t.description}
                      </div>
                    </div>
                    {selectedTemplate === t.key ? <Check className="h-3.5 w-3.5" /> : null}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="label-mono">Preview</span>
              </div>
              <Badge variant="mono">{selectedTemplate.replace("_", " ")}</Badge>
            </div>
            <div className="m-4 aspect-[8.5/11] overflow-auto rounded-lg bg-white p-6 text-zinc-900 shadow-md">
              <div className="mb-4 border-b border-zinc-300 pb-4">
                <h2 className="font-heading text-2xl">{editableTitle || "Resume Preview"}</h2>
                <div className="mt-1 text-sm text-zinc-600">{targetRole || draft?.template || "Template-aware preview"}</div>
                <div className="mt-1 text-xs text-zinc-500">{draft?.template_reason || "Generate a draft to see real content."}</div>
              </div>
              <div className="mb-4 text-sm font-medium text-zinc-700">{editableSummary || "Summary will appear here."}</div>
              <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-700">
                {editableContent || "Generate a draft to see the real backend CV output here."}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
