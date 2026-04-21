import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Career Copilot — AI that actually gets you hired",
  description:
    "The career operating system. Build tailored resumes, cover letters, and interview prep with AI that understands your story.",
  icons: { icon: "/favicon.svg" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="grain fixed-photo-bg min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            theme="system"
            toastOptions={{
              className:
                "!rounded-xl !border !border-[hsl(var(--border))] !bg-[hsl(var(--surface))] !text-[hsl(var(--foreground))]"
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
