"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CheckCircle2, Plus, Save, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assetsApi, profileApi, resumeApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

type Entry = { id: string; title: string; subtitle: string; period: string; desc: string };
type ReviewState = {
  template: string | null;
  templateReason: string | null;
  warnings: string[];
  recommendations: string[];
};

const emptyReview: ReviewState = {
  template: null,
  templateReason: null,
  warnings: [],
  recommendations: [],
};

export default function ProfilePage() {
  const { profileId, setProfileId } = useAuth();
  const [basic, setBasic] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    bio: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experiences, setExperiences] = useState<Entry[]>([]);
  const [education, setEducation] = useState<Entry[]>([]);
  const [projects, setProjects] = useState<Entry[]>([]);
  const [photoPath, setPhotoPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewState>(emptyReview);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profileId) return;
    const loadProfile = async () => {
      try {
        const profile = await profileApi.get(profileId);
        setBasic({
          name: profile.full_name || "",
          title: profile.target_role || "",
          email: profile.email || "",
          phone: profile.phone || "",
          location: profile.location || "",
          website: profile.portfolio_url || "",
          linkedin: profile.linkedin_url || "",
          github: profile.github_url || "",
          bio: profile.summary || "",
        });
        setPhotoPath(profile.photo_url || "");
        setSkills(profile.skills || []);
        setExperiences(
          (profile.experiences || []).map((item: any) => ({
            id: crypto.randomUUID(),
            title: item.title || "",
            subtitle: item.company || "",
            period: [item.start_date, item.end_date].filter(Boolean).join(" - "),
            desc: (item.bullets || []).join("\n"),
          })),
        );
        setProjects(
          (profile.projects || []).map((item: any) => ({
            id: crypto.randomUUID(),
            title: item.name || "",
            subtitle: item.subtitle || "",
            period: "",
            desc: (item.bullets || []).join("\n"),
          })),
        );
        setEducation(
          (profile.education || []).map((item: any) => ({
            id: crypto.randomUUID(),
            title: item.degree || "",
            subtitle: item.school || "",
            period: [item.start_date, item.end_date].filter(Boolean).join(" - "),
            desc: (item.details || []).join("\n"),
          })),
        );
      } catch {
        toast.error("Stored profile could not be loaded.");
      }
    };
    void loadProfile();
  }, [profileId]);

  const completeness = useMemo(() => {
    const checks = [
      Boolean(basic.name),
      Boolean(basic.title),
      Boolean(basic.email),
      Boolean(basic.linkedin || basic.github || basic.website),
      Boolean(basic.bio),
      skills.length >= 4,
      experiences.length >= 1,
      projects.length >= 1,
      education.length >= 1,
      Boolean(photoPath),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [basic, skills, experiences.length, projects.length, education.length, photoPath]);

  const addEntry = (setter: React.Dispatch<React.SetStateAction<Entry[]>>) =>
    setter((current) => [...current, { id: crypto.randomUUID(), title: "", subtitle: "", period: "", desc: "" }]);

  const removeEntry = (setter: React.Dispatch<React.SetStateAction<Entry[]>>, id: string) =>
    setter((current) => current.filter((entry) => entry.id !== id));

  const updateEntry = (
    setter: React.Dispatch<React.SetStateAction<Entry[]>>,
    id: string,
    field: keyof Entry,
    value: string,
  ) => setter((current) => current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)));

  const addSkill = () => {
    const value = skillInput.trim();
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setSkillInput("");
  };

  const buildPayload = () => ({
    full_name: basic.name,
    email: basic.email,
    phone: basic.phone,
    location: basic.location,
    summary: basic.bio,
    target_role: basic.title,
    portfolio_url: basic.website,
    linkedin_url: basic.linkedin,
    github_url: basic.github,
    skills,
    experiences: experiences.map((entry) => {
      const [startDate, endDate] = entry.period.split("-").map((part) => part.trim());
      return {
        title: entry.title,
        company: entry.subtitle,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        bullets: entry.desc.split("\n").map((line) => line.trim()).filter(Boolean),
      };
    }),
    projects: projects.map((entry) => ({
      name: entry.title,
      subtitle: entry.subtitle,
      bullets: entry.desc.split("\n").map((line) => line.trim()).filter(Boolean),
    })),
    education: education.map((entry) => {
      const [startDate, endDate] = entry.period.split("-").map((part) => part.trim());
      return {
        degree: entry.title,
        school: entry.subtitle,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        details: entry.desc.split("\n").map((line) => line.trim()).filter(Boolean),
      };
    }),
    photo_url: photoPath || undefined,
  });

  const saveProfile = async () => {
    setLoading(true);
    try {
      const response = profileId
        ? await profileApi.update(profileId, buildPayload())
        : await profileApi.create(buildPayload());
      if (response?.user_id) {
        setProfileId(response.user_id);
      }
      toast.success("Profile saved.");
      return response?.user_id || profileId || null;
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Profile save failed.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const runAiReview = async () => {
    setReviewing(true);
    try {
      const ensuredProfileId = profileId || (await saveProfile());
      if (!ensuredProfileId) {
        return;
      }

      const draft = await resumeApi.autoDraft({
        profile_id: ensuredProfileId,
        template: "smart",
        tone: "professional",
        target_role: basic.title || undefined,
        generation_context: {
          cv_goal: "Profile quality review",
        },
        auto_professionalize_photo: false,
      });

      setReview({
        template: draft.template || null,
        templateReason: draft.template_reason || null,
        warnings: draft.profile_warnings || [],
        recommendations: draft.recommendations || [],
      });
      toast.success("AI review complete.");
    } catch (error) {
      console.error(error);
      toast.error("AI review could not be completed.");
    } finally {
      setReviewing(false);
    }
  };

  const uploadPhoto = async (file: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.append("photo", file);
    try {
      const uploaded = await assetsApi.uploadPhoto(form);
      setPhotoPath(uploaded.path);
      toast.success("Photo uploaded.");
    } catch {
      toast.error("Photo upload failed.");
    }
  };

  return (
    <div className="space-y-8" data-testid="profile-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="label-mono mb-3">Profile foundation</div>
          <h1 className="font-heading text-4xl font-medium">Profile</h1>
          <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
            This is the source of truth for your resume, cover letter and AI suggestions. Save once, then let the backend build from it.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => void runAiReview()} disabled={reviewing}>
            <Sparkles className="h-3.5 w-3.5" /> {reviewing ? "Reviewing..." : "AI review"}
          </Button>
          <Button size="sm" onClick={() => void saveProfile()} disabled={loading}>
            <Save className="h-3.5 w-3.5" /> {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Identity and positioning</CardTitle>
            <CardDescription>Give the backend enough signal to write strong summaries, letters and project narratives.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                  {photoPath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPath} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => void uploadPhoto(e.target.files?.[0] || null)}
                  />
                  <Button size="sm" variant="secondary" onClick={() => photoInputRef.current?.click()}>
                    Upload photo
                  </Button>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    The backend can professionalize this photo automatically during resume generation.
                  </p>
                </div>
              </div>
            </div>

            {[
              { key: "name", label: "Full name", placeholder: "Jamie Rivera" },
              { key: "title", label: "Headline", placeholder: "Senior Product Engineer" },
              { key: "email", label: "Email", placeholder: "jamie@work.com" },
              { key: "phone", label: "Phone", placeholder: "+1 555 010 2030" },
              { key: "location", label: "Location", placeholder: "Lisbon, Portugal" },
              { key: "website", label: "Portfolio / website", placeholder: "https://jamie.dev" },
              { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/your-name" },
              { key: "github", label: "GitHub", placeholder: "https://github.com/your-username" },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label>{field.label}</Label>
                <Input
                  placeholder={field.placeholder}
                  value={(basic as Record<string, string>)[field.key]}
                  onChange={(e) => setBasic({ ...basic, [field.key]: e.target.value })}
                />
              </div>
            ))}

            <div className="space-y-1.5 md:col-span-2">
              <Label>Bio / positioning summary</Label>
              <Textarea
                placeholder="Two or three sentences that explain who you are, what you are strongest at and what you want next."
                rows={4}
                value={basic.bio}
                onChange={(e) => setBasic({ ...basic, bio: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit p-6">
          <div className="label-mono mb-3">Readiness</div>
          <div className="font-heading text-4xl font-medium">{completeness}%</div>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            This score estimates how complete your stored profile is for automatic resume generation.
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[hsl(var(--accent))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--foreground))] transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>

          <div className="mt-6 space-y-3">
            {(review.warnings.length ? review.warnings : [
              "Run AI review to see backend warnings and template fit.",
              "A stronger bio and one more project usually improve automatic drafts fast.",
            ]).map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-start gap-2.5 text-sm">
                {review.warnings.length ? (
                  <TriangleAlert className="mt-0.5 h-4 w-4 flex-none text-[hsl(var(--warning))]" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[hsl(var(--success))]" />
                )}
                <span className="text-[hsl(var(--muted-foreground))]">{item}</span>
              </div>
            ))}
          </div>

          {review.template ? (
            <div className="mt-6 rounded-xl border border-[hsl(var(--border))] p-4">
              <div className="label-mono mb-2">Suggested template</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="mono">{review.template}</Badge>
              </div>
              {review.templateReason ? (
                <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{review.templateReason}</p>
              ) : null}
            </div>
          ) : null}
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Keep this tight and real. Use the terms you would say in an interview, not a keyword dump.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-2">
              <Input
                placeholder="e.g. Product strategy"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <Button onClick={addSkill}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.length ? (
                skills.map((skill) => (
                  <button key={skill} onClick={() => setSkills(skills.filter((item) => item !== skill))} className="group">
                    <Badge variant="default">
                      {skill}
                      <Trash2 className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
                    </Badge>
                  </button>
                ))
              ) : (
                <div className="text-sm text-[hsl(var(--muted-foreground))]">No skills yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {[
          {
            title: "Experience",
            items: experiences,
            setter: setExperiences,
            placeholders: { title: "Senior PM", subtitle: "Acme Corp", period: "2022 - now" },
          },
          {
            title: "Projects",
            items: projects,
            setter: setProjects,
            placeholders: { title: "Checkout v2", subtitle: "Payments platform", period: "2023" },
          },
          {
            title: "Education",
            items: education,
            setter: setEducation,
            placeholders: { title: "BSc Computer Science", subtitle: "MIT", period: "2018 - 2022" },
          },
        ].map((section) => (
          <Card key={section.title} className="lg:col-span-3">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>Outcomes beat responsibilities. Give the AI enough detail to write good bullets.</CardDescription>
              </div>
              <Button size="sm" variant="secondary" onClick={() => addEntry(section.setter)}>
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {!section.items.length ? (
                <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  Nothing here yet. Add at least one strong entry to improve drafts.
                </div>
              ) : null}

              {section.items.map((entry) => (
                <div key={entry.id} className="grid gap-3 rounded-xl border border-[hsl(var(--border))] p-4 md:grid-cols-4">
                  <Input
                    placeholder={section.placeholders.title}
                    value={entry.title}
                    onChange={(e) => updateEntry(section.setter, entry.id, "title", e.target.value)}
                  />
                  <Input
                    placeholder={section.placeholders.subtitle}
                    value={entry.subtitle}
                    onChange={(e) => updateEntry(section.setter, entry.id, "subtitle", e.target.value)}
                  />
                  <Input
                    placeholder={section.placeholders.period}
                    value={entry.period}
                    onChange={(e) => updateEntry(section.setter, entry.id, "period", e.target.value)}
                  />
                  <div className="flex gap-2 md:col-span-4">
                    <Textarea
                      placeholder="Use short bullets with measurable results. Example: Reduced drop-off 34 percent, launched onboarding to 3M users."
                      rows={3}
                      value={entry.desc}
                      onChange={(e) => updateEntry(section.setter, entry.id, "desc", e.target.value)}
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeEntry(section.setter, entry.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {(review.recommendations || []).length ? (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>AI recommendations</CardTitle>
              <CardDescription>Concrete suggestions returned from the backend review flow.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {review.recommendations.map((item, index) => (
                <Badge key={`${item}-${index}`} variant="outline">
                  {item}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
