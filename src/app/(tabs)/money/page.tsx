"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { dateForOffset, formatDateShort } from "@/lib/demo-data";
import type { Job, JobClient, PaymentStatus } from "@/lib/types";

type ChartPeriod = "today" | "7d" | "30d" | "6m" | "12m";
type SettlementsTab = "all" | "action" | "settled";
type ClientPeriod = "30d" | "qtr" | "fy";

const CLIENT_PERIODS: { key: ClientPeriod; label: string }[] = [
  { key: "30d", label: "30d" },
  { key: "qtr", label: "QTR" },
  { key: "fy", label: "FY" },
];

// Australian BAS quarters: Q1 Jul-Sep, Q2 Oct-Dec, Q3 Jan-Mar, Q4 Apr-Jun.
function getCurrentQuarter(today: Date): {
  start: Date;
  end: Date;
  label: string;
} {
  const m = today.getMonth();
  const y = today.getFullYear();
  let qStartMonth: number;
  let qLabel: string;
  if (m >= 6 && m <= 8) {
    qStartMonth = 6;
    qLabel = "Q1 (Jul–Sep)";
  } else if (m >= 9 && m <= 11) {
    qStartMonth = 9;
    qLabel = "Q2 (Oct–Dec)";
  } else if (m >= 0 && m <= 2) {
    qStartMonth = 0;
    qLabel = "Q3 (Jan–Mar)";
  } else {
    qStartMonth = 3;
    qLabel = "Q4 (Apr–Jun)";
  }
  const start = new Date(y, qStartMonth, 1);
  const end = new Date(y, qStartMonth + 3, 0, 23, 59, 59, 999);
  return { start, end, label: qLabel };
}

function getCurrentFY(today: Date): { start: Date; end: Date; label: string } {
  const y = today.getFullYear();
  const m = today.getMonth();
  const fyStart = m >= 6 ? y : y - 1;
  const start = new Date(fyStart, 6, 1);
  const end = new Date(fyStart + 1, 5, 30, 23, 59, 59, 999);
  return {
    start,
    end,
    label: `FY${(fyStart + 1).toString().slice(-2)}`,
  };
}

const CHART_PERIODS: { key: ChartPeriod; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "6m", label: "6 Months" },
  { key: "12m", label: "12 Months" },
];

function statusBadgeTone(s: PaymentStatus) {
  if (s === "Settled") return "success" as const;
  if (s === "Action Required") return "danger" as const;
  if (s === "Payment Processing") return "info" as const;
  if (s === "RCTI Generated") return "neutral" as const;
  return "neutral" as const;
}

export default function MoneyPage() {
  const { state } = useAppState();
  // Stable per-mount — avoids re-bucketing the chart on every render.
  const today = useMemo(() => new Date(), []);

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("30d");
  const [settlementsTab, setSettlementsTab] = useState<SettlementsTab>("all");

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

  // Top metric strip aggregates
  const metrics = useMemo(() => {
    let settled = 0;
    let pending = 0;
    let actionCount = 0;
    settlements.forEach((j) => {
      if (j.paymentStatus === "Settled") settled += j.value;
      else if (
        j.paymentStatus === "Payment Processing" ||
        j.paymentStatus === "RCTI Generated"
      )
        pending += j.value;
      if (j.paymentStatus === "Action Required") actionCount += 1;
    });
    return { settled, pending, actionCount };
  }, [settlements]);

  // Filter tabs counts
  const tabCounts = useMemo(() => {
    return {
      all: settlements.length,
      action: settlements.filter((j) => j.paymentStatus === "Action Required")
        .length,
      settled: settlements.filter((j) => j.paymentStatus === "Settled").length,
    };
  }, [settlements]);

  const filteredSettlements = useMemo(() => {
    if (settlementsTab === "all") return settlements;
    if (settlementsTab === "action")
      return settlements.filter((j) => j.paymentStatus === "Action Required");
    return settlements.filter((j) => j.paymentStatus === "Settled");
  }, [settlements, settlementsTab]);

  // Payouts chart — buckets the trade's settlement-eligible jobs over the
  // selected period.
  const chart = useMemo(
    () => buildChart(settlements, chartPeriod, today),
    [settlements, chartPeriod, today],
  );

  // Tax-time aggregates — anchored to the trade's RCTI'd jobs (so figures
  // line up with what's lodgeable for BAS/income tax, not just generic
  // settlement).
  const taxView = useMemo(() => {
    const rctis = state.jobs.filter((j) => !!j.rctiNumber);
    const qtr = getCurrentQuarter(today);
    const fy = getCurrentFY(today);

    const inRange = (start: Date, end: Date) =>
      rctis.filter((j) => {
        const d = dateForOffset(j.dateOffsetDays);
        return d >= start && d <= end;
      });

    const summarise = (jobs: Job[]) => {
      const total = jobs.reduce((s, j) => s + j.value, 0);
      const gst = state.trade.gstRegistered
        ? jobs.reduce((s, j) => s + (j.value - j.value / 1.1), 0)
        : 0;
      return { total, gst, count: jobs.length };
    };

    return {
      qtr: { ...summarise(inRange(qtr.start, qtr.end)), label: qtr.label },
      fy: { ...summarise(inRange(fy.start, fy.end)), label: fy.label },
    };
  }, [state.jobs, state.trade.gstRegistered, today]);

  // By-client breakdown — split RCTI'd revenue by client over the chosen
  // period. Defaults to last 30 days as the "what's coming in lately" lens.
  const [clientPeriod, setClientPeriod] = useState<ClientPeriod>("30d");
  const clientBreakdown = useMemo(() => {
    const rctis = state.jobs.filter((j) => !!j.rctiNumber);
    let start: Date;
    let end: Date = today;
    if (clientPeriod === "30d") {
      start = new Date(today);
      start.setDate(today.getDate() - 30);
    } else if (clientPeriod === "qtr") {
      const q = getCurrentQuarter(today);
      start = q.start;
      end = q.end;
    } else {
      const fy = getCurrentFY(today);
      start = fy.start;
      end = fy.end;
    }
    const inRange = rctis.filter((j) => {
      const d = dateForOffset(j.dateOffsetDays);
      return d >= start && d <= end;
    });
    const byClient = new Map<JobClient, { total: number; count: number }>();
    inRange.forEach((j) => {
      const cur = byClient.get(j.client) ?? { total: 0, count: 0 };
      cur.total += j.value;
      cur.count += 1;
      byClient.set(j.client, cur);
    });
    const rows = Array.from(byClient.entries())
      .map(([client, v]) => ({ client, ...v }))
      .sort((a, b) => b.total - a.total);
    const grandTotal = rows.reduce((s, r) => s + r.total, 0);
    return { rows, grandTotal };
  }, [state.jobs, clientPeriod, today]);

  const sub = state.trade.subscription;
  const bank = state.trade.bankAccount;
  const card = state.trade.paymentMethod;
  const team = state.team;

  return (
    <main className="pb-8">
      <PageHeader title="Money" />

      {/* Top metric strip */}
      <section className="px-5 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <MetricCard
            label="Total Settled"
            value={`$${metrics.settled.toFixed(0)}`}
            tone="success"
            icon="📈"
          />
          <MetricCard
            label="Pending"
            value={`$${metrics.pending.toFixed(0)}`}
            tone="info"
            icon="⏳"
          />
          <MetricCard
            label="Action Needed"
            value={String(metrics.actionCount)}
            tone={metrics.actionCount > 0 ? "danger" : "muted"}
            icon="⚠️"
          />
        </div>
      </section>

      {/* Payouts Overview chart */}
      <section className="mt-4 px-5">
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Payouts Overview
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight">
                  ${chart.total.toFixed(2)}
                </p>
                {chart.trendPct !== null ? (
                  <span
                    className={
                      "text-[12px] font-semibold " +
                      (chart.trendPct >= 0 ? "text-success" : "text-danger")
                    }
                  >
                    {chart.trendPct >= 0 ? "▲" : "▼"}{" "}
                    {Math.abs(chart.trendPct).toFixed(1)}%
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1">
            {CHART_PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setChartPeriod(p.key)}
                className={
                  "rounded-full px-2.5 py-1 text-[11px] font-medium " +
                  (chartPeriod === p.key
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-muted")
                }
                style={{ minHeight: 26 }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <PayoutsChart points={chart.points} />
          </div>
        </div>
      </section>

      {/* Tax-time view — BAS quarter + financial year aggregates */}
      <section className="mt-4 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Tax time
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <TaxCard
            href="/money/rctis?period=qtr"
            heading="This quarter"
            subheading={taxView.qtr.label}
            total={taxView.qtr.total}
            gst={state.trade.gstRegistered ? taxView.qtr.gst : null}
            count={taxView.qtr.count}
            note="For BAS lodgement"
          />
          <TaxCard
            href="/money/rctis?period=fy"
            heading="This FY"
            subheading={taxView.fy.label}
            total={taxView.fy.total}
            gst={state.trade.gstRegistered ? taxView.fy.gst : null}
            count={taxView.fy.count}
            note="For income tax"
          />
        </div>
      </section>

      {/* By client breakdown */}
      <section className="mt-4 px-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            By client
          </h2>
          <div className="flex gap-1">
            {CLIENT_PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setClientPeriod(p.key)}
                className={
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold " +
                  (clientPeriod === p.key
                    ? "bg-accent text-white"
                    : "bg-surface-2 text-muted")
                }
                style={{ minHeight: 24 }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4">
          {clientBreakdown.rows.length === 0 ? (
            <p className="text-sm text-muted">
              No invoiced jobs in this period yet.
            </p>
          ) : (
            <div className="space-y-3">
              {clientBreakdown.rows.map((r) => {
                const pct =
                  clientBreakdown.grandTotal > 0
                    ? (r.total / clientBreakdown.grandTotal) * 100
                    : 0;
                return (
                  <div key={r.client}>
                    <div className="flex items-baseline justify-between">
                      <p className="text-[13px] font-semibold">{r.client}</p>
                      <p className="text-[13px] font-semibold">
                        ${r.total.toFixed(0)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                      <p className="w-16 text-right text-[10px] text-muted-strong">
                        {r.count} job{r.count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-border pt-2 text-[11px] text-muted-strong">
                ${clientBreakdown.grandTotal.toFixed(0)} total across{" "}
                {clientBreakdown.rows.length} client
                {clientBreakdown.rows.length === 1 ? "" : "s"}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent RCTIs with filter tabs */}
      <section className="mt-6 px-5">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Job Settlements
          </h2>
          {settlements.length > 5 ? (
            <Link
              href="/money/rctis"
              className="text-[11px] font-medium text-accent"
            >
              View all RCTIs →
            </Link>
          ) : null}
        </div>

        <div className="flex rounded-xl bg-surface p-1">
          <TabButton
            active={settlementsTab === "all"}
            onClick={() => setSettlementsTab("all")}
            label={`All (${tabCounts.all})`}
          />
          <TabButton
            active={settlementsTab === "action"}
            onClick={() => setSettlementsTab("action")}
            label={`Action (${tabCounts.action})`}
            tone={tabCounts.action > 0 ? "danger" : undefined}
          />
          <TabButton
            active={settlementsTab === "settled"}
            onClick={() => setSettlementsTab("settled")}
            label={`Settled (${tabCounts.settled})`}
          />
        </div>

        <div className="mt-3 space-y-2">
          {filteredSettlements.length === 0 ? (
            <p className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4 text-sm text-muted">
              {settlementsTab === "action"
                ? "Nothing needs your attention right now."
                : settlementsTab === "settled"
                  ? "No settled jobs yet."
                  : "No completed jobs yet."}
            </p>
          ) : (
            filteredSettlements
              .slice(0, 5)
              .map((j) => (
                <SettlementRow
                  key={j.id}
                  job={j}
                  hasTeam={state.hasTeam}
                  teamMemberName={
                    j.assignedToMemberId
                      ? team.members.find((m) => m.id === j.assignedToMemberId)
                          ?.name
                      : undefined
                  }
                />
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
          className="block rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4"
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
          className="block rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4"
        >
          {bank ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold">{bank.accountName}</p>
                  <p className="mt-1 text-xs text-muted">
                    BSB {bank.bsb} · Account ••••
                    {bank.accountNumber.slice(-4)}
                  </p>
                </div>
                <Badge tone="success">✓ Verified</Badge>
              </div>
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
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4">
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

function TaxCard({
  href,
  heading,
  subheading,
  total,
  gst,
  count,
  note,
}: {
  href: string;
  heading: string;
  subheading: string;
  total: number;
  gst: number | null;
  count: number;
  note: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-3 hover:bg-surface-2"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
        {heading}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-strong">{subheading}</p>
      <p className="mt-1 text-[20px] font-bold tracking-tight text-accent">
        ${total.toFixed(0)}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">
        {count} RCTI{count === 1 ? "" : "s"}
        {gst !== null ? ` · GST $${gst.toFixed(0)}` : ""}
      </p>
      <p className="mt-2 text-[10px] text-muted-strong">{note} →</p>
    </Link>
  );
}

function MetricCard({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "success" | "info" | "danger" | "muted";
  icon: string;
}) {
  const valueClass =
    tone === "success"
      ? "text-success"
      : tone === "info"
        ? "text-info"
        : tone === "danger"
          ? "text-danger"
          : "text-foreground";
  return (
    <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
        <span className="mr-1">{icon}</span>
        {label}
      </p>
      <p className={"mt-1 text-[20px] font-bold tracking-tight " + valueClass}>
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: "danger";
}) {
  const inactiveColor =
    tone === "danger" ? "text-danger" : "text-muted hover:text-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex-1 rounded-lg py-2 text-[12px] font-semibold " +
        (active ? "bg-accent text-white" : inactiveColor)
      }
      style={{ minHeight: 36 }}
    >
      {label}
    </button>
  );
}

function SettlementRow({
  job,
  hasTeam,
  teamMemberName,
}: {
  job: Job;
  hasTeam: boolean;
  teamMemberName?: string;
}) {
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

  const isAction = job.paymentStatus === "Action Required";
  const assigneeLabel = hasTeam
    ? teamMemberName
      ? teamMemberName.split(" ")[0]
      : "You"
    : null;

  return (
    <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)]">
      <Link href={`/money/rcti/${job.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-muted">
              {job.client} · {job.cgNumber}
            </p>
            <p className="mt-0.5 text-[14px] font-semibold">
              {job.rctiNumber ?? "RCTI pending"}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {job.type} · {job.customer.suburb}
            </p>
            {assigneeLabel ? (
              <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted">
                👤 {assigneeLabel}
              </p>
            ) : null}
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
      {isAction ? (
        <Link
          href={`/money/rcti/${job.id}`}
          className="flex items-center justify-center border-t border-danger/30 bg-danger/10 py-2.5 text-[12px] font-semibold text-danger"
        >
          Complete Action →
        </Link>
      ) : null}
    </div>
  );
}

// =====================================================================
// Payouts chart — buckets settlement-eligible jobs into a small line chart.
// =====================================================================

interface ChartPoint {
  label: string;
  value: number;
}

function buildChart(
  jobs: Job[],
  period: ChartPeriod,
  today: Date,
): {
  points: ChartPoint[];
  total: number;
  trendPct: number | null;
} {
  const buckets = makeBuckets(period, today);
  const previousBuckets = makePreviousBuckets(period, today);

  const sumIn = (start: Date, end: Date) =>
    jobs
      .filter((j) => {
        const d = dateForOffset(j.dateOffsetDays);
        return d >= start && d <= end;
      })
      .reduce((s, j) => s + j.value, 0);

  const points: ChartPoint[] = buckets.map((b) => ({
    label: b.label,
    value: sumIn(b.start, b.end),
  }));
  const total = points.reduce((s, p) => s + p.value, 0);

  const previousTotal = previousBuckets.reduce(
    (s, b) => s + sumIn(b.start, b.end),
    0,
  );

  let trendPct: number | null = null;
  if (previousTotal > 0) {
    trendPct = ((total - previousTotal) / previousTotal) * 100;
  } else if (total > 0) {
    trendPct = 100; // came from zero — display as "up 100%"
  }

  return { points, total, trendPct };
}

function makeBuckets(
  period: ChartPeriod,
  today: Date,
): { start: Date; end: Date; label: string }[] {
  const out: { start: Date; end: Date; label: string }[] = [];

  if (period === "today") {
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return [{ start, end, label: "Today" }];
  }

  if (period === "7d" || period === "30d") {
    const days = period === "7d" ? 7 : 30;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const label =
        period === "7d"
          ? d.toLocaleDateString("en-AU", { weekday: "short" })
          : d.toLocaleDateString("en-AU", { day: "numeric" });
      out.push({ start, end, label });
    }
    return out;
  }

  // Monthly buckets for 6m / 12m
  const months = period === "6m" ? 6 : 12;
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const end = new Date(
      today.getFullYear(),
      today.getMonth() - i + 1,
      0,
      23,
      59,
      59,
      999,
    );
    out.push({
      start,
      end,
      label: start.toLocaleDateString("en-AU", { month: "short" }),
    });
  }
  return out;
}

function makePreviousBuckets(period: ChartPeriod, today: Date) {
  // Mirror the current buckets but shifted back one full window.
  const days = period === "today" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : period === "6m" ? 30 * 6 : 30 * 12;
  const shifted = new Date(today);
  shifted.setDate(today.getDate() - days);
  return makeBuckets(period, shifted);
}

function PayoutsChart({ points }: { points: ChartPoint[] }) {
  const width = 320;
  const height = 110;
  const padding = 8;

  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-surface-2 text-xs text-muted"
        style={{ height }}
      >
        No data
      </div>
    );
  }

  const max = Math.max(...points.map((p) => p.value), 1);

  // For single-point periods (today): render a centered bar instead of a line
  if (points.length === 1) {
    const barHeight = (points[0].value / max) * (height - padding * 2);
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[110px] w-full text-accent"
      >
        <rect
          x={width / 2 - 30}
          y={height - padding - barHeight}
          width={60}
          height={barHeight}
          rx={4}
          fill="currentColor"
        />
        <text
          x={width / 2}
          y={height - 1}
          textAnchor="middle"
          fontSize="9"
          fill="currentColor"
          opacity="0.5"
        >
          {points[0].label}
        </text>
      </svg>
    );
  }

  const xStep = (width - padding * 2) / (points.length - 1);
  const coords = points.map((p, i) => ({
    x: padding + i * xStep,
    y: height - padding - (p.value / max) * (height - padding * 2),
    label: p.label,
    value: p.value,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padding} L ${coords[0].x} ${height - padding} Z`;

  // Axis labels — show ~4 labels evenly spaced to avoid crowding
  const labelStride = Math.max(1, Math.floor(points.length / 4));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[110px] w-full text-accent"
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#chartFill)" />
      <path d={linePath} stroke="currentColor" strokeWidth="2" fill="none" />
      {coords.map((c, i) =>
        c.value > 0 ? (
          <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="currentColor" />
        ) : null,
      )}
      {coords.map((c, i) =>
        i % labelStride === 0 || i === coords.length - 1 ? (
          <text
            key={`l-${i}`}
            x={c.x}
            y={height - 1}
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            opacity="0.5"
          >
            {c.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}
