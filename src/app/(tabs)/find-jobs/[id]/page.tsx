"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { relativeDayLabel } from "@/lib/demo-data";

type Mode = "choose" | "accept" | "propose-date" | "propose-rate" | "submitted";

export default function OpportunityDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const opp = state.opportunities.find((o) => o.id === id);
  const [mode, setMode] = useState<Mode>("choose");
  const [rate, setRate] = useState<number>(opp?.value ?? 0);

  if (!opp) {
    return (
      <main>
        <PageHeader title="Not found" back />
        <p className="px-5 pt-6 text-sm text-muted">
          This opportunity isn’t available.
        </p>
      </main>
    );
  }

  const submitAccept = () => {
    dispatch({
      type: "respond-opportunity",
      id: opp.id,
      mode: "accept",
      value: opp.value,
    });
    setMode("submitted");
  };

  const submitRate = () => {
    dispatch({
      type: "respond-opportunity",
      id: opp.id,
      mode: "propose-rate",
      value: rate,
    });
    setMode("submitted");
  };

  const submitDate = () => {
    dispatch({
      type: "respond-opportunity",
      id: opp.id,
      mode: "propose-date",
    });
    setMode("submitted");
  };

  return (
    <main className="pb-8">
      <PageHeader title="Opportunity" subtitle={opp.suburb} back />

      <section className="px-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          {opp.urgent ? <Badge tone="danger">Urgent</Badge> : null}
          <Badge tone="neutral">
            {relativeDayLabel(opp.dateOffsetDays)} · {opp.timeOfDay}
          </Badge>
          <Badge tone="info">{opp.distanceKm.toFixed(1)} km away</Badge>
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">{opp.type}</h1>
        <p className="mt-2 text-3xl font-bold text-accent">
          ${opp.value.toFixed(2)}
        </p>

        <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Scope of work
          </h3>
          <p className="mt-2 text-[14px] leading-6">{opp.scope}</p>
          {opp.longerJobHint ? (
            <p className="mt-2 text-xs text-warn">⚠ {opp.longerJobHint}</p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetaBox label="Customer">
            {opp.customer.firstName} {opp.customer.lastNameInitial}.
            <span className="ml-1 text-muted">★ {opp.customer.rating}</span>
          </MetaBox>
          <MetaBox label="Contact">Available once accepted</MetaBox>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Compliance required
          </h3>
          <ul className="mt-2 space-y-1.5">
            {opp.complianceRequired.map((c) => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <span>{c.name}</span>
                <Badge tone={c.verified ? "success" : "warn"}>
                  {c.verified ? "✓ Verified" : "Not verified"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Response flow */}
      <section className="mt-6 border-t border-border px-5 pt-5">
        {mode === "choose" ? (
          <div className="space-y-2">
            <Button onClick={submitAccept}>
              Accept at ${opp.value.toFixed(0)}
            </Button>
            <Button variant="secondary" onClick={() => setMode("propose-date")}>
              Propose different date
            </Button>
            <Button variant="secondary" onClick={() => setMode("propose-rate")}>
              Propose a different rate
            </Button>
            <p className="mt-3 text-center text-xs text-muted">
              Circl selects the best respondent. You won’t see other responses.
            </p>
          </div>
        ) : null}

        {mode === "propose-rate" ? (
          <div>
            <h3 className="text-sm font-semibold">Propose a rate</h3>
            <p className="mt-1 text-xs text-muted">
              Enter the rate you’d do this job for. Circl weighs rate against
              reliability, compliance, proximity, and history.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRate((r) => Math.max(0, r - 5))}
                className="h-12 w-12 rounded-xl bg-surface-2 text-xl font-bold"
              >
                −
              </button>
              <div className="flex-1 rounded-xl bg-surface p-4 text-center">
                <p className="text-[11px] uppercase tracking-wider text-muted">
                  Your rate
                </p>
                <p className="mt-1 text-3xl font-bold text-accent">
                  ${rate.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRate((r) => r + 5)}
                className="h-12 w-12 rounded-xl bg-surface-2 text-xl font-bold"
              >
                +
              </button>
            </div>
            <div className="mt-5 space-y-2">
              <Button onClick={submitRate}>Submit at ${rate.toFixed(0)}</Button>
              <Button variant="secondary" onClick={() => setMode("choose")}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "propose-date" ? (
          <div>
            <h3 className="text-sm font-semibold">Propose alternate dates</h3>
            <p className="mt-1 text-xs text-muted">
              Pick up to three dates you could do this job instead.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((offset) => (
                <div
                  key={offset}
                  className="rounded-xl bg-surface py-3 text-center text-sm"
                >
                  {relativeDayLabel(opp.dateOffsetDays + offset)}
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              <Button onClick={submitDate}>Submit proposal</Button>
              <Button variant="secondary" onClick={() => setMode("choose")}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "submitted" ? (
          <div className="rounded-2xl border border-success/40 bg-success-soft p-5 text-center">
            <p className="text-xl">✓</p>
            <h3 className="mt-1 text-base font-semibold text-success">
              Response submitted
            </h3>
            <p className="mt-1 text-xs text-muted">
              Circl will notify you once a decision is made. You can view this
              in your response history.
            </p>
            <div className="mt-5 space-y-2">
              <Button onClick={() => router.push("/find-jobs")}>
                Back to Find Jobs
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function MetaBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-sm">{children}</p>
    </div>
  );
}
