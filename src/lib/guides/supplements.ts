// src/lib/guides/supplements.ts
//
// 가이드 보강 섹션 — 마지막 광고(HomeTopAd) 아래에만 렌더되는 HTML 조각 (2026-09-12, S3-4).
//
// ★ 본문(guide.content)에 넣으면 광고 위치가 밀리므로 금지.
//   - 본문 뒤에 오는 CalcResultAd·HomeTopAd 가 아래로 밀리고,
//   - GuidePageClient 의 H2 분할 지점(1/3·2/3)이 바뀌어 본문 내 GuideMidAd·InArticleAd 위치까지 이동한다
//     (2026-08-16 "광고 위 UI 삽입" 수익 사고 규칙).
//   그래서 본문 정본(legacy-rewrite-*.ts)은 건드리지 않고, 이 조각을 src/components/GuideSupplement.tsx 가
//   가이드 상세 페이지의 HomeTopAd 바로 아래에 붙인다.
//
// - 마크업 관습은 본문과 동일: <h2>·<p>·<ul><li>·<table class="w-full text-sm">. 이모지 헤더는 쓰지 않는다.
// - "자주 묻는 질문" 섹션은 src/lib/guideFaq.ts 의 추출 패턴
//   (<h2>…자주 묻는 질문…</h2><ul><li><strong>Q. …</strong> — 답변</li>…</ul>)을 그대로 지킨다.
//   page.tsx 가 본문+보강을 합쳐 FAQPage 스키마로 내보내므로(가시 콘텐츠와 1:1) 패턴이 깨지면 조용히 빠진다.
// - 수치 원칙(추정 금지): 저장소 정본 상수(civilServantPay·minimumWage — 아래에서 import 해 문자열에 끼워 넣는다,
//   verify-tax-constants 게이트의 리터럴 감시 대상이기도 하다) 또는 검증 로그
//   docs/nurse-salary-supplement-facts-2026-09-12.md 에 출처·상태코드가 기록된 값만 쓴다.
//   직업 DB 구간(3,200만~4,200만 등)은 src/data/jobsData.ts 의 nurse 항목과 본문 실수령 표에 맞춘 값이다 —
//   jobsData 를 고치면 본문(legacy-rewrite-2.ts)과 이 파일을 함께 갱신할 것.

import { MINIMUM_WAGE_2026 } from "@/config/minimumWage";
import {
  GENERAL_PAY_ROWS_2026,
  POSITION_ALLOWANCE_2026,
  TEACHER_PAY_ROWS_2026,
} from "@/lib/civilServantPay";

/** 원 단위 천 단위 구분 — en-US 그룹핑은 ko-KR 과 동일하고 ICU 유무에 좌우되지 않는다 */
const won = (n: number): string => n.toLocaleString("en-US");

/** 일반직 봉급표 [호봉, 9급, 8급, 7급, 6급, 5급] 에서 특정 호봉·직급 월 봉급 */
function generalPay(step: number, grade: 9 | 8 | 7 | 6 | 5): number {
  const row = GENERAL_PAY_ROWS_2026.find((r) => r[0] === step);
  if (!row) throw new Error(`[guideSupplements] 봉급표에 ${step}호봉 행이 없습니다`);
  const col = { 9: 1, 8: 2, 7: 3, 6: 4, 5: 5 }[grade] as 1 | 2 | 3 | 4 | 5;
  return row[col];
}

/** 교원 봉급표 [호봉, 월 봉급] 에서 특정 호봉 */
function teacherPay(step: number): number {
  const row = TEACHER_PAY_ROWS_2026.find((r) => r[0] === step);
  if (!row) throw new Error(`[guideSupplements] 교원 봉급표에 ${step}호봉 행이 없습니다`);
  return row[1];
}

const grade8Allowance = POSITION_ALLOWANCE_2026.find((a) => a.grade === "8·9급");
if (!grade8Allowance) throw new Error("[guideSupplements] 직급보조비 8·9급 항목이 없습니다");

const G8_STEP1 = won(generalPay(1, 8));
const G8_STEP5 = won(generalPay(5, 8));
const G8_STEP10 = won(generalPay(10, 8));
const G7_STEP1 = won(generalPay(1, 7));
const G8_ALLOWANCE = won(grade8Allowance.amount);
const T_STEP9 = won(teacherPay(9));
const T_STEP30 = won(teacherPay(30));
const MW_HOURLY = won(MINIMUM_WAGE_2026.hourly);
const MW_MONTHLY = won(MINIMUM_WAGE_2026.monthly);
const MW_YEARLY = won(MINIMUM_WAGE_2026.yearly);
/** /salary/<금액> 은 salaryStaticAmounts.generated.ts 목록에 있는 금액만 — 최저임금 연 환산액은 등재돼 있다 */
const MW_YEARLY_HREF = `/salary/${MINIMUM_WAGE_2026.yearly}`;

const nurseSalarySupplement = `
<h2>연차별 급여 구조 — 호봉·수당·승진이 월급을 바꾸는 방식</h2>
<p>간호사 월급은 세 층으로 쌓입니다. 병원별 기본급 테이블(호봉 또는 연봉 등급), 근무표에 따라 달라지는 교대 수당, 그리고 책임·수간호사로 올라갈 때 붙는 직위 수당입니다. 연차가 쌓이면 첫 번째 층이 꾸준히 오르고, 부서와 근무 형태에 따라 두 번째 층이 출렁이며, 승진 시점에 세 번째 층이 더해집니다. 아래 표는 공식 통계와 머니샐러리 직업 DB 구간을 연차별로 정리하고 각 단계에서 급여를 움직이는 요인을 붙인 것입니다. 월 실수령액은 본문의 2026년 요율 표와 같은 기준입니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>연차</th><th>연봉 구간(세전)</th><th>월 실수령액</th><th>급여를 움직이는 요인</th></tr>
</thead>
<tbody>
<tr><td>신규(0~2년)</td><td>3,200만~4,200만원(직업 DB)</td><td>약 237만~302만원</td><td>병원 규모별 초봉 테이블, 그 달의 나이트 개수</td></tr>
<tr><td>3년차 전후</td><td>약 4,200만원(직업 DB 신규 구간 상단)</td><td>약 302만원</td><td>호봉 승급, 특수부서 배치 여부</td></tr>
<tr><td>5년차 전후(3~5년)</td><td>4,000만~5,200만원(직업 DB) · 중위 4,500만원(고용24 2023)</td><td>약 321만원(4,500만원 기준)</td><td>호봉 누적, 야간 전담·특수부서 수당</td></tr>
<tr><td>10년차</td><td>상위 25% 5,375만원(고용24 2023)</td><td>약 376만원</td><td>책임(주임)간호사 등 직위 승진</td></tr>
<tr><td>수간호사·관리자</td><td>5,000만~7,000만원(직업 DB)</td><td>약 403만~479만원</td><td>관리 직위 수당, 상근 전환 시 야간수당 감소</td></tr>
</tbody>
</table>
<ul>
<li><strong>호봉 승급</strong> — 호봉제 병원은 매년 기본급 단계가 한 칸씩 오르고, 연봉제 병원은 평가·계약 갱신으로 조정됩니다. 공무원 봉급표처럼 해마다 1호봉씩 정기 승급하는 구조(간호직 공무원)와 달리, 병원은 승급액과 상한이 기관마다 다릅니다.</li>
<li><strong>수당 비중</strong> — 밤 10시부터 오전 6시 사이의 근로는 통상임금의 50% 이상을 가산해야 하고(근로기준법 제56조 제3항), 중환자실·응급실·수술실 등 특수부서 수당은 병원별 규정을 따릅니다. 같은 연차라도 나이트 개수와 부서에 따라 월 급여가 수십만 원 단위로 달라지는 이유입니다. 내 근무표의 나이트 가격은 <a href="/calc/night-shift-pay-quick">야간수당 계산기</a>로 검산할 수 있습니다.</li>
<li><strong>승진</strong> — 일반간호사에서 책임(주임)간호사, 수간호사(파트장) 순으로 급여 테이블이 바뀌고 직위 수당이 붙습니다. 다만 관리 직위는 상근 근무가 많아 야간수당 비중이 줄어들 수 있어, 총액 상승 폭은 병원에 따라 다릅니다.</li>
</ul>
<p><em>출처: 한국고용정보원 고용24(구 워크넷) 재직자 조사 2023(하위 25% 3,600만·중위 4,500만·상위 25% 5,375만원) · 근로기준법 제56조(시행 2026-08-20) · 머니샐러리 직업 DB 구간과 본문 실수령 표(2026년 4대보험 요율). 병원별 수당·승진 규정은 기관마다 달라 금액을 단정하지 않았습니다.</em></p>

<h2>직군·근무처별 간호사 급여 비교</h2>
<p>같은 간호사 면허라도 근무처에 따라 급여가 정해지는 방식이 다릅니다. 병원은 기관별 테이블과 교대 수당, 보건소·보건지소의 간호직 공무원은 공무원 봉급표와 수당, 학교의 보건교사는 교원 봉급표, 기업·연구기관은 소속 기관의 급여체계를 따릅니다. 보건복지부 실태조사(2020년 기준)에서는 활동 간호사 285,097명 가운데 216,408명이 병·의원 등 요양기관에서 일하고 있어, 연봉 통계의 중심은 여전히 병원입니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>근무처</th><th>급여 결정 방식</th><th>확인된 기준 수치</th><th>특징</th></tr>
</thead>
<tbody>
<tr><td>상급종합병원·대형 종합병원</td><td>병원별 호봉·연봉 테이블 + 3교대 수당</td><td>신규 3,700만~4,200만원(직업 DB 대학병원 기준), 중위 4,500만원(고용24 2023)</td><td>초봉이 높고 특수부서·야간수당 비중이 큼</td></tr>
<tr><td>중소병원·요양병원</td><td>병원별 테이블, 교대 수당 비중 작음</td><td>신규 3,200만원대(직업 DB 중소병원 기준)</td><td>요양병원은 간호사 정원의 3분의 2 범위에서 간호조무사를 둘 수 있어(의료법 시행규칙 별표 5) 인력 구성이 급성기 병원과 다름</td></tr>
<tr><td>보건소·보건지소 간호직 공무원</td><td>일반직 공무원 봉급표(2026 확정) + 직급보조비 등 수당</td><td>8급 1호봉 월 ${G8_STEP1}원 → 5호봉 ${G8_STEP5}원 → 10호봉 ${G8_STEP10}원, 7급 1호봉 ${G7_STEP1}원 · 직급보조비 월 ${G8_ALLOWANCE}원 (<a href="/civil-servant-pay-2026">2026 공무원 봉급표</a>)</td><td>8급으로 신규 임용(2026년 경기도 공채 8급 간호 207명), 해마다 정기 승급·정년 보장, 주간 근무 중심</td></tr>
<tr><td>보건교사(교육공무원)</td><td>유·초·중등 교원 봉급표(공무원보수규정 별표 11) + 교직 수당</td><td>9호봉 월 ${T_STEP9}원 ~ 30호봉 ${T_STEP30}원 — 호봉은 학력·경력으로 획정 (<a href="/teacher-pay-2026">2026 교사 호봉표</a>)</td><td>초·중등교육법상 교사 직군, 주간 근무</td></tr>
<tr><td>산업·보험심사·연구간호사</td><td>소속 기업·기관의 급여체계</td><td>공식 통계 없음 — 기관별 채용 조건 확인 필요</td><td>상근·주간 근무, 임상 경력이 채용·급여 협상 요소</td></tr>
<tr><td>간호조무사(비교 기준)</td><td>기관별 테이블</td><td>평균 연 2,804만원(2020년 기준, 보건복지부) — 같은 조사의 간호사 평균 4,745만원의 약 59%</td><td>2026년 <a href="/minimum-wage-2026">최저임금</a>은 시급 ${MW_HOURLY}원·월 ${MW_MONTHLY}원(<a href="${MW_YEARLY_HREF}">연 ${MW_YEARLY}원</a>)</td></tr>
</tbody>
</table>
<p><em>출처: 보건복지부 「보건의료인력 실태조사 결과 발표」(2020년 기준, 2022-07-07 보도자료) — 간호사 연평균 임금 47,448,594원·간호조무사 28,037,925원·활동 간호사 285,097명(요양기관 근무 216,408명) · 인사혁신처 2026년 공무원 봉급표(공무원보수규정 별표 3·별표 11)와 공무원수당규정 직급보조비 · 경기도인사위원회 공고 제2026-5호(2026년도 제1·2회 경기도 지방공무원 공개경쟁임용시험 시행계획) · 의료법 시행규칙 제38조·별표 5 · 초·중등교육법 제21조 · 고용노동부 2026년 최저임금 고시. 산업·연구간호사 급여는 공식 통계가 없어 수치를 적지 않았습니다.</em></p>

<h2>연차·직군 관련 자주 묻는 질문</h2>
<ul>
<li><strong>Q. 5년차 간호사 연봉은 얼마인가요?</strong> — 공식 통계로 보면 간호사 중위 연봉은 4,500만원(고용24 재직자 조사, 2023)이고, 머니샐러리 직업 DB의 3~5년차 구간은 4,000만~5,200만원입니다. 연봉 4,500만원이면 2026년 요율 기준 월 실수령액은 약 321만원이며, 그 달의 나이트 개수와 특수부서 수당에 따라 수십만 원이 더 움직입니다. 세부 공제 내역은 <a href="/salary/45000000">연봉 4,500만원 실수령액 페이지</a>에서 확인할 수 있습니다.</li>
<li><strong>Q. 간호직 공무원과 대학병원 중 어디가 급여가 높나요?</strong> — 초임만 비교하면 대학병원이 앞섭니다. 간호직 공무원은 8급으로 임용되며 2026년 8급 1호봉 봉급은 월 ${G8_STEP1}원(직급보조비 ${G8_ALLOWANCE}원 등 수당 별도)인 반면, 직업 DB 기준 대학병원 신규는 연 3,700만~4,200만원(월 실수령 약 270만~302만원)입니다. 다만 공무원은 해마다 호봉이 오르고 정년이 보장되며 교대 근무 부담이 적어, 생애소득과 근무 강도를 함께 놓고 비교해야 합니다.</li>
<li><strong>Q. 수간호사가 되면 월급이 얼마나 오르나요?</strong> — 직업 DB 기준 10년 이상·수간호사급 구간은 연 5,000만~7,000만원으로, 중위 연봉 4,500만원과 견주면 500만~2,500만원 높은 범위입니다. 연봉 5,800만원이면 월 실수령액은 약 403만원입니다(<a href="/salary/58000000">연봉 5,800만원 실수령액</a>). 다만 관리 직위 수당은 병원마다 달라 일률적인 금액을 말하기 어렵고, 상근으로 전환되면 야간수당 비중이 줄어 총액 상승 폭은 병원에 따라 다릅니다.</li>
<li><strong>Q. 요양병원 간호사 급여는 왜 낮은 편인가요?</strong> — 기본급 테이블이 대형병원보다 낮고(직업 DB 신규 3,200만원대) 야간·특수부서 수당 비중도 작기 때문입니다. 제도적으로도 의료법 시행규칙 별표 5는 요양병원이 간호사 정원의 3분의 2 범위에서 간호조무사를 둘 수 있게 해 인력 구성이 급성기 병원과 다릅니다. 참고로 보건복지부 실태조사(2020년 기준)에서 간호조무사 평균 임금은 연 2,804만원으로 간호사 평균 4,745만원의 약 59%였습니다.</li>
</ul>
<p><em>출처: 위 두 섹션과 같습니다(고용24 재직자 조사 2023 · 보건복지부 보건의료인력 실태조사 2020년 기준 · 인사혁신처 2026년 봉급표 · 의료법 시행규칙 별표 5 · 머니샐러리 직업 DB와 본문 실수령 표). 간호사 직업 정보와 병원별 데이터는 <a href="/job/nurse">간호사 연봉 상세 페이지</a>에 정리돼 있습니다.</em></p>
`;

/**
 * 슬러그 → 보강 HTML. 항목이 없는 가이드는 GuideSupplement 가 아무것도 렌더하지 않는다.
 * 새 항목을 넣을 때도 같은 규칙: 마지막 광고 아래에서만 렌더, 본문 정본 무접촉, 수치는 검증 로그에 기록.
 */
export const guideSupplements: Record<string, string> = {
  "nurse-salary": nurseSalarySupplement,
};
