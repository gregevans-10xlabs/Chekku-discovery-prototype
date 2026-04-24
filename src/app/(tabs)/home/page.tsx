"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/lib/state/AppStateProvider";
import { getComplianceDocs, relativeDayLabel } from "@/lib/demo-data";
import type { AttendanceConfirmation, Job } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  const { state, dispatch } = useAppState();
  const router = useRouter();

  const jobs = state.jobs;
  const todayJobs = useMemo(
    () => jobs.filter((j) => j.dateOffsetDays === 0),
    [jobs],
  );
  const tomorrowJobs = useMemo(
    () => jobs.filter((j) => j.dateOffsetDays === 1),
    [jobs],
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

      <ComplianceStrip />
    </main>
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
          <div className="mt-3 flex items-center gap-4 text-xs text-muted">
            <span>
              <span className="font-semibold text-foreground">{done.length}</span>{" "}
              done
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
