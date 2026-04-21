"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, Sparkles, FileText, Briefcase, TrendingUp, Clock,
  Wand2, MessageSquare, Upload, Target
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { applicationsApi, profileApi, resumeApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80;
  const h = 26;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="text-[hsl(var(--foreground))]/70">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardHome() {
  const { user, profileId } = useAuth();
  const [profileFirstName, setProfileFirstName] = useState("");
  const firstName = profileFirstName || user?.name?.trim().split(/\s+/)[0] || "there";
  const [resumeCount, setResumeCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [latestResumes, setLatestResumes] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const applications = await applicationsApi.list();
        setApplicationCount(applications?.length || 0);
        setInterviewCount((applications || []).filter((item: any) => ["screen", "onsite", "offer"].includes((item.status || "").toLowerCase())).length);

        if (profileId) {
          const [profile, resumes] = await Promise.all([
            profileApi.get(profileId).catch(() => null),
            resumeApi.listSaved(profileId),
          ]);
          const storedName = String(profile?.full_name || "").trim();
          setProfileFirstName(storedName ? storedName.split(/\s+/)[0] : "");
          setResumeCount(resumes?.length || 0);
          setLatestResumes(resumes || []);
        } else {
          setProfileFirstName("");
          setResumeCount(0);
          setLatestResumes([]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadDashboard();
  }, [profileId]);

  const stats = useMemo(
    () => [
      { label: "Resumes", value: String(resumeCount), change: profileId ? "from stored profile" : "connect profile first", icon: FileText, trend: [0, 1, 1, 2, 2, 3, Math.max(3, resumeCount)] },
      { label: "Applications", value: String(applicationCount), change: applicationCount ? "tracked from backend" : "no applications yet", icon: Briefcase, trend: [0, 0, 1, 1, 2, 2, Math.max(2, applicationCount)] },
      { label: "Interviews", value: String(interviewCount), change: interviewCount ? "active pipeline" : "no interview stages yet", icon: MessageSquare, trend: [0, 0, 0, 1, 1, 1, Math.max(1, interviewCount)] },
      { label: "Profile ready", value: profileId ? "Yes" : "No", change: profileId ? "auto-draft enabled" : "save profile to unlock", icon: Target, trend: profileId ? [10, 20, 30, 45, 60, 80, 100] : [0, 0, 0, 0, 0, 0, 5] }
    ],
    [resumeCount, applicationCount, interviewCount, profileId]
  );

  const coachCards = useMemo(() => {
    const cards = [];

    if (!profileId) {
      cards.push({
        title: "Create your source profile",
        desc: "Resume drafts, cover letters and recommendations become much stronger once the stored profile exists.",
      });
    } else if (resumeCount === 0) {
      cards.push({
        title: "Generate your first draft",
        desc: "Use Auto-draft now that your profile is linked, then review the backend warning cards before exporting.",
      });
    } else {
      cards.push({
        title: "Refresh your strongest resume",
        desc: "Open Resume Studio, restore the latest version and run a new draft if your target role has shifted.",
      });
    }

    if (applicationCount === 0) {
      cards.push({
        title: "Start your pipeline",
        desc: "Add one real application so the tracker and follow-up logic can start surfacing next actions.",
      });
    } else if (interviewCount === 0) {
      cards.push({
        title: "Tighten application follow-ups",
        desc: "You have active applications but no interview stages yet. Review notes and next actions in the Applications screen.",
      });
    } else {
      cards.push({
        title: "Prepare interview narratives",
        desc: "Use Career Tools and Cover Letter to sharpen role-specific stories before your next conversation.",
      });
    }

    cards.push({
      title: "Keep assets production-ready",
      desc: "Use Assets to professionalize your profile photo and keep template references aligned with your strongest resume style.",
    });

    return cards.slice(0, 3);
  }, [applicationCount, interviewCount, profileId, resumeCount]);

  return (
    <div className="space-y-10" data-testid="dashboard-home">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-slide-up">
        <div>
          <div className="label-mono mb-3">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight">
            Good morning, {firstName}.
          </h1>
          <p className="mt-3 text-[hsl(var(--muted-foreground))] max-w-xl">
            {profileId
              ? "Your stored profile is connected. Resume drafts and tracking data are now coming from the backend."
              : "Connect a profile first, then this dashboard becomes your live career operating system."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" asChild>
            <Link href="/dashboard/upload-cv" data-testid="home-upload-cv">
              <Upload className="h-4 w-4" /> Upload CV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/resume" data-testid="home-new-resume">
              <Sparkles className="h-4 w-4" /> Auto-draft
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-6 hover:border-[hsl(var(--foreground))]/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 rounded-md border border-[hsl(var(--border))] flex items-center justify-center">
                <s.icon className="h-4 w-4" />
              </div>
              <Sparkline data={s.trend} />
            </div>
            <div className="font-heading text-3xl font-medium">{s.value}</div>
            <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{s.label}</div>
            <div className="mt-3 text-xs flex items-center gap-1 text-[hsl(var(--success))]">
              <TrendingUp className="h-3 w-3" /> {s.change}
            </div>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Quick Start */}
        <div className="lg:col-span-2">
          <Card className="relative overflow-hidden p-8 md:p-10">
            <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
            <div className="relative">
              <Badge variant="mono" className="mb-5">Quick start</Badge>
              <h2 className="font-heading text-2xl md:text-3xl font-medium tracking-tight">
                Drop a CV. Get a reviewed draft.
              </h2>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-md">
                PDF, DOCX, or TXT. We&apos;ll parse it, flag issues, and match it to the best template.
              </p>
              <div className="mt-8 border border-dashed border-[hsl(var(--border))] rounded-xl p-8 text-center bg-[hsl(var(--background))]">
                <Wand2 className="h-6 w-6 mx-auto text-[hsl(var(--muted-foreground))]" />
                <p className="mt-3 text-sm">
                  <Link href="/dashboard/upload-cv" className="underline underline-offset-4">
                    Upload an existing CV
                  </Link>{" "}
                  or use the flow-based builder
                </p>
                <div className="mt-4 flex gap-2 justify-center">
                  <Button size="sm" asChild>
                    <Link href="/dashboard/upload-cv">Upload</Link>
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href="/dashboard/resume">Start flow</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Suggestions */}
        <div>
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="label-mono">Coach · today</div>
              <Sparkles className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </div>
            <div className="space-y-4">
              {coachCards.map((s, i) => (
                <div key={i} className="group">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium leading-tight">{s.title}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{s.desc}</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
                  </div>
                  {i < 2 && <div className="divider-soft mt-4" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between p-6 border-b border-[hsl(var(--border))]">
          <div>
            <h3 className="font-heading text-lg font-medium">Recent activity</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Latest from your studio</p>
          </div>
          <Button variant="ghost" size="sm">See all →</Button>
        </div>
        <div className="divide-y divide-[hsl(var(--border))]">
          {(
            latestResumes.length
              ? latestResumes.slice(0, 4).map((resume, index) => ({
                  name: resume.title,
                  type: "Saved resume",
                  status: `v${resume.latest_version}`,
                  time: new Date(resume.updated_at).toLocaleDateString("tr-TR"),
                  variant: "success" as const,
                  idx: index,
                }))
              : [
                  { name: profileId ? "Stored profile is ready for drafting" : "Create your profile first", type: "Resume Studio", status: profileId ? "Generate now" : "Required", time: "now", variant: "outline" as const, idx: 0 },
                  { name: applicationCount ? "Applications are being tracked" : "No active applications yet", type: "Applications", status: applicationCount ? "Live" : "Add one", time: "now", variant: "outline" as const, idx: 1 },
                ]
          ).map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-[hsl(var(--accent))]/50 transition-colors">
              <div className="h-8 w-8 rounded-md bg-[hsl(var(--muted))] flex items-center justify-center text-xs font-mono">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{r.type}</div>
              </div>
              <Badge variant={r.variant}>{r.status}</Badge>
              <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5 w-24 justify-end">
                <Clock className="h-3 w-3" /> {r.time}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
