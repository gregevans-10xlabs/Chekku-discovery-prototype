"use client";

import { useAppState } from "@/lib/state/AppStateProvider";

export default function ConnectivityIndicator() {
  const { online, dispatch } = useAppState();

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "toggle-offline" })}
      aria-label={
        online
          ? "Online — tap to simulate offline"
          : "Offline — tap to go online"
      }
      className={
        "fixed top-2 right-2 z-50 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm backdrop-blur " +
        (online
          ? "bg-success/15 text-success border border-success/30"
          : "bg-warn/20 text-warn border border-warn/40")
      }
      style={{ minHeight: 0 }}
    >
      <span
        className={
          "inline-block h-1.5 w-1.5 rounded-full " +
          (online ? "bg-success" : "bg-warn")
        }
      />
      {online ? "Online" : "Offline"}
    </button>
  );
}
