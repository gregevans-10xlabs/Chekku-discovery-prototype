"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

export default function MoneyPage() {
  return (
    <main className="pb-6">
      <PageHeader title="Money" />
      <section className="px-5 pt-6">
        <div className="rounded-3xl border border-border bg-surface p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
            <span className="text-2xl">🔒</span>
          </div>
          <Badge tone="accent" className="mt-4">
            Coming soon
          </Badge>
          <h2 className="mt-3 text-xl font-bold">The Money tab</h2>
          <p className="mt-2 text-sm text-muted">
            A single place for your earnings, settlement status, RCTI downloads,
            and subscription tier progress. Arriving in a future release.
          </p>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <PreviewRow label="Pay period earnings" value="Coming soon" />
          <PreviewRow label="Settlement status by job" value="Coming soon" />
          <PreviewRow label="RCTI access and download" value="Coming soon" />
          <PreviewRow label="Guaranteed allocation progress" value="Coming soon" />
        </div>
      </section>
    </main>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
      <span>{label}</span>
      <span className="text-muted">{value}</span>
    </div>
  );
}
