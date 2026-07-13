// src/components/CompanyBonusCalculatorLink.tsx
//
// 회사 페이지 → 회사별 성과급 계산기 역링크 CTA.
// 회사 ID 가 매핑 테이블에 있으면 큰 강조 버튼으로 노출, 없으면 null.
// 5월 22~23일 트래픽 폭증의 90%가 단일 성과급 페이지였음 (GA 분석).
// 회사 페이지 방문자 → 성과급 계산기 동선 강화로 폭증 페이지 트래픽 회수.

import Link from "next/link";
import { Calculator, ArrowRight } from "lucide-react";

// 회사 ID → 계산기 경로 + 라벨 매핑
const COMPANY_BONUS_MAP: Record<
  string,
  { calc: string; label: string; desc: string }
> = {
  "samsung-electronics": {
    calc: "/calc/samsung-bonus",
    label: "삼성전자 성과급 시뮬레이터",
    desc: "OPI + TAI 사업부별 분배 + 다년도 RSU 매도 시뮬",
  },
  "sk-hynix": {
    calc: "/calc/sk-hynix-bonus",
    label: "SK하이닉스 PS·PI 계산기",
    desc: "영업이익 10% PS + 반기 기본급 150% PI 합산",
  },
  hyundai: {
    calc: "/calc/hyundai-bonus",
    label: "현대차 성과급 계산기",
    desc: "임단협 450% + 1,580만 + 무상주 30주",
  },
  kia: {
    calc: "/calc/kia-bonus",
    label: "기아 성과급 계산기",
    desc: "임단협 450% + 1,600만 + 무상주 53주",
  },
  lgensol: {
    calc: "/calc/lg-energy-bonus",
    label: "LG에너지솔루션 성과급 계산기",
    desc: "배터리 사이클 50~900% 5단계 시나리오",
  },
  "hd-hyundai-heavy": {
    calc: "/calc/hd-hyundai-bonus",
    label: "HD현대중공업 성과급 계산기",
    desc: "조선 슈퍼사이클 600% + 노조 영업이익 30%",
  },
  naver: {
    calc: "/calc/naver-bonus",
    label: "네이버 성과급·RSU 계산기",
    desc: "PI 10~40% + 자사주 RSU 합산",
  },
  kakao: {
    calc: "/calc/kakao-bonus",
    label: "카카오 성과급·RSU 계산기",
    desc: "PI + RSU 47만주 + 격려금 100만",
  },
  posco: {
    calc: "/calc/posco-bonus",
    label: "포스코 성과급 계산기",
    desc: "철강 사이클 PI + PS 100~1,000% 시나리오",
  },
  "samsung-sdi": {
    calc: "/calc/samsung-sdi-bonus",
    label: "삼성SDI 성과급 계산기",
    desc: "OPI(0~48%) + TAI 사업부별 (배터리 캐즘 반영)",
  },
  "lg-chem": {
    calc: "/calc/lg-chem-bonus",
    label: "LG화학 성과급 계산기",
    desc: "PS(0~850%) + PI(고정 200%) 사업부별",
  },
};

interface Props {
  companyId: string;
  /** 원 단위 신입 총보상 — 미매핑 회사 fallback CTA(/salary/{amount})용 */
  entryTotalWon?: number;
}

export default function CompanyBonusCalculatorLink({
  companyId,
  entryTotalWon,
}: Props) {
  const target = COMPANY_BONUS_MAP[companyId];

  // 미매핑 회사(~470여 곳): 연봉표 직후 최고 의도 지점이 비지 않도록
  // 축소형 fallback CTA — 신입 연봉 실수령액 상세 + 일반 성과급 계산기
  if (!target) {
    const amount =
      entryTotalWon && entryTotalWon >= 1_000_000 && entryTotalWon <= 1_000_000_000
        ? Math.round(entryTotalWon)
        : null;
    return (
      <section className="page-width py-6" aria-label="연봉·성과급 계산기 바로가기">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={amount ? `/salary/${amount}` : "/"}
            className="group flex items-center gap-3 rounded-2xl border border-canvas-200 bg-white p-5 hover:border-electric hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-electric-10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-electric" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-navy text-sm mb-0.5">
                이 회사 신입 연봉, 실수령액은?
              </p>
              <p className="text-xs text-faint-blue">
                세금·4대보험 공제 후 월 실수령 즉시 확인
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-faint-blue group-hover:text-electric group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
          <Link
            href="/tools/finance/bonus"
            className="group flex items-center gap-3 rounded-2xl border border-canvas-200 bg-white p-5 hover:border-electric hover:shadow-md transition-all"
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-electric-10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-electric" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-navy text-sm mb-0.5">
                성과급 세금 계산기
              </p>
              <p className="text-xs text-faint-blue">
                인센티브 세후 실수령액 시뮬레이션
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-faint-blue group-hover:text-electric group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-width py-6" aria-labelledby="bonus-calc-cta-heading">
      <Link
        href={target.calc}
        className="group block rounded-2xl border-2 border-primary bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 sm:p-8 hover:from-primary/10 hover:via-primary/15 hover:to-primary/10 transition"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
            <Calculator className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
              🔥 회사 전용 성과급 계산기
            </p>
            <h2
              id="bonus-calc-cta-heading"
              className="text-xl sm:text-2xl font-black tracking-tight mb-1 flex items-center gap-2"
            >
              {target.label}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </h2>
            <p className="text-sm text-faint leading-relaxed">{target.desc}</p>
            <p className="mt-2 text-xs text-primary font-bold">
              본인 연봉만 입력하면 세전·세후 실수령액 즉시 계산 →
            </p>
          </div>
        </div>
      </Link>
    </section>
  );
}
