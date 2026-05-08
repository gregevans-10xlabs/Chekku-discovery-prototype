"use client";

/**
 * Phase 0c — Reference Home screen (calibration only) · iteration 2
 *
 * Iteration 2 corrections from Greg:
 * - Accent color: teal → emerald green (~#00A651) per dashboard.chekku.au
 *   logo file naming + chekku.au CTA verification
 * - Tap targets: all primary actions raised to 44pt minimum (Apple HIG)
 *   and chips eased for one-handed use on site
 * - Theme: light/dark both supported with a manual toggle on this preview
 *   route. Production will use `prefers-color-scheme`. Default light per
 *   research note: bright-sun outdoor reading favours light backgrounds
 * - Empty-state: added a "no next job" variant card visible below the
 *   primary tile so the empty pattern is reviewable in the same scroll
 *
 * What's still static here vs what comes later: AI input wired Phase 3,
 * routing wired Phase 2, real Brett/Sandbar data Phase 1.5.
 */

import { useState } from "react";

interface Palette {
  bg: string;
  surface: string;
  surfaceElevated: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  accentBorder: string;
  border: string;
  borderStrong: string;
  warn: string;
  warnSoft: string;
  warnBorder: string;
  success: string;
  inputBg: string;
  shadow: string;
  toggleBg: string;
}

const LIGHT: Palette = {
  bg: "#FFFFFF",
  surface: "#FAFAFA",
  surfaceElevated: "#FFFFFF",
  fg: "#0F1419",
  fgMuted: "#5C6470",
  fgSubtle: "#9CA3AF",
  // Emerald green from chekku.au CTAs / dashboard logo
  accent: "#00A651",
  accentStrong: "#008541",
  accentSoft: "#E6F7EE",
  accentBorder: "#B7E4C8",
  border: "#E5E7EB",
  borderStrong: "#D1D5DB",
  warn: "#B45309",
  warnSoft: "#FEF3C7",
  warnBorder: "#FDE68A",
  success: "#047857",
  inputBg: "#F9FAFB",
  shadow: "0 1px 2px rgba(15, 20, 25, 0.04)",
  toggleBg: "#F3F4F6",
};

const DARK: Palette = {
  bg: "#0B0F1A",
  surface: "#111827",
  surfaceElevated: "#161E2E",
  fg: "#F9FAFB",
  fgMuted: "#9CA3AF",
  fgSubtle: "#6B7280",
  // Brighter emerald in dark mode for contrast (same family, lifted)
  accent: "#00C46A",
  accentStrong: "#00A651",
  accentSoft: "rgba(0, 196, 106, 0.12)",
  accentBorder: "rgba(0, 196, 106, 0.32)",
  border: "#1F2937",
  borderStrong: "#374151",
  warn: "#FBBF24",
  warnSoft: "rgba(251, 191, 36, 0.12)",
  warnBorder: "rgba(251, 191, 36, 0.32)",
  success: "#34D399",
  inputBg: "#0F172A",
  shadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
  toggleBg: "#1F2937",
};

type Mode = "light" | "dark";
type Variant = "default" | "no-next-job";

export default function PreviewHomePage() {
  const [mode, setMode] = useState<Mode>("light");
  const [variant, setVariant] = useState<Variant>("default");
  const P = mode === "light" ? LIGHT : DARK;

  return (
    <div
      style={{
        background: P.bg,
        color: P.fg,
        minHeight: "100vh",
        marginLeft: "calc(50% - 215px)",
        marginRight: "calc(50% - 215px)",
        maxWidth: "430px",
        fontFamily:
          'var(--font-geist-sans), "Inter", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {/* Calibration toggles — fixed top so the rest is reviewable */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: P.bg,
          borderBottom: `1px solid ${P.border}`,
          padding: "8px 16px calc(8px + env(safe-area-inset-top, 0px))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "10px", color: P.fgMuted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Preview
          </span>
          <Toggle
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            value={mode}
            onChange={(v) => setMode(v as Mode)}
            P={P}
          />
          <Toggle
            options={[
              { value: "default", label: "Default" },
              { value: "no-next-job", label: "Quiet day" },
            ]}
            value={variant}
            onChange={(v) => setVariant(v as Variant)}
            P={P}
          />
        </div>
      </div>

      <main style={{ paddingBottom: "100px" }}>
        {/* Header */}
        <header
          style={{
            paddingTop: "16px",
            paddingLeft: "20px",
            paddingRight: "20px",
            paddingBottom: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: P.bg,
          }}
        >
          <div>
            <p style={{ fontSize: "14px", color: P.fgMuted, margin: 0, fontWeight: 500 }}>
              Good morning,
            </p>
            <p
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: P.fg,
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
              width: "44px",
              height: "44px",
              borderRadius: "22px",
              background: P.accentSoft,
              color: P.accentStrong,
              border: `1px solid ${P.accentBorder}`,
              fontSize: "14px",
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
        <section style={{ paddingLeft: "20px", paddingRight: "20px", paddingTop: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              color: P.fgMuted,
              fontWeight: 500,
            }}
          >
            <span style={{ color: P.fg, fontWeight: 600 }}>
              {variant === "no-next-job" ? "Today" : "Today $342"}
            </span>
            <Dot P={P} />
            <span>{variant === "no-next-job" ? "0 jobs" : "3 jobs"}</span>
            {variant === "default" ? (
              <>
                <Dot P={P} />
                <span>Next 10:00 am</span>
              </>
            ) : null}
          </div>
        </section>

        {/* AI input — the visual centre */}
        <section style={{ padding: "16px 20px 0" }}>
          <div
            style={{
              background: P.surfaceElevated,
              border: `1px solid ${P.border}`,
              borderRadius: "16px",
              padding: "16px",
              boxShadow: P.shadow,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: P.inputBg,
                border: `1px solid ${P.border}`,
                borderRadius: "12px",
                padding: "4px 4px 4px 14px",
              }}
            >
              <SparkleIcon color={P.accent} />
              <input
                type="text"
                placeholder="Ask Chekku anything…"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "15px",
                  color: P.fg,
                  background: "transparent",
                  padding: "12px 0",
                }}
              />
              <button
                type="button"
                style={{
                  background: P.accent,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 20px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: "44px",
                }}
              >
                Ask
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "14px",
              }}
            >
              {variant === "default" ? (
                <>
                  <Chip P={P}>What&apos;s near me</Chip>
                  <Chip P={P}>Plan my day</Chip>
                  <Chip P={P}>Why can&apos;t I take this?</Chip>
                </>
              ) : (
                <>
                  <Chip P={P}>What&apos;s near me</Chip>
                  <Chip P={P}>Help me grow my income</Chip>
                  <Chip P={P}>Compliance to-dos</Chip>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Heads up section */}
        <SectionHeader P={P}>Heads up</SectionHeader>

        {/* Next job tile — adapts to variant */}
        <section style={{ padding: "0 20px", marginBottom: "12px" }}>
          {variant === "default" ? (
            <NextJobCard P={P} />
          ) : (
            <NoNextJobCard P={P} />
          )}
        </section>

        {/* SWMS expiring — exception card (only on default) */}
        {variant === "default" ? (
          <section style={{ padding: "0 20px", marginBottom: "12px" }}>
            <div
              style={{
                background: P.warnSoft,
                border: `1px solid ${P.warnBorder}`,
                borderRadius: "14px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  minHeight: "44px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: P.warn,
                      margin: 0,
                    }}
                  >
                    ⚠ SWMS expires in 3 days
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: P.fgMuted,
                      margin: "3px 0 0",
                    }}
                  >
                    Upload a fresh template via the document library
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    color: P.warn,
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  Fix →
                </span>
              </div>
            </div>
          </section>
        ) : null}

        {/* Could be earning more */}
        <SectionHeader P={P}>Could be earning more</SectionHeader>

        {/* 4 jobs nearby */}
        <section style={{ padding: "0 20px", marginBottom: "12px" }}>
          <button
            type="button"
            style={{
              width: "100%",
              background: P.surfaceElevated,
              border: `1px solid ${P.border}`,
              borderRadius: "14px",
              padding: "18px",
              textAlign: "left",
              cursor: "pointer",
              boxShadow: P.shadow,
              display: "block",
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
                    color: P.fgSubtle,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  Available near you
                </p>
                <p
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: P.fg,
                    margin: "6px 0 0",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {variant === "no-next-job"
                    ? "8 jobs you could take this week"
                    : "4 jobs you could take this week"}
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: P.fgMuted,
                    margin: "4px 0 0",
                  }}
                >
                  Up to{" "}
                  <strong style={{ color: P.fg }}>
                    {variant === "no-next-job" ? "+$2,640" : "+$1,240"}
                  </strong>{" "}
                  if you accept all
                </p>
              </div>
              <span
                style={{
                  fontSize: "20px",
                  color: P.accent,
                  fontWeight: 600,
                  flexShrink: 0,
                  marginTop: "4px",
                }}
              >
                →
              </span>
            </div>
          </button>
        </section>

        {/* Cert unlock */}
        <section style={{ padding: "0 20px", marginBottom: "20px" }}>
          <div
            style={{
              background: P.accentSoft,
              border: `1px solid ${P.accentBorder}`,
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: P.accentStrong,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                ★ Unlock more work
              </p>
              <p
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: P.fg,
                  margin: "6px 0 0",
                  letterSpacing: "-0.01em",
                }}
              >
                Get your ARC refrigeration ticket
              </p>
              <p
                style={{
                  fontSize: "14px",
                  color: P.fg,
                  margin: "4px 0 0",
                }}
              >
                23 HVAC jobs in your area · could earn{" "}
                <strong style={{ color: P.accentStrong }}>+$8,000/month</strong>
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: P.fgMuted,
                  margin: "10px 0 0",
                }}
              >
                2-week course · funded under tax-deductible CPD
              </p>
            </div>
            <button
              type="button"
              style={{
                marginTop: "16px",
                width: "100%",
                background: P.accent,
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "14px 18px",
                fontSize: "15px",
                fontWeight: 600,
                cursor: "pointer",
                minHeight: "48px",
              }}
            >
              Show me the course
            </button>
          </div>
        </section>
      </main>

      {/* Mock bottom nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: "430px",
          margin: "0 auto",
          background: mode === "light"
            ? "rgba(255, 255, 255, 0.96)"
            : "rgba(11, 15, 26, 0.96)",
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${P.border}`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div style={{ display: "flex" }}>
          <NavItem label="Home" icon="⌂" active P={P} />
          <NavItem label="Schedule" icon="◷" P={P} />
          <NavItem label="Find" icon="✦" P={P} />
          <NavItem label="Money" icon="$" P={P} />
        </div>
      </nav>
    </div>
  );
}

function NextJobCard({ P }: { P: Palette }) {
  return (
    <button
      type="button"
      style={{
        width: "100%",
        textAlign: "left",
        background: P.surfaceElevated,
        border: `1px solid ${P.border}`,
        borderLeft: `3px solid ${P.accent}`,
        borderRadius: "14px",
        padding: "18px",
        cursor: "pointer",
        boxShadow: P.shadow,
        display: "block",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: P.accentStrong,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Your next job
      </p>
      <p
        style={{
          fontSize: "17px",
          fontWeight: 700,
          color: P.fg,
          margin: "6px 0 0",
          letterSpacing: "-0.01em",
        }}
      >
        TV install · 10:00 am
      </p>
      <p
        style={{
          fontSize: "14px",
          color: P.fgMuted,
          margin: "4px 0 0",
        }}
      >
        12 Maple St, Newcastle · 8 km away
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "14px",
          paddingTop: "14px",
          borderTop: `1px solid ${P.border}`,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: P.success,
            fontWeight: 600,
          }}
        >
          ✓ Customer confirmed
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: P.accentStrong,
          }}
        >
          Open →
        </span>
      </div>
    </button>
  );
}

function NoNextJobCard({ P }: { P: Palette }) {
  return (
    <div
      style={{
        background: P.surfaceElevated,
        border: `1px dashed ${P.borderStrong}`,
        borderRadius: "14px",
        padding: "20px 18px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "30px",
          margin: 0,
          opacity: 0.6,
        }}
      >
        ☕
      </p>
      <p
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: P.fg,
          margin: "10px 0 0",
        }}
      >
        Nothing on your schedule today
      </p>
      <p
        style={{
          fontSize: "14px",
          color: P.fgMuted,
          margin: "6px 0 0",
        }}
      >
        Take the day, or pick up some nearby work
      </p>
    </div>
  );
}

function Toggle<T extends string>({
  options,
  value,
  onChange,
  P,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  P: Palette;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: P.toggleBg,
        borderRadius: "8px",
        padding: "2px",
      }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          style={{
            background: value === o.value ? P.accent : "transparent",
            color: value === o.value ? "white" : P.fgMuted,
            border: "none",
            borderRadius: "6px",
            padding: "5px 10px",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Dot({ P }: { P: Palette }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "3px",
        height: "3px",
        borderRadius: "50%",
        background: P.fgSubtle,
      }}
    />
  );
}

function SparkleIcon({ color }: { color: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3" fill={color} />
    </svg>
  );
}

function Chip({ P, children }: { P: Palette; children: React.ReactNode }) {
  return (
    <button
      type="button"
      style={{
        background: P.accentSoft,
        color: P.accentStrong,
        border: `1px solid ${P.accentBorder}`,
        borderRadius: "999px",
        padding: "9px 14px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        minHeight: "36px",
      }}
    >
      {children}
    </button>
  );
}

function SectionHeader({
  P,
  children,
}: {
  P: Palette;
  children: React.ReactNode;
}) {
  return (
    <h2
      style={{
        fontSize: "11px",
        fontWeight: 600,
        color: P.fgMuted,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        margin: "20px 20px 10px",
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
  P,
}: {
  label: string;
  icon: string;
  active?: boolean;
  P: Palette;
}) {
  return (
    <button
      type="button"
      style={{
        flex: 1,
        background: "transparent",
        border: "none",
        padding: "10px 0 14px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
        cursor: "pointer",
        color: active ? P.accentStrong : P.fgMuted,
        minHeight: "56px",
      }}
    >
      <span style={{ fontSize: "20px", lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: "10px", fontWeight: 600 }}>{label}</span>
    </button>
  );
}
