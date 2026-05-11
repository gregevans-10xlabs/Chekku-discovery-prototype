"use client";

/**
 * Card — EH-discipline floating card primitives.
 *
 * Phase 6 visual refresh: cards no longer carry borders. Visual
 * separation comes from a soft two-layer shadow (--shadow-card) +
 * the page's slight cool wash background. Cards feel like objects on
 * a surface (Employment Hero pattern) rather than boxes inside a
 * frame.
 *
 * Variants (`tone`):
 * - default: white surface, soft shadow
 * - accent / warn / danger / success: tinted soft backgrounds for
 *   exception cards (jeopardy, action-required, day-complete
 *   celebration, etc.). These keep subtle borders for tone visibility.
 *
 * Three render shapes:
 * - <Card> — static section
 * - <LinkCard href=…> — clickable, routes via next/link
 * - <ButtonCard onClick=…> — clickable, fires a callback
 *
 * Tap-target ≥44pt enforced for clickable variants.
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Tone = "default" | "accent" | "warn" | "danger" | "success";

const toneClasses: Record<Tone, string> = {
  default: "bg-surface [box-shadow:var(--shadow-card)]",
  accent: "bg-accent-soft border border-accent/30",
  warn: "bg-warn-soft border border-warn/40",
  danger: "bg-danger-soft border border-danger/40",
  success: "bg-success-soft border border-success/30",
};

type Padding = "compact" | "default" | "loose";

const padClass: Record<Padding, string> = {
  compact: "p-3",
  default: "p-4",
  loose: "p-5",
};

interface BaseProps {
  tone?: Tone;
  padding?: Padding;
  className?: string;
  children: ReactNode;
}

export function Card({
  tone = "default",
  padding = "default",
  className = "",
  children,
  ...props
}: BaseProps & Omit<ComponentProps<"section">, "children" | "className">) {
  return (
    <section
      {...props}
      className={`rounded-2xl ${padClass[padding]} ${toneClasses[tone]} ${className}`}
    >
      {children}
    </section>
  );
}

export function LinkCard({
  tone = "default",
  padding = "default",
  className = "",
  href,
  children,
  ...props
}: BaseProps & {
  href: string;
} & Omit<ComponentProps<typeof Link>, "href" | "children" | "className">) {
  return (
    <Link
      href={href}
      {...props}
      className={`block rounded-2xl ${padClass[padding]} ${toneClasses[tone]} ${className}`}
      style={{ minHeight: 44, ...(props.style ?? {}) }}
    >
      {children}
    </Link>
  );
}

export function ButtonCard({
  tone = "default",
  padding = "default",
  className = "",
  onClick,
  ariaLabel,
  children,
}: BaseProps & {
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`block w-full rounded-2xl ${padClass[padding]} ${toneClasses[tone]} text-left ${className}`}
      style={{ minHeight: 44 }}
    >
      {children}
    </button>
  );
}

/**
 * StandardCardRow — the EH 3-element card content pattern.
 * Icon + (title + subtitle) + CTA arrow. Used inside <Card> /
 * <LinkCard> / <ButtonCard> wrappers. Most Home cards will use this.
 */
export function StandardCardRow({
  icon,
  title,
  subtitle,
  cta,
  ctaTone = "default",
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  cta?: string;
  ctaTone?: "default" | "warn" | "danger" | "success";
}) {
  const ctaColor =
    ctaTone === "warn"
      ? "text-warn"
      : ctaTone === "danger"
        ? "text-danger"
        : ctaTone === "success"
          ? "text-success"
          : "text-accent-strong";
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong text-[18px]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-tight">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 truncate text-[13px] text-muted">{subtitle}</p>
        ) : null}
      </div>
      {cta ? (
        <span
          className={`shrink-0 text-[13px] font-semibold ${ctaColor}`}
          aria-hidden
        >
          {cta} →
        </span>
      ) : null}
    </div>
  );
}
