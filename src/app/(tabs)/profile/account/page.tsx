"use client";

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

  return (
    <main className="pb-8">
      <PageHeader
        title="Account"
        subtitle="Identity, language, sign out"
        back
        onBack={() => router.push("/profile")}
      />

      <section className="px-5 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Personal &amp; business
          </p>
          <div className="mt-3 space-y-2 text-[13px]">
            <FieldRow label="Full name" value={state.trade.fullName} />
            <FieldRow label="Phone" value={state.trade.phone} />
            <FieldRow label="ABN" value={state.trade.abn} />
            <FieldRow label="Language" value={state.trade.language} />
          </div>
          <p className="mt-4 text-[11px] text-muted-strong">
            To change your name, ABN, or phone number, contact Circl Support.
          </p>
        </div>
      </section>

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
