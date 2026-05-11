"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { SUBURB_SUGGESTIONS } from "@/lib/demo-data";

type Radius = 25 | 50 | 100 | 250;

export default function ServiceAreaPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const current = state.trade.serviceArea;

  const [picked, setPicked] = useState<{
    suburb: string;
    postcode: string;
  } | null>({ suburb: current.suburb, postcode: current.postcode });
  const [query, setQuery] = useState(`${current.suburb} ${current.postcode}`);
  const [radius, setRadius] = useState<Radius>(current.radiusKm as Radius);

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

  const hasChanged =
    !picked ||
    picked.suburb !== current.suburb ||
    picked.postcode !== current.postcode ||
    radius !== current.radiusKm;
  const canSave = picked !== null && hasChanged;

  const submit = () => {
    if (!canSave || !picked) return;
    dispatch({
      type: "set-service-area",
      serviceArea: {
        suburb: picked.suburb,
        postcode: picked.postcode,
        radiusKm: radius,
      },
    });
    router.replace("/profile/account");
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <PageHeader
        title="Service area"
        subtitle="Where you can take work"
        back
        onBack={() => router.push("/profile/account")}
      />

      <section className="flex-1 px-5 pt-4">
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4">
          <p className="text-xs text-muted">
            Find Jobs only shows opportunities within this area. Wider radius
            = more jobs but longer drives.
          </p>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted">
            Suburb or postcode
          </label>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPicked(null);
            }}
            placeholder="Newcastle, 2300…"
            className="mt-1 w-full rounded-2xl border border-border-strong bg-surface px-5 py-3.5 text-[15px] outline-none focus:border-accent"
          />
          {matches.length > 0 ? (
            <div className="mt-2 overflow-hidden rounded-2xl bg-surface [box-shadow:var(--shadow-card)]">
              {matches.map((s) => (
                <button
                  key={s.suburb}
                  type="button"
                  onClick={() => pick(s)}
                  className="flex w-full items-center justify-between border-b border-border px-5 py-3 text-left last:border-b-0 hover:bg-surface-2"
                >
                  <span className="font-medium">{s.suburb}</span>
                  <span className="text-xs text-muted">{s.postcode}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          <label className="text-xs font-medium text-muted">
            Travel radius
          </label>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {([25, 50, 100, 250] as Radius[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
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

        <div className="mt-5 rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-5">
          <div className="relative mx-auto flex h-32 w-full items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-surface-2/60" />
            <div
              className="relative rounded-full border-2 border-dashed border-accent/50 bg-accent/10 transition-all"
              style={{
                width:
                  radius === 25
                    ? 70
                    : radius === 50
                      ? 110
                      : radius === 100
                        ? 150
                        : 190,
                height:
                  radius === 25
                    ? 70
                    : radius === 50
                      ? 110
                      : radius === 100
                        ? 150
                        : 190,
              }}
            >
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent p-2">
                <span className="text-white">📍</span>
              </span>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            {picked
              ? `${radius === 250 ? "250+" : radius} km from ${picked.suburb} ${picked.postcode}`
              : "Pick a suburb to see your coverage area"}
          </p>
        </div>
      </section>

      <footer className="px-5 pb-6 pt-4 safe-bottom">
        {!canSave && hasChanged ? (
          <p className="mb-2 text-center text-xs text-warn">
            Pick a suburb to continue.
          </p>
        ) : !hasChanged ? (
          <p className="mb-2 text-center text-xs text-muted">
            Change the suburb or radius to save.
          </p>
        ) : null}
        <Button disabled={!canSave} onClick={submit}>
          Save service area
        </Button>
      </footer>
    </main>
  );
}
