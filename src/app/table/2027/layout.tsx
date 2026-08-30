// src/app/table/2027/layout.tsx — 2026 layout 복제 (광고 배치 동일, 운영자 승인 2026-08-30)
// + 2027 미확정 요율 고지 배너 (광고 아래 배치 — 2026-08-16 규칙 준수, 4페이지 공통 1곳)

import { GuideMidAd } from "@/components/AdPlacement";
import PageFooterAds from "@/components/PageFooterAds";
import AutoShareSection from "@/components/AutoShareSection";
import Link from "@/components/AppLink";
import TableTabsNav from "./TableTabsNav";

export default function Table2027Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 연봉|월급|주급|시급 상호 링크 탭 + 표 위 광고 — 2026 layout과 동일 구조.
          GuideMidAd 는 하단 PageFooterAds(InArticleAd·HomeTopAd)와 슬롯이 달라 dedup 충돌 없음. */}
      <div className="bg-white pt-24 sm:pt-28">
        <TableTabsNav />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <GuideMidAd />
        </div>
        {/* 고지 배너 — 광고 아래 (신규 UI는 광고 아래 원칙). 확정/미확정 요율 명시.
            ★갱신 슬롯: 건보(9월)·장기요양(10~11월)·간이세액표(내년 2월) 확정 시 문구 갱신 */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <p className="rounded-xl bg-electric/5 border border-electric/20 px-4 py-3 text-xs leading-5 text-muted-blue">
            <strong className="text-navy">2027년 확정 반영:</strong> 국민연금 근로자 5.0%(요율
            인상)·최저시급 10,700원. <strong className="text-navy">미확정(2026 기준 준용):</strong>{" "}
            건강보험·장기요양·간이세액표 — 확정 발표 시 즉시 갱신합니다. 올해 기준은{" "}
            <Link href="/table/2026/annual" className="font-bold text-electric hover:underline">
              2026 실수령액 표
            </Link>
            에서 확인하세요.
          </p>
        </div>
      </div>
      {children}
      <PageFooterAds maxWidth="5xl" />
      {/* 공유 fallback은 광고 아래 — 광고 밀림 방지 (2026-08-16 수익 대응) */}
      <AutoShareSection contentType="page" maxWidth="5xl" className="pb-16" />
    </>
  );
}
