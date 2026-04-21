"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, Image as ImageIcon, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { assetsApi, resumeApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function OnboardingPage() {
  const { profileId } = useAuth();
  const [hasAssets, setHasAssets] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const [photos, templates, resumes] = await Promise.all([
          assetsApi.listPhotos(),
          assetsApi.listTemplates(),
          profileId ? resumeApi.listSaved(profileId) : Promise.resolve([]),
        ]);
        setHasAssets(Boolean((photos || []).length || (templates || []).length));
        setHasResume(Boolean((resumes || []).length));
      } catch (error) {
        console.error(error);
      }
    };
    void loadState();
  }, [profileId]);

  const steps = [
    {
      title: "Build your profile",
      desc: "Name, role, summary, experience, projects, education, and the photo path the backend will use.",
      href: "/dashboard/profile",
      icon: User,
      done: Boolean(profileId),
    },
    {
      title: "Prepare assets",
      desc: "Upload your photo or template references, then run the photo professionalize flow.",
      href: "/dashboard/assets",
      icon: ImageIcon,
      done: hasAssets,
    },
    {
      title: "Generate your first resume",
      desc: "Run auto-draft, review warnings, edit the draft, finalize, and export.",
      href: "/dashboard/resume",
      icon: FileText,
      done: hasResume,
    },
  ];

  return (
    <div className="space-y-8" data-testid="onboarding-page">
      <div>
        <div className="label-mono mb-3">Getting started</div>
        <h1 className="font-heading text-4xl font-medium">Welcome to your studio</h1>
        <p className="mt-2 max-w-2xl text-[hsl(var(--muted-foreground))]">
          This is the shortest clean path: save profile, prepare assets, generate draft. Once those are done, the rest of the dashboard becomes genuinely useful.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[hsl(var(--border))]">
                <step.icon className="h-4 w-4" />
              </div>
              <Badge variant={step.done ? "success" : "outline"}>
                {step.done ? "Done" : `Step ${index + 1}`}
              </Badge>
            </div>
            <h2 className="font-heading text-xl">{step.title}</h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{step.desc}</p>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href={step.href}>
                  {step.done ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  {step.done ? "Open" : "Go"}
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
