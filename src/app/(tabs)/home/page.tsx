"use client";

/**
 * Home — C+ AI-first surface
 *
 * Phase 2 rebuild. Replaces the four-state full-screen pattern (Morning /
 * During / Evening / Tomorrow) with one consistent layout where the AI
 * input is the visual centre. The four "states" still exist as derived
 * mode variants — they shape the day-tape copy, the suggestion chips,
 * and the Heads-up section's primary tile. Everything else (exception
 * cards, opportunity surfacing, compliance footer) stays consistent.
 *
 * Preserved Aaron-validated patterns:
 * - Attendance confirmation prompts when any of today's jobs are
 *   Pending — non-skippable, large tap targets
 * - Earnings dollar number — surfaced in the day tape (compact) and
 *   on the day-complete celebration card (dominant when reached)
 * - Notifications by exception only (jeopardy, urgent opp, action
 *   required, recent wins) — same logic as the previous Home
 * - Equipment tracking deep-link wherever delivery is in transit
 * - Team filtering: when My Team is on, this surface shows only
 *   Brett's own jobs; delegated work lives in My Team
 *
 * AI input is currently a static stub — the real wiring (proxy +
 * AskAI port) lands in Phase 3.
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

  // When the team is active, the trade's own Home view excludes work
  // delegated to team members — those live in My Team. Without a team,
  // all jobs are the trade's own.
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

  // Mode derivation: explicit user choice via dayView == "tomorrow" wins
  // when today is done; otherwise derived from job state. Same logic as
  // the prior Home — preserved so the manual "Plan tomorrow" CTA still
  // routes correctly.
  const mode: Mode =
    state.dayView === "tomorrow" && allDone
      ? "tomorrow"
      : allDone
        ? "evening"
        : activeJob
          ? "during"
          : "morning";

  return (
    <main className="flex flex-col pb-6">
      <Header firstName={state.trade.firstName} />

      <DayTape
        mode={mode}
        todayJobs={todayJobs}
        tomorrowJobs={tomorrowJobs}
        activeJob={activeJob}
      />

      <AIInput mode={mode} />

      <SectionHeader>Heads up</SectionHeader>
      <HeadsUp
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

      <SectionHeader>Could be earning more</SectionHeader>
      <CouldBeEarningMore />

      <ComplianceFooter />
    </main>
  );
}

// ---------- Header ----------
// Compact greeting strip with avatar that links to Profile. The tier
// badge is intentionally small — Aaron's framing is that AI has
// primacy on this surface, so identity treatment stays gentle.
function Header({ firstName }: { firstName: string }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <header className="flex items-center justify-between px-5 pt-5">
      <div>
        <p className="text-[14px] text-muted">{greeting},</p>
        <h1 className="mt-0.5 text-[26px] font-bold leading-tight tracking-tight">
          {firstName}
        </h1>
      </div>
      <Link
        href="/profile"
        aria-label="Profile"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-[14px] font-bold text-accent-strong"
        style={{ minHeight: 44 }}
      >
        BS
      </Link>
    </header>
  );
}

// ---------- Day tape ----------
// Single line summary that adapts to mode. Compact by design — the AI
// input below it should be the dominant element on the screen.
function DayTape({
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

  let main: string;
  let parts: string[] = [];

  if (mode === "evening") {
    main = `Today $${earned.toFixed(0)}`;
    parts = [
      `${todayJobs.length} ${todayJobs.length === 1 ? "job" : "jobs"} done`,
    ];
  } else if (mode === "tomorrow") {
    main = `Tomorrow $${tomorrowTotal.toFixed(0)}`;
    parts = [
      `${tomorrowJobs.length} ${tomorrowJobs.length === 1 ? "job" : "jobs"}`,
    ];
    if (tomorrowJobs[0])
      parts.push(`First ${tomorrowJobs[0].startTime.toLowerCase()}`);
  } else if (mode === "during") {
    main = `Today $${earned.toFixed(0)}`;
    parts = [
      `${todayJobs.filter((j) => j.status === "Completed").length} of ${todayJobs.length} done`,
    ];
    if (activeJob) parts.push(`On site: ${activeJob.startTime.toLowerCase()}`);
  } else {
    // morning
    main = `Today $${totalPotential.toFixed(0)}`;
    parts = [
      `${todayJobs.length} ${todayJobs.length === 1 ? "job" : "jobs"}`,
    ];
    if (nextJob) parts.push(`Next ${nextJob.startTime.toLowerCase()}`);
  }

  return (
    <div className="flex items-center gap-2 px-5 pt-2 text-[14px] text-muted">
      <span className="font-semibold text-foreground">{main}</span>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="inline-block h-1 w-1 rounded-full bg-muted-strong" />
          <span>{p}</span>
        </span>
      ))}
    </div>
  );
}

// ---------- AI input (visual centre) ----------
// Real AskAI now (Phase 3). Suggestion chips adapt per mode; the
// system prompt receives Brett's full home context (today / tomorrow /
// recent / compliance / opportunities) so the AI can answer questions
// like "what's near me", "why can't I take this", or "how did I do
// today" without tool calls.
function AIInput({ mode }: { mode: Mode }) {
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
          { label: "Walk me through today", question: "Walk me through today — what should I prep for each job?" },
          { label: "Any work nearby?", question: "What jobs are available near me right now?" },
          { label: "Anything I should sort first?", question: "Before I head out today, is there anything I'm missing — compliance about to lapse, jobs I haven't confirmed, equipment unresolved, anything outstanding?" },
        ];
      case "during":
        return [
          { label: "Anything I should check?", question: "What do I need to know before I leave the current job?" },
          { label: "What photos do I need?", question: "What photos do I need to capture for this job type?" },
          { label: "I'm running late", question: "I'm running late — draft a message I can send to the next customer to let them know." },
        ];
      case "evening":
        return [
          { label: "How did I do today?", question: "Summarise today — earnings, jobs done, anything outstanding." },
          { label: "What's tomorrow?", question: "What's on for tomorrow? Any prep I should do tonight?" },
          { label: "Anything outstanding?", question: "Anything I haven't dealt with yet — pending RCTIs, unresponded opportunities, compliance to-dos?" },
        ];
      case "tomorrow":
        return [
          { label: "Walk me through tomorrow", question: "What's the plan for tomorrow?" },
          { label: "Am I sorted for tomorrow?", question: "Is my compliance covered for tomorrow's jobs and is the equipment ready?" },
          { label: "Any extra work tomorrow?", question: "Are there other opportunities tomorrow worth picking up?" },
        ];
    }
  })();

  return (
    <section className="px-5 pt-4">
      <AskAI
        size="prominent"
        context={context}
        placeholder="Ask Chekku anything…"
        suggestions={suggestions}
      />
    </section>
  );
}

// ---------- Section header ----------
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-6 px-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
      {children}
    </h2>
  );
}

// ---------- Heads up ----------
// Renders, in priority order:
// 1. Mode-specific primary card (next job / active job / day complete /
//    tomorrow plan)
// 2. Mode-specific attendance prompts when Pending
// 3. Exception notifications (jeopardy, urgent opp, action required,
//    recent wins) — same logic as the previous Home
// 4. Pending responses (awaiting Circl decision count)
function HeadsUp({
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
      {mode === "morning" ? (
        <MorningHeadsUp
          jobs={todayJobs}
          dispatch={dispatch}
          router={router}
        />
      ) : null}
      {mode === "during" ? (
        <DuringHeadsUp
          jobs={todayJobs}
          activeJob={activeJob!}
          router={router}
        />
      ) : null}
      {mode === "evening" ? (
        <EveningHeadsUp jobs={todayJobs} onPlanTomorrow={onPlanTomorrow} />
      ) : null}
      {mode === "tomorrow" ? (
        <TomorrowHeadsUp
          jobs={tomorrowJobs}
          dispatch={dispatch}
          router={router}
        />
      ) : null}

      {/* Always-on: exception notifications and pending-response count */}
      <NotificationsList />
      <PendingResponsesCard />
    </section>
  );
}

// Morning state: confirm-attendance prompts when needed, otherwise the
// next-job tile.
function MorningHeadsUp({
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

// During state: active-job tile (full-width, accent border) + an
// up-next list of remaining confirmed jobs.
function DuringHeadsUp({
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
        className="block w-full rounded-2xl border border-accent bg-accent-soft p-4 text-left [box-shadow:0_1px_2px_rgba(15,20,25,0.04)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
          On site now
        </p>
        <p className="mt-1.5 text-[17px] font-bold leading-tight">
          {activeJob.type} · {activeJob.startTime.toLowerCase()}
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {activeJob.customer.firstName} {activeJob.customer.lastName} ·{" "}
          {activeJob.customer.suburb}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-accent/30 pt-3">
          <span className="text-[12px] font-semibold text-accent-strong">
            Continue →
          </span>
          <span className="text-[14px] font-bold text-accent-strong">
            ${activeJob.value.toFixed(0)}
          </span>
        </div>
      </button>
      {remaining.length > 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-3">
          <p className="px-1 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
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

// Evening state: day-complete celebration card with the big number
// (Aaron's "Big Number" pattern preserved here as the dominant element
// for end-of-day) + next-payment status + plan-tomorrow CTA.
function EveningHeadsUp({
  jobs,
  onPlanTomorrow,
}: {
  jobs: Job[];
  onPlanTomorrow: () => void;
}) {
  const earned = jobs.reduce((s, j) => s + j.value, 0);
  return (
    <>
      <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent-soft to-transparent p-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
          Day complete
        </p>
        <p className="mt-3 text-[44px] font-bold leading-none tracking-tight text-foreground">
          ${earned.toFixed(0)}
        </p>
        <p className="mt-2 text-[13px] text-muted">
          {jobs.length} {jobs.length === 1 ? "job" : "jobs"} completed today
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-[13px] font-semibold">Next payment</p>
        <p className="mt-1 text-[12px] text-muted">
          Processing · settles in 1–2 business days via your RCTI. Nothing
          for you to do.
        </p>
      </div>
      <button
        type="button"
        onClick={onPlanTomorrow}
        className="flex w-full items-center justify-between rounded-2xl border border-border-strong bg-surface p-4 text-left"
        style={{ minHeight: 44 }}
      >
        <div>
          <p className="text-[14px] font-semibold">Plan tomorrow</p>
          <p className="mt-0.5 text-[12px] text-muted">
            Confirm attendance and check equipment
          </p>
        </div>
        <span className="text-[20px] text-accent-strong">→</span>
      </button>
    </>
  );
}

// Tomorrow plan state: per-job attendance cards for tomorrow + a
// delivery-jeopardy banner when any tomorrow job has equipment unresolved.
function TomorrowHeadsUp({
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
          <p className="text-[13px] font-semibold text-warn">
            ⚠ Equipment not delivered
          </p>
          <p className="mt-1 text-[12px] text-foreground/85">
            One of tomorrow&apos;s jobs has equipment unresolved. Tap the
            job below to track or contact Circl Support.
          </p>
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

// ---------- Cards ----------

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
      className="block w-full rounded-2xl border border-border bg-surface p-4 text-left [border-left-width:3px] [border-left-color:var(--accent)] [box-shadow:0_1px_2px_rgba(15,20,25,0.04)]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
        Your next job
      </p>
      <p className="mt-1.5 text-[17px] font-bold leading-tight">
        {job.type} · {job.startTime.toLowerCase()}
      </p>
      <p className="mt-1 text-[13px] text-muted">
        {job.customer.firstName} {job.customer.lastName} ·{" "}
        {job.customer.suburb}
      </p>
      {swmsGap ? (
        <p className="mt-2 text-[12px] font-semibold text-warn">
          ⚠ SWMS gap — upload before site arrival
        </p>
      ) : null}
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-success">
          ✓ Attendance confirmed
        </span>
        <span className="text-[13px] font-semibold text-accent-strong">
          Open →
        </span>
      </div>
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
    <div className="rounded-2xl border border-border bg-surface p-4">
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
          <span>✓ Attendance confirmed — open job</span>
          <span>→</span>
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

// ---------- Notifications (exception-only) ----------
// Same exception logic as the previous Home: jeopardy, urgent opp,
// action required, recent wins. The 30s ticker keeps the recent-win
// window honest.
function NotificationsList() {
  const { state } = useAppState();
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

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

    // Job awarded — recent wonAt within 5 minutes
    const RECENT_WIN_MS = 5 * 60_000;
    state.jobs
      .filter(
        (j) => !!j.wonAt && nowMs - new Date(j.wonAt).getTime() <= RECENT_WIN_MS,
      )
      .forEach((job) => {
        out.push({
          id: `won-${job.id}`,
          tone: "accent",
          icon: "🎉",
          label: "Job awarded",
          title: `${job.type} · ${job.customer.suburb}`,
          body: `Circl selected you. ${job.cgNumber} is now in your Schedule for ${
            job.dateOffsetDays === 0
              ? "today"
              : job.dateOffsetDays === 1
                ? "tomorrow"
                : `${job.dateOffsetDays} days from now`
          } at ${job.startTime}.`,
          href: `/jobs/${job.id}`,
          cta: "Open job",
        });
      });

    // Jeopardy — tomorrow job with equipment unresolved
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
      const member = jeopardyJob.assignedToMemberId
        ? state.team.members.find(
            (m) => m.id === jeopardyJob.assignedToMemberId,
          )
        : null;
      const title = member
        ? `${member.name.split(" ")[0]}'s tomorrow ${jeopardyJob.customer.suburb} job`
        : `Tomorrow's ${jeopardyJob.customer.suburb} job`;
      out.push({
        id: `jeopardy-${jeopardyJob.id}`,
        tone: "warn",
        icon: "⚠️",
        label: member
          ? "Team — equipment not delivered"
          : "Equipment not delivered",
        title,
        body: `${jeopardyJob.type} at ${jeopardyJob.startTime}.${trackingDetail} Tap to track or contact Circl Support.`,
        href: `/jobs/${jeopardyJob.id}`,
        cta: "View job",
      });
    }

    // Urgent opportunity
    const urgentOpp = state.opportunities.find((o) => o.urgent && !o.outcome);
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

    // Action required on payment
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
  }, [
    state.jobs,
    state.opportunities,
    state.trade.bankAccount,
    state.team.members,
    nowMs,
  ]);

  if (items.length === 0) return null;

  return (
    <>
      {items.map((n) => {
        const wrapClass =
          n.tone === "warn"
            ? "border-warn/40 bg-warn-soft"
            : "border-accent/40 bg-accent-soft";
        const labelClass =
          n.tone === "warn" ? "text-warn" : "text-accent-strong";
        return (
          <Link
            key={n.id}
            href={n.href}
            className={
              "block rounded-2xl border p-4 transition-colors " + wrapClass
            }
          >
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-[20px] leading-tight">
                {n.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={
                    "text-[11px] font-semibold uppercase tracking-[0.08em] " +
                    labelClass
                  }
                >
                  {n.label}
                </p>
                <p className="mt-1 text-[14px] font-semibold">{n.title}</p>
                <p className="mt-1 text-[12px] leading-5 text-foreground/85">
                  {n.body}
                </p>
                <p
                  className={
                    "mt-2 text-[12px] font-semibold " + labelClass
                  }
                >
                  {n.cta} →
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}

function PendingResponsesCard() {
  const { state } = useAppState();
  const pendingCount = useMemo(
    () => state.opportunities.filter((o) => o.outcome === "awaiting").length,
    [state.opportunities],
  );
  if (pendingCount === 0) return null;
  return (
    <Link
      href="/find-jobs?tab=history"
      className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
      style={{ minHeight: 44 }}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
          Pending
        </p>
        <p className="mt-1 text-[14px] font-medium">
          <span className="font-semibold">{pendingCount}</span>{" "}
          {pendingCount === 1 ? "response" : "responses"} awaiting Circl&apos;s
          decision
        </p>
      </div>
      <span className="text-muted">→</span>
    </Link>
  );
}

// ---------- Could be earning more ----------
// Opportunity surfacing: nearby jobs available now + cert-unlock
// opportunities pulled from compliance L2/L3. Per Greg's framing,
// quiet-state IS growth-state — we treat compliance gaps as
// opportunities, not shortcomings.
function CouldBeEarningMore() {
  const { state } = useAppState();
  const docs = getComplianceDocs();
  const router = useRouter();

  const nearbyAvailable = useMemo(
    () => state.opportunities.filter((o) => !o.outcome).slice(0, 8),
    [state.opportunities],
  );
  const totalNearby = nearbyAvailable.reduce((s, o) => s + o.value, 0);

  // First Layer 2/3 opportunity with an unlocks string — typically the
  // ARC ticket for Brett. The "Not Started" status on Layer 2/3 docs is
  // Chekku's signal that this is an opportunity, not a gap.
  const unlock = docs.find(
    (d) => (d.layer === 2 || d.layer === 3) && d.unlocks,
  );

  return (
    <section className="space-y-3 px-5">
      {nearbyAvailable.length > 0 ? (
        <button
          type="button"
          onClick={() => router.push("/find-jobs")}
          className="block w-full rounded-2xl border border-border bg-surface p-4 text-left [box-shadow:0_1px_2px_rgba(15,20,25,0.04)]"
          style={{ minHeight: 44 }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-strong">
            Available near you
          </p>
          <p className="mt-1.5 text-[17px] font-bold leading-tight">
            {nearbyAvailable.length}{" "}
            {nearbyAvailable.length === 1 ? "job" : "jobs"} you could take
          </p>
          <p className="mt-1 text-[13px] text-muted">
            Up to{" "}
            <strong className="text-foreground">
              +${totalNearby.toFixed(0)}
            </strong>{" "}
            if you accept all
          </p>
          <p className="mt-3 text-[13px] font-semibold text-accent-strong">
            View jobs →
          </p>
        </button>
      ) : null}

      {unlock ? (
        <Link
          href="/profile/compliance"
          className="block rounded-2xl border border-accent/40 bg-accent-soft p-4"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-accent-strong">
            ★ Unlock more work
          </p>
          <p className="mt-1.5 text-[17px] font-bold leading-tight">
            {unlock.name}
          </p>
          <p className="mt-1 text-[13px] text-foreground/90">
            {unlock.unlocks}
          </p>
          <p className="mt-3 text-[13px] font-semibold text-accent-strong">
            See requirements →
          </p>
        </Link>
      ) : null}
    </section>
  );
}

// ---------- Compliance footer ----------
// Always-on compact summary linking into the full Compliance vault.
function ComplianceFooter() {
  const docs = getComplianceDocs();
  const counts = {
    active: docs.filter((d) => d.status === "Active").length,
    expiring: docs.filter((d) => d.status === "Expiring Soon").length,
    expired: docs.filter((d) => d.status === "Expired").length,
    missing: docs.filter((d) => d.status === "Not Started").length,
  };
  return (
    <section className="mt-6 px-5">
      <Link
        href="/profile/compliance"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
        style={{ minHeight: 44 }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Compliance
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {counts.active} active
            </span>
            {counts.expiring > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-warn">
                <span className="h-1.5 w-1.5 rounded-full bg-warn" />
                {counts.expiring} expiring
              </span>
            ) : null}
            {counts.expired > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-danger">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                {counts.expired} expired
              </span>
            ) : null}
            {counts.missing > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-strong">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-strong" />
                {counts.missing} not started
              </span>
            ) : null}
          </div>
        </div>
        <span className="text-muted">→</span>
      </Link>
    </section>
  );
}
