"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/state/AppStateProvider";
import { useFormState, useStepState } from "@/lib/state/useFormState";
import { FormShell } from "@/components/job/FormShell";
import { PhotoCapture, type CapturedPhoto } from "@/components/job/PhotoCapture";
import { SignaturePad } from "@/components/job/SignaturePad";

const STEPS = [
  "Walkthrough",
  "Asset",
  "Photos",
  "Cleanliness",
  "Controls",
  "Education",
  "Sign Off",
  "Notes",
];

type YesNoNa = "" | "yes" | "no" | "na";

interface IrState {
  // Step 1 — Walkthrough (universal)
  scopeExplained: YesNoNa;
  variationsDisclosed: YesNoNa;
  preExistingDamage: YesNoNa;
  // Step 2 — Asset (Starlink)
  dishMounted: YesNoNa;
  cableTidy: YesNoNa;
  wallAccessTidy: YesNoNa;
  signalUnobstructed: YesNoNa;
  // Step 3 — Photos (Starlink)
  photoDish: CapturedPhoto | null;
  photoRouter: CapturedPhoto | null;
  photoSpeedTest: CapturedPhoto | null;
  photoAlignment: CapturedPhoto | null;
  photoCablePath: CapturedPhoto | null;
  photoExtra1: CapturedPhoto | null;
  photoExtra2: CapturedPhoto | null;
  // Step 4 — Cleanliness
  areaClean: boolean;
  cleanPhoto: CapturedPhoto | null;
  propertyDamage: YesNoNa;
  // Step 5 — Risk controls (optional)
  ctrlPhoto1: CapturedPhoto | null;
  ctrlPhoto2: CapturedPhoto | null;
  ctrlPhoto3: CapturedPhoto | null;
  ctrlPhoto4: CapturedPhoto | null;
  // Step 6 — Education (Starlink)
  starlinkAppGuidance: boolean;
  // Step 7 — Sign-off
  worksAsPerScope: YesNoNa;
  customerHappy: YesNoNa;
  customerSignature: string | null;
  // Step 8 — Trade notes
  tradeNotes: string;
  // Placeholder progress marker for HN flows
  hnPlaceholderAcknowledged: boolean;
}

const INITIAL: IrState = {
  scopeExplained: "",
  variationsDisclosed: "",
  preExistingDamage: "",
  dishMounted: "",
  cableTidy: "",
  wallAccessTidy: "",
  signalUnobstructed: "",
  photoDish: null,
  photoRouter: null,
  photoSpeedTest: null,
  photoAlignment: null,
  photoCablePath: null,
  photoExtra1: null,
  photoExtra2: null,
  areaClean: false,
  cleanPhoto: null,
  propertyDamage: "",
  ctrlPhoto1: null,
  ctrlPhoto2: null,
  ctrlPhoto3: null,
  ctrlPhoto4: null,
  starlinkAppGuidance: false,
  worksAsPerScope: "",
  customerHappy: "",
  customerSignature: null,
  tradeNotes: "",
  hnPlaceholderAcknowledged: false,
};

export default function IrPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const [step, setStep] = useStepState(`ir:${id}`, 0);
  const [data, update] = useFormState<IrState>(`ir:${id}`, INITIAL);
  const job = state.jobs.find((j) => j.id === id);
  if (!job) {
    router.replace("/home");
    return null;
  }

  const isStarlink = job.type === "Starlink Installation";

  const canNext = (() => {
    switch (step) {
      case 0:
        return (
          data.scopeExplained !== "" &&
          data.variationsDisclosed !== "" &&
          data.preExistingDamage !== ""
        );
      case 1:
        if (!isStarlink) return true;
        return (
          data.dishMounted === "yes" &&
          data.cableTidy === "yes" &&
          data.wallAccessTidy === "yes" &&
          data.signalUnobstructed === "yes"
        );
      case 2:
        if (!isStarlink) return true;
        return (
          !!data.photoDish &&
          !!data.photoRouter &&
          !!data.photoSpeedTest &&
          !!data.photoAlignment &&
          !!data.photoCablePath
        );
      case 3:
        return data.areaClean && !!data.cleanPhoto && data.propertyDamage !== "";
      case 4:
        return true; // risk control photos are optional
      case 5:
        if (!isStarlink) return true;
        return data.starlinkAppGuidance;
      case 6:
        return (
          data.worksAsPerScope === "yes" &&
          data.customerHappy === "yes" &&
          !!data.customerSignature
        );
      case 7:
        return true;
      default:
        return false;
    }
  })();

  const gateMessage = (() => {
    switch (step) {
      case 0:
        return "Answer all three walkthrough confirmations.";
      case 1:
        return isStarlink
          ? "Confirm all four asset checks."
          : undefined;
      case 2:
        return isStarlink
          ? "Capture all five required photos before continuing."
          : undefined;
      case 3:
        return "Confirm cleanliness, capture the clean area photo, and answer property damage.";
      case 5:
        return isStarlink ? "Confirm the customer education step." : undefined;
      case 6:
        return "Both customer confirmations plus signature are required.";
      default:
        return undefined;
    }
  })();

  const onNext = () => {
    if (!canNext) return;
    if (step === 6) {
      // Step 7 (Sign Off) — this is the Job Complete moment per spec
      dispatch({ type: "mark-ir-done", jobId: id });
      dispatch({ type: "complete-job", jobId: id });
      setStep(7);
      window.scrollTo(0, 0);
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Step 8 — Submit Evidence (non-blocking notes), exit
      router.push(`/jobs/${id}`);
    }
  };

  const nextLabel =
    step === 6 ? "Job Complete" : step === 7 ? "Submit Evidence" : undefined;

  return (
    <FormShell
      title="Installation Report"
      subtitle={`${job.cgNumber} · ${job.type}`}
      stepNames={STEPS}
      current={step}
      onBack={() => (step === 0 ? router.push(`/jobs/${id}`) : setStep(step - 1))}
      canNext={canNext}
      onNext={onNext}
      nextLabel={nextLabel}
      gateMessage={gateMessage}
      exitHref={`/jobs/${id}`}
    >
      {step === 0 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold">Walkthrough</h2>
          <p className="text-sm text-muted">
            Three customer confirmations before work begins.
          </p>
          <YesNoField
            label="Scope of work explained to customer prior to starting"
            value={data.scopeExplained}
            onChange={(v) => update({ scopeExplained: v })}
          />
          <YesNoField
            label="Customer made aware of possible variations"
            value={data.variationsDisclosed}
            onChange={(v) => update({ variationsDisclosed: v })}
            includeNa
          />
          <YesNoField
            label="Pre-existing damage noted before works start"
            value={data.preExistingDamage}
            onChange={(v) => update({ preExistingDamage: v })}
          />
        </div>
      )}

      {step === 1 &&
        (isStarlink ? (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Asset check — Starlink</h2>
            <YesNoField
              label="Dish mounted securely"
              value={data.dishMounted}
              onChange={(v) => update({ dishMounted: v })}
            />
            <YesNoField
              label="Cable run tidy"
              value={data.cableTidy}
              onChange={(v) => update({ cableTidy: v })}
            />
            <YesNoField
              label="Wall access point tidy"
              value={data.wallAccessTidy}
              onChange={(v) => update({ wallAccessTidy: v })}
            />
            <YesNoField
              label="Signal unobstructed at mount location"
              value={data.signalUnobstructed}
              onChange={(v) => update({ signalUnobstructed: v })}
            />
          </div>
        ) : (
          <HnPlaceholder step="Asset Check" client={job.client} />
        ))}

      {step === 2 &&
        (isStarlink ? (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">Required photos</h2>
            <p className="text-sm text-muted">
              All five are required. Two extra slots are optional.
            </p>
            <PhotoCapture
              label="Dish"
              required
              value={data.photoDish}
              onChange={(p) => update({ photoDish: p })}
            />
            <PhotoCapture
              label="Router"
              required
              value={data.photoRouter}
              onChange={(p) => update({ photoRouter: p })}
            />
            <PhotoCapture
              label="Speed Test"
              required
              value={data.photoSpeedTest}
              onChange={(p) => update({ photoSpeedTest: p })}
            />
            <PhotoCapture
              label="Alignment"
              required
              value={data.photoAlignment}
              onChange={(p) => update({ photoAlignment: p })}
            />
            <PhotoCapture
              label="Cable Path"
              required
              value={data.photoCablePath}
              onChange={(p) => update({ photoCablePath: p })}
            />
            <PhotoCapture
              label="Extra photo 1 (optional)"
              value={data.photoExtra1}
              onChange={(p) => update({ photoExtra1: p })}
            />
            <PhotoCapture
              label="Extra photo 2 (optional)"
              value={data.photoExtra2}
              onChange={(p) => update({ photoExtra2: p })}
            />
          </div>
        ) : (
          <HnPlaceholder step="Photos" client={job.client} />
        ))}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold">Cleanliness</h2>
          <Toggle
            label="The work area has been left clean"
            checked={data.areaClean}
            onChange={(v) => update({ areaClean: v })}
          />
          <PhotoCapture
            label="Clean area photo"
            required
            value={data.cleanPhoto}
            onChange={(p) => update({ cleanPhoto: p })}
          />
          <YesNoField
            label="Was any damage caused to the property as a result of work"
            value={data.propertyDamage}
            onChange={(v) => update({ propertyDamage: v })}
          />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold">Risk control photos</h2>
          <p className="text-sm text-muted">
            Optional — tie these back to high-risk tasks identified on site.
          </p>
          <PhotoCapture
            label="Control photo 1"
            value={data.ctrlPhoto1}
            onChange={(p) => update({ ctrlPhoto1: p })}
          />
          <PhotoCapture
            label="Control photo 2"
            value={data.ctrlPhoto2}
            onChange={(p) => update({ ctrlPhoto2: p })}
          />
          <PhotoCapture
            label="Control photo 3"
            value={data.ctrlPhoto3}
            onChange={(p) => update({ ctrlPhoto3: p })}
          />
          <PhotoCapture
            label="Control photo 4"
            value={data.ctrlPhoto4}
            onChange={(p) => update({ ctrlPhoto4: p })}
          />
        </div>
      )}

      {step === 5 &&
        (isStarlink ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Customer education</h2>
            <p className="text-sm text-muted">
              Client-specific confirmation that the customer has been educated
              on product usage.
            </p>
            <Toggle
              label="I have provided the customer guidance on how to use the Starlink App"
              checked={data.starlinkAppGuidance}
              onChange={(v) => update({ starlinkAppGuidance: v })}
            />
          </div>
        ) : (
          <HnPlaceholder step="Education" client={job.client} />
        ))}

      {step === 6 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold">Customer sign off</h2>
          <p className="text-sm text-muted">
            Have the customer read and confirm the following. Their signature
            is the acceptance record.
          </p>
          <YesNoField
            label="Works were completed as per the scope explained to me"
            value={data.worksAsPerScope}
            onChange={(v) => update({ worksAsPerScope: v })}
          />
          <YesNoField
            label="I am happy with the completed works"
            value={data.customerHappy}
            onChange={(v) => update({ customerHappy: v })}
          />
          <SignaturePad
            label="Customer signature"
            value={data.customerSignature}
            onChange={(v) => update({ customerSignature: v })}
          />
          <div className="rounded-xl bg-surface p-3 text-xs text-muted">
            The customer satisfaction rating isn’t collected here — we send it
            as a separate prompt after you leave site.
          </div>
        </div>
      )}

      {step === 7 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-center">
            <p className="text-xl">✓</p>
            <p className="mt-1 text-sm font-semibold text-success">
              Job complete — RCTI is being generated
            </p>
          </div>
          <h2 className="text-xl font-bold">Trade notes</h2>
          <p className="text-sm text-muted">
            Optional. Add context about the job, changes made, or observations.
            This can be submitted after you leave site.
          </p>
          <textarea
            value={data.tradeNotes}
            onChange={(e) => update({ tradeNotes: e.target.value })}
            rows={6}
            placeholder="Work performed, changes from scope, or notes for Circl ops."
            className="w-full rounded-xl border border-border-strong bg-surface p-3 text-sm outline-none focus:border-accent"
          />
          <div className="rounded-xl bg-surface p-3 text-xs text-muted">
            Customer satisfaction prompt will dispatch after you leave site (geo
            check-out). You don’t need to do anything.
          </div>
        </div>
      )}
    </FormShell>
  );
}

function YesNoField({
  label,
  value,
  onChange,
  includeNa,
}: {
  label: string;
  value: YesNoNa;
  onChange: (v: YesNoNa) => void;
  includeNa?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">
        {label}
        <span className="ml-1 text-accent">*</span>
      </p>
      <div
        className={
          "mt-2 grid gap-2 " +
          (includeNa ? "grid-cols-3" : "grid-cols-2")
        }
      >
        <Pill
          label="Yes"
          tone="success"
          selected={value === "yes"}
          onClick={() => onChange("yes")}
        />
        <Pill
          label="No"
          tone="danger"
          selected={value === "no"}
          onClick={() => onChange("no")}
        />
        {includeNa ? (
          <Pill
            label="N/A"
            tone="neutral"
            selected={value === "na"}
            onClick={() => onChange("na")}
          />
        ) : null}
      </div>
    </div>
  );
}

function Pill({
  label,
  tone,
  selected,
  onClick,
}: {
  label: string;
  tone: "success" | "danger" | "neutral";
  selected: boolean;
  onClick: () => void;
}) {
  const toneCls =
    tone === "success"
      ? selected
        ? "border-success bg-success/20 text-success"
        : "border-border-strong bg-surface"
      : tone === "danger"
        ? selected
          ? "border-danger bg-danger/20 text-danger"
          : "border-border-strong bg-surface"
        : selected
          ? "border-muted bg-surface-2 text-foreground"
          : "border-border-strong bg-surface";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-xl border py-3 text-sm font-semibold transition-colors " +
        toneCls
      }
    >
      {label}
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        "flex w-full items-center gap-3 rounded-2xl border p-3 text-left " +
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
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function HnPlaceholder({
  step,
  client,
}: {
  step: string;
  client: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{step}</h2>
      <div className="rounded-2xl border border-info/30 bg-info/10 p-5 text-sm">
        <p className="font-semibold text-info">
          {step} varies by job type.
        </p>
        <p className="mt-1 text-foreground/90">
          {client} {step.toLowerCase()} is a future build. Tap Continue to
          advance through the universal steps.
        </p>
        <p className="mt-3 text-xs text-muted">
          Aaron: this screen demonstrates that form steps are configurable per
          job type — defined in Mission Control, not in app code.
        </p>
      </div>
    </div>
  );
}
