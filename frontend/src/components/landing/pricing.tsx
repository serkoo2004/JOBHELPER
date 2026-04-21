import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "Try the system. Ship a first draft.",
    features: ["3 AI resume drafts / month", "3 premium templates", "Single CV version", "Cover letter draft"],
    cta: "Start free",
    href: "/sign-up"
  },
  {
    name: "Pro",
    price: "$18",
    period: "/mo",
    desc: "For anyone actively looking.",
    features: ["Unlimited AI drafts", "All 9 premium templates", "Version history + restore", "Job match + cover letter AI", "Applications tracker", "Interview coach"],
    cta: "Upgrade to Pro",
    href: "/sign-up?plan=pro",
    featured: true
  },
  {
    name: "Teams",
    price: "Custom",
    period: "",
    desc: "For bootcamps, schools, career coaches.",
    features: ["Everything in Pro", "Shared workspaces", "Admin dashboard + audit logs", "SSO & custom branding", "Priority support"],
    cta: "Contact sales",
    href: "mailto:hi@careercopilot.app"
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 border-t border-[hsl(var(--border))]">
      <div className="container-custom">
        <div className="max-w-3xl mb-14">
          <div className="label-mono mb-4">05 — Pricing</div>
          <h2 className="font-heading text-display-md font-medium">Fair. Flat. No hidden AI credits.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn(
                "rounded-2xl border p-8 flex flex-col",
                p.featured
                  ? "border-[hsl(var(--foreground))] bg-[hsl(var(--foreground))] text-[hsl(var(--background))]"
                  : "border-[hsl(var(--border))] bg-[hsl(var(--surface))]"
              )}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="font-heading text-lg">{p.name}</div>
                {p.featured && (
                  <Badge
                    variant="mono"
                    className="!bg-[hsl(var(--background))] !text-[hsl(var(--foreground))] !border-[hsl(var(--background))]"
                  >
                    Popular
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <div className="font-heading text-5xl font-medium">{p.price}</div>
                <div className={cn("text-sm", p.featured ? "text-[hsl(var(--background))]/60" : "text-[hsl(var(--muted-foreground))]")}>
                  {p.period}
                </div>
              </div>
              <p className={cn("mt-3 text-sm", p.featured ? "text-[hsl(var(--background))]/70" : "text-[hsl(var(--muted-foreground))]")}>
                {p.desc}
              </p>
              <ul className="mt-8 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 mt-0.5 flex-none" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                size="lg"
                variant={p.featured ? "secondary" : "primary"}
                className={cn(
                  "mt-8 w-full",
                  p.featured &&
                    "!bg-[hsl(var(--background))] !text-[hsl(var(--foreground))] !border-transparent hover:!bg-[hsl(var(--background))]/90"
                )}
              >
                <Link href={p.href} data-testid={`pricing-cta-${p.name.toLowerCase()}`}>{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
