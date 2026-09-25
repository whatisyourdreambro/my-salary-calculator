// 1/1 요율 전환 때 포인터(src/config/currentRates.ts)를 따라 연도 표기가 함께 바뀌어야 하는 표면 목록
// (2026-09-25 N3 리뷰 반영 — 회사 상세·상장사 FAQ·/widget/bonus·임베드 스니펫·성과급 계산기 출처 문장 등).
// currentRates.test.ts(오늘 = 종전 2026 리터럴 그대로)와 currentRatesDryRun2027.test.ts(포인터 2027 모킹)가
// 같은 목록을 쓴다 — 표면을 추가할 때 이 파일 한 곳만 고치면 두 테스트가 함께 지킨다.
// 테스트 파일(*.test.ts)이 아니라 vitest 가 직접 돌리지 않는다. 광고·링크·next 모킹은 호출하는 테스트가 한다.
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { companyRepository } from "@/lib/salary-data/CompanyRepository";
import { listedCohort } from "@/lib/salary-data/dartLite";
import { calculateSalary2026 } from "@/lib/TaxLogic";

export interface RateYearSurface {
  id: string;
  /** 렌더된 HTML(React 텍스트 구분 주석 제거) 또는 문자열 */
  load: () => Promise<string>;
  /** 연도 y 에서 들어 있어야 하는 문장 */
  expected: (y: number) => string[];
}

const strip = (html: string) => html.replaceAll("<!-- -->", "");
const render = (C: unknown, props: Record<string, unknown> = {}) =>
  strip(renderToStaticMarkup(createElement(C as ComponentType<Record<string, unknown>>, props)));

/** /calc/*-bonus 출처 푸터 — 앞 문장과의 띄어쓰기까지 확인 (줄 머리 {" "} 회귀 방지) */
const BONUS_FOOTERS: Array<[string, () => Promise<{ default: unknown }>, (y: number) => string]> = [
  ["celltrion", () => import("@/app/calc/celltrion-bonus/page"), (y) => `보도. ${y} 세법(소득세율·4대보험 요율) 반영.`],
  ["doosan-enerbility", () => import("@/app/calc/doosan-enerbility-bonus/page"), (y) => `1억원). ${y}년 세법(소득세율·4대보험 요율) 반영.`],
  ["gs-caltex", () => import("@/app/calc/gs-caltex-bonus/page"), (y) => `기준). ${y} 세법 반영.`],
  ["hanwha-aerospace", () => import("@/app/calc/hanwha-aerospace-bonus/page"), (y) => `교차 확인). ${y} 세법 반영.`],
  ["hd-hyundai", () => import("@/app/calc/hd-hyundai-bonus/page"), (y) => `머니데이). ${y} 세법 반영.`],
  ["hyundai-mobis", () => import("@/app/calc/hyundai-mobis-bonus/page"), (y) => `2026-03-09). ${y} 세법 반영.`],
  ["hyundai-rotem", () => import("@/app/calc/hyundai-rotem-bonus/page"), (y) => `갈등 보도). ${y} 세법 반영.`],
  ["kakao", () => import("@/app/calc/kakao-bonus/page"), (y) => `연봉체계 자료. ${y} 세법 반영.`],
  ["kepco", () => import("@/app/calc/kepco-bonus/page"), (y) => `2026-05-06 인용). ${y} 세법 반영.`],
  ["kia", () => import("@/app/calc/kia-bonus/page"), (y) => `삼프로TV). ${y} 세법 반영.`],
  ["lg-chem", () => import("@/app/calc/lg-chem-bonus/page"), (y) => `연봉 데이터. ${y} 세법 반영.`],
  ["lg-display", () => import("@/app/calc/lg-display-bonus/page"), (y) => `2024-03-14 보도. ${y}년 세법(소득세율·4대보험 요율) 반영.`],
  ["lg-energy", () => import("@/app/calc/lg-energy-bonus/page"), (y) => `리포트 2026-05. ${y} 세법 반영.`],
  ["naver", () => import("@/app/calc/naver-bonus/page"), (y) => `RSU 분석. ${y} 세법 반영.`],
  ["posco", () => import("@/app/calc/posco-bonus/page"), (y) => `포스코 사업보고서. ${y} 세법 반영.`],
  ["s-oil", () => import("@/app/calc/s-oil-bonus/page"), (y) => `5,404만원). ${y}년 세법(소득세율·4대보험 요율) 반영.`],
  ["samsung-biologics", () => import("@/app/calc/samsung-biologics-bonus/page"), (y) => `DART 인용). ${y} 세법 반영.`],
  ["samsung-display", () => import("@/app/calc/samsung-display-bonus/page"), (y) => `2025-07-01 보도. ${y} 세법 반영.`],
  ["samsung-sdi", () => import("@/app/calc/samsung-sdi-bonus/page"), (y) => `분기 실적. ${y} 세법 반영.`],
  ["sk-hynix", () => import("@/app/calc/sk-hynix-bonus/page"), (y) => `근거로 합니다. ${y}년 세법(소득세율· 4대보험 요율)을 반영했습니다.`],
  ["sk-innovation", () => import("@/app/calc/sk-innovation-bonus/page"), (y) => `2026-03-16 제출). ${y}년 세법(소득세율·4대보험 요율) 반영.`],
];

const companies = companyRepository.getAll();
const disclosedCompany = companies.find((c) => c.disclosed)!;
const plainCompany = companies.find((c) => !c.disclosed)!;
const listed = listedCohort[0];

export const RATE_YEAR_SURFACES: RateYearSurface[] = [
  {
    id: "회사 상세 FAQ (공시 보유)",
    load: async () => JSON.stringify((await import("@/lib/companyFaqItems")).buildCompanyFaq(disclosedCompany)),
    expected: (y) => [`실수령액은 ${y}년 세법·4대보험 요율(${y === 2026 ? "2026-07" : "2027-01"} 반영)로 자동 계산합니다. 직급별 기본급·인센티브는 공개 자료 기반 자체 추정치이며, 공시 평균연봉은 표시된 사업연도 기준입니다.`],
  },
  {
    id: "회사 상세 FAQ (공시 없음)",
    load: async () => JSON.stringify((await import("@/lib/companyFaqItems")).buildCompanyFaq(plainCompany)),
    expected: (y) => [`실수령액은 ${y}년 세법·4대보험 요율(${y === 2026 ? "2026-07" : "2027-01"} 반영)로 자동 계산합니다.`],
  },
  {
    id: "회사 상세 실수령 표 제목",
    load: async () => render((await import("@/components/CompanySalaryTable")).default, { company: disclosedCompany }),
    expected: (y) => [`${disclosedCompany.name.ko} 직급별 연봉 · 실수령액 (${y} 세법 기준)`],
  },
  {
    id: `상장사 lite /salary-db/listed/${listed.stockCode} FAQ·산출 기준`,
    load: async () => render((await import("@/app/salary-db/listed/[stockCode]/page")).default, { params: { stockCode: listed.stockCode } }),
    expected: (y) => {
      const net = Math.round(calculateSalary2026(listed.avgSalaryManwon * 10000, 200000, 1, 0).netPay / 10000);
      return [
        `${y}년 세법(4대보험·소득세, 비과세 식대 20만원·본인 1인 공제)으로 환산하면 월 실수령액은 약 ${net.toLocaleString("ko-KR")}만원입니다.`,
        `${y}년 세법 기준(국민연금 `,
      ];
    },
  },
  {
    id: "/widget/bonus",
    load: async () => (await (await import("@/app/widget/bonus/route")).GET()).text(),
    expected: (y) => [
      `<title>${y} 성과급 실수령액 계산기 — 머니샐러리</title>`,
      `<p class="title">🎁 ${y} 성과급 <span>세후 실수령</span> 계산기</p>`,
      `<p class="note">${y}년 세법 기준 추정치입니다.`,
    ],
  },
  {
    id: "/embed 연봉·성과급 스니펫",
    load: async () => JSON.stringify((await import("@/app/embed/widgets")).EMBED_WIDGETS.filter((w) => w.id === "salary" || w.id === "bonus")),
    expected: (y) => [
      `title=\\"${y} 연봉 실수령액 계산기\\"`,
      `>${y} 연봉 실수령액 계산기 by 머니샐러리</a>`,
      `${y}년 세법(4대보험 요율·간이세액) 기준, 부양가족 1인`,
      `title=\\"${y} 성과급 실수령액 계산기\\"`,
      `>${y} 성과급 계산기 by 머니샐러리</a>`,
      `${y}년 세법 한계세율 기준 — 성과급이`,
    ],
  },
  {
    id: "/calc/holiday-bonus 본문 안내",
    load: async () => render((await import("@/app/calc/holiday-bonus/page")).default),
    expected: (y) => [`본 계산은 단일 직장 근로자 기준 ${y}년 세법으로 추정한 값입니다.`],
  },
  {
    id: "/calc/bonus-calculators 요약·카드·FAQ",
    load: async () => render((await import("@/app/calc/bonus-calculators/page")).default),
    expected: (y) => [
      `회사별 최신 지급률과 ${y}년 세법을 반영한 전용 계산기에서 본인 연봉만 입력하면`,
      `연봉+성과급 금액만 입력 — ${y} 세법 세후 실수령`,
      `동일한 ${y}년 세법 기준으로 세후 실수령액이 나옵니다.`,
    ],
  },
  {
    id: "/calc/offer-compare FAQ",
    load: async () => render((await import("@/app/calc/offer-compare/page")).default),
    expected: (y) => [`이 비교기는 ${y}년 4대보험 요율과 근로소득 간이세액표(2026년 3월 1일 지급분부터)로 월 실수령을 계산하는 비교용 모델입니다.`],
  },
  {
    id: "/salary-db/ranking 홈 계산기 카드",
    load: async () => render((await import("@/app/salary-db/ranking/page")).default),
    expected: (y) => [`${y} 세법 기준 5초 계산`],
  },
  {
    id: "/tools/finance/bonus 배지",
    load: async () => render((await import("@/app/tools/finance/bonus/page")).default),
    expected: (y) => [` ${y} 기준 · 성과급 세후 비교`],
  },
  {
    id: "/pro/career-planner FAQ",
    load: async () => render((await import("@/app/pro/career-planner/page")).default),
    expected: (y) => [`머니샐러리 홈의 연봉 계산기에서 ${y}년 세법 기준으로 확인하세요.`],
  },
  {
    id: "공공기관 연봉 비교 기준 문장",
    load: async () => render((await import("@/app/public-institutions/PublicInstitutionSalaryClient")).default),
    expected: (y) => [`${y}년 일반 근로자 공제 모형과 국민연금 2026년 7월 이후 상·하한을 사용합니다.`],
  },
  {
    id: "홈 계산기 로딩 화면",
    load: async () => render((await import("@/components/LoadingInterstitial")).default, { isOpen: true, onClose() {} }),
    expected: (y) => [`${y}년 세법 기준으로 계산 중입니다...`, `${y}년 소득세율 및 4대보험료 적용 중`],
  },
  {
    id: "/en 계산기 제목·도움말",
    load: async () =>
      render((await import("@/app/en/EnglishSalaryCalculator")).default) + render((await import("@/app/en/help/page")).default),
    expected: (y) => [
      `Korea take-home salary estimate · ${y}</h2>`,
      `The English home form uses the same ${y} simplified regular-employee calculation as the Korean home page.`,
    ],
  },
  ...BONUS_FOOTERS.map(([name, load, text]): RateYearSurface => ({
    id: `/calc/${name}-bonus 출처 문장`,
    load: async () => render((await load()).default),
    expected: (y) => [text(y)],
  })),
];
