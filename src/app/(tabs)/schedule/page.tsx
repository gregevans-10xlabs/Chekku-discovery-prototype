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
    const later = jobs
      .filter((j) => j.dateOffsetDays >= 8)
      .sort(byDayThenStart);
    const completed = jobs
      .filter((j) => j.dateOffsetDays < 0)
      .sort((a, b) => b.dateOffsetDays - a.dateOffsetDays);
    return [
      { key: "today", title: "Today", jobs: today },
      { key: "tomorrow", title: "Tomorrow", jobs: tomorrow },
      { key: "thisWeek", title: "This week", jobs: thisWeek },
      { key: "later", title: "Later", jobs: later },
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
  const todayKey = dateKey(today);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const month = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1),
    [today, monthOffset],
  );
  const monthLabel = month.toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });

  const startDow = month.getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }

  const byDay = useMemo(() => {
    const map = new Map<string, Job[]>();
    jobs.forEach((j) => {
      const d = dateForOffset(j.dateOffsetDays);
      const key = dateKey(d);
      const arr = map.get(key) ?? [];
      arr.push(j);
      map.set(key, arr);
    });
    return map;
  }, [jobs]);

  const selectedJobs = selectedKey ? (byDay.get(selectedKey) ?? []) : null;
  const selectedDate = selectedKey ? parseDateKey(selectedKey) : null;

  return (
    <div className="px-4 pt-4">
      <div className="rounded-2xl border border-border bg-surface p-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setMonthOffset((o) => o - 1);
              setSelectedKey(null);
            }}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => {
              setMonthOffset(0);
              setSelectedKey(null);
            }}
            className="text-sm font-semibold"
          >
            {monthLabel}
            {monthOffset !== 0 ? (
              <span className="ml-2 text-[11px] font-medium text-accent">
                Today
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => {
              setMonthOffset((o) => o + 1);
              setSelectedKey(null);
            }}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground"
          >
            ›
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted">
          {["S", "M", "T", "W", "T", "F", "S"].map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const key = dateKey(d);
            const dayJobs = byDay.get(key) ?? [];
            const isToday = key === todayKey;
            const isSelected = selectedKey === key;
            const cellClass = isSelected
              ? "border-accent bg-accent text-white"
              : isToday
                ? "border-accent bg-accent-soft"
                : dayJobs.length
                  ? "border-border-strong bg-surface-2"
                  : "border-transparent";
            const numberClass = isSelected
              ? "text-white"
              : isToday
                ? "text-accent"
                : "text-foreground";
            const dotClass = isSelected ? "bg-white" : "bg-accent";
            return (
              <button
                type="button"
                key={i}
                onClick={() => setSelectedKey(isSelected ? null : key)}
                aria-pressed={isSelected}
                aria-label={`${d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}${dayJobs.length ? `, ${dayJobs.length} job${dayJobs.length === 1 ? "" : "s"}` : ""}`}
                className={
                  "flex aspect-square flex-col rounded-lg border p-1 transition-colors " +
                  cellClass
                }
              >
                <span className={"text-[10px] font-medium " + numberClass}>
                  {d.getDate()}
                </span>
                {dayJobs.length ? (
                  <div className="mt-auto flex flex-wrap gap-0.5">
                    {dayJobs.slice(0, 4).map((j) => (
                      <span
                        key={j.id}
                        className={"h-1.5 w-1.5 rounded-full " + dotClass}
                        aria-hidden
                      />
                    ))}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        {selectedDate ? (
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              {selectedDate.toLocaleDateString("en-AU", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              <span className="ml-1.5 text-muted-strong">
                ({selectedJobs?.length ?? 0})
              </span>
            </h3>
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="text-[11px] font-medium text-accent"
            >
              Clear
            </button>
          </div>
        ) : (
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Upcoming
          </h3>
        )}
        <div className="space-y-2">
          {selectedJobs ? (
            selectedJobs.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
                No jobs on this day.
              </p>
            ) : (
              selectedJobs
                .sort(
                  (a, b) =>
                    startTimeToMinutes(a.startTime) -
                    startTimeToMinutes(b.startTime),
                )
                .map((j) => <JobListRow key={j.id} job={j} />)
            )
          ) : (
            jobs
              .filter((j) => j.dateOffsetDays >= 0)
              .map((j) => <JobListRow key={j.id} job={j} />)
          )}
        </div>
      </div>
    </div>
  );
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map((s) => parseInt(s, 10));
  return new Date(y, m, d);
}
