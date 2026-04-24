import type { ComponentProps } from "react";

type Tone = "accent" | "success" | "warn" | "danger" | "info" | "neutral";

const tones: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info/15 text-info",
  neutral: "bg-surface-2 text-muted",
};

export function Badge({
  tone = "neutral",
  className = "",
  ...props
}: { tone?: Tone } & ComponentProps<"span">) {
  return (
    <span
      {...props}
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium " +
        tones[tone] +
        " " +
        className
      }
    />
  );
}
