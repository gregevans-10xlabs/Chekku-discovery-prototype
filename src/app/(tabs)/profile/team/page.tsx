"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
export default function TeamSettingsPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const team = state.team;

  return (
    <main className="pb-8">
      <PageHeader
        title="Team &amp; subcontractors"
        subtitle="Manage how your team uses Chekku"
        back
        onBack={() => router.push("/profile")}
      />

      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          {state.hasTeam ? (
            <>
              <p className="text-[14px] font-semibold">My Team is on</p>
              <p className="mt-1 text-xs text-muted">
                The My Team tab is visible in your bottom navigation. You have{" "}
                {team.members.length} member
                {team.members.length === 1 ? "" : "s"} configured.
              </p>
              <Link
                href="/my-team"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-accent-soft py-2.5 text-sm font-semibold text-accent"
                style={{ minHeight: 40 }}
              >
                Open My Team →
              </Link>
            </>
          ) : (
            <>
              <p className="text-[14px] font-semibold">My Team is off</p>
              <p className="mt-1 text-xs text-muted">
                Work with subcontractors or employees? Turn on My Team to
                assign jobs and see their progress. The tab will appear in
                your bottom navigation.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  dispatch({ type: "enable-team" });
                  router.push("/my-team");
                }}
              >
                Enable My Team
              </Button>
            </>
          )}
        </div>
      </section>

      <section className="mt-6 px-5">
        <p className="text-[11px] leading-5 text-muted-strong">
          Each team member uses their own Chekku login and manages their own
          compliance. As primary contractor you see status and evidence on
          work you've assigned — not their earnings from other principals.
        </p>
      </section>
    </main>
  );
}
