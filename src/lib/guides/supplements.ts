// src/lib/guides/supplements.ts
//
// 가이드 보강 섹션 — guides/layout.tsx 의 PageFooterAds(레이아웃 푸터 광고 3개) 아래에만 렌더되는 HTML 조각 (2026-09-12, S3-4).
//
// ★ 본문(guide.content)에 넣으면 광고 위치가 밀리므로 금지.
//   - 본문 뒤에 오는 CalcResultAd·HomeTopAd 가 아래로 밀리고,
//   - GuidePageClient 의 H2 분할 지점(1/3·2/3)이 바뀌어 본문 내 GuideMidAd·InArticleAd 위치까지 이동한다
//     (2026-08-16 "광고 위 UI 삽입" 수익 사고 규칙).
//   그래서 본문 정본(legacy-rewrite-*.ts)은 건드리지 않고, 이 조각을 src/components/GuideSupplement.tsx 가
//   guides/layout.tsx 에서 PageFooterAds 바로 아래에 붙인다(page.tsx 의 HomeTopAd 아래는 레이아웃 푸터 광고 위라 금지).
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
import { AGREEMENT_2026, H1_2026_PROFIT_TRIL, PS_HISTORY } from "@/app/calc/sk-hynix-bonus/psData";
import { FIXED_BU_RATIO, FIXED_RERATE, FIXED_SA_RATIO, getThreshold } from "@/app/calc/samsung-bonus/model";
import { SAMSUNG_OPI2_TRANCHES, SAMSUNG_WAGE_2026 } from "@/lib/bonusHome/compEngines";

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
<tr><td>신규(0~2년)</td><td>3,200만~4,200만원(직업 DB)</td><td>약 239만~307만원</td><td>병원 규모별 초봉 테이블, 그 달의 나이트 개수</td></tr>
<tr><td>3년차 전후</td><td>약 4,200만원(직업 DB 신규 구간 상단)</td><td>약 307만원</td><td>호봉 승급, 특수부서 배치 여부</td></tr>
<tr><td>5년차 전후(3~5년)</td><td>4,000만~5,200만원(직업 DB) · 중위 4,500만원(고용24 2023)</td><td>약 326만원(4,500만원 기준)</td><td>호봉 누적, 야간 전담·특수부서 수당</td></tr>
<tr><td>10년차</td><td>상위 25% 5,375만원(고용24 2023)</td><td>약 381만원</td><td>책임(주임)간호사 등 직위 승진</td></tr>
<tr><td>수간호사·관리자</td><td>5,000만~7,000만원(직업 DB)</td><td>약 357만~482만원</td><td>관리 직위 수당, 상근 전환 시 야간수당 감소</td></tr>
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
<li><strong>Q. 5년차 간호사 연봉은 얼마인가요?</strong> — 공식 통계로 보면 간호사 중위 연봉은 4,500만원(고용24 재직자 조사, 2023)이고, 머니샐러리 직업 DB의 3~5년차 구간은 4,000만~5,200만원입니다. 연봉 4,500만원이면 2026년 요율 기준 월 실수령액은 약 326만원이며, 그 달의 나이트 개수와 특수부서 수당에 따라 수십만 원이 더 움직입니다. 세부 공제 내역은 <a href="/salary/45000000">연봉 4,500만원 실수령액 페이지</a>에서 확인할 수 있습니다.</li>
<li><strong>Q. 간호직 공무원과 대학병원 중 어디가 급여가 높나요?</strong> — 초임만 비교하면 대학병원이 앞섭니다. 간호직 공무원은 8급으로 임용되며 2026년 8급 1호봉 봉급은 월 ${G8_STEP1}원(직급보조비 ${G8_ALLOWANCE}원 등 수당 별도)인 반면, 직업 DB 기준 대학병원 신규는 연 3,700만~4,200만원(월 실수령 약 273만~307만원)입니다. 다만 공무원은 해마다 호봉이 오르고 정년이 보장되며 교대 근무 부담이 적어, 생애소득과 근무 강도를 함께 놓고 비교해야 합니다.</li>
<li><strong>Q. 수간호사가 되면 월급이 얼마나 오르나요?</strong> — 직업 DB 기준 10년 이상·수간호사급 구간은 연 5,000만~7,000만원으로, 중위 연봉 4,500만원과 견주면 500만~2,500만원 높은 범위입니다. 연봉 5,800만원이면 월 실수령액은 약 407만원입니다(<a href="/salary/58000000">연봉 5,800만원 실수령액</a>). 다만 관리 직위 수당은 병원마다 달라 일률적인 금액을 말하기 어렵고, 상근으로 전환되면 야간수당 비중이 줄어 총액 상승 폭은 병원에 따라 다릅니다.</li>
<li><strong>Q. 요양병원 간호사 급여는 왜 낮은 편인가요?</strong> — 기본급 테이블이 대형병원보다 낮고(직업 DB 신규 3,200만원대) 야간·특수부서 수당 비중도 작기 때문입니다. 제도적으로도 의료법 시행규칙 별표 5는 요양병원이 간호사 정원의 3분의 2 범위에서 간호조무사를 둘 수 있게 해 인력 구성이 급성기 병원과 다릅니다. 참고로 보건복지부 실태조사(2020년 기준)에서 간호조무사 평균 임금은 연 2,804만원으로 간호사 평균 4,745만원의 약 59%였습니다.</li>
</ul>
<p><em>출처: 위 두 섹션과 같습니다(고용24 재직자 조사 2023 · 보건복지부 보건의료인력 실태조사 2020년 기준 · 인사혁신처 2026년 봉급표 · 의료법 시행규칙 별표 5 · 머니샐러리 직업 DB와 본문 실수령 표). 간호사 직업 정보와 병원별 데이터는 <a href="/job/nurse">간호사 연봉 상세 페이지</a>에 정리돼 있습니다.</em></p>
`;

// ── samsung-wage-negotiation-2026 (반도체 심층 가이드, 2026-05-12 작성) — 2026-09-27 기준 확인 사항 (R8-D) ──
// 본문(semiconductor-deepdive.ts)은 타결 전 시점의 글이다('5월 12일 본격 교섭 시작', '협상 결과를 기다리는 동안 챙길 4가지',
// '잠정합의가 6~8월에 이뤄지면'). 제목·설명(guidesMeta)과 본문은 그대로 두고(광고 사이 본문 + guidesMeta 불변 조건),
// 확정 결과는 여기(레이아웃 푸터 광고 아래)에 날짜·출처와 함께 둔다.
// ★ 본문 첫머리의 '5월 12일 본격 교섭 돌입'은 작성 당시에도 사실이 아니었다 — 교섭은 2025-12-11 상견례로 시작됐고
//   5/11~12 는 중앙노동위원회 사후조정 일정이었다. 머리말에서 그렇게 분명히 밝히고, 협상 경과는 실제 일지로 적는다(R8-D 리뷰 반영).
// 출처(모두 보도 기준, 2026-09-28 확인):
//   - 협상 일지: 파이낸셜뉴스 2026-05-27 [일지](fnnews.com/news/202605271052313943) — 2025-12-11 상견례, 12-16 1차 본교섭,
//     2026-02-19 공동교섭단 결렬 선언, 03-03 중노위 2차 조정회의 '조정 중지', 5/11~13 중노위 주관 1차 사후조정 최종 결렬,
//     5/18~20 중노위 주관 2차 사후조정 최종 결렬, 5/20 김영훈 고용노동부 장관 중재 추가 교섭 잠정 합의, 5/22~27 찬반투표, 5/27 가결
//   - 1차 사후조정 결렬 시각: 서울신문 2026-05-13(seoul.co.kr …/20260513500010) — 12일 오전 10시경 시작한 회의가 13일 오전 2시 55분쯤
//     노조 측 결렬 선언으로 끝남(첫날 11일은 kbc 2026-05-11 '사후조정 첫날 결론없이 종료')
//   - 5/20 잠정합의 기본 4.1%·성과 평균 2.1%: 뉴시스 NISX20260520_0003638405·파이낸셜뉴스 2026-05-20 속보
//   - 5/22~27 조합원 찬반투표 투표율 95.5%·찬성 73.7% 가결: 헤럴드경제 2026-05-27(biz.heraldcorp.com/article/10756978)
//   - DS부문 특별경영성과급: 아시아경제 2026-05-21(잠정 합의서 — 사업성과 10.5% 재원·상한 없음·부문 40%/사업부 60%·세후 전액 자사주,
//     3분의 1 즉시 매각 가능·나머지 3분의 1씩 1년·2년 매각 제한·10년 적용·OPI 유지),
//     파이낸셜뉴스 2026-09-27(지급 조건 DS부문 연간 영업이익 2026~2028년 200조원·2029~2035년 100조원, 2035년까지 10년)
// 2026-09-30 후속(R8-D 리뷰 minor 3·4, dedupe 13 — 모두 보도 기준):
//   - 소급: 오피니언뉴스 2026-05-20(opinionnews.co.kr idxno=138762) '임금인상 및 샐러리캡 상향은 2026년 3월 급여부터 소급 적용' —
//     본문(semiconductor-deepdive.ts)의 '소급 적용은 1월 1일자'·'7월 급여에 5~7개월치 차액'은 작성 당시의 가정.
//   - 재원 표현: 파이낸셜뉴스 2026-09-27(fnnews.com/news/202609270938413557) 'DS부문 사업성과인 영업이익의 10.5%' — 노사가 합의해
//     정한 사업성과 기준이라 '영업이익의 10.5%'로 줄여 쓰지 않는다(SEO 보강 specialBonusPoolSupplement 와 같은 표현 계열).
//   - 세부안: 같은 기사 — 초기업노조가 9월 마지막 주 DS 특별경영성과급 산정·지급 세부안을 조합원에게 안내한다고 공지(예정).
//     배포 당일 세부안 공개 보도가 있으면 그 사실(보도 기준·날짜)로 바꾸고 H2 날짜를 확인일로 바꾼다.
//   - 인상률 비교의 주어: 합계 6.2%는 당시 추정(5.0~6.5%) 안이지만 기본인상률 4.1%는 추정보다 낮다.
// 수치는 계산기 정본에서 끼워 넣는다 — SAMSUNG_WAGE_2026(bonusHome/compEngines: 4.1·2.1·6.2·2026-05-27),
// FIXED_RERATE·FIXED_BU_RATIO·FIXED_SA_RATIO·getThreshold(samsung-bonus/model), SAMSUNG_OPI2_TRANCHES(compEngines).
// 투표율·찬성률(95.5%·73.7%)만 위 보도값 리터럴(삼성 성과급 계산기 FAQ·autumn-2026-season 가이드와 같은 값).
// 정본 값이 이 문구의 전제와 달라지면(가결일·3분의 1씩 3회·임계값) 모듈 로드 시 실패시켜 문구를 고치게 한다.
const SAMSUNG_RATIFIED = /^(\d{4})-(\d{2})-(\d{2})$/.exec(SAMSUNG_WAGE_2026.ratifiedDate);
if (!SAMSUNG_RATIFIED) throw new Error("[guideSupplements] SAMSUNG_WAGE_2026.ratifiedDate 형식이 YYYY-MM-DD 가 아니다");
const SAMSUNG_RATIFIED_KO = `${Number(SAMSUNG_RATIFIED[1])}년 ${Number(SAMSUNG_RATIFIED[2])}월 ${Number(SAMSUNG_RATIFIED[3])}일`;
if (
  SAMSUNG_OPI2_TRANCHES.length !== 3 ||
  SAMSUNG_OPI2_TRANCHES.some((t, i) => t.afterYears !== i || Math.abs(t.share - 1 / 3) > 1e-9)
) {
  throw new Error("[guideSupplements] SAMSUNG_OPI2_TRANCHES 가 '즉시·1년·2년 3분의 1씩'이 아니다 — samsung-wage-negotiation-2026 보강 문구를 고칠 것");
}
const SAMSUNG_THRESHOLD_EARLY = getThreshold(2026);
const SAMSUNG_THRESHOLD_LATE = getThreshold(2029);
if (getThreshold(2028) !== SAMSUNG_THRESHOLD_EARLY || getThreshold(2035) !== SAMSUNG_THRESHOLD_LATE || getThreshold(2036) !== 0) {
  throw new Error("[guideSupplements] samsung-bonus getThreshold 구간이 2026~2028·2029~2035 가 아니다 — 보강 문구를 고칠 것");
}
/** 부문 : 사업부 = FIXED_BU_RATIO : FIXED_SA_RATIO(4 : 6) → 40%·60%. 정수 %가 아니면 문구가 어색해지므로 로드 시 실패 */
const SAMSUNG_POOL_DIV_PCT = (FIXED_BU_RATIO * 100) / (FIXED_BU_RATIO + FIXED_SA_RATIO);
const SAMSUNG_POOL_BU_PCT = (FIXED_SA_RATIO * 100) / (FIXED_BU_RATIO + FIXED_SA_RATIO);
if (!Number.isInteger(SAMSUNG_POOL_DIV_PCT) || !Number.isInteger(SAMSUNG_POOL_BU_PCT)) {
  throw new Error("[guideSupplements] samsung-bonus 부문:사업부 비율이 정수 %로 나뉘지 않는다");
}

const samsungWageNegotiation2026Supplement = `
<h2>2026년 9월 27일 기준 확인 사항</h2>
<p>이 글은 2026년 5월 12일에 쓴 분석입니다. 본문 첫머리의 '5월 12일 본격 교섭 시작'은 사실과 다릅니다 — 2026년 임금교섭은 2025년 12월 11일 상견례로 시작됐고, 5월 11~12일은 중앙노동위원회 사후조정 일정이었습니다. 본문 일정 상자의 '6~8주, 5~10차 본교섭'·'합의 시점은 6~8월'도 실제 경과와 맞지 않으니 아래 협상 경과를 기준으로 보세요. 본문의 인상률 전망과 '결과를 기다리는 동안' 항목은 작성 당시의 내용이며, 그 뒤 확정된 결과를 날짜와 출처를 붙여 아래에 정리합니다.</p>
<ul>
<li><strong>협상 경과</strong> — 2025년 12월 11일 상견례(12월 16일 1차 본교섭) → 2026년 2월 19일 교섭 결렬 → 3월 3일 중앙노동위원회 조정 중지 → 5월 11~12일 1차 사후조정(13일 새벽 결렬) → 5월 18~20일 2차 사후조정(결렬) → 5월 20일 고용노동부 장관 중재 교섭에서 잠정합의 → 5월 22~27일 조합원 찬반투표(투표율 95.5%, 찬성 73.7%) → ${SAMSUNG_RATIFIED_KO} 가결(파이낸셜뉴스·서울신문·헤럴드경제 보도 기준). 상견례부터 가결까지 5개월 넘게 걸린 교섭입니다.</li>
<li><strong>임금 인상률</strong> — 기본인상률 ${SAMSUNG_WAGE_2026.basePct}% + 성과인상률 평균 ${SAMSUNG_WAGE_2026.meritAvgPct}%, 합계 평균 ${SAMSUNG_WAGE_2026.totalPct}%입니다. 합계 ${SAMSUNG_WAGE_2026.totalPct}%는 본문의 당시 추정(5.0~6.5%) 범위 안이지만 기본인상률만 보면 ${SAMSUNG_WAGE_2026.basePct}%로 추정보다 낮고, 직급별 시뮬레이션 표에서는 6% 열이 가장 가깝습니다.</li>
<li><strong>소급 적용</strong> — 인상분은 2026년 3월 급여부터 소급 적용됩니다(보도 기준). 본문의 1월 1일자 소급과 7월 급여에 5~7개월치 차액 계산은 작성 당시의 가정입니다.</li>
<li><strong>DS부문 특별경영성과급 신설</strong> — 노사가 합의해 정한 DS부문 사업성과의 ${FIXED_RERATE}%를 재원으로 하고 지급률 상한은 두지 않습니다. 재원은 부문 ${SAMSUNG_POOL_DIV_PCT}%·사업부 ${SAMSUNG_POOL_BU_PCT}%로 나누고, 세후 금액 전액을 자사주로 지급합니다. 받은 주식의 3분의 1은 즉시 팔 수 있고 나머지 3분의 1씩은 1년·2년 동안 매각이 제한됩니다. 2035년까지 10년간 운영되며, 지급 조건은 DS부문 연간 영업이익 ${SAMSUNG_THRESHOLD_EARLY}조원(2026~2028년)·${SAMSUNG_THRESHOLD_LATE}조원(2029~2035년)입니다(아시아경제·파이낸셜뉴스 보도 기준).</li>
<li><strong>기존 OPI 유지</strong> — 초과이익성과금(OPI)은 그대로 두고 그 위에 특별경영성과급이 더해집니다. 지급 조건이 DS부문 연간 영업이익 기준이라 2026년분은 연간 실적이 나온 뒤 지급 여부가 정해지며, 산정·지급 세부안은 9월 마지막 주 조합원 안내 예정이라고 보도됐습니다(파이낸셜뉴스 2026-09-27) — 회사 안내를 기준으로 확인하세요.</li>
</ul>
<p>사업부별 세후 금액은 <a href="/calc/samsung-bonus">삼성전자 성과급 계산기</a>에서 영업이익과 사업부를 넣어 볼 수 있습니다. 계산기 결과는 입력한 영업이익을 가정한 시나리오이며 전망이 아닙니다. 협상 쟁점 배경과 타결 결과 요약은 <a href="/samsung-negotiation-2026">삼성전자 2026 임금협상 통합 페이지</a>에도 정리돼 있습니다(그 페이지의 쟁점 카드·직급별 인상폭 표는 협상 전 시나리오입니다).</p>

<h2>협상 결과 관련 자주 묻는 질문</h2>
<ul>
<li><strong>Q. 삼성전자 2026년 임금 인상률은 최종 몇 %인가요?</strong> — 기본인상률 ${SAMSUNG_WAGE_2026.basePct}%와 성과인상률 평균 ${SAMSUNG_WAGE_2026.meritAvgPct}%를 더한 평균 ${SAMSUNG_WAGE_2026.totalPct}%입니다. ${SAMSUNG_RATIFIED_KO} 조합원 찬반투표 가결로 확정됐습니다(보도 기준). 성과인상률은 평균값이라 개인별 인상률은 이와 다를 수 있습니다.</li>
<li><strong>Q. 특별경영성과급은 기존 OPI와 어떻게 다른가요?</strong> — OPI(초과이익성과금)는 그대로 유지되고, 특별경영성과급은 DS부문에 새로 생긴 제도입니다. 노사가 합의해 정한 DS부문 사업성과의 ${FIXED_RERATE}%를 상한 없이 재원으로 삼아 부문 ${SAMSUNG_POOL_DIV_PCT}%·사업부 ${SAMSUNG_POOL_BU_PCT}%로 나누고, 세후 금액 전액을 자사주로 받습니다(보도 기준).</li>
<li><strong>Q. 특별경영성과급 자사주는 바로 팔 수 있나요?</strong> — 받은 주식의 3분의 1은 즉시 팔 수 있고, 나머지 3분의 1씩은 각각 1년·2년 동안 매각이 제한됩니다(보도 기준). 잠금이 풀리는 시점의 주가에 따라 실제 현금화 금액은 달라집니다.</li>
</ul>
`;

// ── sk-hynix-wage-2026 (반도체 심층 가이드, 2026-05-13 작성) — 2026-09-27 기준 확인 사항 ──
// 본문(semiconductor-deepdive.ts)은 광고 사이 표·문단이라 폭 맞춤 정정만 했다(2025년 행 psData 값, 2026년 전망 행 취소선·'(정정)',
// '합의선 추정'→'당시의 추정'). 확정된 값과 날짜는 여기(레이아웃 푸터 광고 아래)에 둔다.
// 수치는 전부 계산기 정본 psData.ts 에서 끼워 넣는다 — AGREEMENT_2026(2026-09-16 총투표 가결: 헤럴드경제·파이낸셜뉴스 2026-09-16 보도),
// PS_HISTORY 2025(영업이익 47.2조 = DART 사업보고서 rcpNo 20260317000635, PS 2,964% = 보도·2026-02-05 지급),
// H1_2026_PROFIT_TRIL(상반기 영업이익 98.2조 — 회사 실적 발표). psData 의 합의 상태가 ratified 가 아니면 '가결' 문구가 틀리므로 로드 시 실패.
if (AGREEMENT_2026.status !== "ratified") {
  throw new Error("[guideSupplements] psData AGREEMENT_2026.status 가 ratified 가 아니다 — sk-hynix-wage-2026 보강 문구를 고칠 것");
}
const SKH_PS_2025 = PS_HISTORY.find((r) => r.year === 2025);
if (!SKH_PS_2025 || SKH_PS_2025.psRatePct == null) throw new Error("[guideSupplements] psData PS_HISTORY 에 2025년 PS 가 없습니다");
const SKH_PS_2025_RATE = won(SKH_PS_2025.psRatePct);
const SKH_SPLIT = AGREEMENT_2026.newSplit;
const SKH_POOL_PCT = Math.round(AGREEMENT_2026.poolRate * 100);

const skHynixWage2026Supplement = `
<h2>2026년 9월 27일 기준 확인 사항</h2>
<p>이 글은 2026년 5월 임금협상 초기에 쓴 분석입니다. 그 뒤 확정된 내용을 날짜와 출처를 붙여 정리합니다. 본문 PS 추이 표의 2026년 행은 작성 당시의 전망으로, 상반기 실적과 맞지 않아 취소선으로 철회했습니다.</p>
<ul>
<li><strong>2026 임금협상 타결</strong> — 2026년 9월 16일 조합원 총투표에서 수정 잠정합의안이 가결됐습니다(헤럴드경제·파이낸셜뉴스 2026-09-16 보도 기준). 기본급 인상률은 ${AGREEMENT_2026.wageIncreasePct}%로, 본문의 당시 추정(5.5~7.0%) 범위 안입니다.</li>
<li><strong>성과급(PS) 지급 방식</strong> — 재원은 영업이익의 ${SKH_POOL_PCT}%(상한 없음)입니다. ${AGREEMENT_2026.appliesFrom} 당해 ${SKH_SPLIT.cashNowPct + SKH_SPLIT.stockNowPct}%(현금 ${SKH_SPLIT.cashNowPct}% + 자사주 ${SKH_SPLIT.stockNowPct}%)를 지급하고, 나머지 ${SKH_SPLIT.stockYear1Pct + SKH_SPLIT.stockYear2Pct}%는 1년 뒤·2년 뒤 주식으로 ${SKH_SPLIT.stockYear1Pct}%씩 나눠 지급합니다(보도 기준).</li>
<li><strong>2025년 실적분 PS</strong> — 기본급 대비 ${SKH_PS_2025_RATE}%(2026년 2월 5일 지급, 보도 기준). 같은 해 연결 영업이익은 ${SKH_PS_2025.opTril}조원(DART 사업보고서)입니다.</li>
<li><strong>2026년 실적</strong> — 상반기 영업이익 약 ${H1_2026_PROFIT_TRIL}조원(회사 실적 발표). 2026년분 PS 지급률은 2027년 초 연간 실적 발표 뒤 확정됩니다.</li>
</ul>
<p>연도별 PS·PI 이력은 <a href="/guides/sk-hynix-ps-history-2026-prospect">SK하이닉스 PS 연도별 지급률과 2026 지급 방식</a>에, 새 지급 방식의 세후 금액은 <a href="/calc/sk-hynix-bonus">SK하이닉스 성과급 계산기</a>에 정리돼 있습니다. 계산기 결과는 입력한 영업이익을 가정한 시나리오이며 전망이 아닙니다.</p>
`;

/**
 * 슬러그 → 보강 HTML. 항목이 없는 가이드는 GuideSupplement 가 아무것도 렌더하지 않는다.
 * 새 항목을 넣을 때도 같은 규칙: 레이아웃 푸터 광고(PageFooterAds) 아래에서만 렌더, 본문 정본 무접촉, 수치는 검증 로그에 기록.
 */
export const guideSupplements: Record<string, string> = {
  "samsung-wage-negotiation-2026": samsungWageNegotiation2026Supplement,
  "nurse-salary": nurseSalarySupplement,
  "sk-hynix-wage-2026": skHynixWage2026Supplement,
};

// ── 일시적 2주택 처분 기한 개정(소득세법 시행령 대통령령 제36737호, 2026-10-01 시행) 보강 — 본문은 supplements-two-home-law.ts.
//    다른 배치가 고치는 맵·import 줄과 겹치지 않도록 파일 끝에서 합친다(ESM import 는 끌어올려진다). 같은 슬러그가 두 번 등록되면 로드 시 바로 실패한다.
import { guideSupplementsTwoHomeLaw } from "./supplements-two-home-law";
for (const [slug, html] of Object.entries(guideSupplementsTwoHomeLaw)) {
  if (slug in guideSupplements) throw new Error(`[guideSupplements] 보강 슬러그 중복: ${slug}`);
  guideSupplements[slug] = html;
}
