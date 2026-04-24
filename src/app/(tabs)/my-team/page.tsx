"use client";

import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getTeam } from "@/lib/demo-data";

export default function MyTeamPage() {
  const { state } = useAppState();
  const team = getTeam();

  if (!state.hasTeam) {
    return (
      <main>
        <PageHeader title="My Team" />
        <div className="px-5 pt-6">
          <div className="rounded-2xl border border-border bg-surface p-5 text-sm">
            <p className="text-muted">
              My Team is a conditional tab — it only appears for primary
              contractors who have subcontractors or employees configured.
              Enable it from <span className="text-accent">Profile</span>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-6">
      <PageHeader
        title="My Team"
        subtitle={`${team.members.length} member${team.members.length === 1 ? "" : "s"}`}
      />

      <section className="space-y-3 px-4 pt-4">
        {team.members.map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft font-bold text-accent">
                {m.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{m.name}</p>
                <p className="text-xs text-muted">{m.role}</p>
              </div>
              <Badge tone={m.compliance === "Good" ? "success" : "warn"}>
                {m.compliance === "Good" ? "Compliant" : "Attention"}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-surface-2 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  Active jobs
                </p>
                <p className="mt-0.5 font-semibold">{m.activeJobs}</p>
              </div>
              <div className="rounded-xl bg-surface-2 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-muted">
                  Today
                </p>
                <p className="mt-0.5 font-semibold">1 scheduled</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 rounded-xl bg-accent-soft py-2 text-sm font-semibold text-accent"
                style={{ minHeight: 40 }}
              >
                Delegate job
              </button>
              <button
                className="flex-1 rounded-xl bg-surface-2 py-2 text-sm font-semibold text-foreground"
                style={{ minHeight: 40 }}
              >
                View progress
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong bg-surface py-4 text-sm font-semibold text-muted"
          style={{ minHeight: 44 }}
        >
          + Invite new team member
        </button>

        <p className="px-2 pt-2 text-[11px] text-muted-strong">
          Each team member uses their own Chekku login and manages their own
          compliance. You see progress on work you’ve assigned — not their
          earnings from other principals.
        </p>
      </section>
    </main>
  );
}
