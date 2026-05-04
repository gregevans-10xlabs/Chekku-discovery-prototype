"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();

  const signOut = () => {
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
  };

  const tradeTypesSummary =
    state.trade.tradeTypes.length === 0
      ? "Not set"
      : state.trade.tradeTypes.length <= 2
        ? state.trade.tradeTypes.join(", ")
        : `${state.trade.tradeTypes.slice(0, 2).join(", ")} +${state.trade.tradeTypes.length - 2}`;

  return (
    <main className="pb-8">
      <PageHeader
        title="Account"
        subtitle="Identity, work preferences, sign out"
        back
        onBack={() => router.push("/profile")}
      />

      {/* Personal & business — read-only */}
      <section className="px-5 pt-4">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Personal &amp; business
        </h2>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="space-y-2 text-[13px]">
            <FieldRow label="Full name" value={state.trade.fullName} />
            <FieldRow label="Phone" value={state.trade.phone} />
            <FieldRow label="ABN" value={state.trade.abn} />
          </div>
          <p className="mt-3 text-[11px] text-muted-strong">
            To change your name, ABN, or phone number, contact Circl Support.
          </p>
        </div>
      </section>

      {/* Work preferences — editable */}
      <section className="mt-6 px-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
          Work preferences
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <EditRow
            href="/profile/service-area"
            label="Service area"
            summary={`${state.trade.serviceArea.suburb} · within ${state.trade.serviceArea.radiusKm} km`}
          />
          <EditRow
            href="/profile/trade-types"
            label="Trade types"
            summary={tradeTypesSummary}
          />
          <EditRow
            href="#language"
            label="Language"
            summary={state.trade.language}
            isLast
            disabled
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-strong">
          Service area and trade types affect which opportunities appear in
          Find Jobs.
        </p>
      </section>

      {/* Sign out */}
      <section className="mt-6 px-5">
        <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted">
          <p>
            Sign out clears your local data on this device — useful for
            starting a fresh demo run.
          </p>
          <Button variant="danger" className="mt-3" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </section>
    </main>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function EditRow({
  href,
  label,
  summary,
  isLast,
  disabled,
}: {
  href: string;
  label: string;
  summary: string;
  isLast?: boolean;
  disabled?: boolean;
}) {
  const className =
    "flex items-center justify-between gap-3 px-4 py-3.5 " +
    (disabled ? "opacity-50" : "hover:bg-surface-2") +
    (isLast ? "" : " border-b border-border");
  const content = (
    <>
      <div className="min-w-0">
        <p className="text-[14px] font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{summary}</p>
      </div>
      <span className="text-muted">{disabled ? "—" : "→"}</span>
    </>
  );
  if (disabled) {
    return <div className={className}>{content}</div>;
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
