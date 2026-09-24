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
      <div className="bg-background pt-24 sm:pt-28">
        <TableTabsNav />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <GuideMidAd />
        </div>
        {/* 고지 배너 — 광고 아래 (신규 UI는 광고 아래 원칙). 확정/미확정 요율 명시.
            ★갱신 슬롯: 건보(완료 2026-09-25 동결)·장기요양(10~11월)·고용보험(2027 2.0% 인상안,
            2026-09-01 고용보험위원회 심의 — 법령 개정 시) 확정 시 문구 갱신.
            표(CalcResultAd) 위라 문구는 짧게 유지 — 건정심 날짜 등 상세는 각 페이지 FAQ·본문에 둔다.
            문구 폭은 2026-08-30 기준선 이하 (간이세액표 적용 시점 '2026년 3월 1일 지급분부터'는 연봉·월급 표 본문·FAQ 에). */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <p className="rounded-xl bg-electric/5 border border-electric/20 px-4 py-3 text-xs leading-5 text-muted-blue">
            <strong className="text-navy">2027년 확정 반영:</strong> 국민연금 근로자 5.0%(요율
            인상)·건강보험 3.595%(2027 동결)·최저시급 10,700원.{" "}
            <strong className="text-navy">미확정(2026 기준 준용):</strong>{" "}
            장기요양·고용보험(인상안 심의 중) — 확정 발표 시 갱신합니다. 소득세는 현행 근로소득 간이세액표를 준용합니다. 올해 기준은{" "}
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
