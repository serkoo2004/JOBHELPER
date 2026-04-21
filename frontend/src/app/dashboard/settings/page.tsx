"use client";

import { useEffect, useState } from "react";
import { User, Palette, Bell, ShieldCheck, LogOut } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { profileApi } from "@/lib/api";
import { useAuth } from "@/store/auth";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell }
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, profileId, logout } = useAuth();
  const [tab, setTab] = useState("account");
  const [account, setAccount] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) {
        return;
      }
      try {
        const profile = await profileApi.get(profileId);
        setAccount((prev) => ({
          ...prev,
          fullName: profile.full_name || prev.fullName,
          email: profile.email || prev.email,
        }));
      } catch (error) {
        console.error(error);
      }
    };
    void loadProfile();
  }, [profileId]);

  return (
    <div className="space-y-8" data-testid="settings-page">
      <div>
        <div className="label-mono mb-3">Configuration</div>
        <h1 className="font-heading text-4xl font-medium">Settings</h1>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                tab === t.id
                  ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]/60 hover:text-[hsl(var(--foreground))]"
              )}
              data-testid={`settings-tab-${t.id}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </aside>

        <div className="space-y-4">
          {tab === "account" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Name, email, and local workspace identity.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full name</Label>
                    <Input value={account.fullName} onChange={(e) => setAccount({ ...account, fullName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} type="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Timezone</Label>
                    <Input value={account.timezone} onChange={(e) => setAccount({ ...account, timezone: e.target.value })} />
                  </div>
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/25 p-4 text-sm text-[hsl(var(--muted-foreground))] md:col-span-2">
                    Account edits here shape your local session and stored profile context. Password resets and destructive account actions are intentionally hidden until a full production auth layer exists.
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Workspace session</CardTitle>
                  <CardDescription>Use sign out if you want a clean local browser state.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    data-testid="settings-signout-account"
                    onClick={() => {
                      localStorage.removeItem("cc_admin_key");
                      logout();
                      toast.success("Signed out.");
                      window.location.href = "/sign-in";
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Sign out on this browser
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {tab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Dark, light, or let the system decide.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                {[
                  { k: "light", label: "Light", tone: "bg-white border" },
                  { k: "dark", label: "Dark", tone: "bg-zinc-900" },
                  { k: "system", label: "System", tone: "bg-gradient-to-r from-white via-zinc-500 to-zinc-900" }
                ].map((o) => (
                  <button
                    key={o.k}
                    onClick={() => setTheme(o.k)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      theme === o.k
                        ? "border-[hsl(var(--foreground))]"
                        : "border-[hsl(var(--border))] hover:border-[hsl(var(--foreground))]/40"
                    )}
                    data-testid={`theme-${o.k}`}
                  >
                    <div className={cn("h-20 w-full rounded-md mb-2", o.tone)} />
                    <div className="text-sm font-medium">{o.label}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}

          {tab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Normal users never see backend admin keys or provider secrets in the product UI.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4 text-sm text-[hsl(var(--muted-foreground))]">
                  AI provider keys, admin secrets and backend environment values are now managed outside the normal user settings screen.
                </div>
                <div className="rounded-xl border border-[hsl(var(--border))] p-4">
                  <div className="text-sm font-medium">Current session</div>
                  <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                    Email login is active. Dashboard access is blocked unless a session token exists.
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    localStorage.removeItem("cc_admin_key");
                    logout();
                    toast.success("Session closed.");
                    window.location.href = "/sign-in";
                  }}
                >
                  <LogOut className="h-4 w-4" /> Sign out everywhere on this browser
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>How we nudge you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Weekly review: applications without follow-ups",
                  "When an ATS score drops below 85 after edit",
                  "New templates & features",
                  "Workflow nudges based on your current pipeline"
                ].map((n) => (
                  <label
                    key={n}
                    className="flex items-center justify-between py-2.5 border-b border-[hsl(var(--border))] last:border-0 cursor-pointer"
                  >
                    <span className="text-sm">{n}</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-[hsl(var(--foreground))]" />
                  </label>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
