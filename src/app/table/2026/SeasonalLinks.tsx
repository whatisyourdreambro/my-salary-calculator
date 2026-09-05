// src/app/table/2026/SeasonalLinks.tsx
//
// 실수령액 표 4종(연봉·월급·주급·시급) + /salary/[amount] 211 + /monthly/[amount]
// 105 페이지 공용 시즌 크로스링크 블록 (서버 컴포넌트, 2026-08-23 재사용 확대).
// — 시즌 교체 시 이 파일 하나만 고치면 320개 페이지에 일괄 반영된다.
// 배경: 표 페이지는 사이트 트래픽 최상위인데 시즌 피크 페이지로 가는 링크가
// 0건이었음(2026-07 감사). 기존 유입을 시즌 페이지로 라우팅 + 신규 페이지 색인 가속.
// ★시즌마다 목록·제목을 교체할 것 (2026-08-17 감사에서 7월 세트 만료 방치 적발 —
//   재산세 1기 종료, 하이닉스 PI "발표 예정" 등 만료 문구가 최상위 트래픽에 노출됨).
// ★교체 방법(2026-09-05 L13a): 세트를 상수로 사전 제작해 두고 아래 ACTIVE_SET
//   한 줄만 바꾼다 (제목 heading 도 세트에 포함 — 링크와 제목이 따로 만료되지 않게).
// 주의: 광고 슬롯(layout GuideMidAd·페이지 내 CalcResultAd·PageFooterAds)과 겹치지 않는
// 본문 콘텐츠 영역에만 배치할 것. 광고 위치는 절대 이동 금지.

import Link from "@/components/AppLink";
import { ArrowRight, Flame } from "lucide-react";

export interface SeasonalLinkItem {
  href: string;
  title: string;
  description: string;
}

export interface SeasonalLinkSet {
  /** 블록 제목 (h2) — 세트와 함께 교체 */
  heading: string;
  links: SeasonalLinkItem[];
}

// 9월 추석 시즌 세트 (2026-08-17 교체). 추석 9/25·재산세 2기 9/30 종료.
export const SEASONAL_LINKS_SEP: SeasonalLinkSet = {
  heading: "추석 전에 꼭 확인할 것들 — 9월 시즌 체크리스트",
  links: [
    {
      href: "/chuseok-bonus-2026",
      title: "추석 상여금·명절휴가비 총정리",
      description: "우리 회사는 얼마 줄까? 평균 지급액·세금 한눈에",
    },
    {
      href: "/calc/holiday-bonus",
      title: "명절 상여금 세후 계산기",
      description: "상여금에서 세금 떼면 실수령 얼마인지 바로 확인",
    },
    {
      href: "/property-holding-tax-2026",
      title: "9월 재산세 2기분 납부 (9/16~30)",
      description: "주택분 나머지 50% + 토지분 — 내 재산세 확인",
    },
    {
      href: "/civil-servant-pay-2027",
      title: "2027 공무원 봉급 3.9% 인상 확정(예산안)",
      description: "16년 만 최대 인상 — 9급~5급 내년 예상 월급 미리보기",
    },
    {
      href: "/minimum-wage-2027",
      title: "2027 최저임금 10,700원 확정",
      description: "내년 시급·월급 얼마나 오르나 미리보기",
    },
    {
      href: "/table/2027/annual",
      title: "2027 연봉 실수령액 표 미리보기",
      description: "연금 5% 인상 반영 — 내년 세후 월급 선확인",
    },
  ],
};

// 10월 연말정산 예열 세트 — 9/26(추석 종료 익일) 교체용 사전 제작 (2026-09-05 L13a).
// 라우트 6종 전부 src/app 에 실존 확인. ★국세청 미리보기 오픈일 미확인 → 날짜·오픈일
// 카피 금지. 성과급(TAI H2 등)은 데이터 게이트와 함께 L13b 에서 별도.
export const SEASONAL_LINKS_OCT: SeasonalLinkSet = {
  heading: "연말정산 미리 준비 — 10월 시즌 체크리스트",
  links: [
    {
      href: "/year-end-tax-preview",
      title: "홈택스 연말정산 미리보기 이용법",
      description: "예상 세액 먼저 확인 — 남은 기간 공제 전략 세우기",
    },
    {
      href: "/year-end-tax-2027",
      title: "연말정산 2027 총정리 허브 (2026년 귀속)",
      description: "일정·계산기·단계별 로드맵 한눈에",
    },
    {
      href: "/credit-card-deduction-2026",
      title: "신용카드 소득공제 계산기",
      description: "총급여 25% 문턱 넘겼나? 결제수단별 공제율·한도 확인",
    },
    {
      href: "/rent-tax-credit-2026",
      title: "월세 세액공제 계산기",
      description: "연 1,000만 한도 최대 170만 — 조건·예상 공제액",
    },
    {
      href: "/medical-tax-credit-2026",
      title: "의료비 세액공제 계산기",
      description: "실손 차감 후 공제액 — 난임 30%·무한도 대상 구분",
    },
    {
      href: "/table/2027/annual",
      title: "2027 연봉 실수령액 표 미리보기",
      description: "국민연금 10%(근로자 5%) 반영 — 내년 세후 월급 선확인",
    },
  ],
};

// 12월 연말정산 마감 세트 — 12/1 교체용 사전 제작 (2026-09-05, L18' 시점 앞당김).
// 라우트 6종 전부 src/app 에 실존 확인. ★TAI 하반기는 발표 전 → 라벨만, 지급률 수치 금지
// (brief §2-5). 12/31 은 귀속연도 종료일(법정)이라 카피 허용.
export const SEASONAL_LINKS_DEC: SeasonalLinkSet = {
  heading: "연말정산 12/31 마감 전 체크 — 12월 시즌 체크리스트",
  links: [
    {
      href: "/year-end-tax-2027",
      title: "연말정산 2027 총정리 허브 (2026년 귀속)",
      description: "일정·계산기·단계별 로드맵 — 12/31 전 마지막 점검",
    },
    {
      href: "/calc/samsung-bonus",
      title: "삼성전자 하반기 TAI 세후 계산기",
      description: "사업부별 지급률 입력 → 세후 실수령액 즉시 확인",
    },
    {
      href: "/credit-card-deduction-2026",
      title: "신용카드 소득공제 계산기",
      description: "총급여 25% 문턱 넘겼나? 연말 결제수단별 공제율·한도 확인",
    },
    {
      href: "/medical-tax-credit-2026",
      title: "의료비 세액공제 계산기",
      description: "실손 차감 후 공제액 — 난임 30%·무한도 대상 구분",
    },
    {
      href: "/year-end-tax-checklist",
      title: "연말정산 체크리스트",
      description: "12.31 마감 전 놓치기 쉬운 공제 항목 점검",
    },
    {
      href: "/table/2027/annual",
      title: "2027 연봉 실수령액 표 미리보기",
      description: "국민연금 10%(근로자 5%) 반영 — 내년 세후 월급 선확인",
    },
  ],
};

// 1월 연말정산 간소화·OPI 세트 — 1/2 교체용 사전 제작 (2026-09-05, L18' 시점 앞당김).
// 라우트 6종 전부 src/app 에 실존 확인. ★OPI 는 발표 전 → 라벨만, 지급률 수치 금지.
// ★간소화 오픈일은 국세청 공지 전 미확인 → 날짜 카피 금지.
export const SEASONAL_LINKS_JAN: SeasonalLinkSet = {
  heading: "연말정산 간소화 오픈 — 1월 시즌 체크리스트",
  links: [
    {
      href: "/year-end-tax-2027",
      title: "연말정산 간소화 서비스 이용 순서 — 2027 허브",
      description: "간소화 자료 조회부터 회사 제출까지 단계별 로드맵",
    },
    {
      href: "/calc/samsung-bonus",
      title: "삼성전자 OPI 세후 계산기",
      description: "발표된 사업부별 지급률 입력 → 세후 실수령액 바로 확인",
    },
    {
      href: "/year-end-tax",
      title: "연말정산 환급금 계산기",
      description: "간소화 자료 기준 예상 환급·추가납부액 즉시 계산",
    },
    {
      href: "/credit-card-deduction-2026",
      title: "신용카드 소득공제 계산기",
      description: "결제수단별 공제율·한도 — 간소화 자료로 막판 점검",
    },
    {
      href: "/table/2027/annual",
      title: "2027 연봉 실수령액 표",
      description: "국민연금 10%(근로자 5%) 적용 — 올해 세후 월급 확인",
    },
    {
      href: "/medical-tax-credit-2026",
      title: "의료비 세액공제 계산기",
      description: "실손 차감 후 공제액 — 난임 30%·무한도 대상 구분",
    },
  ],
};

// 9/26 교체: SEASONAL_LINKS_SEP → SEASONAL_LINKS_OCT
// 12/1·1/2 교체 = 한 줄: SEASONAL_LINKS_OCT → SEASONAL_LINKS_DEC → SEASONAL_LINKS_JAN
const ACTIVE_SET: SeasonalLinkSet = SEASONAL_LINKS_SEP;

interface SeasonalLinksProps {
  /** 페이지별 여백 보정용 (예: page-width 밖에서 쓸 때 px-4 sm:px-6) */
  className?: string;
}

export default function SeasonalLinks({ className = "" }: SeasonalLinksProps) {
  return (
    <section
      className={`max-w-4xl mx-auto mt-12 mb-4 ${className}`}
      data-msy-module="seasonal-links"
    >
      <div className="flex items-center gap-2 mb-4 px-1">
        <Flame className="w-5 h-5 text-electric" aria-hidden="true" />
        <h2 className="text-lg font-black text-navy">{ACTIVE_SET.heading}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIVE_SET.links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-canvas-200 hover:border-electric transition-colors"
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold text-navy leading-snug">
                {item.title}
              </span>
              <span className="block text-xs text-faint-blue mt-1 leading-snug">
                {item.description}
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-electric shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
    </section>
  );
}
