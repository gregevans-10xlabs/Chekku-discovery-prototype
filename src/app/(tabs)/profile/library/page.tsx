"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  LIBRARY_CATEGORIES,
  getLibraryItems,
  type LibraryCategory,
} from "@/lib/demo-data";
import type { LibraryItem } from "@/lib/demo-data";

const CATEGORY_ICON: Record<LibraryCategory, string> = {
  "SWMS Templates": "🛡️",
  "Business & Customer Forms": "📄",
  "Compliance Kits": "📚",
};

export default function LibraryPage() {
  const router = useRouter();
  const { state } = useAppState();
  const items = getLibraryItems();
  const onPaidPlan = state.trade.subscription.tier !== "Free";

  return (
    <main className="pb-8">
      <PageHeader
        title="Document library"
        subtitle="Templates, forms, compliance kits"
        back
        onBack={() => router.push("/profile")}
      />

      {/* Subscription callout — drives the upgrade story */}
      {!onPaidPlan ? (
        <section className="px-5 pt-4">
          <Link
            href="/profile/subscription"
            className="block rounded-2xl border border-accent/30 bg-accent-soft p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
              Free with Standard plan
            </p>
            <p className="mt-1 text-[14px] font-semibold">
              Get every document below included
            </p>
            <p className="mt-1 text-[12px] text-foreground/85">
              Standard plan ($518/year) includes the entire library plus a
              $10,000 work guarantee. Tap to upgrade.
            </p>
            <p className="mt-2 text-[12px] font-semibold text-accent">
              See plans →
            </p>
          </Link>
        </section>
      ) : null}

      {/* Categorised list */}
      {LIBRARY_CATEGORIES.map((cat) => {
        const list = items.filter((i) => i.category === cat);
        if (list.length === 0) return null;
        return (
          <section key={cat} className="mt-6 px-5">
            <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="text-base leading-none" aria-hidden>
                {CATEGORY_ICON[cat]}
              </span>
              {cat}{" "}
              <span className="text-muted-strong">({list.length})</span>
            </h2>
            <div className="space-y-2">
              {list.map((item) => (
                <ItemRow key={item.id} item={item} onPaidPlan={onPaidPlan} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-6 px-5">
        <p className="text-[11px] text-muted-strong">
          Documents are reviewed periodically by Sparke Helmore (legal) and
          updated to reflect Australian regulatory changes. Auto-fill items
          pre-populate with your business name, ABN, and contact details.
        </p>
      </section>
    </main>
  );
}

function ItemRow({
  item,
  onPaidPlan,
}: {
  item: LibraryItem;
  onPaidPlan: boolean;
}) {
  return (
    <Link
      href={`/profile/library/${item.id}`}
      className="block rounded-2xl border border-border bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">{item.name}</p>
          <p className="mt-0.5 text-xs text-muted">{item.shortDescription}</p>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-strong">
            <span>{item.format}</span>
            <span aria-hidden>·</span>
            <span>{item.pages} pages</span>
            {item.autoFilled ? (
              <>
                <span aria-hidden>·</span>
                <span className="text-accent">Auto-fills</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          {onPaidPlan ? (
            <Badge tone="success">Included</Badge>
          ) : (
            <p className="text-[15px] font-bold text-accent">
              ${(item.priceCents / 100).toFixed(0)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
