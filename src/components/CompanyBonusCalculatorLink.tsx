// src/components/CompanyBonusCalculatorLink.tsx
//
// 회사 페이지 → 회사별 성과급 계산기 역링크 CTA.
// 회사 ID 가 매핑 테이블에 있으면 큰 강조 버튼으로 노출, 없으면 null.
// 회사 페이지 방문자 → 성과급 계산기 동선 강화 목적(시즌 수요 대응).

import Link from "@/components/AppLink";
import { Calculator, ArrowRight } from "lucide-react";
import { bonusCalcCountKo } from "@/config/site";

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
  celltrion: {
    calc: "/calc/celltrion-bonus",
    label: "셀트리온 성과급 계산기",
    desc: "연봉의 최대 50~53% 등급별 — 1월 선지급 + 3월 잔여",
  },
  "hyundai-rotem": {
    calc: "/calc/hyundai-rotem-bonus",
    label: "현대로템 성과급 계산기",
    desc: "임단협 타결안 기본급 450% + 1,620만원",
  },
  // ── 확장 10종 (2026-08-15 Phase 3, 보도값 확보 회사만 신설) ──
  "samsung-display": {
    calc: "/calc/samsung-display-bonus",
    label: "삼성디스플레이 성과급 계산기",
    desc: "OPI 연봉 36% + TAI 반기 최대 100% (2026-01 지급 기준)",
  },
  "samsung-biologics": {
    calc: "/calc/samsung-biologics-bonus",
    label: "삼성바이오로직스 성과급 계산기",
    desc: "OPI 연봉 50% 상한 연속 도달 + TAI 100%",
  },
  "lg-display": {
    calc: "/calc/lg-display-bonus",
    label: "LG디스플레이 성과급 계산기",
    desc: "경영성과급 기본급 150% — 4년 만의 지급 재개 (2026-02)",
  },
  "sk-innovation": {
    calc: "/calc/sk-innovation-bonus",
    label: "SK이노베이션 성과급 계산기",
    desc: "PS+LTI+STI 합산 660% — 계열사 차등 0~800%",
  },
  "s-oil": {
    calc: "/calc/s-oil-bonus",
    label: "S-Oil 성과급 계산기",
    desc: "경영성과급 기본급 250% (최대 1,500% 이력)",
  },
  "gs-caltex": {
    calc: "/calc/gs-caltex-bonus",
    label: "GS칼텍스 성과급 계산기",
    desc: "기본연봉의 25% (2026) — 호황기 50% 이력",
  },
  "doosan-enerbility": {
    calc: "/calc/doosan-enerbility-bonus",
    label: "두산에너빌리티 성과급 계산기",
    desc: "연봉 27% 재원 평가 차등 — 상한 기본급 530%",
  },
  "hyundai-mobis": {
    calc: "/calc/hyundai-mobis-bonus",
    label: "현대모비스 성과급 계산기",
    desc: "임단협 450% + 1,420만 + 우리사주 17주 (2025 타결)",
  },
  "hanwha-aerospace": {
    calc: "/calc/hanwha-aerospace-bonus",
    label: "한화에어로스페이스 성과급 계산기",
    desc: "사업부별 최대 725% (2026-02 지급) — 방산 슈퍼사이클",
  },
  kepco: {
    calc: "/calc/kepco-bonus",
    label: "한국전력 성과급 계산기",
    desc: "공기업 경영평가 A등급 — 월 기본급 200% 상당",
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
        <p className="mt-2 text-xs text-faint-blue">
          <Link
            href="/calc/bonus-calculators"
            className="font-bold underline underline-offset-2 hover:text-electric transition"
          >
            삼성전자·SK하이닉스 등 회사별 성과급 계산기 {bonusCalcCountKo} 전체 보기 →
          </Link>
        </p>
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
      <p className="mt-2 text-xs text-faint">
        <Link
          href="/calc/bonus-calculators"
          className="font-bold underline underline-offset-2 hover:text-primary transition"
        >
          다른 회사 성과급 계산기 {bonusCalcCountKo} 전체 보기 →
        </Link>
      </p>
    </section>
  );
}
