"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/lib/state/AppStateProvider";
import {
  getComplianceDocs,
  getTeam,
  relativeDayLabel,
  startTimeToMinutes,
} from "@/lib/demo-data";
import type { AttendanceConfirmation, Job } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const { state, dispatch } = useAppState();
  const router = useRouter();

  // When the team is active, the trade's own Home view excludes work delegated
  // to team members — those live in My Team. Without a team, all jobs are the
  // trade's own.
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
        .sort((a, b) => startTimeToMinutes(a.startTime) - startTimeToMinutes(b.startTime)),
    [ownJobs],
  );
  const tomorrowJobs = useMemo(
    () =>
      ownJobs
        .filter((j) => j.dateOffsetDays === 1)
        .sort((a, b) => startTimeToMinutes(a.startTime) - startTimeToMinutes(b.startTime)),
    [ownJobs],
  );

  const anyInProgress = todayJobs.some((j) => j.status === "InProgress");
  const allDone = todayJobs.length > 0 && todayJobs.every((j) => j.status === "Completed");

  const view =
    state.dayView === "tomorrow" && allDone
      ? "tomorrow"
      : allDone
        ? "evening"
        : anyInProgress
          ? "during"
          : "morning";

  return (
    <main className="flex flex-col gap-4 pb-6">
      <HomeHeader firstName={state.trade.firstName} tier={state.trade.tier} />

      <NotificationsStrip />

      {view === "morning" && (
        <MorningView jobs={todayJobs} dispatch={dispatch} router={router} />
      )}

      {view === "during" && (
        <DuringView jobs={todayJobs} router={router} />
      )}

      {view === "evening" && (
        <EveningView
          jobs={todayJobs}
          onPlanTomorrow={() => dispatch({ type: "set-day-view", view: "tomorrow" })}
        />
      )}

      {view === "tomorrow" && (
        <TomorrowView jobs={tomorrowJobs} dispatch={dispatch} router={router} />
      )}

      <PendingResponsesStrip />
      <ComplianceStrip />
    </main>
  );
}

// Notifications by exception only (per spec): two valid cases — jeopardy on
// an assigned job, or an urgent opportunity available now. Both are derived
// from current state, so resolving the underlying condition (e.g. accepting
// the opportunity, equipment arriving) removes the notification.
function NotificationsStrip() {
  const { state } = useAppState();
  const items = useMemo(() => {
    const out: Array<{
      id: string;
      tone: "warn" | "accent";
      icon: string;
      label: string;
      title: string;
      body: string;
      href: string;
      cta: string;
    }> = [];

    // Job awarded: a job won via Circl's selection from an accepted opportunity.
    // Surfaces while wonAt is recent (within 5 minutes) so the trade sees the
    // result of their accept and can navigate straight to it.
    const RECENT_WIN_MS = 5 * 60_000;
    const now = Date.now();
    const recentWins = state.jobs.filter(
      (j) =>
        !!j.wonAt && now - new Date(j.wonAt).getTime() <= RECENT_WIN_MS,
    );
    recentWins.forEach((job) => {
      out.push({
        id: `won-${job.id}`,
        tone: "accent",
        icon: "🎉",
        label: "Job awarded",
        title: `${job.type} · ${job.customer.suburb}`,
        body: `Circl selected you. ${job.cgNumber} is now in your Schedule for ${job.dateOffsetDays === 0 ? "today" : job.dateOffsetDays === 1 ? "tomorrow" : `${job.dateOffsetDays} days from now`} at ${job.startTime}.`,
        href: `/jobs/${job.id}`,
        cta: "Open job",
      });
    });

    // Jeopardy: tomorrow's job with equipment not yet received.
    const jeopardyJob = state.jobs.find(
      (j) =>
        j.dateOffsetDays === 1 &&
        (j.equipmentDeliveryStatus === "Not Yet Received" ||
          j.equipmentDeliveryStatus === "Delayed"),
    );
    if (jeopardyJob) {
      const trackingDetail = jeopardyJob.tracking
        ? ` ${jeopardyJob.tracking.carrier} ${jeopardyJob.tracking.number} is still in transit.`
        : "";
      // Surface team ownership when this is a delegated job — Jake oversees, Tom executes.
      const member = jeopardyJob.assignedToMemberId
        ? getTeam().members.find((m) => m.id === jeopardyJob.assignedToMemberId)
        : null;
      const title = member
        ? `${member.name.split(" ")[0]}'s tomorrow ${jeopardyJob.customer.suburb} job`
        : `Tomorrow's ${jeopardyJob.customer.suburb} job`;
      out.push({
        id: `jeopardy-${jeopardyJob.id}`,
        tone: "warn",
        icon: "⚠️",
        label: member ? "Team — equipment not delivered" : "Equipment not delivered",
        title,
        body: `${jeopardyJob.type} at ${jeopardyJob.startTime}.${trackingDetail} Tap to track or contact Circl Support.`,
        href: `/jobs/${jeopardyJob.id}`,
        cta: "View job",
      });
    }

    // Urgent opportunity: any urgent opportunity that hasn't been responded to.
    const urgentOpp = state.opportunities.find(
      (o) => o.urgent && !o.outcome,
    );
    if (urgentOpp) {
      out.push({
        id: `urgent-${urgentOpp.id}`,
        tone: "accent",
        icon: "⚡",
        label: "Urgent job available",
        title: `${urgentOpp.type} · ${urgentOpp.suburb.replace(" NSW", "")}`,
        body: `${urgentOpp.distanceKm.toFixed(1)} km away · ${urgentOpp.timeOfDay} today · $${urgentOpp.value.toFixed(0)}.`,
        href: `/find-jobs/${urgentOpp.id}`,
        cta: "View opportunity",
      });
    }

    // Action required on payment: a job that needs the trade's attention to
    // release payment. Common cause: no bank account on file at Job Complete.
    const actionJob = state.jobs.find(
      (j) => j.paymentStatus === "Action Required",
    );
    if (actionJob) {
      const noBank = !state.trade.bankAccount;
      out.push({
        id: `action-${actionJob.id}`,
        tone: "warn",
        icon: "💸",
        label: "Payment needs your attention",
        title: actionJob.rctiNumber
          ? `RCTI ${actionJob.rctiNumber}`
          : actionJob.cgNumber,
        body: noBank
          ? "Add your bank account so this RCTI can be settled."
          : "Your RCTI needs your attention before payment can be released.",
        href: noBank ? "/money/bank" : `/money/rcti/${actionJob.id}`,
        cta: noBank ? "Add bank account" : "View RCTI",
      });
    }

    return out;
  }, [state.jobs, state.opportunities, state.trade.bankAccount]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2 px-5">
      {items.map((n) => {
        const wrapClass =
          n.tone === "warn"
            ? "border-warn/40 bg-warn-soft"
            : "border-accent/40 bg-accent-soft";
        const labelClass = n.tone === "warn" ? "text-warn" : "text-accent";
        return (
          <Link
            key={n.id}
            href={n.href}
            className={
              "block rounded-2xl border p-4 transition-colors " + wrapClass
            }
          >
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-xl leading-tight">
                {n.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    "text-[11px] font-semibold uppercase tracking-wider " +
                    labelClass
                  }
                >
                  {n.label}
                </p>
                <p className="mt-0.5 text-[14px] font-semibold">{n.title}</p>
                <p className="mt-1 text-[12px] leading-5 text-foreground/90">
                  {n.body}
                </p>
                <p className={"mt-2 text-[12px] font-semibold " + labelClass}>
                  {n.cta} →
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function PendingResponsesStrip() {
  const { state } = useAppState();
  const pendingCount = useMemo(
    () => state.opportunities.filter((o) => o.outcome === "awaiting").length,
    [state.opportunities],
  );
  if (pendingCount === 0) return null;
  return (
    <div className="px-5">
      <Link
        href="/find-jobs?tab=history"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Pending
          </p>
          <p className="mt-0.5 text-sm font-medium">
            <span className="font-semibold text-foreground">{pendingCount}</span>{" "}
            {pendingCount === 1 ? "response" : "responses"} awaiting Circl's
            decision
          </p>
        </div>
        <span className="text-muted">→</span>
      </Link>
    </div>
  );
}

function HomeHeader({
  firstName,
  tier,
}: {
  firstName: string;
  tier: string;
}) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <header className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">{greeting},</p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
            {firstName}
          </h1>
        </div>
        <Badge tone="accent">
          <span aria-hidden>★</span> {tier} tier
        </Badge>
      </div>
    </header>
  );
}

// --- STATE 1: Morning ---
function MorningView({
  jobs,
  dispatch,
  router,
}: {
  jobs: Job[];
  dispatch: (a: { type: "set-attendance"; jobId: string; attendance: AttendanceConfirmation }) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const totalPotential = jobs.reduce((sum, j) => sum + j.value, 0);
  const needsAttendance = jobs.some((j) => j.attendance === "Pending");
  return (
    <>
      <div className="px-5">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Today could earn you
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-accent">
            ${totalPotential.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Across {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
          </p>
        </div>
      </div>

      <div className="px-5">
        <h2 className="mb-2 text-sm font-semibold text-muted">
          {needsAttendance ? "Confirm today's attendance" : "Today's jobs"}
        </h2>
        <div className="space-y-3">
          {jobs.map((j) => (
            <JobCardMorning
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
        </div>
      </div>
    </>
  );
}

function JobCardMorning({
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
    <div className="rounded-2xl border border-border bg-surface p-4">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        style={{ minHeight: 0 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
              {job.client} · {job.startTime}
            </p>
            <h3 className="mt-0.5 text-[15px] font-semibold">{job.type}</h3>
            <p className="mt-0.5 text-xs text-muted">
              {job.customer.suburb} · {job.cgNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-accent">
              ${job.value.toFixed(2)}
            </p>
            {job.equipmentDeliveryStatus === "Delivered" ? (
              <Badge tone="success">Equipment delivered</Badge>
            ) : job.equipmentDeliveryStatus === "Not Yet Received" ? (
              <Badge tone="warn">Equipment pending</Badge>
            ) : job.pickupLocation ? (
              <Badge tone="info">Pickup</Badge>
            ) : null}
          </div>
        </div>
      </button>

      <div className="mt-4">
        {job.attendance === "Pending" ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-xl bg-success/15 py-2.5 text-sm font-semibold text-success border border-success/30"
            >
              ✓ I’ll attend
            </button>
            <button
              type="button"
              onClick={onFlag}
              className="rounded-xl bg-danger/15 py-2.5 text-sm font-semibold text-danger border border-danger/30"
            >
              ✗ Can’t attend
            </button>
          </div>
        ) : job.attendance === "Confirmed" ? (
          <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center justify-between rounded-xl bg-accent-soft px-3 py-2.5 text-sm font-semibold text-accent"
          >
            <span>✓ Attendance confirmed — open job</span>
            <span>→</span>
          </button>
        ) : (
          <div className="rounded-xl bg-danger/15 px-3 py-2.5 text-sm font-semibold text-danger">
            Flagged — Circl has been notified
          </div>
        )}
      </div>

      {job.tracking &&
      (job.equipmentDeliveryStatus === "Not Yet Received" ||
        job.equipmentDeliveryStatus === "Delayed" ||
        job.equipmentDeliveryStatus === "Expected Today") ? (
        <a
          href={job.tracking.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 -mx-4 -mb-4 flex items-center justify-between border-t border-warn/30 bg-warn-soft/50 px-4 py-2.5 text-[12px] font-semibold text-warn"
        >
          <span>📦 Track {job.tracking.carrier} · {job.tracking.number}</span>
          <span>→</span>
        </a>
      ) : null}
    </div>
  );
}

// --- STATE 2: During the day ---
function DuringView({
  jobs,
  router,
}: {
  jobs: Job[];
  router: ReturnType<typeof useRouter>;
}) {
  const done = jobs.filter((j) => j.status === "Completed");
  const active = jobs.find((j) => j.status === "InProgress");
  const remaining = jobs.filter((j) => j.status === "Confirmed");
  const earned = done.reduce((s, j) => s + j.value, 0);
  const potentialTotal = jobs.reduce((s, j) => s + j.value, 0);
  const totalCount = jobs.length;
  const doneCount = done.length;

  return (
    <>
      <div className="px-5">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Earned so far today
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-accent">
            ${earned.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted">
            of ${potentialTotal.toFixed(2)} potential
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{
                width: `${
                  potentialTotal > 0 ? Math.round((earned / potentialTotal) * 100) : 0
                }%`,
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            <span>
              <span className="font-semibold text-foreground">
                {doneCount} of {totalCount}
              </span>{" "}
              {totalCount === 1 ? "job" : "jobs"} done
            </span>
            <span>
              <span className="font-semibold text-foreground">
                {remaining.length + (active ? 1 : 0)}
              </span>{" "}
              to go
            </span>
          </div>
        </div>
      </div>

      {active ? (
        <div className="px-5">
          <h2 className="mb-2 text-sm font-semibold text-muted">
            Currently on site
          </h2>
          <button
            type="button"
            onClick={() => router.push(`/jobs/${active.id}`)}
            className="flex w-full items-center justify-between rounded-2xl border border-accent/40 bg-accent-soft p-4 text-left"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                In progress
              </p>
              <h3 className="mt-1 text-[15px] font-semibold">{active.type}</h3>
              <p className="mt-0.5 text-xs text-muted">
                {active.customer.firstName} · {active.customer.suburb}
              </p>
            </div>
            <span className="text-xl text-accent">→</span>
          </button>
        </div>
      ) : null}

      {remaining.length > 0 ? (
        <div className="px-5">
          <h2 className="mb-2 text-sm font-semibold text-muted">
            Up next today
          </h2>
          <div className="space-y-2">
            {remaining.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => router.push(`/jobs/${j.id}`)}
                className="block w-full rounded-2xl border border-border bg-surface p-3 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {j.startTime} · {j.type}
                  </span>
                  <span className="text-sm font-semibold text-accent">
                    ${j.value.toFixed(0)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

// --- STATE 3: End of day summary ---
function EveningView({
  jobs,
  onPlanTomorrow,
}: {
  jobs: Job[];
  onPlanTomorrow: () => void;
}) {
  const earned = jobs.reduce((s, j) => s + j.value, 0);
  return (
    <>
      <div className="px-5 pt-2">
        <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 to-transparent p-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
            Day complete
          </p>
          <p className="mt-3 text-5xl font-bold tracking-tight">
            ${earned.toFixed(2)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} completed today
          </p>
        </div>
      </div>

      <div className="px-5">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold">Next payment</h3>
          <p className="mt-1 text-xs text-muted">
            Processing · settles in 1–2 business days via your RCTI. Nothing for
            you to do.
          </p>
        </div>
      </div>

      <div className="px-5">
        <button
          type="button"
          onClick={onPlanTomorrow}
          className="flex w-full items-center justify-between rounded-2xl border border-border-strong bg-surface p-4"
        >
          <div className="text-left">
            <p className="text-sm font-semibold">Plan tomorrow</p>
            <p className="text-xs text-muted">
              Confirm attendance and check equipment
            </p>
          </div>
          <span className="text-xl text-accent">→</span>
        </button>
      </div>
    </>
  );
}

// --- STATE 4: Tomorrow's plan ---
function TomorrowView({
  jobs,
  dispatch,
  router,
}: {
  jobs: Job[];
  dispatch: (a: { type: "set-attendance"; jobId: string; attendance: AttendanceConfirmation }) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const total = jobs.reduce((s, j) => s + j.value, 0);
  const unresolvedDelivery = jobs.some(
    (j) => j.equipmentDeliveryStatus === "Not Yet Received" || j.equipmentDeliveryStatus === "Delayed",
  );

  return (
    <>
      <div className="px-5">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
            Tomorrow · potential earnings
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-accent">
            ${total.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} scheduled
          </p>
        </div>
      </div>

      {unresolvedDelivery ? (
        <div className="px-5">
          <div className="rounded-2xl border border-warn/40 bg-warn-soft p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="text-sm font-bold text-warn">
                  Equipment not delivered
                </h3>
                <p className="mt-1 text-[13px] text-foreground/90">
                  One of tomorrow’s jobs is flagged below. Circl Support has
                  overnight to resolve — tap the job to contact them now.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="px-5">
        <h2 className="mb-2 text-sm font-semibold text-muted">
          {relativeDayLabel(1)} · confirm attendance
        </h2>
        <div className="space-y-3">
          {jobs.map((j) => (
            <JobCardMorning
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
        </div>
      </div>
    </>
  );
}

// --- Compliance strip (always visible on Home) ---
function ComplianceStrip() {
  const docs = getComplianceDocs();
  const counts = {
    active: docs.filter((d) => d.status === "Active").length,
    expiring: docs.filter((d) => d.status === "Expiring Soon").length,
    expired: docs.filter((d) => d.status === "Expired").length,
    missing: docs.filter((d) => d.status === "Not Started").length,
  };
  return (
    <div className="px-5">
      <Link
        href="/profile"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Compliance
          </p>
          <div className="mt-1.5 flex gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {counts.active} active
            </span>
            {counts.expiring > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-warn">
                <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                {counts.expiring} expiring
              </span>
            ) : null}
            {counts.missing > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-strong" />
                {counts.missing} missing
              </span>
            ) : null}
          </div>
        </div>
        <span className="text-muted">→</span>
      </Link>
    </div>
  );
}
