"use client";

// layout 맨 끝 '만든 사람과 확인 방법' 상자를 경로로 고르는 래퍼 (G4, 운영자 승인 2026-11-01 구글 개선 5번).
// ★ 배치 규칙: src/app/calc/layout.tsx·table/2026/layout.tsx·table/2027/layout.tsx·salary-db/layout.tsx 의 **맨 끝**
//   (모든 광고·공유 fallback·FloatingShareBar·기존 맨 끝 상자 뒤)에만 둔다. 이 layout 들은 children 뒤에 광고
//   (calc 광고 블록·PageFooterAds)를 그리므로 page.tsx 에 두면 어디에 두든 그 광고 위가 된다.
// - layout 에는 params 가 없어 usePathname 으로 고른다(SalaryTableNextStepsFromPath·CalcNewsNote 와 같은 패턴).
//   usePathname 은 서버 렌더에서도 동작하므로 프리렌더 HTML 에 상자가 들어간다. 대상이 아닌 경로는 null —
//   다른 계산기·표 밖·회사 아닌 /salary-db 페이지의 DOM 은 그대로다.
import { usePathname } from "next/navigation";
import EditorialTrustNote from "@/components/EditorialTrustNote";

export default function EditorialTrustNoteFromPath({ className }: { className?: string }) {
  return <EditorialTrustNote path={usePathname()} className={className} />;
}
