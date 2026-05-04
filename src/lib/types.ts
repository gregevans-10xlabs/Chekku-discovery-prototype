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
