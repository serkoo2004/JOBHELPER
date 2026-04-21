"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, User, FileText, Mail, Wrench, Briefcase, Upload,
  Settings, LogOut, Menu, X, Sparkles, Image as ImageIcon
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
      { href: "/dashboard/profile", icon: User, label: "Profile" }
    ]
  },
  {
    label: "Build",
    items: [
      { href: "/dashboard/resume", icon: FileText, label: "Resume Studio" },
      { href: "/dashboard/cover-letter", icon: Mail, label: "Cover Letter" },
      { href: "/dashboard/upload-cv", icon: Upload, label: "Upload & Analyze" },
      { href: "/dashboard/assets", icon: ImageIcon, label: "Assets" }
    ]
  },
  {
    label: "Grow",
    items: [
      { href: "/dashboard/career-tools", icon: Wrench, label: "Career Tools" },
      { href: "/dashboard/applications", icon: Briefcase, label: "Applications" }
    ]
  },
  {
    label: "Preferences",
    items: [
      { href: "/dashboard/settings", icon: Settings, label: "Settings" }
    ]
  }
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full min-h-0 flex-col" data-testid="dashboard-sidebar">
      <div className="h-16 flex items-center px-6 border-b border-[hsl(var(--border))]">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={onNavigate}>
          <Logo className="h-7 w-7" />
          <span className="font-heading text-base">Career Copilot</span>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
        {navGroups.map((g) => (
          <div key={g.label}>
            <div className="label-mono mb-2 px-2">{g.label}</div>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/60"
                    )}
                    data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={1.75} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="sticky bottom-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 p-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[hsl(var(--border))] p-3">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[hsl(var(--foreground))] text-xs font-medium text-[hsl(var(--background))]">
            {initials(user?.name || user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">{user?.name || "You"}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
              {user?.email || "career workspace"}
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              localStorage.removeItem("cc_admin_key");
              localStorage.removeItem("cc_google_api_key");
              localStorage.removeItem("cc_openai_api_key");
              router.push("/sign-in");
            }}
            className="flex-none text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            data-testid="sidebar-logout"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TopBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const logout = useAuth((s) => s.logout);

  return (
    <>
      <header className="h-16 sticky top-0 z-30 glass-strong border-b border-[hsl(var(--border))] flex items-center px-4 md:px-8 justify-between">
        <button
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--border))]"
          onClick={() => setMobileOpen(true)}
          aria-label="Menu"
          data-testid="topbar-mobile-open"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="hidden md:flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Guided workflow mode</span>
          <span className="mx-2 opacity-40">·</span>
          <span className="font-mono text-xs">local studio</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => {
              logout();
              localStorage.removeItem("cc_admin_key");
              localStorage.removeItem("cc_google_api_key");
              localStorage.removeItem("cc_openai_api_key");
              router.push("/sign-in");
            }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link href="/dashboard/resume" data-testid="topbar-new-draft">
              <Sparkles className="h-3.5 w-3.5" /> New draft
            </Link>
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[hsl(var(--background))] border-r border-[hsl(var(--border))] md:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                className="absolute top-4 right-4 h-9 w-9 rounded-md border border-[hsl(var(--border))] inline-flex items-center justify-center"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
