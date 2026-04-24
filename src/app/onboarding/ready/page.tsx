"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/state/AppStateProvider";
import { Logo } from "@/components/ui/Logo";

interface Summary {
  name: string;
  trades: string[];
  area: { suburb: string; postcode: string } | null;
  radius: number;
}

export default function ReadyPage() {
  const router = useRouter();
  const { dispatch } = useAppState();
  const [summary, setSummary] = useState<Summary>({
    name: "",
    trades: [],
    area: null,
    radius: 50,
  });

  useEffect(() => {
    try {
      const name = localStorage.getItem("chekku:onboarding:name") ?? "";
      const tradesRaw = localStorage.getItem("chekku:onboarding:trades");
      const trades = tradesRaw ? (JSON.parse(tradesRaw) as string[]) : [];
      const areaRaw = localStorage.getItem("chekku:onboarding:area");
      const { picked = null, radius = 50 } = areaRaw ? JSON.parse(areaRaw) : {};
      setSummary({ name, trades, area: picked, radius });
    } catch {}
  }, []);

  const firstName = summary.name.split(/\s+/)[0] || "there";

  const onboard = (goToProfile: boolean) => {
    dispatch({
      type: "onboard",
      patch: {
        fullName: summary.name || undefined,
        firstName,
        // keep demo data trade types / area (so demo remains coherent)
      },
    });
    router.replace(goToProfile ? "/profile" : "/home");
  };

  return (
    <main className="flex min-h-screen flex-col">
      <OnboardingHeader step={5} />
      <section className="flex-1 px-5 pt-6">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <Logo size={56} />
          <h1 className="text-2xl font-bold tracking-tight">
            You’re set up, {firstName}
          </h1>
          <p className="text-sm text-muted">
            Here’s what we’ve got on file.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <SummaryRow label="Trade types">
            {summary.trades.length > 0 ? summary.trades.join(", ") : "—"}
          </SummaryRow>
          <SummaryRow label="Service area">
            {summary.area
              ? `Within ${summary.radius} km of ${summary.area.suburb} ${summary.area.postcode}`
              : "—"}
          </SummaryRow>
        </div>

        <div className="mt-8 rounded-2xl border border-accent/30 bg-accent-soft p-4">
          <h3 className="text-sm font-semibold text-accent">One more thing</h3>
          <p className="mt-1 text-[13px] text-foreground/90">
            You’ll start seeing jobs matched to your skills and area right away.
            To <span className="font-semibold">accept</span> a job you’ll need
            to complete your compliance profile — licences, insurance, tickets.
          </p>
        </div>
      </section>

      <footer className="px-5 pb-8 pt-4 safe-bottom space-y-3">
        <Button onClick={() => onboard(true)}>Complete compliance now</Button>
        <button
          type="button"
          onClick={() => onboard(false)}
          className="w-full py-3 text-sm font-medium text-muted hover:text-foreground"
          style={{ minHeight: 44 }}
        >
          I’ll do it later
        </button>
      </footer>
    </main>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-[15px]">{children}</p>
    </div>
  );
}
