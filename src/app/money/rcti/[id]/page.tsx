"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { dateForOffset } from "@/lib/demo-data";
import type { PaymentStatus } from "@/lib/types";

const GST_RATE = 0.1; // Australian GST 10%

function statusTone(s: PaymentStatus) {
  if (s === "Settled") return "success" as const;
  if (s === "Action Required") return "danger" as const;
  if (s === "Payment Processing") return "info" as const;
  return "neutral" as const;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function RctiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state } = useAppState();
  const job = state.jobs.find((j) => j.id === id);

  if (!job || !job.rctiNumber) {
    return (
      <main>
        <PageHeader title="Not found" back onBack={() => router.push("/money")} />
        <p className="px-5 pt-6 text-sm text-muted">
          No RCTI found for this job. RCTIs are generated when a job moves
          past Job Complete.
        </p>
      </main>
    );
  }

  const issuedDate = dateForOffset(job.dateOffsetDays);
  const settlementDate =
    job.paymentStatus === "Settled" ? dateForOffset(job.dateOffsetDays + 5) : null;

  // RCTI line items: per spec, Circl generates the RCTI on behalf of the trade.
  // Line item math depends on the trade's GST registration status. Registered
  // trades show subtotal + 10% GST + total (current Australian sole-trader
  // pattern); under-threshold trades show a single line with no GST and a
  // note that explains why.
  const gstRegistered = state.trade.gstRegistered ?? true;
  const subtotal = gstRegistered ? job.value / (1 + GST_RATE) : job.value;
  const gst = gstRegistered ? job.value - subtotal : 0;
  const recipientName = state.trade.tradingName ?? state.trade.fullName;

  const handleShare = async () => {
    const shareData = {
      title: `RCTI ${job.rctiNumber}`,
      text: `${job.type} · $${job.value.toFixed(2)} · ${job.customer.suburb}`,
      url: window.location.href,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or browser declined — fall back to print.
        window.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <main className="pb-8">
      <PageHeader
        title="RCTI"
        subtitle={job.rctiNumber}
        back
        onBack={() => router.push("/money")}
      />

      {/* Status */}
      <section className="px-5 pt-4">
        <div className="flex items-center gap-2">
          <Badge tone={statusTone(job.paymentStatus)}>{job.paymentStatus}</Badge>
          <p className="text-xs text-muted">
            {job.paymentStatus === "Settled" && settlementDate
              ? `Settled ${fmtDate(settlementDate)}`
              : job.paymentStatus === "Payment Processing"
                ? "Funds in transit"
                : job.paymentStatus === "Action Required"
                  ? "Resolve to release payment"
                  : "Awaiting payment processing"}
          </p>
        </div>
      </section>

      {/* Document */}
      <section className="mt-4 px-5">
        <article className="rounded-2xl bg-surface [box-shadow:var(--shadow-card)] p-5">
          <header className="border-b border-border pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-strong">
              Recipient-Created Tax Invoice
            </p>
            <p className="mt-1 text-[13px] text-muted">
              {job.rctiNumber} · Issued {fmtDate(issuedDate)}
            </p>
          </header>

          <div className="mt-4 grid grid-cols-2 gap-4 text-[12px]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-strong">
                Issued by
              </p>
              <p className="mt-1 font-semibold text-foreground">Circl Pty Ltd</p>
              <p className="mt-0.5 text-muted">ABN 12 345 678 901</p>
              <p className="mt-0.5 text-muted">Sydney, NSW</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-strong">
                Issued to (recipient of services)
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {recipientName}
              </p>
              <p className="mt-0.5 text-muted">ABN {state.trade.abn}</p>
              <p className="mt-0.5 text-muted">
                {state.trade.serviceArea.suburb} NSW
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-strong">
              For services on
            </p>
            <p className="mt-1 text-[14px] font-semibold">
              {job.cgNumber} · {job.type}
            </p>
            <p className="mt-1 text-xs text-muted">
              {job.customer.firstName} {job.customer.lastName} ·{" "}
              {job.customer.suburb} NSW {job.customer.postcode}
            </p>
            <p className="mt-1 text-xs text-muted">
              Work Order {job.workOrder} · {fmtDate(issuedDate)}
            </p>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <div className="space-y-1.5 text-[13px]">
              {gstRegistered ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted">Service fee</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">GST (10%)</span>
                    <span className="font-medium">${gst.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted">Service fee (no GST)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 text-[15px] font-bold">
                <span>Total</span>
                <span className="text-accent">${job.value.toFixed(2)}</span>
              </div>
              {!gstRegistered ? (
                <p className="mt-2 text-[11px] text-muted-strong">
                  This trade is not registered for GST (under the $75,000
                  threshold). No GST is collected on this invoice.
                </p>
              ) : null}
            </div>
          </div>

          {state.trade.bankAccount ? (
            <div className="mt-4 border-t border-border pt-4 text-[12px]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-strong">
                Settlement to
              </p>
              <p className="mt-1 font-medium">
                {state.trade.bankAccount.accountName}
              </p>
              <p className="text-muted">
                BSB {state.trade.bankAccount.bsb} · Account ••••
                {state.trade.bankAccount.accountNumber.slice(-4)}
              </p>
              {settlementDate ? (
                <p className="mt-1 text-muted">
                  Settled {fmtDate(settlementDate)}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-warn/40 bg-warn-soft p-3 text-[12px]">
              <p className="font-semibold text-warn">No bank account on file</p>
              <p className="mt-1 text-foreground/90">
                Payment is held until you add a bank account in the Money tab.
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="mt-5 px-5">
        <Button variant="secondary" onClick={handleShare}>
          Download PDF
        </Button>
        <p className="mt-3 text-center text-[11px] text-muted-strong">
          Circl generates this invoice on your behalf under the RCTI agreement.
        </p>
      </section>
    </main>
  );
}
