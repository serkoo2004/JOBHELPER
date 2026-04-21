"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { coverLetterApi, profileApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

type StoredProfile = {
  full_name: string;
  email: string;
  summary?: string | null;
  target_role?: string | null;
  skills?: string[] | null;
  experiences?: unknown[];
  projects?: unknown[];
};

export default function CoverLetterPage() {
  const { profileId } = useAuth();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState("professional");
  const [jd, setJd] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) {
        setProfile(null);
        return;
      }

      setLoadingProfile(true);
      try {
        const data = await profileApi.get(profileId);
        setProfile(data);
        if (!role && data?.target_role) {
          setRole(data.target_role);
        }
      } catch (error) {
        console.error(error);
        toast.error("Stored profile could not be loaded.");
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfile();
  }, [profileId, role]);

  const profileStrengths = useMemo(() => {
    if (!profile) return [];
    return [
      profile.target_role ? `Target role: ${profile.target_role}` : null,
      profile.skills?.length ? `${profile.skills.length} skills in profile` : null,
      profile.experiences?.length ? `${profile.experiences.length} experience blocks` : null,
      profile.projects?.length ? `${profile.projects.length} project blocks` : null,
    ].filter(Boolean) as string[];
  }, [profile]);

  const generate = async () => {
    if (!profile) {
      toast.error("Create a profile first so the letter uses real data.");
      return;
    }
    if (!company || !role) {
      toast.error("Company and role are required.");
      return;
    }

    setGenerating(true);
    try {
      const result = await coverLetterApi.generate({
        profile,
        company_name: company,
        job_title: role,
        tone,
        job_description: jd || undefined,
      });

      setOutput(result.content || "");
      setSummary(result.summary || "");
      setRecommendations(result.recommendations || []);
      toast.success("Cover letter generated.");
    } catch (error) {
      console.error(error);
      toast.error("Cover letter could not be generated.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8" data-testid="cover-letter-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="label-mono mb-3">Focused writing</div>
          <h1 className="font-heading text-4xl font-medium">Cover Letter</h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
            This uses the stored profile, company context and job description together. The goal is a sharp, believable letter, not generic filler.
          </p>
        </div>
        <Badge variant="mono">{profileId ? "profile connected" : "profile missing"}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Brief</CardTitle>
            <CardDescription>Give the generator enough context to sound intentional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Stripe" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Staff Product Engineer" />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <div className="flex flex-wrap gap-2">
                {["professional", "warm", "technical", "confident"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setTone(option)}
                    className={`rounded-full border px-3 py-2 text-xs transition-colors ${
                      tone === option
                        ? "border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                        : "border-[hsl(var(--border))]"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Job description</Label>
              <Textarea
                rows={10}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the JD or the most important responsibilities here."
              />
            </div>
            <Button size="lg" className="w-full" onClick={() => void generate()} disabled={generating || loadingProfile}>
              <Sparkles className="h-4 w-4" />
              {generating ? "Writing..." : "Generate cover letter"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile context</CardTitle>
              <CardDescription>This is what the backend currently knows about you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile ? (
                <>
                  <div>
                    <div className="font-heading text-xl">{profile.full_name}</div>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{profile.summary || "No summary saved yet."}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileStrengths.map((item, index) => (
                      <Badge key={`${item}-${index}`} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-5 text-sm text-[hsl(var(--muted-foreground))]">
                  Save a profile first. The generator is designed to write from real stored data, not empty placeholders.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-6">
              <div>
                <div className="label-mono">Generated letter</div>
                <div className="mt-1 font-heading text-2xl">{company || "Company"} · {role || "Role"}</div>
                {summary ? <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{summary}</p> : null}
              </div>
              <div className="flex gap-2">
                <Badge variant="mono">{tone}</Badge>
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(output);
                    toast.success("Copied to clipboard.");
                  }}
                  disabled={!output}
                >
                  <Copy className="h-3 w-3" /> Copy
                </Button>
              </div>
            </div>
            <div className="space-y-5 p-6">
              <div className="rounded-xl border border-[hsl(var(--border))] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4" /> Letter body
                </div>
                <Textarea
                  rows={18}
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  className="font-mono text-sm leading-relaxed"
                  placeholder="The generated letter will appear here."
                />
              </div>

              {recommendations.length ? (
                <div className="space-y-2">
                  <div className="label-mono">Recommendations</div>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.map((item, index) => (
                      <Badge key={`${item}-${index}`} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
