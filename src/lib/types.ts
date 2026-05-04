export type TradeType =
  | "Starlink Installation"
  | "TV / AV Installation"
  | "Appliance Installation"
  | "Air Conditioning / HVAC"
  | "Electrical"
  | "Plumbing"
  | "Solar / Energy"
  | "Insurance Repairs"
  | "General Maintenance"
  | "Other";

export type ComplianceStatus =
  | "Active"
  | "Expiring Soon"
  | "Expired"
  | "Not Started";

export interface ComplianceDocument {
  id: string;
  name: string;
  status: ComplianceStatus;
  expiresAt?: string;
  unlocks?: string;
  layer: 1 | 2 | 3;
}

export type JobClient = "Starlink" | "Harvey Norman" | "QBE Insurance" | "Circl";

export type JobType = "Starlink Installation" | "TV/AV Installation";

export type EquipmentDeliveryStatus =
  | "Delivered"
  | "Expected Today"
  | "Not Yet Received"
  | "Delayed"
  | "N/A";

export type JobStatus =
  | "Confirmed"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export type PaymentStatus =
  | "Not Applicable"
  | "Job Complete"
  | "RCTI Generated"
  | "Payment Processing"
  | "Settled"
  | "Action Required";

export type AttendanceConfirmation = "Confirmed" | "Unable" | "Pending";

export interface EquipmentTracking {
  carrier: string;
  number: string;
  url: string;
}

export type TimeOfDay = "Morning" | "Afternoon" | "Evening";

export interface JobRescheduleEvent {
  type: "rescheduled";
  timestamp: string;
  fromDateOffsetDays: number;
  fromTimeOfDay: TimeOfDay;
  toDateOffsetDays: number;
  toTimeOfDay: TimeOfDay;
  reason: string;
  note?: string;
}

export type JobEvent = JobRescheduleEvent;

export interface Job {
  id: string;
  cgNumber: string;
  type: JobType;
  client: JobClient;
  customer: {
    firstName: string;
    lastName: string;
    rating?: number;
    phone: string;
    address: string;
    suburb: string;
    postcode: string;
  };
  workOrder: string;
  scope: string;
  serviceCodes?: string[];
  dateOffsetDays: number;
  timeOfDay: TimeOfDay;
  startTime: string;
  value: number;
  estimatedDurationMinutes: number;
  pickupLocation?: {
    name: string;
    address: string;
  };
  equipmentDeliveryStatus: EquipmentDeliveryStatus;
  tracking?: EquipmentTracking;
  status: JobStatus;
  paymentStatus: PaymentStatus;
  attendance: AttendanceConfirmation;
  checkInAt?: string;
  complianceRequired: { name: string; verified: boolean }[];
  events?: JobEvent[];
  // Optional team-member assignment for primary contractors with subs/employees.
  // When unset, the job is the primary contractor's own.
  assignedToMemberId?: string;
  // RCTI metadata — populated once Job Complete fires (paymentStatus moves to
  // RCTI Generated or beyond). settlementDate is set when paymentStatus reaches Settled.
  rctiNumber?: string;
  settlementDate?: string;
  // ISO timestamp set when this job was awarded via Circl's decision on an
  // accepted opportunity. Used to surface a "Job awarded" notification on Home
  // for a few minutes after the win lands.
  wonAt?: string;
}

export interface OpportunityResponse {
  mode: "accept" | "propose-date" | "propose-rate";
  value?: number;
  proposedDates?: string[];
}

export interface Opportunity {
  id: string;
  type: JobType;
  suburb: string;
  distanceKm: number;
  dateOffsetDays: number;
  timeOfDay: "Morning" | "Afternoon" | "Evening";
  value: number;
  scope: string;
  customer: { firstName: string; lastNameInitial: string; rating: number };
  complianceRequired: { name: string; verified: boolean }[];
  urgent?: boolean;
  longerJobHint?: string;
  outcome?: "awaiting" | "selected" | "not-selected";
  responded?: OpportunityResponse;
  // ISO timestamp set when the trade submitted their response. Used to time
  // the simulated Circl decision — opportunities awaiting longer than the
  // threshold get auto-promoted to "selected" with a Job created.
  respondedAt?: string;
}

export interface BankAccount {
  accountName: string;
  bsb: string;
  accountNumber: string;
}

export interface PaymentMethod {
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expiry: string;
}

export interface Trade {
  fullName: string;
  firstName: string;
  phone: string;
  abn: string;
  tradeTypes: TradeType[];
  serviceArea: { suburb: string; postcode: string; radiusKm: number };
  language: string;
  tier: "Gold" | "Silver" | "Platinum" | "Unranked";
  subscription: {
    tier: "Free" | "Year" | "Monthly";
    label: string;
    allocatedYTD: number;
    cap: number;
  };
  onTimeRate: number;
  completionRate: number;
  reschedulePeerPercentile: string;
  bankAccount?: BankAccount;
  paymentMethod?: PaymentMethod;
  // GST registration status. Affects how the RCTI presents the line items —
  // registered trades get the 10% GST split, under-threshold sole traders
  // get a single line with no GST and a note. Defaults to true in demo.
  gstRegistered?: boolean;
  // Optional override for the business name that appears on the RCTI. When
  // unset, the trade's legal name is used.
  tradingName?: string;
  // Trade availability for new opportunity matching. When paused, the trade
  // is filtered out of Circl's matcher and stops receiving urgent-pickup
  // notifications. Existing accepted jobs are unaffected. Defaults to
  // available.
  availability?: TradeAvailability;
}

export interface TradeAvailability {
  status: "available" | "paused";
  // Optional reason — surfaced to Circl ops for pattern understanding,
  // does not affect tier scoring.
  reason?: string;
  // ISO timestamp of when the pause was set; null when available.
  pausedAt?: string;
  // ISO date for when the pause auto-resumes; undefined = indefinite (the
  // trade resumes manually).
  pausedUntil?: string;
}

export interface Team {
  members: {
    id: string;
    name: string;
    role: "Subcontractor" | "Employee";
    activeJobs: number;
    compliance: "Good" | "Attention";
  }[];
}
