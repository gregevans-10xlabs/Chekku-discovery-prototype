"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getComplianceDocs, getTeam } from "@/lib/demo-data";

interface AttentionItem {
  label: string;
  href: string;
}

export default function ProfileHub() {
  const { state } = useAppState();
  const docs = getComplianceDocs();
  const team = getTeam();
  const sub = state.trade.subscription;

  // Compliance summary for hub tile
  const complianceCounts = useMemo(
    () => ({
      active: docs.filter((d) => d.status === "Active").length,
      expiring: docs.filter((d) => d.status === "Expiring Soon").length,
      expired: docs.filter((d) => d.status === "Expired").length,
      missing: docs.filter((d) => d.status === "Not Started").length,
    }),
    [docs],
  );

  // "Needs your attention" derivation — only truly action-required items.
  const attention = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];
    docs
      .filter((d) => d.status === "Expiring Soon" || d.status === "Expired")
      .forEach((d) => {
        const when = d.expiresAt
          ? Math.ceil(
              (new Date(d.expiresAt).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            )
          : null;
        const desc =
          d.status === "Expired"
            ? `${d.name} has expired`
            : when !== null
              ? `${d.name} expires in ${when} days`
              : `${d.name} expires soon`;
        items.push({ label: desc, href: "/profile/compliance" });
      });
    if (!state.trade.bankAccount) {
      items.push({
        label: "Add bank account so settlements can release",
        href: "/money/bank",
      });
    }
    return items;
  }, [docs, state.trade.bankAccount]);

  const subPct = Math.round((sub.allocatedYTD / sub.cap) * 100);
  const teamSummary = state.hasTeam
    ? `${team.members.length} member${team.members.length === 1 ? "" : "s"} configured`
    : "Off · Enable to manage subs / employees";

  return (
    <main className="pb-8">
      <PageHeader title="Profile" />

      {/* Identity card — compact */}
      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-xl font-bold text-accent">
              {state.trade.firstName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">
                {state.trade.fullName}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                ABN {state.trade.abn}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {state.trade.serviceArea.suburb} · within{" "}
                {state.trade.serviceArea.radiusKm} km
              </p>
            </div>
            <Badge tone="accent">★ {state.trade.tier}</Badge>
          </div>
        </div>
      </section>

      {/* Needs attention callout */}
      {attention.length > 0 ? (
        <section className="mt-3 px-5">
          {attention.length === 1 ? (
            <Link
              href={attention[0].href}
              className="block rounded-2xl border border-warn/40 bg-warn-soft p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-warn">
                ⚠ Needs your attention
              </p>
              <p className="mt-1 text-[14px] font-semibold">
                {attention[0].label}
              </p>
              <p className="mt-2 text-[12px] font-semibold text-warn">
                Resolve →
              </p>
            </Link>
          ) : (
            <Link
              href={attention[0].href}
              className="block rounded-2xl border border-warn/40 bg-warn-soft p-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-warn">
                ⚠ {attention.length} things need your attention
              </p>
              <ul className="mt-1.5 space-y-0.5 text-[13px]">
                {attention.slice(0, 3).map((a, i) => (
                  <li key={i}>• {a.label}</li>
                ))}
              </ul>
              <p className="mt-2 text-[12px] font-semibold text-warn">
                Review →
              </p>
            </Link>
          )}
        </section>
      ) : null}

      {/* Hub tiles */}
      <section className="mt-3 px-5">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <HubRow
            href="/profile/compliance"
            label="Compliance"
            summary={`${complianceCounts.active} active · ${complianceCounts.expiring} expiring · ${complianceCounts.missing} missing`}
            attention={
              complianceCounts.expiring > 0 || complianceCounts.expired > 0
            }
          />
          <HubRow
            href="/profile/performance"
            label="Performance"
            summary={`On-time ${(state.trade.onTimeRate * 100).toFixed(0)}% · ${state.trade.tier} tier`}
          />
          <HubRow
            href="/profile/training"
            label="Training & courses"
            summary="3 recommended for you"
          />
          <HubRow
            href="/profile/subscription"
            label="Subscription"
            summary={`${sub.tier} tier · ${subPct}% allocated`}
            attention={subPct >= 90}
          />
          <HubRow
            href="/profile/team"
            label="My Team"
            summary={teamSummary}
          />
          <HubRow
            href="/profile/account"
            label="Account"
            summary="Identity, language, sign out"
            isLast
          />
        </div>
      </section>
    </main>
  );
}

function HubRow({
  href,
  label,
  summary,
  attention,
  isLast,
}: {
  href: string;
  label: string;
  summary: string;
  attention?: boolean;
  isLast?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-surface-2 " +
        (isLast ? "" : "border-b border-border")
      }
    >
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[14px] font-semibold">
          {label}
          {attention ? (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-warn" />
          ) : null}
        </p>
        <p className="mt-0.5 text-xs text-muted">{summary}</p>
      </div>
      <span className="text-muted">→</span>
    </Link>
  );
}
