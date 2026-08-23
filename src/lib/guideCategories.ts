// src/lib/guideCategories.ts
//
// 가이드 카테고리 허브(/guides/category/[slug]) 정적 설정 — 단일 소스.
// ★경량 설정만 담는다 — guidesData(수백 KB) import 금지 (GuidePageClient 등
//   클라이언트 컴포넌트가 배지 링크용으로 import 하므로 번들 오염 주의).
// 목록·편수는 허브 페이지(서버)가 guidesData 에서 파생한다.
// 슬러그는 ASCII 고정 (CF Pages 한글 프리렌더 404 함정 회피).

export interface GuideCategoryHub {
  /** ASCII 라우트 슬러그 */
  slug: string;
  /** guidesData 의 category 값 (한글) */
  categoryId: string;
  /** 허브 H1 용 라벨 */
  title: string;
  /** 수기 인트로 — 연도·수치 등 낡는 정보 금지 (연 1회 점검 부담 제거) */
  intro: string;
  /** 관련 계산기·허브 (실존 경로만 — 내부 404 금지) */
  related: { href: string; label: string }[];
}

export const GUIDE_CATEGORY_HUBS: GuideCategoryHub[] = [
  {
    slug: "salary",
    categoryId: "연봉",
    title: "연봉 가이드",
    intro:
      "연봉 협상부터 실수령액 구조, 성과급·상여금, 회사별 연봉 비교까지 — 내 몸값을 올리고 정확히 아는 데 필요한 모든 가이드를 모았습니다. 계산기와 함께 읽으면 연봉 테이블 뒤에 숨은 세금·4대보험 구조까지 한 번에 이해할 수 있습니다.",
    related: [
      { href: "/", label: "연봉 실수령액 계산기" },
      { href: "/salary-db", label: "회사별 연봉 DB" },
      { href: "/calc/bonus-calculators", label: "회사별 성과급 계산기" },
    ],
  },
  {
    slug: "tax",
    categoryId: "세금",
    title: "세금 가이드",
    intro:
      "연말정산 공제 항목부터 종합소득세, 상여금 세금, 절세 전략까지 — 직장인이 내는 세금의 구조와 돌려받는 방법을 정리했습니다. 매년 바뀌는 세법의 핵심만 골라, 계산기로 바로 확인할 수 있게 연결해 두었습니다.",
    related: [
      { href: "/year-end-tax", label: "연말정산 계산기" },
      { href: "/hub/tax-saving", label: "절세 전략 허브" },
      { href: "/tools/finance/bonus", label: "성과급 세금 계산기" },
    ],
  },
  {
    slug: "real-estate",
    categoryId: "부동산",
    title: "부동산 가이드",
    intro:
      "전세·월세 계약부터 주택청약, 주택담보대출, 부동산 세금까지 — 내 집 마련과 주거비 관리에 필요한 지식을 모았습니다. 대출 한도와 상환 계획은 계산기로 직접 시뮬레이션해 보세요.",
    related: [
      { href: "/home-loan", label: "주택담보대출 계산기" },
      { href: "/calc/jeonse-loan", label: "전세대출 계산기" },
      { href: "/calc/housing-subscription", label: "주택청약 가점 계산기" },
    ],
  },
  {
    slug: "career",
    categoryId: "커리어",
    title: "커리어 가이드",
    intro:
      "이직 전략, 연봉 점프, 이력서·면접 준비, 직장 생활의 권리까지 — 커리어를 성장시키는 실전 노하우를 모았습니다. 직업별 연봉 데이터와 함께 보면 다음 커리어의 기대 몸값을 가늠할 수 있습니다.",
    related: [
      { href: "/hub/career", label: "커리어 허브" },
      { href: "/job", label: "직업별 연봉" },
      { href: "/pro/career-planner", label: "커리어 플래너" },
    ],
  },
  {
    slug: "invest",
    categoryId: "투자",
    title: "투자 가이드",
    intro:
      "예적금과 ISA·연금저축 같은 절세 계좌부터 ETF, 배당, 자산 배분까지 — 월급을 자산으로 바꾸는 투자 기초를 정리했습니다. 복리 계산기와 FIRE 계산기로 목표 금액까지의 거리를 직접 확인해 보세요.",
    related: [
      { href: "/hub/invest", label: "투자 허브" },
      { href: "/fire-calculator", label: "FIRE 은퇴 계산기" },
      { href: "/tools/finance/compound", label: "복리 계산기" },
    ],
  },
  {
    slug: "stock",
    categoryId: "주식",
    title: "주식 가이드",
    intro:
      "국내외 주식 투자 방법, 종목·산업 분석, 주식 세금까지 — 주식 투자에 필요한 지식을 모았습니다. 관심 기업의 연봉·실적 데이터와 함께 보면 산업을 보는 눈이 넓어집니다.",
    related: [
      { href: "/hub/invest", label: "투자 허브" },
      { href: "/salary-db", label: "기업 데이터 DB" },
      { href: "/insights", label: "데이터 리포트" },
    ],
  },
  {
    slug: "basics",
    categoryId: "기초",
    title: "금융 기초 가이드",
    intro:
      "4대보험과 급여명세서 읽는 법부터 통장 쪼개기, 신용점수 관리까지 — 사회초년생이 가장 먼저 알아야 할 돈 관리 기초를 모았습니다. 용어가 낯설다면 용어사전과 함께 읽어보세요.",
    related: [
      { href: "/glossary", label: "금융 용어사전" },
      { href: "/", label: "연봉 실수령액 계산기" },
      { href: "/qna", label: "급여 Q&A" },
    ],
  },
];

/** 한글 category → 허브 슬러그 (배지 링크용 — 미등재 카테고리는 undefined) */
export const hubSlugByCategoryId: Record<string, string> = Object.fromEntries(
  GUIDE_CATEGORY_HUBS.map((h) => [h.categoryId, h.slug])
);
