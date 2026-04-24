"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { relativeDayLabel } from "@/lib/demo-data";
import type { Opportunity } from "@/lib/types";

type SortKey = "distance" | "soonest" | "value";

const SORT_LABELS: { key: SortKey; label: string }[] = [
  { key: "distance", label: "Distance" },
  { key: "soonest", label: "Soonest" },
  { key: "value", label: "Value" },
];

export default function FindJobsPage() {
  const { state } = useAppState();
  const [tab, setTab] = useState<"available" | "history">("available");
  const [sort, setSort] = useState<SortKey>("distance");

  const history = useMemo(() => {
    const past = state.pastOpportunities;
    const pending = state.opportunities.filter(
      (o) => o.outcome === "awaiting" || o.outcome === "selected",
    );
    return [...pending, ...past];
  }, [state.opportunities, state.pastOpportunities]);

  const available = useMemo(
    () => state.opportunities.filter((o) => !o.outcome),
    [state.opportunities],
  );

  const sections = useMemo(() => {
    const sorter = (a: Opportunity, b: Opportunity) => {
      if (sort === "distance") return a.distanceKm - b.distanceKm;
      if (sort === "soonest") return a.dateOffsetDays - b.dateOffsetDays;
      return b.value - a.value;
    };
    const urgent = available
      .filter((o) => o.urgent || o.dateOffsetDays === 0)
      .sort(sorter);
    const thisWeek = available
      .filter((o) => !o.urgent && o.dateOffsetDays >= 1 && o.dateOffsetDays <= 7)
      .sort(sorter);
    const later = available
      .filter((o) => !o.urgent && o.dateOffsetDays >= 8)
      .sort(sorter);
    return [
      { key: "urgent", title: "Urgent — today", items: urgent },
      { key: "thisWeek", title: "This week", items: thisWeek },
      { key: "later", title: "Next week+", items: later },
    ];
  }, [available, sort]);

  return (
    <main className="pb-6">
      <PageHeader
        title="Find jobs"
        subtitle={`${available.length} jobs in your area · matched to your trade & compliance`}
      />

      <div className="sticky top-[60px] z-10 bg-background/95 px-4 pt-2 backdrop-blur">
        <div className="flex rounded-xl bg-surface p-1">
          <button
            type="button"
            onClick={() => setTab("available")}
            className={
              "flex-1 rounded-lg py-2 text-sm font-semibold " +
              (tab === "available"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground")
            }
            style={{ minHeight: 40 }}
          >
            Available
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={
              "flex-1 rounded-lg py-2 text-sm font-semibold " +
              (tab === "history"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground")
            }
            style={{ minHeight: 40 }}
          >
            Response history
          </button>
        </div>
      </div>

      {tab === "available" ? (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 pb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
              Sort
            </span>
            <div className="flex gap-1.5">
              {SORT_LABELS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  className={
                    "rounded-full px-3 py-1 text-[12px] font-medium " +
                    (sort === s.key
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-muted")
                  }
                  style={{ minHeight: 28 }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {available.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">
              {sections.map((section) =>
                section.items.length === 0 ? null : (
                  <div key={section.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                        {section.title}
                      </h2>
                      <span className="text-[11px] text-muted">
                        {section.items.length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {section.items.map((o) => (
                        <OpportunityCard key={o.id} id={o.id} data={o} />
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 px-4 pt-4">
          {history.length === 0 ? (
            <p className="px-2 text-sm text-muted">
              No past responses yet.
            </p>
          ) : null}
          {history.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
                    {relativeDayLabel(o.dateOffsetDays)} · {o.suburb}
                  </p>
                  <h3 className="mt-0.5 text-[14px] font-semibold">{o.type}</h3>
                </div>
                <div>
                  {o.outcome === "selected" ? (
                    <Badge tone="success">Selected</Badge>
                  ) : o.outcome === "not-selected" ? (
                    <Badge tone="neutral">Not selected</Badge>
                  ) : (
                    <Badge tone="info">Awaiting decision</Badge>
                  )}
                </div>
              </div>
              {o.responded ? (
                <p className="mt-2 text-xs text-muted">
                  You responded: {o.responded.mode === "accept"
                    ? `Accept at $${o.responded.value}`
                    : o.responded.mode === "propose-rate"
                      ? `Proposed $${o.responded.value}`
                      : "Proposed alternate dates"}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function OpportunityCard({
  id,
  data,
}: {
  id: string;
  data: {
    type: string;
    suburb: string;
    distanceKm: number;
    dateOffsetDays: number;
    timeOfDay: string;
    value: number;
    urgent?: boolean;
    complianceRequired: { name: string; verified: boolean }[];
    customer: { firstName: string; lastNameInitial: string; rating: number };
  };
}) {
  return (
    <Link
      href={`/find-jobs/${id}`}
      className="block rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {data.urgent ? <Badge tone="danger">Urgent</Badge> : null}
            <Badge tone="neutral">
              {relativeDayLabel(data.dateOffsetDays)} · {data.timeOfDay}
            </Badge>
          </div>
          <h3 className="mt-2 text-[15px] font-semibold">{data.type}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {data.suburb} · {data.distanceKm.toFixed(1)} km away
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-accent">
            ${data.value.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <div className="flex flex-wrap gap-1.5">
          {data.complianceRequired.map((c) => (
            <span
              key={c.name}
              className={
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium " +
                (c.verified
                  ? "bg-success-soft text-success"
                  : "bg-warn-soft text-warn")
              }
            >
              {c.verified ? "✓" : "!"} {c.name}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted">
          {data.customer.firstName} {data.customer.lastNameInitial}. · ★ {data.customer.rating}
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 text-center">
      <p className="text-sm text-muted">
        No new opportunities right now. We’ll notify you when a match appears.
      </p>
    </div>
  );
}
