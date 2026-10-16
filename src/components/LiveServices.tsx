"use client";

import { useEffect } from "react";
import { installLiveServices } from "@/lib/liveServices";

export default function LiveServices() {
  useEffect(() => {
    installLiveServices();
  }, []);
  return null;
}
