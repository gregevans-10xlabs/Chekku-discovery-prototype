"use client";

import { useRouter } from "next/navigation";

interface Props {
  step: number;
  total?: number;
  onBack?: () => void;
}

export function OnboardingHeader({ step, total = 5, onBack }: Props) {
  const router = useRouter();
  const pct = Math.round((step / total) * 100);
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : router.back())}
          aria-label="Back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:text-foreground"
          style={{ minHeight: 40 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-muted">
            <span>
              Step {step} of {total}
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
