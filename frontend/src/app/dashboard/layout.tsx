"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Sidebar, TopBar } from "@/components/dashboard/shell";
import { useAuth } from "@/store/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!token) {
      router.replace("/sign-in");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))]">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/85 px-6 py-4 text-sm text-[hsl(var(--muted-foreground))] backdrop-blur">
          {pathname?.startsWith("/dashboard") ? "Loading secure workspace..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))]" data-testid="dashboard-shell">
      <div className="sticky top-0 hidden h-screen w-[260px] flex-none border-r border-[hsl(var(--border))] md:flex lg:w-[280px]">
        <Sidebar />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
