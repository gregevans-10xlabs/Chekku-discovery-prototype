"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import type { PaymentMethod } from "@/lib/types";

const BRAND_OPTIONS: PaymentMethod["brand"][] = ["Visa", "Mastercard", "Amex"];

function formatCardNumber(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function PaymentMethodPage() {
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const existing = state.trade.paymentMethod;

  const [cardNumber, setCardNumber] = useState(
    existing ? `•••• •••• •••• ${existing.last4}` : "",
  );
  const [expiry, setExpiry] = useState(existing?.expiry ?? "");
  const [brand, setBrand] = useState<PaymentMethod["brand"]>(
    existing?.brand ?? "Visa",
  );

  const digits = cardNumber.replace(/\D/g, "");
  const validCard = digits.length === 16;
  const validExpiry = /^\d{2}\/\d{2}$/.test(expiry);
  const valid = validCard && validExpiry;

  const submit = () => {
    if (!valid) return;
    dispatch({
      type: "set-payment-method",
      paymentMethod: {
        brand,
        last4: digits.slice(-4),
        expiry,
      },
    });
    router.replace("/money");
  };

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <PageHeader
        title="Payment method"
        subtitle="For subscription billing"
        back
        onBack={() => router.push("/money")}
      />

      <section className="flex-1 px-5 pt-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">
            Used to charge your Circl subscription when you exceed the free
            allocation. Settlements still land in your bank account.
          </p>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted">Card brand</label>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {BRAND_OPTIONS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBrand(b)}
                className={
                  "rounded-xl py-2.5 text-sm font-semibold " +
                  (brand === b
                    ? "bg-accent text-white"
                    : "bg-surface text-muted")
                }
                style={{ minHeight: 40 }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted">Card number</label>
          <div className="mt-1 rounded-2xl border border-border-strong bg-surface px-5 py-3.5 focus-within:border-accent">
            <input
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              className="w-full bg-transparent text-[15px] tracking-wide outline-none placeholder:text-muted-strong"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted">
            Expiry (MM/YY)
          </label>
          <div className="mt-1 w-32 rounded-2xl border border-border-strong bg-surface px-5 py-3.5 focus-within:border-accent">
            <input
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-strong"
            />
          </div>
        </div>

        <p className="mt-3 text-[11px] text-muted-strong">
          Prototype: card details are not transmitted or stored anywhere
          outside this device.
        </p>
      </section>

      <footer className="px-5 pb-6 pt-4 safe-bottom">
        {!valid ? (
          <p className="mb-2 text-center text-xs text-warn">
            Enter a 16-digit card number and MM/YY expiry to continue.
          </p>
        ) : null}
        <Button disabled={!valid} onClick={submit}>
          {existing ? "Save changes" : "Save card"}
        </Button>
      </footer>
    </main>
  );
}
