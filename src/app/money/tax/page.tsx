"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default function TaxSettingsPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();

  const [gstRegistered, setGstRegistered] = useState(
    state.trade.gstRegistered ?? true,
  );
  const [tradingName, setTradingName] = useState(
    state.trade.tradingName ?? state.trade.fullName,
  );

  const hasChanged =
    gstRegistered !== (state.trade.gstRegistered ?? true) ||
    tradingName.trim() !== (state.trade.tradingName ?? state.trade.fullName);

  const submit = () => {
    if (!hasChanged) return;
    dispatch({
      type: "set-tax-settings",
      gstRegistered,
      tradingName: tradingName.trim() || undefined,
    });
    router.replace("/money");
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <PageHeader
        title="Tax &amp; business name"
        subtitle="Affects how your RCTIs are issued"
        back
        onBack={() => router.push("/money")}
      />

      <section className="flex-1 px-5 pt-4">
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4">
          <p className="text-xs text-muted">
            Used by Circl to generate your RCTIs correctly. Get this wrong
            and your invoices won&apos;t match what the ATO expects.
          </p>
        </div>

        {/* GST registration */}
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            GST registration
          </p>
          <button
            type="button"
            onClick={() => setGstRegistered(true)}
            className={
              "mt-2 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors " +
              (gstRegistered
                ? "border-accent bg-accent-soft"
                : "border-border-strong bg-surface")
            }
          >
            <div
              className={
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 " +
                (gstRegistered
                  ? "border-accent bg-accent text-white"
                  : "border-border-strong")
              }
            >
              {gstRegistered ? "✓" : ""}
            </div>
            <div>
              <p className="text-[14px] font-semibold">I&apos;m GST registered</p>
              <p className="mt-1 text-[12px] text-muted">
                You earn $75,000+ in a 12-month period (or chose to register
                voluntarily). RCTIs include 10% GST and you remit GST to the
                ATO.
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setGstRegistered(false)}
            className={
              "mt-2 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors " +
              (!gstRegistered
                ? "border-accent bg-accent-soft"
                : "border-border-strong bg-surface")
            }
          >
            <div
              className={
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 " +
                (!gstRegistered
                  ? "border-accent bg-accent text-white"
                  : "border-border-strong")
              }
            >
              {!gstRegistered ? "✓" : ""}
            </div>
            <div>
              <p className="text-[14px] font-semibold">I&apos;m not GST registered</p>
              <p className="mt-1 text-[12px] text-muted">
                You earn under the $75,000 threshold. RCTIs are issued
                without GST and you don&apos;t remit GST.
              </p>
            </div>
          </button>
        </div>

        {/* Trading name */}
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Trading name (on your RCTIs)
          </p>
          <div className="mt-2 rounded-2xl border border-border-strong bg-surface px-5 py-3.5 focus-within:border-accent">
            <input
              value={tradingName}
              onChange={(e) => setTradingName(e.target.value)}
              placeholder="Your legal name or registered business name"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-strong"
            />
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Most sole traders use their legal name. Override here if you trade
            under a registered business name.
          </p>
        </div>
      </section>

      <footer className="px-5 pb-6 pt-4 safe-bottom">
        {!hasChanged ? (
          <p className="mb-2 text-center text-xs text-muted">
            Change a setting to save.
          </p>
        ) : null}
        <Button disabled={!hasChanged} onClick={submit}>
          Save tax settings
        </Button>
      </footer>
    </main>
  );
}
