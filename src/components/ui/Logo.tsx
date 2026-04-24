export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-accent shadow-[0_10px_30px_rgba(249,115,22,0.4)]"
      style={{ width: size, height: size }}
      aria-label="Chekku"
    >
      <svg
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M14.7 6.3a3 3 0 0 1 4.243 4.243L9.9 19.6a1 1 0 0 1-.354.23L5.5 21l1.17-4.046a1 1 0 0 1 .23-.354z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 5l3 3"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
