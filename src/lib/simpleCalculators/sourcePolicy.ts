// src/lib/simpleCalculators/sourcePolicy.ts
// 간이 계산기 출처(sources) 정책 — S3-1 본문 보강(docs/calc-content-writing-guide-2026-09-12.md)의 게이트 기준.
// 의존성 없음: 서버 모듈·스크립트·테스트 어디서나 import 할 수 있다. 게이트: src/lib/__tests__/calcSources.test.ts
//
// 매칭은 "호스트 접미사"다: nts.go.kr 은 www.nts.go.kr·taxlaw.nts.go.kr·b.nts.go.kr 을 모두 허용한다.
// go.kr / or.kr 같은 공용 2단계 도메인은 절대 넣지 않는다 — or.kr 에는 사단법인·민간 단체가 섞여 있고,
// 이 목록의 의미는 '국세청·법제처·국민연금공단·고용노동부·금감원급 기관의 원문' 이다(계획서 S3-1).
// 목록 근거(2026-09-12): 계획서 지목 호스트 + 저장소 가이드가 이미 인용 중인 공식 호스트, 전 항목 DNS·HTTP 실측.
//  - 제외: fine.fss.or.kr(fss.or.kr 하위라 중복) · minwon.go.kr(구 민원24, 응답 없음 — gov.kr 로 대체)
//  - 2025~26 정부조직 개편으로 kostat.go.kr → mods.go.kr, moef.go.kr → mofe.go.kr 리다이렉트 — 양쪽 다 허용.
//  - 추가는 별도 커밋으로(콘텐츠 커밋에 섞지 말 것). 후보를 발견하면 보고서에 올린다.

export const OFFICIAL_SOURCE_HOSTS = [
  // 세금·법령
  "nts.go.kr", // 국세청 (taxlaw·b·s·i·call 하위 포함)
  "hometax.go.kr", // 홈택스
  "law.go.kr", // 국가법령정보센터(법제처)
  "easylaw.go.kr", // 찾기쉬운 생활법령정보(법제처)
  "moef.go.kr", // 기획재정부(구) — mofe.go.kr 로 리다이렉트
  "mofe.go.kr", // 재정경제부
  // 고용·임금
  "moel.go.kr", // 고용노동부 (labor·1350 하위 포함)
  "minimumwage.go.kr", // 최저임금위원회
  "wagework.go.kr", // 임금근로시간정보시스템(고용노동부)
  "work24.go.kr", // 고용24
  "ei.go.kr", // 고용보험
  "comwel.or.kr", // 근로복지공단 (welfare 하위 포함)
  "mpm.go.kr", // 인사혁신처(공무원 봉급표)
  "alio.go.kr", // 공공기관 경영정보 공개시스템
  // 4대보험·복지
  "nps.or.kr", // 국민연금공단
  "nhis.or.kr", // 국민건강보험공단
  "mohw.go.kr", // 보건복지부 (basicpension 하위 포함)
  // 금융
  "fss.or.kr", // 금융감독원 (fine 파인·dart 하위 포함)
  "fsc.go.kr", // 금융위원회
  "bok.or.kr", // 한국은행 (ecos 하위 포함)
  "kfb.or.kr", // 전국은행연합회 — COFIX·대출금리 법정 비교공시
  "hf.go.kr", // 한국주택금융공사
  // 부동산
  "molit.go.kr", // 국토교통부 (rt 실거래가 하위 포함)
  "iros.go.kr", // 인터넷등기소(대법원)
  // 통계·정부 포털
  "kostat.go.kr", // 통계청(구) — mods.go.kr 로 리다이렉트
  "mods.go.kr", // 국가데이터처
  "kosis.kr", // 국가통계포털
  "nabo.go.kr", // 국회예산정책처
  "gov.kr", // 정부24
  "korea.kr", // 대한민국 정책브리핑
] as const;

export type OfficialSourceHost = (typeof OFFICIAL_SOURCE_HOSTS)[number];

/** URL 의 호스트(소문자). 파싱할 수 없으면 null. */
export function sourceHostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** 호스트가 허용 목록 항목과 같거나 그 하위 도메인이면 true. 대소문자·끝 점 무시. */
export function isOfficialSourceHost(host: string): boolean {
  const normalized = host.trim().toLowerCase().replace(/\.$/, "");
  if (!normalized) return false;
  return OFFICIAL_SOURCE_HOSTS.some((allowed) => normalized === allowed || normalized.endsWith(`.${allowed}`));
}

/** https 이고 호스트가 허용 목록이면 true — enrichment 파일에 넣는 sources 의 게이트. */
export function isOfficialSourceUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === "https:" && isOfficialSourceHost(parsed.hostname);
}

/**
 * 출처가 가리키는 규정의 연도. 제목의 4자리 연도(1990~2099, 여러 개면 가장 최근)를 우선하고,
 * 없으면 URL 에서 찾는다(경로·쿼리의 4자리 숫자는 오탐 가능 — 제목에 연도를 쓰는 것이 규칙). 둘 다 없으면 null.
 * '9,860원'·'20260101' 처럼 4자리가 아닌 숫자 덩어리는 연도로 보지 않는다(금액 예시는 정본 상수와 무관한 값).
 */
export function sourceYear(source: { title: string; url?: string }): number | null {
  return yearIn(source.title) ?? (source.url ? yearIn(safeDecode(source.url)) : null);
}

function yearIn(text: string): number | null {
  const years = (text.match(/\d+/g) ?? [])
    .filter((digits) => digits.length === 4)
    .map(Number)
    .filter((n) => n >= 1990 && n <= 2099);
  return years.length ? Math.max(...years) : null;
}

function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}
