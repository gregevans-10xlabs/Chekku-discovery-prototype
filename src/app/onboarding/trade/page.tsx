"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { Button } from "@/components/ui/Button";
import { TRADE_TYPE_OPTIONS } from "@/lib/demo-data";

export default function TradePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("chekku:onboarding:trades");
      if (raw) setSelected(JSON.parse(raw));
    } catch {}
  }, []);

  const toggle = (label: string) => {
    setSelected((s) =>
      s.includes(label) ? s.filter((x) => x !== label) : [...s, label],
    );
  };

  const submit = () => {
    if (selected.length === 0) return;
    try {
      localStorage.setItem("chekku:onboarding:trades", JSON.stringify(selected));
    } catch {}
    router.push("/onboarding/area");
  };

  return (
    <main className="flex min-h-screen flex-col">
      <OnboardingHeader step={3} />

      <section className="flex-1 px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          What type of work do you do?
        </h1>
        <p className="mt-2 text-sm text-muted">Select all that apply.</p>

        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {TRADE_TYPE_OPTIONS.map((opt) => {
            const on = selected.includes(opt.label);
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => toggle(opt.label)}
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

      <footer className="px-5 pb-8 pt-4 safe-bottom">
        <p className="mb-2 text-center text-xs text-muted">
          {selected.length > 0
            ? `${selected.length} selected`
            : "Select at least one to continue"}
        </p>
        <Button disabled={selected.length === 0} onClick={submit}>
          Continue
        </Button>
      </footer>
    </main>
  );
}
