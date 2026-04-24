"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { href: "/profile", label: "Profile", icon: <IconUser /> },
];

const myTeam: Item = { href: "/my-team", label: "My Team", icon: <IconTeam /> };

export function BottomNav() {
  const pathname = usePathname();
  const { state } = useAppState();
  const list = state.hasTeam ? [...items, myTeam] : items;

  return (
    <nav className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur">
      <div
        className="flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {list.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
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
                  "flex h-6 w-6 items-center justify-center " +
                  (active ? "text-accent" : "text-muted")
                }
              >
                {it.icon}
              </span>
              <span className="leading-none">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
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
