"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { dateForOffset, formatDateShort } from "@/lib/demo-data";
import type { Job, JobClient, PaymentStatus } from "@/lib/types";

type DateFilter = "all" | "30days" | "fy";
type ClientFilter = "all" | JobClient;

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "30days", label: "Last 30 days" },
  { key: "fy", label: "This FY" },
];

// Australian financial year: 1 July → 30 June.
function getCurrentFY(today: Date): { start: Date; end: Date } {
  const year = today.getFullYear();
  const month = today.getMonth(); // 0=Jan, 6=Jul
  // If we're in Jan-Jun, FY started last calendar year. Jul-Dec, FY started this calendar year.
  const fyStartYear = month >= 6 ? year : year - 1;
  const start = new Date(fyStartYear, 6, 1);
  const end = new Date(fyStartYear + 1, 5, 30, 23, 59, 59, 999);
  return { start, end };
}

function statusTone(s: PaymentStatus) {
  if (s === "Settled") return "success" as const;
  if (s === "Action Required") return "danger" as const;
  if (s === "Payment Processing") return "info" as const;
  if (s === "RCTI Generated") return "neutral" as const;
  return "neutral" as const;
}

export default function AllRctisPage() {
  const router = useRouter();
  const { state } = useAppState();
  const today = new Date();

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [clientFilter, setClientFilter] = useState<ClientFilter>("all");

  const allRctis = useMemo(
    () =>
      state.jobs
        .filter((j) => !!j.rctiNumber)
        .sort((a, b) => b.dateOffsetDays - a.dateOffsetDays),
    [state.jobs],
  );

  const clientsPresent = useMemo(() => {
    const set = new Set<JobClient>();
    allRctis.forEach((j) => set.add(j.client));
    return Array.from(set);
  }, [allRctis]);

  const filtered = useMemo(() => {
    return allRctis.filter((j) => {
      if (clientFilter !== "all" && j.client !== clientFilter) return false;
      if (dateFilter === "all") return true;
      const d = dateForOffset(j.dateOffsetDays);
      if (dateFilter === "30days") {
        const cutoff = new Date(today);
        cutoff.setDate(today.getDate() - 30);
        return d >= cutoff;
      }
      if (dateFilter === "fy") {
        const fy = getCurrentFY(today);
        return d >= fy.start && d <= fy.end;
      }
      return true;
    });
  }, [allRctis, dateFilter, clientFilter, today]);

  const total = filtered.reduce((s, j) => s + j.value, 0);
  const gstCollected = state.trade.gstRegistered
    ? filtered.reduce((s, j) => s + (j.value - j.value / 1.1), 0)
    : 0;

  return (
    <main className="pb-8">
      <PageHeader
        title="All RCTIs"
        subtitle={`${allRctis.length} on file`}
        back
        onBack={() => router.push("/money")}
      />

      {/* Filters */}
      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-3">
          <div className="flex items-center gap-2 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-strong">
              Period
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DATE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setDateFilter(f.key)}
                  className={
                    "rounded-full px-3 py-1 text-[11px] font-medium " +
                    (dateFilter === f.key
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-muted")
                  }
                  style={{ minHeight: 26 }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {clientsPresent.length > 1 ? (
            <div className="flex items-center gap-2 border-t border-border pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-strong">
                Client
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setClientFilter("all")}
                  className={
                    "rounded-full px-3 py-1 text-[11px] font-medium " +
                    (clientFilter === "all"
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-muted")
                  }
                  style={{ minHeight: 26 }}
                >
                  All
                </button>
                {clientsPresent.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClientFilter(c)}
                    className={
                      "rounded-full px-3 py-1 text-[11px] font-medium " +
                      (clientFilter === c
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-muted")
                    }
                    style={{ minHeight: 26 }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Aggregates for the filter */}
      <section className="mt-3 px-5">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {filtered.length} RCTI{filtered.length === 1 ? "" : "s"} ·{" "}
            {DATE_FILTERS.find((f) => f.key === dateFilter)?.label}
          </p>
          <p className="mt-1 text-[24px] font-bold tracking-tight text-accent">
            ${total.toFixed(2)}
          </p>
          {state.trade.gstRegistered && filtered.length > 0 ? (
            <p className="mt-0.5 text-xs text-muted">
              GST collected: ${gstCollected.toFixed(2)}
            </p>
          ) : null}
        </div>
      </section>

      {/* List */}
      <section className="mt-3 px-5">
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
              No RCTIs match these filters.
            </p>
          ) : (
            filtered.map((j) => <RctiRow key={j.id} job={j} />)
          )}
        </div>
      </section>
    </main>
  );
}

function RctiRow({ job }: { job: Job }) {
  const issued = dateForOffset(job.dateOffsetDays);
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
          <p className="mt-0.5 text-[14px] font-semibold">{job.rctiNumber}</p>
          <p className="mt-0.5 text-xs text-muted">
            {job.type} · {job.customer.suburb} · Issued{" "}
            {formatDateShort(issued)}
          </p>
        </div>
        <p className="shrink-0 text-[16px] font-bold text-accent">
          ${job.value.toFixed(2)}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <Badge tone={statusTone(job.paymentStatus)}>{job.paymentStatus}</Badge>
        <span className="text-[11px] text-accent">View →</span>
      </div>
    </Link>
  );
}
