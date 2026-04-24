"use client";

import { useRouter } from "next/navigation";
import { StepProgress } from "@/components/ui/StepProgress";
import { Button } from "@/components/ui/Button";

interface Props {
  title: string;
  subtitle?: string;
  stepNames: string[];
  current: number;
  onBack: () => void;
  canNext: boolean;
  onNext: () => void;
  nextLabel?: string;
  gateMessage?: string;
  children: React.ReactNode;
  exitHref?: string;
}

export function FormShell({
  title,
  subtitle,
  stepNames,
  current,
  onBack,
  canNext,
  onNext,
  nextLabel,
  gateMessage,
  children,
  exitHref,
}: Props) {
  const router = useRouter();
  const exit = () => {
    if (exitHref) router.push(exitHref);
    else router.back();
  };
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 px-4 pt-[env(safe-area-inset-top,0.5rem)] pb-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-surface"
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
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold">{title}</h1>
            {subtitle ? (
              <p className="truncate text-[11px] text-muted">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={exit}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:text-foreground"
            style={{ minHeight: 40 }}
          >
            ✕
          </button>
        </div>
        <StepProgress
          current={current}
          total={stepNames.length}
          names={stepNames}
        />
      </header>

      <section className="flex-1 px-5 pt-5 pb-6">{children}</section>

      <footer className="sticky bottom-0 border-t border-border bg-background px-5 pb-6 pt-3 safe-bottom">
        {gateMessage && !canNext ? (
          <p className="mb-2 text-center text-xs text-warn">
            {gateMessage}
          </p>
        ) : null}
        <Button disabled={!canNext} onClick={onNext}>
          {nextLabel ??
            (current === stepNames.length - 1 ? "Submit" : "Continue")}
        </Button>
      </footer>
    </main>
  );
}
