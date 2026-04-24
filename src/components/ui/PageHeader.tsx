"use client";

import { useRouter } from "next/navigation";

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, back, onBack, right }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="flex items-center gap-2 px-4 pt-[env(safe-area-inset-top,0.5rem)] pb-3">
        {back ? (
          <button
            type="button"
            onClick={() => (onBack ? onBack() : router.back())}
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
        ) : (
          <div className="w-10" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-muted">{subtitle}</p>
          ) : null}
        </div>
        <div className="shrink-0">{right}</div>
      </div>
    </header>
  );
}
