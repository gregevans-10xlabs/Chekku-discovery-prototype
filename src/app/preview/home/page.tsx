/**
 * Phase 0c — Reference Home screen (calibration only)
 *
 * This is the C+ AI-first home rebuilt in the Chekku.au-aligned visual
 * language: light theme, teal accent, modest radii, generous whitespace.
 * Hardcoded content represents Brett Sandford (Sandbar Electrical Services)
 * — the Phase 1.5 demo trade.
 *
 * Lives at /preview/home so the existing /home is untouched until
 * Phase 2. Inline-styled to avoid polluting globals.css before the
 * Phase 1 token refresh.
 *
 * What's static here vs what comes later:
 * - AI input is a visual stub — real wiring is Phase 3
 * - Cards are non-interactive — routing is Phase 2
 * - Numbers (earnings, jobs, opportunities) are hardcoded — real data
 *   layer is Phase 1.5
 * - Bottom nav is a local mock — the real BottomNav stays as is until
 *   Phase 2 picks up the new visual language
 */

const PALETTE = {
  bg: "#FFFFFF",
  surface: "#FAFAFA",
  surfaceElevated: "#FFFFFF",
  fg: "#0F1419",
  fgMuted: "#6B7280",
  fgSubtle: "#9CA3AF",
  accent: "#00C9C9",
  accentStrong: "#00A8A8",
  accentSoft: "#E0F7F7",
  accentBorder: "#B8E8E8",
  border: "#E5E5E5",
  borderStrong: "#D1D5DB",
  warn: "#D97706",
  warnSoft: "#FEF3C7",
  success: "#059669",
};

export default function PreviewHomePage() {
  return (
    <div
      style={{
        background: PALETTE.bg,
        color: PALETTE.fg,
        minHeight: "100vh",
        // Override the dark theme inherited from layout.tsx for this
        // preview only.
        marginLeft: "calc(50% - 215px)",
        marginRight: "calc(50% - 215px)",
        maxWidth: "430px",
        fontFamily:
          'var(--font-geist-sans), "Inter", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <main style={{ paddingBottom: "80px" }}>
        {/* Header */}
        <header
          style={{
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: PALETTE.bg,
          }}
        >
          <div>
            <p
              style={{
                fontSize: "14px",
                color: PALETTE.fgMuted,
                margin: 0,
                fontWeight: 500,
              }}
            >
              Good morning,
            </p>
            <p
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: PALETTE.fg,
                margin: 0,
                marginTop: "2px",
                letterSpacing: "-0.01em",
              }}
            >
              Brett
            </p>
          </div>
          <button
            type="button"
            aria-label="Profile"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "20px",
              background: PALETTE.accentSoft,
              color: PALETTE.accentStrong,
              border: "none",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            BS
          </button>
        </header>

        {/* Day tape */}
        <section style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: PALETTE.fgMuted,
              fontWeight: 500,
            }}
          >
            <span style={{ color: PALETTE.fg, fontWeight: 600 }}>Today $342</span>
            <Dot />
            <span>3 jobs</span>
            <Dot />
            <span>Next 10:00 am</span>
          </div>
        </section>

        {/* AI input — the visual centre */}
        <section style={{ padding: "20px" }}>
          <div
            style={{
              background: PALETTE.surfaceElevated,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: "16px",
              padding: "16px",
              boxShadow: "0 1px 2px rgba(15, 20, 25, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <SparkleIcon />
              <input
                type="text"
                placeholder="Ask Chekku anything…"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "15px",
                  color: PALETTE.fg,
                  background: "transparent",
                }}
              />
              <button
                type="button"
                style={{
                  background: PALETTE.accent,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Ask
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginTop: "12px",
              }}
            >
              <Chip>What&apos;s near me</Chip>
              <Chip>Plan my day</Chip>
              <Chip>Why can&apos;t I take this?</Chip>
            </div>
          </div>
        </section>

        {/* Heads up section */}
        <SectionHeader>Heads up</SectionHeader>

        {/* Next job tile */}
        <section style={{ padding: "0 20px", marginBottom: "10px" }}>
          <div
            style={{
              background: PALETTE.surfaceElevated,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: "14px",
              padding: "16px",
              boxShadow: "0 1px 2px rgba(15, 20, 25, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: PALETTE.accentStrong,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Your next job
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: PALETTE.fg,
                    margin: "4px 0 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  TV install · 10:00 am
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: PALETTE.fgMuted,
                    margin: "4px 0 0",
                  }}
                >
                  12 Maple St, Newcastle · 8 km away
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: `1px solid ${PALETTE.border}`,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  color: PALETTE.success,
                  fontWeight: 600,
                }}
              >
                ✓ Customer confirmed
              </span>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: PALETTE.accentStrong,
                }}
              >
                Open →
              </span>
            </div>
          </div>
        </section>

        {/* SWMS expiring — exception card */}
        <section style={{ padding: "0 20px", marginBottom: "10px" }}>
          <div
            style={{
              background: PALETTE.warnSoft,
              border: `1px solid ${PALETTE.warn}33`,
              borderRadius: "14px",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: PALETTE.warn,
                    margin: 0,
                  }}
                >
                  ⚠ SWMS expires in 3 days
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: PALETTE.fgMuted,
                    margin: "2px 0 0",
                  }}
                >
                  Upload a new template via the document library
                </p>
              </div>
              <span
                style={{
                  fontSize: "13px",
                  color: PALETTE.warn,
                  fontWeight: 600,
                }}
              >
                Fix →
              </span>
            </div>
          </div>
        </section>

        {/* Could be earning more — opportunity surfacing */}
        <SectionHeader>Could be earning more</SectionHeader>

        <section style={{ padding: "0 20px", marginBottom: "10px" }}>
          <div
            style={{
              background: PALETTE.surfaceElevated,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: "14px",
              padding: "16px",
              boxShadow: "0 1px 2px rgba(15, 20, 25, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: PALETTE.fgSubtle,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Available near you
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: PALETTE.fg,
                    margin: "4px 0 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  4 jobs you could take this week
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: PALETTE.fgMuted,
                    margin: "4px 0 0",
                  }}
                >
                  Up to <strong style={{ color: PALETTE.fg }}>+$1,240</strong>{" "}
                  if you accept all four
                </p>
              </div>
              <span style={{ fontSize: "20px" }}>→</span>
            </div>
          </div>
        </section>

        {/* ARC ticket — cert unlock framed as opportunity */}
        <section style={{ padding: "0 20px", marginBottom: "20px" }}>
          <div
            style={{
              background: PALETTE.accentSoft,
              border: `1px solid ${PALETTE.accentBorder}`,
              borderRadius: "14px",
              padding: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: PALETTE.accentStrong,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  ★ Unlock more work
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: PALETTE.fg,
                    margin: "4px 0 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Get your ARC refrigeration ticket
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: PALETTE.fg,
                    margin: "4px 0 0",
                  }}
                >
                  23 HVAC jobs in your area · could earn{" "}
                  <strong style={{ color: PALETTE.accentStrong }}>
                    +$8,000/month
                  </strong>
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: PALETTE.fgMuted,
                    margin: "8px 0 0",
                  }}
                >
                  2-week course · funded under tax-deductible CPD
                </p>
              </div>
            </div>
            <button
              type="button"
              style={{
                marginTop: "14px",
                width: "100%",
                background: PALETTE.accent,
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "11px 16px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Show me the course
            </button>
          </div>
        </section>
      </main>

      {/* Mock bottom nav (illustrative — real BottomNav refreshed in Phase 2) */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: "430px",
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${PALETTE.border}`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div style={{ display: "flex" }}>
          <NavItem label="Home" icon="⌂" active />
          <NavItem label="Schedule" icon="◷" />
          <NavItem label="Find" icon="✦" />
          <NavItem label="Money" icon="$" />
        </div>
      </nav>

      {/* Calibration footer note — visible only on this preview route */}
      <div
        style={{
          position: "fixed",
          top: "8px",
          right: "calc(50% - 210px)",
          background: PALETTE.fg,
          color: "white",
          fontSize: "10px",
          padding: "4px 8px",
          borderRadius: "4px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          opacity: 0.7,
        }}
      >
        PREVIEW · PHASE 0c
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span
      style={{
        display: "inline-block",
        width: "3px",
        height: "3px",
        borderRadius: "50%",
        background: PALETTE.fgSubtle,
      }}
    />
  );
}

function SparkleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1"
        stroke={PALETTE.accent}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3" fill={PALETTE.accent} />
    </svg>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      style={{
        background: PALETTE.accentSoft,
        color: PALETTE.accentStrong,
        border: `1px solid ${PALETTE.accentBorder}`,
        borderRadius: "999px",
        padding: "5px 12px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: PALETTE.fgMuted,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "8px 20px",
        marginTop: "16px",
      }}
    >
      {children}
    </h2>
  );
}

function NavItem({
  label,
  icon,
  active,
}: {
  label: string;
  icon: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      style={{
        flex: 1,
        background: "transparent",
        border: "none",
        padding: "10px 0 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3px",
        cursor: "pointer",
        color: active ? PALETTE.accentStrong : PALETTE.fgMuted,
      }}
    >
      <span style={{ fontSize: "18px", lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: "10px", fontWeight: 600 }}>{label}</span>
    </button>
  );
}
