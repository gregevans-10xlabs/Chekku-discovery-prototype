# CoreTechX shared data — sync protocol

These files are vendored copies of canonical data from the Mission
Control prototype. They underpin the cross-app demo coherence — when
Aaron sees Sandbar Electrical Services in Mission Control and then
opens Chekku, he sees the same trade with the same compliance state,
the same recent jobs, and the same in-flight job that's currently
flagged in Logan's queue.

## Source of truth

```
/Users/gregevans/coretechx-discovery-prototype/src/data/trades.ts
/Users/gregevans/coretechx-discovery-prototype/src/data/jobs.ts (subset)
```

That repo is the source of truth for the trade record. This Chekku
copy is read-only from Chekku's perspective — when MC adds a new
trade, updates Sandbar's compliance, or refines a narrative, the
change starts in MC and is mirrored here.

## What's vendored

- **`trades.ts`** — verbatim copy of MC's TRADES array. Chekku derives
  Brett Sandford's identity, compliance, and performance metrics from
  the Sandbar Electrical Services entry.

## What's NOT vendored

- **`jobs.ts`** — MC's job array is too tightly coupled to MC concepts
  (confidenceBreakdown, commitments, autonomy ladders, etc.) to import
  wholesale. Chekku maintains its own job array in `demo-data.ts` but
  cross-references shared CG numbers (e.g. `CG36110`) where the same
  job appears in both apps. When Aaron is shown the same CG number in
  both prototypes, the customer / suburb / value / scope must match —
  enforced by a manual check, not a runtime import.

- **`scenarios.ts`, `finance.ts`, `outcomes.ts`, `goals.ts`,
  `tickets.ts`** — MC-only operational concerns; not relevant to
  Chekku's trade-facing surfaces.

## Sync protocol

When MC's data changes:

1. Diff the upstream `trades.ts` against this directory's copy
2. Replace the local copy verbatim if the change is purely data
   (compliance refresh, narrative tweak, new trade entry)
3. If the type definitions changed in MC, update both this copy and
   any Chekku consumers that depend on those types
4. Run `npm run build` in Chekku to surface any breakage
5. Commit with a `coretechx-data: sync from MC` message and reference
   the MC commit hash that introduced the upstream change

When Chekku needs new data that should also exist in MC (e.g.
enriching Brett's job universe):

1. Draft the additions here first, prove they work in Chekku
2. Mirror to MC's `jobs.ts` / `trades.ts` as a separate PR on that repo
3. Both repos commit roughly together so the demo state stays aligned

## Last sync

| File | Source commit | Date |
|---|---|---|
| `trades.ts` | `f0c2f26` (Sandbar narrative — cross-app demo arc) | 8 May 2026 |
