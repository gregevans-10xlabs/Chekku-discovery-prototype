"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { relativeDayLabel } from "@/lib/demo-data";

export default function FindJobsPage() {
  const { state } = useAppState();
  const [tab, setTab] = useState<"available" | "history">("available");

  const history = useMemo(() => {
    const past = state.pastOpportunities;
    const pending = state.opportunities.filter(
      (o) => o.outcome === "awaiting" || o.outcome === "selected",
    );
    return [...pending, ...past];
  }, [state.opportunities, state.pastOpportunities]);

  return (
    <main className="pb-6">
      <PageHeader
        title="Find jobs"
        subtitle={`${state.opportunities.filter((o) => !o.outcome).length} opportunities matched to you`}
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
        <div className="space-y-3 px-4 pt-4">
          {state.opportunities
            .filter((o) => !o.outcome)
            .map((o) => (
              <OpportunityCard key={o.id} id={o.id} data={o} />
            ))}
          {state.opportunities.filter((o) => !o.outcome).length === 0 ? (
            <EmptyState />
          ) : null}
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
