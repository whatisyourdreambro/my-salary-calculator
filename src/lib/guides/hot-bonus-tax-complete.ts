// src/lib/guides/hot-bonus-tax-complete.ts
//
// 13차 점검 — 성과급 + 세금 + 건강보험 전문 SEO 가이드 50편.
// 운영자 명시 요청: 성과급에 따른 모든 세법·건강보험·구간별 계산법 깊이.
// 5개 영역 각 10편 = 50편. 누적 181편.
//
// 2026-09-30 키퍼 재작성(W3-A 2차 G2A) — 본문 숫자는 bonusNetFigures2026.ts(2026 요율로 고정한 성과급 엔진 출력)에서
// 끼워 넣는다(리터럴 금지): bonus-1eok-net-payment-2026 · bonus-5000-net-payment-2026 · income-tax-8-step-bracket-2026 ·
// bonus-health-4-percent-2026 · four-insurance-ceiling-summary-2026.

import type { Guide } from "@/lib/guidesData";
import { UNEMPLOYMENT_BENEFIT_2026 } from "@/config/unemploymentBenefit";
import { INSURANCE_RATES_2026, PENSION_BASE_2026 } from "@/lib/taxConstants2026";
import {
  BRACKET_ROWS,
  bracketRateOf,
  EOK_BY_SALARY,
  EOK_MAIN,
  EOK_SALARY_ONLY,
  EOK_WITH_BONUS,
  FIVE_BY_BONUS,
  FIVE_BY_SALARY,
  FIVE_MAIN,
  FIVE_SALARY_ONLY,
  FIVE_WITH_BONUS,
  FLOW_7000,
  GROSS_AT_BRACKET,
  HEALTH_BY_BONUS,
  HEALTH_CAP_LABEL,
  INSURANCE_BY_SALARY,
  IRP_FULL_CREDIT_HIGH,
  manOnly,
  manwon,
  // 요율 → "4.75%" 표기. bonusKeeperFigures 의 pct(숫자 천 단위 구분, % 없음)와 이름이 겹쳐 별칭으로 가져온다 (G2A×G2B 병합)
  pct as ratePct,
  PENSION_BY_PAY,
  PENSION_LABEL,
  RATE_LABEL,
  ratio,
  TAX_EXAMPLES,
  won,
} from "@/lib/guides/bonusNetFigures2026";
import {
  AGREEMENT_2026,
  BASIC_RATIO,
  OPI1_MAX_RATE,
  OPI_2025_DESC,
  OPI_ACTUAL_2025,
  PI_TIERS,
  PS_HISTORY_GUIDE,
  SK_2026_H1_MARGIN_PCT,
  SK_2026_Q,
  TAI_2026_H1_DESC,
  TAI_ANNOUNCED_DATE,
  TAI_PAY_DATE,
  basePct,
  bonusNet2026,
  fixedManwon,
  manKo,
  opTrilKo,
  opi2025,
  pct,
  piRateForMargin,
  psYear,
} from "@/lib/guides/bonusKeeperFigures";
import { calculateSeverancePay } from "@/lib/severanceCalculator";
import { calcBonusNet } from "@/lib/bonusTaxCalc";
import { formatManwonKorean } from "@/lib/manwonFormat";
import { seedCompanies } from "@/data/seedCompanies";
import { BONUS_PROFILES } from "@/data/bonusData";

// 구직급여 1일 상한 표시값 — 정본(src/config/unemploymentBenefit.ts)에서 끼워 넣는다 (verify-tax-constants 게이트)
const UB_UPPER = UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER.toLocaleString("en-US");

// 2차 키퍼(G2C) 예시 금액 표기 — 원 단위 / 만원·억 단위(1억 이상은 "1억 2,000만원" 형식)
const g2cWon = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const g2cMan = (n: number) => formatManwonKorean(Math.round(n / 10_000));

// ═══════════════════════════════════════════════════════════════
// 영역 A — 성과급 종류·구조 (10편)
// ═══════════════════════════════════════════════════════════════

// 2차 키퍼(2026-09-26 G2B) — 통상임금·평균임금은 대법원 판결문과 법령, 세후 예시는 성과급 엔진(2026 요율).
// year-end-encouragement-vs-bonus-2026(격려금 vs 정기상여)의 검색 의도를 흡수하고 그 글의 "35% 점프" 계산을 바로잡는다.
const ENC = bonusNet2026(60_000_000, 10_000_000);

const bonusVsIncentive = `
<p class="lead">성과급·인센티브·격려금은 세금에서는 차이가 없습니다. 이름과 관계없이 모두 근로소득(소득세법 제20조)이라 그해 연봉과 합쳐 연말정산되고 6~45% 누진세율이 적용됩니다. 차이는 노동법에서 납니다. 연장·야간수당의 기준인 <strong>통상임금</strong>에는 재직 조건이 붙은 정기상여금도 들어가지만 근무실적에 따른 순수 성과급은 들어가지 않고(대법원 2024년 12월 19일 전원합의체), 퇴직금의 기준인 <strong>평균임금</strong>에는 지급 의무가 정해져 있고 근로 제공과 밀접한 성과급만 들어갑니다(대법원 2026년 1월 29일). 기준일은 2026년 9월 26일입니다.</p>

<h2>네 가지 보상, 한 표로 비교</h2>
<p>회사마다 부르는 이름이 달라서 이름보다 지급 방식으로 구분하는 것이 정확합니다. 아래 표는 판례가 제시한 기준을 전형적인 경우에 적용한 것이며, 실제 판단은 취업규칙·단체협약에 적힌 지급 조건에 따라 달라질 수 있습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>구분</th><th>전형적인 예</th><th>통상임금</th><th>평균임금(퇴직금)</th><th>세금</th></tr></thead>
<tbody>
<tr><td>정기상여금</td><td>짝수 달 100%, 설·추석 상여</td><td>들어감(재직 조건, 소정근로일수 이내의 근무일수 조건이 붙어도)</td><td>들어감(12개월분의 3/12)</td><td>근로소득</td></tr>
<tr><td>목표·평가형 성과급</td><td>미리 정한 기준으로 평가 등급별 지급률 적용</td><td>순수 성과급은 안 들어감, 최소 보장분은 들어감</td><td>지급 의무가 정해져 있으면 들어감(삼성전자 TAI)</td><td>근로소득</td></tr>
<tr><td>경영성과 배분형 성과급</td><td>영업이익·경제적 부가가치의 일정 비율 배분</td><td>안 들어감</td><td>안 들어간다는 판결(삼성전자 OPI·SK하이닉스 경영성과급)</td><td>근로소득</td></tr>
<tr><td>일회성 격려금·포상금</td><td>창립기념 격려금, 특별 포상</td><td>안 들어감</td><td>계속·정기 지급과 지급 의무가 없으면 안 들어감</td><td>근로소득</td></tr>
</tbody>
</table></div>

<h2>통상임금 — 2024년 12월 전원합의체 이후 기준</h2>
<p>통상임금은 연장·야간·휴일근로 가산수당과 연차수당 등을 계산하는 기준 임금입니다. 근로기준법 시행령 제6조는 근로자에게 정기적이고 일률적으로 소정근로 또는 총 근로에 대해 지급하기로 정한 금액으로 정의합니다.</p>
<p>대법원은 2024년 12월 19일 전원합의체 판결(2020다247190)에서 종전의 '고정성' 요건을 버렸습니다. 그래서 특정 시점에 재직 중인 사람에게만 주거나 소정근로일수 이내에서 정한 근무일수를 채워야 주는 조건이 붙었다는 이유만으로 정기상여금이 통상임금에서 빠지지 않습니다. 다만 소정근로일수를 넘는 근무일수를 채워야 주는 임금은 소정근로를 넘는 추가 근로의 대가라서 통상임금이 아니라고 했습니다. 반면 업무성과를 달성하거나 평가 결과가 기준에 이르러야 지급되는 '순수한 의미의 성과급'은 여전히 통상임금이 아니라고 했고, 근무실적과 무관하게 지급하기로 정한 최소 보장액은 통상임금이라고 봤습니다. 새 법리는 판결 선고일 이후의 통상임금 산정부터 적용됩니다.</p>
<p>본인 수당 구성으로 시간급 통상임금과 연장·야간수당 파급액을 보려면 <a href="/calc/ordinary-wage">통상임금 계산기</a>를 쓰면 됩니다.</p>

<h2>평균임금·퇴직금 — 성과급이 들어가는 조건</h2>
<p>퇴직금은 계속근로기간 1년에 30일분 이상의 평균임금입니다(근로자퇴직급여 보장법 제8조). 평균임금은 퇴직 전 3개월 동안 받은 임금 총액을 그 기간의 총일수로 나눈 금액이고(근로기준법 제2조), 1년 단위로 받는 상여금은 퇴직 전 12개월 동안 받은 금액의 3/12만 더합니다(고용노동부 퇴직금 계산 예시).</p>
<p>성과급이 여기서 말하는 '임금'인지는 두 가지로 판단합니다(대법원 2021다248299). 첫째, 계속적·정기적으로 지급되고 단체협약·취업규칙·근로계약·노동관행 등으로 회사에 지급 의무가 있어야 합니다. 둘째, 지급 의무의 발생이 근로 제공과 직접 또는 밀접하게 관련돼야 합니다.</p>
<ul>
<li><strong>삼성전자(2026년 1월 29일)</strong> — 평가 등급에 따라 상여기초금액에 연동해 주는 목표 인센티브(TAI)는 임금이고, 사업부 경제적 부가가치(EVA)의 20%를 재원으로 나누는 성과 인센티브(OPI)는 임금이 아니라고 봤습니다.</li>
<li><strong>SK하이닉스(2026년 2월 12일, 2021다219994)</strong> — 연도별 노사합의로 지급 여부와 기준을 정해 온 경영성과급은 지급 의무가 인정되지 않고 영업이익은 근로 외 요인의 영향이 크다며 평균임금이 아니라고 봤습니다.</li>
</ul>
<p>예를 들어 1년에 정기상여금 400만원을 받는 사람이라면 평균임금을 계산할 때 100만원(400만원 × 3/12)이 3개월 임금 총액에 더해집니다. 퇴직금과 퇴직소득세는 <a href="/tools/finance/severance">퇴직금 세금 계산기</a>에서 계산할 수 있습니다.</p>

<h2>세금은 이름과 관계없이 근로소득입니다</h2>
<p>소득세법 제20조는 근로를 제공하고 받는 봉급·급료·임금·상여·수당과 이와 비슷한 급여를 모두 근로소득으로 봅니다. 성과급·인센티브·격려금은 이름과 관계없이 그해 총급여에 합산되고, 근로소득공제와 인적공제 등을 뺀 과세표준에 6~45% 누진세율이 적용됩니다(소득세법 제55조). 여기에 지방소득세(소득세의 10%), 건강보험·고용보험, 기준소득월액 상한 안의 국민연금이 붙습니다.</p>
<p>"격려금을 받으면 세율이 35%로 뛴다"는 말은 대부분 사실과 다릅니다. 연봉 6,000만원인 직원이 연말 격려금 1,000만원을 받으면 총급여는 7,000만원이지만, 공제를 빼면 과세표준이 5,000만원을 넘지 않아 한계세율은 15%입니다. 사이트 성과급 엔진(2026년 요율)으로 계산하면 격려금 1,000만원에 붙는 세금·보험료는 약 ${manKo(ENC.totalDeductions)}, 세후는 약 ${manKo(ENC.net)}(부담률 ${ENC.effectiveRate}%)입니다. 받는 달에 원천징수가 많이 잡혀도 연말정산에서 연간 세액으로 다시 맞춰집니다.</p>
<p>본인 연봉과 성과급 금액으로는 <a href="/tools/finance/bonus">성과급·인센티브 세금 계산기</a>에서 바로 확인할 수 있습니다.</p>

<h2>격려금·일회성 보너스는 어떻게 보나요</h2>
<p>격려금은 이름만으로 판단하지 않습니다. 앞의 기준대로 계속적·정기적으로 지급되는지, 회사에 지급 의무가 있는지, 근로 제공과 관련이 있는지를 봅니다. 창립기념일이나 특별한 사정으로 한 번 주는 격려금·포상금은 이 기준으로는 통상임금이나 평균임금에 들어간다고 보기 어렵습니다. 반대로 매년 같은 시기에 같은 기준으로 지급하도록 규정돼 있다면 정기상여금과 같은 판단을 받을 수 있습니다.</p>
<p>퇴사를 앞두고 있다면 받을 성과급이 평균임금에 들어가는 종류인지 먼저 확인하세요. 들어가는 종류라면 퇴직 전 12개월 안에 받은 금액만 3/12로 반영되므로, 지급일이 그 12개월 안에 드는지에 따라 퇴직금이 달라집니다. 회사별 성과급 제도는 <a href="/calc/bonus-calculators">회사별 성과급 계산기 모음</a>, 삼성전자 OPI·TAI는 <a href="/guides/samsung-opi-tai-complete-2026">삼성전자 OPI·TAI 정리</a>에서 볼 수 있습니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 성과급과 인센티브는 세금이 다른가요?</strong> — 다르지 않습니다. 이름과 관계없이 근로소득으로 그해 연봉과 합산되고, 연말정산에서 6~45% 누진세율로 한 번에 계산됩니다.</li>
<li><strong>Q. 정기상여금에 재직 조건이 붙어 있으면 통상임금에서 빠지나요?</strong> — 2024년 12월 19일 전원합의체 판결 이후 산정분부터는 재직 조건이나 소정근로일수 이내의 근무일수 조건만으로 빠지지 않습니다. 소정근로일수를 넘는 근무일수를 요구하는 조건이라면 통상임금이 아닙니다.</li>
<li><strong>Q. 성과급은 퇴직금에 들어가나요?</strong> — 종류에 따라 다릅니다. 지급 의무가 미리 정해진 목표·평가형 성과급은 들어간다는 판결(삼성전자 TAI)이, 영업이익 등 경영성과를 나누는 성과급은 들어가지 않는다는 판결(삼성전자 OPI, SK하이닉스 경영성과급)이 있습니다.</li>
<li><strong>Q. 연말 격려금 1,000만원을 받으면 세율이 35%가 되나요?</strong> — 연봉 6,000만원이라면 아닙니다. 합산 뒤 과세표준이 5,000만원 이하라 한계세율은 15%이고, 세금·보험료는 약 ${manKo(ENC.totalDeductions)}입니다.</li>
<li><strong>Q. 퇴직 직전에 성과급을 받으면 퇴직금이 늘어나나요?</strong> — 평균임금에 들어가는 성과급이라면 퇴직 전 12개월 안에 받은 금액의 3/12이 평균임금 계산에 더해집니다.</li>
</ul>

<p class="text-sm">기준일: 2026-09-26. 근거: <a href="https://www.law.go.kr/판례/(2020다247190)">대법원 2020다247190 전원합의체 판결</a>, <a href="https://www.law.go.kr/판례/(2021다248299)">대법원 2021다248299 판결</a>, <a href="https://scourt.go.kr/portal/news/NewsViewAction.work?gubun=6&searchOption=&searchWord=&seqnum=2931">대법원 2021다219994 보도자료</a>, <a href="https://www.law.go.kr/법령/근로기준법시행령/제6조">근로기준법 시행령 제6조</a>, <a href="https://www.law.go.kr/법령/근로기준법/제2조">근로기준법 제2조</a>, <a href="https://www.law.go.kr/법령/근로자퇴직급여보장법/제8조">근로자퇴직급여 보장법 제8조</a>, <a href="https://www.moel.go.kr/retirementpayCal.do">고용노동부 퇴직금 계산</a>, <a href="https://www.law.go.kr/법령/소득세법/제20조">소득세법 제20조</a>, <a href="https://www.law.go.kr/법령/소득세법/제55조">소득세법 제55조</a>. 개별 사안의 통상임금·평균임금 해당 여부는 취업규칙·단체협약에 따라 달라지므로 회사 인사팀이나 노무 전문가에게 확인하세요.</p>
`;

// 2차 키퍼(2026-09-26 G2B) — OPI·TAI 지급률은 계산기 데이터(opiData·taiData), 세후는 성과급 엔진(2026 요율)에서 끼워 넣는다.
// opi-vs-tai-timing-tax-2026(지급 시점 분산)·samsung-wage-negotiation-status-2026(2026 임협)의 검색 의도를 흡수한다.
const SS_MX = opi2025("mx");
const SS_DS = opi2025("ds-common");
const SS_VD = opi2025("vd-da-nw-med");
const SS_LOW = OPI_2025_DESC[OPI_2025_DESC.length - 1];
const SS_TAI_TOP = TAI_2026_H1_DESC[0];
const SS_TAI_LOW = TAI_2026_H1_DESC[TAI_2026_H1_DESC.length - 1];
const ssOpiWon = (salary: number, rate: number) => (salary * rate) / 100;
const SS_1EOK_DS = bonusNet2026(100_000_000, ssOpiWon(100_000_000, SS_DS.rate));
const SS_TAI_EXAMPLE = bonusNet2026(80_000_000, 4_000_000);
const ssOpiNetRow = (salary: number) => {
  const ds = ssOpiWon(salary, SS_DS.rate);
  const vd = ssOpiWon(salary, SS_VD.rate);
  return `<tr><td>${manKo(salary)}</td><td>${manKo(ds)} → ${manKo(bonusNet2026(salary, ds).net)}</td><td>${manKo(vd)} → ${manKo(bonusNet2026(salary, vd).net)}</td></tr>`;
};

const samsungOpiTai = `
<p class="lead">삼성전자 성과급은 연 1회 받는 <strong>OPI(초과이익성과급)</strong>와 상·하반기에 한 번씩 받는 <strong>TAI(목표달성장려금)</strong> 두 가지입니다. OPI는 연봉 대비 %(상한 ${OPI1_MAX_RATE}%), TAI는 월 기본급 대비 %로 계산합니다. 2025년 실적분 OPI는 ${OPI_ACTUAL_2025.payDateLabel}에 MX ${SS_MX.rate}%·DS부문 공통 ${SS_DS.rate}%·VD·생활가전 등 ${SS_VD.rate}%로 지급됐고, 2026년 상반기 TAI는 ${TAI_PAY_DATE}에 ${SS_TAI_TOP.division} ${SS_TAI_TOP.rate}%부터 ${SS_TAI_LOW.division} ${SS_TAI_LOW.rate}%까지 지급됐습니다. 노조 공지를 인용한 복수 보도 기준이며, 기준일은 2026년 9월 26일입니다.</p>

<h2>OPI와 TAI는 무엇이 다른가요</h2>
<p>둘 다 성과급이지만 계산 기준과 결정 방식이 다릅니다. 지급 시기와 최근 지급률은 사이트 계산기와 같은 데이터(노조 공지 기반 보도)이고, 결정 방식과 퇴직금 반영 여부는 2026년 1월 29일 대법원 판결문(2021다248299)에 적힌 내용입니다. 판결문의 결정 방식은 원고들이 퇴직한 2016~2018년 무렵의 제도를 설명한 것이라, 이후 세부 기준이 바뀌었을 수 있습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>구분</th><th>OPI (초과이익성과급)</th><th>TAI (목표달성장려금)</th></tr></thead>
<tbody>
<tr><td>지급 횟수·시기</td><td>연 1회, 통상 1월 말~2월 초</td><td>연 2회, 통상 7월 초·12월 말</td></tr>
<tr><td>계산 기준</td><td>연봉 대비 %, 상한 ${OPI1_MAX_RATE}%</td><td>월 기본급(상여기초금액) 대비 %</td></tr>
<tr><td>결정 방식(판결문)</td><td>사업부 경제적 부가가치(EVA)의 20%를 재원으로 배분</td><td>반기마다 사업부문·사업부 성과를 A~D 네 등급으로 평가해 0~100%</td></tr>
<tr><td>최근 지급률</td><td>2025년 실적분 ${SS_LOW.rate}~${SS_MX.rate}%</td><td>2026년 상반기 ${SS_TAI_LOW.rate}~${SS_TAI_TOP.rate}%</td></tr>
<tr><td>퇴직금(평균임금)</td><td>들어가지 않음</td><td>들어감</td></tr>
</tbody>
</table></div>
<p>한 해 성과급을 합칠 때는 기준이 다르다는 점을 먼저 맞춰야 합니다. 예를 들어 OPI 47%는 연봉의 47%이고, TAI 100%는 한 달 기본급 100%입니다. 두 숫자를 그대로 더하면 안 됩니다.</p>

<h2>2025년 실적분 OPI 사업부별 지급률</h2>
<p>${OPI_ACTUAL_2025.payDateLabel}에 지급된 2025년 실적분 OPI입니다. 연봉 대비 %이므로 오른쪽 열처럼 연봉 8,000만원이면 세전 금액이 바로 나옵니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>사업부</th><th>연봉 대비</th><th>연봉 8,000만원일 때 세전</th></tr></thead>
<tbody>
${OPI_2025_DESC.map((r) => `<tr><td>${r.division}</td><td>${r.rate}%</td><td>${manKo(ssOpiWon(80_000_000, r.rate))}</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>같은 회사 안에서도 최고(MX ${SS_MX.rate}%)와 최저(${SS_LOW.division} ${SS_LOW.rate}%)의 차이가 연봉의 ${SS_MX.rate - SS_LOW.rate}%p입니다. 2026년 실적분 OPI는 2027년 1월 말 전후에 발표되며, 이 글은 발표 전 수치를 추정하지 않습니다. 삼성전자 직원 평균 급여(2025년 사업보고서 1억 5,800만원)와 직급별 연봉은 <a href="/salary-db/samsung-electronics">삼성전자 연봉 정보</a>에서 볼 수 있습니다.</p>

<h2>2026년 상반기 TAI 사업부별 지급률</h2>
<p>${TAI_ANNOUNCED_DATE} 사내 공지, ${TAI_PAY_DATE} 지급분입니다. TAI는 월 기본급 대비라서 월 기본급 400만원이면 100%는 400만원, 50%는 200만원입니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>사업부</th><th>부문</th><th>월 기본급 대비</th></tr></thead>
<tbody>
${TAI_2026_H1_DESC.map((r) => `<tr><td>${r.division}</td><td>${r.group}</td><td>${r.rate}%</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>하반기 TAI는 통상 12월 말에 발표·지급됩니다. 2026년 9월 26일 현재 하반기 지급률은 발표되지 않았습니다.</p>

<h2>연봉별 OPI 세후 금액</h2>
<p>성과급은 따로 과세되지 않고 그해 연봉과 합쳐 근로소득으로 연말정산됩니다(소득세법 제20조). 아래 표는 사이트 성과급 엔진으로 "연봉만 받을 때"와 "연봉과 OPI를 함께 받을 때"의 연간 결정세액 차이를 구하고, 지방소득세와 4대보험(2026년 요율, 국민연금 기준소득월액 상한 반영)을 더해 뺀 세후 금액입니다. 본인 기본공제 외의 부양가족·카드·연금저축 공제는 넣지 않았습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>연봉</th><th>DS부문 공통 ${SS_DS.rate}% 세전 → 세후</th><th>VD·생활가전 등 ${SS_VD.rate}% 세전 → 세후</th></tr></thead>
<tbody>
${[60_000_000, 80_000_000, 100_000_000].map(ssOpiNetRow).join("\n")}
</tbody>
</table></div>
<p>연봉 1억원이면 OPI ${SS_DS.rate}%(${manKo(SS_1EOK_DS.gross)})에서 세금과 보험료 약 ${manKo(SS_1EOK_DS.totalDeductions)}이 빠져 세후는 약 ${manKo(SS_1EOK_DS.net)}(부담률 ${SS_1EOK_DS.effectiveRate}%)입니다. 같은 비율이라도 연봉이 높을수록 부담률이 올라가는 것은 누진세율 때문입니다. TAI도 같은 방식으로 계산합니다. 월 기본급 400만원·연봉 8,000만원인 직원이 TAI 100%(400만원)를 받으면 세후는 약 ${manKo(SS_TAI_EXAMPLE.net)}입니다. 본인 사업부·연봉으로는 <a href="/calc/samsung-bonus">삼성전자 성과급 계산기</a>에서 바로 계산할 수 있습니다.</p>

<h2>지급 시점을 나누면 세금이 줄어드나요</h2>
<p>같은 해 안에서는 줄지 않습니다. 소득세는 1~12월 총급여 전체로 연말정산하므로, OPI처럼 1월에 한 번에 받든 TAI처럼 7월과 12월로 나눠 받든 그해 총급여가 같으면 연간 결정세액도 같습니다. 달라지는 것은 다음 세 가지입니다.</p>
<ul>
<li><strong>지급 달 원천징수</strong> — 성과급을 받은 달에는 원천징수가 크게 잡힐 수 있지만, 연말정산에서 연간 세액으로 다시 맞춰져 환급이나 추가 납부로 정리됩니다.</li>
<li><strong>건강보험료 정산</strong> — 회사가 성과급을 포함한 전년도 보수총액을 3월 10일까지 신고하면 공단이 보험료를 다시 계산해 4월분에서 차액을 걷거나 돌려줍니다. 추가로 낼 금액이 그달 보험료 이상이면 회사 신청으로 12회 이내 나눠 낼 수 있습니다.</li>
<li><strong>해가 바뀌는 경우</strong> — 12월과 이듬해 1월처럼 연도가 달라지면 어느 해 소득으로 잡히느냐에 따라 연간 세액이 달라질 수 있습니다. 같은 해 안의 분할과는 다른 문제입니다.</li>
</ul>

<h2>2026 임금협상과 퇴직금 판결로 달라진 점</h2>
<p>2026년 임금협상은 5월 27일 조합원 투표(찬성 73.7%)로 타결됐습니다(보도 기준). 성과급과 관련된 내용은 다음과 같습니다.</p>
<ul>
<li><strong>임금</strong> — 기본인상률 4.1%에 성과인상률 평균 2.1%.</li>
<li><strong>DS부문 특별경영성과급 신설</strong> — 노사가 합의해 정한 DS부문 사업성과의 10.5%를 재원으로 부문 공통 40%·사업부 60%로 나누고, 세후 금액 전액을 자사주로 지급합니다(3분의 1은 바로 팔 수 있고, 나머지는 1년·2년 매각 제한). 조건이 붙은 10년 제도로, 해당 연도 DS부문 영업이익이 2026~2028년에는 200조원, 2029~2035년에는 100조원 이상이어야 지급됩니다. 2026년 실적이 첫 대상이라 조건을 채우면 2027년 초에 처음 지급되며, 기존 OPI는 그대로 유지됩니다.</li>
<li><strong>DX부문·CSS사업팀 자사주</strong> — 회사는 임금협상 합의에 따라 2026년 7월 8일 대상 직원 4만9,345명에게 보통주 108만3,434주(처분 예정금액 약 3,445억원)를 지급한다고 공시했습니다.</li>
</ul>
<p>퇴직금 기준도 정리됐습니다. 대법원은 2026년 1월 29일 목표 인센티브(TAI)가 근로의 대가인 임금이라 평균임금에 넣어야 한다고 보고 원심을 깨 수원고등법원으로 돌려보냈고, 성과 인센티브(OPI)는 경영성과의 사후 분배에 가까워 평균임금이 아니라고 판단했습니다. 개별 퇴직금 차액은 환송심과 회사 산정을 거쳐 정해집니다. 앞으로 받을 특별경영성과급(자사주)은 <a href="/guides/samsung-vs-sk-hynix-stock-bonus-2026">삼성전자·SK하이닉스 주식 성과급 비교</a>에서 따로 다룹니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. OPI는 연봉의 몇 %까지 받을 수 있나요?</strong> — 제도상 상한은 연봉의 ${OPI1_MAX_RATE}%입니다. 2025년 실적분은 MX가 상한인 ${SS_MX.rate}%, DS부문 공통이 ${SS_DS.rate}%였고 가장 낮은 ${SS_LOW.division}은 ${SS_LOW.rate}%였습니다(노조 공지 기반 보도).</li>
<li><strong>Q. 2026년 하반기 TAI는 언제 발표되나요?</strong> — 통상 12월 말에 발표·지급됩니다. 2026년 9월 26일 현재 하반기 지급률은 나오지 않았으므로, 발표 전 숫자는 전망으로만 보세요.</li>
<li><strong>Q. OPI와 TAI를 같은 해에 나눠 받으면 세금이 줄어드나요?</strong> — 아닙니다. 그해 총급여가 같으면 연간 결정세액도 같습니다. 달라지는 것은 지급 달 원천징수액과 연말정산 환급·추가 납부의 크기입니다.</li>
<li><strong>Q. 성과급도 퇴직금 계산에 들어가나요?</strong> — 2026년 1월 대법원 판결 기준으로 TAI는 평균임금에 들어가고 OPI는 들어가지 않습니다. 평균임금에 넣는 상여금은 퇴직 전 12개월 동안 받은 금액의 3/12입니다(고용노동부 퇴직금 계산 예시).</li>
<li><strong>Q. DS부문 특별경영성과급은 언제 처음 받나요?</strong> — 2026년 실적이 첫 대상입니다. 2026년 DS부문 영업이익이 200조원 이상이어야 지급되고, 조건을 채우면 2027년 초에 처음 받습니다(보도 기준). 조건에 못 미친 해에는 지급되지 않으며, 세후 금액을 전부 자사주로 받는 구조라 현금으로 받는 OPI와 받는 방식도 다릅니다.</li>
</ul>

<p class="text-sm">기준일: 2026-09-26. OPI·TAI 지급률과 임금협상 내용은 노조 공지를 인용한 복수 보도로, <a href="/calc/samsung-bonus">삼성전자 성과급 계산기</a>와 같은 데이터입니다. 특별경영성과급의 지급 조건은 보도(지디넷코리아·아시아경제 2026-05-21) 기준입니다. 자사주 지급은 회사 공시, 판결은 <a href="https://www.law.go.kr/판례/(2021다248299)">대법원 2021다248299 판결(국가법령정보센터)</a>, 과세 구조는 <a href="https://www.law.go.kr/법령/소득세법/제20조">소득세법 제20조</a>와 <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2227&cntntsId=7667">국세청 종합소득세 세율</a>, 건강보험료 정산은 <a href="https://www.law.go.kr/법령/국민건강보험법시행령/제39조">국민건강보험법 시행령 제39조</a>, 상여금의 평균임금 산입은 <a href="https://www.moel.go.kr/retirementpayCal.do">고용노동부 퇴직금 계산</a>을 따랐습니다. 다른 회사 성과급은 <a href="/calc/bonus-calculators">회사별 성과급 계산기 모음</a>에서 볼 수 있습니다.</p>
`;

// 2차 키퍼(2026-09-26 G2B) — PS·PI 이력은 계산기 데이터(psData)에 회사 실적 발표·회사 인용 보도로 바로잡은 값(PS_HISTORY_GUIDE),
// 가결 조건은 psData, 세후는 성과급 엔진(2026 요율). sk-hynix-ps-bonus-2026(5월 전망 글)의 검색 의도를 흡수한다.
// 2026년 실적분 지급률은 확정 전이라 추정하지 않는다. 2025년 실적분 이연 20%는 9/16 가결안에서 2026년 선지급(복수 보도).
const SK_2025 = psYear(2025);
const SK_PS_2025 = SK_2025.psRatePct as number;
const SK_2022 = psYear(2022);
const SK_NEW = AGREEMENT_2026.newSplit;
const SK_OLD = AGREEMENT_2026.oldSplit;
const SK_OLD_DEFERRED = SK_OLD.cashYear1Pct + SK_OLD.cashYear2Pct;
const SK_POOL_PCT = AGREEMENT_2026.poolRate * 100;
const SK_PI_MAX = Math.max(...PI_TIERS.map((t) => t.rate));
const SK_PI_H1 = piRateForMargin(SK_2026_H1_MARGIN_PCT);
const skPsWon = (salary: number) => (salary / BASIC_RATIO) * (SK_PS_2025 / 100);
// 2025년 실적분은 2월 지급 80% + 2026년 안 선지급 20% = 전액이 2026년 총급여 — 세후는 PS 전액(원금) 기준
const skNetRow = (salary: number) => {
  const total = skPsWon(salary);
  const r = bonusNet2026(salary, total);
  return `<tr><td>${manKo(salary)}</td><td>${manKo(total)}</td><td>${manKo(r.totalDeductions)}</td><td>${manKo(r.net)}</td><td>${r.effectiveRate}%</td></tr>`;
};

const skHynixPs = `
<p class="lead">SK하이닉스 PS(초과이익분배금)는 연간 영업이익의 ${SK_POOL_PCT}%를 재원으로 이듬해 초에 기준급 대비 %로 지급하는 성과급입니다. 2025년 실적분 PS는 <strong>${pct(SK_PS_2025)}%</strong>로, 기준급 1,000% 상한이 없어진 뒤 처음 적용된 해였습니다. 이 가운데 ${SK_OLD.cashNowPct}%는 2026년 2월 5일 지급됐고, 2027·2028년에 받기로 했던 나머지 ${SK_OLD_DEFERRED}%도 9월 16일 총투표에서 가결된 합의에 따라 2026년 안에 앞당겨 지급됩니다. 2026년 실적분부터는 이듬해 초 현금 ${SK_NEW.cashNowPct}%·자사주 ${SK_NEW.stockNowPct}%, 1년 뒤와 2년 뒤 자사주 ${SK_NEW.stockYear1Pct}%씩으로 나눠 받습니다. 회사 실적 발표·복수 보도와 사업보고서 기준이며, 기준일은 2026년 9월 26일입니다.</p>

<h2>연도별 PS·PI 지급률</h2>
<p>PS는 연 1회, PI(생산성 격려금)는 반기마다 받습니다. 아래 표는 실적 연도 기준이고 PS는 이듬해 초에 지급됩니다. 지급률은 기준급 대비 %이며, 사이트 계산기는 기준급을 연봉의 ${BASIC_RATIO}분의 1로 봅니다. 영업이익은 회사 연간 실적 발표 기준입니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>실적 연도</th><th>PS</th><th>PI(연간)</th><th>영업이익</th><th>메모</th></tr></thead>
<tbody>
${PS_HISTORY_GUIDE.map((r) => `<tr><td>${r.year}</td><td>${r.psRatePct == null ? "—" : `${pct(r.psRatePct)}%`}</td><td>${r.piTotalPct == null ? "공개 자료 미확인" : `${pct(r.piTotalPct)}%`}</td><td>${opTrilKo(r.opTril)}</td><td>${r.note ?? ""}</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>PS ${pct(SK_PS_2025)}%를 연봉 기준으로 바꾸면 기준급(연봉 ÷ ${BASIC_RATIO}) × ${SK_PS_2025 / 100} = 연봉의 ${SK_PS_2025 / BASIC_RATIO}%입니다. 연봉 1억원이면 PS 총액이 세전 ${manKo(skPsWon(100_000_000))}이라는 뜻입니다. 영업이익이 전년보다 크게 줄어든 2022년에는 PS가 ${pct(SK_2022.psRatePct as number)}%(연봉의 약 ${(SK_2022.psRatePct as number) / BASIC_RATIO}%)로 내려갔고, 적자였던 2023년에는 PS가 없었습니다. 영업이익에 그대로 연동되는 만큼 해마다 편차가 큽니다. 직원 평균 급여는 2025년 사업보고서 기준 1억 8,500만원(직원 3만4,549명)이며, 직급별 연봉과 함께 <a href="/salary-db/sk-hynix">SK하이닉스 연봉 정보</a>에 정리돼 있습니다.</p>

<h2>2026년 실적분부터 바뀌는 지급 방식</h2>
<p>2026년 임단협은 8월 20일 첫 잠정합의안(현금 40%·자사주 60%)이 8월 25일 총투표에서 부결된 뒤, 9월 9일 마련한 수정안이 9월 16일 총투표에서 찬성 57.08%로 가결됐습니다. 새 방식은 2026년 실적분(2027년 초 지급)부터 적용됩니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>지급 시점</th><th>2025년 실적분까지</th><th>2026년 실적분부터</th></tr></thead>
<tbody>
<tr><td>이듬해 초</td><td>현금 ${SK_OLD.cashNowPct}%</td><td>현금 ${SK_NEW.cashNowPct}% + 자사주 ${SK_NEW.stockNowPct}%</td></tr>
<tr><td>1년 뒤</td><td>현금 ${SK_OLD.cashYear1Pct}%</td><td>자사주 ${SK_NEW.stockYear1Pct}%</td></tr>
<tr><td>2년 뒤</td><td>현금 ${SK_OLD.cashYear2Pct}%</td><td>자사주 ${SK_NEW.stockYear2Pct}%</td></tr>
<tr><td>주식 선택</td><td>없음</td><td>현금 몫을 10% 단위로 주식 전환 가능(전액 주식 가능)</td></tr>
</tbody>
</table></div>
<p>2025년 실적분의 이연분은 예외입니다. 1년 뒤와 2년 뒤(2027·2028년)에 ${SK_OLD.cashYear1Pct}%씩 받기로 했던 ${SK_OLD_DEFERRED}%를 이번 합의로 2026년 안에 한꺼번에 앞당겨 지급하기로 했습니다(서울신문·이투데이·머니투데이 2026-09-16 보도). 제도가 바뀌는 과정의 혼선을 줄이기 위한 조치로 보도됐습니다.</p>
<p>임금은 ${AGREEMENT_2026.wageIncreasePct}% 인상이 유지됐고, 회사가 적자를 내면 임금 일부(보도상 최대 ${AGREEMENT_2026.deficitWageDeferralMaxPct}%)를 뒤로 미뤄 지급할 수 있다는 조항이 들어갔습니다. PS 재원(영업이익의 ${SK_POOL_PCT}%)과 상한 폐지는 그대로입니다. 현금·주식 비중에 따라 결과가 어떻게 갈리는지는 <a href="/guides/sk-hynix-ps-cash-vs-stock-scenarios-2026">SK하이닉스 PS 현금·주식 시나리오</a>에서 따로 비교합니다.</p>

<h2>PS ${pct(SK_PS_2025)}%는 세후 얼마인가요</h2>
<p>2025년 실적분은 옛 방식이라 PS의 ${SK_OLD.cashNowPct}%가 2026년 2월에 현금으로 들어왔고, 2027·2028년에 받기로 했던 나머지 ${SK_OLD_DEFERRED}%도 2026년 안에 앞당겨 받습니다. PS 전액을 2026년에 받으므로 모두 2026년 총급여에 더해 연말정산됩니다. 아래 표는 PS 전액을 연봉에 더해 사이트 성과급 엔진(2026년 요율, 국민연금 기준소득월액 상한 반영)으로 계산한 세후입니다. 조기 지급분에 이자를 더하는지 같은 세부 조건은 보도마다 달라 원금만 넣었고, PI 등 다른 성과급과 본인 기본공제 외의 공제도 넣지 않았습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>연봉</th><th>PS 총액(2026년 지급)</th><th>세금·보험료</th><th>세후</th><th>부담률</th></tr></thead>
<tbody>
${[60_000_000, 80_000_000, 100_000_000, 120_000_000].map(skNetRow).join("\n")}
</tbody>
</table></div>
<p>연봉이 높을수록 부담률이 올라가는 것은 성과급이 더해지면서 과세표준의 윗부분이 35~38% 구간에 걸리기 때문입니다. 2월과 선지급 때 떼는 원천징수는 지급할 때마다 따로 계산되지만, 연말정산에서 1년치 총급여 기준 세액으로 다시 맞춰집니다. 본인 연봉과 영업이익 시나리오로는 <a href="/calc/sk-hynix-bonus">SK하이닉스 성과급 계산기</a>에서 바로 확인할 수 있습니다.</p>

<h2>2026년 실적분 PS는 언제, 어떻게 정해지나요</h2>
<p>재원은 2026년 연간 영업이익의 ${SK_POOL_PCT}%이고, 연간 실적이 확정되는 2027년 초에 지급률이 정해집니다. 2026년 9월 26일 현재 연간 실적이 나오지 않았으므로 이 글은 2026년 실적분 지급률을 추정하지 않습니다. 영업이익을 바꿔 가며 본인 몫을 가늠하려면 계산기의 시나리오를 쓰면 됩니다.</p>
<p>PI는 반기 영업이익률 구간으로 정해집니다. 보도된 기준은 ${PI_TIERS.filter((t) => t.rate > 0).map((t) => `영업이익률 ${t.minMarginPct}% 이상 ${t.rate}%`).join(", ")}, 그 아래는 0%입니다. 회사가 발표한 2026년 영업이익률은 1분기 ${SK_2026_Q.q1.marginPct}%, 2분기 ${SK_2026_Q.q2.marginPct}%(상반기 합산 약 ${SK_2026_H1_MARGIN_PCT}%)로 30%를 크게 넘으므로, 이 구간 기준을 적용하면 상반기 PI는 최대치인 ${SK_PI_H1}%입니다. 상반기 PI는 7월 30일 지급 예정으로 보도됐습니다(파이낸셜뉴스 2026-07-26). 하반기 PI는 2027년 1월께 정해집니다.</p>

<h2>PS는 퇴직금에 들어가나요</h2>
<p>들어가지 않는다는 판결이 나왔습니다. 대법원은 2026년 2월 12일 SK하이닉스 퇴직자 사건(2021다219994)에서, 생산량·영업이익 등 경영성과에 따라 연도별 노사합의로 지급해 온 성과급은 평균임금 산정의 기초가 되는 임금이 아니라고 본 원심을 확정했습니다. 취업규칙에 지급 규정이 없고 2001년과 2009년에는 노사합의가 없어 지급되지 않았다는 점, 영업이익은 근로 외 요인의 영향이 크다는 점이 근거였습니다.</p>
<p>다만 이 사건은 2016년 2월에 퇴직한 직원들이 2015년에 받은 성과급, 즉 해마다 노사합의로 지급 여부와 기준을 정하던 시기의 경영성과급(당시에도 PI·PS라는 이름으로 지급)을 다룬 것입니다. 영업이익의 ${SK_POOL_PCT}%를 재원으로 하고 2025년 노사 합의로 상한을 없앤 지금의 PS 제도를 직접 판단한 것은 아니므로, 퇴직을 앞두고 있다면 회사의 퇴직금 산정 기준을 확인하는 것이 좋습니다.</p>
<p>같은 쟁점에서 삼성전자 목표 인센티브(TAI)는 평균임금에 넣어야 한다는 판결(2026년 1월 29일)이 나왔는데, 지급 의무가 취업규칙 등으로 미리 정해져 있었는지와 근로 제공과 얼마나 직접 관련되는지가 결론을 갈랐습니다. 퇴직금은 평균임금 × 30일 × 근속연수로 계산하며, 상세 구조는 <a href="/tools/finance/severance">퇴직금 세금 계산기</a>에서 볼 수 있습니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. PS ${pct(SK_PS_2025)}%는 연봉의 몇 %인가요?</strong> — 기준급을 연봉의 ${BASIC_RATIO}분의 1로 보는 계산기 가정이면 연봉의 ${SK_PS_2025 / BASIC_RATIO}%입니다. 연봉 1억원이면 세전 ${manKo(skPsWon(100_000_000))}입니다. 그중 ${SK_OLD.cashNowPct}%는 2026년 2월에 지급됐고, 나머지 ${SK_OLD_DEFERRED}%도 9월 16일 가결된 합의로 2026년 안에 앞당겨 지급됩니다(보도 기준).</li>
<li><strong>Q. 2026년 실적분 PS는 몇 %인가요?</strong> — 아직 정해지지 않았습니다. 2026년 연간 영업이익의 ${SK_POOL_PCT}%가 재원이고 상한이 없으며, 연간 실적이 나오는 2027년 초에 확정됩니다.</li>
<li><strong>Q. 현금 대신 주식을 더 받을 수 있나요?</strong> — 2026년 실적분부터는 현금 몫 ${SK_NEW.cashNowPct}%를 10% 단위로 주식으로 바꿀 수 있고, 전액을 주식으로 받는 것도 가능합니다.</li>
<li><strong>Q. PI는 PS와 무엇이 다른가요?</strong> — PI는 반기마다 반기 영업이익률 구간에 따라 기준급의 0~${SK_PI_MAX}%를 받는 성과급이고, PS는 연간 영업이익의 ${SK_POOL_PCT}%를 재원으로 연 1회 받는 성과급입니다. 2026년 상반기는 영업이익률이 30%를 넘어 보도된 구간 기준상 ${SK_PI_H1}%입니다.</li>
<li><strong>Q. PS는 퇴직금에 반영되나요?</strong> — 2026년 2월 대법원 판결(2021다219994)은 해마다 노사합의로 정하던 2015년 무렵의 SK하이닉스 경영성과급이 평균임금에 들어가지 않는다고 봤습니다. 2025년 이후의 지금 PS 제도를 직접 판단한 판결은 아니므로, 퇴직 전에 회사 산정 기준을 확인하세요.</li>
</ul>

<p class="text-sm">기준일: 2026-09-26. 영업이익은 SK하이닉스 연간·분기 실적 발표, PS·PI 지급률과 가결 조건은 회사 인용 보도·복수 보도(2022년 PS: 이투데이 2023-02-01, 2025년 실적분 이연분 선지급: 서울신문·이투데이·머니투데이 2026-09-16, 상반기 PI 지급 예정일: 파이낸셜뉴스 2026-07-26) 기준입니다. 본인 몫 계산은 <a href="/calc/sk-hynix-bonus">SK하이닉스 성과급 계산기</a>를 쓰면 됩니다. 판결은 <a href="https://scourt.go.kr/portal/news/NewsViewAction.work?gubun=6&searchOption=&searchWord=&seqnum=2931">대법원 2021다219994 보도자료</a>, 평균임금 정의는 <a href="https://www.law.go.kr/법령/근로기준법/제2조">근로기준법 제2조</a>, 과세 구조는 <a href="https://www.law.go.kr/법령/소득세법/제20조">소득세법 제20조</a>와 <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2227&cntntsId=7667">국세청 종합소득세 세율</a>을 따랐습니다. 다른 회사는 <a href="/calc/bonus-calculators">회사별 성과급 계산기 모음</a>에서 볼 수 있습니다.</p>
`;

// 2차 키퍼(2026-09-26 G2B) — 회사별 성과급은 계산기와 같은 bonusData, 세후는 성과급 엔진(2026 요율).
// 평균 급여는 각 /salary-db 회사 페이지 헤드라인(2025년 사업보고서, 수기 공시 우선·없으면 DART 주입값)과 같다.
const HY26_PCT = basePct("hyundai", 2026);
const HY26_FIX = fixedManwon("hyundai", 2026);
const KIA26_PCT = basePct("kia", 2026);
const KIA26_FIX = fixedManwon("kia", 2026);
const LGES_25 = basePct("lgensol", 2025);
const LGD_25 = basePct("lg-display", 2026); // bonusData 는 지급 연도(2026) — 2025년 실적분
const POSCO_S_MIN = basePct("posco", 2025); // 직고용(S직군) 흑자 시 최소 경영성과급 — 2026-04 보도
const HY_CASH = 5_000_000 * (HY26_PCT / 100) + HY26_FIX * 10_000;
const HY_NET = bonusNet2026(5_000_000 * 18, HY_CASH);
const GEN_5000 = bonusNet2026(80_000_000, 50_000_000);
const genNetRow = (bonus: number) => {
  const r = bonusNet2026(80_000_000, bonus);
  return `<tr><td>${manKo(bonus)}</td><td>${manKo(r.totalDeductions)}</td><td>${manKo(r.net)}</td><td>${r.effectiveRate}%</td></tr>`;
};

const lgPoscoBonus = `
<p class="lead">2026년 9월 현재 확정된 성과급을 보면 현대차(8월 31일 가결)와 기아(8월 28일 가결)는 모두 <strong>월 기본급 ${HY26_PCT}% + 정액 ${pct(HY26_FIX)}만원 + 주식</strong>이고, LG에너지솔루션은 2025년 실적분으로 기본급의 최대 ${LGES_25}%, LG디스플레이는 ${LGD_25}%를 지급했습니다. LG전자는 사업본부별로 따로 정해 전사 공통 지급률이 알려져 있지 않고, 포스코는 사업회사 포스코와 지주사 POSCO홀딩스를 나눠 봐야 합니다. 보도·공시 기준이며 기준일은 2026년 9월 26일입니다.</p>

<h2>회사별 최근 확정 성과급 한눈에</h2>
<p>성과급 정률(%)은 회사마다 기준이 다를 수 있지만, 아래 표의 정률은 모두 월 기본급 대비입니다. 그래서 같은 ${HY26_PCT}%라도 기본급이 높은 사람이 더 받습니다. 평균 급여는 각 회사 2025년 사업보고서 기준으로 사이트 회사 페이지에 표시된 값입니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>회사</th><th>최근 확정 성과급</th><th>2025년 평균 급여</th><th>더 보기</th></tr></thead>
<tbody>
<tr><td>현대자동차</td><td>2026 임금협상: ${HY26_PCT}% + ${pct(HY26_FIX)}만원 + 주식 15주</td><td>1억 3,100만원</td><td><a href="/calc/hyundai-bonus">계산기</a> · <a href="/salary-db/hyundai">연봉</a></td></tr>
<tr><td>기아</td><td>2026 임단협: ${KIA26_PCT}% + ${pct(KIA26_FIX)}만원 + 자사주 47주</td><td>1억 3,400만원</td><td><a href="/calc/kia-bonus">계산기</a> · <a href="/salary-db/kia">연봉</a></td></tr>
<tr><td>LG에너지솔루션</td><td>2025년 실적분 최대 ${LGES_25}% (2026년 2월 6일 지급)</td><td>1억 1,200만원</td><td><a href="/calc/lg-energy-bonus">계산기</a> · <a href="/salary-db/lgensol">연봉</a></td></tr>
<tr><td>LG디스플레이</td><td>2025년 실적분 ${LGD_25}% (2026년 2월 지급)</td><td>8,600만원</td><td><a href="/calc/lg-display-bonus">계산기</a></td></tr>
<tr><td>LG전자</td><td>사업본부·고과별 상이 (전사 공통값 미공개)</td><td>1억 1,700만원</td><td><a href="/salary-db/lgelectronics">연봉</a></td></tr>
<tr><td>포스코</td><td>직고용(S직군) 기준: 흑자 시 경영성과급 최소 ${POSCO_S_MIN}% (2026년 4월 보도)</td><td>POSCO홀딩스 1억 4,700만원</td><td><a href="/calc/posco-bonus">계산기</a> · <a href="/salary-db/posco">연봉</a></td></tr>
</tbody>
</table></div>

<h2>현대차·기아 2026 임단협 — 같은 ${HY26_PCT}%, 다른 구성</h2>
<p>두 회사 모두 조합원 찬반투표를 거쳐 8월 말에 타결됐습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>항목</th><th>현대자동차</th><th>기아</th></tr></thead>
<tbody>
<tr><td>가결</td><td>8월 31일, 찬성 61.55%(투표율 78.63%)</td><td>8월 28일, 찬성 64.1%</td></tr>
<tr><td>기본급</td><td>월 10만원 인상(호봉승급분 포함)</td><td>월 10만원 인상</td></tr>
<tr><td>정률</td><td>성과금 ${HY26_PCT}%</td><td>경영성과금 300% + 품질향상 격려금 100%</td></tr>
<tr><td>정액</td><td>${pct(HY26_FIX)}만원</td><td>${pct(KIA26_FIX)}만원 (경영성과금 400만·품질향상 격려금 470만·오토카 어워즈 기념 400만)</td></tr>
<tr><td>주식</td><td>15주</td><td>자사주 47주</td></tr>
<tr><td>전년(2025) 합의</td><td>${basePct("hyundai", 2025)}% + ${pct(fixedManwon("hyundai", 2025))}만원 + 30주</td><td>${basePct("kia", 2025)}% + ${pct(fixedManwon("kia", 2025))}만원 + 53주</td></tr>
</tbody>
</table></div>
<p>숫자는 같아도 기아는 ${KIA26_PCT}%를 경영성과금과 품질향상 격려금으로 나눴고 주식 수가 다릅니다. 정률 부분은 월 기본급에 비례하고 정액은 모두에게 같으므로, 기본급이 낮을수록 정액이 차지하는 비중이 커집니다. 주식은 지급일 주가에 따라 가치가 달라집니다. 현대차는 이 밖에 복지포인트 50만원도 받습니다.</p>

<h2>LG 계열은 회사마다 따로 정합니다</h2>
<p>LG 계열사는 회사별 실적에 따라 성과급을 따로 정합니다. 2026년 초에 지급된 2025년 실적분을 보면 차이가 큽니다.</p>
<ul>
<li><strong>LG에너지솔루션</strong> — 기본급의 최대 ${LGES_25}%를 2026년 2월 6일 지급했습니다. 2024년 실적분 ${basePct("lgensol", 2024)}%보다는 늘었지만, 2022년 실적분 870~900%, 2023년 실적분 340~380%(보도)와 비교하면 크게 줄었습니다. 연도별 추이는 <a href="/guides/lgensol-wage-negotiation-2026">LG에너지솔루션 임금협상·성과급 정리</a>에 있습니다.</li>
<li><strong>LG디스플레이</strong> — 4년 만에 흑자로 돌아서면서 전 사업부에 기본급의 ${LGD_25}%를 지급했습니다(2026년 2월).</li>
<li><strong>LG전자</strong> — 성과급이 사업본부와 개인 고과에 따라 달라, 전사 공통 지급률로 보도된 값이 없습니다. 평균 급여(2025년 1억 1,700만원)와 직급별 초임은 <a href="/salary-db/lgelectronics">LG전자 연봉 정보</a>에서 볼 수 있습니다.</li>
</ul>

<h2>포스코는 사업회사와 지주사를 나눠 봐야 합니다</h2>
<p>사이트의 포스코 연봉 페이지는 상장사인 POSCO홀딩스(지주사, 직원 524명)의 공시를 씁니다. 2025년 사업보고서 평균 급여는 1억 4,700만원입니다. 포항·광양제철소를 운영하는 철강 사업회사 포스코는 별도 법인이므로, 두 회사의 급여와 성과급을 같은 것으로 보면 안 됩니다.</p>
<p>포스코 성과급으로 가장 최근에 구체적인 숫자가 나온 것은 2026년 4월 협력사 직원 직고용 로드맵입니다. 보도(국민일보·부산일보 2026-04-21)에 따르면 직고용 대상(S직군)에게 업적급(상여금) 400%를 매달 나눠 지급하고, 포스코가 영업이익 흑자를 내면 경영성과급을 최소 ${POSCO_S_MIN}% 지급하는 기준이 제시됐습니다. 기존 정규직의 연간 지급률로 공식 발표된 값은 아닙니다. 업황별로 가늠하려면 <a href="/calc/posco-bonus">포스코 성과급 계산기</a>를 쓰면 됩니다.</p>

<h2>성과급 세후 환산 — 연봉 8,000만원 기준</h2>
<p>회사가 달라도 세금 계산은 같습니다. 성과급은 연봉과 합쳐 근로소득으로 과세되고(소득세법 제20조), 지방소득세와 4대보험이 붙습니다. 아래는 연봉 8,000만원인 직원이 성과급을 받을 때 사이트 성과급 엔진(2026년 요율, 국민연금 기준소득월액 상한 반영)으로 계산한 값입니다. 본인 기본공제 외의 공제는 넣지 않았습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>성과급 세전</th><th>세금·보험료</th><th>세후</th><th>부담률</th></tr></thead>
<tbody>
${[10_000_000, 20_000_000, 30_000_000, 50_000_000].map(genNetRow).join("\n")}
</tbody>
</table></div>
<p>현대차 2026년 조건을 예로 들면, 월 기본급 500만원인 직원의 현금 성과급은 ${HY26_PCT}%인 ${manKo(5_000_000 * (HY26_PCT / 100))}에 정액 ${pct(HY26_FIX)}만원을 더한 ${manKo(HY_CASH)}입니다. 현대차 계산기처럼 연봉을 월 기본급의 18배(${manKo(5_000_000 * 18)})로 두면 세후는 약 ${manKo(HY_NET.net)}입니다(주식·복지포인트 제외). 표의 5,000만원 줄에서 부담률이 뛰는 것은 과세표준 일부가 35% 구간에 들어가기 때문이며, 35%는 그 구간에 들어간 금액에만 적용됩니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 현대차와 기아의 2026 성과급은 같은가요?</strong> — 정률 ${HY26_PCT}%와 정액 ${pct(HY26_FIX)}만원은 같습니다. 기아는 ${KIA26_PCT}%를 경영성과금 300%와 품질향상 격려금 100%로 나눴고, 주식은 현대차 15주, 기아 자사주 47주입니다.</li>
<li><strong>Q. 포스코 성과급 ${POSCO_S_MIN}%는 모든 직원 기준인가요?</strong> — 아닙니다. 2026년 4월 보도된 협력사 직고용(S직군) 처우 기준으로, 포스코가 영업이익 흑자를 낼 때 최소 ${POSCO_S_MIN}%를 지급한다는 조건입니다.</li>
<li><strong>Q. LG전자 성과급은 얼마인가요?</strong> — 사업본부와 개인 고과에 따라 달라 전사 공통 지급률로 확인된 값이 없습니다. 회사 발표나 사내 공지로 본인 사업본부 지급률을 확인해야 합니다.</li>
<li><strong>Q. 성과급이 많으면 세율이 35%로 뛰나요?</strong> — 누진세율은 과세표준 가운데 해당 구간에 들어간 부분에만 적용됩니다. 연봉 8,000만원에 성과급 5,000만원이면 과세표준 일부가 35% 구간에 걸리지만, 성과급 전체에 대한 세금·보험료 부담률은 약 ${GEN_5000.effectiveRate}%입니다.</li>
</ul>

<p class="text-sm">기준일: 2026-09-26. 회사별 성과급은 보도(현대차: 머니투데이·한국경제 2026-09-01, 기아: 헤럴드경제 2026-08-25·ZDNet 2026-08-28, LG에너지솔루션: 뉴스웨이 2026-02-04, LG디스플레이: 한국경제 2026-01-29, 포스코: 국민일보·부산일보 2026-04-21)로, 각 회사 계산기와 같은 데이터입니다. 평균 급여는 금융감독원 전자공시 사업보고서 기준입니다. 과세 구조는 <a href="https://www.law.go.kr/법령/소득세법/제20조">소득세법 제20조</a>, 세율은 <a href="https://www.law.go.kr/법령/소득세법/제55조">소득세법 제55조</a>와 <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2227&cntntsId=7667">국세청 종합소득세 세율</a>을 따랐습니다. 다른 회사는 <a href="/calc/bonus-calculators">회사별 성과급 계산기 모음</a>과 <a href="/insights/bonus-payout-history-2026">대기업 성과급 실지급률 리포트</a>에서 볼 수 있습니다.</p>
`;

// ── it-rsu-vs-cash-bonus-2026 (2026-09-30 키퍼 재작성, GUIDES-05·GUIDES-10 엔티티 형식) ──
// 회사 값은 회사 페이지·성과급 계산기 정본(seedCompanies disclosed · bonusData RSU)에서, 세금·보험료는
// 성과급 엔진(calcBonusNet, 2026 요율 명시)에서 끼운다. 사실 근거: docs/guides-facts-2026-10-G2C.md R-01~R-12.
const rsuDisclosed = (id: string) => seedCompanies.find((c) => c.id === id)?.disclosed;
const rsuPayout = (companyId: string) =>
  BONUS_PROFILES.find((p) => p.companyId === companyId)?.payouts.find((p) => p.scheme === "RSU");
export const RSU_ENTITIES = {
  naver: { disclosed: rsuDisclosed("naver"), rsu: rsuPayout("naver") },
  kakao: { disclosed: rsuDisclosed("kakao"), rsu: rsuPayout("kakao") },
} as const;
const rsuAvg = (d: { avgSalaryManwon: number } | undefined) => (d ? formatManwonKorean(d.avgSalaryManwon) : "공시 확인 중");
const rsuAmount = (p: { fixedAmountManwon?: number } | undefined) =>
  p?.fixedAmountManwon ? formatManwonKorean(p.fixedAmountManwon) : "공시 확인 중";
/** 네이버 평균은 10만원 단위로 내려 보인다 — 보도 반올림값 465억원 ÷ 1,683명(약 2,763만원)과 어긋나 보이지 않게 */
const rsuAmountApprox = (p: { fixedAmountManwon?: number } | undefined) =>
  p?.fixedAmountManwon ? `약 ${formatManwonKorean(Math.floor(p.fixedAmountManwon / 10) * 10)}` : "공시 확인 중";
/** 연봉 8,000만원인 사람이 3,000만원어치를 현금 성과급 또는 RSU로 받는 예시 */
export const RSU_EXAMPLE = { salary: 80_000_000, grant: 30_000_000 } as const;
/** 현금 성과급 — RSU를 회사가 급여(보수)로 신고하면 베스팅 때 부담도 같다 */
export const RSU_CASH_NET = calcBonusNet(RSU_EXAMPLE.salary, RSU_EXAMPLE.grant, 0, true, INSURANCE_RATES_2026);
/** 건강·고용보험을 매기지 않는 경우(보수에 넣지 않음) — 소득세·지방소득세만 */
export const RSU_NO_INSURANCE = calcBonusNet(RSU_EXAMPLE.salary, RSU_EXAMPLE.grant, 0, false, INSURANCE_RATES_2026);
const rsuScenarioRows = [-30, 0, 30]
  .map((pct) => {
    const value = (RSU_EXAMPLE.grant * (100 + pct)) / 100;
    const label = pct === 0 ? "그대로" : pct > 0 ? `${pct}% 상승` : `${-pct}% 하락`;
    return `<tr><td>${label}</td><td>${g2cMan(value)}</td><td>${g2cMan(RSU_CASH_NET.totalDeductions)}</td><td>${g2cMan(value - RSU_CASH_NET.totalDeductions)}</td><td>${g2cMan(RSU_CASH_NET.net)}</td></tr>`;
  })
  .join("\n");

const itRsuVsCash = `
<p class="lead">RSU(양도제한조건부주식)는 주식을 받는 날의 시가가 그대로 근로소득이 되므로, 같은 금액이면 현금 성과급과 소득세가 같습니다(국세청 서면-2023-원천-0341). 연봉 8,000만원인 사람이 3,000만원어치를 더 받으면 추가 세금·보험료는 약 ${g2cMan(RSU_CASH_NET.totalDeductions)}이고, 차이는 받은 뒤의 주가와 매도 세금에서 생깁니다. 네이버·카카오처럼 국내 상장주식은 소액주주가 증권시장에서 팔면 양도소득세가 없고, 쿠팡처럼 미국 상장주식은 차익에 지방소득세를 포함해 22%가 붙습니다(기준일 2026년 9월 30일).</p>

<h2>네이버·카카오·쿠팡 RSU는 무엇이 다른가요</h2>
<p>세 회사 모두 주식 보상을 주지만, 주식이 어디에 상장돼 있느냐에 따라 팔 때의 세금이 갈립니다. 아래 값은 회사 연봉 페이지와 성과급 계산기가 쓰는 공시·보도 자료 그대로이며, 개인별 부여 금액은 직급·평가에 따라 크게 다릅니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>회사</th><th>주식이 상장된 곳</th><th>팔 때 양도소득세(소액주주)</th><th>공시·보도로 확인된 값</th></tr></thead>
<tbody>
<tr><td><a href="/salary-db/naver">네이버</a></td><td>국내 증권시장</td><td>장내 매도는 과세 대상 아님</td><td>${RSU_ENTITIES.naver.rsu?.year ?? ""}년 자사주 465억원(약 22만주)을 1,683명에게 RSU로 지급, 단순 평균 ${rsuAmountApprox(RSU_ENTITIES.naver.rsu)}(임원·핵심 인재 집중). ${RSU_ENTITIES.naver.disclosed?.fiscalYear ?? ""} 사업연도 직원 평균 급여 ${rsuAvg(RSU_ENTITIES.naver.disclosed)}</td></tr>
<tr><td><a href="/salary-db/kakao">카카오</a></td><td>국내 증권시장</td><td>장내 매도는 과세 대상 아님</td><td>${RSU_ENTITIES.kakao.rsu?.year ?? ""}년 1인 평균 RSU 가치 약 ${rsuAmount(RSU_ENTITIES.kakao.rsu)}(자사주 처분 공시 기반 평균). ${RSU_ENTITIES.kakao.disclosed?.fiscalYear ?? ""} 사업연도 직원 평균 급여 ${rsuAvg(RSU_ENTITIES.kakao.disclosed)}</td></tr>
<tr><td><a href="/salary-db/coupang">쿠팡</a></td><td>미국 뉴욕증권거래소(쿠팡 Inc., CPNG)</td><td>국외 주식 — 차익의 20%, 지방소득세 포함 22%</td><td>RSU는 보통 2~4년에 걸쳐 나눠 확정되며 각 확정일에 재직해야 함(쿠팡 Inc. 2025 사업연도 Form 10-K)</td></tr>
</tbody></table></div>
<p>네이버의 공시 평균 급여는 스톡옵션 행사차익을 포함한 값이고, 빼면 1억 4,300만원입니다. 주식 보상이 근로소득으로 잡혀 평균 급여를 끌어올린다는 뜻입니다. 회사별 성과급 구조는 <a href="/calc/naver-bonus">네이버 성과급 계산기</a>와 <a href="/calc/kakao-bonus">카카오 성과급 계산기</a>에서 볼 수 있습니다.</p>

<h2>RSU를 받을 때 세금은 어떻게 매기나요</h2>
<p>국세청은 외국 모회사에서 급여 일부를 RSU로 받은 것을 근로소득으로 보고, 수입 시기는 주식을 받은 날, 금액은 그날의 시가로 계산한다고 회신했습니다(서면-2023-원천-0341). 국내 회사가 임직원에게 주는 RSU도 회사 쪽에서는 인건비(상여금)로 봅니다(서면-2025-법규법인-1886). 따라서 베스팅돼 주식이 계좌에 들어오는 날, 그 가치가 그해 연봉·성과급과 합쳐져 누진세율로 과세됩니다.</p>
<ul>
<li><strong>국내 회사 RSU</strong> — 회사가 급여와 합쳐 원천징수하고 연말정산에서 정산합니다. 주식으로 받았어도 세금은 현금으로 내야 하므로, 회사마다 급여에서 떼거나 일부 주식을 팔게 하는 등 방식이 다릅니다.</li>
<li><strong>외국 모회사 RSU</strong> — 국내 회사가 원천징수하지 않았다면 이듬해 5월 종합소득세 확정신고에 넣어야 하고, 빠뜨리면 가산세가 붙을 수 있습니다. 외국에서 이미 떼인 세금이 있으면 외국납부세액공제를 받을 수 있습니다(서면-2021-국제세원-0806).</li>
<li><strong>근무 기간을 못 채워 부여가 취소되면</strong> — 이미 원천징수한 금액은 회사가 신고를 고쳐 바로잡을 수 있습니다(서면-2025-원천-3476).</li>
</ul>
<p>세금은 받는 날 가치로 정해지고, 그 뒤 주가가 떨어져도 이미 확정된 근로소득세는 줄지 않습니다. RSU를 성과급과 같은 해에 받으면 두 금액이 합쳐져 높은 세율 구간으로 올라갈 수 있으니 <a href="/tools/finance/bonus">성과급 세금 계산기</a>에 합계 금액을 넣어 보세요.</p>

<h2>같은 3,000만원이면 현금과 RSU 중 무엇이 남나요</h2>
<p>연봉 8,000만원인 사람이 3,000만원을 받는 경우를 사이트 성과급 엔진(2026년 요율)으로 계산하면, 현금 성과급의 추가 부담은 소득세 ${g2cMan(RSU_CASH_NET.incomeTaxDelta)}, 지방소득세 ${g2cMan(RSU_CASH_NET.localTaxDelta)}, 건강·장기요양보험 ${g2cMan(RSU_CASH_NET.healthDelta)}, 고용보험 ${g2cMan(RSU_CASH_NET.empInsDelta)}이고 세후 ${g2cMan(RSU_CASH_NET.net)}이 남습니다. 이 연봉은 이미 국민연금 기준소득월액 상한을 넘는 수준이라 연금보험료는 더 붙지 않습니다. RSU를 회사가 급여로 신고하면 받는 날의 부담은 이와 같습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>1년 뒤 주가</th><th>보유 주식 가치</th><th>받을 때 낸 세금·보험료</th><th>실제로 남는 가치</th><th>같은 금액 현금 성과급 세후</th></tr></thead>
<tbody>
${rsuScenarioRows}
</tbody></table></div>
<p>세금을 급여에서 따로 냈고 주식은 그대로 들고 있다고 가정했습니다. 주가가 30% 떨어지면 현금으로 받은 경우보다 ${g2cMan((RSU_EXAMPLE.grant * 30) / 100)} 적게 남고, 30% 오르면 그만큼 많이 남습니다. 국내 상장주식은 오른 부분에 양도소득세가 없지만, 해외 상장주식은 오른 부분에 양도소득세가 따로 붙습니다. 회사가 RSU를 건강보험 보수로 신고하지 않으면 받을 때 부담은 소득세·지방소득세 약 ${g2cMan(RSU_NO_INSURANCE.totalDeductions)}으로 줄지만, 급여 외 소득이 연 2,000만원을 넘으면 보수 외 소득월액보험료가 따로 매겨질 수 있습니다(국민건강보험법 제71조).</p>

<h2>팔 때 세금은 국내 상장과 해외 상장이 어떻게 다른가요</h2>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>구분</th><th>국내 상장주식(대주주 아님·장내 매도)</th><th>해외 상장주식</th></tr></thead>
<tbody>
<tr><td>양도소득세</td><td>과세 대상 아님(소득세법 제94조) — 증권거래세는 붙음</td><td>양도차익의 20%, 지방소득세 2% 더해 22%(소득세법 제104조·지방세법 제103조의3)</td></tr>
<tr><td>기본공제</td><td>해당 없음</td><td>국내외 과세 대상 주식 양도소득을 합쳐 연 250만원(소득세법 제103조)</td></tr>
<tr><td>손실이 났을 때</td><td>과세 대상이 아니라 공제도 없음</td><td>같은 해 다른 과세 대상 주식의 양도차익과만 합산하고, 남은 손실을 다음 해로 넘기지 못함(소득세법 제102조)</td></tr>
<tr><td>신고</td><td>없음</td><td>판 해의 다음 해 5월 양도소득세 확정신고</td></tr>
</tbody></table></div>
<p>해외 주식의 양도차익은 파는 가격에서 취득가액과 필요경비를 빼서 구합니다. RSU로 받은 주식은 취득가액을 어떻게 잡느냐에 따라 차익이 달라지므로, 확정일·주식 수·그날 시가·환율·원천징수 내역이 적힌 증권사 자료와 원천징수영수증을 보관해 신고 근거로 씁니다. 판단이 어려우면 신고 전에 국세청 상담이나 세무 전문가에게 확인하세요. 매도 금액을 넣어 보려면 <a href="/tools/finance/stock-tax">주식 양도세 계산기</a>를 쓰세요.</p>

<h2>RSU를 받기 전에 무엇을 확인해야 하나요</h2>
<ul>
<li><strong>확정 일정과 재직 조건</strong> — 몇 년에 걸쳐 몇 번 확정되는지, 퇴사하면 남은 주식이 어떻게 되는지 부여 계약서를 확인합니다.</li>
<li><strong>세금 내는 방식</strong> — 급여 원천징수인지, 주식 일부 매도인지, 본인이 5월에 신고해야 하는지 확인합니다. 외국 모회사 RSU라면 원천징수영수증에 포함됐는지부터 봅니다.</li>
<li><strong>같은 해 다른 소득</strong> — 현금 성과급·스톡옵션 행사이익과 확정일이 겹치면 한 해 근로소득이 크게 늘어납니다. <a href="/income-tax-2026">종합소득세 계산기</a>로 세율 구간을 먼저 봅니다.</li>
<li><strong>건강보험</strong> — 회사가 RSU를 보수로 신고하는지, 보수 외 소득으로 잡히는지에 따라 건강보험료가 달라집니다.</li>
<li><strong>팔 계획</strong> — 해외 상장주식은 같은 해 이익과 손실만 합쳐지므로, 이익이 난 해에 손실 종목을 정리하면 세금이 줄 수 있습니다.</li>
</ul>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. RSU는 받을 때 세금이 없고 팔 때만 내나요?</strong> — 아닙니다. 주식을 받는 날의 시가가 근로소득으로 과세됩니다. 팔 때의 양도소득세는 그 뒤 오른 부분에 대한 별도의 세금입니다.</li>
<li><strong>Q. 주가가 떨어지면 이미 낸 근로소득세를 돌려받을 수 있나요?</strong> — 받는 날 시가로 정해진 근로소득세는 그대로입니다. 해외 상장주식이라면 판 손실을 같은 해 다른 과세 대상 주식의 이익과 합산할 수 있을 뿐입니다.</li>
<li><strong>Q. 네이버·카카오 RSU를 팔면 양도소득세를 내나요?</strong> — 대주주가 아니고 증권시장에서 판다면 양도소득세 과세 대상이 아닙니다. 매도 대금에는 증권거래세가 붙고, 두 회사처럼 유가증권시장 상장주식이면 양도가액의 0.15%인 농어촌특별세도 함께 붙습니다(농어촌특별세법 제5조).</li>
<li><strong>Q. 쿠팡 RSU 세금은 누가 신고하나요?</strong> — 받을 때의 근로소득은 회사 원천징수 여부를 먼저 확인하고, 빠졌다면 이듬해 5월 종합소득세 신고에 넣습니다. 판 뒤의 양도소득세는 본인이 다음 해 5월에 확정신고합니다.</li>
</ul>

<p>근거: <a href="https://taxlaw.nts.go.kr/qt/USEQTA002P.do?ntstDcmId=200000000000010691">국세청 서면-2023-원천-0341</a> · <a href="https://taxlaw.nts.go.kr/qt/USEQTA002P.do?ntstDcmId=200000000000022618">서면-2025-법규법인-1886</a> · <a href="https://www.law.go.kr/법령/소득세법/제94조">소득세법 제94조</a> · <a href="https://www.law.go.kr/법령/소득세법/제104조">소득세법 제104조</a> · <a href="https://www.law.go.kr/법령/소득세법/제103조">소득세법 제103조</a> · <a href="https://www.sec.gov/Archives/edgar/data/1834584/000183458426000024/cpng-20251231.htm">쿠팡 Inc. Form 10-K</a>. 기준일: 2026년 9월 30일. 회사 값은 공시·보도 기준이며 세금 계산은 사이트 성과급 엔진의 가정(본인 공제만 반영)을 따릅니다.</p>
<p>함께 보기: <a href="/guides/naver-rsu-tax-strategy-2026">네이버 RSU 세금</a> · <a href="/guides/kakao-rsu-tax-saving-2026">카카오 RSU 세금</a> · <a href="/guides/foreign-bonus-structure-2026">외국계 보너스 구조</a> · <a href="/calc/bonus-calculators">회사별 성과급 계산기 모음</a></p>
`;

const foreignBonus = `
<p class="lead">외국계 기업(구글·아마존·메타·마이크로소프트 한국지사) 보너스는 일반적으로 기본급 15~30% + RSU(매년 부여, 4년 베스팅). 한국 법인이 지급하는 RSU는 한국 근로소득세 적용. 외국 법인 직접 지급 시 별도 신고 의무.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 외국계 보상 구조</h2>
<ul class="space-y-3 mt-4">
<li><strong>구글 한국지사</strong>: 기본급 + 사인온 + 매년 RSU (Alphabet 주식)</li>
<li><strong>아마존 한국</strong>: 기본급 + Sign-on 분할(첫 2년) + RSU (4년 비균등)</li>
<li><strong>메타·MS</strong>: 기본급 + RSU + 분기 성과 보너스</li>
<li><strong>맥킨지·BCG·베인</strong>: 기본급 + 연말 보너스 30~50%</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 외국 법인 직접 지급 시 신고 의무</h2>
<p>외국 모회사가 한국 직원에게 직접 RSU·옵션 지급 시 한국 세무서에 본인이 직접 신고해야 함. 미신고 시 가산세 + 외국 자산 미신고 죄. 매년 5월 종소세 신고와 함께 처리.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li></ul></div>
`;

const yearEndEncouragement = `
<p class="lead">연말 격려금·포상금은 회사 재량 지급으로 정기상여와 다름. 통상임금 미포함 → 퇴직금·연차수당 영향 X. 단 근로소득으로 과세되며 한 번에 큰 금액 받으면 한계세율 점프 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 격려금 vs 정기상여</h2>
<ul class="space-y-2 mt-4">
<li>· 정기상여: 통상임금 포함 → 퇴직금·연차수당 증가</li>
<li>· 격려금: 통상임금 미포함 → 퇴직금 영향 0</li>
<li>· 둘 다 근로소득세 부과</li>
<li>· 격려금이 정기적·일률적이면 임금성 인정 (법원 판례)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 절세 — 12월 격려금 1,000만원</h2>
<p>연봉 6,000만원 + 12월 격려금 1,000만원:</p>
<ul class="space-y-2 mt-4">
<li>· 12월 합산: 1,500만원 → 한계세율 35% 점프</li>
<li>· 격려금 1,000만원 × 35% = 350만원 + 지방세 35만 = 385만원</li>
<li>· 11월에 IRP 900만원 만기 납입 → 약 142만원 환급으로 부담 완화</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li></ul></div>
`;

const signOnBonus = `
<p class="lead">사인온 보너스(Signing Bonus)는 입사 시 받는 일회성 보너스. 통상 1~2년 의무 근속 조건 → 조기 퇴직 시 환수. 한 번에 큰 금액이라 한계세율 점프 + 4대보험 상한 초과로 실수령액 약 50~60% 수준.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 사인온 일반 구조</h2>
<ul class="space-y-2 mt-4">
<li>· 금액: 기본급의 50~200% (대기업·외국계)</li>
<li>· 의무 근속: 1~3년</li>
<li>· 환수 조건: 의무 근속 위반 시 100% 또는 분할 환수</li>
<li>· 지급 시기: 입사일·3개월 후·1년 후 분할 일반적</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 사인온 5,000만원 일시 지급</h2>
<ul class="space-y-2 mt-4">
<li>· 한계세율 35%(연봉 약 1억 이상 가정): 약 1,750만원 세금</li>
<li>· 4대보험 약 200만원</li>
<li>· 지방세 175만원</li>
<li>· <strong>실수령 약 2,875만원</strong> (약 57.5%)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 분할 지급 협상</h2>
<p>5,000만원을 2년 분할(각 2,500만원) 시 한계세율 24% 유지 → 약 600만원 절감.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li></ul></div>
`;

const retentionBonus = `
<p class="lead">리텐션 보너스(장기 근속·잔존 보너스)는 특정 기간 근속 시 지급되는 보너스. 통상 M&A·구조조정 후 핵심 인재 유지 목적. 3~5년 후 일시 지급되며 한 번에 큰 금액으로 세금 부담 큼.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 리텐션 보너스 유형</h2>
<ul class="space-y-3 mt-4">
<li><strong>M&A 후 인재 유지</strong>: 합병 직후 핵심 인력 2~3년 잔존 보너스</li>
<li><strong>구조조정 핵심 인재</strong>: 구조조정 중 떠나지 말라는 의미</li>
<li><strong>키맨 보너스</strong>: 임원·중요 직책자 일정 기간 잔존</li>
<li><strong>스타트업 시리즈 라운드</strong>: 시리즈 B·C 후 핵심 인재</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 절세 — 3년 분할 권장</h2>
<p>3년 후 1억 일시 지급 vs 매년 3,300만 분할:</p>
<ul class="space-y-2 mt-4">
<li>· 일시: 한계세율 38% → 약 3,800만원 세금</li>
<li>· 분할: 한계세율 24~35% → 약 2,500만원 세금</li>
<li>· <strong>차이 1,300만원</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li></ul></div>
`;

const executiveBonusLimit = `
<p class="lead">비상장 회사 임원 성과급은 한도 있음. 정관·임원보수 규정 명시 + 주주총회 승인. 한도 초과분은 손금 불산입 → 법인세 추가 부담 + 임원 근로소득세 그대로. 회사·임원 모두 손해.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 비상장 임원 성과급 한도</h2>
<ul class="space-y-2 mt-4">
<li>· 정관 또는 주주총회 결의로 한도 설정</li>
<li>· 일반적으로 기본급의 100~300%</li>
<li>· 한도 초과분: 손금 불산입 → 법인세 24% 추가</li>
<li>· 임원 본인은 근로소득세 정상 부과</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 한도 5억 / 실 지급 8억</h2>
<ul class="space-y-2 mt-4">
<li>· 한도 내 5억: 법인 손금 인정, 임원 근로소득</li>
<li>· 한도 초과 3억: 법인 손금 불산입 → 법인세 7,200만 추가</li>
<li>· 임원: 8억 전체에 근로소득세 + 4대보험</li>
<li>· <strong>회사·임원 모두 손해 → 한도 내 운용 필수</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/severance" class="text-primary underline">퇴직금 계산</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 영역 B — 성과급 소득세 (10편)
// ═══════════════════════════════════════════════════════════════

const bonusBracketJump = `
<p class="lead">성과급 받으면 한계세율이 한 단계 점프하는 경우가 흔함. 연봉 7천만원 + 성과급 5천만 → 합산 1.2억 → 한계세율 24% → 35%로 +11%p. 성과급 1억당 한계세율 차이로 약 1,100만원 추가 세금 부담.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 2026 8단계 한계세율</h2>
<ul class="space-y-1 mt-4 text-sm">
<li>· 1,400만 이하: 6%</li>
<li>· 1,400~5,000만: 15%</li>
<li>· 5,000~8,800만: 24%</li>
<li>· 8,800만~1.5억: <strong>35%</strong></li>
<li>· 1.5억~3억: 38%</li>
<li>· 3억~5억: 40%</li>
<li>· 5억~10억: 42%</li>
<li>· 10억 초과: 45%</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 한계세율 점프 시뮬</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">연봉</th><th class="p-3">+성과급</th><th class="p-3">한계세율</th><th class="p-3">추가 세금</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">5,000</td><td class="p-3">+3,000</td><td class="p-3">15% → 24%</td><td class="p-3">720만</td></tr>
<tr class="border-t"><td class="p-3">7,000</td><td class="p-3">+5,000</td><td class="p-3">24% → 35%</td><td class="p-3">1,750만</td></tr>
<tr class="border-t"><td class="p-3">1억</td><td class="p-3">+5,000</td><td class="p-3">35% → 38%</td><td class="p-3">1,900만</td></tr>
<tr class="border-t"><td class="p-3">1.2억</td><td class="p-3">+1억</td><td class="p-3">35% → 38%</td><td class="p-3">3,800만</td></tr>
</tbody></table></div>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li></ul></div>
`;

const bonus1euk = `
<p class="lead">2026년 기준으로 연봉 7,000만원인 직장인이 성과급 1억원을 받으면, 성과급 때문에 늘어나는 소득세·지방소득세·4대보험 <strong>약 ${manwon(EOK_MAIN.totalDeductions)}</strong>을 빼고 <strong>세후 약 ${manwon(EOK_MAIN.net)}(${ratio(EOK_MAIN.net, EOK_MAIN.gross)})</strong>이 남습니다. 빠지는 돈의 대부분은 세금(약 ${manwon(EOK_MAIN.incomeTaxDelta + EOK_MAIN.localTaxDelta)})이고, 원래 연봉이 높을수록 같은 1억에서 남는 몫이 줄어듭니다. 숫자는 머니샐러리 성과급 엔진에 2026년 세율·보험료율을 넣어 계산했으며 본인 1명 기본공제와 4대보험료 공제만 반영했습니다. 기준일 2026-09-26.</p>

<h2>연봉별로 보면 성과급 1억에서 얼마가 남나요</h2>
<p>성과급은 따로 떼어 과세하지 않습니다. 상여는 근로소득이라 그해 연봉에 더해진 뒤 6~45% 기본세율로 1년치 세금을 다시 계산합니다(소득세법 제20조·제55조). 그래서 같은 1억원이라도 원래 연봉이 높은 사람일수록 더 높은 세율 구간에서 과세되고, 손에 남는 금액이 줄어듭니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>연봉</th><th>소득세+지방소득세</th><th>4대보험</th><th>세후 성과급</th><th>남는 비율</th></tr></thead>
<tbody>
${EOK_BY_SALARY.map(({ salary, r }) => `<tr><td>${manwon(salary)}</td><td>${won(r.incomeTaxDelta + r.localTaxDelta)}원</td><td>${won(r.pensionDelta + r.healthDelta + r.empInsDelta)}원</td><td><strong>${won(r.net)}원</strong></td><td>${ratio(r.net, r.gross)}</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>연봉 5,000만원이면 약 ${manwon(EOK_BY_SALARY[0].r.net)}, 1억5,000만원이면 약 ${manwon(EOK_BY_SALARY[3].r.net)}이 남아 같은 성과급에서 약 ${manwon(EOK_BY_SALARY[0].r.net - EOK_BY_SALARY[3].r.net)} 차이가 납니다. 국민연금은 기준소득월액 상한(월 ${PENSION_LABEL.max}, 연 ${PENSION_LABEL.maxAnnual})에 이미 닿은 연봉이면 성과급을 받아도 더 늘지 않아 4대보험 합계는 줄어들지만, 세금 증가폭이 훨씬 커서 세후 금액은 계속 줄어듭니다.</p>

<h2>연봉 7,000만원 + 성과급 1억, 무엇이 얼마나 빠지나</h2>
<p>소득세는 '연봉만 받았을 때의 연간 결정세액'과 '성과급까지 합친 연간 결정세액'의 차이로 계산합니다. 연말정산에서 실제로 확정되는 방식과 같습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>항목</th><th>금액</th><th>계산 근거</th></tr></thead>
<tbody>
<tr><td>소득세 증가분</td><td>${won(EOK_MAIN.incomeTaxDelta)}원</td><td>연간 결정세액 ${won(EOK_SALARY_ONLY.decidedTax)}원 → ${won(EOK_WITH_BONUS.decidedTax)}원</td></tr>
<tr><td>지방소득세</td><td>${won(EOK_MAIN.localTaxDelta)}원</td><td>소득세 증가분의 ${RATE_LABEL.local}</td></tr>
<tr><td>국민연금</td><td>${won(EOK_MAIN.pensionDelta)}원</td><td>연 상한 ${PENSION_LABEL.maxAnnual}까지 남은 ${manwon(PENSION_BASE_2026.MAX_ANNUAL - 70_000_000)} × ${RATE_LABEL.pension}</td></tr>
<tr><td>건강보험·장기요양</td><td>${won(EOK_MAIN.healthDelta)}원</td><td>1억 × ${RATE_LABEL.health} × (1 + ${RATE_LABEL.ltcRatio})</td></tr>
<tr><td>고용보험</td><td>${won(EOK_MAIN.empInsDelta)}원</td><td>1억 × ${RATE_LABEL.employment}</td></tr>
<tr><td><strong>합계</strong></td><td><strong>${won(EOK_MAIN.totalDeductions)}원</strong></td><td>성과급의 ${ratio(EOK_MAIN.totalDeductions, EOK_MAIN.gross)}</td></tr>
<tr><td><strong>세후 성과급</strong></td><td><strong>${won(EOK_MAIN.net)}원</strong></td><td>1억 − 합계</td></tr>
</tbody>
</table></div>
<p>연봉만 받을 때 과세표준은 약 ${manwon(EOK_SALARY_ONLY.taxBase)}으로 ${bracketRateOf(EOK_SALARY_ONLY.taxBase)} 구간입니다. 성과급까지 더한 총급여 1억7,000만원에서는 근로소득공제 ${manwon(EOK_WITH_BONUS.earnedDeduction)}(소득세법 제47조)과 본인 기본공제 150만원, 연금·건강·고용보험료 공제를 빼도 과세표준이 약 ${manwon(EOK_WITH_BONUS.taxBase)}이 되어 ${bracketRateOf(EOK_WITH_BONUS.taxBase)} 구간(8,800만원 초과 1억5,000만원 이하)에 들어갑니다. 즉 성과급 1억은 15%·24%·35% 구간에 나뉘어 과세됩니다.</p>
<p>여기에 근로소득세액공제 한도가 총급여 7,000만원일 때 ${manwon(EOK_SALARY_ONLY.creditLimit)}에서 1억7,000만원일 때 ${manwon(EOK_WITH_BONUS.creditLimit)}으로 줄어드는 몫(소득세법 제59조 제2항)이 더해져, 소득세가 약 ${manwon(EOK_MAIN.incomeTaxDelta)} 늘어납니다. 성과급 1억의 세금 부담률이 35%보다 낮은 것은 성과급 일부가 아래 구간에서 과세되기 때문입니다.</p>

<h2>성과급 받은 달과 이듬해, 돈이 빠지는 순서</h2>
<p>위 합계가 한 번에 빠지는 것은 아닙니다. 세금과 보험료마다 확정되는 시점이 다릅니다.</p>
<ul>
<li><strong>지급하는 달 — 소득세 원천징수</strong>: 회사는 성과급을 지급대상기간(정해져 있지 않으면 그해 1월부터 지급한 달까지)의 월수로 나눠 월 급여에 더한 뒤 간이세액표로 세액을 구해 떼어 갑니다(소득세법 제136조). 미리 걷는 금액이라 최종 세액과 다를 수 있습니다.</li>
<li><strong>이듬해 2월 — 근로소득 연말정산</strong>: 1년치 총급여로 결정세액을 다시 계산해 이미 뗀 세금과의 차액을 돌려주거나 더 걷습니다(소득세법 제137조). 위 표의 소득세는 이 결정세액 기준입니다.</li>
<li><strong>이듬해 4월 — 건강보험료 정산</strong>: 매달 건강보험료는 전년도 보수총액으로 정한 보수월액(4월부터 이듬해 3월까지 적용)에 매기고, 그해 보수총액이 확정되면 다시 계산해 정산합니다(국민건강보험법 시행령 제34조·제39조). 회사가 3월 10일까지 보수총액을 통보하면 성과급분 보험료가 4월분 보험료에 반영되는 것이 일반적입니다. 추가로 낼 근로자 몫이 그달 보험료 이상이면 회사 신청으로 12회 이내로 나눠 낼 수 있습니다.</li>
<li><strong>이듬해 7월 — 국민연금 기준소득월액 재결정</strong>: 국민연금은 전년도 소득으로 그해 7월부터 이듬해 6월까지 쓸 기준소득월액을 다시 정합니다(국민연금공단 안내). 성과급으로 늘어난 소득은 이때 반영되지만 월 ${PENSION_LABEL.max} 상한을 넘지 못합니다. 위 표는 이 금액을 성과급을 받은 해의 부담으로 묶어 보여 줍니다.</li>
</ul>

<h2>실수령을 늘리는 방법과 성과급 때문에 줄어드는 공제</h2>
<p>세율 자체는 바꿀 수 없지만, 세액공제는 늘릴 수 있습니다. 가장 확실한 것은 연금계좌입니다. IRP와 연금저축을 합쳐 연 ${IRP_FULL_CREDIT_HIGH.cap}까지 납입하면 총급여 5,500만원 초과자는 지방소득세를 포함해 ${IRP_FULL_CREDIT_HIGH.rateWithLocal}, 즉 최대 ${won(IRP_FULL_CREDIT_HIGH.amount)}원을 돌려받습니다(소득세법 제59조의3). 그해 12월 31일까지 납입한 금액만 그해 공제 대상이고, 연금계좌는 노후 연금을 위한 계좌라 중도 인출에 제약과 세금이 따른다는 점은 감안해야 합니다.</p>
<p>반대로 성과급으로 총급여가 문턱을 넘으면 받던 공제가 줄거나 사라집니다. 성과급 1억을 받는 해에는 아래 항목을 먼저 확인하세요.</p>
<ul>
<li><strong>신용카드 등 소득공제</strong>: 사용액이 총급여의 25%를 넘어야 공제가 시작되므로 성과급 1억이면 문턱이 2,500만원 올라갑니다. 총급여 7,000만원을 넘으면 기본 한도가 300만원에서 250만원으로(자녀가 있으면 350만·400만원에서 275만·300만원으로) 줄고, 도서·공연·영화 등 문화체육 사용분 30% 공제도 빠집니다(조세특례제한법 제126조의2).</li>
<li><strong>주택청약종합저축 소득공제</strong>: 무주택 세대주 등이 대상이며 총급여 7,000만원 이하일 때만 받습니다(조세특례제한법 제87조).</li>
<li><strong>연금계좌 세액공제율</strong>: 총급여 5,500만원 이하는 15%, 넘으면 12%입니다(지방소득세 별도).</li>
<li><strong>월세 세액공제</strong>: 총급여 8,000만원을 넘는 해에는 대상에서 빠집니다(조세특례제한법 제95조의2).</li>
</ul>
<p>같은 해 안에서 성과급을 두세 번에 나눠 받는 것은 연간 총급여가 같아 결정세액도 같습니다. 달라지는 것은 달마다 떼는 원천징수액과 연말정산 환급·추가납부의 크기뿐입니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 성과급은 따로 떼어 분리과세하나요?</strong> — 아닙니다. 성과급·상여는 근로소득이라(소득세법 제20조) 그해 연봉과 합산해 6~45% 기본세율로 계산합니다. 인센티브·격려금처럼 이름이 달라도 근로의 대가로 받은 돈이면 같습니다.</li>
<li><strong>Q. 성과급 받은 달에 세금이 너무 많이 떼였는데 돌려받나요?</strong> — 지급 달 원천징수는 간이세액표로 미리 걷는 금액입니다(소득세법 제136조). 이듬해 2월 연말정산에서 1년치 결정세액과 비교해 더 뗀 만큼 환급되고, 덜 뗐다면 추가로 냅니다.</li>
<li><strong>Q. 1억을 두 번에 나눠 받으면 세금이 줄어드나요?</strong> — 같은 해에 나눠 받으면 줄지 않습니다. 해를 넘겨 다음 해 소득으로 잡히면 두 해의 총급여가 각각 달라져 세액이 달라질 수 있습니다. 어느 해 소득이 되는지는 지급·확정 시점에 따라 정해지므로 회사 급여 담당에게 확인하는 것이 정확합니다.</li>
<li><strong>Q. 건강보험료는 성과급 받을 때 바로 떼나요?</strong> — 보통은 아닙니다. 성과급분은 이듬해 4월 건강보험료 정산에 반영되는 경우가 많고, 성과급 1억이면 근로자 몫 건강보험·장기요양보험료는 약 ${manwon(EOK_MAIN.healthDelta)}입니다. 그달 보험료 이상이면 12회 이내 분할 납부를 신청할 수 있습니다.</li>
</ul>

<p>내 연봉으로 바로 계산하려면 <a href="/tools/finance/bonus">성과급 세금 계산기</a>에 연봉과 성과급을 넣어 보세요. 회사별 지급률로 성과급부터 구하려면 <a href="/calc/bonus-calculators">회사별 성과급 계산기 모음</a>, 5,000만원 사례는 <a href="/guides/bonus-5000-net-payment-2026">성과급 5,000만원 실수령</a>, 세율 구간은 <a href="/guides/income-tax-8-step-bracket-2026">소득세 세율 8단계</a>, 건강보험료 정산은 <a href="/guides/bonus-health-4-percent-2026">성과급 건강보험료</a>에서 이어서 볼 수 있습니다. 연말정산 전체 환급액은 <a href="/year-end-tax">연말정산 계산기</a>로 확인하세요.</p>
<p>계산 가정: 2026년 세율·보험료율, 본인 1명 기본공제와 연금·건강·장기요양·고용보험료 공제만 반영했습니다. 부양가족·신용카드·의료비 등 공제가 있으면 과세표준이 낮아져 성과급 몫 세금이 이보다 줄 수 있고, 비과세 수당은 총급여에서 빠집니다.</p>
<p>근거: <a href="https://www.law.go.kr/법령/소득세법/제55조">소득세법 제55조(세율)</a> · <a href="https://www.law.go.kr/법령/소득세법/제136조">소득세법 제136조(상여 원천징수)</a> · <a href="https://www.law.go.kr/법령/국민건강보험법시행령/제39조">국민건강보험법 시행령 제39조(정산·분할납부)</a> · <a href="https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0038M0.do">국민연금공단 기준소득월액 상·하한</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2227&amp;cntntsId=7667">국세청 종합소득세 세율</a>. 기준일 2026-09-26(법령·고시 확인), 2026년 귀속 세율과 2026년 보험료율 기준입니다.</p>
`;

const bonus5000 = `
<p class="lead">2026년 기준으로 연봉 6,000만원인 직장인이 성과급 5,000만원을 받으면 소득세·지방소득세·4대보험으로 <strong>총 부담 약 ${manwon(FIVE_MAIN.totalDeductions)}</strong>이 빠지고 <strong>실수령 약 ${manwon(FIVE_MAIN.net)}(${ratio(FIVE_MAIN.net, FIVE_MAIN.gross)})</strong>이 남습니다. 총급여는 1억1,000만원이 되지만 과세표준은 약 ${manwon(FIVE_WITH_BONUS.taxBase)}이라 세율 구간은 35%가 아니라 ${bracketRateOf(FIVE_WITH_BONUS.taxBase)}입니다. IRP·연금저축에 연 ${IRP_FULL_CREDIT_HIGH.cap}을 채우면 연말정산에서 최대 약 ${manwon(IRP_FULL_CREDIT_HIGH.amount)}을 더 돌려받습니다. 기준일 2026-09-26.</p>

<h2>연봉별 성과급 5,000만원 세후 금액</h2>
<p>성과급은 근로소득이라 그해 연봉과 합쳐 1년치 세금을 다시 계산합니다(소득세법 제20조·제55조). 아래 표는 머니샐러리 성과급 엔진에 2026년 세율·보험료율을 넣어, 연봉만 받을 때와 성과급까지 받을 때의 차이를 성과급 몫으로 계산한 값입니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>연봉</th><th>소득세+지방소득세</th><th>4대보험</th><th>세후 성과급</th><th>남는 비율</th></tr></thead>
<tbody>
${FIVE_BY_SALARY.map(({ salary, r }) => `<tr><td>${manwon(salary)}</td><td>${won(r.incomeTaxDelta + r.localTaxDelta)}원</td><td>${won(r.pensionDelta + r.healthDelta + r.empInsDelta)}원</td><td><strong>${won(r.net)}원</strong></td><td>${ratio(r.net, r.gross)}</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>연봉 4,000만원이면 약 ${manwon(FIVE_BY_SALARY[0].r.net)}, 연봉 1억원이면 약 ${manwon(FIVE_BY_SALARY[3].r.net)}이 남아 같은 5,000만원에서 약 ${manwon(FIVE_BY_SALARY[0].r.net - FIVE_BY_SALARY[3].r.net)} 차이가 납니다. 원래 연봉이 높을수록 성과급이 더 높은 세율 구간에서 과세되기 때문입니다. 연봉이 국민연금 상한(연 ${PENSION_LABEL.maxAnnual})을 넘는 사람은 성과급에 국민연금이 더 붙지 않아 4대보험 몫은 오히려 작습니다.</p>

<h2>연봉 6,000만원 + 5,000만원, 공제 내역과 세율 구간</h2>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>항목</th><th>금액</th><th>계산 근거</th></tr></thead>
<tbody>
<tr><td>소득세 증가분</td><td>${won(FIVE_MAIN.incomeTaxDelta)}원</td><td>연간 결정세액 ${won(FIVE_SALARY_ONLY.decidedTax)}원 → ${won(FIVE_WITH_BONUS.decidedTax)}원</td></tr>
<tr><td>지방소득세</td><td>${won(FIVE_MAIN.localTaxDelta)}원</td><td>소득세 증가분의 ${RATE_LABEL.local}</td></tr>
<tr><td>국민연금</td><td>${won(FIVE_MAIN.pensionDelta)}원</td><td>연 상한 ${PENSION_LABEL.maxAnnual}까지 남은 ${manwon(PENSION_BASE_2026.MAX_ANNUAL - 60_000_000)} × ${RATE_LABEL.pension}</td></tr>
<tr><td>건강보험·장기요양</td><td>${won(FIVE_MAIN.healthDelta)}원</td><td>5,000만원 × ${RATE_LABEL.health} × (1 + ${RATE_LABEL.ltcRatio})</td></tr>
<tr><td>고용보험</td><td>${won(FIVE_MAIN.empInsDelta)}원</td><td>5,000만원 × ${RATE_LABEL.employment}</td></tr>
<tr><td><strong>합계</strong></td><td><strong>${won(FIVE_MAIN.totalDeductions)}원</strong></td><td>성과급의 ${ratio(FIVE_MAIN.totalDeductions, FIVE_MAIN.gross)}</td></tr>
<tr><td><strong>세후 성과급</strong></td><td><strong>${won(FIVE_MAIN.net)}원</strong></td><td>5,000만원 − 합계</td></tr>
</tbody>
</table></div>
<p>총급여가 1억원을 넘었다고 35% 세율이 붙는 것은 아닙니다. 세율은 연봉이 아니라 과세표준에 적용됩니다. 총급여 1억1,000만원에서 근로소득공제 ${manwon(FIVE_WITH_BONUS.earnedDeduction)}(소득세법 제47조), 본인 기본공제 150만원, 연금·건강·장기요양·고용보험료 공제 약 ${manwon(FIVE_WITH_BONUS.pension + FIVE_WITH_BONUS.healthAndCare + FIVE_WITH_BONUS.employment)}을 빼면 과세표준은 약 ${manwon(FIVE_WITH_BONUS.taxBase)}입니다. 35%가 시작되는 8,800만원까지 약 ${manwon(88_000_000 - FIVE_WITH_BONUS.taxBase)} 남아 있어, 이 사례의 성과급은 15%와 24% 구간에서만 과세됩니다. 연봉만 받을 때 과세표준은 약 ${manwon(FIVE_SALARY_ONLY.taxBase)}(${bracketRateOf(FIVE_SALARY_ONLY.taxBase)} 구간)이었습니다.</p>
<p>근로소득세액공제 한도도 총급여 6,000만원일 때 ${manwon(FIVE_SALARY_ONLY.creditLimit)}에서 1억1,000만원일 때 ${manwon(FIVE_WITH_BONUS.creditLimit)}으로 줄어(소득세법 제59조 제2항) 소득세 증가분에 들어갑니다.</p>

<h2>성과급 크기별로 보면 — 연봉 6,000만원 기준</h2>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>성과급</th><th>세금·4대보험</th><th>세후 성과급</th><th>남는 비율</th></tr></thead>
<tbody>
${FIVE_BY_BONUS.map(({ bonus, r }) => `<tr><td>${manwon(bonus)}</td><td>${won(r.totalDeductions)}원</td><td><strong>${won(r.net)}원</strong></td><td>${ratio(r.net, r.gross)}</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>성과급이 1,000만원에서 5,000만원으로 커지는 동안 남는 비율은 ${ratio(FIVE_BY_BONUS[0].r.net, FIVE_BY_BONUS[0].r.gross)}에서 ${ratio(FIVE_BY_BONUS[2].r.net, FIVE_BY_BONUS[2].r.gross)}로 완만하게 내려갑니다. 국민연금 추가분이 3,000만원부터 상한에 걸려 ${won(FIVE_BY_BONUS[1].r.pensionDelta)}원에서 멈추기 때문입니다. 성과급이 1억원이 되면 과세표준이 35% 구간으로 넘어가 남는 비율이 ${ratio(FIVE_BY_BONUS[3].r.net, FIVE_BY_BONUS[3].r.gross)}로 떨어집니다. 1억원 사례는 <a href="/guides/bonus-1eok-net-payment-2026">성과급 1억 실수령</a>에 따로 정리했습니다.</p>

<h2>IRP·연금저축 환급과 성과급 해에 달라지는 공제</h2>
<p>성과급 일부로 IRP와 연금저축을 합쳐 연 ${IRP_FULL_CREDIT_HIGH.cap}을 채우면, 총급여 5,500만원 초과자는 지방소득세 포함 ${IRP_FULL_CREDIT_HIGH.rateWithLocal}인 ${won(IRP_FULL_CREDIT_HIGH.amount)}원을 연말정산에서 돌려받습니다(소득세법 제59조의3). 세후 성과급 약 ${manwon(FIVE_MAIN.net)}에 이 환급을 더하면 약 ${manwon(FIVE_MAIN.net + IRP_FULL_CREDIT_HIGH.amount)}을 받은 효과지만, 납입한 돈은 연금계좌에 들어가 노후 전에는 꺼내 쓰기 어렵습니다. 원래 총급여가 5,500만원 이하였던 사람은 공제율이 ${IRP_FULL_CREDIT_HIGH.rateWithLocalLow}였다가, 성과급으로 5,500만원을 넘으면 그해에는 ${IRP_FULL_CREDIT_HIGH.rateWithLocal}로 낮아집니다.</p>
<p>연봉 6,000만원이던 사람은 성과급 5,000만원 때문에 총급여 7,000만원과 8,000만원 문턱을 한 해에 모두 넘습니다. 그해 연말정산에서 아래 공제가 줄거나 빠집니다.</p>
<ul>
<li><strong>신용카드 등 소득공제</strong>: 공제는 사용액이 총급여의 25%를 넘어야 시작되므로 문턱이 1,250만원 올라갑니다. 총급여 7,000만원 초과면 기본 한도가 300만원에서 250만원으로(자녀가 있으면 350만·400만원에서 275만·300만원으로) 줄고 문화체육 사용분 30% 공제도 빠집니다(조세특례제한법 제126조의2).</li>
<li><strong>주택청약종합저축 소득공제</strong>: 총급여 7,000만원 이하만 대상입니다(조세특례제한법 제87조).</li>
<li><strong>월세 세액공제</strong>: 총급여 8,000만원을 넘는 해에는 받을 수 없습니다(조세특례제한법 제95조의2).</li>
</ul>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 성과급 5,000만원을 받으면 35% 세율이 적용되나요?</strong> — 연봉 6,000만원이라면 아닙니다. 합산 총급여는 1억1,000만원이지만 공제를 뺀 과세표준이 약 ${manwon(FIVE_WITH_BONUS.taxBase)}이라 24% 구간입니다. 35%는 과세표준 8,800만원을 넘는 금액에만 붙습니다.</li>
<li><strong>Q. 성과급 받은 달에 떼인 세금이 표보다 많아요.</strong> — 성과급을 지급하는 달에는 지급대상기간의 월평균 급여로 간이세액표를 적용해 미리 걷습니다(소득세법 제136조). 최종 세액은 이듬해 2월 연말정산에서 확정되고, 더 낸 만큼은 그때 환급됩니다.</li>
<li><strong>Q. IRP에 넣으면 성과급 세금이 따로 줄어드나요?</strong> — 연금계좌 세액공제는 1년치 결정세액에서 빼는 것이라 성과급 몫만 따로 줄지는 않습니다. 결과적으로 연말정산 환급액이 늘고, 한도는 연 ${IRP_FULL_CREDIT_HIGH.cap}(연금저축은 그중 600만원)입니다.</li>
<li><strong>Q. 국민연금과 건강보험료는 성과급 받는 달에 더 떼나요?</strong> — 보통은 아닙니다. 건강보험료는 이듬해 4월 보수총액 정산에서, 국민연금은 이듬해 7월 기준소득월액 재결정 때 반영됩니다. 국민연금은 월 ${PENSION_LABEL.max} 상한이 있고 건강보험은 사실상 상한 없이 붙습니다.</li>
</ul>

<p>내 연봉과 성과급으로 직접 계산하려면 <a href="/tools/finance/bonus">성과급 세금 계산기</a>, 회사별 지급률로 성과급부터 구하려면 <a href="/calc/bonus-calculators">회사별 성과급 계산기 모음</a>을 쓰세요. IRP 환급액은 <a href="/tools/finance/irp">IRP 계산기</a>, 세율 구간 원리는 <a href="/guides/income-tax-8-step-bracket-2026">소득세 세율 8단계</a>, 4대보험 상한은 <a href="/guides/four-insurance-ceiling-summary-2026">4대보험 상한·하한</a>에서 이어서 볼 수 있습니다.</p>
<p>계산 가정: 2026년 세율·보험료율, 본인 1명 기본공제와 연금·건강·장기요양·고용보험료 공제만 반영했습니다. 부양가족·신용카드·의료비 등 공제가 있으면 과세표준이 낮아져 성과급 몫 세금이 이보다 줄 수 있고, 비과세 수당은 총급여에서 빠집니다.</p>
<p>근거: <a href="https://www.law.go.kr/법령/소득세법/제55조">소득세법 제55조(세율)</a> · <a href="https://www.law.go.kr/법령/소득세법/제59조의3">소득세법 제59조의3(연금계좌세액공제)</a> · <a href="https://www.law.go.kr/법령/조세특례제한법/제95조의2">조세특례제한법 제95조의2(월세 세액공제)</a> · <a href="https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0038M0.do">국민연금공단 기준소득월액 상·하한</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2227&amp;cntntsId=7667">국세청 종합소득세 세율</a>. 기준일 2026-09-26(법령·고시 확인), 2026년 귀속 세율과 2026년 보험료율 기준입니다.</p>
`;

const bracket8Step = `
<p class="lead">2026년 귀속 소득세 기본세율은 과세표준 1,400만원 이하 <strong>6%</strong>부터 10억원 초과 <strong>45%</strong>까지 8단계입니다. 세율은 연봉이 아니라 공제를 뺀 과세표준에 적용되고, 구간을 넘은 금액에만 높은 세율이 붙습니다. 산출세액은 '과세표준 × 세율 − 누진공제'로 구하고, 지방소득세가 그 ${RATE_LABEL.local}만큼 더해집니다. 근로소득 연말정산과 5월 종합소득세 신고 모두 같은 세율표(소득세법 제55조)를 쓰며, 2023년 귀속분부터 같은 구간이 유지되고 있습니다. 기준일 2026-09-26.</p>

<h2>2026년 소득세 기본세율표(8단계)</h2>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>과세표준</th><th>세율</th><th>누진공제</th><th>구간 상단까지 세액</th><th>지방소득세 포함</th></tr></thead>
<tbody>
${BRACKET_ROWS.map((b, i) => `<tr><td>${i === 0 ? `${manwon(b.limit)} 이하` : b.taxAtLimit === null ? `${manwon(b.lower)} 초과` : `${manwon(b.lower)} 초과 ${manwon(b.limit)} 이하`}</td><td><strong>${ratePct(b.rate)}</strong></td><td>${b.deduction ? manwon(b.deduction) : "—"}</td><td>${b.taxAtLimit === null ? "—" : manwon(b.taxAtLimit)}</td><td>${ratePct(b.rate * (1 + INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO))}</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>누진공제는 과세표준 전체에 그 구간 세율을 곱했을 때 아래 구간에서 더 매겨진 세금을 한 번에 빼 주는 숫자입니다. 과세표준 1억원이면 1억원 × 35% − 1,544만원 = ${manwon(TAX_EXAMPLES[4].tax)}이고, 이는 8,800만원까지의 세액 ${manwon(TAX_EXAMPLES[2].tax)}에 초과분 1,200만원의 35%인 420만원을 더한 값과 같습니다. 법조문도 '구간 상단까지 세액 + 초과 금액 × 세율' 방식으로 적혀 있습니다.</p>

<h2>초과분만 높은 세율 — 과세표준별 세액</h2>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>과세표준</th><th>산출세액</th><th>지방소득세</th><th>실효세율</th></tr></thead>
<tbody>
${TAX_EXAMPLES.map((x) => `<tr><td>${manwon(x.base)}</td><td>${won(x.tax)}원</td><td>${won(x.local)}원</td><td>${x.effective}</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>과세표준이 8,800만원에서 8,900만원으로 100만원 늘면 산출세액은 ${manwon(TAX_EXAMPLES[2].tax)}에서 ${manwon(TAX_EXAMPLES[3].tax)}으로 ${manwon(TAX_EXAMPLES[3].tax - TAX_EXAMPLES[2].tax)} 늘어납니다. 새로 늘어난 100만원에만 35%가 붙고, 8,800만원까지의 세금은 그대로입니다. 그래서 구간을 넘는 순간 세금이 계단처럼 뛰는 일은 없고, 실효세율은 ${TAX_EXAMPLES[2].effective}에서 ${TAX_EXAMPLES[3].effective}로 조금 오를 뿐입니다. 과세표준 2억원이어도 산출세액은 과세표준의 ${TAX_EXAMPLES[6].effective}입니다.</p>

<h2>연봉이 얼마면 35% 구간일까 — 과세표준과 총급여</h2>
<p>세율표의 금액은 연봉(총급여)이 아니라 과세표준입니다. 직장인의 과세표준은 이렇게 계산합니다. 총급여 7,000만원, 본인 1명 기본공제만 있다고 가정한 2026년 예시입니다.</p>
<ol>
<li><strong>총급여 70,000,000원</strong> — 연봉에서 비과세 수당을 뺀 금액</li>
<li><strong>근로소득공제 ${won(FLOW_7000.earnedDeduction)}원</strong>(소득세법 제47조) → 근로소득금액 ${won(FLOW_7000.gross - FLOW_7000.earnedDeduction)}원</li>
<li><strong>본인 기본공제 1,500,000원</strong>(제50조), <strong>국민연금 보험료 ${won(FLOW_7000.pension)}원</strong>(제51조의3), <strong>건강·장기요양·고용보험료 ${won(FLOW_7000.healthAndCare + FLOW_7000.employment)}원</strong>(제52조)</li>
<li><strong>과세표준 ${won(FLOW_7000.taxBase)}원</strong> → ${bracketRateOf(FLOW_7000.taxBase)} 구간</li>
<li><strong>산출세액 ${won(FLOW_7000.calculatedTax)}원</strong> − 근로소득세액공제 ${won(FLOW_7000.credit)}원(제59조) = <strong>결정세액 ${won(FLOW_7000.decidedTax)}원</strong>, 지방소득세 ${won(FLOW_7000.decidedTax * INSURANCE_RATES_2026.LOCAL_INCOME_TAX_RATIO)}원</li>
</ol>
<p>같은 가정으로 과세표준이 각 구간 경계에 닿는 총급여를 거꾸로 구하면 아래와 같습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>과세표준 경계</th><th>그때 총급여(본인 1명·기본 공제만)</th><th>넘으면 붙는 세율</th></tr></thead>
<tbody>
${GROSS_AT_BRACKET.map((g) => `<tr><td>${manwon(g.base)}</td><td>약 ${manwon(g.gross)}</td><td>${bracketRateOf(g.base + 1)}</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>"연봉 8,800만원이 넘으면 35%"는 흔한 오해입니다. 8,800만원은 과세표준 기준이고, 본인 1명만 공제받는 직장인이라도 총급여가 약 ${manwon(GROSS_AT_BRACKET[2].gross)}을 넘어야 35%가 붙기 시작합니다. 부양가족·신용카드·주택자금 등 소득공제가 있으면 과세표준이 더 낮아져 경계 총급여는 더 올라갑니다.</p>

<h2>세율 앞뒤의 두 장치 — 근로소득공제와 근로소득세액공제</h2>
<ul>
<li><strong>근로소득공제(세율 적용 전)</strong>: 총급여 500만원 이하 70%, 1,500만원 이하 350만원 + 500만원 초과분 40%, 4,500만원 이하 750만원 + 1,500만원 초과분 15%, 1억원 이하 1,200만원 + 4,500만원 초과분 5%, 1억원 초과 1,475만원 + 1억원 초과분 2%이고 공제액은 2,000만원이 한도입니다(소득세법 제47조).</li>
<li><strong>근로소득세액공제(세율 적용 후)</strong>: 산출세액 130만원 이하는 55%, 넘으면 71만5,000원 + 130만원 초과분 30%를 뺍니다. 한도는 총급여 3,300만원 이하 74만원, 7,000만원 이하 66만~74만원, 1억2,000만원 이하 50만~66만원, 그 초과는 20만~50만원으로 총급여가 많을수록 줄어듭니다(소득세법 제59조).</li>
</ul>
<p>성과급을 받아 총급여가 늘면 근로소득공제는 조금만 늘고 세액공제 한도는 오히려 줄어, 늘어난 소득의 대부분이 한계세율 그대로 과세됩니다. 지방소득세는 원천징수하는 소득세의 100분의 10을 함께 떼는 구조라(지방세법 제103조의13) 세율표의 모든 구간에 10%를 곱해 더하면 됩니다.</p>

<h2>성과급에 적용해 보면</h2>
<p>성과급도 근로소득이라 그해 연봉과 합친 과세표준으로 구간을 판단합니다. 연봉 6,000만원에 성과급 5,000만원을 받으면 총급여는 1억1,000만원이지만 과세표준은 약 ${manwon(FIVE_WITH_BONUS.taxBase)}이라 ${bracketRateOf(FIVE_WITH_BONUS.taxBase)} 구간에 머뭅니다. 연봉 7,000만원에 성과급 1억원이면 과세표준이 약 ${manwon(EOK_WITH_BONUS.taxBase)}으로 ${bracketRateOf(EOK_WITH_BONUS.taxBase)} 구간입니다. 세후 금액은 <a href="/guides/bonus-5000-net-payment-2026">성과급 5,000만원 실수령</a>과 <a href="/guides/bonus-1eok-net-payment-2026">성과급 1억 실수령</a>에 표로 정리했습니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 종합소득세와 근로소득세의 세율이 다른가요?</strong> — 같습니다. 근로소득도 종합소득이라 같은 기본세율(소득세법 제55조)을 씁니다. 근로소득만 있고 연말정산을 마쳤다면 5월 종합소득세 신고를 하지 않아도 됩니다(제73조).</li>
<li><strong>Q. 연봉 8,800만원이 넘으면 35% 세율인가요?</strong> — 아닙니다. 8,800만원은 과세표준 기준입니다. 본인 1명 기본공제만 있는 직장인도 총급여가 약 ${manwon(GROSS_AT_BRACKET[2].gross)}을 넘어야 35% 구간에 들어갑니다.</li>
<li><strong>Q. 누진공제는 왜 빼나요?</strong> — 과세표준 전체에 가장 높은 구간 세율을 곱하면 아래 구간 금액까지 높은 세율로 계산되므로, 그만큼을 한 번에 빼 주는 보정값입니다. 결과는 구간별로 나눠 계산한 세액과 같습니다.</li>
<li><strong>Q. 세율 구간은 언제 바뀌나요?</strong> — 소득세법 제55조가 개정되어야 바뀝니다. 지금 구간은 2023년 귀속분부터 적용되고 있으며, 바뀌면 이 표와 계산기를 함께 고칩니다.</li>
</ul>

<p>내 소득으로 바로 계산하려면 <a href="/income-tax-2026">종합소득세 계산기</a>, 다른 세금의 세율까지 보려면 <a href="/tax-rates-2026">2026 세율표</a>, 연말정산 환급액은 <a href="/year-end-tax">연말정산 계산기</a>를 쓰세요.</p>
<p>근거: <a href="https://www.law.go.kr/법령/소득세법/제55조">소득세법 제55조(세율)</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2227&amp;cntntsId=7667">국세청 종합소득세 세율</a> · <a href="https://www.law.go.kr/법령/소득세법/제47조">소득세법 제47조(근로소득공제)</a> · <a href="https://www.law.go.kr/법령/소득세법/제59조">소득세법 제59조(근로소득세액공제)</a> · <a href="https://www.law.go.kr/법령/지방세법/제103조의13">지방세법 제103조의13(특별징수)</a>. 기준일 2026-09-26(법령 확인), 2026년 귀속 기준입니다. 총급여 예시는 머니샐러리 연말정산 엔진의 2026년 보험료율로 계산했습니다.</p>
`;

const salaryBonusCalc = `
<p class="lead">성과급 + 연봉 합산 시 세금 계산법. ① 총 소득 합계 → ② 근로소득공제 차감 → ③ 인적·연금·보험 공제 → ④ 과세표준 산출 → ⑤ 8단계 누진세율 적용 → ⑥ 산출세액 - 누진공제 → ⑦ 세액공제(자녀·연금) → ⑧ 결정세액. 직접 계산보다 머니샐러리 계산기 활용 권장.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 8단계 계산 절차</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 총 소득</strong>: 연봉 + 성과급 + 격려금 + 야근수당 합산</li>
<li><strong>② 근로소득공제</strong>: 자동 (총급여별 5~70%)</li>
<li><strong>③ 인적공제</strong>: 본인·배우자·부양가족 (1인 150만)</li>
<li><strong>④ 과세표준</strong>: ① - ② - ③ - 기타공제</li>
<li><strong>⑤ 산출세액</strong>: 과세표준 × 한계세율 - 누진공제</li>
<li><strong>⑥ 세액공제</strong>: 자녀(30~70만) + 연금저축(13.2%) + 의료비 등</li>
<li><strong>⑦ 결정세액</strong>: ⑤ - ⑥</li>
<li><strong>⑧ 납부세액</strong>: ⑦ + 지방소득세 10%</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li><li>· <a href="/" class="text-primary underline">연봉 실수령액 계산기</a></li></ul></div>
`;

const splitPayoutLower = `
<p class="lead">성과급 1억을 한 번에 받으면 한계세율 38% 점프. 2년 분할 시 각 5,000만원으로 한계세율 35% 유지. 절세 약 600만원. 회사와 분할 지급 협상이 가능하다면 적극 시도 권장.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 분할 vs 일시 비교</h2>
<p>연봉 8,000만 + 성과급 1억:</p>
<ul class="space-y-2 mt-4">
<li>· <strong>일시 지급</strong>: 1.8억 합산 → 한계세율 38% → 약 3,800만원 세금</li>
<li>· <strong>2년 분할</strong>: 매년 1.3억 → 한계세율 35% → 매년 2,500만원 = 합 5,000만원</li>
<li>· 일시 6,000만 vs 분할 5,000만 → <strong>1,000만 절감</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 회사 협상 포인트</h2>
<ul class="space-y-2 mt-4">
<li>· 인사·임원과 분할 지급 가능성 확인</li>
<li>· 잔류 의무·근속 조건 부가 가능</li>
<li>· 회사도 손금 처리 시점 분산 → 일부 유리</li>
<li>· 직원 입장에서는 한계세율 점프 회피로 절세</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li></ul></div>
`;

const irpBeforeBonus = `
<p class="lead">성과급 받기 1~2개월 전 IRP·연금저축에 900만원 만기 납입 → 13.2~16.5% 세액공제 = 약 119~149만원 환급. 한계세율 35%+ 구간 진입자에게 가장 큰 절세 효과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 IRP·연금저축 세액공제율</h2>
<ul class="space-y-2 mt-4">
<li>· 총급여 5,500만 이하: <strong>16.5% (지방세 포함)</strong></li>
<li>· 총급여 5,500만 초과: <strong>13.2%</strong></li>
<li>· 한도: IRP + 연금저축 합산 900만원 (전 연령 공통)</li>
<li>· ISA 만기 자금 전환 시 추가: 전환액의 10%, 최대 300만원 (과거 '50세+ 한시 상향'은 2022년 종료)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 환급 시뮬</h2>
<p>연봉 8,000만 직장인 + 성과급 5,000만 예정:</p>
<ul class="space-y-2 mt-4">
<li>· 한계세율 35% (1.3억 영끌)</li>
<li>· IRP 900만원 만기 납입</li>
<li>· 환급: 900 × 13.2% = 119만원</li>
<li>· 지방세 포함 약 131만원</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 타이밍 — 12월 31일 전 납입</h2>
<p>당해년도 공제 받으려면 12월 31일까지 납입 완료. 성과급이 1월 지급이라도 전년도 12월 만기 납입이 핵심.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/irp" class="text-primary underline">IRP 계산기</a></li></ul></div>
`;

const card25BeforeBonus = `
<p class="lead">성과급 받기 전 신용카드 25% 기준선 채우기 — 총급여 25% 초과 사용분만 공제. 5,000만 직장인이라면 1,250만원 초과부터 공제. 성과급으로 연봉 늘어나면 기준선도 올라가 공제 어려움.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 25% 기준선</h2>
<ul class="space-y-2 mt-4">
<li>· 총급여 5,000만: 25% = 1,250만 (초과분 공제)</li>
<li>· 총급여 1억: 25% = 2,500만</li>
<li>· 총급여 1.5억: 25% = 3,750만</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 카드별 공제율</h2>
<ul class="space-y-2 mt-4">
<li>· 신용카드 15%</li>
<li>· 체크/현금영수증 30%</li>
<li>· 전통시장·대중교통·도서공연 40%</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 성과급 받기 직전 전략</h2>
<p>성과급 받기 직전 분기에 체크카드·전통시장 집중 사용으로 한도 빠르게 도달. 100만원 추가 사용 시 약 12만원 환급(체크 30% × 한계세율 35%).</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const medicalEduBonus = `
<p class="lead">성과급 받는 해는 한계세율이 높아 의료비·교육비·기부금 등 특별세액공제 한도 도달 가치가 더 큼. 의료비 200만 + 교육비 600만 + 기부금 100만 = 합산 약 135만원 환급. 한계세율 24% → 35%로 점프하면 더 큰 효과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 한도 도달 전략</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 의료비 한도</strong>: 본인·부양가족 합산 700만원. 임플란트·치과·산후조리원 등 큰 비용 한 해에 몰아 결제</li>
<li><strong>② 교육비 한도</strong>: 본인 무제한, 자녀 300/900만. 대학원·자녀 등록금 한 해 결제</li>
<li><strong>③ 기부금</strong>: 종교 10%, 일반 30% 한도. 기부 우대 신청</li>
<li><strong>④ 보장성 보험</strong>: 100만 한도 빠르게 도달</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 성과급 받는 해 의료비 600만 사용</h2>
<p>총급여 1.2억 + 성과급 5,000만 시 (영끌 1.7억):</p>
<ul class="space-y-2 mt-4">
<li>· 의료비 600만 - 3%(360만) = 240만 × 15% = 36만 환급</li>
<li>· 한계세율 35% 구간 환급 효과 큼</li>
<li>· 일반 직장인보다 약 11%p 큰 환급 가치</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const dependentBonus = `
<p class="lead">성과급 받는 해는 인적공제 한 명당 절세 효과가 더 큼. 한계세율 35% 시 인적공제 150만원 × 35% = 약 52만원 환급. 한계세율 24% 직장인의 36만원 대비 16만원 추가. 부모·자녀·배우자 부양 등록 적극 검토.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 인적공제 대상</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>본인</strong>: 자동 150만원</li>
<li>· <strong>배우자</strong>: 연소득 100만 이하</li>
<li>· <strong>직계존속(부모·조부모)</strong>: 만 60세+, 연소득 100만 이하</li>
<li>· <strong>직계비속(자녀)</strong>: 만 20세 이하, 연소득 100만 이하</li>
<li>· <strong>형제자매</strong>: 만 20세 이하 또는 만 60세+</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 받는 해 추가 절세</h2>
<p>한계세율 35%, 부모 2명 + 자녀 2명 등록:</p>
<ul class="space-y-2 mt-4">
<li>· 인적공제 4 × 150만 = 600만</li>
<li>· 환급: 600 × 35% = 210만원 + 지방세 21만 = 231만원</li>
<li>· 추가로 부모 경로우대 (만 70세+) 각 100만, 부모 의료비, 자녀 교육비도 합산</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 영역 C — 성과급 4대보험·건강보험 (10편)
// ═══════════════════════════════════════════════════════════════

const bonusPension45 = `
<p class="lead">성과급에 국민연금 4.75% 부과? — 부분적 YES. 보수월액 상한 659만원(2026년 7월~)까지만 부과. 월 보수 800만원 직원이 성과급 1억 받아도 추가 국민연금 부과 거의 없음(이미 상한 적용).</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 국민연금 상한 (2026.7~2027.6)</h2>
<ul class="space-y-2 mt-4">
<li>· 기준소득월액 상한: <strong>659만원</strong></li>
<li>· 본인 부담 4.75% × 659만 = 약 31.3만원/월</li>
<li>· 회사 부담 4.75% 동일</li>
<li>· 보수가 659만 초과해도 31.3만원 고정</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 영향 — 거의 없음</h2>
<p>월급 700만 직원이 성과급 5,000만 받는 경우:</p>
<ul class="space-y-2 mt-4">
<li>· 월급만으로도 이미 상한 659만 초과 → 31.3만원 매월 부과</li>
<li>· 성과급 추가돼도 국민연금은 변동 없음</li>
<li>· <strong>국민연금 추가 부담 0원</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 단 — 월급이 낮은 직원은 영향</h2>
<p>월급 400만 직원이 연간 성과급 200만을 받으면 이듬해 7월 기준소득월액 재산정 때 월평균 소득이 약 16.7만원 올라가 → 월 약 7,900원(연 약 95,000원) 추가 부담(요율 4.75% 반영).</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/national-pension-estimate-2026" class="text-primary underline">국민연금 예상수령액</a></li></ul></div>
`;

const bonusHealth3545 = `
<p class="lead">성과급에도 건강보험료가 붙습니다. 2026년 직장가입자 건강보험료율은 보수의 ${RATE_LABEL.healthTotal}로 근로자와 회사가 ${RATE_LABEL.health}씩 내고, 장기요양보험료는 건강보험료의 ${RATE_LABEL.ltcRatio}입니다. 근로자 몫을 합치면 성과급의 <strong>약 ${RATE_LABEL.healthPlusLtc}</strong>로, 성과급 1억원이면 <strong>본인 약 ${manwon(HEALTH_BY_BONUS[3].total)}</strong>이고 회사도 같은 금액을 냅니다. 성과급분 보험료는 보통 이듬해 4월 건강보험료 정산에서 한꺼번에 고지되고, 그달 보험료 이상이면 12회 이내로 나눠 낼 수 있습니다. 기준일 2026-09-26.</p>

<h2>성과급 금액별 건강보험료(근로자 몫)</h2>
<p>아래 금액은 성과급 전액이 보수에 더해진다고 보고 2026년 요율로 계산한 근로자 부담분입니다. 회사도 같은 금액을 따로 냅니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>성과급</th><th>건강보험</th><th>장기요양</th><th>본인 합계</th><th>12회로 나누면 월</th></tr></thead>
<tbody>
${HEALTH_BY_BONUS.map((h) => `<tr><td>${manwon(h.bonus)}</td><td>${won(h.health)}원</td><td>${won(h.care)}원</td><td><strong>${won(h.total)}원</strong></td><td>약 ${won(h.total / 12)}원</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>건강보험료는 성과급 × ${RATE_LABEL.health}, 장기요양보험료는 그 건강보험료 × ${RATE_LABEL.ltcRatio}입니다. 두 개를 합친 근로자 부담률이 약 ${RATE_LABEL.healthPlusLtc2}라서 흔히 "성과급 건보료 4%"라고 부릅니다. 실제 고지액은 공단의 산정 방식에 따라 원 단위가 조금 다를 수 있습니다.</p>

<h2>요율은 어떻게 정해지나요</h2>
<ul>
<li><strong>건강보험 ${RATE_LABEL.healthTotal}</strong>: 직장가입자 보험료율은 1만분의 719입니다(국민건강보험법 시행령 제44조, 2026년 적용).</li>
<li><strong>근로자·회사 절반씩</strong>: 직장가입자의 보수월액보험료는 근로자와 사업주가 100분의 50씩 부담합니다(국민건강보험법 제76조). 그래서 근로자 몫이 ${RATE_LABEL.health}입니다.</li>
<li><strong>장기요양 ${RATE_LABEL.ltcOfIncome}</strong>: 장기요양보험료율은 100만분의 9,448로(노인장기요양보험법 시행령 제4조, 2026-05-12 시행본), 건강보험료 대비로 바꾸면 약 ${RATE_LABEL.ltcRatio}입니다. 장기요양보험료는 건강보험료액에 이 비율을 곱해 산정하므로(노인장기요양보험법 제9조) 근로자 몫도 근로자 건강보험료에 비례합니다.</li>
<li><strong>성과급이 보수에 들어가는 근거</strong>: 보수에는 봉급·급료·임금·상여·수당 등 근로의 대가가 모두 들어가고, 퇴직금과 소득세법상 비과세 근로소득 등은 빠집니다(국민건강보험법 시행령 제33조). 성과급·인센티브는 상여라 보험료 대상이고, 퇴직금에는 건강보험료가 붙지 않습니다.</li>
</ul>

<h2>상한은 있지만 성과급에는 거의 닿지 않는다</h2>
<p>직장가입자 보수월액보험료에도 상한이 있습니다. 2026년 월 상한은 근로자·회사 합계 ${HEALTH_CAP_LABEL.total}원(근로자 몫 ${HEALTH_CAP_LABEL.employee}원), 하한은 ${HEALTH_CAP_LABEL.floorTotal}원입니다(보건복지부고시 제2025-222호, 2026-01-01 시행). 근로자 몫이 상한에 닿으려면 보수월액이 약 ${HEALTH_CAP_LABEL.payAtCap}, 1년 보수로는 약 ${HEALTH_CAP_LABEL.annualPayAtCap}이어야 합니다.</p>
<p>국민연금이 월 ${PENSION_LABEL.max}에서 멈추는 것과 달리, 건강보험은 대부분의 직장인에게 성과급 전액에 붙는다는 뜻입니다. 연봉이 높은 사람이 성과급을 받으면 국민연금은 더 늘지 않는데 건강보험료는 그대로 늘어나는 이유입니다. 두 보험의 상한 차이는 <a href="/guides/four-insurance-ceiling-summary-2026">4대보험 상한·하한 정리</a>에 표로 모았습니다.</p>

<h2>성과급분은 언제 내나요 — 이듬해 4월 정산</h2>
<p>매달 떼는 건강보험료는 전년도 보수총액으로 정한 보수월액을 기준으로 하고, 이 보수월액은 4월부터 이듬해 3월까지 적용됩니다. 그해 실제 보수총액이 다음 해에 확정되면 보수월액을 다시 계산해 차액을 정산합니다(국민건강보험법 시행령 제34조). 그래서 성과급을 받은 달에는 건강보험료가 늘지 않는 경우가 많습니다.</p>
<ol>
<li><strong>3월 10일까지</strong>: 회사가 전년도 보수총액을 공단에 통보합니다. 전년도 보수에 대한 간이지급명세서를 세무서에 냈다면 통보한 것으로 봅니다(시행령 제35조).</li>
<li><strong>4월</strong>: 공단이 보험료를 다시 계산해 덜 걷은 금액은 추가로 징수하고, 더 걷은 금액은 돌려줍니다(시행령 제39조 제1항). 전년도 보수 변동분이 4월분 보험료와 함께 고지되는 것이 일반적입니다.</li>
<li><strong>분할 납부</strong>: 추가로 걷을 금액 중 근로자 몫이 그달 보험료 이상이면 회사 신청으로 12회 이내로 나눠 낼 수 있습니다(같은 조 제4항). 성과급 1억원이면 근로자 몫 약 ${manwon(HEALTH_BY_BONUS[3].total)}을 12회로 나눠 월 약 ${manwon(HEALTH_BY_BONUS[3].total / 12)}씩 내는 식입니다.</li>
<li><strong>퇴사하면</strong>: 회사가 퇴직 때 그동안 낸 보험료를 다시 계산해 근로자와 정산합니다(같은 조 제2항).</li>
</ol>
<p>이렇게 정산으로 낸 보험료는 낸 해의 연말정산에서 보험료 공제를 받습니다. 근로자가 부담한 건강·장기요양·고용보험료는 그 과세기간에 낸 금액만큼 근로소득금액에서 빼 주기 때문입니다(소득세법 제52조 제1항). 2026년 성과급분을 2027년 4월에 정산했다면 2027년 귀속 연말정산에 들어갑니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 성과급에도 건강보험료가 붙나요?</strong> — 붙습니다. 상여는 건강보험의 보수에 포함되므로(국민건강보험법 시행령 제33조) 근로자 몫 약 ${RATE_LABEL.healthPlusLtc2}(장기요양 포함)가 더해집니다. 퇴직금과 비과세 근로소득에는 붙지 않습니다.</li>
<li><strong>Q. 건강보험 연말정산은 몇 월에 반영되나요?</strong> — 회사가 3월 10일까지 전년도 보수총액을 통보하면 4월분 보험료에 정산액이 반영되는 것이 일반적입니다. 7월은 국민연금 기준소득월액이 바뀌는 달로, 건강보험료 정산과는 별개입니다.</li>
<li><strong>Q. 정산 금액이 너무 크면 어떻게 하나요?</strong> — 추가 징수액 중 근로자 몫이 그달 보험료 이상이면 회사가 공단에 신청해 12회 이내로 나눠 낼 수 있습니다. 회사 급여 담당에게 분할 신청 여부를 확인하세요.</li>
<li><strong>Q. 회사도 성과급분 건강보험료를 내나요?</strong> — 냅니다. 직장가입자의 보수월액보험료는 근로자와 사업주가 절반씩 부담하므로 성과급 1억원이면 회사도 약 ${manwon(HEALTH_BY_BONUS[3].total)}을 냅니다(국민건강보험법 제76조).</li>
</ul>

<p>월급 기준 보험료는 <a href="/health-insurance-fee-2026">건강보험료 계산기</a>, 4월 정산 절차와 분할 납부는 <a href="/health-insurance-2026">건강보험료 연말정산 가이드</a>, 올해 요율 전체는 <a href="/social-insurance-rates-2026">2026 4대보험 요율표</a>에서 확인할 수 있습니다. 성과급 세후 금액은 <a href="/guides/bonus-1eok-net-payment-2026">성과급 1억 실수령</a>과 <a href="/tools/finance/bonus">성과급 세금 계산기</a>를 참고하세요.</p>
<p>근거: <a href="https://www.law.go.kr/법령/국민건강보험법시행령/제44조">국민건강보험법 시행령 제44조(보험료율)</a> · <a href="https://www.law.go.kr/법령/노인장기요양보험법시행령/제4조">노인장기요양보험법 시행령 제4조(장기요양보험료율)</a> · <a href="https://www.law.go.kr/법령/국민건강보험법시행령/제34조">시행령 제34조(보수월액보험료 부과와 정산)</a> · <a href="https://www.law.go.kr/법령/국민건강보험법시행령/제39조">시행령 제39조(정산·분할납부)</a> · <a href="https://www.nhis.or.kr/lm/lmxsrv/law/lawFullContent.do?SEQ=39&amp;SEQ_HISTORY=595294">보건복지부고시 제2025-222호(보험료 상·하한)</a>. 기준일 2026-09-26(법령·고시 확인), 2026년 보험료율 기준입니다.</p>
`;

const bonusEmployment09 = `
<p class="lead">성과급에 고용보험 0.9% 부과 (본인). 고용보험은 보수 상한 없음. 성과급 1억 받으면 고용보험 90만원 추가. 회사는 0.9% + α(고용안정·직업능력)도 함께 부담.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 고용보험 본인 0.9%</h2>
<ul class="space-y-2 mt-4">
<li>· 본인: 0.9% (성과급에도 부과)</li>
<li>· 회사: 0.9% + α (사업장 규모별)</li>
<li>· 상한 없음 — 성과급 그대로 부과</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>성과급 5,000만 시 본인 고용보험 45만, 1억 시 90만, 3억 시 270만원.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 활용 — 실업급여 산정 베이스</h2>
<p>고용보험 부담 큰 만큼 실업급여 산정 시 평균임금 베이스도 큼. 성과급 큰 직원이 퇴직 시 실업급여 일 ${UB_UPPER}원(2026 상한)까지 받기 쉬움.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li></ul></div>
`;

const bonusInsuranceCeiling = `
<p class="lead">2026년 근로자가 내는 4대보험료율은 국민연금 ${RATE_LABEL.pension}, 건강보험 ${RATE_LABEL.health}(장기요양은 건강보험료의 ${RATE_LABEL.ltcRatio}), 고용보험 ${RATE_LABEL.employment}이고 산재보험은 회사가 전액 냅니다. 상한은 국민연금(기준소득월액 월 ${PENSION_LABEL.minShort}~${PENSION_LABEL.max}, 2026년 7월~2027년 6월)과 건강보험(월 보험료 합계 ${HEALTH_CAP_LABEL.total}원)에만 있고, 고용보험료에는 상한이 없습니다. 그래서 연봉이 ${PENSION_LABEL.maxAnnual} 이상인 사람이 성과급 1억원을 받으면 4대보험 근로자 추가분은 <strong>약 ${manwon(INSURANCE_BY_SALARY[2].sum)}</strong>입니다. 기준일 2026-09-26.</p>

<h2>2026년 4대보험 요율과 상한·하한 한눈에</h2>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>보험</th><th>근로자</th><th>회사</th><th>상한·하한</th></tr></thead>
<tbody>
<tr><td>국민연금</td><td>${RATE_LABEL.pension}</td><td>${RATE_LABEL.pension}</td><td>기준소득월액 월 ${PENSION_LABEL.minShort}~${PENSION_LABEL.max}(2026.7~2027.6)</td></tr>
<tr><td>건강보험</td><td>${RATE_LABEL.health}</td><td>${RATE_LABEL.health}</td><td>월 보험료 합계 상한 ${HEALTH_CAP_LABEL.total}원, 하한 ${HEALTH_CAP_LABEL.floorTotal}원</td></tr>
<tr><td>장기요양</td><td>건강보험료의 ${RATE_LABEL.ltcRatio}</td><td>건강보험료의 ${RATE_LABEL.ltcRatio}</td><td>건강보험료를 따라감</td></tr>
<tr><td>고용보험</td><td>${RATE_LABEL.employment}</td><td>${RATE_LABEL.employment} + 0.25~0.85%(규모별)</td><td>상한 없음</td></tr>
<tr><td>산재보험</td><td>없음</td><td>업종별 요율 전액</td><td>—</td></tr>
</tbody>
</table></div>
<p>국민연금 합계 요율은 ${RATE_LABEL.pensionTotal}이고 2033년 13%까지 해마다 0.5%p씩 오릅니다(국민연금공단). 건강보험은 보수의 ${RATE_LABEL.healthTotal}를 절반씩 내고(국민건강보험법 시행령 제44조·법 제76조), 고용보험 실업급여 보험료율 1.8%도 절반씩 냅니다. 회사는 여기에 고용안정·직업능력개발 보험료를 상시근로자 150명 미만 0.25%, 1천명 이상 0.85% 등 규모별로 더 냅니다(고용산재보험료징수법 시행령 제12조).</p>

<h2>국민연금 — 월 ${PENSION_LABEL.max}에서 보험료가 멈춘다</h2>
<p>국민연금 보험료는 실제 월급이 아니라 '기준소득월액'에 요율을 곱합니다. 기준소득월액은 신고한 소득월액을 쓰되 하한보다 적으면 하한, 상한보다 많으면 상한으로 정합니다(국민연금법 시행령 제5조). 상·하한은 보건복지부 장관이 매년 3월 31일까지 고시하고 그해 7월부터 이듬해 6월까지 적용합니다. 2026년 7월~2027년 6월은 하한 ${PENSION_LABEL.min}, 상한 ${PENSION_LABEL.max}으로, 직전 1년(2025년 7월~2026년 6월, 하한 40만원·상한 637만원)보다 올랐습니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>월 소득</th><th>적용 기준소득월액</th><th>근로자 월 보험료</th></tr></thead>
<tbody>
${PENSION_BY_PAY.map((p) => `<tr><td>${manwon(p.pay)}</td><td>${manwon(p.base)}</td><td>${won(p.premium)}원</td></tr>`).join("\n")}
</tbody>
</table></div>
<p>월 소득이 ${PENSION_LABEL.max}을 넘으면 근로자 보험료는 월 ${PENSION_LABEL.maxPremium}원에서 더 오르지 않습니다. 회사에 다니는 사업장가입자는 전년도 소득총액을 근무일수로 나눈 금액의 30배로 기준소득월액을 다시 정해 7월부터 1년간 적용합니다(국민연금공단 안내). 성과급을 받으면 그해가 아니라 이듬해 7월부터 보험료에 반영되는 이유입니다.</p>

<h2>건강보험·고용보험 — 성과급 거의 전액에 붙는다</h2>
<p>건강보험도 상한이 있지만 문턱이 매우 높습니다. 2026년 직장가입자 보수월액보험료 상한은 근로자·회사 합계 월 ${HEALTH_CAP_LABEL.total}원, 근로자 몫 ${HEALTH_CAP_LABEL.employee}원입니다(보건복지부고시 제2025-222호). 근로자 몫이 이 상한에 닿으려면 보수월액이 약 ${HEALTH_CAP_LABEL.payAtCap}(연 약 ${HEALTH_CAP_LABEL.annualPayAtCap})이어야 하므로 대부분의 직장인에게는 성과급 전액에 건강보험료가 붙습니다. 성과급분은 보통 이듬해 4월 보수총액 정산에서 고지됩니다. 자세한 정산 절차는 <a href="/guides/bonus-health-4-percent-2026">성과급 건강보험료 4.07%</a>에 정리했습니다.</p>
<p>고용보험료에는 상한이 아예 없습니다. 근로자가 내는 고용보험료는 자기 보수총액에 실업급여 보험료율의 절반을 곱한 금액이라(고용산재보험료징수법 제13조 제2항) 보수가 늘면 그대로 늘어납니다. 반면 받는 쪽인 구직급여에는 1일 상한 ${UB_UPPER}원(2026년 이직자)이 있어, 성과급이 많아도 실업급여가 그만큼 늘지는 않습니다(고용노동부). 산재보험료는 사업주가 전부 부담합니다(같은 조 제5항).</p>

<h2>성과급 1억원을 받으면 4대보험은 얼마나 늘까</h2>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>연봉</th><th>국민연금</th><th>건강·장기요양</th><th>고용보험</th><th>합계</th></tr></thead>
<tbody>
${INSURANCE_BY_SALARY.map((x) => `<tr><td>${manwon(x.salary)}</td><td>${won(x.pension)}원</td><td>${won(x.health)}원</td><td>${won(x.employment)}원</td><td><strong>${won(x.sum)}원</strong></td></tr>`).join("\n")}
</tbody>
</table></div>
<p>국민연금은 연봉이 연 상한 ${PENSION_LABEL.maxAnnual}(월 ${PENSION_LABEL.max} × 12)에 못 미치는 만큼만 성과급에 붙습니다. 연봉 5,000만원이면 남은 ${manwon(PENSION_BASE_2026.MAX_ANNUAL - 50_000_000)}에 ${RATE_LABEL.pension}를 곱한 ${won(INSURANCE_BY_SALARY[0].pension)}원이 늘고, 연봉이 ${PENSION_LABEL.maxAnnual} 이상이면 0원입니다. 건강·장기요양과 고용보험은 연봉과 관계없이 성과급에 비례합니다. 세금까지 포함한 세후 금액은 <a href="/guides/bonus-1eok-net-payment-2026">성과급 1억 실수령</a>과 <a href="/guides/bonus-5000-net-payment-2026">성과급 5,000만원 실수령</a>을 보세요.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 국민연금 상한 ${PENSION_LABEL.max}은 언제 바뀌나요?</strong> — 보건복지부 장관이 매년 3월 31일까지 고시하고 그해 7월부터 이듬해 6월까지 적용합니다(국민연금법 시행령 제5조). 지금 값은 2027년 6월까지 쓰입니다.</li>
<li><strong>Q. 고용보험료에는 정말 상한이 없나요?</strong> — 없습니다. 근로자 몫은 보수총액 × ${RATE_LABEL.employment}입니다. 대신 구직급여에는 1일 ${UB_UPPER}원 상한이 있어 보험료를 많이 냈다고 실업급여가 비례해 늘지는 않습니다.</li>
<li><strong>Q. 월급이 적으면 하한이 적용되나요?</strong> — 국민연금은 신고 소득이 월 ${PENSION_LABEL.min}보다 적으면 ${PENSION_LABEL.min}으로 계산해 근로자 보험료가 월 ${PENSION_LABEL.minPremium}원입니다. 건강보험은 월 보험료 합계 ${HEALTH_CAP_LABEL.floorTotal}원이 하한입니다.</li>
<li><strong>Q. 성과급을 받은 달에 4대보험이 한꺼번에 빠지나요?</strong> — 보통은 아닙니다. 건강보험은 이듬해 4월 보수총액 정산, 국민연금은 이듬해 7월 기준소득월액 재결정 때 반영되는 경우가 일반적입니다. 회사 급여 처리 방식에 따라 다를 수 있으니 급여명세서를 확인하세요.</li>
</ul>

<p>월급 기준 4대보험 전체는 <a href="/social-insurance-rates-2026">2026 4대보험 요율표</a>, 건강보험료는 <a href="/health-insurance-fee-2026">건강보험료 계산기</a>, 국민연금 수령액은 <a href="/national-pension-estimate-2026">국민연금 예상수령액 계산기</a>, 실업급여는 <a href="/unemployment-benefit">실업급여 계산기</a>에서 확인할 수 있습니다.</p>
<p>근거: <a href="https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0038M0.do">국민연금공단 기준소득월액 상·하한</a> · <a href="https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0095M0.do">국민연금공단 연금보험료율</a> · <a href="https://www.law.go.kr/법령/국민연금법시행령/제5조">국민연금법 시행령 제5조</a> · <a href="https://www.law.go.kr/법령/국민건강보험법시행령/제44조">국민건강보험법 시행령 제44조</a> · <a href="https://www.nhis.or.kr/lm/lmxsrv/law/lawFullContent.do?SEQ=39&amp;SEQ_HISTORY=595294">보건복지부고시 제2025-222호</a> · <a href="https://www.law.go.kr/법령/고용보험및산업재해보상보험의보험료징수등에관한법률/제13조">고용산재보험료징수법 제13조</a> · <a href="https://www.law.go.kr/법령/고용보험및산업재해보상보험의보험료징수등에관한법률시행령/제12조">같은 법 시행령 제12조</a> · <a href="https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18736">고용노동부 구직급여 상한 보도자료</a>. 기준일 2026-09-26(법령·고시 확인), 2026년 보험료율 기준입니다.</p>
`;

const bonusHealthAdjust = `
<p class="lead">성과급 1억 받았는데 건보료 정산 200만원 추가? — 4월 건강보험 연말정산 결과. 매월 정기 부과는 통상 월급 기준만 적용, 성과급 부분은 다음해 4월 연말정산에서 부과. 큰 폭의 정산금 발생.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 4월 건보료 연말정산 구조</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 1~3월</strong>: 작년 보수총액 확정 (2026년부터 국세청 자료 연계로 약 61% 자동 처리)</li>
<li><strong>② 4월</strong>: 정산 차액을 4월분 보험료에 일시 반영·고지</li>
<li><strong>③ ~5월 초</strong>: 정산액이 당월 보험료 이상이면 12회 이내 분할 납부 신청</li>
<li><strong>④ 이후</strong>: 새 보수월액으로 정기 부과</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 정산금 시뮬</h2>
<p>월급 600만 + 작년 성과급 1억:</p>
<ul class="space-y-2 mt-4">
<li>· 작년 평균 보수월액: 600 + (1억/12) = 약 1,433만</li>
<li>· 작년 본인 건보료 매월: 약 24만 (월급 기준)</li>
<li>· 정산 후 매월: 약 57만</li>
<li>· 차액: 약 33만 × 12개월 = <strong>약 400만원 추가</strong></li>
<li>· 5회 분할 시 7~11월 각 80만원 추가 부과</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 미리 대비</h2>
<ul class="space-y-2 mt-4">
<li>· 성과급 받은 다음해 4월 정산 약 200~500만원 부담 예상</li>
<li>· 분할 납부 신청(12회 이내)으로 부담 분산</li>
<li>· 별도 적립금 마련 권장</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-2026" class="text-primary underline">건보료 연말정산 가이드</a></li><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산기</a></li></ul></div>
`;

const julyAdjust = `
<p class="lead">4월 건강보험료 연말정산은 모든 직장인이 받는 부담. 성과급 큰 직원은 매년 200~1,000만원 추가 부과 가능. 정산액이 당월 보험료 이상이면 분할 납부 신청(12회 이내)으로 충격 완화.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 4월 정산 흐름</h2>
<ol class="space-y-2 mt-4">
<li><strong>1. 1~3월</strong>: 작년 보수총액 확정 (국세청 자료 연계)</li>
<li><strong>2. 4월</strong>: 정산금 4월분 보험료에 반영·고지</li>
<li><strong>3. ~5월 초</strong>: 정산액이 당월 보험료 이상이면 12회 이내 분할 납부 신청 (이자 없음)</li>
<li><strong>4. 이후</strong>: 분할 선택 시 다음 달부터 나눠 차감</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급별 정산금 추정</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">작년 성과급</th><th class="p-3">예상 정산금</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">2,000만</td><td class="p-3">약 80만</td></tr>
<tr class="border-t"><td class="p-3">5,000만</td><td class="p-3">약 200만</td></tr>
<tr class="border-t"><td class="p-3">1억</td><td class="p-3">약 400만</td></tr>
<tr class="border-t"><td class="p-3">2억</td><td class="p-3">약 800만</td></tr>
</tbody></table></div>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-2026" class="text-primary underline">건보료 연말정산 가이드</a></li></ul></div>
`;

const dependentBeforeBonus = `
<p class="lead">성과급 받기 전 가족 피부양자 자격 점검 필수. 2022년 11월 피부양자 요건 강화 — 연소득 2,000만원 + 재산세 과세표준 5.4억 이하. 본인 성과급으로 가족 피부양자 자격 박탈 가능성.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 피부양자 자격 점검</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>연소득 2,000만 이하</strong>: 사업소득은 사실상 0, 근로·연금소득 합산</li>
<li>· <strong>재산세 과세표준 5.4억 이하</strong>: 소득 있으면 더 엄격</li>
<li>· <strong>사업소득자</strong>: 연 500만 초과 시 피부양자 박탈</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 성과급 큰 직원의 함정</h2>
<p>본인이 성과급 받아도 피부양자 자격에 직접 영향 없음. 단 가족(부모·배우자)이 임대소득·연금소득·이자소득 등으로 2,000만 넘으면 그들이 피부양자에서 박탈 → 지역가입자 전환 → 월 50~150만원 보험료 부과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 사전 점검</h2>
<ul class="space-y-2 mt-4">
<li>· 부모·배우자 연소득 합산 점검 (1~2월)</li>
<li>· 임대소득 2,000만 초과 시 가족 부담</li>
<li>· 임의계속가입 신청 가능성 확인</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산</a></li></ul></div>
`;

const incomeAdjustmentTotal = `
<p class="lead">성과급 + 임대소득 + 금융소득 + 사업소득 다 합쳐 종합과세 + 4대보험 정산. 한 해 누적 소득이 1억+ 되면 다음해 4월 건보료 정산 + 5월 종소세로 추가 1,000만~3,000만원 부담 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 종합 정산 시뮬 (영끌 2억)</h2>
<p>연봉 7,000만 + 성과급 5,000만 + 임대소득 3,000만 + 배당 2,000만 + 사업소득 3,000만:</p>
<ul class="space-y-2 mt-4">
<li>· 종합소득 총: 2억</li>
<li>· 종합소득세: 약 4,500만</li>
<li>· 지방세: 450만</li>
<li>· 4대보험 정산 추가: 약 800만</li>
<li>· <strong>총 추가 부담: 약 5,750만</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 분산 절세</h2>
<ul class="space-y-2 mt-4">
<li>· 임대소득 2,000만 이하로 조정 → 분리과세</li>
<li>· 배당소득 부부 분산</li>
<li>· 사업소득 법인 전환 검토</li>
<li>· IRP·연금저축 + ISA 활용</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산</a></li></ul></div>
`;

const retireBonusFourInsurance = `
<p class="lead">퇴직금 + 성과급 같은 해 받으면 4대보험 부담 점프. 퇴직금은 4대보험 면제(국민연금·건강보험·고용보험 미부과), 단 성과급은 정상 부과. 4월 건보료 정산도 영향. 퇴직 시점 결정에 신중.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 퇴직금 vs 성과급 4대보험</h2>
<ul class="space-y-3 mt-4">
<li><strong>퇴직금</strong>: 4대보험 면제. 단 퇴직소득세는 별도 부과(환산급여 방식)</li>
<li><strong>성과급(재직 중)</strong>: 4대보험 정상 부과</li>
<li><strong>성과급(퇴직 후 지급)</strong>: 회사가 퇴직 후 지급해도 재직 시 발생분이라 4대보험 부과</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 12월 퇴직 + 1월 성과급</h2>
<ul class="space-y-2 mt-4">
<li>· 12월 퇴직금 5억: 퇴직소득세 약 3,000만</li>
<li>· 1월 성과급 5,000만: 근로소득세 + 4대보험 약 1,800만</li>
<li>· 합계 약 4,800만</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 퇴직금 IRP 이전</h2>
<p>퇴직금 5억 IRP 이전 → 즉시 세금 0원(이연), 향후 연금 분할 수령으로 5.5~3.3% 세율 적용 → 약 1,500만원 절감.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/severance" class="text-primary underline">퇴직금 계산기</a></li><li>· <a href="/tools/finance/irp" class="text-primary underline">IRP 계산기</a></li></ul></div>
`;

const optionalContinueAfterBonus = `
<p class="lead">성과급 큰 직원이 퇴직하면 임의계속가입이 유리한 경우가 많습니다. 지역가입자 보험료는 소득과 재산으로 다시 매겨지지만, 임의계속가입은 퇴직 전 최근 12개월 평균 보수월액 기준 보험료를 최대 36개월 유지합니다.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 임의계속가입 신청</h2>
<ul class="space-y-2 mt-4">
<li>· 지역가입자가 된 뒤 처음 받은 지역보험료 고지서의 납부기한부터 2개월 안에 신청</li>
<li>· 퇴직 다음 날부터 최대 36개월 유지 가능 (퇴직 전 직장가입자 자격 기간 통산 1년 이상 필요)</li>
<li>· 보수월액보험료는 본인이 전액 부담하되, 보건복지부 고시로 일부 경감</li>
<li>· 지역보험료 방식(소득월액 × 보험료율 + 재산 점수)이 아니라 퇴직 전 12개월 평균 보수월액 기준</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 성과급 큰 임원 퇴직</h2>
<p>연봉 1.5억 + 성과급 5,000만 임원 퇴직 후:</p>
<ul class="space-y-2 mt-4">
<li>· <strong>지역가입자</strong>: 전년도 소득과 주택 등 재산으로 보험료 산정 — 소득·재산이 크면 직장 시절 본인 부담보다 커질 수 있음 (월 상한 4,591,740원)</li>
<li>· <strong>임의계속가입</strong>: 퇴직 전 12개월 평균 보수월액 기준 보험료를 최대 36개월</li>
<li>· <strong>절감액은 사람마다 다름</strong> — 건강보험공단에서 지역보험료 예상액을 확인해 두 금액을 비교</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 영역 D — 성과급 절세 심화 (10편)
// ═══════════════════════════════════════════════════════════════

const irpMaxBonus = `
<p class="lead">성과급 받기 직전 IRP 900만원 + 연금저축 600만원 합산 만기 납입 → 한도 1,500만원? 단 세액공제 한도는 <strong>전 연령 공통 IRP + 연금저축 합산 900만원</strong>(연금저축 단독 600만원). 과거 '만 50세 이상 1,200만원 한시 상향'은 2022년 종료된 옛 특례이며, 현재는 ISA 만기 자금 전환분을 합산할 때만 최대 1,200만원까지 가능. 성과급 받는 해는 한계세율 높아 절세 효과 최대.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 2026 IRP·연금저축 한도</h2>
<ul class="space-y-2 mt-4">
<li>· IRP + 연금저축 <strong>합산 900만원</strong> (전 연령 공통, 연금저축 단독 600만원)</li>
<li>· ISA 만기 전환 시 추가: 전환액의 10%, 최대 300만원 → 합산 최대 <strong>1,200만원</strong></li>
<li>· 세액공제율: 총급여 5,500만 이하 16.5%, 초과 13.2%</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 받는 해 환급</h2>
<p>연봉 1억 + 성과급 5,000만 (영끌 1.5억), 한계세율 35%:</p>
<ul class="space-y-2 mt-4">
<li>· IRP 900만 납입 (12월 31일까지)</li>
<li>· 환급: 900 × 13.2% = 약 119만원</li>
<li>· 13.2%는 지방소득세를 포함한 실효 공제율 (별도 가산 없음)</li>
<li>· ISA 만기 전환분 합산으로 최대 1,200만 공제 시 → 약 158만원 (아래 참고)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 추가 — ISA 만기 자금 전환</h2>
<p>ISA 만기 시 IRP·연금저축 전환 가능 → 추가 300만원 세액공제 한도 발생. 성과급 받는 해 전환 시 약 40만원 추가 환급.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/irp" class="text-primary underline">IRP 계산기</a></li></ul></div>
`;

const isaForBonus = `
<p class="lead">성과급 받는 해는 한계세율 35%+ 진입 가능. ISA로 운용하면 비과세 200만원 + 초과분 9.9% 분리과세 → 일반 계좌 종합과세 35% 대비 큰 절세. 성과급 일부를 ISA 만기 적립 활용 추천.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 ISA 활용 시나리오</h2>
<ul class="space-y-2 mt-4">
<li>· 성과급 일부(2,000만원) ISA 적립</li>
<li>· 5년 운용 (연 7% 가정) → 약 2,800만원</li>
<li>· 차익 800만원 중 200만 비과세 + 600만 × 9.9% = 약 60만원 세금</li>
<li>· 일반 계좌라면 800 × 15.4% = 123만원 세금 → <strong>약 63만원 절감</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 ISA 한도</h2>
<ul class="space-y-2 mt-4">
<li>· 연 2,000만원, 5년 누적 1억</li>
<li>· 일반형 비과세 200만</li>
<li>· 서민형 비과세 400만</li>
<li>· 만기 후 IRP·연금저축 전환 가능</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/savings-interest-2026" class="text-primary underline">적금·예금 이자 계산</a></li></ul></div>
`;

const giftWithBonus = `
<p class="lead">성과급 받은 해 자녀에게 5,000만원 (성인) 비과세 증여 동시 진행. 본인 절세 + 자녀 자산 형성 + 세대 간 자산 이전 효과. 10년 후 다시 5,000만 증여 가능 → 평생 1.4억+ 비과세.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 자녀 증여 비과세</h2>
<ul class="space-y-2 mt-4">
<li>· 미성년 자녀: 10년 2,000만원</li>
<li>· 성인 자녀: 10년 5,000만원</li>
<li>· 배우자: 10년 6억원</li>
<li>· 손자녀: 10년 5,000만원</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 성과급 5,000만 → 자녀 증여</h2>
<ul class="space-y-2 mt-4">
<li>· 본인 성과급 실수령 약 3,000만</li>
<li>· 5,000만원 자녀 증여 (별도 자금) → 증여세 0원</li>
<li>· 자녀 명의 펀드·청약통장·청년주택드림 운용</li>
<li>· 본인 자산이 자녀로 점진적 이전 (상속세 절세 효과)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산기</a></li></ul></div>
`;

const coupleSplitBonus = `
<p class="lead">맞벌이 부부의 연말정산 몰아주기는 항목마다 방향이 다릅니다. <strong>인적공제처럼 소득에서 빼는 공제는 적용 세율이 높은 쪽</strong>(대개 성과급을 받은 쪽), <strong>의료비는 총급여 3% 문턱이 낮은 쪽</strong>, <strong>신용카드는 총급여 25% 문턱을 넘길 수 있는 쪽</strong>에 두는 것이 기본입니다. 성과급으로 총급여가 1억 5,000만원이 된 배우자와 5,000만원인 배우자라면, 의료비 600만원을 총급여가 낮은 쪽이 결제할 때 부부 소득세 합계가 45만원 적고, 6세 자녀의 기본공제를 총급여가 높은 쪽에 두면 30만원 적었습니다(이 사이트 연말정산 엔진 계산). 기준일은 2026년 9월 26일이며 2026년 귀속(2027년 1~2월 연말정산) 기준입니다.</p>

<h2>항목별 몰아주기 방향</h2>
<p>핵심은 공제의 성격입니다. 소득공제는 과세표준을 줄이므로 세율이 높은 사람에게 몰수록 효과가 크고, 세액공제는 세금에서 정해진 비율을 빼므로 세율과 관계없이 같은 금액이 줄어듭니다. 대신 세액공제에는 문턱과 산출세액이라는 조건이 붙습니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>항목</th><th>성격</th><th>유리한 쪽</th><th>주의할 점</th></tr>
</thead>
<tbody>
<tr><td>자녀·부모 기본공제(1명 150만원)</td><td>소득공제</td><td>적용 세율이 높은 쪽</td><td>같은 사람을 부부가 중복 공제할 수 없음</td></tr>
<tr><td>의료비</td><td>세액공제 15%</td><td>총급여 3% 문턱이 낮은 쪽</td><td>배우자 의료비는 실제로 낸 사람이 공제, 자녀·부모 의료비는 기본공제 받는 사람이 낸 것만</td></tr>
<tr><td>신용카드 등 사용액</td><td>소득공제</td><td>총급여 25%를 넘길 수 있는 쪽</td><td>각자 명의 사용분만 각자 공제, 부부 합산 불가</td></tr>
<tr><td>교육비</td><td>세액공제 15%</td><td>자녀 기본공제를 받는 쪽</td><td>기본공제와 교육비를 나눠 받을 수 없음</td></tr>
<tr><td>보장성 보험료</td><td>세액공제 12%</td><td>보험료를 낸 사람</td><td>피보험자가 낸 사람의 기본공제대상자여야 함 — 소득이 있는 배우자가 피보험자면 불가</td></tr>
<tr><td>기부금</td><td>세액공제</td><td>기부한 사람</td><td>소득이 있는 배우자의 기부금은 배우자 본인만 공제</td></tr>
<tr><td>연금저축·IRP</td><td>세액공제</td><td>각자 본인 계좌</td><td>총급여 5,500만원 이하는 공제율 15%, 초과는 12%</td></tr>
</tbody>
</table>
<p>성과급을 받은 해에는 이 방향이 더 뚜렷해집니다. 한쪽의 총급여가 크게 늘면 그 사람의 적용 세율은 올라가고, 동시에 의료비 3% 문턱과 신용카드 25% 문턱도 함께 올라가기 때문입니다.</p>

<h2>성과급 받은 해 계산 예시</h2>
<p>연봉 9,000만원에 성과급 6,000만원을 받아 총급여 1억 5,000만원이 된 A와 총급여 5,000만원인 배우자 B를 가정했습니다. 이 사이트 <a href="/year-end-tax">연말정산 계산기</a>와 같은 엔진으로 각자의 결정세액(소득세)을 계산해 합쳤고, 4대보험료 외 다른 공제는 없다고 봤습니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>상황</th><th>A가 공제</th><th>B가 공제</th><th>부부 소득세 차이</th></tr>
</thead>
<tbody>
<tr><td>부부 중 한 사람의 의료비 600만원</td><td>(600만 − 450만) × 15% = 22만 5,000원</td><td>(600만 − 150만) × 15% = 67만 5,000원</td><td>B가 결제하면 45만원 적음</td></tr>
<tr><td>6세 자녀 기본공제 150만원</td><td>과세표준 35% 구간 → 52만 5,000원 절감</td><td>과세표준 15% 구간 → 22만 5,000원 절감</td><td>A에게 두면 30만원 적음</td></tr>
<tr><td>신용카드 1,500만원 사용</td><td>문턱 3,750만원 미달 → 0원</td><td>문턱 1,250만원 초과 → 5만 6,250원 절감</td><td>B 명의로 쓰면 5만 6,250원 적음</td></tr>
</tbody>
</table>
<p>지방소득세(소득세의 10%)까지 더하면 차이는 각각 49만 5,000원, 33만원, 6만 1,875원입니다. B 명의 카드 사용액 가운데 1,000만원을 체크카드로 쓰면 공제율이 30%라 절감액이 11만 2,500원으로 늘어납니다. 자녀는 6세로 가정해 자녀세액공제 없이 기본공제만 비교했습니다.</p>
<p>주의할 점은 자녀 기본공제와 자녀 의료비가 묶여 있다는 것입니다. 자녀 의료비는 그 자녀의 기본공제를 받는 사람이 낸 것만 공제되므로, 자녀 의료비가 크면 자녀를 총급여가 낮은 쪽에 두는 편이 나을 수도 있습니다. 두 조합을 모두 계산해 보는 것이 가장 정확하며, <a href="/calc/dual-income-year-end">맞벌이 연말정산 몰아주기 계산기</a>가 자녀 귀속과 지출 배분 조합을 비교해 줍니다.</p>

<h2>몰아줄 수 없는 것들</h2>
<ul>
<li><strong>신용카드 사용액 합산</strong>: 맞벌이 부부는 각자 사용한 금액을 각자 공제받습니다. 배우자 카드 사용액을 본인 것에 합쳐 신고하면 과다공제가 됩니다. 이미 쓴 금액을 옮길 수는 없으니 남은 기간의 결제 명의를 미리 정해야 합니다.</li>
<li><strong>자녀·부모 의료비의 지출자</strong>: 자녀 의료비는 자녀 기본공제를 받는 사람이 낸 것만, 부모 의료비는 부모 기본공제를 받는 자녀가 낸 것만 공제됩니다. 다른 사람이 낸 의료비는 기본공제를 받은 사람도, 낸 사람도 공제받지 못합니다.</li>
<li><strong>배우자 의료비는 예외</strong>: 맞벌이 부부가 배우자를 위해 낸 의료비는 배우자의 소득과 관계없이 실제로 낸 사람이 공제받습니다. 진료받은 배우자가 공제받는 것이 아닙니다.</li>
<li><strong>부양가족 중복 공제</strong>: 같은 자녀나 부모를 부부가 동시에 기본공제로 올릴 수 없습니다. 한쪽을 정해 그 사람의 연말정산에만 넣습니다.</li>
<li><strong>실손보험금</strong>: 실손의료보험으로 돌려받은 금액은 의료비에서 빼고 계산하므로, 몰아주기 전에 보험금 수령액부터 확인하세요.</li>
</ul>

<h2>세액공제는 세율과 무관하지만 산출세액에 막힙니다</h2>
<p>의료비·교육비·기부금 세액공제는 공제 대상 금액에 법정 비율(의료비·교육비 15%)을 곱해 세금에서 빼므로, 적용 세율이 35%인 사람이 받든 15%인 사람이 받든 같은 금액이 줄어듭니다. "세율이 높은 쪽이 의료비를 받아야 환급이 크다"는 설명은 소득공제와 세액공제를 혼동한 것입니다. 의료비에서 누가 유리한지는 세율이 아니라 총급여 3% 문턱으로 갈리고, 금액이 크면 한도도 함께 봐야 합니다. 배우자를 위해 낸 의료비는 연 700만원 한도가 있는 일반 의료비로 들어가지만(배우자가 65세 이상이거나 장애인 등이면 한도 없음), 본인 의료비는 한도가 없습니다.</p>
<p>대신 세액공제는 그 사람의 산출세액을 넘어서 돌려받지 못합니다. 총급여가 낮은 배우자에게 의료비·교육비를 몰았는데 원래 낼 세금이 적다면 공제가 다 쓰이지 않을 수 있습니다. 또 한쪽에 특별공제를 모두 몰면 다른 쪽은 건강보험료 공제만 남는데, 그쪽 총급여가 3,000만원 안팎이면 표준세액공제 13만원이 더 나을 수 있습니다. 자세한 비교는 <a href="/guides/standard-vs-special-deduction-2026">표준세액공제 vs 특별공제</a>에 정리했습니다.</p>

<h2>12월 31일 전에 할 일</h2>
<ul>
<li><strong>총급여 추정</strong>: 성과급 지급 시기와 금액을 반영해 부부 각자의 올해 총급여를 계산합니다. 의료비 3%, 신용카드 25% 문턱이 여기서 정해집니다.</li>
<li><strong>남은 결제의 명의 정하기</strong>: 큰 의료비나 생활비 결제를 누구 카드·계좌로 할지 연말 전에 정합니다. 카드는 문턱을 이미 넘은 쪽에서 체크카드·현금영수증 비중을 높이는 것이 효과적입니다.</li>
<li><strong>부양가족 귀속 정하기</strong>: 기본공제 대상 여부는 12월 31일 현재 상황으로 판정하므로, 자녀·부모를 누구 쪽에 올릴지 미리 합의합니다. 요건은 <a href="/calc/dependent-check">부양가족 공제 판정기</a>에서 확인할 수 있습니다.</li>
<li><strong>성과급 세금 확인</strong>: 성과급 자체의 원천징수와 실수령은 <a href="/calc/bonus-calculators">성과급 계산기 모음</a>에서, 연말정산 전체 일정은 <a href="/year-end-tax-2027">연말정산 2027 총정리</a>에서 이어서 확인하세요.</li>
</ul>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 남편 카드로 결제한 아내의 병원비는 누가 공제받나요?</strong> — 실제로 결제한 남편이 공제받습니다. 국세청 안내에 따르면 맞벌이 부부가 배우자를 위해 지출한 의료비는 지출한 근로자 본인이 공제받고, 진료받은 배우자가 받는 것이 아닙니다.</li>
<li><strong>Q. 아내 명의 카드 사용액을 남편 연말정산에 합칠 수 있나요?</strong> — 맞벌이라면 합칠 수 없습니다. 각자 사용한 금액을 각자 공제받으며, 합산해 신고하면 과다공제에 해당해 나중에 세금을 추가로 낼 수 있습니다.</li>
<li><strong>Q. 자녀 기본공제는 남편이, 자녀 의료비는 아내가 받을 수 있나요?</strong> — 안 됩니다. 자녀 의료비와 교육비는 그 자녀의 기본공제를 받는 사람이 지출한 것만 공제됩니다.</li>
<li><strong>Q. 성과급을 받은 쪽에 모든 공제를 몰면 되지 않나요?</strong> — 소득공제는 그렇지만 의료비는 반대입니다. 성과급으로 총급여가 늘면 의료비 문턱(총급여의 3%)과 카드 문턱(25%)이 함께 올라가 공제받을 수 있는 금액이 줄어듭니다.</li>
</ul>

<p>근거: <a href="https://www.law.go.kr/법령/소득세법/제59조의4" target="_blank" rel="noopener noreferrer">소득세법 제59조의4(의료비·교육비 세액공제)</a> · <a href="https://www.law.go.kr/법령/소득세법/제50조" target="_blank" rel="noopener noreferrer">소득세법 제50조(기본공제)</a> · <a href="https://www.law.go.kr/법령/조세특례제한법/제126조의2" target="_blank" rel="noopener noreferrer">조세특례제한법 제126조의2(신용카드 등 소득공제)</a> · <a href="https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=1318&amp;ctgId=CTG11909" target="_blank" rel="noopener noreferrer">국세상담센터 의료비 Q&amp;A</a> · <a href="https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=1318&amp;ctgId=CTG11898" target="_blank" rel="noopener noreferrer">국세상담센터 신용카드 Q&amp;A</a>. 기준일 2026-09-26 — 법령은 2026년 귀속 시행본 기준이며, 계산 예시는 이 사이트 연말정산 엔진(2026년 귀속 세율·4대보험 요율) 값입니다.</p>
`;

const parentSupportBonus = `
<p class="lead">성과급 받는 해 부모 부양 등록 절세 효과 최대. 인적공제 150 + 경로우대 100 + 부모 의료비 + 부모 보험료 합산 시 한계세율 35% 적용으로 약 100~200만원 환급. 형제·자매 중 한계세율 높은 사람이 등록 권장.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 부모 부양 종합 절세</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>인적공제</strong>: 150만 × 한계세율</li>
<li>· <strong>경로우대(70+)</strong>: 추가 100만 × 한계세율</li>
<li>· <strong>의료비 공제</strong>: 부모 의료비 100% 공제 가능</li>
<li>· <strong>보험료 공제</strong>: 부모 명의 본인 결제 100만 한도</li>
<li>· <strong>장애인 공제</strong>: 200만 추가</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 성과급 받는 해 부모 2명 등록</h2>
<p>본인 한계세율 35%, 부모 1명 만 75세 + 의료비 200만 가정:</p>
<ul class="space-y-2 mt-4">
<li>· 인적공제 2 × 150 = 300만</li>
<li>· 경로우대(75세) 100만</li>
<li>· 의료비 200만 - 3% 한도 = 약 50만 공제</li>
<li>· 총 공제 약 450만 × 35% = 약 158만 + 지방세 16만 = <strong>약 174만원 환급</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const medicalEduConcentration = `
<p class="lead">성과급 받는 해 의료비·교육비·기부금을 한 해에 집중 결제. 한계세율 35%+ 구간에서 공제 효과 12%p+ 큼. 임플란트·치과·자녀 대학원·기부금 등 큰 비용을 성과급 받는 해에 몰아 결제.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 집중 결제 전략</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 의료비</strong>: 임플란트·치아교정·산후조리원·난임시술 한 해에 몰기</li>
<li><strong>② 교육비</strong>: 자녀 대학원·본인 학위 과정 한 해 결제</li>
<li><strong>③ 기부금</strong>: 정치자금·종교단체·복지단체 일괄</li>
<li><strong>④ 청약통장</strong>: 매월 25만 채워 연 300만 한도</li>
<li><strong>⑤ 신용카드 vs 체크</strong>: 25% 초과분 체크·전통시장 활용</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 추가 환급</h2>
<p>한계세율 35% 적용 시 의료비 500만 + 교육비 600만 + 기부금 200만 = 합산 약 200~250만원 추가 환급 (한계 24% 대비 +60~80만원).</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const cardCategoryBonus = `
<p class="lead">성과급 받는 해는 신용카드 25% 기준선이 올라감(총급여 1.5억이면 25% = 3,750만). 그 위로 사용한 분만 공제. 체크카드 30% + 전통시장 40% + 대중교통 40% 활용으로 추가 환급 확보.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 카드 사용 전략</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>25% 기준선까지</strong>: 신용카드(포인트·혜택 우선)</li>
<li>· <strong>25% 초과분</strong>: 체크카드 30% (포인트 일부 손해 vs 공제 +15%p)</li>
<li>· <strong>장보기·식비</strong>: 전통시장 40% (한도 100만 추가)</li>
<li>· <strong>출퇴근·여행</strong>: 대중교통 40% (한도 100만 추가)</li>
<li>· <strong>도서·공연·박물관·영화</strong>: 30% (한도 100만 추가)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 한계세율 35% 직장인</h2>
<p>연간 추가 1,000만원을 체크·전통·대중교통으로 전환 시:</p>
<ul class="space-y-2 mt-4">
<li>· 평균 공제율 35%(혼합)</li>
<li>· 1,000 × 35% = 350만 공제</li>
<li>· × 한계세율 35% = 약 122만원 환급</li>
<li>· 일반 신용카드(15%) 대비 약 70만원 추가 환급</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const monthlyRent17Bonus = `
<p class="lead">성과급 받는 해에도 월세 세액공제(15~17%)는 챙길 수 있는 대표 공제. 단 <strong>총급여 8,000만원 이하</strong> 무주택 세대주만 대상 — 성과급이 더해져 총급여 8,000만원을 넘으면 그해는 공제 대상에서 제외되니 주의. 월 50만(연 600만) 시 최대 102만 환급.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 월세 세액공제 자격</h2>
<ul class="space-y-2 mt-4">
<li>· 무주택 세대주 (본인 + 배우자)</li>
<li>· <strong>총급여 8,000만원 이하</strong> (종합소득 7,000만원 이하) — 한도 연 1,000만원</li>
<li>· 국민주택규모(85㎡) 이하 또는 기준시가 4억 이하</li>
<li>· 본인 명의 임대차계약서</li>
<li>· <strong>⚠️ 주의:</strong> 성과급 포함 총급여가 8,000만원을 초과하면 그해는 공제 대상 제외</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 월세 60만 (연 720만)</h2>
<ul class="space-y-2 mt-4">
<li>· 한도 1,000만원 내 적용</li>
<li>· 총급여 5,500만 이하: 17% = 122.4만원 환급 (지방세 포함 약 134.6만원)</li>
<li>· 총급여 5,500만 초과~8,000만 이하: 15% = 108만원 환급 (지방세 포함 약 118.8만원)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 5년 경정청구</h2>
<p>그동안 월세 공제 안 받았으면 5년 이내 경정청구로 환급 가능. 5년 미신청자는 최대 500만+ 환급 가능.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/monthly-rent-tax-credit-quick" class="text-primary underline">월세 세액공제 계산</a></li></ul></div>
`;

const housingSub25Bonus = `
<p class="lead">청약통장 매월 25만 납입 시 소득공제 300만 한도 40% = 120만 공제. 성과급 받는 해 한계세율 35%면 약 42만원 환급. 5년이면 청약 가점 만점 + 누적 200만원+ 환급.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 청약통장 소득공제</h2>
<ul class="space-y-2 mt-4">
<li>· 무주택 세대주, 총급여 7,000만 이하</li>
<li>· 매월 25만 × 12 = 연 300만 한도</li>
<li>· 공제 40% = 120만 공제</li>
<li>· 한계세율 35% 적용 시 약 42만원 환급</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 5년 누적 효과</h2>
<ul class="space-y-2 mt-4">
<li>· 5년 납입: 1,500만원 (청약 가점 만점)</li>
<li>· 5년 누적 환급: 약 200~230만원</li>
<li>· 청약 가점 만 17점 + 무주택 가점</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/housing-subscription" class="text-primary underline">청약 시뮬레이터</a></li></ul></div>
`;

const insurance100Bonus = `
<p class="lead">성과급 받는 해 보장성 보험료 100만 한도 12% 공제 = 12만 환급. 한계세율 35% 적용 시 추가 환급 효과는 한정적이나 누락 없이 챙겨야 할 항목.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 보장성 보험 공제</h2>
<ul class="space-y-2 mt-4">
<li>· 종신·암·정기·실손·자동차·운전자·어린이 보험</li>
<li>· 한도 100만원</li>
<li>· 세액공제 12% = 최대 12만원</li>
<li>· 본인·부양가족 명의 모두 가능</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 제외</h2>
<ul class="space-y-2 mt-4">
<li>· 저축성 보험·연금보험</li>
<li>· 변액보험</li>
<li>· 단체상해보험 회사 부담분</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 영역 E — 성과급 시점·실전 (10편)
// ═══════════════════════════════════════════════════════════════

const opiTaiTimingCompare = `
<p class="lead">삼성 1월 OPI vs 6월·12월 TAI 시점별 세금 차이. 1월 OPI는 연 시작 단일 지급으로 한계세율 점프 가능, 7월 TAI는 분할 지급 효과로 한계세율 분산. 절세 관점에선 분할(TAI) 지급이 유리.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 OPI vs TAI 세금 비교</h2>
<p>기본급 6,000만 + OPI 30%(1,800만) + TAI 50% × 2회(3,000만) = 영끌 1.08억:</p>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">시나리오</th><th class="p-3">총 세금</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">OPI 1월 일시 + TAI 분할</td><td class="p-3">약 2,800만</td></tr>
<tr class="border-t"><td class="p-3">OPI·TAI 모두 분할</td><td class="p-3">약 2,650만</td></tr>
<tr class="border-t"><td class="p-3"><strong>차이</strong></td><td class="p-3">약 150만</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 인사팀 협상</h2>
<p>OPI 분할 지급 가능한 경우 적극 요청. 회사도 세무상 일부 유리해 협상 가능성 큼.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/samsung-bonus" class="text-primary underline">삼성 OPI·TAI 시뮬</a></li></ul></div>
`;

const december1January = `
<p class="lead">12월 인센티브 vs 1월 인센티브 — 같은 금액이라도 세금 차이 거의 없음 (연간 합산이므로). 단 건보료 연말정산(다음해 4월) 시점, IRP·연금저축 한도 도달, 신용카드 25% 기준선 달성에는 큰 영향. 12월 지급은 그 해 정산 직결, 1월 지급은 다음해.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 12월 vs 1월 영향</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 연말정산</strong>: 12월 지급은 당해, 1월 지급은 다음해 정산</li>
<li><strong>② IRP·연금저축 한도</strong>: 12월 31일까지 납입 분만 당해 공제 → 12월 지급 받고 즉시 납입 가능</li>
<li><strong>③ 건보료 연말정산(4월)</strong>: 12월 지급분은 다음해 4월 정산, 1월 지급분은 그 다음해 4월 정산</li>
<li><strong>④ 신용카드 한도</strong>: 12월 지급으로 25% 기준선 추가 도달 어려움</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li></ul></div>
`;

const moveCompanyBonus = `
<p class="lead">이직 중 성과급 받는 경우 — 전 회사 기여분(전 회사 지급) + 신 회사 기여분(신 회사 지급) 모두 근로소득. 종합소득세 신고 시 둘 다 합산. 4월 건보료 정산도 양쪽 통합.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 이직 중 성과급 처리</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>전 회사 성과급</strong>: 퇴직 후 지급되어도 원천징수 + 근로소득</li>
<li>· <strong>신 회사 성과급</strong>: 정상 처리</li>
<li>· <strong>합산</strong>: 5월 종소세 신고 시 합산. 한계세율 점프 가능</li>
<li>· <strong>이중 공제</strong>: 인적공제·기본공제 중복 안 됨</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 5월 이직 + 7월 전 회사 성과급</h2>
<p>전 회사 4개월 근무 후 신 회사 8개월. 7월 전 회사 성과급 3,000만 + 12월 신 회사 성과급 2,000만:</p>
<ul class="space-y-2 mt-4">
<li>· 종합 성과급 5,000만 + 양 회사 연봉 합산</li>
<li>· 5월 종소세 신고 시 양쪽 모두 합산</li>
<li>· 한계세율 점프 시 추가 1,000만+ 세금</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산</a></li></ul></div>
`;

// ── bonus-retire-impact-severance-2026 (2026-09-30 키퍼 재작성, GUIDES-05) ──
// 예시 금액은 /tools/finance/severance 계산기와 같은 엔진(calculateSeverancePay)으로 계산해 끼운다.
// 사실 근거: docs/guides-facts-2026-10-G2C.md G-01~G-14. 회귀: __tests__/guideG2cKeepers.test.ts
/** 월 임금 500만원, 입사 2016-10-01 · 마지막 근무일 2026-09-30 (재직 3,652일, 산정 기간 7/1~9/30 92일) */
export const SEVERANCE_BONUS_EXAMPLE = { start: "2016-10-01", last: "2026-09-30", monthly: 5_000_000 } as const;
export const SEVERANCE_BONUS_ROWS = [0, 6_000_000, 12_000_000, 24_000_000].map((bonus) => ({
  bonus,
  r: calculateSeverancePay(
    SEVERANCE_BONUS_EXAMPLE.start,
    SEVERANCE_BONUS_EXAMPLE.last,
    [SEVERANCE_BONUS_EXAMPLE.monthly, SEVERANCE_BONUS_EXAMPLE.monthly, SEVERANCE_BONUS_EXAMPLE.monthly],
    bonus,
    0
  ),
}));
const sevBase = SEVERANCE_BONUS_ROWS[0].r;
const sev1200 = SEVERANCE_BONUS_ROWS[2].r;
/** 평균임금에 들어가는 연 상여 1,200만원이 늘리는 세전 퇴직금 */
export const SEVERANCE_GAIN_1200 = sev1200.estimatedSeverancePay - sevBase.estimatedSeverancePay;
/** 평균임금에 들어가는 연 상여 100만원당 근속 1년에 늘어나는 퇴직금 (100원 단위) */
export const SEVERANCE_PER_100_PER_YEAR =
  Math.round(SEVERANCE_GAIN_1200 / 12 / (sevBase.totalDaysOfEmployment / 365) / 100) * 100;
const sevTableRows = SEVERANCE_BONUS_ROWS.map(
  ({ bonus, r }) =>
    `<tr><td>${bonus === 0 ? "0원 (평균임금에서 빠짐)" : g2cMan(bonus)}</td><td>${g2cWon(r.averageDailyWage)}</td><td>${g2cMan(r.estimatedSeverancePay)}</td><td>${g2cWon(r.incomeTax + r.localTax)}</td><td>${g2cMan(r.netSeverancePay)}</td></tr>`
).join("\n");

const bonusRetireImpact = `
<p class="lead">성과급이 퇴직금에 들어가는지는 그 성과급이 <strong>평균임금에 포함되는 임금인지</strong>로 정해집니다. 2026년 대법원은 삼성전자의 목표 인센티브는 포함하고, 사업부 이익에 연동한 성과 인센티브와 해마다 노사합의로 정한 경영성과급은 뺐습니다. 포함되는 상여는 연간 총액의 3/12를 퇴직 전 3개월 임금에 더하므로, 월 임금 500만원·근속 10년이면 연 1,200만원이 들어갈 때 퇴직금이 약 ${g2cMan(SEVERANCE_GAIN_1200)} 늘어납니다(근로자퇴직급여 보장법 제8조·고용노동부 산정 방식, 기준일 2026년 9월 30일).</p>

<h2>퇴직금은 어떤 공식으로 계산하나요</h2>
<p>퇴직금은 계속근로 1년마다 30일분 이상의 평균임금입니다(근로자퇴직급여 보장법 제8조). 평균임금은 퇴직일 이전 3개월 동안 받은 임금 총액을 그 기간의 총일수로 나눈 금액이고, 이렇게 구한 값이 통상임금보다 적으면 통상임금을 평균임금으로 씁니다(근로기준법 제2조). 상여금은 퇴직 전 3개월 안에 받았는지와 관계없이 퇴직 전 1년 동안 받은 총액의 3/12만 더합니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>단계</th><th>계산</th><th>근거</th></tr></thead>
<tbody>
<tr><td>① 3개월 임금</td><td>퇴직일 이전 3개월의 기본급·수당 합계</td><td>근로기준법 제2조 제1항 제6호</td></tr>
<tr><td>② 상여 가산</td><td>퇴직 전 1년간 받은 상여 총액 × 3/12</td><td>고용노동부 퇴직금 계산 방식</td></tr>
<tr><td>③ 연차수당 가산</td><td>미사용 연차수당 × 3/12</td><td>고용노동부 퇴직금 계산 방식</td></tr>
<tr><td>④ 1일 평균임금</td><td>(① + ② + ③) ÷ 3개월의 총일수(89~92일)</td><td>근로기준법 제2조</td></tr>
<tr><td>⑤ 퇴직금</td><td>1일 평균임금 × 30일 × 재직일수 ÷ 365</td><td>근로자퇴직급여 보장법 제8조</td></tr>
</tbody></table></div>
<p>산정 기간에 육아휴직, 출산전후휴가, 업무상 부상·질병 요양, 사용자 귀책 휴업 같은 기간이 끼어 있으면 그 기간과 그 기간에 받은 임금을 빼고 계산합니다(근로기준법 시행령 제2조). 퇴직금은 지급 사유가 생긴 날부터 14일 안에 지급해야 하고(당사자 합의로 연장 가능), 원칙적으로 근로자가 지정한 개인형퇴직연금(IRP) 계좌로 옮기는 방식으로 줍니다. 55세 이후 퇴직 등은 예외입니다(같은 법 제9조). 입사일·퇴사일·3개월 임금·연간 상여를 <a href="/tools/finance/severance">퇴직금 계산기</a>에 넣으면 이 표와 같은 순서로 계산합니다.</p>

<h2>어떤 성과급이 평균임금에 들어가나요</h2>
<p>판례의 기준은 이름이 아니라 지급 구조입니다. 사용자에게 지급의무가 있고(단체협약·취업규칙·급여규정·근로계약·노동관행), 계속적·정기적으로 지급되며, 지급의무의 발생이 근로 제공과 직접 또는 밀접하게 관련돼야 평균임금에 들어갑니다. 계속적·정기적으로 받았더라도 근로의 대가로 볼 수 없으면 빠집니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>성과급 유형</th><th>평균임금</th><th>판단 근거</th></tr></thead>
<tbody>
<tr><td>취업규칙·단체협약에 지급률이 정해져 정기적으로 나오는 상여</td><td>포함</td><td>지급의무와 정기성 — 판례의 기본 기준</td></tr>
<tr><td>반기마다 사업부 평가 등급(A~D)에 따라 상여기초금액의 0~100%를 주는 삼성전자 목표 인센티브(보도상 TAI)</td><td>포함</td><td>대법원 2026. 1. 29. 선고 2021다248299</td></tr>
<tr><td>사업부 경제적 부가가치(EVA)의 20%를 재원으로 한 삼성전자 성과 인센티브(보도상 OPI)</td><td>제외</td><td>같은 판결 — 근로 제공과 밀접한 관련이 없다고 봄</td></tr>
<tr><td>해마다 노사합의로 지급 여부·기준을 정해 생산량·영업이익에 따라 준 경영성과급</td><td>제외</td><td>대법원 2026. 2. 12. 선고 2021다219994(보도상 SK하이닉스 사건)</td></tr>
<tr><td>지급 대상·조건이 정해져 해마다 나오는 공공기관 경영평가성과급</td><td>포함</td><td>대법원 2018. 10. 12. 선고 2015두36157</td></tr>
<tr><td>지급의무 없이 회사 재량으로 한 번 주는 격려금·포상금</td><td>포함되기 어려움</td><td>지급의무가 없으면 임금으로 보기 어렵다는 같은 기준</td></tr>
</tbody></table></div>
<p>삼성전자 사건은 원심을 깨고 수원고등법원으로 돌려보냈으므로, 원고별 퇴직금 차액은 파기환송심에서 정해집니다. 판결은 해당 회사의 지급 규정과 이력을 보고 내린 판단이라 다른 회사 성과급에 그대로 옮겨 적용할 수는 없습니다. 우리 회사 성과급이 어느 쪽에 가까운지는 지급 규정, 재원 산식, 지급 이력을 함께 봐야 합니다. 회사별 지급률은 <a href="/calc/samsung-bonus">삼성전자 성과급 계산기</a>와 <a href="/calc/sk-hynix-bonus">SK하이닉스 성과급 계산기</a>에서 확인할 수 있습니다.</p>
<p>통상임금은 2024년 12월 대법원 전원합의체가 고정성 요건을 빼면서 재직 조건이 붙은 정기상여도 통상임금이 될 수 있게 바뀌었습니다(2020다247190). 다만 퇴직금의 기준은 평균임금이고, 통상임금은 평균임금이 더 적을 때만 대신 쓰입니다. 시간외수당 기준이 궁금하면 <a href="/calc/ordinary-wage">통상임금 계산기</a>를 보세요.</p>

<h2>성과급이 들어가면 퇴직금이 얼마나 늘어나나요</h2>
<p>월 임금 500만원, 입사 2016년 10월 1일, 마지막 근무일 2026년 9월 30일(재직 ${sevBase.totalDaysOfEmployment.toLocaleString("ko-KR")}일, 산정 기간 7월 1일~9월 30일 92일), 연차수당은 없다고 두고 평균임금에 들어가는 연간 상여만 바꿨습니다. 퇴직소득세는 지방소득세를 더한 금액입니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>평균임금에 들어가는 연 상여</th><th>1일 평균임금</th><th>퇴직금(세전)</th><th>퇴직소득세·지방소득세</th><th>세후 수령</th></tr></thead>
<tbody>
${sevTableRows}
</tbody></table></div>
<p>평균임금에 들어가는 연 상여가 100만원 늘 때마다 근속 1년에 약 ${g2cWon(SEVERANCE_PER_100_PER_YEAR)}(100만원 × 3/12 ÷ 92일 × 30일)이 더해집니다. 같은 연간 금액을 월급에 나눠 받아도 퇴직 전 3개월분, 곧 연간 금액의 3/12만 평균임금에 들어가므로 퇴직금에 미치는 효과는 같고, 늘어나는 금액은 근속연수에 비례해 커집니다. 같은 사람이라도 연 1,200만원짜리 성과급이 평균임금에서 빠지면 퇴직금은 ${g2cMan(sevBase.estimatedSeverancePay)}, 들어가면 ${g2cMan(sev1200.estimatedSeverancePay)}입니다.</p>

<h2>퇴직금에는 세금이 얼마나 붙나요</h2>
<p>퇴직금은 근로소득과 합치지 않고 퇴직소득으로 따로 과세합니다. 먼저 근속연수공제를 빼고, 남은 금액을 근속연수로 나눠 12를 곱한 환산급여에서 환산급여공제를 뺀 뒤 기본세율을 적용하고, 그 세액을 12로 나눠 근속연수를 곱합니다(소득세법 제48조·제55조 제2항). 1년 미만 근속은 1년으로 봅니다.</p>
<div class="overflow-x-auto"><table class="w-full text-sm">
<thead><tr><th>근속연수</th><th>근속연수공제</th></tr></thead>
<tbody>
<tr><td>5년 이하</td><td>100만원 × 근속연수</td></tr>
<tr><td>5년 초과 10년 이하</td><td>500만원 + 200만원 × (근속연수 − 5년)</td></tr>
<tr><td>10년 초과 20년 이하</td><td>1,500만원 + 250만원 × (근속연수 − 10년)</td></tr>
<tr><td>20년 초과</td><td>4,000만원 + 300만원 × (근속연수 − 20년)</td></tr>
</tbody></table></div>
<p>위 예시에서 연 상여 1,200만원이 들어간 경우를 따라가면, 퇴직금 ${g2cWon(sev1200.estimatedSeverancePay)}에서 근속 10년 공제 ${g2cWon(sev1200.details.serviceYearDeduction)}을 빼고 환산급여 ${g2cWon(sev1200.details.convertedSalary)}, 환산급여공제 ${g2cWon(sev1200.details.convertedSalaryDeduction)}, 과세표준 ${g2cWon(sev1200.details.taxBase)}을 거쳐 퇴직소득세 ${g2cWon(sev1200.incomeTax)}과 지방소득세 ${g2cWon(sev1200.localTax)}이 나옵니다.</p>
<p>퇴직금은 건강보험료를 매기는 보수에서 빠집니다(국민건강보험법 시행령 제33조). 퇴직금을 IRP 같은 연금계좌로 받거나 받은 날부터 60일 안에 넣으면 연금 외로 꺼낼 때까지 퇴직소득세를 떼지 않고, 이미 뗐다면 환급을 신청할 수 있습니다(소득세법 제146조). 나중에 연금으로 받으면 실제 수령 10년 차까지는 원래 퇴직소득세율의 70%, 11~20년 차는 60%, 그 뒤는 50%로 원천징수합니다(같은 법 제129조). 일시금과 연금의 차이는 <a href="/calc/severance-vs-pension">퇴직금 일시금·연금 비교 계산기</a>와 <a href="/guides/severance-lump-vs-irp-2026">퇴직금 일시금 vs IRP 가이드</a>에서 이어서 볼 수 있습니다.</p>

<h2>퇴직 전후에 받는 성과급은 무엇을 확인해야 하나요</h2>
<ul>
<li><strong>평균임금에 들어가는 상여인지</strong> — 들어가는 상여라면 퇴직 전 1년 안에 받은 금액의 3/12가 반영됩니다. 들어가지 않는 경영성과급은 퇴직 직전에 받아도 퇴직금을 바꾸지 않습니다.</li>
<li><strong>지급일 재직 조건</strong> — 지급 규정에 '지급일 현재 재직자'만 준다는 조건이 있으면 퇴직일을 정하기 전에 지급일을 확인해야 합니다.</li>
<li><strong>휴직과 퇴직이 겹칠 때</strong> — 육아휴직처럼 산정에서 빼는 기간이 있으면 그 기간을 제외하고 평균임금을 구합니다.</li>
<li><strong>퇴직 뒤 받는 성과급의 세금</strong> — 퇴직금이 아니라 근로소득입니다. 퇴사할 때 한 정산에 들어가지 않았다면 회사의 재정산이나 이듬해 5월 종합소득세 확정신고로 그해 다른 근로소득과 합칩니다. <a href="/year-end-tax-mid-resign">중도퇴사자 연말정산</a>과 <a href="/guides/bonus-payout-timing-2026">성과급 지급 시점과 세금</a>을 함께 보세요.</li>
<li><strong>건강보험료</strong> — 재직 중 받은 성과급은 건강보험 보수에 들어갑니다. 퇴직하면 회사가 그동안 낸 보험료를 다시 계산해 근로자와 정산하고(국민건강보험법 시행령 제39조), 퇴직금은 보수에서 빠집니다.</li>
</ul>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 경영성과급이 평균임금에서 빠진다는 판결이 나왔으면 소송은 의미가 없나요?</strong> — 같은 해 1월 판결은 삼성전자 목표 인센티브를 평균임금에 넣었습니다. 결론은 회사마다 지급의무가 정해져 있는지, 재원이 근로 제공과 얼마나 밀접한지에 따라 갈리므로 지급 규정과 이력을 먼저 확인해야 합니다.</li>
<li><strong>Q. 성과급을 퇴직 전 3개월 안에 받으면 퇴직금이 크게 늘어나나요?</strong> — 고용노동부 산정 방식은 상여를 3개월 임금에 통째로 넣지 않고 1년 치 총액의 3/12만 더합니다. 받은 시점보다 평균임금에 들어가는 상여인지가 중요합니다.</li>
<li><strong>Q. 퇴직금에도 건강보험료가 붙나요?</strong> — 붙지 않습니다. 건강보험 보수에서 퇴직금은 빠집니다(국민건강보험법 시행령 제33조). 퇴직소득세와 지방소득세만 원천징수됩니다.</li>
<li><strong>Q. 퇴직금을 IRP로 받으면 세금이 없어지나요?</strong> — 없어지지 않고 미뤄집니다. 연금으로 나눠 받으면 원래 퇴직소득세율의 70%(11~20년 차 60%, 그 뒤 50%)를 내고, 일시금으로 꺼내면 원래 퇴직소득세를 냅니다.</li>
</ul>

<p>근거: <a href="https://www.law.go.kr/법령/근로자퇴직급여보장법/제8조">근로자퇴직급여 보장법 제8조</a> · <a href="https://www.law.go.kr/법령/근로기준법/제2조">근로기준법 제2조</a> · <a href="https://www.moel.go.kr/retirementpayCal.do">고용노동부 퇴직금 계산 방식</a> · <a href="https://www.law.go.kr/판례/(2021다248299)">대법원 2021다248299</a> · <a href="https://scourt.go.kr/portal/news/NewsViewAction.work?gubun=4&amp;seqnum=10916">대법원 판례속보 2021다219994</a> · <a href="https://www.law.go.kr/법령/소득세법/제48조">소득세법 제48조</a> · <a href="https://www.law.go.kr/법령/소득세법/제146조">소득세법 제146조</a>. 기준일: 2026년 9월 30일. 계산은 사이트 퇴직금 엔진 기준이며 회사 규정·실제 임금에 따라 달라집니다.</p>
<p>함께 보기: <a href="/guides/severance-pay-guide">퇴직금 기본 가이드</a> · <a href="/retirement-pension-2026">퇴직연금 2026</a> · <a href="/salary-db/samsung-electronics">삼성전자 연봉</a> · <a href="/calc/bonus-calculators">회사별 성과급 계산기 모음</a></p>
`;

const beforeLeave = `
<p class="lead">성과급 받기 전 휴직 vs 받고 휴직 — 성과급은 재직 중 발생한 성과에 대한 보상이라 휴직 전 발생분은 받을 권리. 단 회사 정책에 따라 지급 시점 늦춰질 수 있음. 휴직 전 지급 확정 권장.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 성과급 권리</h2>
<ul class="space-y-2 mt-4">
<li>· 정기상여: 발생일 기준 권리. 휴직 전 지급</li>
<li>· 경영성과급: 회사 정책에 따라 지급 시점 결정</li>
<li>· 격려금: 회사 재량 (휴직자 제외 가능성)</li>
<li>· 통상 휴직 직전 지급 보장 요청 가능</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 휴직 전 점검</h2>
<ul class="space-y-2 mt-4">
<li>· 인사팀에 성과급 지급 시기 확인</li>
<li>· 휴직 시 IRP 만기 납입 가능성 (소득 발생 시기 활용)</li>
<li>· 휴직 중 4대보험 변경 확인</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/parental-leave" class="text-primary underline">육아휴직 급여 계산</a></li></ul></div>
`;

const irpEligibility = `
<p class="lead">성과급 받기 전 IRP·연금저축 가입 가능성 — 누구나 가입 가능. 단 IRP는 근로소득자·자영업자·공무원만, 연금저축은 누구나. 12월 31일까지 납입하면 당해 세액공제. 다음해 5월 종소세 신고 시 추가 환급.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 IRP·연금저축 가입 조건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>IRP</strong>: 근로소득자·자영업자·공무원·교직원 (소득 있는 누구나)</li>
<li>· <strong>연금저축</strong>: 만 19세+ 누구나 (소득 없어도 OK)</li>
<li>· <strong>가입 시점</strong>: 연중 언제든. 단 12월 31일까지 납입한 분만 당해 공제</li>
<li>· <strong>해지 시 환수</strong>: 세액공제분 16.5% 환수 → 만 55세까지 유지 필수</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 가입 절차</h2>
<ol class="space-y-2 mt-4">
<li>1. 은행·증권사·보험사 IRP·연금저축 계좌 개설</li>
<li>2. 납입 (한 번에 또는 분할)</li>
<li>3. 운용 (예금·펀드·ETF 등)</li>
<li>4. 만 55세 이후 연금 수령</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/irp" class="text-primary underline">IRP 계산기</a></li></ul></div>
`;

const executiveSeveranceLimitDeep = `
<p class="lead">임원 퇴직금 한도 초과분은 근로소득세 적용. 5억 퇴직금 + 한도 3억일 때 초과 2억은 근로소득세 약 7,800만(한계 38%). 정기상여로 미리 받는 게 퇴직금 일시 수령보다 절세.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 임원 퇴직금 한도</h2>
<ul class="space-y-2 mt-4">
<li>· 정관·임원보수규정 명시 + 주총 승인</li>
<li>· 일반적으로 임원 직급별 한도 차등</li>
<li>· 한도 초과분: 근로소득세 적용</li>
<li>· 환산급여 방식 적용 안 됨 (한도 내만)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 임원 퇴직 5억</h2>
<ul class="space-y-2 mt-4">
<li>· 한도 3억: 퇴직소득세 약 3,000만 (환산급여 방식 우대)</li>
<li>· 초과 2억: 근로소득세 약 7,800만 (한계세율 38%)</li>
<li>· <strong>합계 약 1.08억 세금</strong></li>
<li>· 한도 내 5억이라면 약 5,000만 (약 5,800만 절감)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 정관 한도 미리 점검</h2>
<p>임원 진급 시 또는 매년 임원 보수 규정 확인. 한도 초과 우려 시 정기상여 비중 늘리거나 한도 조정 주총 승인.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/severance" class="text-primary underline">퇴직금 계산</a></li></ul></div>
`;

const stockOptionTimingBonus = `
<p class="lead">성과급과 스톡옵션 행사이익을 같은 해에 받으면 근로소득이 합산돼 한계세율이 크게 오를 수 있습니다. 일반 스톡옵션은 행사이익에 근로소득세, 매도 차익에는 주식 종류에 따라 양도세가 붙습니다. 벤처기업 적격 스톡옵션은 요건을 채우면 행사 때 과세하지 않고 매도할 때 양도소득세로 과세합니다.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 일반 vs 적격 스톡옵션</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">구분</th><th class="p-3">행사 시</th><th class="p-3">매도 시</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">일반</td><td class="p-3">근로소득세 (성과급과 합산한 한계세율)</td><td class="p-3">양도세 (상장주식 소액주주 장내 매도는 과세 대상 아님)</td></tr>
<tr class="border-t"><td class="p-3">적격 (벤처기업)</td><td class="p-3 text-emerald-600">과세 없음 (특례 신청 시)</td><td class="p-3">양도소득세 (행사이익 포함, 세율은 주식 종류·보유자별)</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 1억 차익</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>일반</strong>: 행사이익 1억이 근로소득에 더해져 성과급 포함 과세표준의 한계세율로 과세 + 매도 차익은 별도 양도세</li>
<li>· <strong>적격</strong>: 행사 때 과세 없음, 매도 때 행사이익과 매도 차익을 양도소득으로 과세</li>
<li>· <strong>차이</strong>: 행사 당시 한계세율과 양도세율의 차이만큼 — 금액은 과세표준과 주식 종류에 따라 따로 계산</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 적격 스톡옵션 요건</h2>
<ul class="space-y-2 mt-4">
<li>· 벤처기업(인수기업 포함)이 2027년 12월 31일 이전에 부여 — 일반 중소기업은 대상 아님</li>
<li>· 부여 후 2년 + 행사일부터 1년 보유 (1년 안에 팔거나 증여하면 행사이익을 근로소득 등으로 과세)</li>
<li>· 행사일부터 거꾸로 2년 동안의 전체 행사가액 5억원 이하 등 조건 충족</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
`;

const rsuVestingSameBonus = `
<p class="lead">성과급 + RSU 베스팅 같은 해 발생 시 합산 근로소득세. 한계세율 45% 점프 가능. 분할 매도·매년 250만 양도세 공제·부부 분산으로 절감.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 성과급 + RSU 시뮬</h2>
<p>연봉 1.2억 + 성과급 5,000만 + RSU 베스팅 1억 (영끌 2.7억):</p>
<ul class="space-y-2 mt-4">
<li>· 근로소득세 (성과급·RSU 베스팅 합산): 약 5,200만</li>
<li>· RSU 매도 양도세 (1년 후): 약 1,700만 (해외주식)</li>
<li>· 4대보험 + 정산 추가: 약 1,000만</li>
<li>· <strong>총 부담 약 7,900만</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 분할 매도</h2>
<p>RSU 베스팅 후 4년 분할 매도 시 매년 250만 공제 활용 → 양도세 약 600만 절감.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
`;

const bonusPropertySell = `
<p class="lead">성과급 받은 해 부동산 매도 시 종합 세금 점검 필수. 성과급은 근로소득 종합과세 + 부동산 양도세 분류과세(별도)지만, 건보료 정산·보수 외 소득 부과에서도 임대소득 등이 반영될 수 있음. 합산 부담 추정.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 종합 세금 점검</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 근로소득 + 성과급</strong>: 종합과세 누진세율</li>
<li><strong>② 부동산 양도</strong>: 분류과세 (종합과세와 별도)</li>
<li><strong>③ 양도세 신고</strong>: 양도일 다음달 말일까지 예정신고 → 확정신고는 다음해 5월</li>
<li><strong>④ 건보료 부과</strong>: 보수 외 소득(임대·금융 등) 2천만원 초과 시 소득월액보험료 추가 반영</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 성과급 5,000만 + 부동산 양도차익 5억 (1주택자)</h2>
<ul class="space-y-2 mt-4">
<li>· 근로소득세 (성과급 포함): 약 2,000만</li>
<li>· 부동산 양도세 (1주택 12억 비과세 + 80% 공제 시): 약 200만</li>
<li>· 4대보험 + 정산: 약 500만</li>
<li>· <strong>총 약 2,700만</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 매도 시점 분산</h2>
<p>부동산 매도와 성과급 같은 해 발생 시 한계세율 점프. 가능하면 매도 시점 다음해로 미루기.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">부동산 양도세 계산</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// Export — 50개 가이드 통합
// ═══════════════════════════════════════════════════════════════

export const hotBonusTaxComplete: Guide[] = [
  // 영역 A — 성과급 종류·구조 10편
  { slug: "bonus-vs-incentive-vs-allowance-2026", title: "성과급·인센티브·격려금 차이 — 통상임금·퇴직금", description: "세금은 모두 근로소득으로 같고, 통상임금·퇴직금 반영 여부는 지급 방식이 가릅니다. 2024년 전원합의체·2026년 대법원 판결 기준.", metaDescription: "성과급·인센티브·격려금은 모두 근로소득으로 과세됩니다. 통상임금과 퇴직금(평균임금)에 들어가는지는 지급 방식에 따라 갈리며, 2024년 전원합의체와 2026년 삼성전자·SK하이닉스 판결 기준으로 정리했습니다.", category: "연봉", tags: ["성과급", "인센티브", "격려금", "통상임금", "퇴직금", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: bonusVsIncentive, lang: "ko" },
  { slug: "samsung-opi-tai-complete-2026", title: "삼성전자 OPI·TAI 2026 — 사업부별 지급률·세후", description: "OPI는 연봉의 최대 50%, TAI는 월 기본급 대비 반기 지급. 2025년 실적분 OPI·2026년 상반기 TAI 사업부별 지급률과 연봉별 세후.", metaDescription: "삼성전자 OPI(연봉의 최대 50%, 연 1회)와 TAI(월 기본급 대비, 연 2회)의 차이, 2025년 실적분 OPI·2026년 상반기 TAI 사업부별 지급률, 연봉별 세후와 임금협상 변경점을 정리했습니다.", category: "연봉", tags: ["삼성전자", "OPI", "TAI", "성과급", "임금협상", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: samsungOpiTai, lang: "ko" },
  { slug: "sk-hynix-ps-history-2026-prospect", title: "SK하이닉스 PS 연도별 지급률과 2026 지급 방식", description: "PS 2021년 1,000% → 2023년 0% → 2025년 2,964%(2026년 지급). 2026년 실적분부터 현금 50%·자사주 30%·이연 20%, 연봉별 세후.", metaDescription: "SK하이닉스 PS 연도별 지급률과 2025년 실적분 2,964%의 연봉별 세후, 9월 16일 가결된 2026년 실적분 지급 방식(현금 50%·자사주 30%·이연 20%), 퇴직금 반영 여부를 정리했습니다.", category: "연봉", tags: ["SK하이닉스", "PS", "PI", "성과급", "임단협", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: skHynixPs, lang: "ko" },
  { slug: "lg-hyundai-posco-bonus-2026", title: "LG·현대차·기아·포스코 성과급 비교 2026", description: "현대차·기아 400%+1,270만원, LG엔솔 최대 75%·LG디스플레이 150%(2025년 실적분), 포스코 구분법과 세후 환산.", metaDescription: "현대차·기아 2026 임단협 성과급(400%+정액 1,270만원+주식), LG에너지솔루션 최대 75%·LG디스플레이 150%, LG전자와 포스코의 지급 구조를 비교하고 연봉 8,000만원 기준 세후를 계산했습니다.", category: "연봉", tags: ["현대차", "기아", "LG에너지솔루션", "포스코", "성과급", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: lgPoscoBonus, lang: "ko" },
  { slug: "it-rsu-vs-cash-bonus-2026", title: "RSU·현금 성과급 세금 2026 — 네이버·카카오·쿠팡", description: "RSU도 받는 날 시가로 근로소득 과세돼 세금은 현금 성과급과 같습니다. 차이는 이후 주가와, 국내·해외 상장에 따라 갈리는 매도 세금입니다.", metaDescription: "RSU는 주식을 받는 날의 시가로 근로소득세가 정해져 같은 금액 현금 성과급과 세금이 같습니다. 네이버·카카오(국내 상장)와 쿠팡(미국 상장) RSU의 매도 세금과 주가 하락 때 손익을 비교했습니다.", category: "주식", tags: ["RSU", "네이버", "카카오", "쿠팡", "성과급", "2026"], level: "고급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: itRsuVsCash, lang: "ko" },
  { slug: "foreign-bonus-structure-2026", title: "외국계 보너스 — 구글·아마존·메타·MS 한국지사 RSU 구조", description: "구글 Alphabet RSU + 사인온, 아마존 분할 사인온 + 4년 비균등 RSU, 메타·MS 분기 성과 + RSU. 외국 모회사 직접 지급 시 본인 종소세 신고 의무.", category: "주식", tags: ["외국계", "구글", "아마존", "메타", "RSU", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: foreignBonus, lang: "ko" },
  { slug: "year-end-encouragement-vs-bonus-2026", title: "연말 격려금 vs 정기상여 — 통상임금 포함 여부 절세 효과", description: "격려금은 통상임금 미포함 → 퇴직금 영향 0. 정기상여는 통상임금 포함 → 퇴직금 증가. 12월 격려금 1,000만 + IRP 900만 만기 시 142만원 환급.", category: "연봉", tags: ["격려금", "정기상여", "통상임금", "퇴직금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: yearEndEncouragement, lang: "ko" },
  { slug: "sign-on-bonus-tax-2026", title: "사인온 보너스 5,000만 — 실수령 2,875만, 분할로 600만 절감", description: "입사 시 일회성 보너스. 한계세율 35%+ + 4대보험 + 지방세 = 약 43% 부담. 5,000만 일시 vs 2년 분할 시 600만 절감.", category: "연봉", tags: ["사인온", "Signing Bonus", "입사", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: signOnBonus, lang: "ko" },
  { slug: "retention-bonus-3year-split-2026", title: "리텐션 보너스 1억 3년 분할 vs 일시 — 1,300만원 절감", description: "M&A·구조조정 후 잔존 보너스. 3년 일시 1억 38% vs 매년 3,300만 24~35% = 절감 1,300만. 분할 지급 협상 권장.", category: "연봉", tags: ["리텐션", "잔존보너스", "M&A", "구조조정", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: retentionBonus, lang: "ko" },
  { slug: "executive-bonus-corporate-limit-2026", title: "비상장 임원 성과급 한도 — 초과 시 회사·임원 모두 손해", description: "정관·주총 한도 명시. 한도 5억 + 실 지급 8억 시 초과 3억 법인세 7,200만 추가 + 임원 근로소득세 그대로. 한도 내 운용 필수.", category: "연봉", tags: ["임원", "비상장", "성과급한도", "법인세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: executiveBonusLimit, lang: "ko" },
  // 영역 B — 성과급 소득세 10편
  { slug: "bonus-bracket-jump-2026", title: "성과급 한계세율 점프 — 1.2억+1억 시 추가 3,800만원 세금", description: "8단계 누진세율 6~45%. 성과급 받으면 한 단계 점프 흔함. 연봉 1.2억+성과급 1억 시 35%→38% 점프 → 추가 3,800만원 세금.", category: "세금", tags: ["성과급", "한계세율", "누진세율", "8단계", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusBracketJump, lang: "ko" },
  {
    slug: "bonus-1eok-net-payment-2026",
    title: `성과급 1억 실수령액 — 연봉 7천이면 약 ${manwon(EOK_MAIN.net)}`,
    description: `연봉 7,000만원에 성과급 1억이면 세금·4대보험 약 ${manwon(EOK_MAIN.totalDeductions)}을 빼고 약 ${manwon(EOK_MAIN.net)}이 남습니다.`,
    metaDescription: `2026년 기준 성과급 1억 실수령액은 연봉 7,000만원이면 약 ${manwon(EOK_MAIN.net)}, 연봉 1억원이면 약 ${manwon(EOK_BY_SALARY[2].r.net)}입니다. 연봉별 세후 표와 소득세·4대보험 내역, 이듬해 4월 건보 정산 시기를 정리했습니다.`,
    category: "세금",
    tags: ["성과급", "실수령액", "1억", "성과급세금", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    modifiedDate: "2026-09-30",
    views: 0,
    content: bonus1euk,
    lang: "ko",
  },
  {
    slug: "bonus-5000-net-payment-2026",
    title: `성과급 5천만원 실수령 — 연봉 6천이면 약 ${manwon(FIVE_MAIN.net)}`,
    description: `연봉 6,000만원에 성과급 5,000만원이면 약 ${manwon(FIVE_MAIN.totalDeductions)}이 빠져 약 ${manwon(FIVE_MAIN.net)}이 남습니다. 과세표준은 ${bracketRateOf(FIVE_WITH_BONUS.taxBase)} 구간입니다.`,
    metaDescription: `2026년 기준 성과급 5,000만원 실수령액은 연봉 6,000만원이면 약 ${manwon(FIVE_MAIN.net)}, 연봉 1억원이면 약 ${manwon(FIVE_BY_SALARY[3].r.net)}입니다. 총급여가 1억원을 넘어도 ${bracketRateOf(FIVE_WITH_BONUS.taxBase)} 구간인 이유와 IRP 환급액을 정리했습니다.`,
    category: "세금",
    tags: ["성과급", "실수령액", "5000만", "IRP", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    modifiedDate: "2026-09-30",
    views: 0,
    content: bonus5000,
    lang: "ko",
  },
  {
    slug: "income-tax-8-step-bracket-2026",
    title: "2026 소득세 세율표 8단계 — 과세표준·누진공제 계산법",
    description: "과세표준 1,400만원 이하 6%부터 10억원 초과 45%까지 8단계이며, 넘은 금액에만 높은 세율이 붙습니다.",
    metaDescription: `2026년 귀속 소득세 기본세율은 과세표준 1,400만원 이하 6%부터 10억원 초과 45%까지 8단계입니다. 누진공제 계산법과 구간별 세액, 총급여가 얼마면 35% 구간인지(약 ${manwon(GROSS_AT_BRACKET[2].gross)})를 정리했습니다.`,
    category: "세금",
    tags: ["소득세율", "누진세율", "8단계", "과세표준", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    modifiedDate: "2026-09-30",
    views: 0,
    content: bracket8Step,
    lang: "ko",
  },
  { slug: "salary-bonus-calc-8step-2026", title: "성과급 + 연봉 합산 세금 계산 8단계 — 직접 계산 vs 계산기", description: "총소득 → 근로소득공제 → 인적공제 → 과세표준 → 산출세액 → 세액공제 → 결정세액 → 납부세액. 8단계 계산 → 머니샐러리 계산기 활용.", category: "세금", tags: ["성과급계산법", "8단계", "연말정산", "산출세액", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: salaryBonusCalc, lang: "ko" },
  { slug: "bonus-split-payout-1000-saving-2026", title: "성과급 1억 분할 지급 — 1년 vs 2년 = 1,000만 절감", description: "일시 지급 한계세율 38% vs 2년 분할 35%. 절감 1,000만. 인사·임원과 분할 협상 가능 시 적극 시도. 잔류 의무 부가 가능.", category: "세금", tags: ["성과급", "분할지급", "한계세율", "협상", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: splitPayoutLower, lang: "ko" },
  { slug: "irp-before-bonus-payout-2026", title: "성과급 받기 전 IRP 900만 만기 — 환급 119~149만원", description: "성과급 받기 1~2개월 전 IRP·연금저축 900만 만기 납입 → 한계세율 35%+ 구간 환급 119~149만원. 12월 31일까지 납입 필수.", category: "세금", tags: ["IRP", "연금저축", "성과급", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: irpBeforeBonus, lang: "ko" },
  { slug: "card-25-before-bonus-2026", title: "성과급 받기 전 신용카드 25% 기준선 — 체크·전통시장 전환", description: "성과급으로 25% 기준선이 올라가기 전 체크카드·전통시장·대중교통 사용 한도 채우기. 100만 추가 사용 시 약 12만 환급(체크 30% × 한계세율 35%).", category: "세금", tags: ["신용카드", "체크카드", "25%", "전통시장", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: card25BeforeBonus, lang: "ko" },
  { slug: "medical-edu-donation-bonus-year-2026", title: "성과급 받는 해 의료비·교육비·기부금 — 환급 효과 12%p 큼", description: "한계세율 35%+ 구간에서 공제 효과 12%p 큼. 임플란트·치아교정·자녀 대학원 등 큰 비용 한 해에 몰아 결제 → 약 200~250만 추가 환급.", category: "세금", tags: ["의료비", "교육비", "기부금", "성과급", "한계세율", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: medicalEduBonus, lang: "ko" },
  { slug: "dependent-deduction-bonus-year-2026", title: "성과급 받는 해 인적공제 — 1인 150만 × 35% = 52만 환급", description: "한계세율 35% 시 인적공제 효과 큼. 부모 2명 + 자녀 2명 + 경로우대 + 의료비 통합 시 약 174만 추가 환급.", category: "세금", tags: ["인적공제", "부양가족", "성과급", "한계세율", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: dependentBonus, lang: "ko" },
  // 영역 C — 성과급 4대보험·건강보험 10편
  { slug: "bonus-pension-45-ceiling-590-2026", title: "성과급 국민연금 4.75% — 보수월액 상한 659만원 적용", description: "국민연금은 659만 상한(2026년 7월~). 월급 700만+ 직원은 성과급 받아도 국민연금 추가 부담 0원. 월급 400만 직원이 성과급 200만 받으면 월 약 7,900원 추가.", category: "기초", tags: ["국민연금", "성과급", "상한", "659만", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bonusPension45, lang: "ko" },
  {
    slug: "bonus-health-4-percent-2026",
    title: `성과급 건강보험료 ${RATE_LABEL.healthPlusLtc2} — 1억이면 본인 약 ${manOnly(HEALTH_BY_BONUS[3].total)}`,
    description: `성과급에는 건강보험 ${RATE_LABEL.health}와 장기요양(건보료의 ${RATE_LABEL.ltcRatio})이 붙어 본인 약 ${RATE_LABEL.healthPlusLtc2}입니다. 성과급분은 보통 이듬해 4월 정산에 반영됩니다.`,
    metaDescription: `2026년 성과급 건강보험료는 건강보험 ${RATE_LABEL.health}와 장기요양을 합쳐 본인 약 ${RATE_LABEL.healthPlusLtc}로, 1억이면 약 ${manwon(HEALTH_BY_BONUS[3].total)}입니다. 금액별 표와 월 보험료 상한, 이듬해 4월 정산·12회 분할 납부를 정리했습니다.`,
    category: "기초",
    tags: ["건강보험", "성과급", "장기요양", "4월정산", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    modifiedDate: "2026-09-30",
    views: 0,
    content: bonusHealth3545,
    lang: "ko",
  },
  { slug: "bonus-employment-09-2026", title: "성과급 고용보험 0.9% — 1억 시 90만, 3억 시 270만", description: "고용보험 본인 0.9% + 회사 0.9% + α. 상한 없음. 1억 성과급 시 본인 90만, 3억 시 270만. 실업급여 산정 시 평균임금 베이스 증가 효과.", category: "기초", tags: ["고용보험", "성과급", "실업급여", "0.9%", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bonusEmployment09, lang: "ko" },
  {
    slug: "four-insurance-ceiling-summary-2026",
    title: `2026 4대보험 상한·하한 — 국민연금 월 ${PENSION_LABEL.max}`,
    description: `국민연금은 월 ${PENSION_LABEL.max} 상한, 건강보험은 월 보험료 상한 ${HEALTH_CAP_LABEL.total}원, 고용보험은 상한이 없습니다.`,
    metaDescription: `2026년 4대보험 상한·하한을 정리했습니다. 국민연금 기준소득월액은 ${PENSION_LABEL.minShort}~${PENSION_LABEL.max}(2026.7~2027.6), 건강보험 월 보험료 상한은 ${HEALTH_CAP_LABEL.total}원이고 고용보험은 상한이 없습니다.`,
    category: "기초",
    tags: ["4대보험", "상한", "국민연금", "건강보험", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    modifiedDate: "2026-09-30",
    views: 0,
    content: bonusInsuranceCeiling,
    lang: "ko",
  },
  { slug: "july-health-adjust-bonus-1eok-2026", title: "성과급 1억 + 4월 건보료 정산 — 추가 400만 부과", description: "성과급 부분은 매월 부과 안 되고 다음해 4월 연말정산에서 부과. 1억 성과급 시 약 400만 추가, 정산액이 당월 보험료 이상이면 12회 이내 분할 납부 가능.", category: "기초", tags: ["건보료정산", "건강보험", "성과급", "분할납부", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusHealthAdjust, lang: "ko" },
  { slug: "july-health-adjust-bonus-detail-2026", title: "4월 건보료 정산 흐름 — 성과급별 정산금 80~800만원", description: "1~3월 보수총액 확정 → 4월분 보험료에 정산 반영 → 12회 이내 분할 신청. 성과급 2,000만 약 80만, 5,000만 200만, 1억 400만, 2억 800만 정산금.", category: "기초", tags: ["건보료정산", "건강보험", "분할", "정산금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: julyAdjust, lang: "ko" },
  { slug: "dependent-check-before-bonus-2026", title: "성과급 받기 전 가족 피부양자 점검 — 임대 2,000만 + 박탈", description: "본인 성과급으로 피부양자 자격 직접 영향 없음. 단 가족 임대·연금·이자 합산 2,000만+ 시 박탈 → 지역가입자 월 50~150만 부담.", category: "기초", tags: ["피부양자", "건강보험", "성과급", "지역가입자", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: dependentBeforeBonus, lang: "ko" },
  { slug: "total-income-adjustment-bonus-2026", title: "성과급 + 임대 + 금융 + 사업 종합 정산 — 영끌 2억 시 추가 5,750만", description: "성과급 5,000만 + 임대 3,000만 + 배당 2,000만 + 사업 3,000만 = 영끌 2억. 종소세 4,500만 + 지방세 + 정산 800만 = 약 5,750만 추가.", category: "기초", tags: ["종합과세", "성과급", "임대소득", "정산", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: incomeAdjustmentTotal, lang: "ko" },
  { slug: "retire-with-bonus-4insurance-2026", title: "퇴직금 + 성과급 같은 해 — IRP 이전 시 절세 1,500만", description: "퇴직금 4대보험 면제 + 환산급여 우대. 성과급은 정상 부과. 5억 퇴직금 IRP 이전 시 즉시 세금 0원 → 연금 분할로 1,500만 절감.", category: "기초", tags: ["퇴직금", "성과급", "IRP", "4대보험", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: retireBonusFourInsurance, lang: "ko" },
  { slug: "optional-continue-after-bonus-2026", title: "성과급 큰 임원 퇴직 후 임의계속가입 — 신청 기한·36개월", description: "성과급 큰 임원이 퇴직하면 지역보험료가 커질 수 있다. 임의계속가입은 퇴직 전 12개월 평균 보수월액 기준으로 최대 36개월.", category: "기초", tags: ["임의계속가입", "퇴직", "건강보험", "임원", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: optionalContinueAfterBonus, lang: "ko" },
  // 영역 D — 성과급 절세 심화 10편
  { slug: "irp-max-bonus-year-2026", title: "성과급 + IRP 900만 환급 119만, ISA 전환 합산 1,200만 175만", description: "IRP + 연금저축 합산 900만 (전 연령 공통, ISA 만기 전환분 합산 시 최대 1,200만). 세액공제율 5,500만 이하 16.5%, 초과 13.2%. 성과급 받는 해 한계세율 높아 환급 효과 최대.", category: "세금", tags: ["IRP", "연금저축", "성과급", "세액공제", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: irpMaxBonus, lang: "ko" },
  { slug: "isa-for-bonus-2026", title: "성과급 일부 ISA 적립 — 5년 운용 시 63만 절감", description: "성과급 2,000만 ISA 적립 → 5년 7% 운용 약 2,800만. 차익 800만 중 200만 비과세 + 600만 9.9% = 60만 세금. 일반 계좌 대비 63만 절감.", category: "투자", tags: ["ISA", "성과급", "비과세", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: isaForBonus, lang: "ko" },
  { slug: "gift-children-with-bonus-2026", title: "성과급 받는 해 자녀 5,000만 증여 — 평생 1.4억+ 비과세", description: "성인 자녀 10년 5,000만 비과세. 본인 성과급 절세 + 자녀 자산 형성 + 세대 간 이전 효과. 10년 반복 시 평생 1.4억+ 비과세.", category: "세금", tags: ["증여", "자녀", "비과세", "5000만", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: giftWithBonus, lang: "ko" },
  { slug: "couple-split-bonus-year-2026", title: "맞벌이 연말정산 몰아주기 — 성과급 받은 해 기준", description: "인적공제는 세율 높은 쪽, 의료비는 3% 문턱 낮은 쪽, 카드는 25% 문턱을 넘는 쪽. 세액공제는 세율과 무관합니다.", metaDescription: "맞벌이 연말정산 몰아주기는 인적공제는 세율이 높은 쪽, 의료비는 총급여 3% 문턱이 낮은 쪽, 카드는 25% 문턱을 넘는 쪽이 기본입니다. 성과급 받은 해 계산 예시와 불가 항목을 정리했습니다.", category: "세금", tags: ["부부분산", "의료비", "한계세율", "연말정산", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: coupleSplitBonus, lang: "ko" },
  { slug: "parent-support-bonus-year-2026", title: "성과급 받는 해 부모 부양 — 2명 등록 시 174만 환급", description: "한계세율 35%, 부모 2명 + 만 75세 경로우대 + 의료비 200만 시 인적공제·경로우대·의료비 합산 약 174만 환급.", category: "세금", tags: ["부모부양", "인적공제", "경로우대", "성과급", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: parentSupportBonus, lang: "ko" },
  { slug: "medical-edu-donation-concentration-2026", title: "성과급 받는 해 의료비·교육비 집중 — 60~80만 추가 환급", description: "한계세율 35% 시 임플란트·자녀 대학원·기부금 등 큰 비용 한 해에 몰기. 합산 200~250만 환급(한계 24% 대비 +60~80만).", category: "세금", tags: ["의료비집중", "교육비", "기부금", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: medicalEduConcentration, lang: "ko" },
  { slug: "card-30-40-percent-bonus-2026", title: "성과급 받는 해 체크·전통시장 전환 — 70만 추가 환급", description: "성과급으로 25% 기준선↑. 25% 초과분을 체크 30% + 전통시장 40% + 대중교통 40%로 전환. 1,000만 전환 시 약 70만 추가 환급.", category: "세금", tags: ["체크카드", "전통시장", "대중교통", "공제", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: cardCategoryBonus, lang: "ko" },
  { slug: "monthly-rent-17-bonus-2026", title: "성과급 받는 해 월세 15~17% — 월 60만 시 최대 134만 환급", description: "무주택 세대주 + 총급여 8,000만 이하(성과급으로 초과 시 그해 공제 제외). 월세 60만(연 720만) × 17% = 122만 + 지방세 = 약 134만 환급. 5년 미신청자 경정청구 가능.", category: "세금", tags: ["월세", "세액공제", "무주택", "성과급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: monthlyRent17Bonus, lang: "ko" },
  { slug: "housing-25-bonus-2026", title: "성과급 받는 해 청약통장 25만 — 5년 200~230만 환급", description: "매월 25만 납입 시 연 300만 한도 40% = 120만 공제. 한계세율 35% 시 약 42만 환급/년. 5년 누적 200~230만 + 청약 가점 만점.", category: "세금", tags: ["청약통장", "소득공제", "25만", "성과급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: housingSub25Bonus, lang: "ko" },
  { slug: "insurance-100-bonus-2026", title: "성과급 받는 해 보장성 보험 100만 — 12만 환급 챙기기", description: "종신·암·정기·실손·자동차·운전자 합산 100만 한도 12% 공제 = 최대 12만 환급. 본인·부양가족 명의 모두 가능. 저축성·연금보험 제외.", category: "세금", tags: ["보장성보험", "공제", "12%", "성과급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: insurance100Bonus, lang: "ko" },
  // 영역 E — 성과급 시점·실전 10편
  { slug: "opi-vs-tai-timing-tax-2026", title: "1월 OPI vs 6월 TAI — 분할 지급 150만 절감", description: "삼성 OPI 1월 일시 vs TAI 6·12월 분할. 분할 효과로 한계세율 분산. 영끌 1.08억 시 약 150만 절감. 인사 협상 시도.", category: "세금", tags: ["OPI", "TAI", "분할지급", "한계세율", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: opiTaiTimingCompare, lang: "ko" },
  { slug: "december-vs-january-bonus-2026", title: "12월 인센티브 vs 1월 인센티브 — 정산 시점·IRP 한도", description: "같은 금액 세금 차이 거의 없음. 단 12월 지급은 당해 정산, IRP 한도 즉시 도달. 1월 지급은 다음해 정산. 정산·납입 일정 차이.", category: "세금", tags: ["12월", "1월", "인센티브", "정산", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: december1January, lang: "ko" },
  { slug: "moving-company-bonus-2026", title: "이직 중 성과급 — 전·신 회사 합산 1,000만+ 추가 세금", description: "전 회사 + 신 회사 성과급 모두 근로소득 합산. 5월 종소세 신고 시 합산 신고 의무. 한계세율 점프 시 추가 1,000만+ 세금.", category: "커리어", tags: ["이직", "성과급", "전회사", "종합소득세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: moveCompanyBonus, lang: "ko" },
  { slug: "bonus-retire-impact-severance-2026", title: "성과급 퇴직금 포함 기준 2026 — 평균임금·대법원 판례", description: "퇴직금은 평균임금으로 계산합니다. 정기상여·목표 인센티브는 들어가고, 해마다 노사합의로 정한 경영성과급은 빠질 수 있습니다.", metaDescription: "성과급이 퇴직금에 들어가는지는 평균임금 포함 여부로 갈립니다. 2026년 대법원 판결(삼성전자 목표 인센티브 포함·경영성과급 제외)과 월 500만원·10년 근속 예시로 퇴직금 차이와 퇴직소득세를 계산했습니다.", category: "커리어", tags: ["퇴직금", "평균임금", "성과급", "퇴직소득세", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: bonusRetireImpact, lang: "ko" },
  { slug: "before-vs-after-leave-bonus-2026", title: "성과급 받기 전 휴직 vs 받고 휴직 — 권리 보장 + 휴직 전 지급", description: "성과급은 재직 중 발생 성과 보상 → 휴직 전 발생분은 받을 권리. 인사팀과 지급 시점 확정 + 휴직 중 4대보험 변경 확인.", category: "커리어", tags: ["휴직", "성과급", "지급권리", "육아휴직", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: beforeLeave, lang: "ko" },
  { slug: "irp-eligibility-before-bonus-2026", title: "성과급 받기 전 IRP·연금저축 가입 — 누구나 가능", description: "IRP: 근로소득자·자영업자·공무원. 연금저축: 만 19세+ 누구나. 12월 31일까지 납입 시 당해 공제. 만 55세까지 유지 의무.", category: "세금", tags: ["IRP", "연금저축", "가입자격", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: irpEligibility, lang: "ko" },
  { slug: "executive-severance-limit-bonus-deep-2026", title: "임원 퇴직금 한도 초과 + 성과급 — 5억 시 1.08억 세금", description: "한도 3억 + 초과 2억 시 초과분 근로소득세 7,800만 (한계 38%). 한도 내 5억이면 5,000만. 정관 한도 미리 점검.", category: "커리어", tags: ["임원", "퇴직금한도", "근로소득세", "성과급", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: executiveSeveranceLimitDeep, lang: "ko" },
  { slug: "stock-option-with-bonus-2026", title: "성과급 + 스톡옵션 일반 vs 적격 — 과세 시점·세금 차이", description: "일반: 행사이익은 근로소득으로 성과급과 합산 과세. 적격(벤처)은 요건 충족 시 행사 때 과세를 미루고 매도 때 양도세.", category: "주식", tags: ["스톡옵션", "적격", "벤처", "양도세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: stockOptionTimingBonus, lang: "ko" },
  { slug: "bonus-rsu-same-year-2026", title: "성과급 + RSU 베스팅 같은 해 — 영끌 2.7억 시 총 7,900만 부담", description: "연봉 1.2억 + 성과급 5,000만 + RSU 1억 베스팅 = 영끌 2.7억. 근로 5,200만 + 양도 1,700만 + 정산 1,000만 = 7,900만. 분할 매도로 600만 절감.", category: "주식", tags: ["RSU", "성과급", "베스팅", "양도세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: rsuVestingSameBonus, lang: "ko" },
  { slug: "bonus-property-sell-same-year-2026", title: "성과급 + 부동산 양도 동시 — 종합 세금 점검 필수", description: "근로소득(성과급) 종합과세 + 부동산 분류과세 별도. 건보료 정산에도 반영. 1주택 비과세 + 80% 공제 시 5억 양도차익 약 200만, 성과급 5,000만 + 합산 약 2,700만.", category: "부동산", tags: ["성과급", "부동산양도", "종합세금", "정산", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: bonusPropertySell, lang: "ko" },
];
