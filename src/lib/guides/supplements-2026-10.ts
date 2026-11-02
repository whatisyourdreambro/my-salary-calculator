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

// ── financial-income-tax (GB-15) — 세율 구간·적용 기한·ETF 제외 여부는 조문 원문 확인 전이라 싣지 않는다(판정 기본안) ──
const financialIncomeTaxSupplement = `
<h2>2026년부터 달라진 배당 과세 — 고배당기업 배당 분리과세</h2>
<p>2026년 1월 1일 시행된 조세특례제한법 제104조의27(고배당기업 주식 배당소득 과세특례)로, 요건을 갖춘 고배당 상장사에서 받은 배당은 금융소득 종합과세에 합산하지 않고 분리과세하는 특례를 받을 수 있습니다. 예금 이자, 일반 배당, 해외 배당은 지금도 본문의 연 2,000만원 기준 종합과세 규칙을 따릅니다.</p>
<h2>배당 분리과세 자주 묻는 질문</h2>
<ul>
<li><strong>Q. 배당이 2,000만원을 넘으면 무조건 종합과세인가요?</strong> — 원칙은 종합과세지만, 2026년부터 요건을 갖춘 고배당기업 배당은 분리과세 특례를 받을 수 있습니다.</li>
<li><strong>Q. 내가 받은 배당이 특례 대상인지 어떻게 확인하나요?</strong> — 대상 기업은 정기주주총회에서 배당을 결의한 다음 날까지 특례요건 충족 사실을 담은 기업가치 제고계획을 한국거래소에 공시해야 합니다(금융위원회 2026-02-24). 해당 회사의 공시를 확인하세요.</li>
</ul>
<p>세후 배당은 <a href="/calc/dividend-tax-quick">배당 세금 계산기</a>로, 개편 배경은 <a href="/tax-reform-2026">2026 세법개정안 정리</a>에서 확인하세요.</p>
<p><em>출처: 조세특례제한법 제104조의27 · 금융위원회 2026-02-24 보도자료(배당소득 과세특례 대상기업의 기업가치 제고계획 공시 안내).</em></p>
`;

// ── gap-investment-risk (GB-17) — 지정 종료일·조기 해제 여부는 확인하지 못해 적지 않는다 ──
const gapInvestmentRiskSupplement = `
<h2>2026년 기준 확인 사항 — 토지거래허가구역과 2년 실거주 의무</h2>
<p>본문 표의 대출 규제 외에 갭투자를 가장 직접 막는 장치는 토지거래허가구역입니다. 2025년 10월 15일 주택시장 안정화 대책으로 서울 전역과 경기 12곳(과천, 광명, 성남 분당·수정·중원, 수원 영통·장안·팔달, 안양 동안, 용인 수지, 의왕, 하남)이 규제지역과 함께 토지거래허가구역으로 지정됐습니다.</p>
<ul>
<li><strong>허가 대상</strong> — 지정 기간 중 계약하는 아파트(아파트가 포함된 연립·다세대 포함) 거래는 관할 관청의 허가를 받아야 합니다(2025년 10월 20일 계약분부터).</li>
<li><strong>2년 실거주 의무</strong> — 허가를 받아 산 주택은 매수자가 2년 동안 직접 살아야 하므로, 세입자 보증금을 끼고 사는 갭투자는 할 수 없습니다.</li>
<li><strong>확인할 곳</strong> — 지정 기간, 대상 주택 유형, 해제·재지정 여부는 매수 전에 국토교통부·해당 지자체 공고와 토지이음(eum.go.kr)에서 확인하세요.</li>
</ul>
<p>대출 여력은 <a href="/calc/ltv-quick">LTV 계산기</a>와 <a href="/home-loan">주택담보대출 계산기</a>로 먼저 확인해 보세요.</p>
<p><em>출처: 국토교통부 「주택시장 안정화 대책」(2025-10-15 보도자료) · 경향신문 2025-10-15 대책 Q&amp;A(2년 실거주 의무, 10월 20일 계약분부터).</em></p>
`;

// ── social-insurance-reduction (GB-33) — 본문 비과세 항목의 법정 한도·요건 (본문 정정은 GB-02) ──
const socialInsuranceReductionSupplement = `
<h2>2026년 비과세 근로소득 한도 한눈에</h2>
<p>본문 항목 가운데 한도와 요건이 법령에 정해진 것만 모았습니다. 비과세 급여는 소득세뿐 아니라 국민연금·건강보험·고용보험 보험료를 매기는 보수에서도 빠집니다.</p>
<table class="w-full text-sm">
<thead><tr><th>항목</th><th>비과세 한도</th><th>요건</th></tr></thead>
<tbody>
<tr><td>식사대</td><td>월 20만원</td><td>회사가 식사를 따로 제공하지 않을 때(2023년 1월부터 20만원)</td></tr>
<tr><td>자가운전보조금</td><td>월 20만원</td><td>본인 명의(임차 포함) 차량을 직접 운전해 업무에 쓰고, 출장여비 대신 회사 기준에 따라 받는 금액</td></tr>
<tr><td>연구보조비</td><td>월 20만원</td><td>교원, 정부출연연구기관 연구원, 중소·벤처기업 연구소 연구원 등</td></tr>
<tr><td>생산직 연장·야간·휴일근로수당</td><td>연 240만원</td><td>월정액급여 260만원 이하이고 직전 연도 총급여 3,700만원 이하인 생산직</td></tr>
<tr><td>출산·보육수당</td><td>자녀 1명당 월 20만원</td><td>6세 이하 자녀(2026년부터 자녀별 한도)</td></tr>
<tr><td>출산지원금</td><td>전액</td><td>자녀 출생일 이후 2년 이내에 회사에서 받는 최대 2회분</td></tr>
</tbody>
</table>
<p>내 연봉의 4대보험료와 실수령액은 <a href="/">연봉 계산기</a>에서, 요율 전체는 <a href="/social-insurance-rates-2026">2026 4대보험 요율표</a>에서 확인하세요.</p>
<p><em>출처: 국세청 「비과세 근로소득」 안내 · 소득세법 시행령 제12조·제17조 · 정책브리핑(식대 20만원, 2023-01-01 시행) · 재정경제부 2026년 달라지는 제도(보육수당 자녀별 한도).</em></p>
`;

// ── year-end-tax-2026 (GB-32) — 연말정산 기둥 글의 가시 FAQ(FAQPage)와 2027 허브 링크. 수치는 본문·현행 법령과 같다 ──
const yearEndTax2026Supplement = `
<h2>2026년 귀속 연말정산 자주 묻는 질문</h2>
<ul>
<li><strong>Q. 2026년 귀속 연말정산은 언제 하나요?</strong> — 2026년 1~12월 소득을 2027년 1~2월에 회사에서 정산하고, 환급이나 추가 납부는 보통 2~3월 급여에 반영됩니다. 간소화 자료는 매년 1월 중순부터 조회할 수 있습니다.</li>
<li><strong>Q. 연금저축·IRP는 얼마까지 넣어야 공제를 다 받나요?</strong> — 연금저축 600만원, IRP를 합쳐 900만원까지가 세액공제 대상입니다. 총급여 5,500만원 이하는 15%(지방소득세 포함 16.5%), 초과는 12%(13.2%)이며 12월 31일까지 입금한 금액만 인정됩니다.</li>
<li><strong>Q. 월세 세액공제는 누가 얼마나 받나요?</strong> — 총급여 8,000만원 이하 무주택 세대주(요건을 갖춘 세대원 포함)가 월세 연 1,000만원 한도로 15%, 총급여 5,500만원 이하는 17%를 공제받습니다.</li>
<li><strong>Q. 작년에 놓친 공제도 돌려받을 수 있나요?</strong> — 법정 신고기한으로부터 5년 안이면 홈택스 경정청구로 신청할 수 있고 가산세는 없습니다.</li>
</ul>
<p>공제 항목별 조건은 <a href="/guides/year-end-tax-13-tips-2026">연말정산 공제 조건 13가지</a>, 올해 일정과 준비물은 <a href="/year-end-tax-2027">2027 연말정산(2026년 귀속) 총정리</a>에서 이어서 확인하세요.</p>
<p><em>출처: 소득세법 제59조의3(연금계좌) · 조세특례제한법 제95조의2(월세) · 국세기본법 제45조의2(경정청구).</em></p>
`;

/** 슬러그 → 보강 HTML (2026-10 guidesb 배치, 알파벳 순). supplements.ts 가 guideSupplements 에 합친다. */
export const guideSupplements202610: Record<string, string> = {
  "financial-income-tax": financialIncomeTaxSupplement,
  "gap-investment-risk": gapInvestmentRiskSupplement,
  "minimum-wage-impact-2026": minimumWageImpactSupplement,
  "social-insurance-reduction": socialInsuranceReductionSupplement,
  "unemployment-insurance-2026": unemploymentInsurance2026Supplement,
  "year-end-tax-2026": yearEndTax2026Supplement,
};
