import {
  Wand2, FileText, Target, MessageSquare, Briefcase, Compass, Image as ImageIcon, LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Wand2,
    title: "Auto-draft CV",
    desc: "Give it your profile. Get a reviewed, typeset resume in 6 seconds — across 9 premium templates.",
    span: "md:col-span-2"
  },
  {
    icon: Target,
    title: "Job match score",
    desc: "Paste a JD. We show you what's missing, where you stand, and how to rephrase."
  },
  {
    icon: FileText,
    title: "Tailored cover letters",
    desc: "Pulls from your profile, hiring manager tone, and company context."
  },
  {
    icon: MessageSquare,
    title: "Interview prep",
    desc: "Role-specific questions, STAR-ready answers, follow-up drills."
  },
  {
    icon: Briefcase,
    title: "Applications tracker",
    desc: "Kanban + table. AI-coached per application.",
    span: "md:col-span-2"
  },
  {
    icon: Compass,
    title: "Career roadmap",
    desc: "Skills gap analysis with a 90-day plan."
  },
  {
    icon: ImageIcon,
    title: "Professional headshot AI",
    desc: "Background composition, lighting, and framing — on your upload."
  },
  {
    icon: LineChart,
    title: "Version history",
    desc: "Every finalized resume is snapshotted. Restore anytime."
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container-custom">
        <div className="max-w-3xl mb-16">
          <div className="label-mono mb-4">01 — Capabilities</div>
          <h2 className="font-heading text-display-md font-medium text-balance">
            A career OS. <br />
            <span className="text-[hsl(var(--muted-foreground))]">Built like a product, not a prompt.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={cn(
                "group hover-trace rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 md:p-8 transition-all hover:-translate-y-0.5",
                f.span
              )}
            >
              <div className="h-9 w-9 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] flex items-center justify-center mb-5">
                <f.icon className="h-4 w-4 text-[hsl(var(--foreground))]" strokeWidth={1.6} />
              </div>
              <h3 className="font-heading text-lg font-medium mb-2">{f.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
