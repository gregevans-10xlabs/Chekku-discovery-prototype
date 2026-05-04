"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { relativeDayLabel } from "@/lib/demo-data";
import type { Job } from "@/lib/types";

type Role = "Subcontractor" | "Employee";

export default function TeamMemberDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const team = state.team;
  const member = team.members.find((m) => m.id === id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reassignFor, setReassignFor] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

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

  // Other team members — used for the Reassign picker.
  const otherMembers = useMemo(
    () => team.members.filter((m) => m.id !== id),
    [team.members, id],
  );

  if (!member) {
    return (
      <main>
        <PageHeader title="Not found" back onBack={() => router.push("/my-team")} />
        <p className="px-5 pt-6 text-sm text-muted">
          That team member isn&apos;t in your roster.
        </p>
      </main>
    );
  }

  const delegate = (jobId: string) => {
    dispatch({ type: "delegate-job", jobId, memberId: id });
    setPickerOpen(false);
  };

  const reassignTo = (jobId: string, toMemberId: string) => {
    dispatch({ type: "delegate-job", jobId, memberId: toMemberId });
    setReassignFor(null);
  };

  const takeBack = (jobId: string) => {
    dispatch({ type: "unassign-job", jobId });
    setReassignFor(null);
  };

  const swapRole = () => {
    const next: Role =
      member.role === "Subcontractor" ? "Employee" : "Subcontractor";
    dispatch({
      type: "update-team-member",
      memberId: id,
      patch: { role: next },
    });
  };

  const removeMember = () => {
    dispatch({ type: "remove-team-member", memberId: id });
    router.replace("/my-team");
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

          {/* Edit role inline */}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Role
              </p>
              <p className="mt-0.5 text-[13px] font-semibold">{member.role}</p>
            </div>
            <button
              type="button"
              onClick={swapRole}
              className="rounded-xl border border-border-strong bg-surface px-3 py-2 text-[12px] font-semibold hover:bg-surface-2"
              style={{ minHeight: 36 }}
            >
              Switch to{" "}
              {member.role === "Subcontractor" ? "Employee" : "Subcontractor"}
            </button>
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
              <AssignedJobRow
                key={j.id}
                job={j}
                state={state}
                isReassigning={reassignFor === j.id}
                otherMembers={otherMembers}
                onOpenReassign={() => setReassignFor(j.id)}
                onCancelReassign={() => setReassignFor(null)}
                onReassignTo={(memberId) => reassignTo(j.id, memberId)}
                onTakeBack={() => takeBack(j.id)}
              />
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

      {/* Remove from team */}
      <section className="mt-6 px-5">
        {showRemoveConfirm ? (
          <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4">
            <p className="text-[14px] font-semibold text-danger">
              Remove {member.name}?
            </p>
            <p className="mt-1 text-[12px] text-foreground/85">
              {assigned.length > 0
                ? `Their ${assigned.length} assigned job${assigned.length === 1 ? "" : "s"} will revert to you (the primary contractor).`
                : "They have no assigned jobs."}{" "}
              Their own Chekku login is unaffected — they just won&apos;t
              receive new work from you.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-[13px] font-semibold"
                style={{ minHeight: 40 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={removeMember}
                className="flex-1 rounded-xl bg-danger px-3 py-2.5 text-[13px] font-semibold text-white"
                style={{ minHeight: 40 }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <Button variant="danger" onClick={() => setShowRemoveConfirm(true)}>
            Remove from team
          </Button>
        )}
      </section>

      <section className="mt-6 px-5">
        <p className="text-[11px] text-muted-strong">
          {member.name.split(" ")[0]} uses their own Chekku login to execute
          assigned work. You see status and evidence here as they progress —
          you don&apos;t see their other principals&apos; jobs or earnings.
        </p>
      </section>
    </main>
  );
}

function AssignedJobRow({
  job,
  state,
  isReassigning,
  otherMembers,
  onOpenReassign,
  onCancelReassign,
  onReassignTo,
  onTakeBack,
}: {
  job: Job;
  state: { sacDoneJobIds: string[]; irDoneJobIds: string[]; checkedInJobId: string | null };
  isReassigning: boolean;
  otherMembers: { id: string; name: string; role: string }[];
  onOpenReassign: () => void;
  onCancelReassign: () => void;
  onReassignTo: (memberId: string) => void;
  onTakeBack: () => void;
}) {
  const checkedIn = job.status === "InProgress" || state.checkedInJobId === job.id;
  const sacDone = state.sacDoneJobIds.includes(job.id);
  const irDone = state.irDoneJobIds.includes(job.id);
  const completed = job.status === "Completed";

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <Link href={`/jobs/${job.id}`} className="block p-3">
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

      {/* Reassign / take back — only available while the job hasn't started */}
      {!completed && !checkedIn ? (
        isReassigning ? (
          <div className="border-t border-border p-3">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Move this job to…
              </p>
              <button
                type="button"
                onClick={onCancelReassign}
                className="text-[11px] font-medium text-accent"
              >
                Cancel
              </button>
            </div>
            <div className="space-y-1.5">
              {otherMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onReassignTo(m.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-border-strong bg-surface-2 px-3 py-2.5 text-left text-[13px]"
                  style={{ minHeight: 40 }}
                >
                  <span>
                    <span className="font-semibold">{m.name}</span>
                    <span className="ml-1 text-[11px] text-muted">
                      · {m.role}
                    </span>
                  </span>
                  <span className="text-muted">→</span>
                </button>
              ))}
              <button
                type="button"
                onClick={onTakeBack}
                className="flex w-full items-center justify-between rounded-xl border border-accent/40 bg-accent-soft px-3 py-2.5 text-left text-[13px] font-semibold text-accent"
                style={{ minHeight: 40 }}
              >
                <span>Take back to me</span>
                <span>↺</span>
              </button>
              {otherMembers.length === 0 ? (
                <p className="text-[11px] text-muted-strong">
                  No other team members yet — invite one from My Team to enable
                  reassignment.
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenReassign}
            className="flex w-full items-center justify-center gap-1 border-t border-border py-2 text-[11px] font-medium text-accent hover:bg-surface-2"
          >
            ↔ Reassign
          </button>
        )
      ) : null}
    </div>
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
