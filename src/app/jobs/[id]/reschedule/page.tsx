"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import {
  dateForOffset,
  daysUntil,
  densityColorClass,
  relativeDayLabel,
} from "@/lib/demo-data";
import { Button } from "@/components/ui/Button";
import type { TimeOfDay } from "@/lib/types";

const REASONS = [
  "Customer unavailable",
  "Customer requested change",
  "Trade illness or emergency",
  "Equipment not received",
  "Site access issue",
  "Weather",
  "Other",
];

const TIME_OPTIONS: TimeOfDay[] = ["Morning", "Afternoon", "Evening"];

export default function ReschedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const job = state.jobs.find((j) => j.id === id);

  if (!job || job.client === "Harvey Norman" || job.status !== "Confirmed") {
    router.replace(`/jobs/${id}`);
    return null;
  }

  const today = new Date();
  const jobDate = dateForOffset(job.dateOffsetDays);
  const initialMonthOffset =
    (jobDate.getFullYear() - today.getFullYear()) * 12 +
    (jobDate.getMonth() - today.getMonth());

  const [monthOffset, setMonthOffset] = useState(initialMonthOffset);
  const [selectedOffset, setSelectedOffset] = useState<number>(
    job.dateOffsetDays,
  );
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(job.timeOfDay);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

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

  // Count jobs per day across the trade's calendar — excluding this one.
  const densityByKey = useMemo(() => {
    const map = new Map<string, number>();
    state.jobs.forEach((j) => {
      if (j.id === job.id) return;
      const d = dateForOffset(j.dateOffsetDays);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [state.jobs, job.id]);

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const originalKey = `${jobDate.getFullYear()}-${jobDate.getMonth()}-${jobDate.getDate()}`;

  const canConfirm = reason !== "";
  const hasChanged =
    selectedOffset !== job.dateOffsetDays || timeOfDay !== job.timeOfDay;

  const submit = () => {
    if (!canConfirm) return;
    dispatch({
      type: "reschedule-job",
      jobId: id,
      toDateOffsetDays: selectedOffset,
      toTimeOfDay: timeOfDay,
      reason,
      note: note.trim() || undefined,
    });
    router.replace(`/jobs/${id}`);
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 px-4 pt-[env(safe-area-inset-top,0.5rem)] pb-2">
          <button
            type="button"
            onClick={() => router.push(`/jobs/${id}`)}
            aria-label="Back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface"
            style={{ minHeight: 40 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold">Change schedule</h1>
            <p className="truncate text-[11px] text-muted">
              {job.cgNumber} · {job.type}
            </p>
          </div>
        </div>
      </header>

      <section className="flex-1 pb-4">
        {/* Current slot */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Current date
            </p>
            <p className="mt-1 text-[14px] font-semibold">
              {relativeDayLabel(job.dateOffsetDays)} · {job.startTime}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Pick a new date and time below. Customer should already be across
              the change — this notifies Circl.
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl border border-border bg-surface p-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMonthOffset((o) => o - 1)}
                aria-label="Previous month"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-foreground"
              >
                ‹
              </button>
              <p className="text-sm font-semibold">{monthLabel}</p>
              <button
                type="button"
                onClick={() => setMonthOffset((o) => o + 1)}
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
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                const offset = daysUntil(d);
                const density = densityByKey.get(key) ?? 0;
                const isToday = key === todayKey;
                const isPast = offset < 0;
                const isOriginal = key === originalKey;
                const isSelected = selectedOffset === offset;

                const cellClass = isSelected
                  ? "border-accent bg-accent text-white"
                  : isPast
                    ? "border-transparent opacity-40"
                    : isOriginal
                      ? "border-accent/60 bg-surface-2"
                      : isToday
                        ? "border-accent/40 bg-accent-soft"
                        : "border-transparent";
                const numberClass = isSelected
                  ? "text-white"
                  : isPast
                    ? "text-muted-strong"
                    : "text-foreground";
                const dotClass = isSelected
                  ? "bg-white"
                  : densityColorClass(density);

                return (
                  <button
                    type="button"
                    key={i}
                    disabled={isPast}
                    onClick={() => !isPast && setSelectedOffset(offset)}
                    aria-pressed={isSelected}
                    aria-label={d.toLocaleDateString("en-AU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    className={
                      "flex aspect-square flex-col rounded-lg border p-1 transition-colors " +
                      cellClass
                    }
                  >
                    <span className={"text-[10px] font-medium " + numberClass}>
                      {d.getDate()}
                    </span>
                    {density > 0 && !isSelected ? (
                      <div className="mt-auto flex justify-start">
                        <span
                          className={"h-1.5 w-1.5 rounded-full " + dotClass}
                          aria-hidden
                        />
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-3 text-[10px] text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-info" /> 1 job
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-warn" /> 2–3
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" /> 4+
              </span>
              <span className="ml-auto inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm border border-accent/60 bg-surface-2" />{" "}
                current
              </span>
            </div>
          </div>
        </div>

        {/* Time of day */}
        <div className="px-4 pt-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Time of day
          </label>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeOfDay(t)}
                className={
                  "rounded-xl py-2.5 text-sm font-semibold " +
                  (timeOfDay === t
                    ? "bg-accent text-white"
                    : "bg-surface text-muted")
                }
                style={{ minHeight: 40 }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="px-4 pt-4">
          <label
            htmlFor="reason"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted"
          >
            Reason <span className="text-danger">*</span>
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1.5 w-full appearance-none rounded-xl border border-border-strong bg-surface px-4 py-3.5 text-[15px] text-foreground focus:border-accent focus:outline-none"
          >
            <option value="" disabled>
              Choose a reason…
            </option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div className="px-4 pt-4">
          <label
            htmlFor="note"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted"
          >
            Additional note{" "}
            <span className="font-normal normal-case text-muted-strong">
              (optional)
            </span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Anything Circl should know about this change."
            className="mt-1.5 w-full rounded-xl border border-border-strong bg-surface px-4 py-3 text-[14px] text-foreground focus:border-accent focus:outline-none"
          />
        </div>
      </section>

      <footer className="sticky bottom-0 border-t border-border bg-background px-5 pb-6 pt-3 safe-bottom">
        {!canConfirm ? (
          <p className="mb-2 text-center text-xs text-warn">
            Choose a reason to continue.
          </p>
        ) : !hasChanged ? (
          <p className="mb-2 text-center text-xs text-muted">
            Pick a different date or time to reschedule.
          </p>
        ) : null}
        <Button disabled={!canConfirm || !hasChanged} onClick={submit}>
          Confirm reschedule
        </Button>
      </footer>
    </main>
  );
}
