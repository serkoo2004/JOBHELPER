"use client";

import Link from "next/link";
import {
  Target, Linkedin, Briefcase, MessageSquare, Compass, Image as ImageIcon, HelpCircle, ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tools = [
  { slug: "job-match", icon: Target, title: "Job match", desc: "Score your profile vs. a JD.", tag: "Analysis" },
  { slug: "linkedin", icon: Linkedin, title: "LinkedIn optimize", desc: "Rewrite your headline + About.", tag: "Content" },
  { slug: "portfolio", icon: Briefcase, title: "Portfolio summary", desc: "Turn projects into a narrative.", tag: "Content" },
  { slug: "interview", icon: MessageSquare, title: "Interview prep", desc: "Role-specific Qs and STAR drills.", tag: "Practice" },
  { slug: "roadmap", icon: Compass, title: "Career roadmap", desc: "Skill gap analysis + 90-day plan.", tag: "Strategy" },
  { slug: "photo", icon: ImageIcon, title: "Photo assistant", desc: "Composition + framing on your headshot.", tag: "Visual" },
  { slug: "coach", icon: HelpCircle, title: "Application coach", desc: "Per-application tactical feedback.", tag: "Coaching" }
];

export default function CareerToolsPage() {
  return (
    <div className="space-y-8" data-testid="career-tools">
      <div>
        <div className="label-mono mb-3">Seven scalpels</div>
        <h1 className="font-heading text-4xl font-medium">Career Tools</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))] max-w-2xl">
          Each tool is a narrow, sharpened workflow — paste in, ship out.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => (
          <Link key={t.slug} href={`/dashboard/career-tools/${t.slug}`} data-testid={`tool-${t.slug}`}>
            <Card className="group relative overflow-hidden p-6 h-full hover-trace hover:border-[hsl(var(--foreground))]/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg border border-[hsl(var(--border))] flex items-center justify-center mb-5">
                  <t.icon className="h-4 w-4" strokeWidth={1.6} />
                </div>
                <Badge variant="mono">{t.tag}</Badge>
              </div>
              <h3 className="font-heading text-lg font-medium mb-2">{t.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{t.desc}</p>
              <div className="mt-6 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
