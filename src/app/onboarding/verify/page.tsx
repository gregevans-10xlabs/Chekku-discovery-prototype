"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OnboardingHeader } from "@/components/onboarding/OnboardingHeader";
import { useAppState } from "@/lib/state/AppStateProvider";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignIn = searchParams.get("mode") === "signin";
  const { dispatch } = useAppState();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [attempts, setAttempts] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [phone, setPhone] = useState("");
  const [resendIn, setResendIn] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chekku:onboarding:phone");
      if (saved) setPhone(saved);
    } catch {}
  }, []);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const handleChange = (i: number, value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return;
    setDigits((prev) => {
      const next = [...prev];
      if (digits.length === 1) {
        next[i] = digits;
      } else {
        // SMS autofill / paste of multiple digits — distribute from index i.
        for (let j = 0; j < Math.min(digits.length, 6 - i); j++) {
          next[i + j] = digits[j];
        }
      }
      // Auto-submit against the fresh state once all 6 are populated.
      if (next.every((d) => d.length === 1)) {
        setTimeout(() => submit(next), 120);
      }
      // Move focus to the next empty input (or the last if all full).
      const nextEmpty = next.findIndex((d) => d === "");
      const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
      setTimeout(() => refs.current[focusIdx]?.focus(), 0);
      return next;
    });
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const submit = (code: string[]) => {
    // Accept any 6-digit code in the prototype.
    if (code.every((d) => d.length === 1)) {
      if (isSignIn) {
        dispatch({ type: "onboard" });
        router.replace("/home");
      } else {
        router.push("/onboarding/details");
      }
      return;
    }
    setShaking(true);
    setTimeout(() => {
      setDigits(["", "", "", "", "", ""]);
      setShaking(false);
      refs.current[0]?.focus();
      setAttempts((a) => {
        const next = a + 1;
        if (next >= 3) router.replace("/onboarding/phone");
        return next;
      });
    }, 300);
  };

  return (
    <main className="flex min-h-screen flex-col">
      <OnboardingHeader step={2} hideProgress={isSignIn} />
      <section className="flex-1 px-5 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSignIn ? "Verify it’s you" : "Enter your code"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          We sent a 6-digit code to{" "}
          <span className="text-foreground">+61 {phone}</span>.{" "}
          <button
            type="button"
            onClick={() => router.back()}
            className="font-medium text-accent"
          >
            Change number
          </button>
        </p>

        <div
          className={
            "mt-10 flex items-center justify-between gap-2 " +
            (shaking ? "shake" : "")
          }
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="h-14 w-12 rounded-xl border border-border-strong bg-surface text-center text-2xl font-semibold outline-none focus:border-accent"
            />
          ))}
        </div>

        <p className="mt-4 text-xs text-muted">
          Prototype: any 6-digit code works. Try{" "}
          <span className="font-mono text-foreground">123456</span>.
        </p>

        <div className="mt-6">
          <button
            type="button"
            disabled={resendIn > 0}
            onClick={() => setResendIn(30)}
            className="text-sm font-medium text-accent disabled:text-muted"
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </section>
    </main>
  );
}
