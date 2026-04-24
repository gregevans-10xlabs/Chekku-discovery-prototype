"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/nav/BottomNav";
import { useAppState } from "@/lib/state/AppStateProvider";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { state, hydrated } = useAppState();

  useEffect(() => {
    if (hydrated && !state.onboarded) {
      router.replace("/");
    }
  }, [hydrated, state.onboarded, router]);

  if (!hydrated || !state.onboarded) return null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
