// src/lib/guides/hot-bonus-tax-complete.ts
//
// 13차 점검 — 성과급 + 세금 + 건강보험 전문 SEO 가이드 50편.
// 운영자 명시 요청: 성과급에 따른 모든 세법·건강보험·구간별 계산법 깊이.
// 5개 영역 각 10편 = 50편. 누적 181편.

import type { Guide } from "@/lib/guidesData";
import { UNEMPLOYMENT_BENEFIT_2026 } from "@/config/unemploymentBenefit";

// 구직급여 1일 상한 표시값 — 정본(src/config/unemploymentBenefit.ts)에서 끼워 넣는다 (verify-tax-constants 게이트)
const UB_UPPER = UNEMPLOYMENT_BENEFIT_2026.DAILY_UPPER.toLocaleString("en-US");

// ═══════════════════════════════════════════════════════════════
// 영역 A — 성과급 종류·구조 (10편)
// ═══════════════════════════════════════════════════════════════

const bonusVsIncentive = `
<p class="lead">성과급·인센티브·보너스는 비슷해 보이지만 법적 성격·세금·근로기준법 적용이 다릅니다. 회사 정관·근로계약서에 따라 통상임금 포함 여부 결정 → 퇴직금·연차수당·시간외수당 계산 베이스 변경 → 직장인 평생 임금 수억원 차이 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 4가지 구분</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">종류</th><th class="p-3">법적 성격</th><th class="p-3">통상임금</th><th class="p-3">세금</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3"><strong>정기상여</strong></td><td class="p-3">근로기준법상 임금</td><td class="p-3 text-emerald-600">포함</td><td class="p-3">근로소득</td></tr>
<tr class="border-t"><td class="p-3"><strong>경영성과급</strong></td><td class="p-3">임금이지만 변동성</td><td class="p-3">조건부 포함</td><td class="p-3">근로소득</td></tr>
<tr class="border-t"><td class="p-3"><strong>격려금·포상금</strong></td><td class="p-3">은혜적 금품</td><td class="p-3 text-rose-600">미포함</td><td class="p-3">근로소득(과세)</td></tr>
<tr class="border-t"><td class="p-3"><strong>주식 보상(RSU·옵션)</strong></td><td class="p-3">근로소득 + 양도소득</td><td class="p-3 text-rose-600">미포함</td><td class="p-3">근로 + 양도</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 통상임금 포함 효과 — 연 200만원+</h2>
<p>월 300만원 직원이 정기상여 300%(연 900만원) 받는 경우. 통상임금이 월 375만원으로 인상되어 연차수당·퇴직금·야근수당 모두 25% 증가. 평생 임금 약 1억 차이.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산기</a></li><li>· <a href="/calc/samsung-bonus" class="text-primary underline">삼성 성과급 시뮬레이터</a></li></ul></div>
`;

const samsungOpiTai = `
<p class="lead">삼성전자 성과급은 OPI(Overall Performance Incentive)와 TAI(Target Achievement Incentive) 듀얼 구조. OPI는 사업부 영업이익 연동(연 1회 1월 지급, 최대 기본급 50%), TAI는 목표달성도(연 2회 6월·12월, 최대 100%). 메모리·DS 부문은 OPI 비중 50%까지 가능해 변동성 가장 큼.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 OPI vs TAI 비교</h2>
<ul class="space-y-3 mt-4">
<li><strong>OPI (1월)</strong>: 사업부 영업이익 × 일정 비율. 메모리 호황기 50%(=6개월치), 불황기 0% 가능. 변동성 큼.</li>
<li><strong>TAI (6월·12월)</strong>: 목표달성도 평가. 최대 기본급 100% (월 100%). 비교적 안정적.</li>
<li><strong>합산</strong>: 호황기 연 OPI 50% + TAI 100% × 2회 = 기본급 250% 가능 (= 약 30개월치)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 메모리 사업부 과장</h2>
<p>기본급 5,500만원 가정, 메모리 호황기 (2024~2026):</p>
<ul class="space-y-2 mt-4">
<li>· OPI 50%: 약 2,750만원 (1월 지급)</li>
<li>· TAI 100% × 2회: 약 5,500만원 (6월·12월)</li>
<li>· 영끌 연봉: 5,500 + 8,250 = <strong>약 1억 3,750만원</strong></li>
<li>· 한계세율 35~38% → 약 4,800~5,200만원 세금</li>
<li>· 실수령 약 8,500~8,950만원</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/samsung-bonus" class="text-primary underline">삼성 OPI·TAI 시뮬레이터</a></li><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li></ul></div>
`;

const skHynixPs = `
<p class="lead">SK하이닉스 PS(Profit Sharing, 초과이익분배금)는 연간 영업이익의 10%를 재원으로 임직원에게 분배하는 성과급. 2025년 9월 합의로 기본급 1,000% 상한이 폐지됐고, 2025년분은 <strong>2,964%</strong>(영업이익 47.2조)가 확정 지급됐다. 2026년분 지급 방식은 2026-08-20 잠정합의안(현금 40% + 자사주 60%)이 8/25 총투표에서 부결된 뒤, 수정안(<strong>당해 현금 50% + 자사주 30%, 1·2년 후 자사주 10%씩 이연</strong>)이 2026-09-16 총투표에서 가결(찬성 57.08%)되어 확정됐다.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 SK하이닉스 연도별 PS 추이</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">연도</th><th class="p-3">PS %</th><th class="p-3">영업이익</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">2021</td><td class="p-3">1,000% (상한)</td><td class="p-3">약 12.4조</td></tr>
<tr class="border-t"><td class="p-3">2022</td><td class="p-3">600%</td><td class="p-3">약 6.8조</td></tr>
<tr class="border-t"><td class="p-3">2023</td><td class="p-3">0% (적자)</td><td class="p-3">-7.7조</td></tr>
<tr class="border-t"><td class="p-3">2024</td><td class="p-3">1,500%</td><td class="p-3">약 23.4조</td></tr>
<tr class="border-t"><td class="p-3">2025</td><td class="p-3"><strong>2,964% 확정</strong> (상한 폐지 첫 적용)</td><td class="p-3">47.2조</td></tr>
<tr class="border-t"><td class="p-3"><strong>2026 (전망)</strong></td><td class="p-3"><strong>상한 없음 — 현금 50%+자사주 50% 신 체계 (9/16 가결)</strong></td><td class="p-3"><strong>컨센서스 약 250조</strong></td></tr>
</tbody></table></div>
<p class="text-sm">2026년 상반기 실적만 98.2조원 — 컨센서스(250조) 실현 시 1인 평균 세전 약 7억원 추정 보도가 있다. 최신 수치·신구 체계 비교는 <a href="/calc/sk-hynix-bonus" class="text-primary underline">SK하이닉스 성과급 계산기</a>에서.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 PS 1,500% 실수령액</h2>
<p>기본급 6,000만원 직원 PS 1,500% = 9,000만원 추가:</p>
<ul class="space-y-2 mt-4">
<li>· 영끌 1억 5,000만원</li>
<li>· 한계세율 38% 적용 (1억 5천 초과)</li>
<li>· 종합소득세 + 지방세 + 4대보험 ≈ 5,800만원</li>
<li>· 실수령 약 9,200만원</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/salary-db/sk-hynix" class="text-primary underline">SK하이닉스 연봉 상세</a></li><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산기</a></li></ul></div>
`;

const lgPoscoBonus = `
<p class="lead">LG전자·LG에너지솔루션·현대차·기아·포스코의 성과급 구조 비교. LG·현대차는 분기·반기 단위, 포스코는 연 1회. 사업부별 차등이 가장 큰 곳은 LG전자(VS·HE·MC 사업부별 ±50% 격차), 가장 균등한 곳은 포스코.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 4사 성과급 구조</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">회사</th><th class="p-3">주기</th><th class="p-3">한도</th><th class="p-3">사업부 차등</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">LG전자</td><td class="p-3">분기 + 연말</td><td class="p-3">기본급 600~1,200%</td><td class="p-3">크다(VS·HE)</td></tr>
<tr class="border-t"><td class="p-3">LG엔솔</td><td class="p-3">분기 + 연말</td><td class="p-3">기본급 400~1,000%</td><td class="p-3">중간</td></tr>
<tr class="border-t"><td class="p-3">현대차·기아</td><td class="p-3">분기 + 연말</td><td class="p-3">기본급 500~1,000%</td><td class="p-3">작다(통합)</td></tr>
<tr class="border-t"><td class="p-3">포스코</td><td class="p-3">연 1회</td><td class="p-3">기본급 200~700%</td><td class="p-3">작다(균등)</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 사례 — 직장인 6,000만원 + 성과급 800%</h2>
<ul class="space-y-2 mt-4">
<li>· 성과급: 6,000만 × 800% = 4억 8천만 (8개월 분) — 단, 800%는 월급 기준이라 약 4,000만원</li>
<li>· 영끌: 약 1억</li>
<li>· 한계세율 35% → 약 2,700만원 세금</li>
<li>· 실수령 약 7,300만원</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li></ul></div>
`;

const itRsuVsCash = `
<p class="lead">네이버·카카오·쿠팡·토스·당근 등 IT 기업은 현금 보너스보다 RSU(Restricted Stock Unit) 비중이 큼. RSU는 베스팅 시 근로소득세 + 매도 시 양도세 22%(해외 상장) 또는 비과세(국내 상장). 보유 전략에 따라 절세 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 IT 기업 RSU 정책 비교</h2>
<ul class="space-y-3 mt-4">
<li><strong>네이버</strong>: 매년 RSU 부여, 4년 베스팅, 매도 즉시 비과세(국내 상장)</li>
<li><strong>카카오</strong>: RSU 5년 베스팅, 매년 25% 베스팅</li>
<li><strong>쿠팡</strong>: 미국 상장 RSU, 4년 베스팅, 양도세 22%(미국)</li>
<li><strong>토스</strong>: 비상장 RSU, IPO 시 6개월 lockup</li>
<li><strong>당근</strong>: 비상장 스톡옵션, 행사가 우대</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 네이버 RSU 5,000만원 vs 현금 5,000만원</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>RSU</strong>: 베스팅 시 근로소득세 약 1,925만원 + 매도 즉시 비과세 → 실수령 약 3,075만원</li>
<li>· <strong>현금</strong>: 근로소득세 약 1,925만원 + 4대보험 일부 → 실수령 약 2,900만원</li>
<li>· <strong>RSU가 약 175만원 유리</strong> (단 주가 변동 리스크)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
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

const bonus1euk = `
<p class="lead">성과급 1억 받으면 실수령 얼마? 연봉 7,000만원 + 성과급 1억 = 영끌 1.7억 가정 시 세금·4대보험 약 3,627만원 → <strong>성과급 세후 약 6,373만원</strong> (64%). 추가 세액공제 30% 가정 시 약 7,300만원.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 1억 상세 세금 분석</h2>
<p>연봉 7,000만원 + 성과급 1억 (영끌 1.7억) 직장인 가정:</p>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">항목</th><th class="p-3">금액</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">총 소득</td><td class="p-3">170,000,000원</td></tr>
<tr class="border-t"><td class="p-3">각종 소득공제 (1인)</td><td class="p-3">-29,850,851원</td></tr>
<tr class="border-t"><td class="p-3">과세표준</td><td class="p-3">140,149,149원</td></tr>
<tr class="border-t"><td class="p-3">결정세액 (35% 구간)</td><td class="p-3">33,412,202원</td></tr>
<tr class="border-t"><td class="p-3">지방소득세 10%</td><td class="p-3">3,341,220원</td></tr>
<tr class="border-t"><td class="p-3">4대보험 (상한 적용)</td><td class="p-3">약 8,133,000원</td></tr>
<tr class="border-t"><td class="p-3">건보 정산 (이듬해 4월)</td><td class="p-3">약 4,067,000원</td></tr>
<tr class="border-t"><td class="p-3"><strong>총 세금·보험</strong></td><td class="p-3"><strong>약 48,954,000원</strong></td></tr>
<tr class="border-t"><td class="p-3"><strong>연간 실수령</strong></td><td class="p-3"><strong>약 121,046,000원</strong></td></tr>
</tbody></table></div>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산기</a></li></ul></div>
`;

const bonus5000 = `
<p class="lead">성과급 5,000만원 받으면 실수령 약 3,570만원 (IRP 시 3,690만원). 연봉 + 성과급 합산 한계세율 35% 구간 진입 여부에 따라 차이. IRP·연금저축 만기 납입 시 약 119만원 환급.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 성과급 5,000만원 시뮬</h2>
<p>연봉 6,000만원 + 성과급 5,000만원 (영끌 1억 1천):</p>
<ul class="space-y-2 mt-4">
<li>· 과세표준 약 8,433만원 → 24% 구간</li>
<li>· 성과급 5,000 부분 소득세: 약 991만원</li>
<li>· 지방세 약 99만원</li>
<li>· 4대보험 부담 약 339만원</li>
<li>· <strong>총 부담 약 1,429만원 → 실수령 약 3,571만원</strong> (71.4%)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 IRP·연금저축 활용</h2>
<p>성과급 받기 전 11~12월에 IRP·연금저축 900만원 만기 납입 → 약 119만원(13.2%) 세액공제 환급 → 실수령 약 3,690만원으로 증가.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li><li>· <a href="/tools/finance/irp" class="text-primary underline">IRP 계산기</a></li></ul></div>
`;

const bracket8Step = `
<p class="lead">성과급 받으면 적용되는 8단계 누진세율 + 지방소득세 10%. 한 단계 넘어가도 초과분에만 높은 세율 적용. 누진공제 시스템으로 갑작스러운 세금 폭탄은 막아주지만, 그래도 한계세율 점프 효과는 크게 작용.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 2026 누진세율표</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">과세표준</th><th class="p-3">세율</th><th class="p-3">누진공제</th><th class="p-3">최대 산출세액</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">1,400만 이하</td><td class="p-3">6%</td><td class="p-3">-</td><td class="p-3">84만</td></tr>
<tr class="border-t"><td class="p-3">~5,000만</td><td class="p-3">15%</td><td class="p-3">126만</td><td class="p-3">624만</td></tr>
<tr class="border-t"><td class="p-3">~8,800만</td><td class="p-3">24%</td><td class="p-3">576만</td><td class="p-3">1,536만</td></tr>
<tr class="border-t"><td class="p-3">~1.5억</td><td class="p-3">35%</td><td class="p-3">1,544만</td><td class="p-3">3,706만</td></tr>
<tr class="border-t"><td class="p-3">~3억</td><td class="p-3">38%</td><td class="p-3">1,994만</td><td class="p-3">9,406만</td></tr>
<tr class="border-t"><td class="p-3">~5억</td><td class="p-3">40%</td><td class="p-3">2,594만</td><td class="p-3">17,406만</td></tr>
<tr class="border-t"><td class="p-3">~10억</td><td class="p-3">42%</td><td class="p-3">3,594만</td><td class="p-3">38,406만</td></tr>
<tr class="border-t"><td class="p-3">10억 초과</td><td class="p-3">45%</td><td class="p-3">6,594만</td><td class="p-3">-</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 핵심 — 초과분만 높은 세율</h2>
<p>과세표준 8,800만→8,801만 되어도 추가 1만에만 35% 적용. 기존 8,800만은 24% 유지. 누진공제로 보정.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li></ul></div>
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

// ═══════════════════════════════════════════════════════════════
// 영역 C — 성과급 4대보험·건강보험 (10편)
// ═══════════════════════════════════════════════════════════════

const bonusHealth3545 = `
<p class="lead">성과급에 건강보험료 3.595% + 장기요양 0.472% = 본인 약 4.07% 부과. 국민연금과 달리 건강보험은 보수월액 상한이 매우 높아 사실상 전액 부과. 성과급 1억 받으면 이듬해 4월 정산 시 본인 건보료 약 360만원 추가 부과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 건강보험료 상한 없음</h2>
<ul class="space-y-2 mt-4">
<li>· 건강보험 본인 3.595%</li>
<li>· 장기요양 건강보험의 13.14% = 약 0.472%</li>
<li>· 합산 본인 약 4.07%</li>
<li>· <strong>보수월액 상한이 매우 높아 → 성과급에 사실상 전액 부과</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 1억 시 건보료 부담</h2>
<ul class="space-y-2 mt-4">
<li>· 본인 부담: 1억 × 4.07% = <strong>약 407만원</strong></li>
<li>· 회사 부담: 동일 약 407만원</li>
<li>· 합계 814만원이 건강보험공단에 납부</li>
<li>· 매월 정기 부과 + 다음해 4월 연말정산으로 사후 부과</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 4월 건보료 정산 폭탄 주의</h2>
<p>매월 정기 부과는 월급 기준이라 성과급분은 이듬해 4월분 보험료에 작년 소득 기준 정산액으로 일시 반영(정산액이 당월 보험료 이상이면 12회 이내 분할 신청 가능). 성과급 큰 해는 4월 고지액이 크게 늘 수 있으니 미리 대비.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산기</a></li><li>· <a href="/health-insurance-2026" class="text-primary underline">건보료 연말정산 가이드</a></li></ul></div>
`;

const bonusInsuranceCeiling = `
<p class="lead">4대보험 상한·하한 정리. 국민연금 보수월액 상한 659만(2026년 7월~), 건강보험은 상한이 매우 높아 사실상 전액 부과, 고용보험 상한 없음, 산재 회사만 부담. 성과급 큰 직원에게 가장 큰 부담은 건강보험(약 4.07%), 그 다음 고용보험(0.9%).</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 4대보험 본인 부담 정리</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">보험</th><th class="p-3">본인 부담률</th><th class="p-3">상한·하한</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">국민연금</td><td class="p-3">4.75%</td><td class="p-3"><strong>상한 659만원</strong></td></tr>
<tr class="border-t"><td class="p-3">건강보험</td><td class="p-3">3.595%</td><td class="p-3">보수월액 상한 매우 높음(사실상 전액)</td></tr>
<tr class="border-t"><td class="p-3">장기요양</td><td class="p-3">0.472%</td><td class="p-3">건강보험료에 연동(사실상 전액)</td></tr>
<tr class="border-t"><td class="p-3">고용보험</td><td class="p-3">0.9%</td><td class="p-3">상한 없음</td></tr>
<tr class="border-t"><td class="p-3">산재보험</td><td class="p-3">0% (회사 부담)</td><td class="p-3">-</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 1억 시 4대보험 부담</h2>
<ul class="space-y-2 mt-4">
<li>· 국민연금: 0원 (상한 적용)</li>
<li>· 건강보험: 359.5만원</li>
<li>· 장기요양: 47.2만원</li>
<li>· 고용보험: 90만원</li>
<li>· <strong>합계 약 497만원</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산</a></li></ul></div>
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

const optionalContinueAfterBonus = `
<p class="lead">성과급 큰 직원이 퇴직 시 임의계속가입 신청은 거의 무조건 유리. 작년 성과급 큰 보수월액 기준으로 4월 정산금이 부과되지만, 임의계속가입은 직장가입자 시절 보수월액 기준 보험료 유지.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 임의계속가입 신청</h2>
<ul class="space-y-2 mt-4">
<li>· 퇴직 후 2개월 이내 신청</li>
<li>· 최대 36개월 유지 가능</li>
<li>· 본인 + 회사 분담분 모두 본인 부담</li>
<li>· 재산·소득 점수가 아닌 보수월액 기준</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 성과급 큰 임원 퇴직</h2>
<p>연봉 1.5억 + 성과급 5,000만 임원 퇴직 후:</p>
<ul class="space-y-2 mt-4">
<li>· <strong>지역가입자</strong>: 재산·소득 점수 → 월 200~300만원</li>
<li>· <strong>임의계속가입</strong>: 약 월 60만원 × 36개월 = 2,160만원</li>
<li>· <strong>3년 절감: 약 5,000만원</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 영역 D — 성과급 절세 심화 (10편)
// ═══════════════════════════════════════════════════════════════

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
<p class="lead">성과급 받는 해 부부 분산 절세 전략. 의료비·교육비·신용카드 결제를 본인 vs 배우자 분산. 본인 한계세율 35%이면 본인이 공제, 배우자 한계세율 15%이면 배우자가 공제하는 게 유리한 경우 다름. 정확한 시뮬 필수.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 결정 기준</h2>
<ul class="space-y-3 mt-4">
<li><strong>의료비·교육비</strong>: 총급여 낮은 쪽이 3% 한도 빠르게 도달 → 공제 효과 큼</li>
<li><strong>신용카드·기부금</strong>: 한계세율 높은 쪽이 공제 → 환급 효과 큼</li>
<li><strong>인적공제</strong>: 한계세율 높은 쪽이 등록 → 환급 효과 큼</li>
<li><strong>연금저축·IRP</strong>: 각자 별도 한도 활용</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 부부 의료비 600만</h2>
<p>본인 총급여 1.5억(한계 35%) + 배우자 총급여 5,000만(한계 15%):</p>
<ul class="space-y-2 mt-4">
<li>· <strong>본인 공제</strong>: 600 - 4,500(3%) = 150 × 15% = 22.5만 환급</li>
<li>· <strong>배우자 공제</strong>: 600 - 150(3%) = 450 × 15% = 67.5만 환급</li>
<li>· <strong>배우자가 약 45만 유리</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 영역 E — 성과급 시점·실전 (10편)
// ═══════════════════════════════════════════════════════════════

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

const bonusRetireImpact = `
<p class="lead">성과급 받고 퇴직 시 퇴직금에 영향 — 정기상여(통상임금 포함)는 퇴직금 베이스 증가, 격려금·일회성 보너스는 미포함. 통상임금 산정 방식에 따라 퇴직금 1억+ 차이 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 퇴직금 산정</h2>
<p>퇴직금 = 평균임금 × 근속연수. 평균임금은 퇴직 직전 3개월 임금 합계 / 90일. 정기상여는 1년 누적 / 12로 환산해 평균임금 포함.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 정기상여 600% vs 일회성 보너스</h2>
<p>월급 500만, 10년 근속, 연 성과 동일 3,000만:</p>
<ul class="space-y-2 mt-4">
<li>· <strong>정기상여(연 3,000만 = 월 250만 가산)</strong>: 평균임금 750만 → 퇴직금 7,500만</li>
<li>· <strong>일회성 보너스</strong>: 평균임금 500만 → 퇴직금 5,000만</li>
<li>· <strong>차이 2,500만원</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/severance" class="text-primary underline">퇴직금 계산</a></li></ul></div>
`;

const stockOptionTimingBonus = `
<p class="lead">성과급 + 스톡옵션 행사 동시 받으면 한계세율 45% 가능. 일반 스톡옵션은 행사 시 근로소득세 + 매도 시 양도세 22% 중복. 적격 스톡옵션 시 양도세만. 1억 차익 시 1,860만원 차이.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 일반 vs 적격 스톡옵션</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">구분</th><th class="p-3">행사 시</th><th class="p-3">매도 시</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">일반</td><td class="p-3">근로소득세 (한계 35~45%)</td><td class="p-3">양도세 22%</td></tr>
<tr class="border-t"><td class="p-3">적격 (벤처·중소)</td><td class="p-3 text-emerald-600">과세 없음</td><td class="p-3">양도세 22%만</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 1억 차익</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>일반</strong>: 근로 3,800만 + 양도 220만 = 4,020만</li>
<li>· <strong>적격</strong>: 양도세 2,160만만</li>
<li>· <strong>차이 1,860만</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 적격 스톡옵션 요건</h2>
<ul class="space-y-2 mt-4">
<li>· 벤처·중소기업 부여</li>
<li>· 부여 후 2년 + 행사 후 1년 보유</li>
<li>· 부여 한도 등 조건 충족</li>
</ul>

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
  { slug: "bonus-vs-incentive-vs-allowance-2026", title: "성과급 vs 인센티브 vs 격려금 — 통상임금 포함 평생 1억 차이", description: "정기상여·경영성과급·격려금·RSU 4종 법적 성격 + 세금 + 통상임금 포함 여부. 통상임금 포함되면 연차수당·퇴직금 25% 증가, 평생 임금 1억+ 차이.", category: "연봉", tags: ["성과급", "인센티브", "통상임금", "퇴직금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusVsIncentive, lang: "ko" },
  { slug: "samsung-opi-tai-complete-2026", title: "삼성전자 OPI + TAI 완벽 가이드 — 메모리 호황기 영끌 1억 3,750만", description: "OPI(1월·사업부 영업이익 연동 최대 50%) + TAI(6월·12월·목표달성 최대 100%). 메모리 사업부 호황기 합산 250%, 기본급 5,500만 직원 영끌 1.37억.", category: "연봉", tags: ["삼성전자", "OPI", "TAI", "성과급", "메모리", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: samsungOpiTai, lang: "ko" },
  { slug: "sk-hynix-ps-history-2026-prospect", title: "SK하이닉스 PS 연도별 추이 — 2026 PS 2,000% 가능?", description: "2021 1,000% → 2023 적자 0% → 2024 1,500% → 2025 1,500%+ → 2026 2,000% 가능. 기본급 6,000만 직원 PS 1,500% 시 실수령 9,200만원.", category: "연봉", tags: ["SK하이닉스", "PS", "성과급", "HBM", "메모리", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: skHynixPs, lang: "ko" },
  { slug: "lg-hyundai-posco-bonus-2026", title: "LG·현대차·기아·포스코 성과급 구조 비교 — 사업부 차등 최대 50%", description: "LG전자 사업부별 ±50% 격차, 현대차·기아 통합 균등, 포스코 연 1회 균등. 직장인 6,000만 + 800% 성과급 시 실수령 7,300만원.", category: "연봉", tags: ["LG전자", "현대차", "포스코", "성과급", "사업부", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: lgPoscoBonus, lang: "ko" },
  { slug: "it-rsu-vs-cash-bonus-2026", title: "네이버·카카오·쿠팡 RSU vs 현금 보너스 — 5,000만 RSU 175만 유리", description: "네이버 4년 베스팅 즉시 매도 비과세, 카카오 5년 25%, 쿠팡 미국 22% 양도세, 토스 비상장 IPO lockup. RSU 5,000만 vs 현금 175만 유리 (주가 변동 리스크 별개).", category: "주식", tags: ["네이버", "카카오", "쿠팡", "RSU", "현금보너스", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: itRsuVsCash, lang: "ko" },
  { slug: "foreign-bonus-structure-2026", title: "외국계 보너스 — 구글·아마존·메타·MS 한국지사 RSU 구조", description: "구글 Alphabet RSU + 사인온, 아마존 분할 사인온 + 4년 비균등 RSU, 메타·MS 분기 성과 + RSU. 외국 모회사 직접 지급 시 본인 종소세 신고 의무.", category: "주식", tags: ["외국계", "구글", "아마존", "메타", "RSU", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: foreignBonus, lang: "ko" },
  { slug: "sign-on-bonus-tax-2026", title: "사인온 보너스 5,000만 — 실수령 2,875만, 분할로 600만 절감", description: "입사 시 일회성 보너스. 한계세율 35%+ + 4대보험 + 지방세 = 약 43% 부담. 5,000만 일시 vs 2년 분할 시 600만 절감.", category: "연봉", tags: ["사인온", "Signing Bonus", "입사", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: signOnBonus, lang: "ko" },
  { slug: "retention-bonus-3year-split-2026", title: "리텐션 보너스 1억 3년 분할 vs 일시 — 1,300만원 절감", description: "M&A·구조조정 후 잔존 보너스. 3년 일시 1억 38% vs 매년 3,300만 24~35% = 절감 1,300만. 분할 지급 협상 권장.", category: "연봉", tags: ["리텐션", "잔존보너스", "M&A", "구조조정", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: retentionBonus, lang: "ko" },
  { slug: "executive-bonus-corporate-limit-2026", title: "비상장 임원 성과급 한도 — 초과 시 회사·임원 모두 손해", description: "정관·주총 한도 명시. 한도 5억 + 실 지급 8억 시 초과 3억 법인세 7,200만 추가 + 임원 근로소득세 그대로. 한도 내 운용 필수.", category: "연봉", tags: ["임원", "비상장", "성과급한도", "법인세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: executiveBonusLimit, lang: "ko" },
  // 영역 B — 성과급 소득세 10편
  { slug: "bonus-1eok-net-payment-2026", title: "성과급 1억 실수령 — 연봉 7천 시 세후 약 6,370만원", description: "연봉 7,000만 + 성과급 1억 = 영끌 1.7억. 세금·4대보험·4월 건보 정산 약 4,895만. 연간 실수령 약 1.21억, 성과급분 약 6,373만.", category: "세금", tags: ["성과급", "실수령액", "1억", "한계세율", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonus1euk, lang: "ko" },
  { slug: "bonus-5000-net-payment-2026", title: "성과급 5,000만 실수령 — 약 3,570만, IRP 더하면 3,690만", description: "연봉 6,000만 + 성과급 5,000만 = 영끌 1.1억. 세금+4대보험 약 1,429만. 실수령 약 3,571만 (71.4%). IRP 900만 만기 시 약 119만 환급 추가.", category: "세금", tags: ["성과급", "실수령액", "5000만", "IRP", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bonus5000, lang: "ko" },
  { slug: "income-tax-8-step-bracket-2026", title: "2026 종합소득세 8단계 누진세율 완벽 — 초과분만 높은 세율", description: "6~45% 8단계 누진세율 + 누진공제 + 지방세 10%. 초과분만 높은 세율 적용. 8,800만→8,801만 되어도 추가 1만에만 35% 적용.", category: "세금", tags: ["누진세율", "8단계", "종합소득세", "지방소득세", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bracket8Step, lang: "ko" },
  { slug: "bonus-split-payout-1000-saving-2026", title: "성과급 1억 분할 지급 — 1년 vs 2년 = 1,000만 절감", description: "일시 지급 한계세율 38% vs 2년 분할 35%. 절감 1,000만. 인사·임원과 분할 협상 가능 시 적극 시도. 잔류 의무 부가 가능.", category: "세금", tags: ["성과급", "분할지급", "한계세율", "협상", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: splitPayoutLower, lang: "ko" },
  // 영역 C — 성과급 4대보험·건강보험 10편
  { slug: "bonus-health-4-percent-2026", title: "성과급 건강보험 4.07% — 1억 시 본인 약 407만원", description: "건강보험 3.595% + 장기요양 0.472% = 본인 약 4.07%. 사실상 전액 부과. 성과급 1억 시 본인 약 407만 + 회사 약 407만 = 약 814만 부과. 다음해 4월 정산 추가.", category: "기초", tags: ["건강보험", "성과급", "장기요양", "정산", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bonusHealth3545, lang: "ko" },
  { slug: "four-insurance-ceiling-summary-2026", title: "4대보험 상한·하한 한 번에 — 성과급 1억 시 본인 부담 약 497만", description: "국민연금 4.75% 상한 659만 + 건강보험 3.595% + 장기요양 0.472% + 고용보험 0.9%. 성과급 1억 시 합산 본인 부담 약 497만원.", category: "기초", tags: ["4대보험", "상한", "성과급", "건강보험", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusInsuranceCeiling, lang: "ko" },
  { slug: "dependent-check-before-bonus-2026", title: "성과급 받기 전 가족 피부양자 점검 — 임대 2,000만 + 박탈", description: "본인 성과급으로 피부양자 자격 직접 영향 없음. 단 가족 임대·연금·이자 합산 2,000만+ 시 박탈 → 지역가입자 월 50~150만 부담.", category: "기초", tags: ["피부양자", "건강보험", "성과급", "지역가입자", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: dependentBeforeBonus, lang: "ko" },
  { slug: "total-income-adjustment-bonus-2026", title: "성과급 + 임대 + 금융 + 사업 종합 정산 — 영끌 2억 시 추가 5,750만", description: "성과급 5,000만 + 임대 3,000만 + 배당 2,000만 + 사업 3,000만 = 영끌 2억. 종소세 4,500만 + 지방세 + 정산 800만 = 약 5,750만 추가.", category: "기초", tags: ["종합과세", "성과급", "임대소득", "정산", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: incomeAdjustmentTotal, lang: "ko" },
  { slug: "optional-continue-after-bonus-2026", title: "성과급 큰 임원 퇴직 후 임의계속가입 — 3년 5,000만 절감", description: "성과급 5,000만 받은 임원 퇴직 후 지역가입자 월 200~300만 vs 임의계속가입 약 월 60만. 36개월 절감 약 5,000만.", category: "기초", tags: ["임의계속가입", "퇴직", "건강보험", "임원", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: optionalContinueAfterBonus, lang: "ko" },
  // 영역 D — 성과급 절세 심화 10편
  { slug: "gift-children-with-bonus-2026", title: "성과급 받는 해 자녀 5,000만 증여 — 평생 1.4억+ 비과세", description: "성인 자녀 10년 5,000만 비과세. 본인 성과급 절세 + 자녀 자산 형성 + 세대 간 이전 효과. 10년 반복 시 평생 1.4억+ 비과세.", category: "세금", tags: ["증여", "자녀", "비과세", "5000만", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: giftWithBonus, lang: "ko" },
  { slug: "couple-split-bonus-year-2026", title: "성과급 받는 해 부부 분산 — 의료비 600만 시 45만 절감", description: "본인 한계 35% + 배우자 15% 시 의료비·교육비는 총급여 낮은 쪽이 공제 효과 큼. 600만 의료비 부부 분산으로 45만 추가 환급.", category: "세금", tags: ["부부분산", "의료비", "한계세율", "연말정산", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: coupleSplitBonus, lang: "ko" },
  // 영역 E — 성과급 시점·실전 10편
  { slug: "december-vs-january-bonus-2026", title: "12월 인센티브 vs 1월 인센티브 — 정산 시점·IRP 한도", description: "같은 금액 세금 차이 거의 없음. 단 12월 지급은 당해 정산, IRP 한도 즉시 도달. 1월 지급은 다음해 정산. 정산·납입 일정 차이.", category: "세금", tags: ["12월", "1월", "인센티브", "정산", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: december1January, lang: "ko" },
  { slug: "moving-company-bonus-2026", title: "이직 중 성과급 — 전·신 회사 합산 1,000만+ 추가 세금", description: "전 회사 + 신 회사 성과급 모두 근로소득 합산. 5월 종소세 신고 시 합산 신고 의무. 한계세율 점프 시 추가 1,000만+ 세금.", category: "커리어", tags: ["이직", "성과급", "전회사", "종합소득세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: moveCompanyBonus, lang: "ko" },
  { slug: "bonus-retire-impact-severance-2026", title: "성과급 받고 퇴직 — 정기상여 vs 일회성 보너스 퇴직금 2,500만 차이", description: "정기상여(통상임금 포함)는 평균임금 베이스 증가 → 퇴직금 증가. 월급 500만 10년 + 연 3,000만 시 정기상여 7,500만 vs 일회성 5,000만.", category: "커리어", tags: ["퇴직금", "정기상여", "통상임금", "성과급", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusRetireImpact, lang: "ko" },
  { slug: "stock-option-with-bonus-2026", title: "성과급 + 스톡옵션 일반 vs 적격 — 1억 차익 1,860만 차이", description: "일반: 행사 근로소득 3,800만 + 매도 양도 220만 = 4,020만. 적격(벤처·중소): 양도세 2,160만만. 차이 1,860만.", category: "주식", tags: ["스톡옵션", "적격", "벤처", "양도세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: stockOptionTimingBonus, lang: "ko" },
  { slug: "bonus-property-sell-same-year-2026", title: "성과급 + 부동산 양도 동시 — 종합 세금 점검 필수", description: "근로소득(성과급) 종합과세 + 부동산 분류과세 별도. 건보료 정산에도 반영. 1주택 비과세 + 80% 공제 시 5억 양도차익 약 200만, 성과급 5,000만 + 합산 약 2,700만.", category: "부동산", tags: ["성과급", "부동산양도", "종합세금", "정산", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: bonusPropertySell, lang: "ko" },
];
