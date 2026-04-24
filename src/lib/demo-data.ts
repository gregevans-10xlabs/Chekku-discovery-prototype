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
    // ---- TODAY (4 jobs in time order) ----
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
      id: "CG48953",
      cgNumber: "CG48953",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "James",
        lastName: "Kowalski",
        phone: "0405 882 119",
        address: "8 Beach Street",
        suburb: "Coogee",
        postcode: "2034",
        rating: 4.7,
      },
      workOrder: "WO-47915",
      scope: "65″ TV wall mount + cable management. Customer requesting tidy install behind plasterboard.",
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: 0,
      timeOfDay: "Morning",
      startTime: "11:30 AM",
      value: 245.0,
      estimatedDurationMinutes: 75,
      pickupLocation: {
        name: "Harvey Norman Eastgardens",
        address: "152 Bunnerong Rd, Eastgardens NSW 2036",
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
      id: "CG48954",
      cgNumber: "CG48954",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Linda",
        lastName: "Chen",
        phone: "0413 220 884",
        address: "27 Anzac Parade",
        suburb: "Maroubra",
        postcode: "2035",
        rating: 4.9,
      },
      workOrder: "WO-47918",
      scope: "Standard Starlink residential installation — eave mount, internal cable through wardrobe.",
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 0,
      timeOfDay: "Afternoon",
      startTime: "2:30 PM",
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
      id: "CG48955",
      cgNumber: "CG48955",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Michael",
        lastName: "Tran",
        phone: "0421 778 091",
        address: "14 Belmore Road",
        suburb: "Randwick",
        postcode: "2031",
        rating: 4.5,
      },
      workOrder: "WO-47922",
      scope: "55″ TV wall mount + soundbar. No cable concealment requested.",
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: 0,
      timeOfDay: "Afternoon",
      startTime: "4:30 PM",
      value: 185.0,
      estimatedDurationMinutes: 60,
      pickupLocation: {
        name: "Harvey Norman Eastgardens",
        address: "152 Bunnerong Rd, Eastgardens NSW 2036",
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
    // ---- PAST (yesterday + last 10 days) ----
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
      id: "CG48295",
      cgNumber: "CG48295",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "David",
        lastName: "Park",
        phone: "0407 998 220",
        address: "9 Hall Street",
        suburb: "Bondi Beach",
        postcode: "2026",
        rating: 4.8,
      },
      workOrder: "WO-47803",
      scope: "Standard Starlink residential installation.",
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
    },
    {
      id: "CG48201",
      cgNumber: "CG48201",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Rebecca",
        lastName: "Singh",
        phone: "0419 005 117",
        address: "31 Carrington Road",
        suburb: "Coogee",
        postcode: "2034",
        rating: 4.6,
      },
      workOrder: "WO-47655",
      scope: "Standard Starlink residential installation — pole-mounted dish.",
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
    },
    {
      id: "CG48133",
      cgNumber: "CG48133",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Tom",
        lastName: "Edwards",
        phone: "0432 887 102",
        address: "44 King Street",
        suburb: "Newtown",
        postcode: "2042",
        rating: 4.4,
      },
      workOrder: "WO-47511",
      scope: "75″ TV wall mount + soundbar setup. Specialist bracket.",
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: -7,
      timeOfDay: "Morning",
      startTime: "10:30 AM",
      value: 215.0,
      estimatedDurationMinutes: 75,
      pickupLocation: {
        name: "Harvey Norman Auburn",
        address: "265 Parramatta Rd, Auburn NSW 2144",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Completed",
      paymentStatus: "Settled",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
    },
    {
      id: "CG48081",
      cgNumber: "CG48081",
      type: "TV/AV Installation",
      client: "Harvey Norman",
      customer: {
        firstName: "Emily",
        lastName: "Nguyen",
        phone: "0411 663 220",
        address: "12 Illawarra Road",
        suburb: "Marrickville",
        postcode: "2204",
        rating: 4.9,
      },
      workOrder: "WO-47402",
      scope: "55″ TV wall mount + cable tidy.",
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: -9,
      timeOfDay: "Afternoon",
      startTime: "3:00 PM",
      value: 185.0,
      estimatedDurationMinutes: 60,
      pickupLocation: {
        name: "Harvey Norman Auburn",
        address: "265 Parramatta Rd, Auburn NSW 2144",
      },
      equipmentDeliveryStatus: "N/A",
      status: "Completed",
      paymentStatus: "RCTI Generated",
      attendance: "Confirmed",
      complianceRequired: [
        { name: "Working at Heights", verified: true },
        { name: "White Card", verified: true },
      ],
    },
    {
      id: "CG48050",
      cgNumber: "CG48050",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Nathan",
        lastName: "O'Brien",
        phone: "0426 318 990",
        address: "5 MacPherson Street",
        suburb: "Bronte",
        postcode: "2024",
        rating: 4.7,
      },
      workOrder: "WO-47301",
      scope: "Standard Starlink residential installation — chimney mount.",
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
    },
    // ---- TOMORROW (3 jobs) ----
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
    {
      id: "CG49003",
      cgNumber: "CG49003",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Olivia",
        lastName: "Reid",
        phone: "0438 116 552",
        address: "73 Crown Street",
        suburb: "Surry Hills",
        postcode: "2010",
        rating: 4.8,
      },
      workOrder: "WO-48028",
      scope: "Standard Starlink residential installation — terrace roof, internal cable through service shaft.",
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 1,
      timeOfDay: "Afternoon",
      startTime: "4:00 PM",
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
    // ---- LATER (next few weeks, exercises calendar nav) ----
    {
      id: "CG49101",
      cgNumber: "CG49101",
      type: "Starlink Installation",
      client: "Starlink",
      customer: {
        firstName: "Harper",
        lastName: "Williams",
        phone: "0413 778 990",
        address: "11 Glebe Point Road",
        suburb: "Glebe",
        postcode: "2037",
        rating: 4.6,
      },
      workOrder: "WO-48101",
      scope: "Standard Starlink residential installation.",
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 14,
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
        lastName: "Murphy",
        phone: "0421 003 184",
        address: "8 Smith Street",
        suburb: "Manly",
        postcode: "2095",
        rating: 4.7,
      },
      workOrder: "WO-48114",
      scope: "65″ TV wall mount + soundbar.",
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: 21,
      timeOfDay: "Afternoon",
      startTime: "1:30 PM",
      value: 245.0,
      estimatedDurationMinutes: 75,
      pickupLocation: {
        name: "Harvey Norman Brookvale",
        address: "651-741 Pittwater Rd, Brookvale NSW 2100",
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
        lastName: "Patel",
        phone: "0408 552 901",
        address: "22 Park Avenue",
        suburb: "Mosman",
        postcode: "2088",
        rating: 4.9,
      },
      workOrder: "WO-48127",
      scope: "Standard Starlink residential installation — heritage tile roof, careful penetration required.",
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 28,
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
        lastName: "Carter",
        phone: "0419 220 117",
        address: "47 Bower Street",
        suburb: "Manly",
        postcode: "2095",
        rating: 4.7,
      },
      workOrder: "WO-48140",
      scope: "Standard Starlink residential installation.",
      serviceCodes: ["CONCP", "PREM SBS"],
      dateOffsetDays: 35,
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
        lastName: "Brooks",
        phone: "0432 119 887",
        address: "61 Norton Street",
        suburb: "Leichhardt",
        postcode: "2040",
        rating: 4.6,
      },
      workOrder: "WO-48155",
      scope: "55″ TV wall mount + soundbar + cable concealment.",
      serviceCodes: ["TVWMLL"],
      dateOffsetDays: 42,
      timeOfDay: "Morning",
      startTime: "11:00 AM",
      value: 245.0,
      estimatedDurationMinutes: 90,
      pickupLocation: {
        name: "Harvey Norman Auburn",
        address: "265 Parramatta Rd, Auburn NSW 2144",
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
}> = [
  // Today (extra fills, beyond OP-9011)
  { suburb: "Redfern NSW", distanceKm: 2.4, type: "Starlink Installation", dayOffset: 0, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Aiden", lastNameInitial: "M", rating: 4.6 }, scope: "Standard Starlink residential installation — apartment balcony mount." },
  { suburb: "Pyrmont NSW", distanceKm: 2.5, type: "TV/AV Installation", dayOffset: 0, timeOfDay: "Evening", value: 195, customer: { firstName: "Sophia", lastNameInitial: "L", rating: 4.8 }, scope: "55″ TV wall mount, brick wall — masonry anchors required.", urgent: true },
  { suburb: "Glebe NSW", distanceKm: 3.0, type: "Starlink Installation", dayOffset: 0, timeOfDay: "Evening", value: 320, customer: { firstName: "Marcus", lastNameInitial: "B", rating: 4.5 }, scope: "Standard Starlink residential installation." },
  // +1 day (this week)
  { suburb: "Bondi Junction NSW", distanceKm: 4.6, type: "TV/AV Installation", dayOffset: 1, timeOfDay: "Morning", value: 215, customer: { firstName: "Hannah", lastNameInitial: "F", rating: 4.7 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Bronte NSW", distanceKm: 4.0, type: "Starlink Installation", dayOffset: 1, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Daniel", lastNameInitial: "S", rating: 4.9 }, scope: "Standard Starlink residential installation." },
  { suburb: "Erskineville NSW", distanceKm: 4.0, type: "TV/AV Installation", dayOffset: 1, timeOfDay: "Afternoon", value: 185, customer: { firstName: "Chloe", lastNameInitial: "P", rating: 4.6 }, scope: "55″ TV wall mount + cable concealment." },
  { suburb: "Maroubra NSW", distanceKm: 7.2, type: "Starlink Installation", dayOffset: 1, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Ethan", lastNameInitial: "W", rating: 4.4 }, scope: "Standard Starlink residential installation." },
  // +2 days
  { suburb: "Coogee NSW", distanceKm: 5.4, type: "Starlink Installation", dayOffset: 2, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Mia", lastNameInitial: "K", rating: 4.8 }, scope: "Standard Starlink residential installation — chimney mount." },
  { suburb: "Randwick NSW", distanceKm: 5.8, type: "TV/AV Installation", dayOffset: 2, timeOfDay: "Morning", value: 215, customer: { firstName: "Lucas", lastNameInitial: "G", rating: 4.5 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Marrickville NSW", distanceKm: 6.1, type: "Starlink Installation", dayOffset: 2, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Isabella", lastNameInitial: "H", rating: 4.7 }, scope: "Standard Starlink residential installation." },
  { suburb: "North Sydney NSW", distanceKm: 4.2, type: "TV/AV Installation", dayOffset: 2, timeOfDay: "Afternoon", value: 245, customer: { firstName: "Henry", lastNameInitial: "J", rating: 4.8 }, scope: "65″ TV wall mount + cable concealment behind plaster." },
  { suburb: "Mosman NSW", distanceKm: 7.4, type: "Starlink Installation", dayOffset: 2, timeOfDay: "Evening", value: 338.8, customer: { firstName: "Eva", lastNameInitial: "C", rating: 4.9 }, scope: "Standard Starlink residential installation." },
  // +3 days
  { suburb: "Lane Cove NSW", distanceKm: 8.8, type: "TV/AV Installation", dayOffset: 3, timeOfDay: "Morning", value: 185, customer: { firstName: "Oliver", lastNameInitial: "D", rating: 4.6 }, scope: "55″ TV wall mount." },
  { suburb: "Chatswood NSW", distanceKm: 10.0, type: "Starlink Installation", dayOffset: 3, timeOfDay: "Morning", value: 320, customer: { firstName: "Ava", lastNameInitial: "T", rating: 4.7 }, scope: "Standard Starlink residential installation — apartment balcony." },
  { suburb: "Ashfield NSW", distanceKm: 9.6, type: "TV/AV Installation", dayOffset: 3, timeOfDay: "Afternoon", value: 215, customer: { firstName: "Jacob", lastNameInitial: "R", rating: 4.5 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Burwood NSW", distanceKm: 11.2, type: "Starlink Installation", dayOffset: 3, timeOfDay: "Afternoon", value: 338.8, customer: { firstName: "Charlotte", lastNameInitial: "Y", rating: 4.8 }, scope: "Standard Starlink residential installation." },
  { suburb: "Strathfield NSW", distanceKm: 12.5, type: "TV/AV Installation", dayOffset: 3, timeOfDay: "Evening", value: 195, customer: { firstName: "Liam", lastNameInitial: "Z", rating: 4.4 }, scope: "55″ TV wall mount + cable tidy." },
  // +4 days
  { suburb: "Manly NSW", distanceKm: 12.0, type: "Starlink Installation", dayOffset: 4, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Zoe", lastNameInitial: "A", rating: 4.9 }, scope: "Standard Starlink residential installation — sea spray site, marine bracket." },
  { suburb: "Rockdale NSW", distanceKm: 10.8, type: "TV/AV Installation", dayOffset: 4, timeOfDay: "Morning", value: 185, customer: { firstName: "Noah", lastNameInitial: "B", rating: 4.5 }, scope: "55″ TV wall mount." },
  { suburb: "Hurstville NSW", distanceKm: 14.5, type: "Starlink Installation", dayOffset: 4, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Mila", lastNameInitial: "X", rating: 4.6 }, scope: "Standard Starlink residential installation." },
  { suburb: "Ryde NSW", distanceKm: 13.5, type: "TV/AV Installation", dayOffset: 4, timeOfDay: "Afternoon", value: 245, customer: { firstName: "Levi", lastNameInitial: "Q", rating: 4.7 }, scope: "65″ TV wall mount + cable concealment." },
  // +5 days (alongside OP-9014)
  { suburb: "Eastwood NSW", distanceKm: 16.3, type: "Starlink Installation", dayOffset: 5, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Ruby", lastNameInitial: "M", rating: 4.8 }, scope: "Standard Starlink residential installation." },
  { suburb: "Kogarah NSW", distanceKm: 13.4, type: "TV/AV Installation", dayOffset: 5, timeOfDay: "Afternoon", value: 215, customer: { firstName: "Mason", lastNameInitial: "V", rating: 4.6 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Epping NSW", distanceKm: 17.5, type: "Starlink Installation", dayOffset: 5, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Lily", lastNameInitial: "N", rating: 4.7 }, scope: "Standard Starlink residential installation." },
  // +6 days
  { suburb: "Bankstown NSW", distanceKm: 18.5, type: "TV/AV Installation", dayOffset: 6, timeOfDay: "Morning", value: 195, customer: { firstName: "Elijah", lastNameInitial: "I", rating: 4.5 }, scope: "55″ TV wall mount." },
  { suburb: "Hornsby NSW", distanceKm: 22.0, type: "Starlink Installation", dayOffset: 6, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Nora", lastNameInitial: "U", rating: 4.8 }, scope: "Standard Starlink residential installation — semi-rural property." },
  { suburb: "Parramatta NSW", distanceKm: 22.4, type: "TV/AV Installation", dayOffset: 6, timeOfDay: "Afternoon", value: 215, customer: { firstName: "Sebastian", lastNameInitial: "O", rating: 4.4 }, scope: "65″ TV wall mount + cable tidy." },
  // +7 days (next week)
  { suburb: "Castle Hill NSW", distanceKm: 26.3, type: "Starlink Installation", dayOffset: 7, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Penelope", lastNameInitial: "E", rating: 4.7 }, scope: "Standard Starlink residential installation." },
  { suburb: "Cronulla NSW", distanceKm: 25.7, type: "Starlink Installation", dayOffset: 7, timeOfDay: "Afternoon", value: 365, customer: { firstName: "Hudson", lastNameInitial: "F", rating: 4.9 }, scope: "Standard Starlink residential installation — coastal site, premium service tier.", longerJobHint: "Premium tier — additional alignment time" },
  { suburb: "Liverpool NSW", distanceKm: 27.0, type: "TV/AV Installation", dayOffset: 7, timeOfDay: "Afternoon", value: 245, customer: { firstName: "Stella", lastNameInitial: "G", rating: 4.5 }, scope: "65″ TV wall mount + soundbar + cable concealment." },
  { suburb: "Sydney CBD NSW", distanceKm: 1.2, type: "Starlink Installation", dayOffset: 7, timeOfDay: "Evening", value: 338.8, customer: { firstName: "Felix", lastNameInitial: "H", rating: 4.8 }, scope: "Standard Starlink residential installation — high-rise apartment, balcony only." },
  // +8 days
  { suburb: "Penrith NSW", distanceKm: 47.0, type: "Starlink Installation", dayOffset: 8, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Iris", lastNameInitial: "K", rating: 4.6 }, scope: "Standard Starlink residential installation — large block, optional second AP install." },
  { suburb: "Blacktown NSW", distanceKm: 32.0, type: "TV/AV Installation", dayOffset: 8, timeOfDay: "Morning", value: 185, customer: { firstName: "Theo", lastNameInitial: "L", rating: 4.4 }, scope: "55″ TV wall mount." },
  { suburb: "Bondi Beach NSW", distanceKm: 3.1, type: "Starlink Installation", dayOffset: 8, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Aurora", lastNameInitial: "P", rating: 4.7 }, scope: "Standard Starlink residential installation." },
  // +10 days
  { suburb: "Tamarama NSW", distanceKm: 3.7, type: "TV/AV Installation", dayOffset: 10, timeOfDay: "Morning", value: 215, customer: { firstName: "Caleb", lastNameInitial: "R", rating: 4.6 }, scope: "65″ TV wall mount + soundbar." },
  { suburb: "Surry Hills NSW", distanceKm: 1.8, type: "Starlink Installation", dayOffset: 10, timeOfDay: "Morning", value: 338.8, customer: { firstName: "Violet", lastNameInitial: "S", rating: 4.8 }, scope: "Standard Starlink residential installation — terrace house." },
  { suburb: "Newtown NSW", distanceKm: 4.5, type: "TV/AV Installation", dayOffset: 10, timeOfDay: "Afternoon", value: 195, customer: { firstName: "Wyatt", lastNameInitial: "T", rating: 4.5 }, scope: "55″ TV wall mount." },
  { suburb: "Maroubra NSW", distanceKm: 7.2, type: "Starlink Installation", dayOffset: 10, timeOfDay: "Afternoon", value: 320, customer: { firstName: "Hazel", lastNameInitial: "V", rating: 4.7 }, scope: "Standard Starlink residential installation." },
];

export function getOpportunities(): Opportunity[] {
  // Two canonical opportunities Aaron interacts with — kept first so they
  // surface at the top of "Urgent today" / "This week".
  const canonical: Opportunity[] = [
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
      complianceRequired: STARLINK_COMPLIANCE,
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
  }));

  return [...canonical, ...fillers];
}

export function getPastOpportunities(): Opportunity[] {
  return [
    {
      id: "OP-8844",
      type: "Starlink Installation",
      suburb: "Bondi Beach NSW",
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
      suburb: "Coogee NSW",
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
      suburb: "Mosman NSW",
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
      suburb: "Marrickville NSW",
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
      suburb: "Randwick NSW",
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
