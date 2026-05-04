"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getTeam, relativeDayLabel } from "@/lib/demo-data";
import type { Job } from "@/lib/types";

export default function TeamMemberDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const team = getTeam();
  const member = team.members.find((m) => m.id === id);
  const [pickerOpen, setPickerOpen] = useState(false);

  const assigned = useMemo(
    () => state.jobs.filter((j) => j.assignedToMemberId === id),
    [state.jobs, id],
  );

  // Available to delegate: any job currently belonging to the primary
  // contractor (no assignedToMemberId) that hasn't been completed yet.
  const available = useMemo(
    () =>
      state.jobs.filter(
        (j) => !j.assignedToMemberId && j.status !== "Completed",
      ),
    [state.jobs],
  );

  if (!member) {
    return (
      <main>
        <PageHeader title="Not found" back />
        <p className="px-5 pt-6 text-sm text-muted">
          That team member isn’t in your roster.
        </p>
      </main>
    );
  }

  const delegate = (jobId: string) => {
    dispatch({ type: "delegate-job", jobId, memberId: id });
    setPickerOpen(false);
  };

  return (
    <main className="pb-8">
      <PageHeader title={member.name} subtitle={member.role} back onBack={() => router.push("/my-team")} />

      {/* Identity card */}
      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-lg font-bold text-accent">
              {member.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold">{member.name}</p>
              <p className="text-xs text-muted">{member.role}</p>
            </div>
            <Badge tone={member.compliance === "Good" ? "success" : "warn"}>
              {member.compliance === "Good" ? "Compliant" : "Compliance attention"}
            </Badge>
          </div>
        </div>
      </section>

      {/* Active jobs */}
      <section className="mt-5 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Assigned jobs <span className="text-muted-strong">({assigned.length})</span>
        </h2>
        {assigned.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
            No jobs assigned to {member.name.split(" ")[0]} yet. Delegate one
            from your roster below.
          </p>
        ) : (
          <div className="space-y-2">
            {assigned.map((j) => (
              <AssignedJobRow key={j.id} job={j} state={state} />
            ))}
          </div>
        )}
      </section>

      {/* Delegate */}
      <section className="mt-6 px-5">
        {pickerOpen ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Pick a job to delegate
              </h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="text-[11px] font-medium text-accent"
              >
                Cancel
              </button>
            </div>
            {available.length === 0 ? (
              <p className="text-sm text-muted">
                No jobs available to delegate right now.
              </p>
            ) : (
              <div className="space-y-2">
                {available.map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => delegate(j.id)}
                    className="block w-full rounded-xl border border-border-strong bg-surface-2 p-3 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted">
                          {j.client} · {relativeDayLabel(j.dateOffsetDays)} ·{" "}
                          {j.startTime}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold">{j.type}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {j.customer.suburb} · {j.cgNumber}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-accent">
                        ${j.value.toFixed(0)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Button onClick={() => setPickerOpen(true)}>Delegate a job</Button>
        )}
      </section>

      <section className="mt-6 px-5">
        <p className="text-[11px] text-muted-strong">
          {member.name.split(" ")[0]} uses their own Chekku login to execute
          assigned work. You see status and evidence here as they progress —
          you don’t see their other principals’ jobs or earnings.
        </p>
      </section>
    </main>
  );
}

function AssignedJobRow({
  job,
  state,
}: {
  job: Job;
  state: { sacDoneJobIds: string[]; irDoneJobIds: string[]; checkedInJobId: string | null };
}) {
  const checkedIn = job.status === "InProgress" || state.checkedInJobId === job.id;
  const sacDone = state.sacDoneJobIds.includes(job.id);
  const irDone = state.irDoneJobIds.includes(job.id);
  const completed = job.status === "Completed";

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-2xl border border-border bg-surface p-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            {job.client} · {relativeDayLabel(job.dateOffsetDays)} ·{" "}
            {job.startTime}
          </p>
          <p className="mt-0.5 text-sm font-semibold">{job.type}</p>
          <p className="mt-0.5 text-xs text-muted">
            {job.customer.suburb} · {job.cgNumber}
          </p>
        </div>
        <p className="text-sm font-semibold text-accent">
          ${job.value.toFixed(0)}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {completed ? (
          <Badge tone="success">Complete</Badge>
        ) : checkedIn ? (
          <Badge tone="accent">In progress</Badge>
        ) : (
          <Badge tone="neutral">Not started</Badge>
        )}
        <StatusChip done={checkedIn} label="Checked in" />
        <StatusChip done={sacDone} label="Safety check" />
        <StatusChip done={irDone} label="Install report" />
      </div>
    </Link>
  );
}

function StatusChip({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium " +
        (done
          ? "bg-success-soft text-success"
          : "bg-surface-2 text-muted-strong")
      }
    >
      {done ? "✓" : "○"} {label}
    </span>
  );
}
