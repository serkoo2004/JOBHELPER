import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-[hsl(var(--foreground))]", className)}
    >
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <path
        d="M9 22V10h4.7c2.6 0 4.4 1.3 4.4 3.7 0 1.6-1 2.8-2.4 3.2l3 5.1h-2.8l-2.8-4.9h-1.5V22H9Z"
        fill="hsl(var(--background))"
      />
      <circle cx="22.5" cy="11" r="2" fill="hsl(var(--background))" />
    </svg>
  );
}
