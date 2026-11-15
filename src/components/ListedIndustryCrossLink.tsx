"use client";

// 공시 업종 순위(/salary-db/listed/industry/[industryId]) → 업계 추정 연봉(/industry/[slug]) 교차 링크 (2026-11-15 SEASONC,
// app-data-pages ideas[3]). salary-db/layout.tsx 가 PageFooterAds·직업 링크·공유 뒤에 렌더한다 — 그 쪽 마지막 광고 아래.
// page.tsx 끝에 두면 layout 의 PageFooterAds 위가 되므로(광고 위 UI 금지) layout 에서 경로로 판별한다.
// 다른 salary-db 경로(회사·상장 lite·순위·비교·허브)에서는 null — DOM 이 생기지 않아 기존 형제의 자동광고 CSS 경로가 그대로다.
import { usePathname } from "next/navigation";
import Link from "@/components/AppLink";
import { industryLinkForListed } from "@/lib/industryCrossLinks";

export default function ListedIndustryCrossLink() {
  const id = /^\/salary-db\/listed\/industry\/([a-z0-9-]+)\/?$/.exec(usePathname() ?? "")?.[1];
  const link = id ? industryLinkForListed(id) : null;
  if (!link) return null;
  return (
    <section aria-labelledby="listed-industry-cross-title" className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-canvas-200 bg-white p-5">
        <h2 id="listed-industry-cross-title" className="text-sm font-black text-navy mb-2">경력별 업계 추정 연봉도 보기</h2>
        <p className="text-xs leading-6 text-muted-blue mb-3">
          이 순위는 공시 평균연봉(전 직급 평균)입니다. 신입·주니어·시니어 경력별 추정 연봉은 업계 페이지에서 볼 수 있습니다.
        </p>
        <Link href={link.href} className="inline-flex min-h-11 items-center text-sm font-bold text-electric hover:underline">
          {link.name} 업계 연봉 →
        </Link>
      </div>
    </section>
  );
}
