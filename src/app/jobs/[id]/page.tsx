"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { relativeDayLabel } from "@/lib/demo-data";

export default function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const job = state.jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <main>
        <PageHeader title="Not found" back />
        <p className="px-5 pt-6 text-sm text-muted">
          This job isn’t in your schedule.
        </p>
      </main>
    );
  }

  const sacDone = state.sacDoneJobIds.includes(job.id);
  const irDone = state.irDoneJobIds.includes(job.id);
  const checkedIn = state.checkedInJobId === job.id || job.status !== "Confirmed";
  const canComplete = checkedIn && sacDone && irDone;
  const jobDone = job.status === "Completed";

  const doCheckIn = () => {
    dispatch({ type: "check-in", jobId: job.id });
  };

  const doComplete = () => {
    if (!canComplete) return;
    dispatch({ type: "complete-job", jobId: job.id });
    router.push("/home");
  };

  const mapQuery = encodeURIComponent(
    `${job.customer.address}, ${job.customer.suburb} NSW ${job.customer.postcode}`,
  );

  return (
    <main className="pb-8">
      <PageHeader
        title={job.type}
        subtitle={`${job.cgNumber} · ${relativeDayLabel(job.dateOffsetDays)} ${job.startTime}`}
        back
        onBack={() => router.push("/home")}
      />

      {/* Status strip */}
      <section className="px-4 pt-4">
        <div className="flex flex-wrap gap-2">
          {jobDone ? <Badge tone="success">Completed</Badge> : null}
          {checkedIn && !jobDone ? <Badge tone="accent">In progress</Badge> : null}
          {!checkedIn && !jobDone ? <Badge tone="neutral">Confirmed</Badge> : null}
          {job.equipmentDeliveryStatus === "Delivered" ? (
            <Badge tone="success">Equipment delivered</Badge>
          ) : job.equipmentDeliveryStatus === "Not Yet Received" ? (
            <Badge tone="warn">Equipment pending</Badge>
          ) : job.equipmentDeliveryStatus === "Delayed" ? (
            <Badge tone="danger">Delivery delayed</Badge>
          ) : null}
        </div>
      </section>

      {/* Customer */}
      <section className="mt-4 space-y-2 px-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Customer
          </p>
          <p className="mt-1 text-[15px] font-semibold">
            {job.customer.firstName} {job.customer.lastName}
            {job.customer.rating ? (
              <span className="ml-2 text-xs font-normal text-muted">
                ★ {job.customer.rating}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-muted">
            {job.customer.address}
            <br />
            {job.customer.suburb} NSW {job.customer.postcode}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a
              href={`https://maps.apple.com/?q=${mapQuery}`}
              className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-2.5 text-[11px] font-semibold"
            >
              <span className="text-lg">🧭</span>Navigate
            </a>
            <a
              href={jobDone ? undefined : `tel:${job.customer.phone.replace(/\s/g, "")}`}
              className={
                "flex flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-semibold " +
                (jobDone
                  ? "bg-surface-2 text-muted pointer-events-none opacity-50"
                  : "bg-surface-2 text-foreground")
              }
              aria-disabled={jobDone}
            >
              <span className="text-lg">📞</span>Call customer
            </a>
            <a
              href="tel:+61280000000"
              className="flex flex-col items-center gap-1 rounded-xl bg-accent-soft py-2.5 text-[11px] font-semibold text-accent"
            >
              <span className="text-lg">🆘</span>Circl Support
            </a>
          </div>
        </div>
      </section>

      {/* Pickup location (HN) */}
      {job.pickupLocation ? (
        <section className="mt-3 px-4">
          <div className="rounded-2xl border border-info/30 bg-info/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-info">
              Pickup before attending
            </p>
            <p className="mt-1 text-[14px] font-semibold">
              {job.pickupLocation.name}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {job.pickupLocation.address}
            </p>
          </div>
        </section>
      ) : null}

      {/* Scope */}
      <section className="mt-3 px-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Work Order {job.workOrder}
          </p>
          {job.serviceCodes ? (
            <p className="mt-1 text-xs text-muted">
              Codes: {job.serviceCodes.join(", ")}
            </p>
          ) : null}
          <p className="mt-2 text-[14px] leading-6">{job.scope}</p>
        </div>
      </section>

      {/* Job workflow */}
      <section className="mt-5 px-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Job workflow
        </h2>
        <div className="space-y-2">
          <WorkflowStep
            n={1}
            title="Check in"
            subtitle={
              checkedIn
                ? "Checked in on arrival"
                : "Tap when you arrive on site"
            }
            done={checkedIn}
            disabled={false}
            onClick={!checkedIn ? doCheckIn : undefined}
          />
          <WorkflowStep
            n={2}
            title="Site Arrival Checklist"
            subtitle={
              sacDone
                ? "Completed (6 steps)"
                : "Safety check before work begins"
            }
            done={sacDone}
            disabled={!checkedIn}
            href={checkedIn ? `/jobs/${job.id}/sac` : undefined}
          />
          <WorkflowStep
            n={3}
            title="Installation Report"
            subtitle={
              irDone
                ? "Completed (8 steps)"
                : "Evidence and customer sign-off"
            }
            done={irDone}
            disabled={!sacDone}
            href={sacDone ? `/jobs/${job.id}/ir` : undefined}
          />
        </div>
      </section>

      {/* Job complete gate */}
      <section className="mt-6 px-4">
        {jobDone ? (
          <div className="rounded-2xl border border-success/40 bg-success-soft p-5 text-center">
            <p className="text-2xl">✓</p>
            <p className="mt-1 text-sm font-semibold text-success">
              Job complete — payment processing
            </p>
          </div>
        ) : (
          <Button disabled={!canComplete} onClick={doComplete}>
            {canComplete
              ? "Mark Job as Complete"
              : "Mark Job as Complete — locked"}
          </Button>
        )}
        {!canComplete && !jobDone ? (
          <p className="mt-2 text-center text-xs text-muted">
            All workflow steps must be complete before Job Complete can be
            triggered.
          </p>
        ) : null}
      </section>

      <section className="mt-6 px-4">
        {job.client === "Harvey Norman" ? (
          <div className="rounded-xl bg-surface p-3 text-xs text-muted">
            Reschedules aren’t available for Harvey Norman jobs — dates are
            set with the customer at point of sale. Contact{" "}
            <span className="text-foreground">Circl Support</span> if the job
            can’t go ahead.
          </div>
        ) : (
          <Link
            href="#reschedule"
            className="flex items-center justify-between rounded-xl bg-surface p-3 text-sm text-muted"
          >
            <span>Need to reschedule?</span>
            <span className="text-accent">→</span>
          </Link>
        )}
      </section>
    </main>
  );
}

function WorkflowStep({
  n,
  title,
  subtitle,
  done,
  disabled,
  href,
  onClick,
}: {
  n: number;
  title: string;
  subtitle: string;
  done: boolean;
  disabled: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div
      className={
        "flex items-center gap-3 rounded-2xl border p-3 " +
        (done
          ? "border-success/30 bg-success/10"
          : disabled
            ? "border-border bg-surface opacity-50"
            : "border-border-strong bg-surface")
      }
    >
      <div
        className={
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold " +
          (done
            ? "bg-success text-white"
            : disabled
              ? "bg-surface-2 text-muted-strong"
              : "bg-accent text-white")
        }
      >
        {done ? "✓" : n}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold">{title}</p>
        <p className="text-[12px] text-muted">{subtitle}</p>
      </div>
      {!done && !disabled ? <span className="text-muted">→</span> : null}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  if (onClick && !disabled)
    return (
      <button type="button" className="block w-full text-left" onClick={onClick}>
        {inner}
      </button>
    );
  return inner;
}

