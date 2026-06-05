// src/lib/guides/hot-bonus-tax-complete.ts
//
// 13차 점검 — 성과급 + 세금 + 건강보험 전문 SEO 가이드 50편.
// 운영자 명시 요청: 성과급에 따른 모든 세법·건강보험·구간별 계산법 깊이.
// 5개 영역 각 10편 = 50편. 누적 181편.

import type { Guide } from "@/lib/guidesData";

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
<p class="lead">SK하이닉스 PS(Productivity Sharing)는 SK그룹 고유 성과급 체계. 연 영업이익 일정 비율을 임직원에게 분배. 2024 메모리 슈퍼사이클로 PS 1,500%(= 15개월치) 기록 → 2026년 PS 2,000% 가능성. 기본급 1억 직원 2억 추가 지급도 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 SK하이닉스 연도별 PS 추이</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">연도</th><th class="p-3">PS %</th><th class="p-3">영업이익</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">2021</td><td class="p-3">1,000%</td><td class="p-3">약 12조</td></tr>
<tr class="border-t"><td class="p-3">2022</td><td class="p-3">600%</td><td class="p-3">약 7조</td></tr>
<tr class="border-t"><td class="p-3">2023</td><td class="p-3">0% (적자)</td><td class="p-3">-7.7조</td></tr>
<tr class="border-t"><td class="p-3">2024</td><td class="p-3">1,500%</td><td class="p-3">약 23조</td></tr>
<tr class="border-t"><td class="p-3">2025</td><td class="p-3">1,500%+ 예상</td><td class="p-3">약 25조</td></tr>
<tr class="border-t"><td class="p-3"><strong>2026 (전망)</strong></td><td class="p-3"><strong>2,000% 가능</strong></td><td class="p-3"><strong>약 40조+</strong></td></tr>
</tbody></table></div>

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
<li>· 한계세율 35%: 약 1,750만원 세금</li>
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
<p class="lead">성과급 1억 받으면 실수령 얼마? 연봉 7,000만원 + 성과급 1억 = 영끌 1.7억 가정 시 종합소득세 + 지방세 + 4대보험 합산 약 5,300만원 → <strong>실수령 약 4,700만원</strong> (47%). 4대보험 상한 적용으로 부담 약간 완화.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 1억 상세 세금 분석</h2>
<p>연봉 7,000만원 + 성과급 1억 (영끌 1.7억) 직장인 가정:</p>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">항목</th><th class="p-3">금액</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">총 소득</td><td class="p-3">170,000,000원</td></tr>
<tr class="border-t"><td class="p-3">근로소득공제 + 인적공제</td><td class="p-3">-30,000,000원</td></tr>
<tr class="border-t"><td class="p-3">과세표준</td><td class="p-3">140,000,000원</td></tr>
<tr class="border-t"><td class="p-3">산출세액 (35%·1,544만 누진공제)</td><td class="p-3">33,560,000원</td></tr>
<tr class="border-t"><td class="p-3">지방소득세 10%</td><td class="p-3">3,356,000원</td></tr>
<tr class="border-t"><td class="p-3">4대보험 (상한 적용)</td><td class="p-3">약 8,500,000원</td></tr>
<tr class="border-t"><td class="p-3">건강보험 추가 정산 (7월)</td><td class="p-3">약 7,500,000원</td></tr>
<tr class="border-t"><td class="p-3"><strong>총 세금·보험</strong></td><td class="p-3"><strong>약 52,916,000원</strong></td></tr>
<tr class="border-t"><td class="p-3"><strong>실수령</strong></td><td class="p-3"><strong>약 117,084,000원</strong></td></tr>
</tbody></table></div>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산기</a></li></ul></div>
`;

const bonus5000 = `
<p class="lead">성과급 5,000만원 받으면 실수령 약 3,100~3,400만원 (60~68%). 연봉 + 성과급 합산 한계세율 35% 구간 진입 여부에 따라 차이. IRP·연금저축 만기 납입으로 약 119~149만원 환급 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 성과급 5,000만원 시뮬</h2>
<p>연봉 6,000만원 + 성과급 5,000만원 (영끌 1억 1천):</p>
<ul class="space-y-2 mt-4">
<li>· 과세표준 약 8,500만원 → 한계세율 24%</li>
<li>· 성과급 5,000 부분 세금: 약 1,200만원 (24%)</li>
<li>· 지방세 120만원</li>
<li>· 4대보험 부담 약 500만원</li>
<li>· <strong>총 부담 약 1,820만원 → 실수령 약 3,180만원</strong> (63.6%)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 IRP·연금저축 활용</h2>
<p>성과급 받기 전 11~12월에 IRP·연금저축 900만원 만기 납입 → 약 119~149만원 세액공제 환급 → 실수령 약 3,300~3,330만원으로 증가.</p>

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
<li>· 한도: IRP + 연금저축 합산 900만원</li>
<li>· 만 50세+ 한도 1,200만원 (한시 적용)</li>
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
<p class="lead">성과급에 국민연금 4.75% 부과? — 부분적 YES. 보수월액 상한 637만원(2026)까지만 부과. 월 보수 800만원 직원이 성과급 1억 받아도 추가 국민연금 부과 거의 없음(이미 상한 적용).</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 2026 국민연금 상한</h2>
<ul class="space-y-2 mt-4">
<li>· 기준소득월액 상한: <strong>637만원</strong></li>
<li>· 본인 부담 4.75% × 637만 = 약 30.26만원/월</li>
<li>· 회사 부담 4.75% 동일</li>
<li>· 보수가 637만 초과해도 30.26만원 고정</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 영향 — 거의 없음</h2>
<p>월급 700만 직원이 성과급 5,000만 받는 경우:</p>
<ul class="space-y-2 mt-4">
<li>· 월급만으로도 이미 상한 637만 초과 → 30.26만원 매월 부과</li>
<li>· 성과급 추가돼도 국민연금은 변동 없음</li>
<li>· <strong>국민연금 추가 부담 0원</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 단 — 월급이 낮은 직원은 영향</h2>
<p>월급 400만 직원이 한 달 성과급 200만 받으면 그 달 보수월액이 올라 국민연금 산정액이 소폭 증가 → 약 9,500원 추가 부담(요율 4.75% 반영).</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/national-pension-estimate-2026" class="text-primary underline">국민연금 예상수령액</a></li></ul></div>
`;

const bonusHealth3545 = `
<p class="lead">성과급에 건강보험료 3.595% + 장기요양 0.472% = 본인 약 4.07% 부과. 국민연금과 달리 건강보험은 상한 없음. 성과급 1억 받으면 그 달 본인 건보료 약 360만원 추가 부과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 건강보험료 상한 없음</h2>
<ul class="space-y-2 mt-4">
<li>· 건강보험 본인 3.595%</li>
<li>· 장기요양 건강보험의 13.14% = 약 0.472%</li>
<li>· 합산 본인 약 4.07%</li>
<li>· <strong>보수월액 상한 없음 → 성과급 그대로 부과</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 1억 시 건보료 부담</h2>
<ul class="space-y-2 mt-4">
<li>· 본인 부담: 1억 × 4.07% = <strong>약 407만원</strong></li>
<li>· 회사 부담: 동일 약 407만원</li>
<li>· 합계 814만원이 건강보험공단에 납부</li>
<li>· 4월 정기 부과 + 7월 정산으로 사후 부과</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 7월 건보료 정산 폭탄 주의</h2>
<p>매월 정기 부과 외 7월에 작년 소득 기준 정산. 성과급 큰 해는 7월에 매달 100~200만원 추가 부과 가능. 미리 대비.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산기</a></li><li>· <a href="/health-insurance-2026" class="text-primary underline">7월 건보료 정산 가이드</a></li></ul></div>
`;

const bonusEmployment09 = `
<p class="lead">성과급에 고용보험 0.9% 부과 (본인). 건강보험처럼 상한 없음. 성과급 1억 받으면 고용보험 90만원 추가. 회사는 0.9% + α(고용안정·직업능력)도 함께 부담.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 고용보험 본인 0.9%</h2>
<ul class="space-y-2 mt-4">
<li>· 본인: 0.9% (성과급에도 부과)</li>
<li>· 회사: 0.9% + α (사업장 규모별)</li>
<li>· 상한 없음 — 성과급 그대로 부과</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>성과급 5,000만 시 본인 고용보험 45만, 1억 시 90만, 3억 시 270만원.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 활용 — 실업급여 산정 베이스</h2>
<p>고용보험 부담 큰 만큼 실업급여 산정 시 평균임금 베이스도 큼. 성과급 큰 직원이 퇴직 시 실업급여 일 7.4만(상한)까지 받기 쉬움.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li></ul></div>
`;

const bonusInsuranceCeiling = `
<p class="lead">4대보험 상한·하한 정리. 국민연금 보수월액 상한 637만, 건강보험 상한 없음, 고용보험 상한 없음, 산재 회사만 부담. 성과급 큰 직원에게 가장 큰 부담은 건강보험(약 4.07%), 그 다음 고용보험(0.9%).</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 4대보험 본인 부담 정리</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">보험</th><th class="p-3">본인 부담률</th><th class="p-3">상한·하한</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">국민연금</td><td class="p-3">4.75%</td><td class="p-3"><strong>상한 637만원</strong></td></tr>
<tr class="border-t"><td class="p-3">건강보험</td><td class="p-3">3.595%</td><td class="p-3">상한 없음</td></tr>
<tr class="border-t"><td class="p-3">장기요양</td><td class="p-3">0.472%</td><td class="p-3">상한 없음</td></tr>
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

const bonusHealthAdjust = `
<p class="lead">성과급 1억 받았는데 건보료 정산 200만원 추가? — 7월 건강보험 정산 결과. 매월 정기 부과는 통상 월급 기준만 적용, 성과급 부분은 다음해 4월·7월에 정산 부과. 큰 폭의 정산금 발생.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 7월 건보료 정산 구조</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 4월</strong>: 작년 소득 기준 보수월액 재산정</li>
<li><strong>② 5~6월</strong>: 추가 부과 산정</li>
<li><strong>③ 7월</strong>: 정산금 7월 급여에서 차감 (5회 분할 신청 가능)</li>
<li><strong>④ 8월~</strong>: 새 보수월액으로 정기 부과</li>
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
<li>· 성과급 받는 해는 7월 정산 약 200~500만원 부담 예상</li>
<li>· 5회 분할 신청으로 7~11월 분산</li>
<li>· 별도 적립금 마련 권장</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-2026" class="text-primary underline">7월 건보료 정산 가이드</a></li><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산기</a></li></ul></div>
`;

const julyAdjust = `
<p class="lead">7월 건강보험료 정산은 모든 직장인이 받는 부담. 성과급 큰 직원은 매년 200~1,000만원 추가 부과 가능. 정산 통보 후 일시 부담 어려우면 5회 분할 신청(7~11월)으로 충격 완화.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 7월 정산 흐름</h2>
<ol class="space-y-2 mt-4">
<li><strong>1. 4월</strong>: 건강보험공단에서 작년 소득 기준 정산금 통보 (SMS·우편)</li>
<li><strong>2. 5~6월</strong>: 분할 신청 가능 (5회·10회)</li>
<li><strong>3. 7월</strong>: 7월 급여에서 정산금 1회분 차감</li>
<li><strong>4. 8~11월</strong>: 나머지 분할 차감 (분할 신청 시)</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급별 정산금 추정</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">작년 성과급</th><th class="p-3">예상 정산금</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">2,000만</td><td class="p-3">약 80만</td></tr>
<tr class="border-t"><td class="p-3">5,000만</td><td class="p-3">약 200만</td></tr>
<tr class="border-t"><td class="p-3">1억</td><td class="p-3">약 400만</td></tr>
<tr class="border-t"><td class="p-3">2억</td><td class="p-3">약 800만</td></tr>
</tbody></table></div>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-2026" class="text-primary underline">7월 건보료 정산 가이드</a></li></ul></div>
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
<p class="lead">성과급 + 임대소득 + 금융소득 + 사업소득 다 합쳐 종합과세 + 4대보험 정산. 한 해 누적 소득이 1억+ 되면 다음해 5월 종소세 + 7월 건보료 정산으로 추가 1,000만~3,000만원 부담 가능.</p>

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
<p class="lead">퇴직금 + 성과급 같은 해 받으면 4대보험 부담 점프. 퇴직금은 4대보험 면제(국민연금·건강보험·고용보험 미부과), 단 성과급은 정상 부과. 7월 건보료 정산도 영향. 퇴직 시점 결정에 신중.</p>

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
<p class="lead">성과급 큰 직원이 퇴직 시 임의계속가입 신청은 거의 무조건 유리. 작년 성과급 큰 보수월액 기준으로 7월 정산금이 부과되지만, 임의계속가입은 직장가입자 시절 보수월액 기준 보험료 유지.</p>

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

const irpMaxBonus = `
<p class="lead">성과급 받기 직전 IRP 900만원 + 연금저축 600만원 합산 만기 납입 → 한도 1,500만원? 단 한도는 IRP + 연금저축 합산 900만원. 만 50세+는 1,200만원으로 한시 상향. 성과급 받는 해는 한계세율 높아 절세 효과 최대.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 2026 IRP·연금저축 한도</h2>
<ul class="space-y-2 mt-4">
<li>· IRP + 연금저축 <strong>합산 900만원</strong></li>
<li>· 만 50세+ 한시 상향: <strong>1,200만원</strong></li>
<li>· 세액공제율: 총급여 5,500만 이하 16.5%, 초과 13.2%</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 성과급 받는 해 환급</h2>
<p>연봉 1억 + 성과급 5,000만 (영끌 1.5억), 한계세율 35%:</p>
<ul class="space-y-2 mt-4">
<li>· IRP 900만 납입 (12월 31일까지)</li>
<li>· 환급: 900 × 13.2% = 약 119만원</li>
<li>· 지방세 포함 약 131만원</li>
<li>· 50세+면 1,200만 납입 → 약 175만원</li>
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
<p class="lead">성과급 받는 해 월세 17% 세액공제는 한도 도달 권장. 총급여 1.5억 이하 무주택 세대주만. 월 50만(연 600만) 시 102만 환급 + 한계세율 효과로 사실상 더 큰 절세.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 월세 세액공제 자격</h2>
<ul class="space-y-2 mt-4">
<li>· 무주택 세대주 (본인 + 배우자)</li>
<li>· 총급여 1.5억 이하 (2024 상향)</li>
<li>· 국민주택규모(85㎡) 이하 또는 기준시가 4억 이하</li>
<li>· 본인 명의 임대차계약서</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 월세 60만 (연 720만)</h2>
<ul class="space-y-2 mt-4">
<li>· 한도 750만원 내 적용</li>
<li>· 17% 세액공제 = 122.4만원 환급</li>
<li>· 지방세 포함 약 134.6만원</li>
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

<h2 class="mt-12 text-2xl function-bold text-primary">⚠️ 제외</h2>
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
<p class="lead">12월 인센티브 vs 1월 인센티브 — 같은 금액이라도 세금 차이 거의 없음 (연간 합산이므로). 단 7월 건보료 정산 시점, IRP·연금저축 한도 도달, 신용카드 25% 기준선 달성에는 큰 영향. 12월 지급은 그 해 정산 직결, 1월 지급은 다음해.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 12월 vs 1월 영향</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 연말정산</strong>: 12월 지급은 당해, 1월 지급은 다음해 정산</li>
<li><strong>② IRP·연금저축 한도</strong>: 12월 31일까지 납입 분만 당해 공제 → 12월 지급 받고 즉시 납입 가능</li>
<li><strong>③ 7월 건보료 정산</strong>: 12월 지급은 그 해 정산, 1월 지급은 다음해 정산</li>
<li><strong>④ 신용카드 한도</strong>: 12월 지급으로 25% 기준선 추가 도달 어려움</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li></ul></div>
`;

const moveCompanyBonus = `
<p class="lead">이직 중 성과급 받는 경우 — 전 회사 기여분(전 회사 지급) + 신 회사 기여분(신 회사 지급) 모두 근로소득. 종합소득세 신고 시 둘 다 합산. 7월 건보료 정산도 양쪽 통합.</p>

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
<p class="lead">성과급 받은 해 부동산 매도 시 종합 세금 점검 필수. 성과급은 근로소득 종합과세 + 부동산 양도세 분류과세(별도)지만, 7월 건보료 정산에서 임대소득·양도소득 모두 반영. 합산 부담 추정.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 종합 세금 점검</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 근로소득 + 성과급</strong>: 종합과세 누진세율</li>
<li><strong>② 부동산 양도</strong>: 분류과세 (종합과세와 별도)</li>
<li><strong>③ 양도세 신고</strong>: 양도일 다음달 말일까지 예정신고 → 확정신고는 다음해 5월</li>
<li><strong>④ 7월 건보료 정산</strong>: 임대소득·금융소득·양도소득 모두 반영</li>
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
  { slug: "year-end-encouragement-vs-bonus-2026", title: "연말 격려금 vs 정기상여 — 통상임금 포함 여부 절세 효과", description: "격려금은 통상임금 미포함 → 퇴직금 영향 0. 정기상여는 통상임금 포함 → 퇴직금 증가. 12월 격려금 1,000만 + IRP 900만 만기 시 142만원 환급.", category: "연봉", tags: ["격려금", "정기상여", "통상임금", "퇴직금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: yearEndEncouragement, lang: "ko" },
  { slug: "sign-on-bonus-tax-2026", title: "사인온 보너스 5,000만 — 실수령 2,875만, 분할로 600만 절감", description: "입사 시 일회성 보너스. 한계세율 35%+ + 4대보험 + 지방세 = 약 43% 부담. 5,000만 일시 vs 2년 분할 시 600만 절감.", category: "연봉", tags: ["사인온", "Signing Bonus", "입사", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: signOnBonus, lang: "ko" },
  { slug: "retention-bonus-3year-split-2026", title: "리텐션 보너스 1억 3년 분할 vs 일시 — 1,300만원 절감", description: "M&A·구조조정 후 잔존 보너스. 3년 일시 1억 38% vs 매년 3,300만 24~35% = 절감 1,300만. 분할 지급 협상 권장.", category: "연봉", tags: ["리텐션", "잔존보너스", "M&A", "구조조정", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: retentionBonus, lang: "ko" },
  { slug: "executive-bonus-corporate-limit-2026", title: "비상장 임원 성과급 한도 — 초과 시 회사·임원 모두 손해", description: "정관·주총 한도 명시. 한도 5억 + 실 지급 8억 시 초과 3억 법인세 7,200만 추가 + 임원 근로소득세 그대로. 한도 내 운용 필수.", category: "연봉", tags: ["임원", "비상장", "성과급한도", "법인세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: executiveBonusLimit, lang: "ko" },
  // 영역 B — 성과급 소득세 10편
  { slug: "bonus-bracket-jump-2026", title: "성과급 한계세율 점프 — 1.2억+1억 시 추가 3,800만원 세금", description: "8단계 누진세율 6~45%. 성과급 받으면 한 단계 점프 흔함. 연봉 1.2억+성과급 1억 시 35%→38% 점프 → 추가 3,800만원 세금.", category: "세금", tags: ["성과급", "한계세율", "누진세율", "8단계", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusBracketJump, lang: "ko" },
  { slug: "bonus-1eok-net-payment-2026", title: "성과급 1억 실수령 — 영끌 1.7억 시 약 1억 1,708만원", description: "연봉 7,000만 + 성과급 1억 = 영끌 1.7억. 종합소득세 + 지방세 + 4대보험 + 7월 정산 = 약 5,300만. 실수령 약 1.17억(약 69%).", category: "세금", tags: ["성과급", "실수령액", "1억", "한계세율", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonus1euk, lang: "ko" },
  { slug: "bonus-5000-net-payment-2026", title: "성과급 5,000만 실수령 — 약 3,180만, IRP 활용 시 3,330만", description: "연봉 6,000만 + 성과급 5,000만 = 영끌 1.1억. 세금 + 4대보험 약 1,820만. 실수령 약 3,180만 (63.6%). IRP 900만 만기 시 약 150만 환급 추가.", category: "세금", tags: ["성과급", "실수령액", "5000만", "IRP", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bonus5000, lang: "ko" },
  { slug: "income-tax-8-step-bracket-2026", title: "2026 종합소득세 8단계 누진세율 완벽 — 초과분만 높은 세율", description: "6~45% 8단계 누진세율 + 누진공제 + 지방세 10%. 초과분만 높은 세율 적용. 8,800만→8,801만 되어도 추가 1만에만 35% 적용.", category: "세금", tags: ["누진세율", "8단계", "종합소득세", "지방소득세", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bracket8Step, lang: "ko" },
  { slug: "salary-bonus-calc-8step-2026", title: "성과급 + 연봉 합산 세금 계산 8단계 — 직접 계산 vs 계산기", description: "총소득 → 근로소득공제 → 인적공제 → 과세표준 → 산출세액 → 세액공제 → 결정세액 → 납부세액. 8단계 계산 → 머니샐러리 계산기 활용.", category: "세금", tags: ["성과급계산법", "8단계", "연말정산", "산출세액", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: salaryBonusCalc, lang: "ko" },
  { slug: "bonus-split-payout-1000-saving-2026", title: "성과급 1억 분할 지급 — 1년 vs 2년 = 1,000만 절감", description: "일시 지급 한계세율 38% vs 2년 분할 35%. 절감 1,000만. 인사·임원과 분할 협상 가능 시 적극 시도. 잔류 의무 부가 가능.", category: "세금", tags: ["성과급", "분할지급", "한계세율", "협상", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: splitPayoutLower, lang: "ko" },
  { slug: "irp-before-bonus-payout-2026", title: "성과급 받기 전 IRP 900만 만기 — 환급 119~149만원", description: "성과급 받기 1~2개월 전 IRP·연금저축 900만 만기 납입 → 한계세율 35%+ 구간 환급 119~149만원. 12월 31일까지 납입 필수.", category: "세금", tags: ["IRP", "연금저축", "성과급", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: irpBeforeBonus, lang: "ko" },
  { slug: "card-25-before-bonus-2026", title: "성과급 받기 전 신용카드 25% 기준선 — 체크·전통시장 전환", description: "성과급으로 25% 기준선이 올라가기 전 체크카드·전통시장·대중교통 사용 한도 채우기. 100만 추가 사용 시 약 12만 환급(체크 30% × 한계세율 35%).", category: "세금", tags: ["신용카드", "체크카드", "25%", "전통시장", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: card25BeforeBonus, lang: "ko" },
  { slug: "medical-edu-donation-bonus-year-2026", title: "성과급 받는 해 의료비·교육비·기부금 — 환급 효과 12%p 큼", description: "한계세율 35%+ 구간에서 공제 효과 12%p 큼. 임플란트·치아교정·자녀 대학원 등 큰 비용 한 해에 몰아 결제 → 약 200~250만 추가 환급.", category: "세금", tags: ["의료비", "교육비", "기부금", "성과급", "한계세율", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: medicalEduBonus, lang: "ko" },
  { slug: "dependent-deduction-bonus-year-2026", title: "성과급 받는 해 인적공제 — 1인 150만 × 35% = 52만 환급", description: "한계세율 35% 시 인적공제 효과 큼. 부모 2명 + 자녀 2명 + 경로우대 + 의료비 통합 시 약 174만 추가 환급.", category: "세금", tags: ["인적공제", "부양가족", "성과급", "한계세율", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: dependentBonus, lang: "ko" },
  // 영역 C — 성과급 4대보험·건강보험 10편
  { slug: "bonus-pension-45-ceiling-590-2026", title: "성과급 국민연금 4.75% — 보수월액 상한 637만원 적용", description: "국민연금은 637만 상한. 월급 700만+ 직원은 성과급 받아도 국민연금 추가 부담 0원. 월급 400만 직원이 성과급 200만 받으면 9,500원 추가.", category: "기초", tags: ["국민연금", "성과급", "상한", "590만", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bonusPension45, lang: "ko" },
  { slug: "bonus-health-4-percent-2026", title: "성과급 건강보험 4.07% — 상한 없음, 1억 시 본인 약 407만원", description: "건강보험 3.595% + 장기요양 0.472% = 본인 약 4.07%. 상한 없음. 성과급 1억 시 본인 약 407만 + 회사 약 407만 = 약 814만 부과. 7월 정산 추가.", category: "기초", tags: ["건강보험", "성과급", "장기요양", "정산", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bonusHealth3545, lang: "ko" },
  { slug: "bonus-employment-09-2026", title: "성과급 고용보험 0.9% — 1억 시 90만, 3억 시 270만", description: "고용보험 본인 0.9% + 회사 0.9% + α. 상한 없음. 1억 성과급 시 본인 90만, 3억 시 270만. 실업급여 산정 시 평균임금 베이스 증가 효과.", category: "기초", tags: ["고용보험", "성과급", "실업급여", "0.9%", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bonusEmployment09, lang: "ko" },
  { slug: "four-insurance-ceiling-summary-2026", title: "4대보험 상한·하한 한 번에 — 성과급 1억 시 본인 부담 약 497만", description: "국민연금 4.75% 상한 637만 + 건강보험 3.595% + 장기요양 0.472% + 고용보험 0.9%. 성과급 1억 시 합산 본인 부담 약 497만원.", category: "기초", tags: ["4대보험", "상한", "성과급", "건강보험", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusInsuranceCeiling, lang: "ko" },
  { slug: "july-health-adjust-bonus-1eok-2026", title: "성과급 1억 + 7월 건보료 정산 — 추가 400만 부과", description: "성과급 부분은 매월 부과 안 되고 다음해 4월·7월에 정산. 1억 성과급 시 약 400만 추가, 5회 분할 시 7~11월 80만씩 분산.", category: "기초", tags: ["7월정산", "건강보험", "성과급", "분할납부", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusHealthAdjust, lang: "ko" },
  { slug: "july-health-adjust-bonus-detail-2026", title: "7월 건보료 정산 흐름 — 성과급별 정산금 80~800만원", description: "4월 통보 → 5~6월 분할 신청 → 7월 1회 차감 → 8~11월 분할. 성과급 2,000만 약 80만, 5,000만 200만, 1억 400만, 2억 800만 정산금.", category: "기초", tags: ["7월정산", "건강보험", "분할", "정산금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: julyAdjust, lang: "ko" },
  { slug: "dependent-check-before-bonus-2026", title: "성과급 받기 전 가족 피부양자 점검 — 임대 2,000만 + 박탈", description: "본인 성과급으로 피부양자 자격 직접 영향 없음. 단 가족 임대·연금·이자 합산 2,000만+ 시 박탈 → 지역가입자 월 50~150만 부담.", category: "기초", tags: ["피부양자", "건강보험", "성과급", "지역가입자", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: dependentBeforeBonus, lang: "ko" },
  { slug: "total-income-adjustment-bonus-2026", title: "성과급 + 임대 + 금융 + 사업 종합 정산 — 영끌 2억 시 추가 5,750만", description: "성과급 5,000만 + 임대 3,000만 + 배당 2,000만 + 사업 3,000만 = 영끌 2억. 종소세 4,500만 + 지방세 + 정산 800만 = 약 5,750만 추가.", category: "기초", tags: ["종합과세", "성과급", "임대소득", "정산", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: incomeAdjustmentTotal, lang: "ko" },
  { slug: "retire-with-bonus-4insurance-2026", title: "퇴직금 + 성과급 같은 해 — IRP 이전 시 절세 1,500만", description: "퇴직금 4대보험 면제 + 환산급여 우대. 성과급은 정상 부과. 5억 퇴직금 IRP 이전 시 즉시 세금 0원 → 연금 분할로 1,500만 절감.", category: "기초", tags: ["퇴직금", "성과급", "IRP", "4대보험", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: retireBonusFourInsurance, lang: "ko" },
  { slug: "optional-continue-after-bonus-2026", title: "성과급 큰 임원 퇴직 후 임의계속가입 — 3년 5,000만 절감", description: "성과급 5,000만 받은 임원 퇴직 후 지역가입자 월 200~300만 vs 임의계속가입 약 월 60만. 36개월 절감 약 5,000만.", category: "기초", tags: ["임의계속가입", "퇴직", "건강보험", "임원", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: optionalContinueAfterBonus, lang: "ko" },
  // 영역 D — 성과급 절세 심화 10편
  { slug: "irp-max-bonus-year-2026", title: "성과급 + IRP 900만 환급 119만, 만 50세+ 1,200만 175만", description: "IRP + 연금저축 합산 900만 (만 50세+ 1,200만). 세액공제율 5,500만 이하 16.5%, 초과 13.2%. 성과급 받는 해 한계세율 높아 환급 효과 최대.", category: "세금", tags: ["IRP", "연금저축", "성과급", "세액공제", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: irpMaxBonus, lang: "ko" },
  { slug: "isa-for-bonus-2026", title: "성과급 일부 ISA 적립 — 5년 운용 시 63만 절감", description: "성과급 2,000만 ISA 적립 → 5년 7% 운용 약 2,800만. 차익 800만 중 200만 비과세 + 600만 9.9% = 60만 세금. 일반 계좌 대비 63만 절감.", category: "투자", tags: ["ISA", "성과급", "비과세", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: isaForBonus, lang: "ko" },
  { slug: "gift-children-with-bonus-2026", title: "성과급 받는 해 자녀 5,000만 증여 — 평생 1.4억+ 비과세", description: "성인 자녀 10년 5,000만 비과세. 본인 성과급 절세 + 자녀 자산 형성 + 세대 간 이전 효과. 10년 반복 시 평생 1.4억+ 비과세.", category: "세금", tags: ["증여", "자녀", "비과세", "5000만", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: giftWithBonus, lang: "ko" },
  { slug: "couple-split-bonus-year-2026", title: "성과급 받는 해 부부 분산 — 의료비 600만 시 45만 절감", description: "본인 한계 35% + 배우자 15% 시 의료비·교육비는 총급여 낮은 쪽이 공제 효과 큼. 600만 의료비 부부 분산으로 45만 추가 환급.", category: "세금", tags: ["부부분산", "의료비", "한계세율", "연말정산", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: coupleSplitBonus, lang: "ko" },
  { slug: "parent-support-bonus-year-2026", title: "성과급 받는 해 부모 부양 — 2명 등록 시 174만 환급", description: "한계세율 35%, 부모 2명 + 만 75세 경로우대 + 의료비 200만 시 인적공제·경로우대·의료비 합산 약 174만 환급.", category: "세금", tags: ["부모부양", "인적공제", "경로우대", "성과급", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: parentSupportBonus, lang: "ko" },
  { slug: "medical-edu-donation-concentration-2026", title: "성과급 받는 해 의료비·교육비 집중 — 60~80만 추가 환급", description: "한계세율 35% 시 임플란트·자녀 대학원·기부금 등 큰 비용 한 해에 몰기. 합산 200~250만 환급(한계 24% 대비 +60~80만).", category: "세금", tags: ["의료비집중", "교육비", "기부금", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: medicalEduConcentration, lang: "ko" },
  { slug: "card-30-40-percent-bonus-2026", title: "성과급 받는 해 체크·전통시장 전환 — 70만 추가 환급", description: "성과급으로 25% 기준선↑. 25% 초과분을 체크 30% + 전통시장 40% + 대중교통 40%로 전환. 1,000만 전환 시 약 70만 추가 환급.", category: "세금", tags: ["체크카드", "전통시장", "대중교통", "공제", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: cardCategoryBonus, lang: "ko" },
  { slug: "monthly-rent-17-bonus-2026", title: "성과급 받는 해 월세 17% — 월 60만 시 134만 환급", description: "무주택 세대주 + 총급여 1.5억 이하. 월세 60만(연 720만) × 17% = 122만 + 지방세 = 약 134만 환급. 5년 미신청자 경정청구 가능.", category: "세금", tags: ["월세", "세액공제", "무주택", "성과급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: monthlyRent17Bonus, lang: "ko" },
  { slug: "housing-25-bonus-2026", title: "성과급 받는 해 청약통장 25만 — 5년 200~230만 환급", description: "매월 25만 납입 시 연 300만 한도 40% = 120만 공제. 한계세율 35% 시 약 42만 환급/년. 5년 누적 200~230만 + 청약 가점 만점.", category: "세금", tags: ["청약통장", "소득공제", "25만", "성과급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: housingSub25Bonus, lang: "ko" },
  { slug: "insurance-100-bonus-2026", title: "성과급 받는 해 보장성 보험 100만 — 12만 환급 챙기기", description: "종신·암·정기·실손·자동차·운전자 합산 100만 한도 12% 공제 = 최대 12만 환급. 본인·부양가족 명의 모두 가능. 저축성·연금보험 제외.", category: "세금", tags: ["보장성보험", "공제", "12%", "성과급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: insurance100Bonus, lang: "ko" },
  // 영역 E — 성과급 시점·실전 10편
  { slug: "opi-vs-tai-timing-tax-2026", title: "1월 OPI vs 6월 TAI — 분할 지급 150만 절감", description: "삼성 OPI 1월 일시 vs TAI 6·12월 분할. 분할 효과로 한계세율 분산. 영끌 1.08억 시 약 150만 절감. 인사 협상 시도.", category: "세금", tags: ["OPI", "TAI", "분할지급", "한계세율", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: opiTaiTimingCompare, lang: "ko" },
  { slug: "december-vs-january-bonus-2026", title: "12월 인센티브 vs 1월 인센티브 — 정산 시점·IRP 한도", description: "같은 금액 세금 차이 거의 없음. 단 12월 지급은 당해 정산, IRP 한도 즉시 도달. 1월 지급은 다음해 정산. 정산·납입 일정 차이.", category: "세금", tags: ["12월", "1월", "인센티브", "정산", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: december1January, lang: "ko" },
  { slug: "moving-company-bonus-2026", title: "이직 중 성과급 — 전·신 회사 합산 1,000만+ 추가 세금", description: "전 회사 + 신 회사 성과급 모두 근로소득 합산. 5월 종소세 신고 시 합산 신고 의무. 한계세율 점프 시 추가 1,000만+ 세금.", category: "커리어", tags: ["이직", "성과급", "전회사", "종합소득세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: moveCompanyBonus, lang: "ko" },
  { slug: "bonus-retire-impact-severance-2026", title: "성과급 받고 퇴직 — 정기상여 vs 일회성 보너스 퇴직금 2,500만 차이", description: "정기상여(통상임금 포함)는 평균임금 베이스 증가 → 퇴직금 증가. 월급 500만 10년 + 연 3,000만 시 정기상여 7,500만 vs 일회성 5,000만.", category: "커리어", tags: ["퇴직금", "정기상여", "통상임금", "성과급", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusRetireImpact, lang: "ko" },
  { slug: "before-vs-after-leave-bonus-2026", title: "성과급 받기 전 휴직 vs 받고 휴직 — 권리 보장 + 휴직 전 지급", description: "성과급은 재직 중 발생 성과 보상 → 휴직 전 발생분은 받을 권리. 인사팀과 지급 시점 확정 + 휴직 중 4대보험 변경 확인.", category: "커리어", tags: ["휴직", "성과급", "지급권리", "육아휴직", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: beforeLeave, lang: "ko" },
  { slug: "irp-eligibility-before-bonus-2026", title: "성과급 받기 전 IRP·연금저축 가입 — 누구나 가능", description: "IRP: 근로소득자·자영업자·공무원. 연금저축: 만 19세+ 누구나. 12월 31일까지 납입 시 당해 공제. 만 55세까지 유지 의무.", category: "세금", tags: ["IRP", "연금저축", "가입자격", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: irpEligibility, lang: "ko" },
  { slug: "executive-severance-limit-bonus-deep-2026", title: "임원 퇴직금 한도 초과 + 성과급 — 5억 시 1.08억 세금", description: "한도 3억 + 초과 2억 시 초과분 근로소득세 7,800만 (한계 38%). 한도 내 5억이면 5,000만. 정관 한도 미리 점검.", category: "커리어", tags: ["임원", "퇴직금한도", "근로소득세", "성과급", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: executiveSeveranceLimitDeep, lang: "ko" },
  { slug: "stock-option-with-bonus-2026", title: "성과급 + 스톡옵션 일반 vs 적격 — 1억 차익 1,860만 차이", description: "일반: 행사 근로소득 3,800만 + 매도 양도 220만 = 4,020만. 적격(벤처·중소): 양도세 2,160만만. 차이 1,860만.", category: "주식", tags: ["스톡옵션", "적격", "벤처", "양도세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: stockOptionTimingBonus, lang: "ko" },
  { slug: "bonus-rsu-same-year-2026", title: "성과급 + RSU 베스팅 같은 해 — 영끌 2.7억 시 총 7,900만 부담", description: "연봉 1.2억 + 성과급 5,000만 + RSU 1억 베스팅 = 영끌 2.7억. 근로 5,200만 + 양도 1,700만 + 정산 1,000만 = 7,900만. 분할 매도로 600만 절감.", category: "주식", tags: ["RSU", "성과급", "베스팅", "양도세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: rsuVestingSameBonus, lang: "ko" },
  { slug: "bonus-property-sell-same-year-2026", title: "성과급 + 부동산 양도 동시 — 종합 세금 점검 필수", description: "근로소득(성과급) 종합과세 + 부동산 분류과세 별도. 7월 건보료 정산 모두 반영. 1주택 비과세 + 80% 공제 시 5억 양도차익 약 200만, 성과급 5,000만 + 합산 약 2,700만.", category: "부동산", tags: ["성과급", "부동산양도", "종합세금", "정산", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: bonusPropertySell, lang: "ko" },
];
