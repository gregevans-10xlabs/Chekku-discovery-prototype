import type {
  ComplianceDocument,
  ComplianceStatus,
  Job,
  Opportunity,
  Team,
  Trade,
} from "./types";
import { TRADES as CORETECHX_TRADES } from "./coretechx-data/trades";

// ---------- Cross-app trade record ----------
// Brett Sandford / Sandbar Electrical Services is the demo trade. The
// canonical record lives in Mission Control's vendored trades.ts; we
// derive Brett's identity, performance, and compliance from there so
// when Aaron sees Sandbar in MC and then opens Chekku, every cross-
// referenced detail matches. Chekku-specific fields (subscription,
// bank account, payment method, Chekku-side tier) are hardcoded here
// because MC's trade record doesn't carry them.
const SANDBAR = CORETECHX_TRADES.find((t) => t.id === "sandbar-electrical");
if (!SANDBAR) {
  // Fail loud during build/dev — vendored data is broken and the rest
  // of this file relies on Sandbar being present.
  throw new Error(
    "Sandbar Electrical Services trade record missing from vendored " +
      "coretechx-data/trades.ts — run the SYNC.md re-vendor protocol.",
  );
}

// "Brett Sandford · 0421 ··· ···" → { fullName, firstName }
function parseContact(contact: string | undefined): {
  fullName: string;
  firstName: string;
} {
  const beforeBullet = (contact ?? "").split("·")[0]?.trim() ?? "Brett Sandford";
  const fullName = beforeBullet || "Brett Sandford";
  const firstName = fullName.split(/\s+/)[0] || "Brett";
  return { fullName, firstName };
}

// All dates are computed from TODAY at runtime so the demo never goes stale.
export const TODAY = new Date();

function offsetDate(days: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export function formatDateWithDay(d: Date): string {
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function relativeDayLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return formatDateWithDay(offsetDate(days));
}

export function daysUntil(d: Date): number {
  const a = new Date(TODAY);
  a.setHours(0, 0, 0, 0);
  const b = new Date(d);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function dateForOffset(days: number): Date {
  return offsetDate(days);
}

// Days from TODAY to the nth-of-month that's `monthsAhead` from TODAY's month.
// Used to anchor demo jobs to specific calendar positions (e.g. "the 15th of
// next month") so the calendar view always shows content even if TODAY drifts.
function offsetToMonthDay(monthsAhead: number, day: number): number {
  const target = new Date(
    TODAY.getFullYear(),
    TODAY.getMonth() + monthsAhead,
    day,
  );
  return daysUntil(target);
}

// Tailwind class for a density indicator dot based on job count on a day.
// Matches the Trade App reference: 1 job = blue, 2-3 = orange, 4+ = red.
export function densityColorClass(count: number): string {
  if (count <= 0) return "";
  if (count === 1) return "bg-info";
  if (count <= 3) return "bg-warn";
  return "bg-danger";
}

// Parse a job startTime string ("9:00 AM", "2:30 PM") to minutes since midnight.
// Used for sorting jobs within a day across multiple list views.
export function startTimeToMinutes(s: string): number {
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

// ---------- Trade persona ----------
// Brett Sandford runs Sandbar Electrical Services on the NSW Mid North
// Coast — antenna installer specialty with electrical capability. He's
// the demo trade for both prototypes; identity is derived from MC's
// canonical record so cross-app cross-references stay aligned.
const { fullName: BRETT_NAME, firstName: BRETT_FIRST } = parseContact(
  SANDBAR.primaryContact,
);

export const BRETT: Trade = {
  fullName: BRETT_NAME,
  firstName: BRETT_FIRST,
  // MC anonymises with "0421 ··· ···"; for Chekku the phone needs to
  // render fully so we hardcode a synthetic Australian mobile that
  // matches the area-prefix MC partially exposed.
  phone: "0421 837 462",
  abn: SANDBAR.abn ?? "12 345 678 901",
  tradeTypes: ["Starlink Installation", "TV / AV Installation"],
  // Sandbar's region in MC is "NSW Mid North Coast (2428–2440)".
  // Forster (2428) is the corridor anchor — within 100km radius covers
  // the whole strip from Bulahdelah to Coffs Harbour fringe.
  serviceArea: { suburb: "Forster", postcode: "2428", radiusKm: 100 },
  language: "English",
  // Tier mapped from MC performance: 86% on-time, 94% completion,
  // 3.9 customer rating, 1 complaint in 90 days → Silver. Gold would
  // require ≥95% on-time and ≥4.5 rating.
  tier: "Silver",
  // Established trade on the Year subscription — Aaron's mid-tier
  // ($518/year guaranteeing $10,000). Brett's real-data narrative is
  // a working trade with steady volume, not a free-tier newcomer.
  subscription: {
    tier: "Year",
    label: "Year tier — $7,200 of $10,000 allocated this year",
    allocatedYTD: 7200,
    cap: 10000,
  },
  onTimeRate: SANDBAR.performance.onTime,
  completionRate: SANDBAR.performance.completion,
  reschedulePeerPercentile: "On par with area peers",
  bankAccount: {
    accountName: "Sandbar Electrical Services Pty Ltd",
    bsb: "082-401",
    accountNumber: "76483921",
  },
  paymentMethod: {
    brand: "Visa",
    last4: "9128",
    expiry: "11/27",
  },
  gstRegistered: true,
  tradingName: SANDBAR.name,
};

// Backwards-compat alias — many imports still reference `JAKE`. New
// consumers should use BRETT directly. Remove once Phase 2 completes
// the per-screen rebuild and we can rename imports cleanly.
export const JAKE = BRETT;

// ---------- Compliance ----------
// Layer 1 items mirror Sandbar's actual MC compliance record verbatim.
// SWMS is the demo's primary jeopardy hook — outstanding in MC means
// expired in Chekku, with a clear "fix me" CTA. The Layer 2 / 3 items
// below are Chekku-specific opportunities (the "could be earning more"
// framing) — compliance Brett DOESN'T have but could pursue to unlock
// new work types. They aren't in MC because MC only models compliance
// the trade currently holds.
const MONTH_INDEX: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

const SANDBAR_LAYER_1: ComplianceDocument[] = SANDBAR.compliance.map((c) => {
  let status: ComplianceStatus;
  switch (c.status) {
    case "valid":
      status = "Active";
      break;
    case "expiring":
      status = "Expiring Soon";
      break;
    case "expired":
    case "outstanding":
      status = "Expired";
      break;
  }
  // MC carries human-friendly expiry strings ("Mar 2027", "Jul 2026").
  // Chekku stores ISO dates so date-arithmetic in expiry banners works.
  let expiresAt: string | undefined;
  const m = c.expiry ? /^(\w{3})\s+(\d{4})$/.exec(c.expiry) : null;
  if (m && MONTH_INDEX[m[1]] !== undefined) {
    expiresAt = new Date(
      parseInt(m[2], 10),
      MONTH_INDEX[m[1]],
      15,
    ).toISOString();
  }
  // Test & Tag is flagged in MC with `detail: "Due for renewal"` —
  // Chekku surfaces that as Expiring Soon regardless of expiry-date math.
  if (c.detail === "Due for renewal" && status === "Active") {
    status = "Expiring Soon";
  }
  return {
    id: c.type,
    name: c.label,
    status,
    expiresAt,
    layer: 1 as const,
  };
});

// Layer 2 / 3 — Chekku-specific opportunity framing. These reflect work
// types Brett could pursue but hasn't yet. Aaron's "compliance is
// obviously profitable" principle in action: each gap names a dollar
// figure for completing it.
const SANDBAR_OPPORTUNITY: ComplianceDocument[] = [
  {
    id: "arc-refrigeration",
    name: "ARC Refrigeration Trading Authorisation",
    status: "Not Started",
    unlocks:
      "Unlocks 23 HVAC jobs in your area — ~$8,000/month based on current demand",
    layer: 2,
  },
  {
    id: "first-aid",
    name: "First Aid Certificate (HLTAID011)",
    status: "Not Started",
    unlocks:
      "Complete First Aid to unlock $12,400 of Harvey Norman work in your area",
    layer: 2,
  },
  {
    id: "insurance-coc",
    name: "Insurance Code of Conduct (CIIC)",
    status: "Not Started",
    unlocks:
      "Complete to unlock ~$18,000 of insurance repair work in your area",
    layer: 3,
  },
];

export function getComplianceDocs(): ComplianceDocument[] {
  return [...SANDBAR_LAYER_1, ...SANDBAR_OPPORTUNITY];
}

// ---------- Scope templates ----------
// Mirrors the scope text format used in Circl's current Trade App.
// Harvey Norman jobs are SKU-based (short, code-prefixed lines).
// Starlink jobs are a structured, verbose breakdown by install phase.

const HN_SCOPE_FULL = `Installation Details:

CONCP - Concealment Plaster/Wood
TVWMLL - Wall mount 75" to 86" (excluding concealment)
PREM SBS - Premium soundbar setup (eg SONOS)`;

const HN_SCOPE_TV_CONCEAL = `Installation Details:

CONCP - Concealment Plaster/Wood
TVWMLL - Wall mount 75" to 86" (excluding concealment)`;

const HN_SCOPE_TV_SOUNDBAR = `Installation Details:

TVWMLL - Wall mount 75" to 86" (excluding concealment)
PREM SBS - Premium soundbar setup (eg SONOS)`;

const HN_SCOPE_XL = `Installation Details:

TVWMXL - Wall Mount - 90" to 100" (excluding concealment)
CONCC - Concealment in conduit on Brick or where no cavity exists behind plaster/wood)`;

const STARLINK_CANONICAL = `Installation Details:

Roof Mounted Install - Single Story Residential Home

Preliminaries

Site Access/Induction/JSEA/Work Area Set-Up
Install Starlink Dish

Assess optimal location for Installation - Obtain Customer Approval
Unboxing, Inspection, & Removal of packaging to client bin
Mount the dish securely using the appropriate fixtures for property type
Route Cables from dish to interior equipment
Set Up the Starlink Router & Connect to existing power
Leave work area clean and tidy
Completion

Configure & Activate device with client supplied credentials
Test the internet connection
Basic Customer Tutorial (max 5 mins)
Completion artefacts
Additional cable (45m) install only`;

const STARLINK_WALL_MOUNT = `Installation Details:

Wall Mounted Install - Single Story Residential Home

Preliminaries

Site Access/Induction/JSEA/Work Area Set-Up
Install Starlink Dish

Assess optimal location for Installation - Obtain Customer Approval
Unboxing, Inspection, & Removal of packaging to client bin
Mount the dish securely using the appropriate fixtures for property type
Route Cables from dish to interior equipment
Set Up the Starlink Router & Connect to existing power
Leave work area clean and tidy
Completion

Configure & Activate device with client supplied credentials
Test the internet connection
Basic Customer Tutorial (max 5 mins)
Completion artefacts`;

const STARLINK_COMPLEX = `Installation Details:

Roof Mounted Install - Double Story Residential Home

Preliminaries

Site Access/Induction/JSEA/Work Area Set-Up
Install Starlink Dish

Assess optimal location for Installation - Obtain Customer Approval
Unboxing, Inspection, & Removal of packaging to client bin
Mount the dish securely using the appropriate fixtures for property type
Route Cables from dish to interior equipment
Set Up the Starlink Router & Connect to existing power
Leave work area clean and tidy
Completion

Configure & Activate device with client supplied credentials
Test the internet connection
Basic Customer Tutorial (max 5 mins)
Completion artefacts
Additional cable (45m) install only`;

// ---------- Jobs ----------
export function getJobs(): Job[] {
  return [
    // ---- TODAY (4 jobs in time order) ----
    {
      id: "CG48952",
      cgNumber: "CG48952",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Sarah",
        lastName: "Patel",
        phone: "0408 112 334",
        address: "42 Sunrise Boulevard",
        suburb: "Forster",
        postcode: "2428",
        rating: 4.8,
      },
      workOrder: "WO-47911",
      scope: STARLINK_CANONICAL,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 0,
      timeOfDay: "Morning",
      startTime: "9:00 AM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      tracking: {
        carrier: "StarTrack",
        number: "AS70348291",
        url: "https://startrack.com.au/track-trace/?id=AS70348291",
      },
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
    },
    {
      id: "CG48953",
      cgNumber: "CG48953",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "James",
        lastName: "Henderson",
        phone: "0405 882 119",
        address: "8 Beach Street",
        suburb: "Pacific Palms",
        postcode: "2428",
        rating: 4.7,
      },
      workOrder: "WO-47915",
      scope: HN_SCOPE_TV_CONCEAL,
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: 0,
      timeOfDay: "Morning",
      startTime: "11:30 AM",
      value: 245.0,
      estimatedDurationMinutes: 75,
      pickupLocation: {
        name: "Harvey Norman Taree",
        address: "16 Manning St, Taree NSW 2430",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
    },
    {
      // Cross-app shared job — also visible in Mission Control as the
      // SWMS-flagged decision in Logan's queue. Customer / suburb /
      // value / type all align with MC's record so Aaron sees the
      // same job in both apps.
      id: "CG36110",
      cgNumber: "CG36110",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Bianca",
        lastName: "Ferreira",
        phone: "0413 220 884",
        address: "27 Bay View Crescent",
        suburb: "Coomba Bay",
        postcode: "2428",
        rating: 4.7,
      },
      workOrder: "WO-36110",
      scope: STARLINK_WALL_MOUNT,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 0,
      timeOfDay: "Afternoon",
      startTime: "1:30 PM",
      value: 359,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      tracking: {
        carrier: "StarTrack",
        number: "AS70348415",
        url: "https://startrack.com.au/track-trace/?id=AS70348415",
      },
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
        // SWMS gap is the demo hook — flagged here as not-verified.
        // Logan sees it as the decision-required signal in MC; Brett
        // sees it as the "fix me" CTA on Compliance and Heads up.
        { name: "Safe Work Method Statement", verified: false },
      ],
    },
    {
      id: "CG48955",
      cgNumber: "CG48955",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Michael",
        lastName: "Tran",
        phone: "0421 778 091",
        address: "14 Wallabi Drive",
        suburb: "Krambach",
        postcode: "2430",
        rating: 4.5,
      },
      workOrder: "WO-47922",
      scope: HN_SCOPE_TV_SOUNDBAR,
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: 0,
      timeOfDay: "Afternoon",
      startTime: "4:30 PM",
      value: 185.0,
      estimatedDurationMinutes: 60,
      pickupLocation: {
        name: "Harvey Norman Taree",
        address: "16 Manning St, Taree NSW 2430",
      },
      equipmentDeliveryStatus: "N/A",
      // Pre-set to InProgress so Tom's team visibility surfaces a job
      // mid-flight (Brett oversees, Tom executes).
      status: "InProgress",
      paymentStatus: "Not Applicable",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
      assignedToMemberId: "TM-1",
    },
    // ---- PAST (yesterday + last 10 days) ----
    {
      id: "CG48403",
      cgNumber: "CG48403",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Greg",
        lastName: "Gilroy",
        phone: "0411 900 211",
        address: "12 Manning Street",
        suburb: "Tuncurry",
        postcode: "2428",
        rating: 4.6,
      },
      workOrder: "WO-47622",
      scope: HN_SCOPE_FULL,
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: -1,
      timeOfDay: "Morning",
      startTime: "10:00 AM",
      value: 185.0,
      estimatedDurationMinutes: 75,
      pickupLocation: {
        name: "Harvey Norman Taree",
        address: "16 Manning St, Taree NSW 2430",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Completed",
      paymentStatus: "Payment Processing",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
      rctiNumber: "RCTI-26-04582",
    },
    {
      id: "CG48295",
      cgNumber: "CG48295",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "David",
        lastName: "Tyrell",
        phone: "0407 998 220",
        address: "9 Hall Street",
        suburb: "Forster",
        postcode: "2428",
        rating: 4.8,
      },
      workOrder: "WO-47803",
      scope: STARLINK_CANONICAL,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: -3,
      timeOfDay: "Morning",
      startTime: "10:00 AM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      status: "Completed",
      paymentStatus: "Settled",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
      rctiNumber: "RCTI-26-04561",
    },
    {
      id: "CG48201",
      cgNumber: "CG48201",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Rebecca",
        lastName: "Ramsey",
        phone: "0419 005 117",
        address: "31 Carrington Road",
        suburb: "Pacific Palms",
        postcode: "2428",
        rating: 4.6,
      },
      workOrder: "WO-47655",
      scope: STARLINK_CANONICAL,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: -5,
      timeOfDay: "Afternoon",
      startTime: "1:30 PM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      status: "Completed",
      paymentStatus: "Settled",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
      rctiNumber: "RCTI-26-04528",
    },
    {
      id: "CG48133",
      cgNumber: "CG48133",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Tom",
        lastName: "Brennan",
        phone: "0432 887 102",
        address: "44 King Street",
        suburb: "Cundletown",
        postcode: "2430",
        rating: 4.4,
      },
      workOrder: "WO-47511",
      scope: HN_SCOPE_XL,
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: -7,
      timeOfDay: "Morning",
      startTime: "10:30 AM",
      value: 215.0,
      estimatedDurationMinutes: 75,
      pickupLocation: {
        name: "Harvey Norman Taree",
        address: "16 Manning St, Taree NSW 2430",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Completed",
      paymentStatus: "Settled",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
      rctiNumber: "RCTI-26-04492",
    },
    {
      id: "CG48081",
      cgNumber: "CG48081",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Emily",
        lastName: "Roper",
        phone: "0411 663 220",
        address: "12 Illawarra Road",
        suburb: "Smiths Lake",
        postcode: "2428",
        rating: 4.9,
      },
      workOrder: "WO-47402",
      scope: HN_SCOPE_TV_CONCEAL,
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: -9,
      timeOfDay: "Afternoon",
      startTime: "3:00 PM",
      value: 185.0,
      estimatedDurationMinutes: 60,
      pickupLocation: {
        name: "Harvey Norman Taree",
        address: "16 Manning St, Taree NSW 2430",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Completed",
      // Action Required example for the Money tab demo — customer hasn't
      // confirmed the post-departure satisfaction prompt, so the RCTI is
      // held for resolution.
      paymentStatus: "Action Required",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
      rctiNumber: "RCTI-26-04461",
    },
    {
      id: "CG48050",
      cgNumber: "CG48050",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Nathan",
        lastName: "Wilson",
        phone: "0426 318 990",
        address: "5 MacPherson Street",
        suburb: "Tuncurry",
        postcode: "2428",
        rating: 4.7,
      },
      workOrder: "WO-47301",
      scope: STARLINK_CANONICAL,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: -10,
      timeOfDay: "Morning",
      startTime: "9:00 AM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      status: "Completed",
      paymentStatus: "Settled",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
      rctiNumber: "RCTI-26-04440",
    },
    // ---- TOMORROW (3 jobs) ----
    {
      id: "CG49001",
      cgNumber: "CG49001",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Patricia",
        lastName: "Costas",
        phone: "0417 550 881",
        address: "12 Harbour View",
        suburb: "Taree",
        postcode: "2430",
        rating: 4.9,
      },
      workOrder: "WO-48011",
      scope: STARLINK_WALL_MOUNT,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 1,
      timeOfDay: "Morning",
      startTime: "9:30 AM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Not Yet Received",
      tracking: {
        carrier: "StarTrack",
        number: "AS70348562",
        url: "https://startrack.com.au/track-trace/?id=AS70348562",
      },
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
      assignedToMemberId: "TM-1",
    },
    {
      id: "CG49002",
      cgNumber: "CG49002",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Alex",
        lastName: "Gilbey",
        phone: "0422 766 109",
        address: "88 Greenfield Lane",
        suburb: "Wingham",
        postcode: "2430",
        rating: 4.7,
      },
      workOrder: "WO-48019",
      scope: HN_SCOPE_FULL,
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: 1,
      timeOfDay: "Afternoon",
      startTime: "2:00 PM",
      value: 265.0,
      estimatedDurationMinutes: 90,
      pickupLocation: {
        name: "Harvey Norman Taree",
        address: "16 Manning St, Taree NSW 2430",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
    },
    {
      id: "CG49003",
      cgNumber: "CG49003",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Olivia",
        lastName: "Phelps",
        phone: "0438 116 552",
        address: "73 Crown Street",
        suburb: "Stroud",
        postcode: "2430",
        rating: 4.8,
      },
      workOrder: "WO-48028",
      scope: STARLINK_CANONICAL,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 1,
      timeOfDay: "Afternoon",
      startTime: "4:00 PM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      tracking: {
        carrier: "StarTrack",
        number: "AS70348711",
        url: "https://startrack.com.au/track-trace/?id=AS70348711",
      },
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
    },
    // ---- LATER (next few weeks, exercises calendar nav) ----
    {
      id: "CG49101",
      cgNumber: "CG49101",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Harper",
        lastName: "Fielding",
        phone: "0413 778 990",
        address: "11 Glebe Point Road",
        suburb: "Old Bar",
        postcode: "2430",
        rating: 4.6,
      },
      workOrder: "WO-48101",
      scope: STARLINK_CANONICAL,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: offsetToMonthDay(1, 5),
      timeOfDay: "Morning",
      startTime: "10:00 AM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
    },
    {
      id: "CG49108",
      cgNumber: "CG49108",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Logan",
        lastName: "Adcock",
        phone: "0421 003 184",
        address: "8 Smith Street",
        suburb: "Hawks Nest",
        postcode: "2428",
        rating: 4.7,
      },
      workOrder: "WO-48114",
      scope: HN_SCOPE_TV_SOUNDBAR,
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: offsetToMonthDay(1, 15),
      timeOfDay: "Afternoon",
      startTime: "1:30 PM",
      value: 245.0,
      estimatedDurationMinutes: 75,
      pickupLocation: {
        name: "Harvey Norman Taree",
        address: "16 Manning St, Taree NSW 2430",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
    },
    {
      id: "CG49115",
      cgNumber: "CG49115",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Grace",
        lastName: "Halloway",
        phone: "0408 552 901",
        address: "22 Park Avenue",
        suburb: "Bulahdelah",
        postcode: "2428",
        rating: 4.9,
      },
      workOrder: "WO-48127",
      scope: STARLINK_COMPLEX,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: offsetToMonthDay(1, 25),
      timeOfDay: "Morning",
      startTime: "9:00 AM",
      value: 365.0,
      estimatedDurationMinutes: 120,
      equipmentDeliveryStatus: "Delivered",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
    },
    {
      id: "CG49122",
      cgNumber: "CG49122",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Ben",
        lastName: "Marsh",
        phone: "0419 220 117",
        address: "47 Bower Street",
        suburb: "Hawks Nest",
        postcode: "2428",
        rating: 4.7,
      },
      workOrder: "WO-48140",
      scope: STARLINK_CANONICAL,
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: offsetToMonthDay(2, 10),
      timeOfDay: "Afternoon",
      startTime: "2:00 PM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
    },
    {
      id: "CG49130",
      cgNumber: "CG49130",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Sienna",
        lastName: "Whittingham",
        phone: "0432 119 887",
        address: "61 Norton Street",
        suburb: "Wallabi Point",
        postcode: "2430",
        rating: 4.6,
      },
      workOrder: "WO-48155",
      scope: HN_SCOPE_FULL,
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: offsetToMonthDay(2, 20),
      timeOfDay: "Morning",
      startTime: "11:00 AM",
      value: 245.0,
      estimatedDurationMinutes: 90,
      pickupLocation: {
        name: "Harvey Norman Taree",
        address: "16 Manning St, Taree NSW 2430",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
    },
  ];
}

// ---------- Opportunities ----------
// Two canonical opportunities Aaron interacts with during the demo,
// plus ~40 generated background opportunities to convey real volume.
const STARLINK_COMPLIANCE = [
  { name: "Electrical Contractor Licence", verified: true },
  { name: "Working at Heights", verified: true },
];
const TVAV_COMPLIANCE = [{ name: "Working at Heights", verified: true }];

const OPPORTUNITY_FILLERS: Array<{
  suburb: string;
  distanceKm: number;
  type: "Starlink Installation" | "TV/AV Installation";
  dayOffset: number;
  timeOfDay: "Morning" | "Afternoon" | "Evening";
  value: number;
  customer: { firstName: string; lastNameInitial: string; rating: number };
  scope: string;
  urgent?: boolean;
  longerJobHint?: string;
  // For demo realism: a couple of opportunities the trade has already
  // responded to and is awaiting Circl's decision on.
  outcome?: "awaiting" | "selected" | "not-selected";
  responded?: { mode: "accept" | "propose-date" | "propose-rate"; value: number };
}> = [
  // Today (extra fills, beyond OP-9011)
  { suburb: "Pacific Palms", distanceKm: 2.4, type: "Starlink Installation", dayOffset: 0, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Aiden", lastNameInitial: "M", rating: 4.6 }, scope: "Standard Starlink residential installation — apartment balcony mount." },
  { suburb: "Old Bar", distanceKm: 2.5, type: "TV/AV Installation", dayOffset: 0, timeOfDay: "Evening", value: 195, customer: { firstName: "Sophia", lastNameInitial: "L", rating: 4.8 }, scope: "55″ TV wall mount, brick wall — masonry anchors required.", urgent: true },
  { suburb: "Tuncurry", distanceKm: 3.0, type: "Starlink Installation", dayOffset: 0, timeOfDay: "Evening", value: 320, customer: { firstName: "Marcus", lastNameInitial: "B", rating: 4.5 }, scope: "Standard Starlink residential installation." },
  // +1 day (this week)
  { suburb: "Hawks Nest", distanceKm: 4.6, type: "TV/AV Installation", dayOffset: 1, timeOfDay: "Morning", value: 215, customer: { firstName: "Hannah", lastNameInitial: "F", rating: 4.7 }, scope: "65″ TV wall mount + soundbar.", outcome: "awaiting", responded: { mode: "accept", value: 215 } },
  { suburb: "Smiths Lake", distanceKm: 4.0, type: "Starlink Installation", dayOffset: 1, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Daniel", lastNameInitial: "S", rating: 4.9 }, scope: "Standard Starlink residential installation." },
  { suburb: "Bulahdelah", distanceKm: 4.0, type: "TV/AV Installation", dayOffset: 1, timeOfDay: "Afternoon", value: 185, customer: { firstName: "Chloe", lastNameInitial: "P", rating: 4.6 }, scope: "55″ TV wall mount + cable concealment." },
  { suburb: "Coomba Bay", distanceKm: 7.2, type: "Starlink Installation", dayOffset: 1, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Ethan", lastNameInitial: "W", rating: 4.4 }, scope: "Standard Starlink residential installation." },
  // +2 days
  { suburb: "Pacific Palms", distanceKm: 5.4, type: "Starlink Installation", dayOffset: 2, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Mia", lastNameInitial: "K", rating: 4.8 }, scope: "Standard Starlink residential installation — chimney mount." },
  { suburb: "Krambach", distanceKm: 5.8, type: "TV/AV Installation", dayOffset: 2, timeOfDay: "Morning", value: 215, customer: { firstName: "Lucas", lastNameInitial: "G", rating: 4.5 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Smiths Lake", distanceKm: 6.1, type: "Starlink Installation", dayOffset: 2, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Isabella", lastNameInitial: "H", rating: 4.7 }, scope: "Standard Starlink residential installation." },
  { suburb: "Wingham", distanceKm: 4.2, type: "TV/AV Installation", dayOffset: 2, timeOfDay: "Afternoon", value: 245, customer: { firstName: "Henry", lastNameInitial: "J", rating: 4.8 }, scope: "65″ TV wall mount + cable concealment behind plaster." },
  { suburb: "Bulahdelah", distanceKm: 7.4, type: "Starlink Installation", dayOffset: 2, timeOfDay: "Evening", value: 338.8, customer: { firstName: "Eva", lastNameInitial: "C", rating: 4.9 }, scope: "Standard Starlink residential installation." },
  // +3 days
  { suburb: "Old Bar", distanceKm: 8.8, type: "TV/AV Installation", dayOffset: 3, timeOfDay: "Morning", value: 185, customer: { firstName: "Oliver", lastNameInitial: "D", rating: 4.6 }, scope: "55″ TV wall mount." },
  { suburb: "Taree", distanceKm: 10.0, type: "Starlink Installation", dayOffset: 3, timeOfDay: "Morning", value: 320, customer: { firstName: "Ava", lastNameInitial: "T", rating: 4.7 }, scope: "Standard Starlink residential installation — apartment balcony." },
  { suburb: "Cundletown", distanceKm: 9.6, type: "TV/AV Installation", dayOffset: 3, timeOfDay: "Afternoon", value: 215, customer: { firstName: "Jacob", lastNameInitial: "R", rating: 4.5 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Wallabi Point", distanceKm: 11.2, type: "Starlink Installation", dayOffset: 3, timeOfDay: "Afternoon", value: 338.8, customer: { firstName: "Charlotte", lastNameInitial: "Y", rating: 4.8 }, scope: "Standard Starlink residential installation." },
  { suburb: "Wingham", distanceKm: 12.5, type: "TV/AV Installation", dayOffset: 3, timeOfDay: "Evening", value: 195, customer: { firstName: "Liam", lastNameInitial: "Z", rating: 4.4 }, scope: "55″ TV wall mount + cable tidy." },
  // +4 days
  { suburb: "Hawks Nest", distanceKm: 12.0, type: "Starlink Installation", dayOffset: 4, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Zoe", lastNameInitial: "A", rating: 4.9 }, scope: "Standard Starlink residential installation — sea spray site, marine bracket." },
  { suburb: "Stroud", distanceKm: 10.8, type: "TV/AV Installation", dayOffset: 4, timeOfDay: "Morning", value: 185, customer: { firstName: "Noah", lastNameInitial: "B", rating: 4.5 }, scope: "55″ TV wall mount." },
  { suburb: "Cundletown", distanceKm: 14.5, type: "Starlink Installation", dayOffset: 4, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Mila", lastNameInitial: "X", rating: 4.6 }, scope: "Standard Starlink residential installation." },
  { suburb: "Wallabi Point", distanceKm: 13.5, type: "TV/AV Installation", dayOffset: 4, timeOfDay: "Afternoon", value: 245, customer: { firstName: "Levi", lastNameInitial: "Q", rating: 4.7 }, scope: "65″ TV wall mount + cable concealment." },
  // +5 days (alongside OP-9014)
  { suburb: "Hawks Nest", distanceKm: 16.3, type: "Starlink Installation", dayOffset: 5, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Ruby", lastNameInitial: "M", rating: 4.8 }, scope: "Standard Starlink residential installation.", outcome: "awaiting", responded: { mode: "propose-rate", value: 365 } },
  { suburb: "Krambach", distanceKm: 13.4, type: "TV/AV Installation", dayOffset: 5, timeOfDay: "Afternoon", value: 215, customer: { firstName: "Mason", lastNameInitial: "V", rating: 4.6 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Wingham", distanceKm: 17.5, type: "Starlink Installation", dayOffset: 5, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Lily", lastNameInitial: "N", rating: 4.7 }, scope: "Standard Starlink residential installation." },
  // +6 days
  { suburb: "Stroud", distanceKm: 18.5, type: "TV/AV Installation", dayOffset: 6, timeOfDay: "Morning", value: 195, customer: { firstName: "Elijah", lastNameInitial: "I", rating: 4.5 }, scope: "55″ TV wall mount." },
  { suburb: "Bulahdelah", distanceKm: 22.0, type: "Starlink Installation", dayOffset: 6, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Nora", lastNameInitial: "U", rating: 4.8 }, scope: "Standard Starlink residential installation — semi-rural property." },
  { suburb: "Taree", distanceKm: 22.4, type: "TV/AV Installation", dayOffset: 6, timeOfDay: "Afternoon", value: 215, customer: { firstName: "Sebastian", lastNameInitial: "O", rating: 4.4 }, scope: "65″ TV wall mount + cable tidy." },
  // +7 days (next week)
  { suburb: "Wingham", distanceKm: 26.3, type: "Starlink Installation", dayOffset: 7, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Penelope", lastNameInitial: "E", rating: 4.7 }, scope: "Standard Starlink residential installation." },
  { suburb: "Hawks Nest", distanceKm: 25.7, type: "Starlink Installation", dayOffset: 7, timeOfDay: "Afternoon", value: 365, customer: { firstName: "Hudson", lastNameInitial: "F", rating: 4.9 }, scope: "Standard Starlink residential installation — coastal site, premium service tier.", longerJobHint: "Premium tier — additional alignment time" },
  { suburb: "Stroud", distanceKm: 27.0, type: "TV/AV Installation", dayOffset: 7, timeOfDay: "Afternoon", value: 245, customer: { firstName: "Stella", lastNameInitial: "G", rating: 4.5 }, scope: "65″ TV wall mount + soundbar + cable concealment." },
  { suburb: "Taree", distanceKm: 1.2, type: "Starlink Installation", dayOffset: 7, timeOfDay: "Evening", value: 338.8, customer: { firstName: "Felix", lastNameInitial: "H", rating: 4.8 }, scope: "Standard Starlink residential installation — high-rise apartment, balcony only." },
  // +8 days
  { suburb: "Krambach", distanceKm: 47.0, type: "Starlink Installation", dayOffset: 8, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Iris", lastNameInitial: "K", rating: 4.6 }, scope: "Standard Starlink residential installation — large block, optional second AP install." },
  { suburb: "Wingham", distanceKm: 32.0, type: "TV/AV Installation", dayOffset: 8, timeOfDay: "Morning", value: 185, customer: { firstName: "Theo", lastNameInitial: "L", rating: 4.4 }, scope: "55″ TV wall mount." },
  { suburb: "Forster", distanceKm: 3.1, type: "Starlink Installation", dayOffset: 8, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Aurora", lastNameInitial: "P", rating: 4.7 }, scope: "Standard Starlink residential installation." },
  // +10 days
  { suburb: "Pacific Palms", distanceKm: 3.7, type: "TV/AV Installation", dayOffset: 10, timeOfDay: "Morning", value: 215, customer: { firstName: "Caleb", lastNameInitial: "R", rating: 4.6 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Stroud", distanceKm: 1.8, type: "Starlink Installation", dayOffset: 10, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Violet", lastNameInitial: "S", rating: 4.8 }, scope: "Standard Starlink residential installation — terrace house." },
  { suburb: "Cundletown", distanceKm: 4.5, type: "TV/AV Installation", dayOffset: 10, timeOfDay: "Afternoon", value: 195, customer: { firstName: "Wyatt", lastNameInitial: "T", rating: 4.5 }, scope: "55″ TV wall mount." },
  { suburb: "Coomba Bay", distanceKm: 7.2, type: "Starlink Installation", dayOffset: 10, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Hazel", lastNameInitial: "V", rating: 4.7 }, scope: "Standard Starlink residential installation." },
];

export function getOpportunities(): Opportunity[] {
  // Two canonical opportunities Aaron interacts with — kept first so they
  // surface at the top of "Urgent today" / "This week".
  const canonical: Opportunity[] = [
    {
      id: "OP-9011",
      type: "Starlink Installation",
      suburb: "Stroud",
      distanceKm: 1.8,
      dateOffsetDays: 0,
      timeOfDay: "Afternoon",
      value: 320,
      scope:
        "Standard Starlink residential installation. Customer has a compatible roof pitch and existing cable access.",
      customer: { firstName: "Robert", lastNameInitial: "C", rating: 4.7 },
      complianceRequired: STARLINK_COMPLIANCE,
      urgent: true,
    },
    {
      id: "OP-9014",
      type: "TV/AV Installation",
      suburb: "Cundletown",
      distanceKm: 4.5,
      dateOffsetDays: 5,
      timeOfDay: "Morning",
      value: 280,
      scope:
        "75″ TV wall mount + soundbar setup — requires specialist bracket. Longer job than standard.",
      customer: { firstName: "Emma", lastNameInitial: "W", rating: 4.9 },
      complianceRequired: TVAV_COMPLIANCE,
      longerJobHint: "Specialist bracket — larger than standard",
    },
  ];

  const fillers: Opportunity[] = OPPORTUNITY_FILLERS.map((f, i) => ({
    id: `OP-9${(100 + i).toString().padStart(3, "0")}`,
    type: f.type,
    suburb: f.suburb,
    distanceKm: f.distanceKm,
    dateOffsetDays: f.dayOffset,
    timeOfDay: f.timeOfDay,
    value: f.value,
    scope: f.scope,
    customer: f.customer,
    complianceRequired:
      f.type === "Starlink Installation" ? STARLINK_COMPLIANCE : TVAV_COMPLIANCE,
    urgent: f.urgent,
    longerJobHint: f.longerJobHint,
    outcome: f.outcome,
    responded: f.responded,
  }));

  return [...canonical, ...fillers];
}

export function getPastOpportunities(): Opportunity[] {
  return [
    {
      id: "OP-8844",
      type: "Starlink Installation",
      suburb: "Forster",
      distanceKm: 3.1,
      dateOffsetDays: -4,
      timeOfDay: "Morning",
      value: 338.8,
      scope: "Standard Starlink residential installation.",
      customer: { firstName: "Nathan", lastNameInitial: "T", rating: 4.5 },
      complianceRequired: STARLINK_COMPLIANCE,
      outcome: "not-selected",
      responded: { mode: "accept", value: 338.8 },
    },
    {
      id: "OP-8830",
      type: "TV/AV Installation",
      suburb: "Pacific Palms",
      distanceKm: 5.4,
      dateOffsetDays: -6,
      timeOfDay: "Afternoon",
      value: 215,
      scope: "65″ TV wall mount + soundbar.",
      customer: { firstName: "Adam", lastNameInitial: "B", rating: 4.6 },
      complianceRequired: TVAV_COMPLIANCE,
      outcome: "selected",
      responded: { mode: "accept", value: 215 },
    },
    {
      id: "OP-8819",
      type: "Starlink Installation",
      suburb: "Bulahdelah",
      distanceKm: 7.4,
      dateOffsetDays: -8,
      timeOfDay: "Morning",
      value: 338.8,
      scope: "Standard Starlink residential installation — chimney mount.",
      customer: { firstName: "Lara", lastNameInitial: "F", rating: 4.8 },
      complianceRequired: STARLINK_COMPLIANCE,
      outcome: "not-selected",
      responded: { mode: "propose-rate", value: 360 },
    },
    {
      id: "OP-8802",
      type: "TV/AV Installation",
      suburb: "Smiths Lake",
      distanceKm: 6.1,
      dateOffsetDays: -11,
      timeOfDay: "Morning",
      value: 185,
      scope: "55″ TV wall mount.",
      customer: { firstName: "Priya", lastNameInitial: "S", rating: 4.7 },
      complianceRequired: TVAV_COMPLIANCE,
      outcome: "selected",
      responded: { mode: "accept", value: 185 },
    },
    {
      id: "OP-8795",
      type: "Starlink Installation",
      suburb: "Krambach",
      distanceKm: 5.8,
      dateOffsetDays: -14,
      timeOfDay: "Afternoon",
      value: 338.8,
      scope: "Standard Starlink residential installation.",
      customer: { firstName: "Tom", lastNameInitial: "H", rating: 4.5 },
      complianceRequired: STARLINK_COMPLIANCE,
      outcome: "not-selected",
      responded: { mode: "propose-date", value: 338.8 },
    },
  ];
}

// ---------- Team ----------
export function getTeam(): Team {
  return {
    members: [
      {
        id: "TM-1",
        name: "Tom Baker",
        role: "Subcontractor",
        activeJobs: 2,
        compliance: "Good",
      },
      {
        id: "TM-2",
        name: "Sarah Chen",
        role: "Employee",
        activeJobs: 0,
        compliance: "Good",
      },
      {
        id: "TM-3",
        name: "Marcus Webb",
        role: "Subcontractor",
        activeJobs: 0,
        compliance: "Attention",
      },
    ],
  };
}

// ---------- Document library / store ----------
// Templates and packs the trade can buy individually or get free with a paid
// subscription. Per Aaron's positioning ("they come for the jobs, they stay
// for the other stuff") this is the second half of the value prop —
// operationally necessary documents (SWMS) plus business forms.

export type LibraryCategory =
  | "SWMS Templates"
  | "Business & Customer Forms"
  | "Compliance Kits";

export interface LibraryItem {
  id: string;
  name: string;
  category: LibraryCategory;
  shortDescription: string;
  longDescription: string;
  includes: string[];
  format: "PDF" | "DOCX bundle" | "PDF bundle";
  pages: number;
  priceCents: number; // shown in dollars
  // Was the document recently updated? Influences "Updated X" copy.
  updatedDaysAgo: number;
  // Auto-fills with the trade's business details when bought.
  autoFilled: boolean;
}

const LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "swms-starlink-roof",
    name: "SWMS — Starlink Roof Installation",
    category: "SWMS Templates",
    shortDescription:
      "Safe Work Method Statement covering single-story roof-mounted Starlink installs.",
    longDescription:
      "Pre-filled SWMS specific to roof-mounted Starlink residential installations. Covers ladder access, working at height controls, electrical isolation, weather hold criteria, and customer property protection. Updated to reference WorkSafe NSW Code of Practice 2024.",
    includes: [
      "Hazard register (12 pre-identified hazards)",
      "Risk control measures with PPE checklist",
      "Pre-start checklist for the team member on site",
      "Sign-off page with witness fields",
      "Auto-fills your ABN, business name, and trade details",
    ],
    format: "PDF",
    pages: 8,
    priceCents: 5900,
    updatedDaysAgo: 14,
    autoFilled: true,
  },
  {
    id: "swms-tvav-wall-mount",
    name: "SWMS — TV / AV Wall Mount Installation",
    category: "SWMS Templates",
    shortDescription:
      "Safe Work Method Statement for TV wall mount + soundbar installations.",
    longDescription:
      "Pre-filled SWMS covering 55″–86″ wall-mounted TV and soundbar installations across plasterboard, brick, and concealment scenarios. Includes load-bearing assessment guidance and electrical safety checks for connected AV equipment.",
    includes: [
      "Wall-type assessment guide",
      "Mounting hardware specification matrix",
      "Cable management & concealment hazards",
      "Customer-present worksite controls",
      "Auto-fills your ABN, business name, and trade details",
    ],
    format: "PDF",
    pages: 6,
    priceCents: 5900,
    updatedDaysAgo: 22,
    autoFilled: true,
  },
  {
    id: "swms-working-heights",
    name: "SWMS — Working at Heights (General)",
    category: "SWMS Templates",
    shortDescription:
      "Generic working-at-heights SWMS, suitable for most trade-type variants.",
    longDescription:
      "General-purpose Working at Heights SWMS, suitable for use as a base template that you can specialise per job type. Covers fall arrest equipment, ladder safety, scaffolding selection, and emergency procedures.",
    includes: [
      "Equipment inspection checklist",
      "Ladder vs scaffolding selection matrix",
      "Fall arrest system options",
      "Rescue plan template",
      "Auto-fills your ABN, business name, and trade details",
    ],
    format: "PDF",
    pages: 10,
    priceCents: 5900,
    updatedDaysAgo: 7,
    autoFilled: true,
  },
  {
    id: "business-sole-trader-essentials",
    name: "Sole Trader Essentials Pack",
    category: "Business & Customer Forms",
    shortDescription:
      "14-template bundle covering everything a new sole trader needs.",
    longDescription:
      "The full set of admin templates a sole trader needs: contractor agreement, customer terms & conditions, service charter, payment terms, dispute resolution, customer privacy notice, materials variation form, and more. All Australian-law-aligned and reviewed by Sparke Helmore.",
    includes: [
      "Contractor agreement template (3 versions)",
      "Customer T&Cs & service charter",
      "Payment terms & late-payment notice",
      "Dispute resolution flowchart",
      "Privacy notice (Australian Privacy Act compliant)",
      "Variation order template",
      "+ 8 more templates",
    ],
    format: "DOCX bundle",
    pages: 42,
    priceCents: 8900,
    updatedDaysAgo: 35,
    autoFilled: true,
  },
  {
    id: "customer-service-charter",
    name: "Customer Service Charter",
    category: "Business & Customer Forms",
    shortDescription:
      "Single-page service charter to leave with customers on the day.",
    longDescription:
      "A single-page customer-facing document covering what the customer can expect from the install: arrival window, scope, cleanup standard, warranty, and how to raise issues. Pre-filled with your business contact details.",
    includes: [
      "Service standards (arrival, communication, cleanup)",
      "Warranty terms",
      "Issue resolution contact",
      "Auto-fills your business name, ABN, phone, email",
    ],
    format: "DOCX bundle",
    pages: 2,
    priceCents: 2900,
    updatedDaysAgo: 60,
    autoFilled: true,
  },
  {
    id: "compliance-hn-induction",
    name: "Harvey Norman Inductee Kit",
    category: "Compliance Kits",
    shortDescription:
      "Pre-induction reading & checklist for the Harvey Norman installer LMS.",
    longDescription:
      "Pre-reading and reference kit that pairs with the Harvey Norman online LMS induction. Has the 22-question reference index, the picking ticket walkthrough, the Customer Goods Receipt protocol, and the post-install evidence requirements. Doesn't replace the LMS — it makes it faster.",
    includes: [
      "22-question reference index",
      "Picking ticket walkthrough",
      "Customer Goods Receipt protocol",
      "Post-install evidence checklist",
      "Cross-reference to the live LMS course",
    ],
    format: "PDF bundle",
    pages: 22,
    priceCents: 7900,
    updatedDaysAgo: 5,
    autoFilled: false,
  },
];

export function getLibraryItems(): LibraryItem[] {
  return LIBRARY_ITEMS;
}

export function getLibraryItem(id: string): LibraryItem | undefined {
  return LIBRARY_ITEMS.find((i) => i.id === id);
}

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  "SWMS Templates",
  "Business & Customer Forms",
  "Compliance Kits",
];

// ---------- Notifications ----------
export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  tone: "info" | "warn" | "accent";
  atOffsetMinutes: number;
}

export function getNotifications(): NotificationItem[] {
  return [
    {
      id: "N-1",
      title: "Urgent job available",
      body: "Starlink install in Surry Hills — 1.8 km away, today 2pm, $320.",
      tone: "accent",
      atOffsetMinutes: -15,
    },
    {
      id: "N-2",
      title: "Public Liability expiring",
      body: "Your Public Liability Insurance expires in 34 days. Renew to keep receiving work.",
      tone: "warn",
      atOffsetMinutes: -180,
    },
  ];
}

// ---------- Trade type options for onboarding ----------
export const TRADE_TYPE_OPTIONS: { label: string; icon: string }[] = [
  { label: "Starlink Installation", icon: "📡" },
  { label: "TV / AV Installation", icon: "📺" },
  { label: "Appliance Installation", icon: "🧺" },
  { label: "Air Conditioning / HVAC", icon: "❄️" },
  { label: "Electrical", icon: "⚡" },
  { label: "Plumbing", icon: "🚰" },
  { label: "Solar / Energy", icon: "☀️" },
  { label: "Insurance Repairs", icon: "🛠️" },
  { label: "General Maintenance", icon: "🧰" },
  { label: "Other", icon: "＋" },
];

// Mid North Coast corridor — Sandbar Electrical's service region.
// Postcodes simplified to 2428 (Forster–Tuncurry corridor) and 2430
// (Taree corridor) for prototype purposes; production data layer
// would carry actual postcodes per Australia Post.
export const SUBURB_SUGGESTIONS: { suburb: string; postcode: string }[] = [
  { suburb: "Forster", postcode: "2428" },
  { suburb: "Tuncurry", postcode: "2428" },
  { suburb: "Pacific Palms", postcode: "2428" },
  { suburb: "Hawks Nest", postcode: "2428" },
  { suburb: "Coomba Bay", postcode: "2428" },
  { suburb: "Smiths Lake", postcode: "2428" },
  { suburb: "Bulahdelah", postcode: "2428" },
  { suburb: "Taree", postcode: "2430" },
  { suburb: "Old Bar", postcode: "2430" },
  { suburb: "Wingham", postcode: "2430" },
  { suburb: "Cundletown", postcode: "2430" },
  { suburb: "Wallabi Point", postcode: "2430" },
];
