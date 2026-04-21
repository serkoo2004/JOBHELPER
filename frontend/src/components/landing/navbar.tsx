"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { useAuth } from "@/store/auth";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#testimonials", label: "Stories" }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const token = useAuth((s) => s.token);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 animate-slide-down",
        scrolled
          ? "glass-strong border-b border-[hsl(var(--border))]"
          : "bg-transparent"
      )}
      data-testid="landing-navbar"
    >
      <div className="container-custom flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" data-testid="navbar-logo">
          <Logo className="h-7 w-7" />
          <span className="font-heading text-lg tracking-tight">Career Copilot</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
              data-testid={`navbar-link-${l.label.toLowerCase().replace(" ", "-")}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {token ? (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/dashboard" data-testid="navbar-dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link href="/sign-in" data-testid="navbar-signin">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href="/sign-up" data-testid="navbar-signup">Get started</Link>
              </Button>
            </>
          )}
          <button
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-[hsl(var(--border))]"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            data-testid="navbar-mobile-toggle"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]"
          >
            <div className="container-custom py-6 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-base py-2"
                >
                  {l.label}
                </a>
              ))}
              <div className="flex gap-2 pt-2">
                {token ? (
                  <Button asChild className="flex-1">
                    <Link href="/dashboard">Open dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="secondary" className="flex-1">
                      <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild className="flex-1">
                      <Link href="/sign-up">Get started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
