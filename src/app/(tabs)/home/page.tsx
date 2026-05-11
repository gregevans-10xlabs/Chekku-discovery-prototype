"use client";

/**
 * Home — C+ AI-first surface, Phase 6 EH-discipline pass.
 *
 * The structural decisions stay the same as the Phase 2 rebuild
 * (single consistent layout with mode-adaptive content) but every
 * visual element gets EH-style polish:
 *
 * 1. No greeting. The "Today $X" big number is the page hero — Aaron's
 *    Big Number pattern restored to its rightful place at all hours.
 * 2. Cards float (white surface + soft shadow, no borders) on the
 *    page's slight cool wash. Visual depth without visual noise.
 * 3. Standard 3-element card pattern (icon + title/subtitle + CTA →)
 *    used wherever possible so cards are predictable to scan.
 * 4. Section headers removed from Home. Cards order themselves by
 *    priority; the user reads top-down.
 * 5. AI input stays visible (still primary) but suggestion chips
 *    collapse at rest and appear on focus — keeps the surface calm
 *    while preserving instant typing.
 * 6. Imperative CTA copy ("Open", "Fix it", "Browse", "Check").
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/lib/state/AppStateProvider";
import {
  getComplianceDocs,
  startTimeToMinutes,
} from "@/lib/demo-data";
import type { AttendanceConfirmation, Job } from "@/lib/types";
import AskAI from "@/components/AskAI";
import { homeContext } from "@/lib/ai/contexts";

type Mode = "morning" | "during" | "evening" | "tomorrow";

export default function HomePage() {
  const { state, dispatch } = useAppState();
  const router = useRouter();

  const ownJobs = useMemo(
    () =>
      state.hasTeam
        ? state.jobs.filter((j) => !j.assignedToMemberId)
        : state.jobs,
    [state.jobs, state.hasTeam],
  );

  const todayJobs = useMemo(
    () =>
      ownJobs
        .filter((j) => j.dateOffsetDays === 0)
        .sort(
          (a, b) =>
            startTimeToMinutes(a.startTime) - startTimeToMinutes(b.startTime),
        ),
    [ownJobs],
  );

  const tomorrowJobs = useMemo(
    () =>
      ownJobs
        .filter((j) => j.dateOffsetDays === 1)
        .sort(
          (a, b) =>
            startTimeToMinutes(a.startTime) - startTimeToMinutes(b.startTime),
        ),
    [ownJobs],
  );

  const activeJob = todayJobs.find((j) => j.status === "InProgress") ?? null;
  const allDone =
    todayJobs.length > 0 && todayJobs.every((j) => j.status === "Completed");

  const mode: Mode =
    state.dayView === "tomorrow" && allDone
      ? "tomorrow"
      : allDone
        ? "evening"
        : activeJob
          ? "during"
          : "morning";

  return (
    <main className="flex flex-col gap-3 pb-6">
      {/* Combined header row — big number + avatar share a single
          horizontal row so the top of the page isn't wasted on an
          empty header band. Phase 7 change 7. */}
      <CombinedHeader
        mode={mode}
        todayJobs={todayJobs}
        tomorrowJobs={tomorrowJobs}
        activeJob={activeJob}
      />

      {/* AI surface — accent-tinted to be visually distinct from the
          regular floating cards below. Phase 7 change 5. */}
      <section className="px-5">
        <AIInputCollapsible mode={mode} />
      </section>

      {/* Card stack — pruned per Phase 7 changes 1, 4, 6 */}
      <CardStack
        mode={mode}
        todayJobs={todayJobs}
        tomorrowJobs={tomorrowJobs}
        activeJob={activeJob}
        dispatch={dispatch}
        router={router}
        onPlanTomorrow={() =>
          dispatch({ type: "set-day-view", view: "tomorrow" })
        }
      />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CombinedHeader — Phase 7 change 7. Big-number hero and Profile
// avatar share a single horizontal row at the top of the page so we
// don't waste the top ~60pt on an empty header band. The dollar
// amount is the dominant element; "Today" label + subtitle wrap
// around it. Avatar sits right-aligned, vertically centered against
// the dollar amount.

function CombinedHeader({
  mode,
  todayJobs,
  tomorrowJobs,
  activeJob,
}: {
  mode: Mode;
  todayJobs: Job[];
  tomorrowJobs: Job[];
  activeJob: Job | null;
}) {
  const earned = todayJobs
    .filter((j) => j.status === "Completed")
    .reduce((s, j) => s + j.value, 0);
  const totalPotential = todayJobs.reduce((s, j) => s + j.value, 0);
  const tomorrowTotal = tomorrowJobs.reduce((s, j) => s + j.value, 0);
  const nextJob = todayJobs.find((j) => j.status === "Confirmed");

  let label: string;
  let amount: number;
  let subtitle: string;

  if (mode === "evening") {
    label = "Today";
    amount = earned;
    subtitle = `${todayJobs.length} ${todayJobs.length === 1 ? "job" : "jobs"} done`;
  } else if (mode === "tomorrow") {
    label = "Tomorrow";
    amount = tomorrowTotal;
    const first = tomorrowJobs[0];
    subtitle = first
      ? `${tomorrowJobs.length} ${tomorrowJobs.length === 1 ? "job" : "jobs"} · first ${first.startTime.toLowerCase()}`
      : "Nothing scheduled";
  } else if (mode === "during") {
    label = "Today";
    amount = earned;
    const doneCount = todayJobs.filter((j) => j.status === "Completed").length;
    subtitle = activeJob
      ? `${doneCount} of ${todayJobs.length} done · on site now`
      : `${doneCount} of ${todayJobs.length} done`;
  } else {
    // morning
    label = "Today";
    amount = totalPotential;
    subtitle = nextJob
      ? `${todayJobs.length} ${todayJobs.length === 1 ? "job" : "jobs"} · next ${nextJob.startTime.toLowerCase()}`
      : `${todayJobs.length} ${todayJobs.length === 1 ? "job" : "jobs"}`;
  }

  return (
    <header className="flex items-center justify-between gap-4 px-5 pt-5">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2.5">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-muted">
            {label}
          </p>
          <p className="text-[40px] font-bold leading-none tracking-tight text-foreground">
            ${amount.toFixed(0)}
          </p>
        </div>
        <p className="mt-1.5 text-[13px] text-muted">{subtitle}</p>
      </div>
      <Link
        href="/profile"
        aria-label="Profile"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-[14px] font-bold text-accent-strong"
        style={{ minHeight: 44 }}
      >
        BS
      </Link>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// AI input — input always visible (AI is primary), chips reveal on
// focus to keep the surface calm at rest.

function AIInputCollapsible({ mode }: { mode: Mode }) {
  const { state } = useAppState();
  const docs = getComplianceDocs();
  const context = useMemo(
    () => homeContext(state, docs),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.trade, state.jobs, state.opportunities, state.hasTeam, mode],
  );

  const suggestions = (() => {
    switch (mode) {
      case "morning":
        return [
          {
            label: "Walk me through today",
            question: "Walk me through today — what should I prep for each job?",
          },
          {
            label: "Any work nearby?",
            question: "What jobs are available near me right now?",
          },
          {
            label: "Anything I should sort first?",
            question:
              "Before I head out today, is there anything I'm missing — compliance about to lapse, jobs I haven't confirmed, equipment unresolved, anything outstanding?",
          },
        ];
      case "during":
        return [
          {
            label: "Anything I should check?",
            question: "What do I need to know before I leave the current job?",
          },
          {
            label: "What photos do I need?",
            question: "What photos do I need to capture for this job type?",
          },
          {
            label: "I'm running late",
            question:
              "I'm running late — draft a message I can send to the next customer to let them know.",
          },
        ];
      case "evening":
        return [
          {
            label: "How did I do today?",
            question: "Summarise today — earnings, jobs done, anything outstanding.",
          },
          {
            label: "What's tomorrow?",
            question: "What's on for tomorrow? Any prep I should do tonight?",
          },
          {
            label: "Anything outstanding?",
            question:
              "Anything I haven't dealt with yet — pending RCTIs, unresponded opportunities, compliance to-dos?",
          },
        ];
      case "tomorrow":
        return [
          {
            label: "Walk me through tomorrow",
            question: "What's the plan for tomorrow?",
          },
          {
            label: "Am I sorted for tomorrow?",
            question:
              "Is my compliance covered for tomorrow's jobs and is the equipment ready?",
          },
          {
            label: "Any extra work tomorrow?",
            question: "Are there other opportunities tomorrow worth picking up?",
          },
        ];
    }
  })();

  return (
    <AskAI
      size="prominent"
      context={context}
      placeholder="Ask Chekku anything…"
      suggestions={suggestions}
      collapsibleChips
      distinctive
    />
  );
}

// ─────────────────────────────────────────────────────────────────────
// Card stack — exception cards + mode-specific tiles + opportunities +
// compliance, all in priority order with no section headers.

function CardStack({
  mode,
  todayJobs,
  tomorrowJobs,
  activeJob,
  dispatch,
  router,
  onPlanTomorrow,
}: {
  mode: Mode;
  todayJobs: Job[];
  tomorrowJobs: Job[];
  activeJob: Job | null;
  dispatch: (a: {
    type: "set-attendance";
    jobId: string;
    attendance: AttendanceConfirmation;
  }) => void;
  router: ReturnType<typeof useRouter>;
  onPlanTomorrow: () => void;
}) {
  return (
    <section className="space-y-3 px-5">
      {/* Mode-specific primary tile(s) */}
      {mode === "morning" ? (
        <MorningCards
          jobs={todayJobs}
          dispatch={dispatch}
          router={router}
        />
      ) : null}
      {mode === "during" && activeJob ? (
        <DuringCards
          jobs={todayJobs}
          activeJob={activeJob}
          router={router}
        />
      ) : null}
      {mode === "evening" ? (
        <EveningCards jobs={todayJobs} onPlanTomorrow={onPlanTomorrow} />
      ) : null}
      {mode === "tomorrow" ? (
        <TomorrowCards
          jobs={tomorrowJobs}
          dispatch={dispatch}
          router={router}
        />
      ) : null}

      {/* Home-specific notifications only — cross-tab notifications
          (urgent opportunity, RCTI Action Required, jeopardy on
          delegated jobs) now surface as nav badges on the relevant
          tabs. Phase 7 changes 1, 4, 8. */}
      <HomeNotificationPill />

      {/* Single opportunity surface — mutually exclusive between
          "nearby work" and "cert unlock". Phase 7 change 6. */}
      <OpportunityCardSingle />
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Mode-specific card sets

function MorningCards({
  jobs,
  dispatch,
  router,
}: {
  jobs: Job[];
  dispatch: (a: {
    type: "set-attendance";
    jobId: string;
    attendance: AttendanceConfirmation;
  }) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const pending = jobs.filter((j) => j.attendance === "Pending");
  const next = jobs.find(
    (j) => j.status === "Confirmed" && j.attendance === "Confirmed",
  );

  if (pending.length > 0) {
    return (
      <>
        {pending.map((j) => (
          <AttendanceCard
            key={j.id}
            job={j}
            onConfirm={() =>
              dispatch({
                type: "set-attendance",
                jobId: j.id,
                attendance: "Confirmed",
              })
            }
            onFlag={() =>
              dispatch({
                type: "set-attendance",
                jobId: j.id,
                attendance: "Unable",
              })
            }
            onOpen={() => router.push(`/jobs/${j.id}`)}
          />
        ))}
      </>
    );
  }

  if (next) return <NextJobCard job={next} router={router} />;
  return null;
}

function DuringCards({
  jobs,
  activeJob,
  router,
}: {
  jobs: Job[];
  activeJob: Job;
  router: ReturnType<typeof useRouter>;
}) {
  const remaining = jobs.filter((j) => j.status === "Confirmed");
  return (
    <>
      <button
        type="button"
        onClick={() => router.push(`/jobs/${activeJob.id}`)}
        className="block w-full rounded-2xl border border-accent/30 bg-accent-soft p-4 text-left"
        style={{ minHeight: 44 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-[16px] text-white">
            🔧
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
              On site now
            </p>
            <p className="mt-1 text-[15px] font-bold leading-tight">
              {activeJob.type} · {activeJob.startTime.toLowerCase()}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-foreground/85">
              {activeJob.customer.firstName} · {activeJob.customer.suburb}
            </p>
          </div>
          <span className="shrink-0 text-[13px] font-semibold text-accent-strong">
            Continue →
          </span>
        </div>
      </button>
      {remaining.length > 0 ? (
        <div className="rounded-2xl bg-surface p-3 [box-shadow:var(--shadow-card)]">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Up next today
          </p>
          <div className="space-y-1.5">
            {remaining.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => router.push(`/jobs/${j.id}`)}
                className="flex w-full items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5 text-left"
                style={{ minHeight: 44 }}
              >
                <div>
                  <p className="text-[13px] font-semibold">
                    {j.startTime} · {j.type}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {j.customer.suburb}
                  </p>
                </div>
                <span className="text-[14px] font-bold text-accent-strong">
                  ${j.value.toFixed(0)}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function EveningCards({
  jobs,
  onPlanTomorrow,
}: {
  jobs: Job[];
  onPlanTomorrow: () => void;
}) {
  const earned = jobs.reduce((s, j) => s + j.value, 0);
  return (
    <>
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-soft to-transparent p-5 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
          🎉 Day complete
        </p>
        <p className="mt-2 text-[15px] text-muted">
          {jobs.length} {jobs.length === 1 ? "job" : "jobs"} done · ${earned.toFixed(0)} earned
        </p>
      </div>
      <div className="rounded-2xl bg-surface p-4 [box-shadow:var(--shadow-card)]">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong text-[18px]">
            💸
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-tight">
              Next payment
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              Settles in 1–2 business days
            </p>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onPlanTomorrow}
        className="block w-full rounded-2xl bg-surface p-4 text-left [box-shadow:var(--shadow-card)]"
        style={{ minHeight: 44 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong text-[18px]">
            📅
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-tight">
              Plan tomorrow
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              Confirm attendance and check equipment
            </p>
          </div>
          <span className="shrink-0 text-[13px] font-semibold text-accent-strong">
            Open →
          </span>
        </div>
      </button>
    </>
  );
}

function TomorrowCards({
  jobs,
  dispatch,
  router,
}: {
  jobs: Job[];
  dispatch: (a: {
    type: "set-attendance";
    jobId: string;
    attendance: AttendanceConfirmation;
  }) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const unresolvedDelivery = jobs.some(
    (j) =>
      j.equipmentDeliveryStatus === "Not Yet Received" ||
      j.equipmentDeliveryStatus === "Delayed",
  );
  return (
    <>
      {unresolvedDelivery ? (
        <div className="rounded-2xl border border-warn/40 bg-warn-soft p-4">
          <div className="flex items-center gap-3">
            <span className="text-[20px]" aria-hidden>
              ⚠️
            </span>
            <div>
              <p className="text-[14px] font-semibold text-warn">
                Equipment not delivered
              </p>
              <p className="mt-0.5 text-[12px] text-foreground/85">
                One of tomorrow&apos;s jobs has equipment unresolved. Tap
                the job to track or contact Circl Support.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      {jobs.map((j) => (
        <AttendanceCard
          key={j.id}
          job={j}
          onConfirm={() =>
            dispatch({
              type: "set-attendance",
              jobId: j.id,
              attendance: "Confirmed",
            })
          }
          onFlag={() =>
            dispatch({
              type: "set-attendance",
              jobId: j.id,
              attendance: "Unable",
            })
          }
          onOpen={() => router.push(`/jobs/${j.id}`)}
        />
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Card primitives — applied to the standard 3-element pattern wherever
// possible. Only attendance cards and the SWMS-warning case need
// bespoke treatment because they have multiple actions / states.

function NextJobCard({
  job,
  router,
}: {
  job: Job;
  router: ReturnType<typeof useRouter>;
}) {
  const swmsGap = job.complianceRequired.some(
    (c) => !c.verified && c.name.toLowerCase().includes("swms"),
  );
  return (
    <button
      type="button"
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="block w-full rounded-2xl bg-surface p-4 text-left [box-shadow:var(--shadow-card)]"
      style={{ minHeight: 44 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong text-[18px]">
          📍
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Your next job
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-tight">
            {job.type} · {job.startTime.toLowerCase()}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {job.customer.firstName} · {job.customer.suburb}
          </p>
        </div>
        {/* Phase 7 change 3: primary CTA is a filled pill, not a text arrow */}
        <span className="shrink-0 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white">
          Open job
        </span>
      </div>
      {swmsGap ? (
        <p className="mt-3 border-t border-warn/30 pt-3 text-[12px] font-semibold text-warn">
          ⚠ SWMS gap — upload before site arrival
        </p>
      ) : null}
    </button>
  );
}

function AttendanceCard({
  job,
  onConfirm,
  onFlag,
  onOpen,
}: {
  job: Job;
  onConfirm: () => void;
  onFlag: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 [box-shadow:var(--shadow-card)]">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              {job.client} · {job.startTime}
            </p>
            <p className="mt-1 text-[15px] font-bold leading-tight">
              {job.type}
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              {job.customer.firstName} {job.customer.lastName} ·{" "}
              {job.customer.suburb}
            </p>
          </div>
          <span className="shrink-0 text-[16px] font-bold text-accent-strong">
            ${job.value.toFixed(0)}
          </span>
        </div>
      </button>
      {job.attendance === "Pending" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl border border-success/30 bg-success-soft py-3 text-[14px] font-semibold text-success"
            style={{ minHeight: 44 }}
          >
            ✓ I&apos;ll attend
          </button>
          <button
            type="button"
            onClick={onFlag}
            className="rounded-xl border border-danger/30 bg-danger-soft py-3 text-[14px] font-semibold text-danger"
            style={{ minHeight: 44 }}
          >
            ✗ Can&apos;t attend
          </button>
        </div>
      ) : job.attendance === "Confirmed" ? (
        <button
          type="button"
          onClick={onOpen}
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-accent-soft px-4 py-3 text-[13px] font-semibold text-accent-strong"
          style={{ minHeight: 44 }}
        >
          <span>✓ Attendance confirmed</span>
          <span>Open →</span>
        </button>
      ) : (
        <div className="mt-3 rounded-xl bg-danger-soft px-4 py-3 text-[13px] font-semibold text-danger">
          Flagged — Circl has been notified
        </div>
      )}

      {job.tracking &&
      (job.equipmentDeliveryStatus === "Not Yet Received" ||
        job.equipmentDeliveryStatus === "Delayed" ||
        job.equipmentDeliveryStatus === "Expected Today") ? (
        <a
          href={job.tracking.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 -mx-4 -mb-4 flex items-center justify-between border-t border-warn/30 bg-warn-soft px-4 py-3 text-[12px] font-semibold text-warn"
        >
          <span>
            📦 Track {job.tracking.carrier} · {job.tracking.number}
          </span>
          <span>→</span>
        </a>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// HomeNotificationPill — Phase 7 changes 1, 4. Cross-tab notifications
// (urgent opportunity, RCTI Action Required, jeopardy on delegated
// jobs) now surface as nav badges; this pill carries only HOME-specific
// items (recent wins, things the trade can resolve from Home itself).
// At rest with one item: full pill with inline action. With multiple
// items: collapsed pill showing count, expandable.

function HomeNotificationPill() {
  const { state } = useAppState();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const items = useMemo(() => {
    const out: Array<{
      id: string;
      icon: string;
      title: string;
      href: string;
      cta: string;
    }> = [];

    // Recent wins surface here as a celebration touch (kept on Home
    // because the trade just acted to win this; immediate feedback).
    const RECENT_WIN_MS = 5 * 60_000;
    state.jobs
      .filter(
        (j) => !!j.wonAt && nowMs - new Date(j.wonAt).getTime() <= RECENT_WIN_MS,
      )
      .forEach((job) => {
        out.push({
          id: `won-${job.id}`,
          icon: "🎉",
          title: `${job.type} won — ${job.cgNumber}`,
          href: `/jobs/${job.id}`,
          cta: "Open job",
        });
      });

    return out;
  }, [state.jobs, nowMs]);

  if (items.length === 0) return null;

  // Single item: full pill with inline button
  if (items.length === 1) {
    const n = items[0];
    return (
      <Link
        href={n.href}
        className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3"
        style={{ minHeight: 44 }}
      >
        <span className="text-[18px]" aria-hidden>
          {n.icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">
          {n.title}
        </span>
        <span className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white">
          {n.cta}
        </span>
      </Link>
    );
  }

  // Multiple items: collapsed pill, expand on tap
  return (
    <div className="overflow-hidden rounded-2xl border border-accent/30 bg-accent-soft">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        style={{ minHeight: 44 }}
      >
        <span className="text-[18px]" aria-hidden>
          ✨
        </span>
        <span className="min-w-0 flex-1 text-[14px] font-semibold">
          {items.length} things on Home
        </span>
        <span className="shrink-0 text-[16px] text-accent-strong" aria-hidden>
          {expanded ? "▴" : "▾"}
        </span>
      </button>
      {expanded ? (
        <div className="space-y-1 border-t border-accent/30 bg-surface/40 p-2">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface"
              style={{ minHeight: 44 }}
            >
              <span className="text-[16px]" aria-hidden>
                {n.icon}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                {n.title}
              </span>
              <span className="shrink-0 text-[12px] font-semibold text-accent-strong">
                {n.cta} →
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// OpportunityCardSingle — Phase 7 change 6. Show ONE opportunity surface
// at a time, mutually exclusive: nearby work if available, otherwise
// the cert-unlock card. Quiet days surface the unlock; busy days
// surface the volume opportunity.

function OpportunityCardSingle() {
  const { state } = useAppState();
  const docs = getComplianceDocs();
  const router = useRouter();

  const nearbyAvailable = useMemo(
    () => state.opportunities.filter((o) => !o.outcome).slice(0, 8),
    [state.opportunities],
  );
  const totalNearby = nearbyAvailable.reduce((s, o) => s + o.value, 0);

  const unlock = docs.find(
    (d) => (d.layer === 2 || d.layer === 3) && d.unlocks,
  );

  // Show nearby if there's worthwhile volume; otherwise show unlock
  if (nearbyAvailable.length >= 3) {
    return (
      <button
        type="button"
        onClick={() => router.push("/find-jobs")}
        className="block w-full rounded-2xl bg-surface p-4 text-left [box-shadow:var(--shadow-card)]"
        style={{ minHeight: 44 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong text-[18px]">
            ★
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-tight">
              +${totalNearby.toFixed(0)} nearby
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {nearbyAvailable.length}{" "}
              {nearbyAvailable.length === 1 ? "job" : "jobs"} you could take
              this week
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white">
            Browse
          </span>
        </div>
      </button>
    );
  }

  if (unlock) {
    return (
      <Link
        href="/profile/compliance"
        className="block rounded-2xl border border-accent/30 bg-accent-soft p-4"
        style={{ minHeight: 44 }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-[16px] text-white">
            ★
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
              Unlock more work
            </p>
            <p className="mt-1 text-[15px] font-semibold leading-tight">
              {unlock.name}
            </p>
            <p className="mt-0.5 text-[13px] text-foreground/85">
              {unlock.unlocks}
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white">
            See how
          </span>
        </div>
      </Link>
    );
  }

  return null;
}
