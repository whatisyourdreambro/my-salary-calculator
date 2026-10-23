"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "@/components/AppLink";
import { CIVIL_PAY_DESTINATION, isCivilPaySelection, writeCivilPayHandoff, type CivilPaySelection } from "@/lib/civilPayHandoff";
import { trackCivilPayHandoff } from "@/lib/civilPayHandoffTracking";

export default function CivilPayHandoffButton({ selection, gradeLabel, children }: {
  selection: CivilPaySelection; gradeLabel: string; children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  return <>
    <button type="button"
      aria-label={`2026년 ${gradeLabel} ${selection.step}호봉 조건으로 실수령액 계산`}
      title="이 계급·호봉으로 실수령액 계산"
      className="min-h-11 min-w-11 rounded px-1 font-bold text-electric underline decoration-electric/30 underline-offset-4 hover:decoration-electric focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric"
      onClick={event => {
        if (!event.nativeEvent.isTrusted) return;
        if (!isCivilPaySelection(selection) || pathname !== selection.source) {
          trackCivilPayHandoff("rejected", undefined, "invalid");
          setFailed(true);
          return;
        }
        trackCivilPayHandoff("selected", selection.occupation);
        try {
          if (writeCivilPayHandoff(selection, pathname, window.sessionStorage)) {
            setFailed(false);
            router.push(CIVIL_PAY_DESTINATION);
            return;
          }
        } catch { /* Restricted storage keeps the readable table and manual route available. */ }
        trackCivilPayHandoff("rejected", selection.occupation, "storage_unavailable");
        setFailed(true);
      }}>{children}</button>
    {failed && <span role="alert" className="block max-w-40 text-left text-xs text-rose-700 dark:text-rose-300">
      조건을 저장하지 못했습니다. <Link href={`${CIVIL_PAY_DESTINATION}#${selection.occupation}`} className="underline">계산기에서 계급·호봉을 직접 선택해 주세요.</Link>
    </span>}
  </>;
}
