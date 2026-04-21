"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";

import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function SignUpPage() {
  const router = useRouter();
  const token = useAuth((s) => s.token);
  const hydrated = useAuth((s) => s.hydrated);
  const setAuth = useAuth((s) => s.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const pwLen = password.length;
  const pwChecks = [
    { label: "8+ characters", ok: pwLen >= 8 },
    { label: "One number", ok: /\d/.test(password) },
    { label: "One letter", ok: /[a-zA-Z]/.test(password) }
  ];

  useEffect(() => {
    if (hydrated && token) {
      router.replace("/dashboard");
    }
  }, [hydrated, token, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwChecks.every((c) => c.ok)) {
      toast.error("Your password needs to meet every requirement.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      const token = res?.access_token || res?.token;
      if (!token) {
        throw new Error("Register endpoint did not return a session token.");
      }
      setAuth({ email, name: name || email.split("@")[0] }, token);
      toast.success("Workspace created. Let’s set up your profile.");
      router.push("/dashboard/onboarding");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Backend register failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="glass-strong rounded-3xl p-8 md:p-10 shadow-xl"
      data-testid="signup-box"
    >
      <Badge variant="outline" dot className="mb-6">
        Creating your workspace
      </Badge>
      <h1 className="font-heading text-3xl font-medium leading-tight">
        Build the career <br />
        <span className="italic font-normal text-[hsl(var(--muted-foreground))]">
          that&apos;s actually yours.
        </span>
      </h1>
      <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
        Free forever. Upgrade whenever.
      </p>

      <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 p-4 text-sm text-[hsl(var(--muted-foreground))]">
        Email-based sign-up is the only active path right now. Social sign-in stays hidden until the real OAuth callback flow is ready end to end.
      </div>

      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-[hsl(var(--border))]" />
        <span className="label-mono">or with email</span>
        <div className="flex-1 h-px bg-[hsl(var(--border))]" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4" data-testid="signup-form">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="name"
              placeholder="Jamie Rivera"
              className="pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="signup-name"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="email"
              type="email"
              placeholder="you@work.com"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="signup-email"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••••"
              className="pl-10 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="signup-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            {pwChecks.map((c) => (
              <div
                key={c.label}
                className={`flex items-center gap-1.5 text-xs ${
                  c.ok ? "text-[hsl(var(--success))]" : "text-[hsl(var(--muted-foreground))]"
                }`}
              >
                <Check className="h-3 w-3" /> {c.label}
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          disabled={loading}
          data-testid="signup-submit"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Already have one?{" "}
        <Link
          href="/sign-in"
          className="text-[hsl(var(--foreground))] underline-offset-4 hover:underline"
          data-testid="signup-to-signin"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-6 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
        By continuing, you agree to the current workspace access policy and local development privacy rules.
      </p>
    </motion.div>
  );
}
