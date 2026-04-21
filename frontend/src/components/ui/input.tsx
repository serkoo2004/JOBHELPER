"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3.5 py-2 text-sm transition-colors",
        "placeholder:text-[hsl(var(--muted-foreground))]",
        "focus-visible:outline-none focus-visible:border-[hsl(var(--foreground))]/50 focus-visible:ring-1 focus-visible:ring-[hsl(var(--foreground))]/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[96px] w-full rounded-md border border-[hsl(var(--input))] bg-transparent px-3.5 py-2.5 text-sm transition-colors",
      "placeholder:text-[hsl(var(--muted-foreground))]",
      "focus-visible:outline-none focus-visible:border-[hsl(var(--foreground))]/50 focus-visible:ring-1 focus-visible:ring-[hsl(var(--foreground))]/30",
      "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  children,
  htmlFor,
  className
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-xs font-medium tracking-wide text-[hsl(var(--foreground))]/80",
        className
      )}
    >
      {children}
    </label>
  );
}
