"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { Button } from "@/components/ui/Button";
import { SUBURB_SUGGESTIONS } from "@/lib/demo-data";

export default function AreaPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<{
    suburb: string;
    postcode: string;
  } | null>(null);
  const [radius, setRadius] = useState<25 | 50 | 100 | 250>(50);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("chekku:onboarding:area");
      if (raw) {
        const { picked: p, radius: r } = JSON.parse(raw);
        if (p) {
          setPicked(p);
          setQuery(`${p.suburb} ${p.postcode}`);
        }
        if (r) setRadius(r);
      }
    } catch {}
  }, []);

  const matches = useMemo(() => {
    if (!query || picked) return [];
    const q = query.toLowerCase();
    return SUBURB_SUGGESTIONS.filter(
      (s) =>
        s.suburb.toLowerCase().includes(q) || s.postcode.includes(q),
    ).slice(0, 5);
  }, [query, picked]);

  const pick = (s: { suburb: string; postcode: string }) => {
    setPicked(s);
    setQuery(`${s.suburb} ${s.postcode}`);
  };

  const canContinue = picked !== null;

  const submit = () => {
    if (!canContinue) return;
    try {
      localStorage.setItem(
        "chekku:onboarding:area",
        JSON.stringify({ picked, radius }),
      );
    } catch {}
    router.push("/onboarding/ready");
  };

  return (
    <main className="flex min-h-screen flex-col">
      <OnboardingHeader step={4} />
      <section className="flex-1 px-5 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Where are you based?</h1>
        <p className="mt-2 text-sm text-muted">
          We’ll show you jobs within this area.
        </p>

        <div className="mt-6">
          <label className="text-xs font-medium text-muted">
            Suburb or postcode
          </label>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(null);
            }}
            placeholder="Newcastle, 2300…"
            className="mt-1 w-full rounded-2xl border border-border-strong bg-surface px-4 py-3.5 text-lg outline-none focus:border-accent"
          />
          {matches.length > 0 ? (
            <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface">
              {matches.map((s) => (
                <button
                  key={s.suburb}
                  type="button"
                  onClick={() => pick(s)}
                  className="flex w-full items-center justify-between border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-surface-2"
                >
                  <span className="font-medium">{s.suburb}</span>
                  <span className="text-xs text-muted">{s.postcode}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6">
          <label className="text-xs font-medium text-muted">
            Travel radius
          </label>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[25, 50, 100, 250].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r as 25 | 50 | 100 | 250)}
                className={
                  "rounded-xl border py-2.5 text-sm font-semibold transition-colors " +
                  (radius === r
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border-strong bg-surface text-foreground")
                }
              >
                {r === 250 ? "250+" : r} km
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="relative mx-auto flex h-40 w-full items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_center,#1f2937_0,transparent_70%)]" />
            <div
              className={
                "relative rounded-full border-2 border-dashed border-accent/50 bg-accent/10 transition-all"
              }
              style={{
                width:
                  radius === 25
                    ? 80
                    : radius === 50
                      ? 130
                      : radius === 100
                        ? 180
                        : 220,
                height:
                  radius === 25
                    ? 80
                    : radius === 50
                      ? 130
                      : radius === 100
                        ? 180
                        : 220,
              }}
            >
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent p-2">
                <span className="text-white">📍</span>
              </span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            {picked
              ? `${radius} km from ${picked.suburb} ${picked.postcode}`
              : "Pick a suburb to see your coverage area"}
          </p>
        </div>
      </section>

      <footer className="px-5 pb-8 pt-4 safe-bottom">
        <Button disabled={!canContinue} onClick={submit}>
          Continue
        </Button>
      </footer>
    </main>
  );
}
