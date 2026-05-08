/**
 * Per-surface AI context generators.
 *
 * Each function consumes the current app state and returns a compact
 * context string that gets injected into the AskAI system prompt. The
 * AI responds based on what's in the context — no tool calls (Phase 1
 * decision; tool use is a future consideration per Greg's earlier
 * answer). This means the context generators must include everything
 * the AI might reasonably need to answer the questions in scope for
 * each surface.
 *
 * Question categories per the Pending Changes spec, mapped to surfaces:
 * - Home: next best action, missing info, planning the day, what's
 *   near me, compliance overview, today's earnings, pending decisions
 * - Find Jobs: eligibility (why can't I take this), best fit for
 *   skills, what pays best near me, available opportunities
 * - Job detail: prep, scope clarification, photo/document
 *   requirements, compliance for this job, missing info, invoice
 *   readiness, communication with Circl/customer (mocked — drafts
 *   only)
 *
 * Context strings stay under a few thousand tokens so prompt-cache
 * efficiency stays reasonable across repeated questions on the same
 * surface.
 */

import type {
  ComplianceDocument,
  Job,
  Opportunity,
  Trade,
} from "@/lib/types";
import { formatDateShort } from "@/lib/demo-data";

// ─── Helpers ─────────────────────────────────────────────────────────

function jobLine(j: Job): string {
  const date =
    j.dateOffsetDays === 0
      ? "today"
      : j.dateOffsetDays === 1
        ? "tomorrow"
        : j.dateOffsetDays > 0
          ? `+${j.dateOffsetDays} days`
          : `${-j.dateOffsetDays} days ago`;
  const status =
    j.status === "InProgress"
      ? "in progress"
      : j.status === "Completed"
        ? "completed"
        : `confirmed (attendance: ${j.attendance.toLowerCase()})`;
  const equipment =
    j.equipmentDeliveryStatus === "N/A"
      ? ""
      : ` · equipment: ${j.equipmentDeliveryStatus.toLowerCase()}`;
  return `${j.cgNumber} · ${j.type} · ${j.client} · ${j.customer.firstName} ${j.customer.lastName}, ${j.customer.suburb} · ${date} ${j.startTime} · $${j.value.toFixed(0)}${equipment} · ${status}`;
}

function complianceLine(d: ComplianceDocument): string {
  const expiry = d.expiresAt
    ? ` (expires ${formatDateShort(new Date(d.expiresAt))})`
    : "";
  return `${d.name} · ${d.status}${expiry}`;
}

function opportunityLine(o: Opportunity): string {
  const date =
    o.dateOffsetDays === 0
      ? "today"
      : o.dateOffsetDays === 1
        ? "tomorrow"
        : `+${o.dateOffsetDays} days`;
  const compliance = o.complianceRequired
    .map((c) => `${c.verified ? "✓" : "✗"} ${c.name}`)
    .join(", ");
  const urgent = o.urgent ? " · URGENT" : "";
  return `${o.suburb} · ${o.type} · ${date} ${o.timeOfDay} · $${o.value.toFixed(0)} · ${o.distanceKm.toFixed(1)}km${urgent} · compliance: ${compliance}`;
}

function tradeIntro(trade: Trade): string {
  return `Tradesperson: ${trade.fullName} (${trade.firstName}). Trading as: ${trade.tradingName ?? trade.fullName}. ABN: ${trade.abn}. Service area: ${trade.serviceArea.suburb} ${trade.serviceArea.postcode}, ${trade.serviceArea.radiusKm}km radius. Trade types: ${trade.tradeTypes.join(", ")}. Performance: ${(trade.onTimeRate * 100).toFixed(0)}% on-time, ${(trade.completionRate * 100).toFixed(0)}% completion. Tier: ${trade.tier}. Subscription: ${trade.subscription.tier} ($${trade.subscription.allocatedYTD} of $${trade.subscription.cap} allocated YTD). GST registered: ${trade.gstRegistered ? "yes" : "no"}.`;
}

function complianceSummary(docs: ComplianceDocument[]): string {
  const layer1 = docs.filter((d) => d.layer === 1);
  const opportunities = docs.filter((d) => d.layer === 2 || d.layer === 3);
  const lines: string[] = [];
  lines.push("Compliance currently held (Layer 1):");
  layer1.forEach((d) => lines.push(`- ${complianceLine(d)}`));
  if (opportunities.length > 0) {
    lines.push("Compliance opportunities (not yet held):");
    opportunities.forEach((d) =>
      lines.push(
        `- ${d.name}${d.unlocks ? ` — ${d.unlocks}` : ""}`,
      ),
    );
  }
  return lines.join("\n");
}

// ─── Context generators ──────────────────────────────────────────────

interface AppStateSlice {
  trade: Trade;
  jobs: Job[];
  opportunities: Opportunity[];
  hasTeam: boolean;
  team: { members: { id: string; name: string; role: string }[] };
}

/**
 * Home context — Brett's day at a glance + tomorrow + compliance.
 * Used by the prominent AskAI on the Home surface across all four
 * mode variants (the AI itself adapts answers based on what's in the
 * context, so we don't gate by mode here).
 */
export function homeContext(
  state: AppStateSlice,
  docs: ComplianceDocument[],
): string {
  const { trade } = state;
  const ownJobs = state.hasTeam
    ? state.jobs.filter((j) => !j.assignedToMemberId)
    : state.jobs;
  const today = ownJobs.filter((j) => j.dateOffsetDays === 0);
  const tomorrow = ownJobs.filter((j) => j.dateOffsetDays === 1);
  const recentCompleted = ownJobs
    .filter((j) => j.status === "Completed" && j.dateOffsetDays >= -7)
    .slice(0, 5);

  const todayValue = today.reduce((s, j) => s + j.value, 0);
  const tomorrowValue = tomorrow.reduce((s, j) => s + j.value, 0);
  const earnedToday = today
    .filter((j) => j.status === "Completed")
    .reduce((s, j) => s + j.value, 0);

  const nearbyOpps = state.opportunities
    .filter((o) => !o.outcome)
    .slice(0, 5);

  const pendingResponses = state.opportunities.filter(
    (o) => o.outcome === "awaiting",
  ).length;

  const sections: string[] = [];
  sections.push(tradeIntro(trade));

  if (trade.availability?.status === "paused") {
    sections.push(
      `AVAILABILITY: PAUSED${trade.availability.reason ? ` (reason: ${trade.availability.reason})` : ""}. Not receiving new opportunities. Existing accepted jobs continue as normal.`,
    );
  }

  sections.push(
    `Today (${today.length} jobs · $${todayValue.toFixed(0)} potential · $${earnedToday.toFixed(0)} earned so far):\n${today.map((j) => `- ${jobLine(j)}`).join("\n") || "- none"}`,
  );

  if (tomorrow.length > 0) {
    sections.push(
      `Tomorrow (${tomorrow.length} jobs · $${tomorrowValue.toFixed(0)}):\n${tomorrow.map((j) => `- ${jobLine(j)}`).join("\n")}`,
    );
  }

  if (recentCompleted.length > 0) {
    sections.push(
      `Recently completed:\n${recentCompleted.map((j) => `- ${jobLine(j)}`).join("\n")}`,
    );
  }

  sections.push(complianceSummary(docs));

  if (nearbyOpps.length > 0) {
    sections.push(
      `Available opportunities nearby:\n${nearbyOpps.map((o) => `- ${opportunityLine(o)}`).join("\n")}`,
    );
  }

  if (pendingResponses > 0) {
    sections.push(
      `${pendingResponses} opportunity ${pendingResponses === 1 ? "response is" : "responses are"} awaiting Circl's selection decision.`,
    );
  }

  return sections.join("\n\n");
}

/**
 * Job detail context — full information for one specific job. Used by
 * the per-job AskAI surface on /jobs/[id].
 */
export function jobContext(
  state: AppStateSlice,
  docs: ComplianceDocument[],
  jobId: string,
  flags: {
    sacDone: boolean;
    irDone: boolean;
    checkedIn: boolean;
  },
): string {
  const job = state.jobs.find((j) => j.id === jobId);
  if (!job) return tradeIntro(state.trade);

  const sections: string[] = [tradeIntro(state.trade)];

  const customer = `${job.customer.firstName} ${job.customer.lastName}`;
  const date =
    job.dateOffsetDays === 0
      ? "today"
      : job.dateOffsetDays === 1
        ? "tomorrow"
        : job.dateOffsetDays > 0
          ? `in ${job.dateOffsetDays} days`
          : `${-job.dateOffsetDays} days ago`;

  sections.push(
    `Job in focus:
- ${job.cgNumber} · Work order ${job.workOrder}
- ${job.type} for ${job.client}
- Customer: ${customer} (rating ${job.customer.rating})
- Address: ${job.customer.address}, ${job.customer.suburb} NSW ${job.customer.postcode}
- Customer phone: ${job.customer.phone}
- Scheduled: ${date} at ${job.startTime} (${job.timeOfDay})
- Estimated duration: ${job.estimatedDurationMinutes} minutes
- Value: $${job.value.toFixed(2)} (${state.trade.gstRegistered ? "GST inclusive" : "no GST"})
- Status: ${job.status}
- Attendance: ${job.attendance}
- Payment status: ${job.paymentStatus}${job.rctiNumber ? `\n- RCTI number: ${job.rctiNumber}` : ""}`,
  );

  sections.push(`Scope of work:\n${job.scope}`);

  if (job.serviceCodes && job.serviceCodes.length > 0) {
    sections.push(`Service codes: ${job.serviceCodes.join(", ")}`);
  }

  if (job.pickupLocation) {
    sections.push(
      `Equipment pickup: ${job.pickupLocation.name}, ${job.pickupLocation.address}`,
    );
  }

  if (job.equipmentDeliveryStatus !== "N/A") {
    const tracking = job.tracking
      ? ` Tracking: ${job.tracking.carrier} ${job.tracking.number} (${job.tracking.url})`
      : "";
    sections.push(
      `Equipment delivery: ${job.equipmentDeliveryStatus}.${tracking}`,
    );
  }

  if (job.complianceRequired.length > 0) {
    const lines = job.complianceRequired.map(
      (c) => `- ${c.name}: ${c.verified ? "verified" : "NOT VERIFIED"}`,
    );
    sections.push(`Compliance required for this job:\n${lines.join("\n")}`);
  }

  sections.push(
    `On-job progress:
- Checked in: ${flags.checkedIn ? "yes" : "no"}
- Site Arrival Checklist done: ${flags.sacDone ? "yes" : "no"}
- Installation Report done: ${flags.irDone ? "yes" : "no"}
- Job Complete eligible: ${flags.checkedIn && flags.sacDone && flags.irDone ? "yes" : "no"}`,
  );

  if (job.events && job.events.length > 0) {
    const events = job.events
      .map(
        (e) =>
          `- ${e.type} on ${formatDateShort(new Date(e.timestamp))}: ${e.reason}${e.note ? ` (${e.note})` : ""}`,
      )
      .join("\n");
    sections.push(`Job events:\n${events}`);
  }

  // Brett's compliance gaps that might affect this job
  const expiredOrMissing = docs.filter(
    (d) => d.status === "Expired" || d.status === "Not Started",
  );
  if (expiredOrMissing.length > 0) {
    sections.push(
      `Brett's compliance gaps that may affect job allocation:\n${expiredOrMissing.map((d) => `- ${d.name}: ${d.status}`).join("\n")}`,
    );
  }

  return sections.join("\n\n");
}

/**
 * Find Jobs context — the opportunity board summary plus Brett's
 * eligibility constraints. Powers questions like "why can't I take
 * this?" and "what's the best fit for my skills?".
 */
export function findJobsContext(
  state: AppStateSlice,
  docs: ComplianceDocument[],
): string {
  const sections: string[] = [tradeIntro(state.trade)];

  if (state.trade.availability?.status === "paused") {
    sections.push(
      "AVAILABILITY: PAUSED. Brett is not currently being matched to new opportunities. Existing accepted jobs continue.",
    );
  }

  const available = state.opportunities.filter((o) => !o.outcome);
  const totalValue = available.reduce((s, o) => s + o.value, 0);

  sections.push(
    `Opportunity board summary: ${available.length} jobs available, total value $${totalValue.toFixed(0)}.`,
  );

  // Group by trade type
  const byType = new Map<string, Opportunity[]>();
  available.forEach((o) => {
    const arr = byType.get(o.type) ?? [];
    arr.push(o);
    byType.set(o.type, arr);
  });
  const typeBreakdown = Array.from(byType.entries())
    .map(([type, opps]) => `- ${type}: ${opps.length}`)
    .join("\n");
  sections.push(`Available by type:\n${typeBreakdown}`);

  // Compliance gaps that gate eligibility
  const gaps = docs.filter(
    (d) => d.status === "Expired" || (d.layer === 1 && d.status === "Not Started"),
  );
  if (gaps.length > 0) {
    sections.push(
      `Compliance gaps that may filter Brett out of some opportunities:\n${gaps.map((d) => `- ${d.name}: ${d.status}`).join("\n")}`,
    );
  }

  // List top 10 opportunities sorted by distance
  const top = [...available]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);
  sections.push(
    `Closest 10 opportunities:\n${top.map((o) => `- ${opportunityLine(o)}`).join("\n")}`,
  );

  // Recent response history
  const responded = state.opportunities.filter((o) => o.outcome);
  if (responded.length > 0) {
    sections.push(
      `Recent responses: ${responded.length} ${responded.length === 1 ? "opportunity" : "opportunities"} ${responded.length === 1 ? "has" : "have"} been responded to (${state.opportunities.filter((o) => o.outcome === "awaiting").length} awaiting decision, ${state.opportunities.filter((o) => o.outcome === "selected").length} selected, ${state.opportunities.filter((o) => o.outcome === "not-selected").length} not selected).`,
    );
  }

  // Compliance opportunity framing — the "could be earning more" lens
  const opportunities = docs.filter(
    (d) => (d.layer === 2 || d.layer === 3) && d.unlocks,
  );
  if (opportunities.length > 0) {
    sections.push(
      `Compliance Brett doesn't have but could pursue (each unlocks more work):\n${opportunities.map((d) => `- ${d.name}: ${d.unlocks}`).join("\n")}`,
    );
  }

  // Helper note
  sections.push(
    `When the trade asks "why can't I take this?", explain in plain language which compliance item is missing or which constraint applies. When asked about earning potential, frame compliance gaps as opportunities (the "could be earning more" framing) rather than as shortcomings.`,
  );

  return sections.join("\n\n");
}
