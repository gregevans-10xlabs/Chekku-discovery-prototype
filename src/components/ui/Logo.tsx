/**
 * Chekku brand mark — rounded-square in emerald accent with a white
 * checkmark glyph. Matches the wordmark + symbol pattern on chekku.au
 * (replacing the previous pencil glyph that didn't match the brand).
 */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-accent [box-shadow:var(--shadow-accent)]"
      style={{ width: size, height: size }}
      aria-label="Chekku"
    >
      <svg
        width={Math.round(size * 0.55)}
        height={Math.round(size * 0.55)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5 12.5l4.5 4.5L19 7"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
