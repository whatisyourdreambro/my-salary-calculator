"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { calculationTracking } from "@/lib/calculationTracking";

/**
 * Persistent route observer for the explicit calculator scopes (measurement v2).
 * No document-wide input listeners: search boxes and 1.2s idle are not calculation success.
 * Mount once in the root layout so A -> non-calculator page -> A starts a new visit.
 */
export default function CalcFunnelTracker() {
  const pathname = usePathname();
  useEffect(() => {
    calculationTracking.visit(pathname || "/");
  }, [pathname]);
  return null;
}
