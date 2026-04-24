"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";

function formatAuPhone(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

function isValidAuMobile(v: string) {
  const digits = v.replace(/\D/g, "");
  return /^(04|05)\d{8}$/.test(digits);
}

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const valid = isValidAuMobile(phone);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chekku:onboarding:phone");
      if (saved) setPhone(saved);
    } catch {}
  }, []);

  const submit = () => {
    if (!valid) return;
    try {
      localStorage.setItem("chekku:onboarding:phone", phone);
    } catch {}
    router.push("/onboarding/verify");
  };

  return (
    <main className="flex min-h-screen flex-col">
      <OnboardingHeader step={1} onBack={() => router.push("/")} />

      <section className="flex-1 px-5 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Your mobile number</h1>
        <p className="mt-2 text-sm text-muted">
          We’ll send you a code to verify your number. This is your login.
        </p>

        <div className="mt-8">
          <label className="text-xs font-medium text-muted">
            Mobile number
          </label>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-border-strong bg-surface px-4 py-3.5 focus-within:border-accent">
            <span className="text-muted">🇦🇺 +61</span>
            <input
              inputMode="numeric"
              autoComplete="tel"
              autoFocus
              placeholder="0412 345 678"
              value={phone}
              onChange={(e) => setPhone(formatAuPhone(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full bg-transparent text-lg tracking-wide outline-none placeholder:text-muted-strong"
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Australian mobile (starting 04 or 05).
          </p>
        </div>
      </section>

      <footer className="px-5 pb-8 pt-4 safe-bottom">
        <Button disabled={!valid} onClick={submit}>
          Send code
        </Button>
      </footer>
    </main>
  );
}
