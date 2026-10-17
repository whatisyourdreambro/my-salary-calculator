"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { installLiveServices } from "@/lib/liveServices";

export default function LiveServices() {
  const pathname = usePathname();
  useEffect(() => {
    // An invalid initial share may block installation until a later valid route.
    // The installer keeps SDK insertion and the initial GA config idempotent.
    installLiveServices();
  }, [pathname]);
  return null;
}
