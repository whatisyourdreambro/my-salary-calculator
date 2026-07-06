// src/app/salary-db/submit/page.tsx
//
// 연봉 제보 — 수집 시스템이 준비될 때까지 /salary-db로 영구 리다이렉트.
// 과거 "준비 중" 안내 카드는 콘텐츠 없는 화면에 layout 광고가 노출되는
// AdSense 정책 리스크(under construction + ads)가 있어 2026-07-06 제거.
// 제보 기능이 실제로 열리면 이 리다이렉트를 폼 페이지로 되돌린다.

import { permanentRedirect } from "next/navigation";

export default function SubmitSalaryPage() {
 permanentRedirect("/salary-db");
}
