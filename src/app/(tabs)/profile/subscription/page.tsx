"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function SubscriptionPage() {
  const router = useRouter();
  const { state } = useAppState();
  const sub = state.trade.subscription;
  const pct = Math.round((sub.allocatedYTD / sub.cap) * 100);

  return (
    <main className="pb-8">
      <PageHeader
        title="Subscription"
        subtitle="Your work allocation guarantee"
        back
        onBack={() => router.push("/profile")}
      />

      {/* Current tier */}
      <section className="px-5 pt-4">
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Current tier
              </p>
              <p className="mt-1 text-[18px] font-bold">{sub.tier} tier</p>
              <p className="mt-0.5 text-xs text-muted">
                Allocated ${sub.allocatedYTD} of ${sub.cap} this year
              </p>
            </div>
            <Badge tone="warn">{pct}% used</Badge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <p className="mt-3 text-[12px] text-muted">
            On the free tier you can take up to ${sub.cap} of allocated work
            per year. Upgrade to remove the cap and gain a guaranteed
            allocation.
          </p>
        </div>
      </section>

      {/* Upgrade options */}
      <section className="mt-6 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Upgrade
        </h2>
        <div className="space-y-2">
          <PlanCard
            name="Standard"
            price="$518/year"
            line="Guarantees $10,000 of work per year. If Circl doesn't deliver, next year is free."
            primary
          />
          <PlanCard
            name="Premium"
            price="~$199/month"
            line="Guarantees $25,000/year. Higher priority on new opportunities."
          />
        </div>
      </section>

      {/* Billing */}
      <section className="mt-6 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Billing
        </h2>
        <Link
          href="/money"
          className="flex items-center justify-between rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4"
        >
          <div>
            <p className="text-[14px] font-semibold">Payment method &amp; bank</p>
            <p className="mt-0.5 text-xs text-muted">
              Manage card on file and where settlements land
            </p>
          </div>
          <span className="text-muted">→</span>
        </Link>
      </section>
    </main>
  );
}

function PlanCard({
  name,
  price,
  line,
  primary,
}: {
  name: string;
  price: string;
  line: string;
  primary?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-4 " +
        (primary ? "border-accent/40 bg-accent-soft" : "border-border bg-surface")
      }
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[15px] font-semibold">{name}</p>
        <p className="text-[14px] font-bold text-accent">{price}</p>
      </div>
      <p className="mt-1 text-[12px] leading-5 text-foreground/85">{line}</p>
      <Button
        variant={primary ? "primary" : "secondary"}
        className="mt-3"
      >
        {primary ? "Upgrade to Standard" : "Choose Premium"}
      </Button>
    </div>
  );
}
