export default function OpportunityDetailLoading() {
  return (
    <main className="animate-pulse pb-8" aria-busy="true" aria-label="Loading opportunity">
      <div className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top,0.5rem)] pb-3">
        <div className="h-10 w-10 rounded-full bg-surface-2" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-44 rounded bg-surface-2" />
          <div className="h-3 w-28 rounded bg-surface-2/70" />
        </div>
      </div>

      <section className="px-4 pt-2">
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-surface-2" />
          <div className="h-6 w-28 rounded-full bg-surface-2" />
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-20 rounded bg-surface-2" />
          <div className="mt-3 h-7 w-32 rounded bg-surface-2" />
          <div className="mt-2 h-3 w-40 rounded bg-surface-2/70" />
        </div>
      </section>

      <section className="mt-3 px-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-20 rounded bg-surface-2" />
          <div className="mt-3 h-3 w-full rounded bg-surface-2/70" />
          <div className="mt-1.5 h-3 w-10/12 rounded bg-surface-2/70" />
          <div className="mt-1.5 h-3 w-6/12 rounded bg-surface-2/70" />
        </div>
      </section>
    </main>
  );
}
