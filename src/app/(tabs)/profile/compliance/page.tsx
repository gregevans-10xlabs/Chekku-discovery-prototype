"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { getComplianceDocs } from "@/lib/demo-data";
import type { ComplianceDocument } from "@/lib/types";

const COMPLIANCE_LAYERS: { id: 1 | 2 | 3; title: string; hint: string }[] = [
  { id: 1, title: "Required to work", hint: "Mandatory" },
  { id: 2, title: "Unlocks more work", hint: "Client-specific" },
  { id: 3, title: "Specialist", hint: "Job-type-specific" },
];

export default function ComplianceVaultPage() {
  const router = useRouter();
  const docs = getComplianceDocs();

  return (
    <main className="pb-8">
      <PageHeader
        title="Compliance vault"
        subtitle="Your documents, organised by layer"
        back
        onBack={() => router.push("/profile")}
      />

      <section className="px-5 pt-4">
        {COMPLIANCE_LAYERS.map((layer) => {
          const layerDocs = docs.filter((d) => d.layer === layer.id);
          if (layerDocs.length === 0) return null;
          return (
            <div key={layer.id} className="mb-6 last:mb-0">
              <div className="mb-1.5 flex items-baseline justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-strong">
                  {layer.title}
                </h3>
                <span className="text-[10px] text-muted-strong">
                  {layer.hint}
                </span>
              </div>
              <div className="space-y-2">
                {layerDocs.map((d) => (
                  <ComplianceRow key={d.id} doc={d} />
                ))}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface py-3 text-sm font-semibold text-muted hover:text-foreground"
          style={{ minHeight: 44 }}
        >
          + Upload new document
        </button>
      </section>
    </main>
  );
}

function ComplianceRow({ doc }: { doc: ComplianceDocument }) {
  const tone =
    doc.status === "Active"
      ? "success"
      : doc.status === "Expiring Soon"
        ? "warn"
        : doc.status === "Expired"
          ? "danger"
          : "neutral";
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">{doc.name}</p>
          {doc.expiresAt ? (
            <p className="mt-0.5 text-xs text-muted">
              Expires{" "}
              {new Date(doc.expiresAt).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          ) : null}
          {doc.unlocks ? (
            <p className="mt-1.5 text-[12px] font-medium text-accent">
              🔓 {doc.unlocks}
            </p>
          ) : null}
        </div>
        <Badge tone={tone}>{doc.status}</Badge>
      </div>
      {doc.status === "Not Started" || doc.status === "Expiring Soon" ? (
        <button
          type="button"
          className="mt-3 w-full rounded-xl border border-border-strong bg-surface-2 py-2 text-sm font-semibold text-foreground"
          style={{ minHeight: 40 }}
        >
          {doc.status === "Not Started" ? "Start" : "Renew now"}
        </button>
      ) : null}
    </div>
  );
}
