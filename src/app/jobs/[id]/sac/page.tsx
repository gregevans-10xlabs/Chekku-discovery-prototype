"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { useFormState, useStepState } from "@/lib/state/useFormState";
import { FormShell } from "@/components/job/FormShell";
import { PhotoCapture, type CapturedPhoto } from "@/components/job/PhotoCapture";
import { SignaturePad } from "@/components/job/SignaturePad";

const STEPS = [
  "Job Info",
  "Site Entry",
  "Photos",
  "Hazards",
  "Readiness",
  "Sign Off",
];

interface SacState {
  swmsPhoto: CapturedPhoto | null;
  scopeReviewed: boolean;
  addTeam: boolean;
  // Team members from the trade's roster who are on site for this job.
  // Captured during SAC for site-evidence — what's stored is the audit
  // record of who attested to the safety check.
  teamMembersOnSite: string[];
  // Free-text crew names for helpers who aren't in the trade's Chekku
  // roster (mate giving a hand for the day, etc.).
  crewNames: string;
  siteSafe: "" | "yes" | "no";
  safetyPhoto: CapturedPhoto | null;
  risks: "" | "none" | "yes";
  riskPhoto: CapturedPhoto | null;
  hazardsNone: boolean;
  hazardsHeights: boolean;
  hazardsElectrical: boolean;
  hazardsEnvironment: boolean;
  hazardsManual: boolean;
  controls: string;
  customerAwareness: boolean;
  fitForWork: boolean;
  understandTask: boolean;
  correctTools: boolean;
  controlsInPlace: boolean;
  decision: "" | "proceed" | "stop";
  signature: string | null;
}

const INITIAL: SacState = {
  swmsPhoto: null,
  scopeReviewed: false,
  addTeam: false,
  teamMembersOnSite: [],
  crewNames: "",
  siteSafe: "",
  safetyPhoto: null,
  risks: "",
  riskPhoto: null,
  hazardsNone: false,
  hazardsHeights: false,
  hazardsElectrical: false,
  hazardsEnvironment: false,
  hazardsManual: false,
  controls: "",
  customerAwareness: false,
  fitForWork: false,
  understandTask: false,
  correctTools: false,
  controlsInPlace: false,
  decision: "",
  signature: null,
};

export default function SacPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const [step, setStep] = useStepState(`sac:${id}`, 0);
  const [data, update] = useFormState<SacState>(`sac:${id}`, INITIAL);
  const job = state.jobs.find((j) => j.id === id);
  if (!job) {
    router.replace("/home");
    return null;
  }

  const hasAnyHazard =
    data.hazardsHeights ||
    data.hazardsElectrical ||
    data.hazardsEnvironment ||
    data.hazardsManual;

  const canNext = (() => {
    switch (step) {
      case 0:
        return !!data.swmsPhoto && data.scopeReviewed;
      case 1:
        return data.siteSafe === "yes";
      case 2:
        return !!data.safetyPhoto && data.risks !== "" && (data.risks === "none" || !!data.riskPhoto);
      case 3:
        return (
          (data.hazardsNone || hasAnyHazard) &&
          (!hasAnyHazard || data.controls.trim().length > 0) &&
          data.customerAwareness
        );
      case 4:
        return (
          data.fitForWork &&
          data.understandTask &&
          data.correctTools &&
          data.controlsInPlace &&
          data.decision === "proceed"
        );
      case 5:
        return !!data.signature;
      default:
        return false;
    }
  })();

  const gateMessage = (() => {
    switch (step) {
      case 0:
        return "Photograph your SWMS and confirm scope review to continue.";
      case 1:
        return "If the site is not safe, do not proceed. Contact Circl Support.";
      case 2:
        return "Capture the site safety photo and confirm risk assessment.";
      case 3:
        return hasAnyHazard
          ? "Describe controls and confirm customer awareness."
          : "Select hazards (or No Hazards) and confirm customer awareness.";
      case 4:
        return "Tick all readiness items and choose Safe to Proceed.";
      case 5:
        return "Sign to submit the checklist.";
      default:
        return undefined;
    }
  })();

  const onNext = () => {
    if (!canNext) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      dispatch({ type: "mark-sac-done", jobId: id });
      router.push(`/jobs/${id}`);
    }
  };

  return (
    <FormShell
      title="Site Arrival Checklist"
      subtitle={`${job.cgNumber} · ${job.type}`}
      stepNames={STEPS}
      current={step}
      onBack={() => (step === 0 ? router.push(`/jobs/${id}`) : setStep(step - 1))}
      canNext={canNext}
      onNext={onNext}
      nextLabel={step === STEPS.length - 1 ? "Submit checklist" : undefined}
      gateMessage={gateMessage}
      exitHref={`/jobs/${id}`}
    >
      {step === 0 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold">Job info</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Technician">{state.trade.fullName}</Row>
            <Row label="Address">
              {job.customer.address}, {job.customer.suburb} NSW
            </Row>
            <Row label="Installation type">
              {job.client === "Starlink" ? job.type : `${job.client} — ${job.type}`}
            </Row>
            <Row label="Scope of work">
              <span className="text-xs text-muted">{job.scope}</span>
            </Row>
          </dl>

          <PhotoCapture
            label="Photograph the SWMS you're using for this job"
            required
            value={data.swmsPhoto}
            onChange={(p) => update({ swmsPhoto: p })}
            hint="Required — a trade without a SWMS cannot start the job."
          />

          {!data.swmsPhoto ? (
            <Link
              href="/profile/library"
              className="block rounded-xl border border-info/30 bg-info/10 p-3 text-[12px] text-foreground/90"
            >
              <span className="font-semibold text-info">
                Don&apos;t have a SWMS for this job?
              </span>{" "}
              Get a pre-filled template from the Document library →
            </Link>
          ) : null}

          <Toggle
            label="I have reviewed the scope of work against my SWMS"
            checked={data.scopeReviewed}
            onChange={(v) => update({ scopeReviewed: v })}
          />

          <div>
            <Toggle
              label="Add team members (subcontractor or crew on site)"
              sub="Records who else is attending — for site evidence."
              checked={data.addTeam}
              onChange={(v) =>
                update({
                  addTeam: v,
                  // Clear the picker when the toggle goes off so the
                  // captured roster doesn't quietly persist out of view.
                  teamMembersOnSite: v ? data.teamMembersOnSite : [],
                  crewNames: v ? data.crewNames : "",
                })
              }
            />

            {data.addTeam ? (
              <div className="mt-3 space-y-3 rounded-2xl border border-border bg-surface p-3">
                {state.hasTeam && state.team.members.length > 0 ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                      From your team
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {state.team.members.map((m) => {
                        const checked = data.teamMembersOnSite.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              update({
                                teamMembersOnSite: checked
                                  ? data.teamMembersOnSite.filter(
                                      (x) => x !== m.id,
                                    )
                                  : [...data.teamMembersOnSite, m.id],
                              })
                            }
                            className={
                              "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors " +
                              (checked
                                ? "border-accent bg-accent-soft"
                                : "border-border-strong bg-surface")
                            }
                          >
                            <span
                              className={
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border " +
                                (checked
                                  ? "border-accent bg-accent text-white"
                                  : "border-border-strong")
                              }
                            >
                              {checked ? "✓" : ""}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-semibold">
                                {m.name}
                              </span>
                              <span className="block text-[11px] text-muted">
                                {m.role}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Other crew on site (optional)
                  </label>
                  <input
                    value={data.crewNames}
                    onChange={(e) => update({ crewNames: e.target.value })}
                    placeholder={
                      state.hasTeam
                        ? "e.g. Dave (mate helping today)"
                        : "Names of anyone helping on site"
                    }
                    className="mt-1 w-full rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-[13px] outline-none focus:border-accent"
                  />
                </div>

                <p className="text-[11px] text-muted-strong">
                  Each named team member confirms their own SWMS / PPE on
                  their own device. This list is the site evidence record.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold">Is the site safe to enter?</h2>
          <p className="mt-2 text-sm text-muted">
            Check for obvious hazards before stepping on site.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <BigChoice
              label="Yes"
              tone="success"
              selected={data.siteSafe === "yes"}
              onClick={() => update({ siteSafe: "yes" })}
            />
            <BigChoice
              label="No"
              tone="danger"
              selected={data.siteSafe === "no"}
              onClick={() => update({ siteSafe: "no" })}
            />
          </div>
          {data.siteSafe === "no" ? (
            <div className="mt-6 rounded-2xl border border-danger/40 bg-danger/10 p-4">
              <p className="font-semibold text-danger">Do not proceed.</p>
              <p className="mt-1 text-xs text-foreground/90">
                Contact Circl Support before taking any action.
              </p>
              <a
                href="tel:+61280000000"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-danger px-5 py-2 text-sm font-semibold text-white"
              >
                Call Circl Support
              </a>
            </div>
          ) : null}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold">Site safety photos</h2>
          <PhotoCapture
            label="Site safety photo"
            required
            value={data.safetyPhoto}
            onChange={(p) => update({ safetyPhoto: p })}
            hint="Capture now — timestamp is embedded at capture, not at sync."
          />

          <div>
            <p className="text-sm font-semibold">
              Visible risks?<span className="ml-1 text-accent">*</span>
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <BigChoice
                label="No visible risks"
                tone="success"
                size="sm"
                selected={data.risks === "none"}
                onClick={() => update({ risks: "none", riskPhoto: null })}
              />
              <BigChoice
                label="Yes — risks"
                tone="warn"
                size="sm"
                selected={data.risks === "yes"}
                onClick={() => update({ risks: "yes" })}
              />
            </div>
          </div>

          {data.risks === "yes" ? (
            <PhotoCapture
              label="Risk photo"
              required
              value={data.riskPhoto}
              onChange={(p) => update({ riskPhoto: p })}
              hint="Anything flagged as high-risk in your SWMS requires a comment on the photo."
            />
          ) : null}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Hazards on site</h2>
          <p className="text-sm text-muted">
            Select categories that apply. Describe the controls you will put in
            place.
          </p>

          <Toggle
            label="No hazards identified"
            checked={data.hazardsNone}
            onChange={(v) =>
              update({
                hazardsNone: v,
                hazardsHeights: v ? false : data.hazardsHeights,
                hazardsElectrical: v ? false : data.hazardsElectrical,
                hazardsEnvironment: v ? false : data.hazardsEnvironment,
                hazardsManual: v ? false : data.hazardsManual,
                controls: v ? "" : data.controls,
              })
            }
          />

          <div className="space-y-2">
            <Toggle
              label="Working at Height"
              sub="Ladder required · Roof access · Near edge · Fragile roofing"
              checked={data.hazardsHeights}
              onChange={(v) => update({ hazardsHeights: v, hazardsNone: false })}
            />
            <Toggle
              label="Electrical Risks"
              sub="Live circuits · Unknown wiring · Near mains"
              checked={data.hazardsElectrical}
              onChange={(v) =>
                update({ hazardsElectrical: v, hazardsNone: false })
              }
            />
            <Toggle
              label="External Environment"
              sub="Wind · Rain · Sun · Unstable ground"
              checked={data.hazardsEnvironment}
              onChange={(v) =>
                update({ hazardsEnvironment: v, hazardsNone: false })
              }
            />
            <Toggle
              label="Manual Handling"
              sub="Heavy equipment · Awkward access · Two-person lift"
              checked={data.hazardsManual}
              onChange={(v) =>
                update({ hazardsManual: v, hazardsNone: false })
              }
            />
          </div>

          {hasAnyHazard ? (
            <div>
              <label className="text-sm font-semibold">
                Controls applied<span className="ml-1 text-accent">*</span>
              </label>
              <textarea
                value={data.controls}
                onChange={(e) => update({ controls: e.target.value })}
                rows={3}
                placeholder="Describe the controls you have in place for the hazards selected above."
                className="mt-1 w-full rounded-xl border border-border-strong bg-surface p-3 text-sm outline-none focus:border-accent"
              />
            </div>
          ) : null}

          <Toggle
            label="I have made the customer aware of any hazards identified on site"
            checked={data.customerAwareness}
            onChange={(v) => update({ customerAwareness: v })}
          />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Readiness</h2>
          <p className="text-sm text-muted">
            Confirm each of the following, then decide.
          </p>

          <button
            type="button"
            onClick={() =>
              update({
                fitForWork: true,
                understandTask: true,
                correctTools: true,
                controlsInPlace: true,
              })
            }
            className="w-full rounded-xl bg-accent-soft py-2.5 text-sm font-semibold text-accent"
            style={{ minHeight: 44 }}
          >
            All good — tick all
          </button>

          <div className="space-y-2">
            <Toggle
              label="I am fit for work"
              checked={data.fitForWork}
              onChange={(v) => update({ fitForWork: v })}
            />
            <Toggle
              label="I understand the task"
              checked={data.understandTask}
              onChange={(v) => update({ understandTask: v })}
            />
            <Toggle
              label="I have the correct tools"
              checked={data.correctTools}
              onChange={(v) => update({ correctTools: v })}
            />
            <Toggle
              label="Controls applied are in accordance with my SWMS"
              checked={data.controlsInPlace}
              onChange={(v) => update({ controlsInPlace: v })}
            />
          </div>

          <div className="pt-2">
            <p className="text-sm font-semibold">
              Decision<span className="ml-1 text-accent">*</span>
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <BigChoice
                label="Safe to proceed"
                tone="success"
                size="sm"
                selected={data.decision === "proceed"}
                onClick={() => update({ decision: "proceed" })}
              />
              <BigChoice
                label="Stop work & escalate"
                tone="danger"
                size="sm"
                selected={data.decision === "stop"}
                onClick={() => update({ decision: "stop" })}
              />
            </div>
            {data.decision === "stop" ? (
              <div className="mt-4 rounded-2xl border border-danger/40 bg-danger/10 p-4">
                <p className="font-semibold text-danger">Do not proceed.</p>
                <p className="mt-1 text-xs text-foreground/90">
                  Contact Circl Support before taking further action.
                </p>
                <a
                  href="tel:+61280000000"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-danger px-5 py-2 text-sm font-semibold text-white"
                >
                  Call Circl Support
                </a>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Sign off</h2>
          <p className="text-sm text-muted">
            Your signature confirms the site is safe and controls are in place.
            This is the legal record.
          </p>

          {/* On-site roster summary — surfaces what the signer is attesting */}
          {data.addTeam &&
          (data.teamMembersOnSite.length > 0 || data.crewNames.trim()) ? (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                On site for this job
              </p>
              <ul className="mt-2 space-y-1 text-[13px]">
                <li className="flex items-center gap-2">
                  <span className="text-accent">•</span>
                  <span className="font-semibold">{state.trade.fullName}</span>
                  <span className="text-[11px] text-muted">(you)</span>
                </li>
                {data.teamMembersOnSite.map((mid) => {
                  const m = state.team.members.find((x) => x.id === mid);
                  if (!m) return null;
                  return (
                    <li key={mid} className="flex items-center gap-2">
                      <span className="text-accent">•</span>
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-[11px] text-muted">({m.role})</span>
                    </li>
                  );
                })}
                {data.crewNames.trim() ? (
                  <li className="flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>{data.crewNames}</span>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          <SignaturePad
            value={data.signature}
            onChange={(v) => update({ signature: v })}
          />
          <p className="text-xs text-muted-strong">
            Rotating your phone to landscape gives a wider signature canvas.
          </p>
        </div>
      )}
    </FormShell>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-surface px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function Toggle({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors " +
        (checked
          ? "border-accent bg-accent-soft"
          : "border-border-strong bg-surface")
      }
    >
      <span
        className={
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border " +
          (checked
            ? "border-accent bg-accent text-white"
            : "border-border-strong")
        }
      >
        {checked ? "✓" : ""}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        {sub ? <span className="block text-xs text-muted">{sub}</span> : null}
      </span>
    </button>
  );
}

function BigChoice({
  label,
  tone,
  selected,
  onClick,
  size = "md",
}: {
  label: string;
  tone: "success" | "warn" | "danger";
  selected: boolean;
  onClick: () => void;
  size?: "md" | "sm";
}) {
  const base =
    "w-full rounded-2xl border font-semibold transition-colors " +
    (size === "md" ? "py-6 text-lg" : "py-3 text-sm");
  const toneCls = {
    success: selected
      ? "border-success bg-success/20 text-success"
      : "border-border-strong bg-surface text-foreground",
    warn: selected
      ? "border-warn bg-warn/20 text-warn"
      : "border-border-strong bg-surface text-foreground",
    danger: selected
      ? "border-danger bg-danger/20 text-danger"
      : "border-border-strong bg-surface text-foreground",
  }[tone];
  return (
    <button type="button" onClick={onClick} className={`${base} ${toneCls}`}>
      {label}
    </button>
  );
}
