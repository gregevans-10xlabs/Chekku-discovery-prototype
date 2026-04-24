"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getJobs, getOpportunities, getPastOpportunity, JAKE } from "@/lib/demo-data";
import type {
  AttendanceConfirmation,
  Job,
  Opportunity,
  Trade,
} from "@/lib/types";

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
  | { type: "enable-team" };

function defaultState(): PersistedState {
  return {
    onboarded: false,
    hasTeam: false,
    trade: JAKE,
    jobs: getJobs(),
    opportunities: getOpportunities(),
    pastOpportunities: [getPastOpportunity()],
    selectedJobId: null,
    checkedInJobId: null,
    sacDoneJobIds: [],
    irDoneJobIds: [],
    dayView: "morning",
    forceOffline: false,
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
    default:
      return state;
  }
}

const KEY = "chekku:state:v1";

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

  // Hydrate from localStorage
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

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, hydrated]);

  // Connectivity
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
