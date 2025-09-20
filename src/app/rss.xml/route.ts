// src/app/rss.xml/route.ts

import { NextResponse } from "next/server";

// src/app/guides/page.tsx 에 있는 전체 가이드 목록을 기반으로 합니다.
const guides = [
  {
    slug: "samsung-vs-hynix",
    title: "삼성전자 vs SK하이닉스, 성과급 포함 연봉 비교 (2025년 최종판)",
    description:
      "반도체 양대산맥, 삼성전자와 SK하이닉스! HBM 대전 속에서 과연 어디가 더 높은 성과급과 연봉을 받을까요? 현직자 정보를 기반으로 상세히 비교 분석합니다.",
  },
  {
    slug: "nekarakubae-salary",
    title: "네카라쿠배 신입 개발자 초봉 실수령액 완벽 분석 (2025년)",
    description:
      "꿈의 직장 '네카라쿠배' 신입 개발자 실제 초봉은? 계약 연봉, 사이닝 보너스, 스톡옵션을 모두 포함한 2025년 최신 기준 세후 월급을 알려드립니다.",
  },
  {
    slug: "nurse-5yr-salary",
    title: "5년차 간호사 연봉 테이블 및 세후 월급 (2025년 빅5 병원 포함)",
    description:
      "대학병원, 종합병원 기준 5년차 간호사의 현실적인 연봉과 실수령액은? 서울대, 아산, 삼성서울병원 등 빅5 병원 정보와 함께 상세히 알려드립니다.",
  },
  {
    slug: "civil-servant-salary",
    title: "공무원 9급, 7급 첫 월급 상세 분석 (2025년 기준 실수령액)",
    description:
      "2025년 공무원 봉급표 기준, 9급 및 7급 1호봉의 실제 첫 월급은? 기본급과 각종 수당을 포함한 세후 실수령액을 상세히 알려드립니다.",
  },
  {
    slug: "hyundai-salary",
    title: "현대자동차 생산직 초봉과 성과급 분석 (2025년)",
    description:
      "킹산직, 갓산직이라 불리는 현대차 생산직! 2025년 최신 정보 기준 신입 초봉, 성과급, 각종 복지를 포함한 예상 실수령액을 알아봅니다.",
  },
  {
    slug: "salary-negotiation",
    title: "이직 시 연봉협상, 최소 OO%는 불러야 하는 이유",
    description:
      "성공적인 이직을 위한 연봉협상 전략! 현재 연봉, 시장 가치, 희망 연봉을 기반으로 최소 15~20%를 높여 불러야 하는 이유와 협상 노하우를 알려드립니다.",
  },
  {
    slug: "first-job-investment",
    title: "첫 월급 재테크, 100만원으로 시작하는 투자 로드맵",
    description:
      "사회초년생을 위한 첫 월급 재테크 완벽 가이드. 100만원 시드머니로 시작하는 연금저축펀드, S&P 500 ETF 등 가장 현실적인 투자 방법을 소개합니다.",
  },
  {
    slug: "yef-2026-preview",
    title: "2026년 연말정산, 바뀌는 공제 항목 총정리",
    description:
      "미리 준비하는 2026년 연말정산. 새롭게 바뀌는 소득공제, 세액공제 항목은 무엇일까요? 최신 세법 개정안을 바탕으로 핵심 변경 사항을 예측하고 정리합니다.",
  },
  {
    slug: "didimdol-vs-bogeumjari",
    title: "내 집 마련 디딤돌 대출 vs 보금자리론 완벽 비교 (2025년)",
    description:
      "신혼부부, 생애최초 주택 구매자를 위한 대표 정책 대출 상품! 디딤돌 대출과 보금자리론의 자격 조건, 대출 한도, 금리를 2025년 기준으로 완벽하게 비교 분석합니다.",
  },
  {
    slug: "industry-trends-2025",
    title:
      "삼성 vs 하이닉스, 역대급 '성과급 격차' 심층 분석 (feat. 정부 밸류업)",
    description:
      "왜 SK하이닉스 성과급은 연봉의 50%인데, 삼성전자는 아닐까? HBM 기술 격차, 사업부별 실적 차이가 두 거인의 연봉과 미래에 미칠 영향을 심층 분석합니다.",
  },
  {
    slug: "salary-4500",
    title: "연봉 4500만원 실수령액, 세후 월급은 얼마일까? (2025년 기준)",
    description:
      "연봉 4500만원 직장인의 실제 월급은? 2025년 최신 4대보험, 소득세 기준 세후 실수령액과 공제 항목을 상세히 분석해 드립니다.",
  },
  {
    slug: "bonus-tax",
    title: "성과급(상여금) 세금 계산법, A to Z 완벽 정리 (2025년)",
    description:
      "열심히 일한 보상, 성과급! 하지만 세금이 얼마나 나올지 걱정되시나요? 성과급(상여금) 세금 계산 원리와 절세 팁까지 모두 알려드립니다.",
  },
  {
    slug: "4-day-week",
    title: "주 4일제 연봉 계산법: 내 월급은 어떻게 바뀔까?",
    description:
      "주 4일제(주 32시간)로 전환되면 내 연봉과 월급은 어떻게 바뀔까요? 근로시간 단축 시 임금 계산 원칙과 실제 계산법을 알려드립니다.",
  },
  {
    slug: "unemployment-benefits",
    title: "실업급여 조건, A부터 Z까지 완벽 정리 (2025년 최신판)",
    description:
      "실업급여 수급 자격, 신청 방법, 지급액, 구직활동까지. 2025년 최신 기준으로 실업급여의 모든 것을 자세히 알려드립니다.",
  },
  {
    slug: "holiday-allowance",
    title: "주휴수당 계산법 및 지급 조건 완벽 가이드",
    description:
      "주휴수당, 받을 수 있는지 궁금하신가요? 2025년 최신 지급 조건과 내 월급에 맞는 주휴수당 계산법을 예시와 함께 알려드립니다.",
  },
  {
    slug: "severance-tax",
    title: "퇴직금 세금 계산, 복잡한 과정 한 번에 이해하기",
    description:
      "내 퇴직금에서 세금이 얼마나 빠져나갈까요? 복잡한 퇴직소득세 계산 구조와 공제 항목을 예시와 함께 쉽게 설명해 드립니다.",
  },
  {
    slug: "four-major-insurances",
    title: "4대 보험 완벽 정리: 국민연금, 건강보험, 고용보험, 산재보험",
    description:
      "직장인이라면 반드시 알아야 할 4대 사회보험의 모든 것. 각 보험의 역할, 요율, 계산 방법까지 한 페이지에서 완벽하게 마스터하세요.",
  },
  {
    slug: "year-end-tax-settlement",
    title: "연말정산 A to Z: 13월의 월급, 제대로 챙기는 법",
    description:
      "소득공제와 세액공제의 차이점부터 놓치기 쉬운 핵심 공제 항목까지, 연말정산의 모든 것을 알려드립니다.",
  },
  {
    slug: "minimum-wage",
    title: "2025년 최저임금 완벽정리 (시급, 월급, 연봉)",
    description:
      "2025년 최저시급은 얼마일까요? 최저임금 기준 월급과 연봉, 그리고 주휴수당 포함 계산법까지 모두 알려드립니다.",
  },
  {
    slug: "nurse-salary",
    title: "2025년 간호사 연봉 테이블 완벽 분석 (신규, 5년차, 수간호사)",
    description:
      "대학병원, 종합병원, 개인병원별 신규 간호사부터 5년차, 10년차 이상 수간호사까지 직급별 연봉 및 실수령액 정보를 제공합니다.",
  },
  {
    slug: "road-to-100m-part1-tax",
    title: "연봉 1억을 위한 현실적인 절세 전략 (2025년 최종판)",
    description:
      "연봉 1억 실수령액을 높이는 가장 확실한 방법, 절세. 연금저축펀드, IRP, 비과세 수당 활용법부터 총정리했습니다.",
  },
  {
    slug: "road-to-100m-part2-sidejob",
    title: "N잡으로 월 100만원 더 벌기 (2025년 부업 가이드)",
    description:
      "직장인 부업 추천! 전문성을 활용한 N잡부터 스마트스토어, 배달 아르바이트까지 현실적인 방법을 알려드립니다.",
  },
  {
    slug: "road-to-100m-part3-invest",
    title: "월급으로 시작하는 투자 파이프라인 (2025년 투자 로드맵)",
    description:
      "시드머니 모으기부터 미국 S&P 500 ETF, 연금저축펀드를 활용한 장기 투자 전략과 절세 혜택까지 제시합니다.",
  },
];

function generateRssFeed() {
  const baseUrl = "https://www.moneysalary.com";
  const siteTitle = "Moneysalary Blog";

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>`;
  rss += `<rss version="2.0">`;
  rss += `<channel>`;
  rss += `<title>${siteTitle}</title>`;
  rss += `<link>${baseUrl}</link>`;
  rss += `<description>연봉, 세금, 재테크에 대한 모든 것</description>`;
  rss += `<language>ko</language>`;

  guides.forEach((guide) => {
    rss += `<item>`;
    rss += `<title>${guide.title}</title>`;
    rss += `<link>${baseUrl}/guides/${guide.slug}</link>`;
    rss += `<description>${guide.description}</description>`;
    rss += `<pubDate>${new Date().toUTCString()}</pubDate>`; // 실제로는 각 글의 발행일이 들어가야 합니다.
    rss += `</item>`;
  });

  rss += `</channel>`;
  rss += `</rss>`;

  return rss;
}

export async function GET() {
  const feed = generateRssFeed();
  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
