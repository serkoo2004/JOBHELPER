import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  const columns = [
    {
      title: "Platform",
      links: [
        { label: "Home", href: "/" },
        { label: "Resume Studio", href: "/dashboard/resume" },
        { label: "Cover Letter", href: "/dashboard/cover-letter" },
        { label: "Applications", href: "/dashboard/applications" },
      ],
    },
    {
      title: "Workflows",
      links: [
        { label: "Profile", href: "/dashboard/profile" },
        { label: "Upload & Analyze", href: "/dashboard/upload-cv" },
        { label: "Assets", href: "/dashboard/assets" },
        { label: "Career Tools", href: "/dashboard/career-tools" },
      ],
    },
    {
      title: "Access",
      links: [
        { label: "Sign in", href: "/sign-in" },
        { label: "Create account", href: "/sign-up" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings", href: "/dashboard/settings" },
      ],
    },
  ];

  return (
    <footer className="border-t border-[hsl(var(--border))] py-16">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="h-7 w-7" />
              <span className="font-heading text-lg">Career Copilot</span>
            </Link>
            <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xs">
              The career OS that treats you like a product worth launching.
            </p>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="label-mono mb-4">{col.title}</div>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-[hsl(var(--border))] flex flex-col md:flex-row gap-4 justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <div>© {new Date().getFullYear()} Career Copilot. Built for humans who ship.</div>
          <div className="font-mono">guided career system · local workspace ready</div>
        </div>
      </div>
    </footer>
  );
}
