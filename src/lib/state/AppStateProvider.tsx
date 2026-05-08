"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BRETT, getJobs, getOpportunities, getPastOpportunities, getTeam } from "@/lib/demo-data";
import type {
  AttendanceConfirmation,
  BankAccount,
  Job,
  JobRescheduleEvent,
  Opportunity,
  PaymentMethod,
  Team,
  TimeOfDay,
  Trade,
  TradeAvailability,
  TradeType,
} from "@/lib/types";

type TeamMember = Team["members"][number];
type TeamRole = TeamMember["role"];

interface PersistedState {
  onboarded: boolean;
  hasTeam: boolean;
  trade: Trade;
  jobs: Job[];
  opportunities: Opportunity[];
  pastOpportunities: Opportunity[];
  selectedJobId: string | null;
  checkedInJobId: string | null;
  sacDoneJobIds: string[];
  irDoneJobIds: string[];
  dayView: "morning" | "during" | "evening" | "tomorrow";
  forceOffline: boolean;
  team: Team;
}

type Action =
  | { type: "onboard"; patch?: Partial<Trade> }
  | { type: "reset" }
  | { type: "set-attendance"; jobId: string; attendance: AttendanceConfirmation }
  | { type: "check-in"; jobId: string }
  | { type: "mark-sac-done"; jobId: string }
  | { type: "mark-ir-done"; jobId: string }
  | { type: "complete-job"; jobId: string }
  | { type: "respond-opportunity"; id: string; mode: "accept" | "propose-date" | "propose-rate"; value?: number }
  | { type: "accept-job-from-opportunity"; opportunityId: string }
  | { type: "set-day-view"; view: PersistedState["dayView"] }
  | { type: "toggle-offline" }
  | { type: "enable-team" }
  | { type: "delegate-job"; jobId: string; memberId: string }
  | { type: "unassign-job"; jobId: string }
  | { type: "set-bank-account"; bankAccount: BankAccount }
  | { type: "set-payment-method"; paymentMethod: PaymentMethod }
  | {
      type: "set-service-area";
      serviceArea: { suburb: string; postcode: string; radiusKm: number };
    }
  | { type: "set-trade-types"; tradeTypes: TradeType[] }
  | {
      type: "set-tax-settings";
      gstRegistered: boolean;
      tradingName?: string;
    }
  | { type: "set-availability"; availability: TradeAvailability }
  | { type: "add-team-member"; name: string; role: TeamRole }
  | { type: "update-team-member"; memberId: string; patch: Partial<Pick<TeamMember, "name" | "role">> }
  | { type: "remove-team-member"; memberId: string }
  | { type: "promote-awaiting-opportunities" }
  | {
      type: "reschedule-job";
      jobId: string;
      toDateOffsetDays: number;
      toTimeOfDay: TimeOfDay;
      reason: string;
      note?: string;
    };

function defaultState(): PersistedState {
  return {
    onboarded: false,
    hasTeam: false,
    trade: BRETT,
    jobs: getJobs(),
    opportunities: getOpportunities(),
    pastOpportunities: getPastOpportunities(),
    selectedJobId: null,
    checkedInJobId: null,
    // Pre-mark Tom's CG48954 as Safety Check done so the team-visibility chips
    // show real progress rather than all-empty rows on first open.
    sacDoneJobIds: ["CG48954"],
    irDoneJobIds: [],
    dayView: "morning",
    forceOffline: false,
    team: getTeam(),
  };
}

function reducer(state: PersistedState, action: Action): PersistedState {
  switch (action.type) {
    case "onboard":
      return {
        ...state,
        onboarded: true,
        trade: { ...state.trade, ...(action.patch ?? {}) },
      };
    case "reset":
      return defaultState();
    case "set-attendance":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.jobId ? { ...j, attendance: action.attendance } : j,
        ),
      };
    case "check-in":
      return {
        ...state,
        checkedInJobId: action.jobId,
        dayView: "during",
        jobs: state.jobs.map((j) =>
          j.id === action.jobId
            ? { ...j, status: "InProgress", checkInAt: new Date().toISOString() }
            : j,
        ),
      };
    case "mark-sac-done":
      return state.sacDoneJobIds.includes(action.jobId)
        ? state
        : { ...state, sacDoneJobIds: [...state.sacDoneJobIds, action.jobId] };
    case "mark-ir-done":
      return state.irDoneJobIds.includes(action.jobId)
        ? state
        : { ...state, irDoneJobIds: [...state.irDoneJobIds, action.jobId] };
    case "complete-job":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.jobId
            ? { ...j, status: "Completed", paymentStatus: "Payment Processing" }
            : j,
        ),
        dayView: "evening",
      };
    case "respond-opportunity":
      return {
        ...state,
        opportunities: state.opportunities.map((o) =>
          o.id === action.id
            ? {
                ...o,
                outcome: "awaiting",
                respondedAt: new Date().toISOString(),
                responded: {
                  mode: action.mode,
                  value: action.value ?? o.value,
                },
              }
            : o,
        ),
      };
    case "accept-job-from-opportunity": {
      const opp = state.opportunities.find((o) => o.id === action.opportunityId);
      if (!opp) return state;
      const newJob: Job = {
        id: `CG${Math.floor(49100 + Math.random() * 100)}`,
        cgNumber: `CG${Math.floor(49100 + Math.random() * 100)}`,
        type: opp.type,
        client: opp.type === "Starlink Installation" ? "Starlink" : "Harvey Norman",
        customer: {
          firstName: opp.customer.firstName,
          lastName: `${opp.customer.lastNameInitial}.`,
          phone: "0400 000 000",
          address: "Address available once accepted",
          suburb: opp.suburb.replace(" NSW", ""),
          postcode: "2000",
          rating: opp.customer.rating,
        },
        workOrder: `WO-${Math.floor(48000 + Math.random() * 1000)}`,
        scope: opp.scope,
        dateOffsetDays: opp.dateOffsetDays,
        timeOfDay: opp.timeOfDay,
        startTime: opp.timeOfDay === "Morning" ? "10:00 AM" : "2:00 PM",
        value: opp.responded?.value ?? opp.value,
        estimatedDurationMinutes: 90,
        equipmentDeliveryStatus:
          opp.type === "Starlink Installation" ? "Expected Today" : "N/A",
        status: "Confirmed",
        paymentStatus: "Not Applicable",
        attendance: "Confirmed",
        complianceRequired: opp.complianceRequired,
      };
      return {
        ...state,
        jobs: [...state.jobs, newJob],
        opportunities: state.opportunities.map((o) =>
          o.id === action.opportunityId
            ? { ...o, outcome: "selected" }
            : o,
        ),
      };
    }
    case "set-day-view":
      return { ...state, dayView: action.view };
    case "toggle-offline":
      return { ...state, forceOffline: !state.forceOffline };
    case "enable-team":
      return { ...state, hasTeam: true };
    case "delegate-job":
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.jobId
            ? { ...j, assignedToMemberId: action.memberId }
            : j,
        ),
      };
    case "unassign-job":
      return {
        ...state,
        jobs: state.jobs.map((j) => {
          if (j.id !== action.jobId) return j;
          // Strip assignedToMemberId without naming the discarded value —
          // keeps lint quiet without a no-unused-vars escape hatch.
          const rest = { ...j };
          delete rest.assignedToMemberId;
          return rest;
        }),
      };
    case "set-bank-account":
      return {
        ...state,
        trade: { ...state.trade, bankAccount: action.bankAccount },
      };
    case "set-payment-method":
      return {
        ...state,
        trade: { ...state.trade, paymentMethod: action.paymentMethod },
      };
    case "set-service-area":
      return {
        ...state,
        trade: { ...state.trade, serviceArea: action.serviceArea },
      };
    case "set-trade-types":
      return {
        ...state,
        trade: { ...state.trade, tradeTypes: action.tradeTypes },
      };
    case "set-tax-settings":
      return {
        ...state,
        trade: {
          ...state.trade,
          gstRegistered: action.gstRegistered,
          tradingName: action.tradingName,
        },
      };
    case "set-availability":
      return {
        ...state,
        trade: { ...state.trade, availability: action.availability },
      };
    case "add-team-member": {
      // New invites land as "Attention" until they upload their compliance
      // docs from their own Chekku login. activeJobs is recomputed live
      // from state.jobs so the seed value is informational only.
      const id = `TM-${Date.now().toString(36).slice(-5).toUpperCase()}`;
      return {
        ...state,
        team: {
          members: [
            ...state.team.members,
            {
              id,
              name: action.name,
              role: action.role,
              activeJobs: 0,
              compliance: "Attention",
            },
          ],
        },
      };
    }
    case "update-team-member":
      return {
        ...state,
        team: {
          members: state.team.members.map((m) =>
            m.id === action.memberId ? { ...m, ...action.patch } : m,
          ),
        },
      };
    case "remove-team-member":
      // Removing a member also clears any job assignments that pointed at
      // them — those jobs revert to the primary contractor (Jake).
      return {
        ...state,
        team: {
          members: state.team.members.filter((m) => m.id !== action.memberId),
        },
        jobs: state.jobs.map((j) => {
          if (j.assignedToMemberId !== action.memberId) return j;
          // Strip assignedToMemberId without naming the discarded value —
          // keeps lint quiet without a no-unused-vars escape hatch.
          const rest = { ...j };
          delete rest.assignedToMemberId;
          return rest;
        }),
      };
    case "promote-awaiting-opportunities": {
      // Simulate Circl's selection decision. Any opportunity the trade has
      // responded to (outcome === "awaiting") older than the threshold gets
      // promoted to "selected" and a corresponding Job is created with a
      // wonAt timestamp so the Home notification can surface the win.
      const PROMOTE_AFTER_MS = 15_000;
      const now = Date.now();
      const ready = state.opportunities.filter(
        (o) =>
          o.outcome === "awaiting" &&
          !!o.respondedAt &&
          now - new Date(o.respondedAt).getTime() >= PROMOTE_AFTER_MS,
      );
      if (ready.length === 0) return state;

      const wonAt = new Date().toISOString();
      const newJobs: Job[] = ready.map((opp) => {
        const idSuffix = opp.id.replace(/^OP-/, "");
        const isStarlink = opp.type === "Starlink Installation";
        const startTime =
          opp.timeOfDay === "Morning"
            ? "10:00 AM"
            : opp.timeOfDay === "Afternoon"
              ? "2:00 PM"
              : "5:00 PM";
        return {
          id: `CG${idSuffix}`,
          cgNumber: `CG${idSuffix}`,
          type: opp.type,
          client: isStarlink ? "Starlink" : "Harvey Norman",
          customer: {
            firstName: opp.customer.firstName,
            lastName: `${opp.customer.lastNameInitial}.`,
            phone: "0400 000 000",
            address: "Address available once accepted",
            suburb: opp.suburb.replace(" NSW", ""),
            postcode: "2000",
            rating: opp.customer.rating,
          },
          workOrder: `WO-${idSuffix}`,
          scope: opp.scope,
          dateOffsetDays: opp.dateOffsetDays,
          timeOfDay: opp.timeOfDay,
          startTime,
          value: opp.responded?.value ?? opp.value,
          estimatedDurationMinutes: 90,
          equipmentDeliveryStatus: isStarlink ? "Expected Today" : "N/A",
          status: "Confirmed",
          paymentStatus: "Not Applicable",
          attendance: "Pending",
          complianceRequired: opp.complianceRequired,
          wonAt,
        };
      });

      const readyIds = new Set(ready.map((r) => r.id));
      return {
        ...state,
        jobs: [...state.jobs, ...newJobs],
        opportunities: state.opportunities.map((o) =>
          readyIds.has(o.id) ? { ...o, outcome: "selected" } : o,
        ),
      };
    }
    case "reschedule-job": {
      const job = state.jobs.find((j) => j.id === action.jobId);
      if (!job) return state;
      const newStartTime =
        action.toTimeOfDay === "Morning"
          ? "10:00 AM"
          : action.toTimeOfDay === "Afternoon"
            ? "2:00 PM"
            : "5:00 PM";
      const event: JobRescheduleEvent = {
        type: "rescheduled",
        timestamp: new Date().toISOString(),
        fromDateOffsetDays: job.dateOffsetDays,
        fromTimeOfDay: job.timeOfDay,
        toDateOffsetDays: action.toDateOffsetDays,
        toTimeOfDay: action.toTimeOfDay,
        reason: action.reason,
        note: action.note,
      };
      return {
        ...state,
        jobs: state.jobs.map((j) =>
          j.id === action.jobId
            ? {
                ...j,
                dateOffsetDays: action.toDateOffsetDays,
                timeOfDay: action.toTimeOfDay,
                startTime: newStartTime,
                events: [...(j.events ?? []), event],
              }
            : j,
        ),
      };
    }
    default:
      return state;
  }
}

const KEY = "chekku:state:v4";

interface AppStateCtx {
  state: PersistedState;
  dispatch: (a: Action) => void;
  online: boolean;
  hydrated: boolean;
}

const Ctx = createContext<AppStateCtx | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [networkOnline, setNetworkOnline] = useState(true);

  // Hydrate from localStorage. This is the legitimate effect-driven setState
  // pattern flagged by react-hooks/set-state-in-effect — localStorage is
  // unavailable on the server so initial render uses defaults, and we hydrate
  // post-mount on the client. useSyncExternalStore would be the production
  // refactor.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  // Simulated Circl decision tick — promotes any awaiting-too-long opportunity
  // to selected and creates a Job for it. The reducer no-ops if nothing is
  // ready, so the interval is cheap.
  useEffect(() => {
    if (!hydrated) return;
    const id = setInterval(() => {
      setState((s) => reducer(s, { type: "promote-awaiting-opportunities" }));
    }, 5000);
    return () => clearInterval(id);
  }, [hydrated]);

  // Connectivity. The initial setNetworkOnline mirrors navigator.onLine into
  // React state — flagged by react-hooks/set-state-in-effect. The proper fix
  // is useSyncExternalStore subscribing to online/offline events; deferred
  // for the prototype.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setNetworkOnline(navigator.onLine);
    const on = () => setNetworkOnline(true);
    const off = () => setNetworkOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const dispatch = useCallback((a: Action) => {
    setState((s) => reducer(s, a));
  }, []);

  const value = useMemo<AppStateCtx>(
    () => ({
      state,
      dispatch,
      online: networkOnline && !state.forceOffline,
      hydrated,
    }),
    [state, dispatch, networkOnline, hydrated],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used within AppStateProvider");
  return v;
}
