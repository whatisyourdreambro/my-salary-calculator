// src/components/CompanySalaryGroupNotice.tsx
//
// 동일 급여 그룹 안내 — near-duplicate 완화 (2026-08-07, server component).
//
// 발전 공기업 5사+강원랜드처럼 5직급 base 연봉 튜플이 DB에서 완전히 동일한
// 회사 그룹은 직급별 연봉표·FAQ 숫자까지 같아져 구글이 near-duplicate로 볼
// 위험이 있다. 이 섹션은 (1) "본 DB 수치 기준 동일"임을 정직하게 명시하고
// (2) 피어 회사로 상호 링크해 의도적 데이터 공유임을 신호하며 (3) 이 회사만의
// 차별 요소(문화 장점·대표 복지 — 기존 데이터 필드만, 추정 금지)를 서술해
// 그룹 내 각 페이지에 고유 텍스트를 만든다.
// 사실 표현 주의: "급여체계가 같다"고 단정하지 않는다 — DB 등록 수치가
// 동일하다는 사실만 말한다.

import Link from "@/components/AppLink";
import { ArrowRight, Copy } from "lucide-react";
import type { CompanyProfile } from "@/types/company";
import { getSalaryGroupPeers } from "@/lib/companyContentBuilder";

export default function CompanySalaryGroupNotice({
  company,
}: {
  company: CompanyProfile;
}) {
  const peers = getSalaryGroupPeers(company);
  if (peers.length === 0) return null;

  // 이 회사의 차별 요소 — culture.pros 첫 항목 + 금액 가치 최대 복지 항목
  const firstPro = company.culture.pros[0];
  const topBenefit = [...company.benefits].sort(
    (a, b) => (b.value ?? 0) - (a.value ?? 0)
  )[0];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="rounded-2xl border border-canvas-200 dark:border-canvas-800 bg-white dark:bg-canvas-900 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-black text-navy dark:text-canvas-50 mb-2">
          <Copy size={18} className="text-electric flex-shrink-0" />
          머니샐러리 DB 기준 급여 수치가 동일한 회사들
        </h2>
        <p className="text-sm leading-7 text-muted-blue dark:text-canvas-300 mb-4">
          {company.name.ko}는 아래 {peers.length}개사와 본 DB에 등록된 직급별
          기본급 수치(신입~임원 5단계)가 동일합니다. 같은 공개 자료 기준으로
          집계된 회사들은 수치가 겹칠 수 있으며, 위 연봉표가 이 회사만의 확정
          급여를 뜻하지는 않습니다. 실제 차이는 복지·조직문화·근무지에서
          발생합니다.
          {firstPro && (
            <>
              {" "}
              {company.name.ko}의 경우 &ldquo;{firstPro}&rdquo;이(가) 장점으로
              꼽히며
              {topBenefit
                ? `, 대표 복지로는 ${topBenefit.title}이(가) 있습니다.`
                : "."}
            </>
          )}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {peers.map((peer) => (
            <Link
              key={peer.id}
              href={`/salary-db/${peer.id}`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-canvas-50 dark:bg-canvas-800 border border-canvas-100 dark:border-canvas-700 hover:border-electric transition-colors text-sm group"
            >
              <span className="text-lg" aria-hidden="true">
                {peer.logo}
              </span>
              <span className="flex-1 font-medium text-navy dark:text-canvas-100">
                {peer.name.ko} 연봉·복지 보기
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-electric flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
