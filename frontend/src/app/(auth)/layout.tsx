import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layered animated mesh background */}
      <div className="absolute inset-0 -z-20 hero-bg" />
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1771814565026-58211c831115?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxkYXJrJTIwYWJzdHJhY3QlMjBtZXNoJTIwZ3JhZGllbnQlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc3NjQ2MDc2OXww&ixlib=rb-4.1.0&q=85"
          alt=""
          aria-hidden
          fill
          className="object-cover opacity-50 dark:opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-[hsl(var(--background))]/40 dark:bg-[hsl(var(--background))]/60" />
      </div>
      <div className="absolute inset-0 -z-10 grid-pattern opacity-30" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-6 md:p-10">
        <Link
          href="/"
          className="flex items-center gap-2 group"
          data-testid="auth-logo-link"
        >
          <ArrowLeft className="h-4 w-4 text-[hsl(var(--muted-foreground))] group-hover:-translate-x-0.5 transition-transform" />
          <Logo className="h-7 w-7" />
          <span className="font-heading text-base tracking-tight">Career Copilot</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Glassmorphic auth box */}
      <div className="relative z-10 flex items-center justify-center px-6 pb-16 pt-8 md:pt-16">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
