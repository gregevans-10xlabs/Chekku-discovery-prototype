"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { TRADE_TYPE_OPTIONS } from "@/lib/demo-data";
import type { TradeType } from "@/lib/types";

export default function TradeTypesPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const current = state.trade.tradeTypes;

  const [selected, setSelected] = useState<TradeType[]>(current);

  const toggle = (label: TradeType) => {
    setSelected((s) =>
      s.includes(label) ? s.filter((x) => x !== label) : [...s, label],
    );
  };

  const hasChanged =
    selected.length !== current.length ||
    selected.some((t) => !current.includes(t)) ||
    current.some((t) => !selected.includes(t));
  const canSave = selected.length > 0 && hasChanged;

  const submit = () => {
    if (!canSave) return;
    dispatch({ type: "set-trade-types", tradeTypes: selected });
    router.replace("/profile/account");
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <PageHeader
        title="Trade types"
        subtitle="What work you can do"
        back
        onBack={() => router.push("/profile/account")}
      />

      <section className="flex-1 px-5 pt-4 pb-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">
            Affects which jobs appear in Find Jobs and which compliance
            requirements are mandatory in your vault.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {TRADE_TYPE_OPTIONS.map((opt) => {
            const on = selected.includes(opt.label as TradeType);
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => toggle(opt.label as TradeType)}
                className={
                  "flex flex-col items-start gap-1.5 rounded-2xl border px-3.5 py-3 text-left transition-colors " +
                  (on
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-border-strong bg-surface text-foreground hover:border-muted-strong")
                }
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xl">{opt.icon}</span>
                  <span
                    className={
                      "flex h-5 w-5 items-center justify-center rounded-full border " +
                      (on
                        ? "border-accent bg-accent text-white"
                        : "border-border-strong")
                    }
                    aria-hidden
                  >
                    {on ? "✓" : ""}
                  </span>
                </div>
                <span className="text-[13px] font-semibold leading-tight">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="px-5 pb-6 pt-4 safe-bottom">
        <p className="mb-2 text-center text-xs text-muted">
          {selected.length === 0
            ? "Select at least one to continue"
            : !hasChanged
              ? "Change your selection to save"
              : `${selected.length} selected`}
        </p>
        <Button disabled={!canSave} onClick={submit}>
          Save trade types
        </Button>
      </footer>
    </main>
  );
}
