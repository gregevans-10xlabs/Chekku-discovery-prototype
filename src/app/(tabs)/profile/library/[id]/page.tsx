"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { getLibraryItem } from "@/lib/demo-data";

export default function LibraryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state } = useAppState();
  const item = getLibraryItem(id);

  if (!item) {
    return (
      <main>
        <PageHeader
          title="Not found"
          back
          onBack={() => router.push("/profile/library")}
        />
        <p className="px-5 pt-6 text-sm text-muted">
          That document isn’t in the library.
        </p>
      </main>
    );
  }

  const onPaidPlan = state.trade.subscription.tier !== "Free";
  const price = `$${(item.priceCents / 100).toFixed(0)}`;

  return (
    <main className="pb-8">
      <PageHeader
        title={item.category}
        back
        onBack={() => router.push("/profile/library")}
      />

      {/* Mock document preview */}
      <section className="px-5 pt-4">
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-6 text-center">
          <div className="mx-auto flex h-20 w-16 items-center justify-center rounded-md bg-surface-2 text-2xl">
            📄
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-strong">
            {item.format} · {item.pages} pages
          </p>
        </div>
      </section>

      {/* Identity */}
      <section className="mt-4 px-5">
        <h1 className="text-xl font-bold tracking-tight">{item.name}</h1>
        <p className="mt-2 text-[14px] leading-6 text-foreground/90">
          {item.longDescription}
        </p>
      </section>

      {/* What's included */}
      <section className="mt-5 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          What&apos;s included
        </h2>
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4">
          <ul className="space-y-1.5 text-[13px]">
            {item.includes.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent">•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Auto-fill note */}
      {item.autoFilled ? (
        <section className="mt-3 px-5">
          <div className="rounded-2xl border border-info/30 bg-info/10 p-4 text-[12px]">
            <p className="font-semibold text-info">Auto-fills with your details</p>
            <p className="mt-1 text-foreground/85">
              On download, this document is pre-populated with your business
              name ({state.trade.fullName}), ABN ({state.trade.abn}), and
              contact details. Saves you 10 minutes of typing on every job.
            </p>
          </div>
        </section>
      ) : null}

      {/* Updated meta */}
      <section className="mt-3 px-5">
        <p className="text-[11px] text-muted-strong">
          Updated {item.updatedDaysAgo} day{item.updatedDaysAgo === 1 ? "" : "s"}{" "}
          ago. Documents are reviewed by Sparke Helmore (legal) and updated to
          reflect Australian regulatory changes.
        </p>
      </section>

      {/* Buy CTA */}
      <section className="mt-6 px-5">
        {onPaidPlan ? (
          <>
            <Button>Download {item.format}</Button>
            <p className="mt-2 text-center text-[11px] text-success">
              ✓ Included with your {state.trade.subscription.tier} plan
            </p>
          </>
        ) : (
          <>
            <Button>Buy &amp; download — {price}</Button>
            <p className="mt-3 text-center text-[12px] text-muted">
              or get every document free with the{" "}
              <span className="text-accent font-semibold">Standard plan</span>{" "}
              ($518/year)
            </p>
          </>
        )}
      </section>
    </main>
  );
}
