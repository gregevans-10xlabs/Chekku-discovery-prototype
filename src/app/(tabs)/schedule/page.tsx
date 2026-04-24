"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  dateForOffset,
  relativeDayLabel,
  startTimeToMinutes,
} from "@/lib/demo-data";
import type { Job } from "@/lib/types";

interface ScheduleSection {
  key: string;
  title: string;
  jobs: Job[];
}

export default function SchedulePage() {
  const { state } = useAppState();
  const [view, setView] = useState<"list" | "calendar">("list");

  const jobs = useMemo(
    () => [...state.jobs].sort((a, b) => a.dateOffsetDays - b.dateOffsetDays),
    [state.jobs],
  );

  const sections = useMemo<ScheduleSection[]>(() => {
    const byDayThenStart = (a: Job, b: Job) =>
      a.dateOffsetDays - b.dateOffsetDays ||
      startTimeToMinutes(a.startTime) - startTimeToMinutes(b.startTime);
    const today = jobs
      .filter((j) => j.dateOffsetDays === 0)
      .sort(byDayThenStart);
    const tomorrow = jobs
      .filter((j) => j.dateOffsetDays === 1)
      .sort(byDayThenStart);
    const thisWeek = jobs
      .filter((j) => j.dateOffsetDays >= 2 && j.dateOffsetDays <= 7)
      .sort(byDayThenStart);
    const completed = jobs
      .filter((j) => j.dateOffsetDays < 0)
      .sort((a, b) => b.dateOffsetDays - a.dateOffsetDays);
    return [
      { key: "today", title: "Today", jobs: today },
      { key: "tomorrow", title: "Tomorrow", jobs: tomorrow },
      { key: "thisWeek", title: "This week", jobs: thisWeek },
      { key: "completed", title: "Recently completed", jobs: completed },
    ];
  }, [jobs]);

  return (
    <main className="pb-6">
      <PageHeader title="Schedule" subtitle={`${jobs.length} accepted jobs`} />

      <div className="sticky top-[60px] z-10 bg-background/95 px-4 pt-2 backdrop-blur">
        <div className="flex rounded-xl bg-surface p-1">
          <button
            type="button"
            onClick={() => setView("list")}
            className={
              "flex-1 rounded-lg py-2 text-sm font-semibold " +
              (view === "list"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground")
            }
            style={{ minHeight: 40 }}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={
              "flex-1 rounded-lg py-2 text-sm font-semibold " +
              (view === "calendar"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground")
            }
            style={{ minHeight: 40 }}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-5 px-4 pt-4">
          {sections.map((section) =>
            section.jobs.length === 0 ? null : (
              <SectionGroup key={section.key} section={section} />
            ),
          )}
        </div>
      ) : (
        <CalendarView jobs={jobs} />
      )}
    </main>
  );
}

function SectionGroup({ section }: { section: ScheduleSection }) {
  const totalValue = section.jobs.reduce((s, j) => s + j.value, 0);
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
          {section.title}{" "}
          <span className="text-muted-strong">({section.jobs.length})</span>
        </h2>
        <span className="text-[11px] font-medium text-muted">
          ${totalValue.toFixed(2)}
        </span>
      </div>
      <div className="space-y-3">
        {section.jobs.map((j) => (
          <JobListRow key={j.id} job={j} />
        ))}
      </div>
    </div>
  );
}

function JobListRow({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge tone="neutral">
              {relativeDayLabel(job.dateOffsetDays)} · {job.startTime}
            </Badge>
            {job.status === "Completed" ? (
              <Badge tone="success">Completed</Badge>
            ) : job.status === "InProgress" ? (
              <Badge tone="accent">In progress</Badge>
            ) : null}
          </div>
          <h3 className="mt-2 text-[15px] font-semibold">{job.type}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {job.client} · {job.customer.suburb} · {job.cgNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-accent">
            ${job.value.toFixed(2)}
          </p>
          {job.equipmentDeliveryStatus === "Not Yet Received" ||
          job.equipmentDeliveryStatus === "Delayed" ? (
            <Badge tone={job.dateOffsetDays <= 1 ? "warn" : "neutral"}>
              ⚠ Delivery pending
            </Badge>
          ) : job.pickupLocation ? (
            <Badge tone="info">Pickup</Badge>
          ) : null}
        </div>
      </div>

      {job.paymentStatus && job.paymentStatus !== "Not Applicable" ? (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <span>Payment</span>
          <span className="font-medium text-foreground">
            {job.paymentStatus}
          </span>
        </div>
      ) : null}
    </Link>
  );
}

function CalendarView({ jobs }: { jobs: Job[] }) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDow = start.getDay();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(today.getFullYear(), today.getMonth(), d));
  }

  const byDay = new Map<string, Job[]>();
  jobs.forEach((j) => {
    const d = dateForOffset(j.dateOffsetDays);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const arr = byDay.get(key) ?? [];
    arr.push(j);
    byDay.set(key, arr);
  });

  return (
    <div className="px-4 pt-4">
      <div className="rounded-2xl border border-border bg-surface p-3">
        <div className="mb-2 text-center text-sm font-semibold">
          {today.toLocaleDateString("en-AU", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted">
          {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const dayJobs = byDay.get(key) ?? [];
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div
                key={i}
                className={
                  "flex aspect-square flex-col rounded-lg border p-1 " +
                  (isToday
                    ? "border-accent bg-accent-soft"
                    : dayJobs.length
                      ? "border-border-strong bg-surface-2"
                      : "border-transparent")
                }
              >
                <span
                  className={
                    "text-[10px] font-medium " +
                    (isToday ? "text-accent" : "text-foreground")
                  }
                >
                  {d.getDate()}
                </span>
                {dayJobs.length ? (
                  <div className="mt-auto flex flex-wrap gap-0.5">
                    {dayJobs.map((j) => (
                      <span
                        key={j.id}
                        className="h-1.5 w-1.5 rounded-full bg-accent"
                        aria-label={j.type}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Upcoming
        </h3>
        {jobs
          .filter((j) => j.dateOffsetDays >= 0)
          .map((j) => (
            <JobListRow key={j.id} job={j} />
          ))}
      </div>
    </div>
  );
}
