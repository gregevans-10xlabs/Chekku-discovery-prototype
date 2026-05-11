"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type PauseDuration = "tomorrow" | "indefinite";
type PauseReason =
  | "Sick / personal"
  | "On holiday"
  | "Fully booked"
  | "Equipment failure"
  | "Other";

const PAUSE_REASONS: PauseReason[] = [
  "Sick / personal",
  "On holiday",
  "Fully booked",
  "Equipment failure",
  "Other",
];

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatPausedSince(iso?: string): string {
  if (!iso) return "Just now";
  const then = new Date(iso).getTime();
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatPausedUntil(iso?: string): string {
  if (!iso) return "Indefinitely — until you resume";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Resumes later today";
  if (diffDays === 1) return "Resumes tomorrow";
  return `Resumes in ${diffDays} days (${d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })})`;
}

export default function AvailabilityPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const current = state.trade.availability;
  const isPaused = current?.status === "paused";

  const [duration, setDuration] = useState<PauseDuration>("tomorrow");
  const [reason, setReason] = useState<PauseReason>("Sick / personal");
  const [note, setNote] = useState("");

  const pause = () => {
    dispatch({
      type: "set-availability",
      availability: {
        status: "paused",
        reason,
        pausedAt: new Date().toISOString(),
        pausedUntil: duration === "tomorrow" ? tomorrowIso() : undefined,
      },
    });
  };

  const resume = () => {
    dispatch({
      type: "set-availability",
      availability: { status: "available" },
    });
  };

  return (
    <main className="pb-8">
      <PageHeader
        title="Availability"
        subtitle="Pause new opportunity matching"
        back
        onBack={() => router.push("/profile")}
      />

      {/* Status card */}
      <section className="px-5 pt-4">
        <div
          className={
            "rounded-2xl border p-4 " +
            (isPaused
              ? "border-warn/40 bg-warn-soft"
              : "border-success/30 bg-success-soft")
          }
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className={
                  "text-[11px] font-semibold uppercase tracking-wider " +
                  (isPaused ? "text-warn" : "text-success")
                }
              >
                Current status
              </p>
              <p className="mt-1 text-[16px] font-bold">
                {isPaused ? "Paused — not receiving new jobs" : "Available"}
              </p>
            </div>
            <Badge tone={isPaused ? "warn" : "success"}>
              {isPaused ? "Paused" : "On"}
            </Badge>
          </div>

          {isPaused ? (
            <div className="mt-3 space-y-1 border-t border-warn/30 pt-3 text-[13px]">
              {current?.reason ? (
                <p>
                  <span className="text-muted">Reason: </span>
                  <span className="font-medium">{current.reason}</span>
                </p>
              ) : null}
              <p>
                <span className="text-muted">Paused: </span>
                <span className="font-medium">
                  {formatPausedSince(current?.pausedAt)}
                </span>
              </p>
              <p>
                <span className="text-muted">Resumes: </span>
                <span className="font-medium">
                  {formatPausedUntil(current?.pausedUntil)}
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-foreground/85">
              Circl is matching you to new jobs in your service area.
            </p>
          )}
        </div>
      </section>

      {/* What pause does */}
      <section className="mt-4 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          What pausing does
        </h2>
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4">
          <ul className="space-y-2 text-[13px]">
            <Bullet kind="stop">No new opportunity notifications</Bullet>
            <Bullet kind="stop">Removed from urgent-pickup matching</Bullet>
            <Bullet kind="keep">Existing accepted jobs continue as normal</Bullet>
            <Bullet kind="keep">Your tier and on-time score are unaffected</Bullet>
          </ul>
        </div>
      </section>

      {/* Action area */}
      {isPaused ? (
        <section className="mt-6 px-5">
          <Button onClick={resume}>I&apos;m available again</Button>
          <p className="mt-2 text-center text-[11px] text-muted-strong">
            New opportunities will start matching to you immediately.
          </p>
        </section>
      ) : (
        <>
          <section className="mt-6 px-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Pause until
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <DurationOption
                label="Tomorrow"
                sublabel="Resumes 12am"
                active={duration === "tomorrow"}
                onClick={() => setDuration("tomorrow")}
              />
              <DurationOption
                label="Indefinitely"
                sublabel="Until I resume"
                active={duration === "indefinite"}
                onClick={() => setDuration("indefinite")}
              />
            </div>
          </section>

          <section className="mt-5 px-5">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Reason
            </h2>
            <div className="space-y-1.5">
              {PAUSE_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-[14px] " +
                    (reason === r
                      ? "border-accent bg-accent-soft text-accent font-semibold"
                      : "border-border-strong bg-surface text-foreground")
                  }
                >
                  <span>{r}</span>
                  {reason === r ? <span>✓</span> : null}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-strong">
              Helps Circl understand demand patterns. Doesn&apos;t affect your tier.
            </p>
          </section>

          <section className="mt-5 px-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. back Friday"
              maxLength={60}
              className="w-full rounded-2xl border border-border-strong bg-surface px-5 py-3.5 text-[15px] outline-none focus:border-accent"
            />
          </section>

          <section className="mt-6 px-5">
            <Button onClick={pause}>Pause new matching</Button>
            <p className="mt-2 text-center text-[11px] text-muted-strong">
              You can resume anytime from this page.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

function DurationOption({
  label,
  sublabel,
  active,
  onClick,
}: {
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-2xl border px-4 py-3.5 text-left transition-colors " +
        (active
          ? "border-accent bg-accent-soft"
          : "border-border-strong bg-surface")
      }
    >
      <p
        className={
          "text-[14px] font-semibold " + (active ? "text-accent" : "")
        }
      >
        {label}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{sublabel}</p>
    </button>
  );
}

function Bullet({
  kind,
  children,
}: {
  kind: "stop" | "keep";
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-2">
      <span
        className={
          "mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold " +
          (kind === "stop"
            ? "bg-warn-soft text-warn"
            : "bg-success-soft text-success")
        }
      >
        {kind === "stop" ? "✕" : "✓"}
      </span>
      <span>{children}</span>
    </li>
  );
}
