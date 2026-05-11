"use client";

/**
 * BottomNav — Phase 7 update: tabs carry notification badges so the
 * trade can see at a glance which tabs need attention without going
 * to Home and reading. Decentralises the per-tab notifications that
 * were previously cluttering Home's notification stack.
 *
 * Badge rules:
 * - Home: never badged (Home pulls everything together; user is here)
 * - Schedule: dot when tomorrow has unresolved equipment delivery
 * - Find Jobs: dot when an urgent opportunity is available + unresponded
 * - Money: count when one or more RCTIs are in Action Required
 * - My Team (when on): dot when any delegated job has equipment unresolved
 * - Profile: never badged (passive surface)
 *
 * Badge style — dot for "something here" (no count), pill with count
 * for things you can quantify. Both use accent or warn tone depending
 * on urgency.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAppState } from "@/lib/state/AppStateProvider";

interface Item {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const items: Item[] = [
  { href: "/home", label: "Home", icon: <IconHome /> },
  { href: "/schedule", label: "Schedule", icon: <IconCalendar /> },
  { href: "/find-jobs", label: "Find Jobs", icon: <IconSearch /> },
  { href: "/money", label: "Money", icon: <IconMoney /> },
  { href: "/profile", label: "Profile", icon: <IconUser /> },
];

const myTeam: Item = { href: "/my-team", label: "My Team", icon: <IconTeam /> };

interface BadgeState {
  tone: "accent" | "warn";
  count?: number;
}

export function BottomNav() {
  const pathname = usePathname();
  const { state } = useAppState();
  const list = state.hasTeam ? [...items, myTeam] : items;

  const badges = useMemo<Record<string, BadgeState | undefined>>(() => {
    const out: Record<string, BadgeState | undefined> = {};

    // Each badge must reflect what's visible on the DESTINATION tab —
    // otherwise a tap on a badged tab leaves the user hunting for
    // something that isn't there. When team is on, Schedule and Money
    // hide team-delegated jobs (they live on My Team); the badges
    // here apply the same filter so the destination always shows the
    // thing that triggered the badge.
    const ownJobs = state.hasTeam
      ? state.jobs.filter((j) => !j.assignedToMemberId)
      : state.jobs;

    // Schedule — tomorrow has equipment unresolved (Brett's own jobs only)
    const tomorrowJeopardy = ownJobs.some(
      (j) =>
        j.dateOffsetDays === 1 &&
        (j.equipmentDeliveryStatus === "Not Yet Received" ||
          j.equipmentDeliveryStatus === "Delayed"),
    );
    if (tomorrowJeopardy) out["/schedule"] = { tone: "warn" };

    // Find Jobs — urgent opportunity available (no team-filtering;
    // opportunities aren't team-assigned)
    const urgentOpp = state.opportunities.some(
      (o) => o.urgent && !o.outcome,
    );
    if (urgentOpp) out["/find-jobs"] = { tone: "accent" };

    // Money — RCTI Action Required count (Brett's own jobs only;
    // team-delegated RCTIs are visible on My Team's member detail)
    const actionCount = ownJobs.filter(
      (j) => j.paymentStatus === "Action Required",
    ).length;
    if (actionCount > 0)
      out["/money"] = { tone: "warn", count: actionCount };

    // My Team — delegated job with equipment unresolved (only when
    // team on; mirrors the team-jeopardy callout on My Team)
    if (state.hasTeam) {
      const teamJeopardy = state.jobs.some(
        (j) =>
          j.assignedToMemberId &&
          (j.equipmentDeliveryStatus === "Not Yet Received" ||
            j.equipmentDeliveryStatus === "Delayed"),
      );
      if (teamJeopardy) out["/my-team"] = { tone: "warn" };
    }

    return out;
  }, [state.jobs, state.opportunities, state.hasTeam]);

  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
      <div
        className="flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {list.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          const badge = badges[it.href];
          return (
            <Link
              key={it.href}
              href={it.href}
              className={
                "flex flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors " +
                (active ? "text-accent" : "text-muted hover:text-foreground")
              }
              style={{ minHeight: 56 }}
            >
              <span
                className={
                  "relative flex h-6 w-6 items-center justify-center " +
                  (active ? "text-accent" : "text-muted")
                }
              >
                {it.icon}
                {badge ? <NavBadge badge={badge} /> : null}
              </span>
              <span className="leading-none">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavBadge({ badge }: { badge: BadgeState }) {
  const bgClass =
    badge.tone === "warn" ? "bg-warn" : "bg-accent";
  if (badge.count !== undefined) {
    return (
      <span
        className={
          "absolute -right-2 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white " +
          bgClass
        }
        style={{ height: 18 }}
        aria-label={`${badge.count} item${badge.count === 1 ? "" : "s"} need attention`}
      >
        {badge.count}
      </span>
    );
  }
  return (
    <span
      className={
        "absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background " +
        bgClass
      }
      aria-label="Needs attention"
    />
  );
}

function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 3v4M16 3v4M3 9h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 21c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconMoney() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M14.5 9.5c0-1-1-1.8-2.5-1.8s-2.5.8-2.5 1.8.8 1.5 2.5 1.8 2.5.8 2.5 1.8-1 1.8-2.5 1.8-2.5-.8-2.5-1.8M12 6.5v1.2M12 16.3v1.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconTeam() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="11" r="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 20c0-3 2.5-5 6-5s6 2 6 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 20c.5-2.5 2-4 4-4s3 1.5 3 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
