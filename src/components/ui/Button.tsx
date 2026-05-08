"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-base font-semibold transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed w-full min-h-[52px]";

const variants: Record<Variant, string> = {
  // Green-tinted shadow matches the new emerald accent. CSS variable
  // --shadow-accent adapts per theme (subtle in light, lifted in dark).
  primary:
    "bg-accent text-white [box-shadow:var(--shadow-accent)] hover:bg-accent-strong",
  secondary:
    "bg-surface-2 text-foreground border border-border-strong hover:bg-surface-3",
  ghost: "bg-transparent text-muted hover:text-foreground",
  danger:
    "bg-danger/15 text-danger border border-danger/40 hover:bg-danger/25",
};

interface BaseProps {
  variant?: Variant;
  size?: "md" | "sm";
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = true,
  className = "",
  ...props
}: BaseProps & ComponentProps<"button">) {
  const sizing = size === "sm" ? "px-4 py-2 text-sm min-h-[44px]" : "";
  const width = fullWidth ? "w-full" : "w-auto";
  return (
    <button
      {...props}
      className={`${base} ${variants[variant]} ${sizing} ${width} ${className}`}
    />
  );
}

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth = true,
  className = "",
  ...props
}: BaseProps & ComponentProps<typeof Link>) {
  const sizing = size === "sm" ? "px-4 py-2 text-sm min-h-[44px]" : "";
  const width = fullWidth ? "w-full" : "w-auto";
  return (
    <Link
      {...props}
      className={`${base} ${variants[variant]} ${sizing} ${width} ${className}`}
    />
  );
}
