// 삼성전자 TAI(목표달성장려금) 지급률 데이터 — 서버(page.tsx 표)와
// 클라이언트(TaiCalculator)가 공유하는 순수 데이터 모듈.
//
// 2026년 상반기 지급률: 2026-07-06 사내 공지 (지급일 2026-07-08),
// 복수 언론 보도로 교차 확인 (뉴스핌·파이낸셜뉴스·헤럴드경제·ZDNet 등).
// TAI는 월 기본급 대비 %로 상·하반기 연 2회 (통상 7월·12월) 지급된다.

export type TaiRate = {
  id: string;
  division: string;
  /** 소속 부문 표기 */
  group: "DS" | "DX" | "기타";
  /** 월 기본급 대비 % */
  rate: number;
};

/** 2026년 상반기 TAI 지급률 (월 기본급 대비, 2026-07-06 발표) */
export const TAI_RATES_2026_H1: TaiRate[] = [
  { id: "memory", division: "메모리", group: "DS", rate: 100 },
  { id: "lab", division: "반도체연구소·SAIT·DS공통", group: "DS", rate: 100 },
  // CSS 100%는 지급일(7/8) 전후 보도로 추가 확인 (뉴시스·파이낸셜뉴스 2026-07-06)
  { id: "css", division: "CSS (화합물반도체솔루션)", group: "DS", rate: 100 },
  { id: "lsi", division: "시스템LSI", group: "DS", rate: 75 },
  { id: "foundry", division: "파운드리", group: "DS", rate: 75 },
  { id: "mx", division: "MX (스마트폰)", group: "DX", rate: 50 },
  { id: "vd", division: "VD (영상디스플레이)", group: "DX", rate: 50 },
  { id: "network", division: "네트워크", group: "DX", rate: 50 },
  { id: "biz", division: "경영지원", group: "DX", rate: 50 },
  { id: "medical", division: "의료기기·한국총괄", group: "DX", rate: 75 },
  { id: "da", division: "생활가전 (DA)", group: "DX", rate: 25 },
];

export const TAI_ANNOUNCED_DATE = "2026년 7월 6일";
export const TAI_PAY_DATE = "2026년 7월 8일";
