export default function JobDetailLoading() {
  return (
    <main className="animate-pulse pb-8" aria-busy="true" aria-label="Loading job">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top,0.5rem)] pb-3">
        <div className="h-10 w-10 rounded-full bg-surface-2" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-40 rounded bg-surface-2" />
          <div className="h-3 w-28 rounded bg-surface-2/70" />
        </div>
      </div>

      {/* Status strip */}
      <section className="px-4 pt-2">
        <div className="flex gap-2">
          <div className="h-6 w-24 rounded-full bg-surface-2" />
          <div className="h-6 w-32 rounded-full bg-surface-2" />
        </div>
      </section>

      {/* Customer card */}
      <section className="mt-4 px-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-16 rounded bg-surface-2" />
          <div className="mt-2 h-4 w-44 rounded bg-surface-2" />
          <div className="mt-2 h-3 w-32 rounded bg-surface-2/70" />
          <div className="mt-1.5 h-3 w-40 rounded bg-surface-2/70" />
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="h-12 rounded-xl bg-surface-2" />
            <div className="h-12 rounded-xl bg-surface-2" />
            <div className="h-12 rounded-xl bg-surface-2" />
          </div>
        </div>
      </section>

      {/* Scope card */}
      <section className="mt-3 px-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-28 rounded bg-surface-2" />
          <div className="mt-3 h-3 w-full rounded bg-surface-2/70" />
          <div className="mt-1.5 h-3 w-11/12 rounded bg-surface-2/70" />
          <div className="mt-1.5 h-3 w-7/12 rounded bg-surface-2/70" />
        </div>
      </section>

      {/* Workflow steps */}
      <section className="mt-5 px-4">
        <div className="mb-2 h-3 w-24 rounded bg-surface-2" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
            >
              <div className="h-9 w-9 shrink-0 rounded-full bg-surface-2" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 rounded bg-surface-2" />
                <div className="h-3 w-44 rounded bg-surface-2/70" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
