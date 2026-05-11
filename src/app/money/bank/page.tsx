"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

function formatBsb(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

function isValidBsb(v: string) {
  return /^\d{3}-\d{3}$/.test(v);
}

function isValidAccountNumber(v: string) {
  return /^\d{6,9}$/.test(v);
}

export default function BankAccountPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const existing = state.trade.bankAccount;

  const [accountName, setAccountName] = useState(existing?.accountName ?? "");
  const [bsb, setBsb] = useState(existing?.bsb ?? "");
  const [accountNumber, setAccountNumber] = useState(
    existing?.accountNumber ?? "",
  );

  const valid =
    accountName.trim().length > 0 &&
    isValidBsb(bsb) &&
    isValidAccountNumber(accountNumber);

  const submit = () => {
    if (!valid) return;
    dispatch({
      type: "set-bank-account",
      bankAccount: { accountName: accountName.trim(), bsb, accountNumber },
    });
    router.replace("/money");
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <PageHeader
        title="Bank account"
        subtitle="Where your settlements land"
        back
        onBack={() => router.push("/money")}
      />

      <section className="flex-1 px-5 pt-4">
        <div className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-4">
          <p className="text-xs text-muted">
            Used to deposit your RCTI settlements. Only you and Circl can see
            these details.
          </p>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted">
            Account name
          </label>
          <div className="mt-1 rounded-2xl border border-border-strong bg-surface px-5 py-3.5 focus-within:border-accent">
            <input
              autoFocus
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Sandbar Electrical Services"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-strong"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="text-xs font-medium text-muted">BSB</label>
            <div className="mt-1 rounded-2xl border border-border-strong bg-surface px-5 py-3.5 focus-within:border-accent">
              <input
                inputMode="numeric"
                value={bsb}
                onChange={(e) => setBsb(formatBsb(e.target.value))}
                placeholder="000-000"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-strong"
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted">
              Account number
            </label>
            <div className="mt-1 rounded-2xl border border-border-strong bg-surface px-5 py-3.5 focus-within:border-accent">
              <input
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) =>
                  setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 9))
                }
                placeholder="00000000"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-strong"
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted">
          Australian BSB (XXX-XXX) and 6–9 digit account number.
        </p>
      </section>

      <footer className="px-5 pb-6 pt-4 safe-bottom">
        {!valid ? (
          <p className="mb-2 text-center text-xs text-warn">
            Enter a valid BSB and account number to continue.
          </p>
        ) : null}
        <Button disabled={!valid} onClick={submit}>
          {existing ? "Save changes" : "Save bank account"}
        </Button>
      </footer>
    </main>
  );
}
