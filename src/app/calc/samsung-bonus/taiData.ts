// 삼성전자 TAI(목표달성장려금) 지급률 데이터 — 서버(page.tsx 표)와
// 클라이언트(TaiCalculator)가 공유하는 순수 데이터 모듈.
//
// 2026년 상반기 지급률: 2026-07-06 사내 공지 (지급일 2026-07-08),
// 복수 언론 보도로 교차 확인 (뉴스핌·파이낸셜뉴스·헤럴드경제·ZDNet 등).
// TAI는 월 기본급 대비 %로 상·하반기 연 2회 (통상 7월·12월) 지급된다.
//
// 2026-09-21 S2-0: 하반기(H2) null 슬롯 + 최신 반기 라벨 파생(TAI_LATEST) 추가.
// 12월 말 하반기 발표 D0 에는 TAI_RATES_2026_H2·TAI_H2_ANNOUNCED_DATE·TAI_H2_PAY_DATE
// 3개를 한 번에 채운다(하나라도 비면 null 유지 — 추정 카피 금지). 본문 라벨은
// TAI_LATEST 에서 파생되므로 page.tsx·TaiCalculator 의 문자열은 손대지 않는다.

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
  // 보도 원문 표기는 "SR·경영지원·기타" (지급률 50%로 동일)
  { id: "biz", division: "SR·경영지원·기타", group: "DX", rate: 50 },
  { id: "medical", division: "의료기기·한국총괄", group: "DX", rate: 75 },
  { id: "da", division: "생활가전 (DA)", group: "DX", rate: 25 },
];

export const TAI_ANNOUNCED_DATE = "2026년 7월 6일";
export const TAI_PAY_DATE = "2026년 7월 8일";

/** 2026년 하반기 TAI — 발표 전 null 강제 (통상 12월 말 발표). 추정치 기입 금지 */
export const TAI_RATES_2026_H2: TaiRate[] | null = null;
export const TAI_H2_ANNOUNCED_DATE: string | null = null;
export const TAI_H2_PAY_DATE: string | null = null;

export type TaiPeriod = {
  half: "H1" | "H2";
  /** "2026년 상반기" — 문장용 */
  periodLabel: string;
  /** "2026 상반기" — 짧은 라벨(버튼·캡션) */
  shortLabel: string;
  rates: TaiRate[];
  announcedDate: string;
  payDate: string;
};

function pickLatest(): TaiPeriod {
  if (TAI_RATES_2026_H2 && TAI_H2_ANNOUNCED_DATE && TAI_H2_PAY_DATE) {
    return {
      half: "H2",
      periodLabel: "2026년 하반기",
      shortLabel: "2026 하반기",
      rates: TAI_RATES_2026_H2,
      announcedDate: TAI_H2_ANNOUNCED_DATE,
      payDate: TAI_H2_PAY_DATE,
    };
  }
  return {
    half: "H1",
    periodLabel: "2026년 상반기",
    shortLabel: "2026 상반기",
    rates: TAI_RATES_2026_H1,
    announcedDate: TAI_ANNOUNCED_DATE,
    payDate: TAI_PAY_DATE,
  };
}

/** 가장 최근 발표 반기 — page.tsx·TaiCalculator 라벨·프리셋은 여기서만 파생 */
export const TAI_LATEST: TaiPeriod = pickLatest();

/** 최신 반기 최고 지급률 행 (메타 설명·FAQ "메모리 100%" 파생용) */
export const TAI_LATEST_TOP: TaiRate = TAI_LATEST.rates.reduce((best, r) =>
  r.rate > best.rate ? r : best
);

/** FAQ 요약용 "메모리·반도체연구소 100%, 시스템LSI 75%, …" (지급률 내림차순 그룹) */
export function taiRateSummary(period: TaiPeriod = TAI_LATEST): string {
  const byRate = new Map<number, string[]>();
  for (const r of period.rates) {
    const list = byRate.get(r.rate) ?? [];
    list.push(r.division);
    byRate.set(r.rate, list);
  }
  return [...byRate.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([rate, names]) => `${names.join("·")} ${rate}%`)
    .join(", ");
}
