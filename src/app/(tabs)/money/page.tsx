"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { dateForOffset, formatDateShort } from "@/lib/demo-data";
import type { Job, PaymentStatus } from "@/lib/types";

// Pay period: Mon (start of week) → Sun (end of week). Settle Friday after the
// period closes (5 days after Sunday end).
function getPayPeriod(today: Date, weeksAgo: number = 0): {
  start: Date;
  end: Date;
  settlement: Date;
} {
  const day = today.getDay(); // 0 = Sun, 1 = Mon, ...
  const daysSinceMonday = (day + 6) % 7;
  const start = new Date(today);
  start.setDate(today.getDate() - daysSinceMonday - weeksAgo * 7);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const settlement = new Date(end);
  settlement.setDate(end.getDate() + 5);
  settlement.setHours(0, 0, 0, 0);
  return { start, end, settlement };
}

function statusBadgeTone(s: PaymentStatus) {
  if (s === "Settled") return "success" as const;
  if (s === "Action Required") return "danger" as const;
  if (s === "Payment Processing") return "info" as const;
  if (s === "RCTI Generated") return "neutral" as const;
  return "neutral" as const;
}

export default function MoneyPage() {
  const { state } = useAppState();
  const today = new Date();
  const currentPeriod = getPayPeriod(today, 0);
  const previousPeriod = getPayPeriod(today, 1);

  // Settlement-eligible jobs (Job Complete onwards) sorted newest-first.
  const settlements = useMemo(
    () =>
      state.jobs
        .filter(
          (j) =>
            j.paymentStatus !== "Not Applicable" &&
            j.paymentStatus !== "Job Complete",
        )
        .sort((a, b) => b.dateOffsetDays - a.dateOffsetDays),
    [state.jobs],
  );

  const inCurrent = useMemo(
    () =>
      settlements.filter((j) => {
        const d = dateForOffset(j.dateOffsetDays);
        return d >= currentPeriod.start && d <= currentPeriod.end;
      }),
    [settlements, currentPeriod],
  );

  const inPrevious = useMemo(
    () =>
      settlements.filter((j) => {
        const d = dateForOffset(j.dateOffsetDays);
        return d >= previousPeriod.start && d <= previousPeriod.end;
      }),
    [settlements, previousPeriod],
  );

  // Use current period if it has any jobs; fall back to previous so the hero
  // is always meaningful (the demo can land on a Monday with no current-period
  // activity yet).
  const heroPeriod = inCurrent.length > 0 ? currentPeriod : previousPeriod;
  const heroJobs = inCurrent.length > 0 ? inCurrent : inPrevious;
  const heroLabel = inCurrent.length > 0 ? "This pay period" : "Last pay period";
  const heroSettlementLabel =
    inCurrent.length > 0 ? "Pay lands" : "Pay landed";

  const heroTotal = heroJobs.reduce((s, j) => s + j.value, 0);
  const heroCounts = heroJobs.reduce(
    (acc, j) => {
      if (j.paymentStatus === "Settled") acc.settled += 1;
      else if (j.paymentStatus === "Payment Processing") acc.processing += 1;
      else if (j.paymentStatus === "Action Required") acc.action += 1;
      return acc;
    },
    { settled: 0, processing: 0, action: 0 },
  );

  const periodLabel = `${formatDateShort(heroPeriod.start)} – ${formatDateShort(heroPeriod.end)}`;
  const settlementLabel = heroPeriod.settlement.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const sub = state.trade.subscription;
  const bank = state.trade.bankAccount;
  const card = state.trade.paymentMethod;

  return (
    <main className="pb-8">
      <PageHeader title="Money" subtitle={`${heroLabel} · ${periodLabel}`} />

      {/* Hero — pay period earnings (current or fallback to previous) */}
      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {heroLabel}
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-accent">
            ${heroTotal.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {heroJobs.length} {heroJobs.length === 1 ? "job" : "jobs"} ·{" "}
            {heroSettlementLabel} {settlementLabel}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            {heroCounts.settled > 0 ? (
              <Badge tone="success">{heroCounts.settled} settled</Badge>
            ) : null}
            {heroCounts.processing > 0 ? (
              <Badge tone="info">{heroCounts.processing} processing</Badge>
            ) : null}
            {heroCounts.action > 0 ? (
              <Badge tone="danger">{heroCounts.action} action required</Badge>
            ) : null}
          </div>
        </div>
      </section>

      {/* Recent settlements */}
      <section className="mt-6 px-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Recent settlements
          </h2>
          {settlements.length > 0 ? (
            <Link
              href="/money/rctis"
              className="text-[11px] font-medium text-accent"
            >
              View all RCTIs →
            </Link>
          ) : null}
        </div>
        <div className="space-y-2">
          {settlements.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
              No completed jobs yet. RCTIs and settlements will appear here as
              you complete work.
            </p>
          ) : (
            settlements.slice(0, 5).map((j) => (
              <SettlementRow key={j.id} job={j} />
            ))
          )}
        </div>
      </section>

      {/* Tax & business name */}
      <section className="mt-6 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Tax &amp; business name
        </h2>
        <Link
          href="/money/tax"
          className="block rounded-2xl border border-border bg-surface p-4"
        >
          <p className="text-[15px] font-semibold">
            {state.trade.gstRegistered ? "GST registered" : "Not GST registered"}
          </p>
          <p className="mt-1 text-xs text-muted">
            Trading as {state.trade.tradingName ?? state.trade.fullName}
          </p>
          <p className="mt-2 text-[12px] font-medium text-accent">Edit →</p>
        </Link>
      </section>

      {/* Bank account */}
      <section className="mt-6 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Bank account
        </h2>
        <Link
          href="/money/bank"
          className="block rounded-2xl border border-border bg-surface p-4"
        >
          {bank ? (
            <>
              <p className="text-[15px] font-semibold">{bank.accountName}</p>
              <p className="mt-1 text-xs text-muted">
                BSB {bank.bsb} · Account ••••{bank.accountNumber.slice(-4)}
              </p>
              <p className="mt-2 text-[12px] font-medium text-accent">Edit →</p>
            </>
          ) : (
            <>
              <p className="text-[14px] font-semibold text-warn">
                Bank account not set
              </p>
              <p className="mt-1 text-xs text-muted">
                Add your bank account to release payments.
              </p>
              <p className="mt-2 text-[12px] font-medium text-accent">
                Add bank account →
              </p>
            </>
          )}
        </Link>
      </section>

      {/* Subscription & payment method */}
      <section className="mt-6 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Subscription &amp; payment
        </h2>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{sub.tier} tier</p>
              <p className="text-xs text-muted">
                Allocated ${sub.allocatedYTD} of ${sub.cap} this year
              </p>
            </div>
            <Badge tone="warn">
              {Math.round((sub.allocatedYTD / sub.cap) * 100)}% used
            </Badge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${Math.min(100, (sub.allocatedYTD / sub.cap) * 100)}%`,
              }}
            />
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Payment method
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm font-medium">
                {card ? `${card.brand} ••••${card.last4}` : "No card on file"}
              </p>
              <Link
                href="/money/payment-method"
                className="text-[12px] font-medium text-accent"
              >
                {card ? "Edit" : "Add"} →
              </Link>
            </div>
            {card ? (
              <p className="mt-1 text-[11px] text-muted">Expires {card.expiry}</p>
            ) : null}
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-accent-soft py-2.5 text-sm font-semibold text-accent"
            style={{ minHeight: 40 }}
          >
            See upgrade options
          </button>
        </div>
      </section>
    </main>
  );
}

function SettlementRow({ job }: { job: Job }) {
  const settlementText = (() => {
    if (job.paymentStatus === "Settled") {
      const settled = dateForOffset(job.dateOffsetDays + 5);
      return `Settled ${formatDateShort(settled)}`;
    }
    if (job.paymentStatus === "Payment Processing")
      return "Settles within 2 business days";
    if (job.paymentStatus === "RCTI Generated") return "RCTI ready";
    if (job.paymentStatus === "Action Required") return "Needs your attention";
    return "";
  })();

  return (
    <Link
      href={`/money/rcti/${job.id}`}
      className="block rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            {job.client} · {job.cgNumber}
          </p>
          <p className="mt-0.5 text-[14px] font-semibold">{job.type}</p>
          <p className="mt-0.5 text-xs text-muted">{job.customer.suburb}</p>
        </div>
        <p className="shrink-0 text-[16px] font-bold text-accent">
          ${job.value.toFixed(2)}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <Badge tone={statusBadgeTone(job.paymentStatus)}>
          {job.paymentStatus}
        </Badge>
        <span className="text-[11px] text-muted">{settlementText}</span>
      </div>
    </Link>
  );
}
