"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea, Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { applicationsApi, assetsApi, careerApi, profileApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

type StoredProfile = any;
type ApplicationRecord = { application_id: string; company_name: string; role_name: string; status: string };
type StudioResult = {
  original_path: string;
  processed_path: string;
  preview_path: string;
  style: string;
  placement: {
    template: string;
    shape: string;
    align: string;
    size_hint: string;
    notes: string[];
  };
  recommendations: string[];
};

const toAssetUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `/backend${path.startsWith("/") ? path : `/${path}`}`;
};

const configs: Record<
  string,
  {
    title: string;
    desc: string;
    inputs: { label: string; key: string; type?: "text" | "textarea"; placeholder?: string }[];
  }
> = {
  "job-match": {
    title: "Job match",
    desc: "Compare your stored profile against a job description.",
    inputs: [
      { label: "Target role", key: "role", type: "text", placeholder: "Staff Product Engineer" },
      { label: "Company", key: "company", type: "text", placeholder: "Stripe" },
      { label: "Job description", key: "jd", type: "textarea", placeholder: "Paste JD…" },
    ],
  },
  linkedin: {
    title: "LinkedIn optimize",
    desc: "Rewrite your headline and About using the stored profile.",
    inputs: [{ label: "Target role", key: "role", type: "text", placeholder: "Principal Product Designer" }],
  },
  portfolio: {
    title: "Portfolio summary",
    desc: "Turn profile projects into a sharper narrative.",
    inputs: [
      { label: "Focus", key: "focus", type: "text", placeholder: "Hiring manager narrative" },
      { label: "Audience", key: "audience", type: "text", placeholder: "Recruiters and founders" },
    ],
  },
  interview: {
    title: "Interview prep",
    desc: "Role-specific questions and talking points from the backend.",
    inputs: [
      { label: "Role", key: "role", type: "text", placeholder: "Staff Engineer" },
      { label: "Company", key: "company", type: "text", placeholder: "Linear" },
      { label: "Job description", key: "jd", type: "textarea", placeholder: "Paste JD…" },
    ],
  },
  roadmap: {
    title: "Career roadmap",
    desc: "Gap analysis plus a concrete next-step plan.",
    inputs: [
      { label: "Target role", key: "role", type: "text", placeholder: "Senior PM" },
      { label: "Target country", key: "country", type: "text", placeholder: "Germany" },
      { label: "Timeline (months)", key: "months", type: "text", placeholder: "3" },
    ],
  },
  photo: {
    title: "Photo assistant",
    desc: "Use your stored profile and uploaded photo. The backend automatically chooses the right CV headshot style from the skill system.",
    inputs: [
      { label: "Photo path", key: "photo_path", type: "text", placeholder: "/photos/fotom.jpg" },
      { label: "Template", key: "template", type: "text", placeholder: "royal_timeline" },
    ],
  },
  coach: {
    title: "Application coach",
    desc: "Choose an existing application and get tactical follow-up advice.",
    inputs: [],
  },
};

export default function ToolPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const cfg = configs[slug];
  const { profileId } = useAuth();

  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<{ title: string; summary: string; content: string; recommendations: string[] } | null>(null);
  const [studio, setStudio] = useState<StudioResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContext = async () => {
      try {
        if (profileId) {
          const profileResponse = await profileApi.get(profileId);
          setProfile(profileResponse);
          setValues((prev) => ({
            ...prev,
            role: prev.role || profileResponse?.target_role || "",
            template: prev.template || "smart",
            photo_path: prev.photo_path || profileResponse?.photo_url || "",
          }));
        }

        if (slug === "coach") {
          const applicationResponse = await applicationsApi.list();
          setApplications(applicationResponse || []);
          if (applicationResponse?.[0]?.application_id) {
            setSelectedApplicationId(applicationResponse[0].application_id);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Tool context could not be loaded.");
      }
    };

    void loadContext();
  }, [profileId, slug]);

  const canRun = useMemo(() => {
    if (slug === "coach") {
      return Boolean(selectedApplicationId);
    }
    return Boolean(profile);
  }, [profile, selectedApplicationId, slug]);

  if (!cfg) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/career-tools" className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <h1 className="font-heading text-3xl">Tool not found.</h1>
      </div>
    );
  }

  const run = async () => {
    if (!canRun) {
      toast.error(slug === "coach" ? "Create an application first." : "Create a profile first.");
      return;
    }

    setLoading(true);
    setOutput(null);
    setStudio(null);
    try {
      let result;
      switch (slug) {
        case "job-match":
          result = await careerApi.matchJob({
            profile,
            job_description: values.jd || "",
            company_name: values.company || undefined,
            target_role: values.role || undefined,
          });
          break;
        case "linkedin":
          result = await careerApi.optimizeLinkedIn({
            profile,
            target_role: values.role || undefined,
            tone: "professional",
          });
          break;
        case "portfolio":
          result = await careerApi.portfolioSummary({
            profile,
            focus: values.focus || undefined,
            target_audience: values.audience || undefined,
          });
          break;
        case "interview":
          result = await careerApi.interviewPrep({
            profile,
            company_name: values.company || undefined,
            target_role: values.role || undefined,
            job_description: values.jd || undefined,
          });
          break;
        case "roadmap":
          result = await careerApi.roadmap({
            profile,
            target_role: values.role || undefined,
            target_country: values.country || undefined,
            timeline_months: Number(values.months || 3),
          });
          break;
        case "photo":
          {
            const photoPath = values.photo_path || profile?.photo_url || undefined;
            const template = values.template || undefined;
            const [assistantResult, studioResult] = await Promise.all([
              careerApi.photoAssistant({
                profile,
                photo_path: photoPath,
                template,
                desired_output: "black_white_cv_headshot",
              }),
              photoPath
                ? assetsApi.professionalizePhoto({
                    photo_path: photoPath,
                    template,
                  })
                : Promise.resolve(null),
            ]);
            result = assistantResult;
            setStudio(studioResult);
          }
          break;
        case "coach":
          result = await careerApi.coachApplication(selectedApplicationId);
          break;
        default:
          throw new Error("Unsupported tool");
      }

      setOutput(result);
      toast.success(`${cfg.title} complete.`);
    } catch (error) {
      console.error(error);
      toast.error(`${cfg.title} failed.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8" data-testid={`tool-page-${slug}`}>
      <div>
        <Link href="/dashboard/career-tools" className="mb-4 inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
          <ArrowLeft className="h-3.5 w-3.5" /> All tools
        </Link>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="label-mono mb-2">Career tool</div>
            <h1 className="font-heading text-4xl font-medium">{cfg.title}</h1>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">{cfg.desc}</p>
          </div>
          <Badge variant="mono">{slug}</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div className="label-mono">Inputs</div>
          {!profile && slug !== "coach" ? (
            <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
              This tool uses the stored profile. Save your profile first.
            </div>
          ) : null}

          {slug === "coach" ? (
            <div className="space-y-1.5">
              <Label>Application</Label>
              <select
                value={selectedApplicationId}
                onChange={(e) => setSelectedApplicationId(e.target.value)}
                className="flex h-11 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3.5 py-2 text-sm"
              >
                <option value="">Select an application</option>
                {applications.map((application) => (
                  <option key={application.application_id} value={application.application_id}>
                    {application.company_name} · {application.role_name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {slug === "photo" ? (
            <div className="rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.35] p-4 text-sm text-[hsl(var(--muted-foreground))]">
              No manual prompt needed. This tool reads your uploaded photo, stored profile and selected template, then chooses the right CV headshot treatment automatically.
            </div>
          ) : null}

          {cfg.inputs.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  rows={6}
                  value={values[field.key] || ""}
                  onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              ) : (
                <Input
                  value={values[field.key] || ""}
                  onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          <Button size="lg" className="w-full" onClick={() => void run()} disabled={loading || !canRun}>
            <Sparkles className="h-4 w-4" /> {loading ? "Running…" : "Run"}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="label-mono">Output</div>
            {output ? <Badge variant="success" dot>Ready</Badge> : null}
          </div>
          <div className="min-h-[300px]">
            {output ? (
              <div className="space-y-4">
                {slug === "photo" && studio?.preview_path ? (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={toAssetUrl(studio.preview_path)}
                      alt="Generated studio headshot"
                      className="h-[260px] w-full rounded-xl border border-[hsl(var(--border))] object-cover"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="mono">{studio.style}</Badge>
                      <Badge variant="outline">{studio.placement.template}</Badge>
                      <Badge variant="outline">{studio.placement.shape}</Badge>
                    </div>
                    <a href={toAssetUrl(studio.processed_path)} download className="inline-flex">
                      <Button size="sm" variant="secondary">
                        <Download className="h-3.5 w-3.5" /> Download photo
                      </Button>
                    </a>
                  </div>
                ) : null}
                <div>
                  <h3 className="font-heading text-xl">{output.title}</h3>
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{output.summary}</p>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{output.content}</pre>
                {output.recommendations?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {output.recommendations.map((item, index) => (
                      <Badge key={`${item}-${index}`} variant="outline">{item}</Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))]">
                {slug === "photo" ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Run the tool to generate a CV-ready headshot preview.
                  </div>
                ) : (
                  "Run the tool to see output."
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
