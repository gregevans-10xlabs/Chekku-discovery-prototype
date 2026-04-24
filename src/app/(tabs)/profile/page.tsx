"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getComplianceDocs } from "@/lib/demo-data";
import type { ComplianceDocument } from "@/lib/types";

export default function ProfilePage() {
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const docs = getComplianceDocs();

  return (
    <main className="pb-6">
      <PageHeader title="Profile" />

      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-xl font-bold text-accent">
              {state.trade.firstName.charAt(0)}
            </div>
            <div>
              <p className="text-[15px] font-semibold">
                {state.trade.fullName}
              </p>
              <p className="text-xs text-muted">ABN {state.trade.abn}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge tone="accent">★ {state.trade.tier} tier</Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <MetaBox label="Service area">
              {state.trade.serviceArea.suburb} ·{" "}
              {state.trade.serviceArea.radiusKm} km
            </MetaBox>
            <MetaBox label="On-time rate">
              {(state.trade.onTimeRate * 100).toFixed(0)}%
            </MetaBox>
          </div>
        </div>
      </section>

      <Section title="Compliance vault">
        <div className="space-y-2">
          {docs.map((d) => (
            <ComplianceRow key={d.id} doc={d} />
          ))}
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface py-3 text-sm font-semibold text-muted hover:text-foreground"
          style={{ minHeight: 44 }}
        >
          + Upload new document
        </button>
      </Section>

      <Section title="Training & courses">
        <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">
          <p className="font-medium text-foreground">Recommended for you</p>
          <ul className="mt-3 space-y-2.5 text-[13px]">
            <li className="flex justify-between">
              <span>Harvey Norman Installer Induction</span>
              <span className="text-accent">Start</span>
            </li>
            <li className="flex justify-between">
              <span>First Aid / HLTAID011</span>
              <span className="text-accent">Book</span>
            </li>
            <li className="flex justify-between">
              <span>Working at Heights refresher</span>
              <span className="text-muted-strong">Due 270d</span>
            </li>
          </ul>
        </div>
      </Section>

      <Section title="Subscription">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Free tier</p>
              <p className="text-xs text-muted">
                Allocated ${state.trade.subscription.allocatedYTD} of $
                {state.trade.subscription.cap} this year
              </p>
            </div>
            <Badge tone="warn">75% used</Badge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${(state.trade.subscription.allocatedYTD / state.trade.subscription.cap) * 100}%`,
              }}
            />
          </div>
          <p className="mt-3 text-[13px] text-muted">
            Upgrade to <span className="text-foreground">$518/year</span> and
            we’ll guarantee you $10,000 of work in your area — if we don’t
            deliver, next year is free.
          </p>
          <Button className="mt-4">See upgrade options</Button>
        </div>
      </Section>

      <Section title="Team & subcontractors">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm">
            {state.hasTeam
              ? "My Team tab is enabled in your bottom navigation."
              : "Work with subcontractors or employees? Turn on My Team to assign jobs and see their progress."}
          </p>
          <Button
            className="mt-4"
            variant={state.hasTeam ? "secondary" : "primary"}
            onClick={() => {
              dispatch({ type: "enable-team" });
              router.push("/my-team");
            }}
            disabled={state.hasTeam}
          >
            {state.hasTeam ? "My Team enabled" : "Enable My Team"}
          </Button>
        </div>
      </Section>

      <Section title="Account" tone="muted">
        <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted">
          <p>
            Sign out clears your local data on this device — useful for
            starting a fresh demo run.
          </p>
          <Button
            variant="danger"
            className="mt-3"
            onClick={() => {
              try {
                const keys: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const k = localStorage.key(i);
                  if (k && k.startsWith("chekku:")) keys.push(k);
                }
                keys.forEach((k) => localStorage.removeItem(k));
              } catch {}
              dispatch({ type: "reset" });
              router.replace("/");
            }}
          >
            Sign out
          </Button>
        </div>
      </Section>
    </main>
  );
}

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "muted";
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 px-5">
      <h2
        className={
          "mb-3 text-sm font-semibold " +
          (tone === "muted" ? "text-muted-strong" : "text-muted")
        }
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function MetaBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{children}</p>
    </div>
  );
}

function ComplianceRow({ doc }: { doc: ComplianceDocument }) {
  const tone =
    doc.status === "Active"
      ? "success"
      : doc.status === "Expiring Soon"
        ? "warn"
        : doc.status === "Expired"
          ? "danger"
          : "neutral";
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">{doc.name}</p>
          {doc.expiresAt ? (
            <p className="mt-0.5 text-xs text-muted">
              Expires{" "}
              {new Date(doc.expiresAt).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          ) : null}
          {doc.unlocks ? (
            <p className="mt-1.5 text-[12px] font-medium text-accent">
              🔓 {doc.unlocks}
            </p>
          ) : null}
        </div>
        <Badge tone={tone}>{doc.status}</Badge>
      </div>
      {doc.status === "Not Started" || doc.status === "Expiring Soon" ? (
        <button
          type="button"
          className="mt-3 w-full rounded-xl border border-border-strong bg-surface-2 py-2 text-sm font-semibold text-foreground"
          style={{ minHeight: 40 }}
        >
          {doc.status === "Not Started" ? "Start" : "Renew now"}
        </button>
      ) : null}
    </div>
  );
}
