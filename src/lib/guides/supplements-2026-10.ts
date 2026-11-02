// src/lib/guides/supplements-2026-10.ts
//
// 가이드 보강 섹션 2026-10 사실 정정 배치(guidesb) — supplements.ts 와 같은 규칙을 따른다.
// - guides/layout.tsx 의 PageFooterAds(레이아웃 마지막 광고) 아래에서만 렌더된다(GuideSupplement). 본문 정본은 건드리지 않는다.
// - "자주 묻는 질문" H2 는 src/lib/guideFaq.ts 추출 패턴(<h2>…자주 묻는 질문…</h2><ul><li><strong>Q. …</strong> — 답변</li></ul>)을
//   지켜 page.tsx 가 FAQPage 로 내보낸다(가시 내용과 1:1, 유효 항목 2개 이상일 때만).
// - 수치는 정본 상수(config/unemploymentBenefit·minimumWage)에서 끼워 넣거나, 커밋 메시지에 공식 출처를 적은 값만 쓴다.
// - GuideSupplement 는 맵 전체를 클라이언트 prop 으로 넘기므로 항목이 늘면 모든 /guides/* RSC payload 가 커진다 — 짧게 쓸 것.
// supplements.ts 파일 끝에서 guideSupplements 에 합친다(guidesa 배치가 같은 파일의 맵·import 줄을 고치므로 줄 충돌을 피하려고 별도 모듈).

import { UNEMPLOYMENT_BENEFIT_2026, unemploymentDailyLowerBound } from "@/config/unemploymentBenefit";
import { MINIMUM_WAGE_2026, MINIMUM_WAGE_2027 } from "@/config/minimumWage";

/** 원 단위 천 단위 구분 — en-US 그룹핑은 ko-KR 과 같고 ICU 유무에 좌우되지 않는다 */
const won = (n: number): string => n.toLocaleString("en-US");

// ── unemployment-insurance-2026 (GB-06) ──
const UB_UPPER = won(UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER);
const UB_LOWER = won(unemploymentDailyLowerBound());
const UB_UPPER_30 = Math.floor((UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER * 30) / 10000);
const UB_LOWER_30 = Math.floor((unemploymentDailyLowerBound() * 30) / 10000);

const unemploymentInsurance2026Supplement = `
<h2>2026년 기준 확인 사항 — 구직급여 상·하한과 신청 창구</h2>
<p>본문의 금액과 절차를 공식 자료로 다시 확인했습니다(2026년 9월 29일). 하루 구직급여는 퇴직 전 평균임금의 60%이며 아래 상한과 하한 사이에서 정해집니다.</p>
<table class="w-full text-sm">
<thead><tr><th>구분</th><th>2026년 이직자</th><th>30일 환산</th></tr></thead>
<tbody>
<tr><td>1일 상한액</td><td>${UB_UPPER}원 (2025년 이직자 66,000원)</td><td>약 ${UB_UPPER_30}만원</td></tr>
<tr><td>1일 하한액</td><td>${UB_LOWER}원 (최저시급 × 80% × 8시간)</td><td>약 ${UB_LOWER_30}만원</td></tr>
</tbody>
</table>
<ul>
<li><strong>재취업활동</strong> — 실업인정일마다 정해진 횟수 이상의 재취업활동을 증명해야 합니다. 내 차수의 요건은 고용24 실업인정 화면에서 확인하세요.</li>
<li><strong>신청 창구</strong> — 워크넷과 고용보험 누리집은 2024년 9월 고용24(work24.go.kr)로 통합됐습니다. 구직 등록, 수급자격 신청, 실업인정 모두 고용24에서 합니다.</li>
<li><strong>국민연금 실업크레딧</strong> — 구직급여 수급자가 신청하면 연금보험료의 75%를 지원받아 가입기간을 이어 갈 수 있습니다(인정소득은 실직 전 3개월 평균소득의 50%, 최대 70만원, 생애 최대 12개월). 수급자격 신청이나 실업인정 때 고용센터·국민연금공단 지사에 신청합니다.</li>
</ul>
<h2>실업급여 금액 관련 자주 묻는 질문</h2>
<ul>
<li><strong>Q. 2026년 실업급여는 하루 최대 얼마인가요?</strong> — 2026년에 이직했다면 하루 ${UB_UPPER}원이 상한이고, 30일이면 약 ${UB_UPPER_30}만원입니다.</li>
<li><strong>Q. 월급이 적어도 받는 최소 금액이 있나요?</strong> — 네. 이직 당시 최저시급의 80%에 1일 소정근로시간(최대 8시간)을 곱한 하한보다 적지 않습니다. 8시간 근무자는 2026년 하루 ${UB_LOWER}원입니다.</li>
</ul>
<p>내 평균임금과 가입기간으로 받을 금액은 <a href="/unemployment-benefit">실업급여 계산기</a>에서 바로 계산할 수 있습니다.</p>
<p><em>출처: 고용노동부 보도자료 2025-12-16(구직급여 상한액 ${UB_UPPER}원) · 고용보험법 제45조·제46조 · 한국고용정보원 고용24 안내 · 정책브리핑 2024-07-08(국민연금 실업크레딧).</em></p>
`;

// ── minimum-wage-impact-2026 (GB-08) ──
const MW_HOURLY = won(MINIMUM_WAGE_2026.hourly);
const MW_MONTHLY = won(MINIMUM_WAGE_2026.monthly);
const MW_YEARLY = won(MINIMUM_WAGE_2026.yearly);
const MW27_H = won(MINIMUM_WAGE_2027.hourly);
const MW27_M = won(MINIMUM_WAGE_2027.monthly);
const MW27_Y = won(MINIMUM_WAGE_2027.yearly);
const MW_DIFF = won(MINIMUM_WAGE_2027.hourly - MINIMUM_WAGE_2026.hourly);
const MW_PCT = ((MINIMUM_WAGE_2027.hourly / MINIMUM_WAGE_2026.hourly - 1) * 100).toFixed(1);

const minimumWageImpactSupplement = `
<h2>2027년 최저임금 확정 — 내년 1월부터 바뀌는 기준선</h2>
<p>2027년 최저임금은 시급 ${MW27_H}원으로 확정됐습니다(최저임금위원회 2026년 7월 14일 의결, 고용노동부 2026년 8월 5일 고시). 2026년 ${MW_HOURLY}원보다 ${MW_DIFF}원(${MW_PCT}%) 오르며 2027년 1월 1일부터 적용됩니다.</p>
<table class="w-full text-sm">
<thead><tr><th>구분</th><th>2026년</th><th>2027년</th></tr></thead>
<tbody>
<tr><td>시급</td><td>${MW_HOURLY}원</td><td>${MW27_H}원</td></tr>
<tr><td>월 환산(주휴 포함 209시간)</td><td>${MW_MONTHLY}원</td><td>${MW27_M}원</td></tr>
<tr><td>연 환산</td><td>${MW_YEARLY}원</td><td>${MW27_Y}원</td></tr>
</tbody>
</table>
<p>본문의 자가진단(월급 ÷ 209)은 2027년 1월 급여부터 ${MW27_H}원과 비교하면 됩니다. 2027년 환산표와 결정 경과는 <a href="/minimum-wage-2027">2027 최저임금 페이지</a>, 주휴수당 요건은 <a href="/weekly-holiday-allowance-2026">주휴수당 계산기</a>에서 확인하세요.</p>
<p><em>출처: 고용노동부 2027년 적용 최저임금 고시(2026-08-05) · 최저임금위원회. 수치는 사이트 정본 상수(config/minimumWage.ts)에서 가져옵니다.</em></p>
`;

/** 슬러그 → 보강 HTML (2026-10 guidesb 배치). supplements.ts 가 guideSupplements 에 합친다. */
export const guideSupplements202610: Record<string, string> = {
  "minimum-wage-impact-2026": minimumWageImpactSupplement,
  "unemployment-insurance-2026": unemploymentInsurance2026Supplement,
};
