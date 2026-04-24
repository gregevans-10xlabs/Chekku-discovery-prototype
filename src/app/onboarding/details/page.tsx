"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { Button } from "@/components/ui/Button";
import { formatAbn, isValidAbn } from "@/lib/abn";

export default function DetailsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [abn, setAbn] = useState("");
  const abnValid = isValidAbn(abn);
  const nameValid = name.trim().split(/\s+/).length >= 2;
  const canContinue = abnValid && nameValid;

  useEffect(() => {
    try {
      const n = localStorage.getItem("chekku:onboarding:name");
      const a = localStorage.getItem("chekku:onboarding:abn");
      if (n) setName(n);
      if (a) setAbn(a);
    } catch {}
  }, []);

  const submit = () => {
    if (!canContinue) return;
    try {
      localStorage.setItem("chekku:onboarding:name", name.trim());
      localStorage.setItem("chekku:onboarding:abn", abn);
    } catch {}
    router.push("/onboarding/trade");
  };

  return (
    <main className="flex min-h-screen flex-col">
      <OnboardingHeader step={3} />

      <section className="flex-1 px-5 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Tell us about you</h1>
        <p className="mt-2 text-sm text-muted">
          Your ABN is used to generate payment documents on your behalf (RCTI
          model).
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-xs font-medium text-muted">Full name</label>
            <input
              autoFocus
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jake Mitchell"
              className="mt-1 w-full rounded-2xl border border-border-strong bg-surface px-4 py-3.5 text-lg outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted">ABN</label>
            <input
              inputMode="numeric"
              value={abn}
              onChange={(e) => setAbn(formatAbn(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="51 824 753 556"
              className="mt-1 w-full rounded-2xl border border-border-strong bg-surface px-4 py-3.5 text-lg tracking-wider outline-none focus:border-accent"
            />
            <p className="mt-1.5 text-xs text-muted">
              11 digits. {abnValid ? (
                <span className="text-success">✓ Valid checksum</span>
              ) : abn.replace(/\D/g, "").length === 11 ? (
                <span className="text-danger">
                  Invalid — please check your ABN
                </span>
              ) : (
                <span>We’ll verify as you type.</span>
              )}
            </p>
          </div>
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
