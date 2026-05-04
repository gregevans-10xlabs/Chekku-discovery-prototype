"use client";

import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

export default function PerformancePage() {
  const router = useRouter();
  const { state } = useAppState();

  return (
    <main className="pb-8">
      <PageHeader
        title="Performance"
        subtitle="How Circl scores your reliability"
        back
        onBack={() => router.push("/profile")}
      />

      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-accent/30 bg-accent-soft p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
            Current tier
          </p>
          <p className="mt-1 text-[18px] font-bold">★ {state.trade.tier}</p>
          <p className="mt-1 text-xs text-foreground/85">
            Your tier determines priority access to new opportunities and your
            payment terms. Improve the metrics below to move up.
          </p>
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 text-sm font-semibold text-muted">Metrics</h2>
        <div className="space-y-2">
          <PerformanceRow
            label="On-time rate"
            value={`${(state.trade.onTimeRate * 100).toFixed(0)}%`}
            improvement="Improving to 90% would lift your job volume by ~25%"
          />
          <PerformanceRow
            label="Completion rate"
            value={`${(state.trade.completionRate * 100).toFixed(0)}%`}
            improvement="Top 15% in your area — maintain to keep Silver tier"
          />
          <PerformanceRow
            label="Reschedules"
            value={state.trade.reschedulePeerPercentile}
            improvement="Reduce further to qualify for Gold tier eligibility"
          />
        </div>
      </section>

      <section className="mt-6 px-5">
        <h2 className="mb-3 text-sm font-semibold text-muted">
          Tier criteria
        </h2>
        <div className="rounded-2xl border border-border bg-surface p-4 text-[13px] leading-6">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Gold</span>
            <Badge tone="neutral">95%+ on-time · &lt;5% reschedule</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">Silver</span>
            <Badge tone="accent">You&apos;re here</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">Platinum</span>
            <Badge tone="neutral">By invitation</Badge>
          </div>
          <p className="mt-3 text-[11px] text-muted">
            Tier criteria are managed by Circl. Numerical public ratings are
            not used.
          </p>
        </div>
      </section>
    </main>
  );
}

function PerformanceRow({
  label,
  value,
  improvement,
}: {
  label: string;
  value: string;
  improvement: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] text-muted">{label}</p>
        <p className="text-[15px] font-semibold">{value}</p>
      </div>
      <p className="mt-1.5 text-[12px] leading-5 text-accent">{improvement}</p>
    </div>
  );
}
