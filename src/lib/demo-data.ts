import type {
  ComplianceDocument,
  Job,
  Opportunity,
  Team,
  Trade,
} from "./types";

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

// ---------- Trade persona ----------
export const JAKE: Trade = {
  fullName: "Jake Mitchell",
  firstName: "Jake",
  phone: "0412 345 678",
  abn: "51 824 753 556",
  tradeTypes: ["Starlink Installation", "TV / AV Installation"],
  serviceArea: { suburb: "Newcastle", postcode: "2300", radiusKm: 50 },
  language: "English",
  tier: "Silver",
  subscription: {
    tier: "Free",
    label: "Free tier — $750 of $1,000 allocated",
    allocatedYTD: 750,
    cap: 1000,
  },
  onTimeRate: 0.82,
  completionRate: 0.96,
  reschedulePeerPercentile: "Below 40% of area peers",
};

// ---------- Compliance ----------
export function getComplianceDocs(): ComplianceDocument[] {
  return [
    {
      id: "elec-licence",
      name: "Electrical Contractor Licence",
      status: "Active",
      expiresAt: offsetDate(52).toISOString(),
      layer: 1,
    },
    {
      id: "working-heights",
      name: "Working at Heights",
      status: "Active",
      expiresAt: offsetDate(270).toISOString(),
      layer: 1,
    },
    {
      id: "white-card",
      name: "White Card (Construction Induction)",
      status: "Active",
      layer: 1,
    },
    {
      id: "public-liability",
      name: "Public Liability Insurance",
      status: "Expiring Soon",
      expiresAt: offsetDate(34).toISOString(),
      layer: 1,
    },
    {
      id: "first-aid",
      name: "First Aid Certificate",
      status: "Not Started",
      unlocks: "Complete First Aid to unlock $12,400 of Harvey Norman work in your area",
      layer: 2,
    },
  ];
}

// ---------- Jobs ----------
export function getJobs(): Job[] {
  return [
    {
      id: "CG48952",
      cgNumber: "CG48952",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Sarah",
        lastName: "Mitchell",
        phone: "0408 112 334",
        address: "42 Sunrise Boulevard",
        suburb: "Bondi Beach",
        postcode: "2026",
        rating: 4.8,
      },
      workOrder: "WO-47911",
      scope:
        "Standard Starlink residential installation — roof mount, cable run through existing conduit, router setup and testing, customer orientation.",
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 0,
      timeOfDay: "Morning",
      startTime: "9:00 AM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Delivered",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
    },
    {
      id: "CG48403",
      cgNumber: "CG48403",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Greg",
        lastName: "Evans",
        phone: "0411 900 211",
        address: "123 Hunter Street",
        suburb: "Newcastle",
        postcode: "2300",
        rating: 4.6,
      },
      workOrder: "WO-47622",
      scope: "65″ TV wall mount + soundbar setup. Confirm customer present.",
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: -1,
      timeOfDay: "Morning",
      startTime: "10:00 AM",
      value: 185.0,
      estimatedDurationMinutes: 75,
      pickupLocation: {
        name: "Harvey Norman Newcastle",
        address: "2 Bradford Cl, Kotara NSW 2289",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Completed",
      paymentStatus: "Payment Processing",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
    },
    {
      id: "CG49001",
      cgNumber: "CG49001",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Patricia",
        lastName: "Wong",
        phone: "0417 550 881",
        address: "12 Harbour View",
        suburb: "Darling Harbour",
        postcode: "2000",
        rating: 4.9,
      },
      workOrder: "WO-48011",
      scope:
        "Standard Starlink residential installation — wall-mounted antenna, indoor router placement, speed test and customer walkthrough.",
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 1,
      timeOfDay: "Morning",
      startTime: "9:30 AM",
      value: 338.8,
      estimatedDurationMinutes: 90,
      equipmentDeliveryStatus: "Not Yet Received",
      status: "Confirmed",
      paymentStatus: "Not Applicable",
      attendance: "Pending",
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
    },
    {
      id: "CG49002",
      cgNumber: "CG49002",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Alex",
        lastName: "Thompson",
        phone: "0422 766 109",
        address: "88 Greenfield Lane",
        suburb: "Epping",
        postcode: "2121",
        rating: 4.7,
      },
      workOrder: "WO-48019",
      scope: "55″ TV wall mount, soundbar, cable tidy.",
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: 1,
      timeOfDay: "Afternoon",
      startTime: "2:00 PM",
      value: 265.0,
      estimatedDurationMinutes: 90,
      pickupLocation: {
        name: "Harvey Norman Epping Warehouse",
        address: "22-36 Beecroft Road, Epping NSW 2121",
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
export function getOpportunities(): Opportunity[] {
  return [
    {
      id: "OP-9011",
      type: "Starlink Installation",
      suburb: "Surry Hills NSW",
      distanceKm: 1.8,
      dateOffsetDays: 0,
      timeOfDay: "Afternoon",
      value: 320,
      scope:
        "Standard Starlink residential installation. Customer has a compatible roof pitch and existing cable access.",
      customer: { firstName: "Robert", lastNameInitial: "C", rating: 4.7 },
      complianceRequired: [
        { name: "Electrical Contractor Licence", verified: true },
        { name: "Working at Heights", verified: true },
      ],
      urgent: true,
    },
    {
      id: "OP-9014",
      type: "TV/AV Installation",
      suburb: "Newtown NSW",
      distanceKm: 4.5,
      dateOffsetDays: 5,
      timeOfDay: "Morning",
      value: 280,
      scope:
        "75″ TV wall mount + soundbar setup — requires specialist bracket. Longer job than standard.",
      customer: { firstName: "Emma", lastNameInitial: "W", rating: 4.9 },
      complianceRequired: [
        { name: "Working at Heights", verified: true },
      ],
      longerJobHint: "Specialist bracket — larger than standard",
    },
  ];
}

export function getPastOpportunity(): Opportunity {
  return {
    id: "OP-8844",
    type: "Starlink Installation",
    suburb: "Bondi Beach NSW",
    distanceKm: 3.1,
    dateOffsetDays: -4,
    timeOfDay: "Morning",
    value: 338.8,
    scope: "Standard Starlink residential installation.",
    customer: { firstName: "Nathan", lastNameInitial: "T", rating: 4.5 },
    complianceRequired: [
      { name: "Electrical Contractor Licence", verified: true },
      { name: "Working at Heights", verified: true },
    ],
    outcome: "not-selected",
    responded: { mode: "accept", value: 338.8 },
  };
}

// ---------- Team ----------
export function getTeam(): Team {
  return {
    members: [
      {
        id: "TM-1",
        name: "Tom Baker",
        role: "Subcontractor",
        activeJobs: 1,
        compliance: "Good",
      },
    ],
  };
}

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

export const SUBURB_SUGGESTIONS: { suburb: string; postcode: string }[] = [
  { suburb: "Newcastle", postcode: "2300" },
  { suburb: "Maitland", postcode: "2320" },
  { suburb: "Lake Macquarie", postcode: "2280" },
  { suburb: "Sydney CBD", postcode: "2000" },
  { suburb: "Bondi Beach", postcode: "2026" },
  { suburb: "Parramatta", postcode: "2150" },
  { suburb: "Newtown", postcode: "2042" },
  { suburb: "Epping", postcode: "2121" },
];
