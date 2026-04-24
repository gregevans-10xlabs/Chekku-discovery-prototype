export default function RescheduleLoading() {
  return (
    <main
      className="animate-pulse pb-8"
      aria-busy="true"
      aria-label="Loading reschedule"
    >
      <div className="flex items-center gap-3 px-4 pt-[env(safe-area-inset-top,0.5rem)] pb-3">
        <div className="h-10 w-10 rounded-full bg-surface-2" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-40 rounded bg-surface-2" />
          <div className="h-3 w-28 rounded bg-surface-2/70" />
        </div>
      </div>

      <section className="mt-2 px-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="h-3 w-24 rounded bg-surface-2" />
          <div className="mt-2 h-4 w-40 rounded bg-surface-2" />
          <div className="mt-2 h-3 w-full rounded bg-surface-2/70" />
          <div className="mt-1 h-3 w-9/12 rounded bg-surface-2/70" />
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="h-64 rounded-2xl border border-border bg-surface" />
      </section>

      <section className="mt-4 px-4">
        <div className="h-3 w-20 rounded bg-surface-2" />
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <div className="h-10 rounded-xl bg-surface-2" />
          <div className="h-10 rounded-xl bg-surface-2" />
          <div className="h-10 rounded-xl bg-surface-2" />
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="h-3 w-16 rounded bg-surface-2" />
        <div className="mt-2 h-12 rounded-xl bg-surface-2" />
      </section>
    </main>
  );
}
