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
<p>본문의 금액과 절차를 공식 자료로 다시 확인했습니다(2026년 9월 29일). 본문 리드와 금액 문단의 일급 한도 6만·최저 약 90만은 옛 기준이고, 2026년 이직자는 아래 표가 기준입니다. 하루 구직급여는 퇴직 전 평균임금의 60%이며 아래 상한과 하한 사이에서 정해집니다.</p>
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
<li><strong>국민연금 실업크레딧</strong> — 구직급여 수급자가(재산·소득 요건 충족 시) 신청하면 연금보험료의 75%를 지원받아 가입기간을 이어 갈 수 있습니다(인정소득은 실직 전 3개월 평균소득의 50%, 최대 70만원, 생애 최대 12개월). 수급자격 신청이나 실업인정 때 고용센터·국민연금공단 지사에 신청합니다.</li>
<li><strong>일한 날 신고</strong> — 수급 기간에 아르바이트 등으로 일했다면 금액과 관계없이 실업인정 때 신고해야 합니다. 신고하지 않으면 부정수급으로 받은 돈을 반환하고 추가징수될 수 있습니다.</li>
<li><strong>내일배움카드</strong> — 훈련비 지원 비율은 과정과 대상에 따라 달라 자부담이 생길 수 있습니다. 수강 전에 고용24에서 과정별 지원액을 확인하세요.</li>
</ul>
<h2>실업급여 금액 관련 자주 묻는 질문</h2>
<ul>
<li><strong>Q. 2026년 실업급여는 하루 최대 얼마인가요?</strong> — 2026년에 이직했다면 하루 ${UB_UPPER}원이 상한이고, 30일이면 약 ${UB_UPPER_30}만원입니다.</li>
<li><strong>Q. 월급이 적어도 받는 최소 금액이 있나요?</strong> — 네. 이직 당시 최저시급의 80%에 1일 소정근로시간(최대 8시간)을 곱한 하한보다 적지 않습니다. 8시간 근무자는 2026년 하루 ${UB_LOWER}원입니다.</li>
</ul>
<p>내 평균임금과 가입기간으로 받을 금액은 <a href="/unemployment-benefit">실업급여 계산기</a>에서 바로 계산할 수 있습니다.</p>
<p><em>출처: 고용노동부 보도자료 2025-12-16(구직급여 상한액 ${UB_UPPER}원) · 고용보험법 제45조·제46조 · 한국고용정보원 고용24 안내 · 정책브리핑 2024-07-08(국민연금 실업크레딧) · 정부24 실업크레딧 지원 안내(국민연금공단 접수) · 고용보험법 제47조(취업 신고)·제62조(반환명령·추가징수) · 고용24 국민내일배움카드 안내.</em></p>
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
<li><strong>2년 실거주 의무</strong> — 허가를 받아 산 주택은 매수자가 2년 동안 직접 살아야 하므로, 세입자 보증금을 끼고 사는 갭투자는 할 수 없습니다. 예외로 세입자가 있는 집을 2026년 5월 12일부터 계속 무주택인 사람이 사면 기존 임대차가 끝날 때까지 입주를 미룰 수 있지만(한시 조치), 입주한 뒤 2년 실거주 의무는 그대로입니다.</li>
<li><strong>확인할 곳</strong> — 지정 기간, 대상 주택 유형, 해제·재지정 여부는 매수 전에 국토교통부·해당 지자체 공고와 토지이음(eum.go.kr)에서 확인하세요.</li>
</ul>
<p>대출 여력은 <a href="/calc/ltv-quick">LTV 계산기</a>와 <a href="/home-loan">주택담보대출 계산기</a>로 먼저 확인해 보세요.</p>
<p><em>출처: 국토교통부 「주택시장 안정화 대책」(2025-10-15 보도자료) · 정책브리핑 2025-10-15 「주택시장 안정화 대책」 보도자료(토지거래허가 효력 10월 20일 계약분부터·실거주 의무) · 정책브리핑 2026-05-12·2026-09-17(토지거래허가구역 실거주 유예).</em></p>
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
<p>고용보험 회사 부담 1.15~1.75%는 실업급여 0.9%에 고용안정·직업능력개발 0.25~0.85%(기업 규모별)를 더한 값입니다.</p>
<p>내 연봉의 4대보험료와 실수령액은 <a href="/">연봉 계산기</a>에서, 요율 전체는 <a href="/social-insurance-rates-2026">2026 4대보험 요율표</a>에서 확인하세요.</p>
<p><em>출처: 국세청 「비과세 근로소득」 안내 · 소득세법 시행령 제12조·제17조 · 정책브리핑(식대 20만원, 2023-01-01 시행) · 재정경제부 2026년 달라지는 제도(보육수당 자녀별 한도) · 고용보험료징수법 시행령 제12조(사업주 고용안정·직업능력개발 보험료율).</em></p>
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

// ── 2026-09-29 광고 위치 스윕(1,123폭) 수정분 — 광고 위에서 같은 폭을 못 만든 정정(moved-below) ──
// 본문 해당 줄은 프로덕션 문구로 되돌렸고(숫자 글리프 폭 차이로 광고가 움직였다), 정정 내용을 여기 마지막 광고 아래에 둔다.
// FAQ 헤더는 넣지 않는다(본문 FAQPage 항목 수 불변). 수치 출처는 각 원 정정 커밋 메시지의 공식 출처와 같다.

// ── career-break-financial-plan (GB-23·MISSED-gb-2) ──
const careerBreakFinancialPlanSupplement = `
<h2>휴직과 퇴사의 4대보험 차이</h2>
<ul>
<li><strong>건강보험</strong> — 휴직 중에는 직장가입자 자격이 유지되고 회사를 통해 보험료 납입고지 유예를 신청할 수 있습니다. 퇴사하면 지역가입자가 되어 소득·재산으로 보험료를 매깁니다. 지역 보험료의 자동차 부과는 2024년 2월분부터 폐지됐고, 예금 원금은 재산에 들어가지 않습니다.</li>
<li><strong>고용보험</strong> — 휴직 중에도 자격이 유지되며, 실업급여는 퇴사한 뒤에만 신청할 수 있습니다.</li>
</ul>
<p><em>출처: 보건복지부·정책브리핑(2024년 2월분부터 자동차 보험료 폐지·재산 기본공제 1억원) · 국민건강보험법 시행규칙 별지 제30호서식(휴직자등 직장가입자 보험료 납입고지 유예신청서).</em></p>
`;

// ── comprehensive-income-tax-2026 (GB-03) ──
const comprehensiveIncomeTax2026Supplement = `
<h2>분납 기한과 납부지연 가산세 확인</h2>
<ul>
<li><strong>분납 기한</strong> — 납부할 세액이 1,000만원을 넘으면 납부기한이 지난 뒤 2개월 안에 나눠 낼 수 있습니다. 5월 31일 기한이면 7월 31일까지이고, 본문의 8월 31일은 6월 30일까지 신고하는 성실신고확인 대상자의 기한입니다.</li>
<li><strong>납부지연 가산세</strong> — 미납 세액에 하루 0.022%(연 약 8.0%)가 붙습니다. 본문의 연 9.125%는 하루 0.025%이던 개정 전 기준입니다.</li>
</ul>
<p><em>출처: 소득세법 제70조의2·제77조 · 국세기본법 시행령 제27조의4(1일 10만분의 22).</em></p>
`;

// ── crypto-tax-2026 (GB-04) — 본문은 같은 폭 문구로 고쳤고 날짜·취득가 기준만 여기 ──
const cryptoTax2026Supplement = `
<h2>가상자산 과세 시작일과 시행 전 보유분 취득가액</h2>
<ul>
<li><strong>시작일</strong> — 현행 소득세법상 2027년 1월 1일 이후 양도·대여하는 가상자산부터 과세합니다. 2026년 정부 세제개편안에도 추가 유예는 없습니다.</li>
<li><strong>시행 전 보유분</strong> — 2026년 12월 31일 시가와 실제 취득가액 중 큰 금액을 취득가액으로 봅니다. 그래서 세금만 보고 시행 전에 미리 팔 이유는 크지 않습니다.</li>
</ul>
<p><em>출처: 국세청 「거주자의 가상자산소득 과세 개요」 · 재정경제부 「2026년 세제개편안」 요약.</em></p>
`;

// ── isa-account-guide (GB-12) ──
const isaAccountGuideSupplement = `
<h2>2026년 세제개편안의 ISA 내용 정정</h2>
<p>본문 주의사항에 적힌 납입 한도 연 4,000만원·총 2억원, 비과세 한도 500만원(서민형 1,000만원)은 2024년 세법개정안의 수치로, 국회를 통과하지 못했습니다. 2026년 8월 발표된 정부 세제개편안(재정경제부)은 일반 ISA 납입 한도(연 2,000만원·총 1억원)를 그대로 두고, 국내 상장주식·주식형 펀드 등 국내 투자분의 이자·배당을 비과세하는 생산적금융 ISA를 새로 만드는 내용입니다. 이 역시 국회 통과 전의 정부안입니다.</p>
<p><em>출처: 재정경제부 「한눈에 보는 정책: 2026년 세제개편안」 · 2026-08-03 보도.</em></p>
`;

// ── n-job-tax-2026 (GB-03·MISSED-gb-4·MISSED-gb-6a) ──
const nJobTax2026Supplement = `
<h2>노란우산공제 한도와 간이과세 기준 확인</h2>
<ul>
<li><strong>노란우산공제</strong> — 2025년 납입분부터 사업소득금액 4,000만원 이하는 연 600만원까지 소득공제됩니다. 본문의 연 500만원은 개정 전 한도입니다.</li>
<li><strong>간이과세 기준</strong> — 직전 연도 공급대가(매출)가 1억 400만원 미만이면 간이과세를 적용받을 수 있습니다(일부 업종 제외).</li>
<li><strong>부가세 일정</strong> — 개인 일반과세자는 1월·7월에 확정신고하고, 4월·10월에는 세무서가 고지한 예정고지 세액을 냅니다.</li>
</ul>
<p><em>출처: 정책브리핑(노란우산 소득공제 확대, 2025-01-01 납입분부터) · 국세청 1인 미디어 창작자 세무 안내(간이과세 기준) · 부가가치세법 제48조.</em></p>
`;

// ── p2p-investment-risk (GB-21) ──
const p2pInvestmentRiskSupplement = `
<h2>온투업 P2P 이자 세금 — 15.4% 원천징수</h2>
<p>온라인투자연계금융업자(온투업 등록 플랫폼)를 통해 받는 이자는 소득세 14%와 지방소득세 1.4%를 더해 15.4%가 원천징수됩니다. 본문 위험 4의 실 세율 27.5%는 이 글이 권하는 온투업 플랫폼 투자에는 맞지 않습니다. 이자·배당 등 금융소득이 연 2,000만원을 넘으면 넘는 부분은 종합과세됩니다.</p>
<p>15.4%로 본문 표를 다시 계산하면 광고 수익률 10%에서 수수료 1~2%, 세금 약 1.5%, 부도 손실 5~10%를 뺀 실 수익률은 약 -3.5%~+2.5%입니다.</p>
<p><em>출처: 소득세법 제129조 제1항 제1호 나목 단서(온라인투자연계금융업자를 통해 받는 이자소득 100분의 14).</em></p>
`;

// ── retirement-planning-30s (GB-24) ──
const retirementPlanning30sSupplement = `
<h2>숫자 다시 확인 — 10억 목표의 월 적립액</h2>
<ul>
<li><strong>월 50만원이면 얼마</strong> — 연 7%(월복리)로 30년(360개월) 쌓으면 월 50만원은 약 6.1억원, 월 80만원은 약 9.8억원입니다. 60세에 10억원을 모으려면 월 약 82만원이 필요합니다.</li>
</ul>
<p><em>출처: 산술 계산(월복리 7%/12, 360개월 적립 미래가치).</em></p>
`;

// ── 반도체 성과급 뉴스 4편 (GB-09) — 2026-01-02 이후 코스피 증권거래세 0.05% + 농특세 0.15% ──
const securitiesTax2026Supplement = (where: string): string => `
<h2>2026년 증권거래세 확인</h2>
<p>2026년 1월 2일부터 코스피 상장주식을 팔 때 증권거래세 0.05%와 농어촌특별세 0.15%를 더해 0.20%가 붙습니다. ${where}의 0.15%는 2025년 세율이므로, 앞으로 주식을 팔 때는 0.20%로 계산하세요.</p>
<p><em>출처: 증권거래세법 시행령 제5조(유가증권시장 1만분의 5, 2026-01-02 시행) · 농어촌특별세법 제5조.</em></p>
`;

// ── sk-hynix-stock-2026 (MISSED-gb-7) ──
const skHynixStock2026Supplement = `
<h2>HBM4 양산 체제 — 2025년 9월 구축</h2>
<p>SK하이닉스는 2025년 9월 세계 최초로 HBM4 개발을 마치고 양산 체제를 구축했다고 발표했습니다. 본문 구조적 강점 1의 2026년 하반기 양산 목표 문장은 이 발표 전의 전망입니다.</p>
<p><em>출처: SK하이닉스 뉴스룸 「세계 최초 HBM4 개발 완료하고 양산 체제 구축」(2025-09).</em></p>
`;

// ── tax-refund-mistakes-2026 (GB-26) ──
const taxRefundMistakes2026Supplement = `
<h2>환급액은 결정세액을 넘지 않습니다</h2>
<p>공제를 더 챙겨 늘어나는 환급액은 그해 원래 내야 할 세금(결정세액)보다 클 수 없습니다. 본문 결론의 50만·100만원은 예시일 뿐 평균 통계가 아니며, 실제 환급액은 소득과 공제 항목에 따라 사람마다 다릅니다.</p>
<p><em>출처: 소득세법 제137조(근로소득세액의 연말정산).</em></p>
`;

// 2026-10-05 재기반: individual-vs-corporate-tax(GB-01)·personal-loan-vs-debt-consolidation(GB-22)·us-treasury-bond(GB-13)·
// samsung-special-bonus-q3-preview-2027(GB-09) 보강은 10/4 배포(352451886)가 본문에서 같은 사실을 먼저 고쳐 뺐다
// (보강이 가리키던 본문 문장이 사라짐). retirement-planning-30s 는 국민연금 평균액 줄만 같은 이유로 뺐다.
/** 슬러그 → 보강 HTML (2026-10 guidesb 배치, 알파벳 순). supplements.ts 가 guideSupplements 에 합친다. */
export const guideSupplements202610: Record<string, string> = {
  "career-break-financial-plan": careerBreakFinancialPlanSupplement,
  "comprehensive-income-tax-2026": comprehensiveIncomeTax2026Supplement,
  "crypto-tax-2026": cryptoTax2026Supplement,
  "financial-income-tax": financialIncomeTaxSupplement,
  "gap-investment-risk": gapInvestmentRiskSupplement,
  "isa-account-guide": isaAccountGuideSupplement,
  "minimum-wage-impact-2026": minimumWageImpactSupplement,
  "n-job-tax-2026": nJobTax2026Supplement,
  "p2p-investment-risk": p2pInvestmentRiskSupplement,
  "retirement-planning-30s": retirementPlanning30sSupplement,
  "samsung-bonus-treasury-stock-15-trillion-2026": securitiesTax2026Supplement("본문 매도 시 세금 항목과 세금 FAQ"),
  "samsung-vs-sk-hynix-stock-bonus-2026": securitiesTax2026Supplement("본문 매도 이후 항목"),
  "sk-hynix-ps-cash-vs-stock-scenarios-2026": securitiesTax2026Supplement("본문 지급 이후 주가 차익 항목·정리 문단·세금 FAQ"),
  "sk-hynix-stock-2026": skHynixStock2026Supplement,
  "social-insurance-reduction": socialInsuranceReductionSupplement,
  "tax-refund-mistakes-2026": taxRefundMistakes2026Supplement,
  "unemployment-insurance-2026": unemploymentInsurance2026Supplement,
  "year-end-tax-2026": yearEndTax2026Supplement,
};
