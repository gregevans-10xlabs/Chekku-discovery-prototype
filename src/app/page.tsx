"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useAppState } from "@/lib/state/AppStateProvider";

export default function Landing() {
  const router = useRouter();
  const { state } = useAppState();

  // Return users who already onboarded go straight to Home
  useEffect(() => {
    if (state.onboarded) {
      router.replace("/home");
    }
  }, [state.onboarded, router]);

  return (
    <main className="flex min-h-screen flex-col px-6 pb-8 pt-12">
      <div className="flex flex-col items-center gap-4 pt-6">
        <Logo size={64} />
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Chekku</h1>
          <p className="mt-1 text-sm text-muted">
            Get compliant. Get jobs. Get paid.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <ValueCard
          icon="🛡️"
          title="Stay Compliant"
          body="Upload licences once. We remind you before they expire and show what each one unlocks."
        />
        <ValueCard
          icon="📡"
          title="Find Work Fast"
          body="Jobs matched to your trade, compliance, and area — no browsing, no chasing."
        />
        <ValueCard
          icon="💰"
          title="Complete & Get Paid"
          body="Check in, capture evidence, and get paid via RCTI — no invoicing required."
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Button onClick={() => router.push("/onboarding/phone")}>
          Get started
        </Button>
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/onboarding/phone" className="font-medium text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

function ValueCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-xl">
        {icon}
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-0.5 text-[13px] leading-5 text-muted">{body}</p>
      </div>
    </div>
  );
}
