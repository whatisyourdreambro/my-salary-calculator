// src/lib/guides/hot-news-2026-deep-dive.ts
//
// 12차 점검 — 추가 SEO 가이드 50편 (10차 31편 + 11차 50편에 이어).
// 세금 심화·건강 의료·자산 노후·법률 실용·2026 정책 5개 카테고리 × 10편.

import type { Guide } from "@/lib/guidesData";

// ═══════════════════════════════════════════════════════════════
// 카테고리 F — 세금 절세 심화 (10편)
// ═══════════════════════════════════════════════════════════════

const employeeStockOwnership = `
<p class="lead">우리사주조합은 회사가 직원에게 자사주를 우대 가격에 부여하는 제도. 시가의 70% 가격으로 매수 + 1년 의무 보유 + 매도 시 일반 양도세 적용. 직원에게 큰 절세·자산 형성 기회.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 우리사주 세금 구조</h2>
<ul class="space-y-2 mt-4">
<li>· 시가 대비 30% 할인 매수 가능 (예: 시가 10만원 → 7만원)</li>
<li>· 할인분(3만원/주)는 근로소득세 부과</li>
<li>· 1년 의무 보유 (보호예수)</li>
<li>· 매도 시 양도세: 일반 상장주식이면 비과세, 비상장이면 22%</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 1년 후 매도</h2>
<p>100주 매수 (시가 700만원에 매수), 1년 후 시가 1,200만원 매도:</p>
<ul class="space-y-2 mt-4">
<li>· 할인 차익 300만원: 근로소득세 (한계세율 24%) 약 79만원</li>
<li>· 매도 차익 500만원: 상장 주식 → 비과세</li>
<li>· <strong>실수령 1,200만원 - 79만원 = 1,121만원</strong></li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
`;

const overseasResidentTax = `
<p class="lead">해외 주재원·해외 근무자는 한국 거주자 여부에 따라 세금 부담 완전 다름. 1년 이상 해외 거주 + 가족 동반 시 비거주자로 분류 → 한국 소득세 부담 X, 해외 현지 세금만.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 거주자 vs 비거주자</h2>
<ul class="space-y-3 mt-4">
<li><strong>거주자(한국 세금 부과)</strong>: 가족 한국 거주, 한국 자산 보유, 사업장 한국 등</li>
<li><strong>비거주자(한국 비과세)</strong>: 1년 이상 해외 거주, 가족 동반, 해외 사업장</li>
<li>· 한미 조세조약 등 이중과세 방지</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 주재원 절세 전략</h2>
<ul class="space-y-2 mt-4">
<li>· 가족 동반 + 거주지 등록 변경 → 비거주자 인정</li>
<li>· 해외 주재 수당·해외 학교비 비과세 활용</li>
<li>· 한국 부동산 임대소득은 별도 종합과세</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/global" class="text-primary underline">국가별 연봉 비교</a></li></ul></div>
`;

const comprehensiveFinancialIncome = `
<p class="lead">이자·배당 등 금융소득이 연 2,000만원 초과 시 종합과세 전환. 그 외 소득과 합산해 누진세율(6~45%) 적용. 직장인이라도 큰 투자 수익 시 세금 폭탄 가능.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📊 종합과세 vs 분리과세</h2>
<p>연봉 8천만원 + 금융소득 3,000만원 가정:</p>
<ul class="space-y-2 mt-4">
<li>· 분리과세(2천만원 이하): 308만원 (15.4%)</li>
<li>· 종합과세(2천 초과 1천만원): 약 350만원 (35% + 다른 소득 합산)</li>
<li>· 추가 부담 약 42만원, 한계세율 점프 가능</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 분산 + ISA</h2>
<ul class="space-y-2 mt-4">
<li>· 부부 분산 — 각자 2천만원 한도 활용</li>
<li>· ISA 활용 — 비과세 200만원 + 분리과세 9.9%</li>
<li>· 연금계좌(IRP·연금저축) 활용 — 절세 + 이연</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li></ul></div>
`;

const otherIncomeTaxStrategy = `
<p class="lead">강연료·원고료·인세·심사료·자문료 등 기타소득은 8.8% 원천징수 후 분리과세. 연 300만원 초과 시 종합과세 선택 가능. 한계세율 낮은 직장인은 종합과세가 유리한 경우 많음.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 기타소득 종류</h2>
<ul class="space-y-2 mt-4">
<li>· 강연료·강사료</li>
<li>· 원고료·인세</li>
<li>· 심사료·자문료</li>
<li>· 상금·복권 당첨금</li>
<li>· 사례금</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 분리과세 vs 종합과세</h2>
<p>연봉 5,000만원 + 기타소득 500만원:</p>
<ul class="space-y-2 mt-4">
<li>· 분리과세 8.8%: 약 27만원 (필요경비 80% 후)</li>
<li>· 종합과세 24%: 약 24만원 (한계세율)</li>
<li>· <strong>종합과세가 약 3만원 유리</strong></li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li></ul></div>
`;

const personalVsCorporation = `
<p class="lead">자영업·1인 사업자가 일정 매출을 넘으면 법인 전환 고려. 개인 사업자 종합소득세 6~45% vs 법인세 9~24% + 배당소득세. 매출 5억 이상 + 순이익 1.5억 이상에서 법인 유리 시작.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📊 세율 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">구분</th><th class="p-3">개인사업자</th><th class="p-3">법인</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">소득세율</td><td class="p-3">6~45%</td><td class="p-3">법인세 9~24%</td></tr>
<tr class="border-t"><td class="p-3">배당</td><td class="p-3">해당 없음</td><td class="p-3">15.4% 분리</td></tr>
<tr class="border-t"><td class="p-3">대표 급여</td><td class="p-3">사업소득(필요경비)</td><td class="p-3">근로소득세</td></tr>
<tr class="border-t"><td class="p-3">손실 처리</td><td class="p-3">15년 이월</td><td class="p-3">15년 이월</td></tr>
</tbody></table></div>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 법인 전환 분기점</h2>
<p>순이익 1.5억 이상 시 법인이 유리. 법인은 운영비·관리비 부담이 있어 1억 이하는 개인이 효율적.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/freelance-tax" class="text-primary underline">프리랜서 세금 계산</a></li></ul></div>
`;

const vatRefund = `
<p class="lead">사업자 부가가치세 환급 — 매입세액이 매출세액보다 큰 분기는 차액 환급. 초기 투자 큰 사업자(스타트업·신규 설비투자 등)에게 자금 흐름 핵심.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 부가세 환급 요건</h2>
<ul class="space-y-2 mt-4">
<li>· 매입세액 > 매출세액 (보통 초기 사업·설비 투자)</li>
<li>· 세금계산서 100% 발급·수취</li>
<li>· 신용카드 매입은 매입세액 공제 가능</li>
<li>· 분기별 신고 (1·7월) 또는 월별 조기 환급</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>스타트업 1분기 매출 1억 (VAT 1천), 매입 1.5억 (VAT 1,500만):</p>
<ul class="space-y-2 mt-4">
<li>· 차액 500만원 환급</li>
<li>· 4월 25일 신고 → 6월 환급</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/vat" class="text-primary underline">부가가치세 계산기</a></li></ul></div>
`;

const consumptionTaxReturn = `
<p class="lead">간이과세자는 매출 1.04억 이하 사업자. 부가세 1.5~4% 적용으로 일반과세 10%보다 큰 절세. 다만 매입세액 공제 5~30%로 제한.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 간이 vs 일반 비교</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>간이과세</strong>: 매출 1.04억 이하, 부가세 1.5~4%</li>
<li>· <strong>일반과세</strong>: 매출 무관, 부가세 10%</li>
<li>· 간이는 매입세액 공제 제한 (5~30%)</li>
<li>· 간이 적용 안 되는 업종: 부동산임대·도매·세무사 등</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 매출 8천만 음식점</h2>
<ul class="space-y-2 mt-4">
<li>· 일반: 부가세 800만원 (매입공제 후 약 200만원 납부)</li>
<li>· 간이(4%): 320만원 + 매입공제 제한</li>
<li>· 간이가 약 100만원 유리 (업종·매입 비중에 따라 다름)</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/vat" class="text-primary underline">부가가치세 계산</a></li></ul></div>
`;

const carryoverLoss = `
<p class="lead">사업·양도소득 손실은 15년간 이월공제 가능. 손실난 해 신고 + 이후 이익 발생 시 차감. 일시 손실로 종합소득세 0원 + 미래 이익 절세 효과.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 이월결손금 적용</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 사업소득 결손</strong>: 다른 종합소득(근로·이자·배당)과 통산 후 잔여분 이월</li>
<li><strong>② 양도소득 결손</strong>: 같은 양도소득 내 통산 (주식·부동산은 분리)</li>
<li><strong>③ 가상자산 결손</strong>: 5년 이월 (15년 아닌 짧음 주의)</li>
<li><strong>④ 신고 의무</strong>: 손실난 해도 종소세 신고해야 이월 인정</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>2025년 사업 손실 1억 → 2026년 사업 이익 1.5억:</p>
<ul class="space-y-2 mt-4">
<li>· 2026년 과세표준: 1.5억 - 1억 (이월) = 5천만</li>
<li>· 절세 약 3,000만원 (한계세율 24%~35% 차이)</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산</a></li></ul></div>
`;

const taxReductionDisabled = `
<p class="lead">장애인은 인적공제 200만원 + 의료비 한도 없음 + 보험료 100만원 추가 한도 + 교육비 무제한 등 다양한 세제 혜택. 본인·부양가족 장애 등록 시 매년 100~300만원 추가 환급.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 장애인 세제 혜택</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>인적공제 200만원</strong>: 일반 150 + 추가 200 = 350만원</li>
<li>· <strong>의료비 100% 공제</strong>: 한도 700만원 적용 없음</li>
<li>· <strong>보험료 100만원</strong>: 보장성 + 장애인 보험 별도</li>
<li>· <strong>교육비 무제한</strong>: 일반 한도 적용 안 됨</li>
<li>· <strong>증여세 5천만원</strong>: 일반 5천 외 추가 5천</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 부양가족 등록 효과</h2>
<p>장애 부모 등록 시 추가 환급 약 100~150만원 (한계세율 24~35% 적용).</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const taxAmnestyReform = `
<p class="lead">세무조사·가산세 면제 제도. 자진 신고 시 가산세 50% 감면, 수정신고 시 10~50% 감면. 미신고·과소신고 발견 시 빨리 신고하는 게 손해 최소화.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 자진 신고·수정 신고 우대</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>1개월 이내 수정</strong>: 가산세 90% 감면</li>
<li>· <strong>3개월 이내</strong>: 75% 감면</li>
<li>· <strong>6개월 이내</strong>: 50% 감면</li>
<li>· <strong>1년 이내</strong>: 30% 감면</li>
<li>· <strong>2년 이내</strong>: 20% 감면</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 무신고 가산세</h2>
<ul class="space-y-2 mt-4">
<li>· 일반 무신고: 20%</li>
<li>· 부정 무신고(고의): 40%</li>
<li>· 국제거래·역외탈세: 60%</li>
<li>· + 납부불성실 연 9.125%</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 G — 건강·의료 (10편)
// ═══════════════════════════════════════════════════════════════

const outOfPocketLimit = `
<p class="lead">본인부담상한제 — 1년간 본인 부담 의료비가 소득 분위별 87~808만원 초과 시 다음해 8월 자동 환급. 만성질환·큰 수술이 있던 해는 무조건 체크.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📊 2026 본인부담상한 분위별</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">분위</th><th class="p-3">소득</th><th class="p-3">상한액</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">1분위</td><td class="p-3">최저</td><td class="p-3">87만원</td></tr>
<tr class="border-t"><td class="p-3">2~3분위</td><td class="p-3">하위</td><td class="p-3">108만원</td></tr>
<tr class="border-t"><td class="p-3">4~5분위</td><td class="p-3">중위</td><td class="p-3">167만원</td></tr>
<tr class="border-t"><td class="p-3">6~7분위</td><td class="p-3">상위</td><td class="p-3">313만원</td></tr>
<tr class="border-t"><td class="p-3">8~9분위</td><td class="p-3">고위</td><td class="p-3">432만원</td></tr>
<tr class="border-t"><td class="p-3">10분위</td><td class="p-3">최고</td><td class="p-3">808만원</td></tr>
</tbody></table></div>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>5분위 직장인 큰 수술 본인부담 500만원:</p>
<ul class="space-y-2 mt-4">
<li>· 상한 167만원 초과분: 333만원</li>
<li>· 다음해 8월 자동 환급: 333만원</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산기</a></li></ul></div>
`;

const orthodonticsTax = `
<p class="lead">치아 교정은 미용 목적이라도 의료비 공제 일부 인정. 부정교합 교정은 100% 의료비 공제, 단순 미관 목적도 일부 인정. 5~10개월 분할 결제로 한도 도달 유리.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 교정 종류별 공제</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>부정교합 교정</strong>: 100% 의료비 공제</li>
<li>· <strong>구순구개열·턱교정</strong>: 100% 공제</li>
<li>· <strong>미관 목적 단독 교정</strong>: 부분 공제 또는 불인정 (병원 기준 다름)</li>
<li>· <strong>투명교정(인비절라인)</strong>: 의료 목적이면 인정</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>치아 교정 500만원 (의료 목적), 총급여 5,000만원:</p>
<ul class="space-y-2 mt-4">
<li>· 총급여 3% = 150만원 초과분만 공제</li>
<li>· 500만원 - 150만원 = 350만원 × 15% = 52.5만원 환급</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const psychiatryDeduction = `
<p class="lead">정신과 진료비도 의료비 공제 대상. 우울증·불안장애·ADHD 등 치료비, 처방약, 상담 모두 영수증 보관 시 공제. 정신 건강 치료 부담 완화 정책.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 정신과 의료비 공제</h2>
<ul class="space-y-2 mt-4">
<li>· 진료비·상담료 (의사 처방 기준)</li>
<li>· 처방약 (정신과 약)</li>
<li>· 검사비 (심리검사 포함)</li>
<li>· 입원치료비</li>
<li>· 정신과 의료기관 영수증 필수</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 비공제 — 단순 상담</h2>
<p>의료기관 아닌 심리상담센터·코치는 의료비 공제 안 됨. 단 의사 처방 기반 심리치료는 인정.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 개인정보 보호</h2>
<p>국세청 의료비 자료는 의료기관명·금액만 표시. 진료 내용은 비공개. 안심하고 신고.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const industrialAccidentBenefit = `
<p class="lead">산업재해보상보험은 업무 중 부상·질병 시 의료비 100% + 휴업급여 70% + 장해연금까지. 임시·일용직·알바도 모두 의무 가입. 미신고 시 사업주 처벌.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 산재 보상 범위</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 요양급여</strong>: 의료비 100%·기간 무제한</li>
<li><strong>② 휴업급여</strong>: 평균임금 70% × 휴업 기간</li>
<li><strong>③ 장해급여</strong>: 후유장해 등급별 연금</li>
<li><strong>④ 유족급여</strong>: 사망 시 유족 연금</li>
<li><strong>⑤ 직업재활급여</strong>: 직무복귀 지원금</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 평균임금 200만원 직원 6개월 휴업</h2>
<ul class="space-y-2 mt-4">
<li>· 요양급여: 의료비 전액</li>
<li>· 휴업급여: 200 × 70% × 6 = 840만원</li>
<li>· 후유장해 시 추가 연금</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li></ul></div>
`;

const cancerCheckup5 = `
<p class="lead">5대 암검진(위·대장·간·유방·자궁경부) — 본인부담 10%만 부담하고 무료 검진. 위암 만 40세+ 2년 1회, 대장암 만 50세+ 1년 1회 등 연령별 권장.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 5대 암검진 대상</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>위암</strong>: 만 40세+ 2년 1회 (위내시경·위장조영)</li>
<li>· <strong>대장암</strong>: 만 50세+ 1년 1회 (분변잠혈검사)</li>
<li>· <strong>간암</strong>: 만 40세+ 고위험군 6개월 1회</li>
<li>· <strong>유방암</strong>: 만 40세+ 여성 2년 1회 (유방촬영)</li>
<li>· <strong>자궁경부암</strong>: 만 20세+ 여성 2년 1회</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 비용</h2>
<p>본인부담 10%만. 위내시경 약 5천원, 대장 분변 무료, 유방촬영 약 7천원. 추가 검진(폐암·췌장암 등)은 본인 부담.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/health-checkup-2026" class="text-primary underline">건강검진 2026 가이드</a></li></ul></div>
`;

const realLifeInsurance = `
<p class="lead">실비보험(실손의료보험)은 본인 부담 의료비 80~90% 보장. 의료비 공제와 실비 청구를 동시 활용 시 환급 + 보상 이중 효과. 단 미신고 시 양쪽 모두 손해.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 실비보험 활용 5가지</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 1차: 병원 진료 후 영수증 확보</strong></li>
<li><strong>② 2차: 실비보험사에 청구</strong> (대부분 80~90% 보상)</li>
<li><strong>③ 3차: 의료비 공제 신청</strong> (실비 보상받은 부분 차감 후 잔액)</li>
<li><strong>④ 4차: 본인부담상한제 환급</strong> (1년 합산 한도 초과 시)</li>
<li><strong>⑤ 5차: 회사 사내복지기금 의료비 지원</strong></li>
</ol>
<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 함정 — 이중 보상</h2>
<p>실비보험으로 받은 부분은 의료비 공제에서 차감. 100% 보상받았다면 의료비 공제 0원. 90% 보상이면 10%만 공제.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const physicalTherapy = `
<p class="lead">물리치료·도수치료·재활치료는 의료비 공제 + 실비 보험 청구 가능. 단 미용 목적·체형교정 목적은 제외. 한방 추나치료도 의료 목적이면 공제.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 인정·제외 기준</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>인정</strong>: 척추·관절 통증 치료, 수술 후 재활, 한방 추나치료</li>
<li>· <strong>인정</strong>: 도수치료(의료기관 발급 영수증)</li>
<li>· <strong>제외</strong>: 마사지·체형교정 단독 목적, 일반 마사지샵</li>
<li>· <strong>제외</strong>: 찜질방·사우나</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 도수치료 6회 60만원</h2>
<p>의료기관 영수증 + 실비 청구 80% = 48만원 보상. 나머지 12만원은 의료비 공제(총급여 3% 초과 시).</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const infertilityTax = `
<p class="lead">난임 시술비는 의료비 공제 20%(일반 15%보다 우대) + 한도 제한 없음. 시험관 시술 1회 300~500만원에 대해 큰 환급 효과. 만 44세+ 여성도 시술비 정부 일부 지원.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 난임 시술 우대</h2>
<ul class="space-y-2 mt-4">
<li>· 공제율 20% (일반 의료비 15% + 5%p)</li>
<li>· 한도 무제한 (일반 700만원 한도 적용 안 됨)</li>
<li>· 시술비·약값·검사비 모두 포함</li>
<li>· 정부 지원금(난임 시술 보조금)도 별도 받을 수 있음</li>
</ul>
<h2 class="mt-12 text-2xl function-bold text-primary">💰 시뮬</h2>
<p>난임 시술 800만원 + 일반 의료비 200만원, 총급여 6,000만원:</p>
<ul class="space-y-2 mt-4">
<li>· 일반 의료비 200 - 3%(180) = 20만원 × 15% = 3만원</li>
<li>· 난임 800 × 20% = 160만원 환급</li>
<li>· <strong>합산 163만원 환급</strong></li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const dementiaInsurance = `
<p class="lead">치매보험은 진단 시 일시금 + 매월 연금형 보장. 단 65세 이전 가입 권장 (그 이후는 보험료 폭증). 부모 부양 가구는 부모 명의 치매보험 + 본인 부담으로 보험료 12% 공제.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 치매보험 주요 보장</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>경증 치매 진단</strong>: 일시금 500~1,000만원</li>
<li>· <strong>중등도 치매</strong>: 일시금 + 매월 연금 100~200만원</li>
<li>· <strong>중증 치매</strong>: 연금 200~300만원/월</li>
<li>· <strong>가입 시기</strong>: 50~60대 가입 권장 (보험료 합리적)</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 절세 — 본인 결제 부모 보험</h2>
<p>부모 명의 치매보험에 본인이 보험료 납입 시 보장성 보험료 100만원 한도 공제. 한계세율 24% 시 12만원 환급.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const handicapInsurance = `
<p class="lead">장애인 보험료는 본인·부양가족 장애인 등록 시 한도 100만원 외 추가 100만원 = 합산 200만원. 보장성 보험료 공제율 12%로 24만원 환급 가능.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 장애인 보험 특례</h2>
<ul class="space-y-2 mt-4">
<li>· 일반 보장성 100만원 한도 + 장애인 보장성 100만원 한도 = 합산 200만원</li>
<li>· 공제율 12%로 최대 24만원 환급</li>
<li>· 장애인 본인·부양가족 모두 적용</li>
<li>· 보험증권에 "장애인" 명시 필요</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 H — 자산관리·노후 (10편)
// ═══════════════════════════════════════════════════════════════

const inheritanceTax = `
<p class="lead">상속세는 1억 이하 10%~30억 초과 50%의 누진세율. 일괄공제 5억 또는 기초공제 2억+인적공제 중 큰 금액 선택. 배우자 공제 5~30억까지 활용 시 큰 절세.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📊 상속세율</h2>
<ul class="space-y-2 mt-4">
<li>· 1억 이하: 10%</li>
<li>· 1~5억: 20%</li>
<li>· 5~10억: 30%</li>
<li>· 10~30억: 40%</li>
<li>· 30억 초과: 50%</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 절세 — 배우자 공제 활용</h2>
<p>상속재산 20억, 배우자 + 자녀 2명:</p>
<ul class="space-y-2 mt-4">
<li>· 일괄공제 5억 + 배우자 공제 5~30억 (실제 받는 금액 한도)</li>
<li>· 배우자가 10억 상속 받으면 공제 10억 → 과세 5억 → 약 1억 세금</li>
<li>· 배우자가 15억 받으면 공제 15억 → 과세 0 → 세금 0원</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/inheritance-tax-sim" class="text-primary underline">상속세 시뮬</a></li></ul></div>
`;

const giftVsTransfer = `
<p class="lead">자녀에게 자산 이전 시 증여 vs 양도 선택. 일반적으로 부동산은 부담부증여(양도+증여 조합), 주식은 증여, 현금은 단순 증여가 유리. 시점·자산·소득에 따라 다름.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📊 사례 비교</h2>
<p>시가 10억 주택을 자녀에게 이전:</p>
<ul class="space-y-2 mt-4">
<li>· <strong>단순 증여</strong>: 증여세 약 2.4억 (성인 자녀 5천 공제)</li>
<li>· <strong>부담부증여(대출 6억 포함)</strong>: 증여세 6,000만원 + 부모 양도세 약 5,000만원 = 1.1억</li>
<li>· <strong>양도</strong>: 자녀가 시가 매수 + 양도세 → 1.5억+ 세금</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 자산별 추천</h2>
<ul class="space-y-2 mt-4">
<li>· 현금/금융자산: <strong>증여</strong> (10년 5천만 비과세)</li>
<li>· 부동산(대출 있음): <strong>부담부증여</strong></li>
<li>· 부동산(대출 없음): <strong>분할 증여</strong> (10년 단위)</li>
<li>· 주식·펀드: <strong>저평가 시기 증여</strong> (이후 상승분 자녀 자산)</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산기</a></li></ul></div>
`;

const familyTrust = `
<p class="lead">가족 신탁은 본인 사망·치매 시 자산을 미리 정한 대로 관리·이전. 상속분쟁 예방 + 본인 의사 반영 + 세금 효율적 분배. 한국에서도 점차 활성화 중.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 가족 신탁 장점</h2>
<ul class="space-y-2 mt-4">
<li>· 본인 사후 자산 관리 의사 반영</li>
<li>· 상속분쟁 예방</li>
<li>· 치매·장애 시 본인 보호</li>
<li>· 세금 분산 효과 가능</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 단점</h2>
<ul class="space-y-2 mt-4">
<li>· 신탁 수수료 (연 0.5~1%)</li>
<li>· 한국 신탁 제도 미성숙</li>
<li>· 가족 합의 필수</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산</a></li></ul></div>
`;

const annuityRetirement = `
<p class="lead">노후 자산 인출 순서가 절세 핵심. ISA → 연금저축·IRP → 국민연금 → 기타 자산 순서로 인출하면 세금 최소화. 80세 후 자산은 만 80세 이후 인출 시 더 큰 절세.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 노후 인출 순서</h2>
<ol class="space-y-2 mt-4">
<li><strong>1순위: 비과세 자산(ISA·청년도약 만기)</strong> — 즉시 세금 0</li>
<li><strong>2순위: 일반 펀드·예적금</strong> — 매도 시점 분산</li>
<li><strong>3순위: IRP·연금저축 (만 55세+)</strong> — 5.5~3.3% 분할 수령</li>
<li><strong>4순위: 국민연금 (만 65세+)</strong> — 평생 지급</li>
<li><strong>5순위: 주택연금(역모기지)</strong> — 주택 담보 평생 연금</li>
</ol>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/national-pension-estimate-2026" class="text-primary underline">국민연금 예상수령액</a></li><li>· <a href="/tools/finance/irp" class="text-primary underline">IRP 계산기</a></li></ul></div>
`;

const reverseMortgage = `
<p class="lead">주택연금(역모기지)은 만 55세+ 1주택자가 주택을 담보로 평생 연금 받는 제도. 사망 시 주택 처분으로 정산. 주택 가격 9억 이하 + 부부 모두 가입 가능.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 주택연금 조건</h2>
<ul class="space-y-2 mt-4">
<li>· 만 55세+ 1주택자</li>
<li>· 주택 가격 9억 이하</li>
<li>· 부부 모두 신청 가능 (한 명만 만 55세 이상이면 OK)</li>
<li>· 사망 시 주택 처분 → 연금 합계 차감 후 잔액 자녀 상속</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 만 70세, 시가 6억 주택</h2>
<ul class="space-y-2 mt-4">
<li>· 평생 매월 약 180만원 수령</li>
<li>· 종신 받음 (90세 사망 시 누적 약 4.3억)</li>
<li>· 주택 처분 시 잔여분 자녀 상속</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/property-holding-tax-2026" class="text-primary underline">부동산 보유세 계산</a></li></ul></div>
`;

const retirementHomePurchase = `
<p class="lead">은퇴 후 주거 비용 절감을 위한 4가지 전략: 다운사이징(작은 집), 지방 이전, 시니어 타운, 주택연금. 각각 자금 흐름·생활 만족도 다름.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">🏠 4가지 전략</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 다운사이징</strong>: 큰 집 → 작은 집, 차액 4~6억 확보 가능</li>
<li><strong>② 지방 이전</strong>: 서울 강남 → 지방 중소도시, 차액 8~10억+</li>
<li><strong>③ 시니어 타운</strong>: 의료·여가 통합 제공, 월 100~300만원 비용</li>
<li><strong>④ 주택연금</strong>: 집 그대로 + 매월 연금 받기</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/fire-calculator" class="text-primary underline">FIRE 계산기</a></li></ul></div>
`;

const lifeExpectancyPlanning = `
<p class="lead">2026년 한국 평균수명 남자 84세·여자 88세. 60세 은퇴 시 24~28년 자산 필요. 월 생활비 250만원 가정 시 약 7.5~9억 필요. 은퇴 자산 적정 규모 계산.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📊 은퇴 자산 시뮬</h2>
<p>월 생활비 250만원, 은퇴 60세, 사망 90세 (30년):</p>
<ul class="space-y-2 mt-4">
<li>· 단순 합계: 250 × 12 × 30 = 9억</li>
<li>· 인플레이션 3% 적용 시: 약 14억</li>
<li>· 국민연금 월 130만원 차감: 약 8억 5천</li>
<li>· 주택연금 월 50만원 추가 시: 약 6억</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 안전인출률 4%</h2>
<p>은퇴 자산 × 4% = 연 인출액 (30년 안전). 6억이면 연 2,400만원 (월 200만원) 인출 가능.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/fire-calculator" class="text-primary underline">FIRE 계산기</a></li></ul></div>
`;

const healthInsuranceContinue = `
<p class="lead">퇴직 후 건강보험 임의계속가입 — 최대 36개월간 직장가입자 시절 보험료로 유지. 퇴직 후 2개월 이내 신청. 재산은 많은데 소득은 줄어든 은퇴자에게 절대 유리.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📊 비교 — 퇴직 직장인 vs 지역가입자</h2>
<p>퇴직 직전 월 보수 600만원, 자녀 2명·자가 보유:</p>
<ul class="space-y-2 mt-4">
<li>· 직장가입자 본인 부담: 약 24만원/월</li>
<li>· 임의계속가입(본인+회사 모두 본인 부담): 약 48만원/월</li>
<li>· 지역가입자 전환 시: 약 100~150만원/월 (재산 점수 큼)</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 임의계속가입 신청</h2>
<p>퇴직 후 2개월 이내 국민건강보험공단(1577-1000) 신청. 36개월 후 자동 종료 → 지역가입자 또는 피부양자.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산기</a></li></ul></div>
`;

const childLifecycleSavings = `
<p class="lead">자녀 출생부터 성인까지 저축 로드맵: 0세 비과세 증여 2천 → 5세 청년대 펀드 → 14세 청약통장 → 18세 청년주택드림. 25년 누적 약 1.5억+ 자녀 자산 형성.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📅 시점별 자녀 저축</h2>
<ol class="space-y-2 mt-4">
<li><strong>0~10세</strong>: 비과세 증여 2,000만원 + 자녀 명의 펀드 운용 (10년 7% = 약 3,900만원)</li>
<li><strong>10~19세</strong>: 추가 증여 2,000만원 + 청약통장 시작</li>
<li><strong>20~30세</strong>: 청년도약·청년주택드림·청년형 장기투자</li>
<li><strong>30대</strong>: 신혼·디딤돌 대출 + 부담부증여로 자산 본격 이전</li>
</ol>
<h2 class="mt-12 text-2xl function-bold text-primary">💰 누적 효과</h2>
<p>0~30세 누적 자녀 자산 약 1.5~2억 (운용 수익 포함). 부모 자산 효율적 이전 + 자녀 사회 진출 준비 자금 확보.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산기</a></li></ul></div>
`;

const propertyDownsizing = `
<p class="lead">자녀 독립 후 큰 집 매도 → 작은 집 매수 시 차액 + 1주택 비과세 12억 활용. 1세대 1주택 비과세로 차익 세금 0원, 다운사이징 차액은 노후 자금.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 절세 다운사이징 절차</h2>
<ol class="space-y-2 mt-4">
<li><strong>1. 일시적 2주택 전환</strong>: 작은 집 먼저 매수</li>
<li><strong>2. 기존 큰 집 3년 이내 매도</strong>: 1주택자 비과세 적용</li>
<li><strong>3. 차액 노후 자금화</strong>: 4억 큰집 - 2억 작은집 = 2억 확보</li>
</ol>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>강남 1주택 15억 매도 → 강북 7억 매수:</p>
<ul class="space-y-2 mt-4">
<li>· 양도세: 15억은 12억 비과세 + 초과분 80% 공제 → 약 200만원</li>
<li>· 차액 8억 노후 자금</li>
<li>· 8억 × 4% 안전인출률 = 연 3,200만원 (월 267만원)</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">양도세 계산</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 I — 법률·실용 (10편)
// ═══════════════════════════════════════════════════════════════

const rentalDispute = `
<p class="lead">임대차 분쟁의 핵심: 보증금 반환 거부, 묵시적 갱신, 차임 인상, 수리 의무. 임차인 권리 명확히 알고 증거 보관하면 90%+ 승소 가능.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 5대 분쟁 사례</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 보증금 반환 거부</strong>: 임차인 퇴거 후 30일 이내 반환 의무. 미반환 시 법정 이자 5%</li>
<li><strong>② 묵시적 갱신</strong>: 만기 6개월~1개월 전 통지 없으면 동일 조건 자동 갱신</li>
<li><strong>③ 차임 인상</strong>: 5% 상한 (계약 기간 중)</li>
<li><strong>④ 수리 의무</strong>: 보일러·누수 등 중요 수리 임대인 의무</li>
<li><strong>⑤ 부동산 매매</strong>: 새 임대인에 임대차 승계</li>
</ol>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 임차인 권리 보호</h2>
<ul class="space-y-2 mt-4">
<li>· 대항력 — 전입신고 + 확정일자</li>
<li>· 우선변제권 — 확정일자 받기</li>
<li>· 임대차 분쟁조정위원회 — 무료 조정</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/jeonse-loan" class="text-primary underline">전세대출 계산</a></li></ul></div>
`;

const workContractCheck = `
<p class="lead">근로계약서 체결 시 반드시 확인할 7가지: 임금 구성·근무시간·휴일·연차·복지·해고 사유·근속 보상. 누락 시 사업주 500만원 이하 과태료.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 근로계약서 필수 7항목</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 임금 구성</strong>: 기본급·수당·상여 명시. 포괄임금제 시 고정 OT 시간 명시.</li>
<li><strong>② 근무시간</strong>: 주 40시간·1일 8시간 기준. 야간·휴일·연장 가능 여부.</li>
<li><strong>③ 휴일·휴가</strong>: 주 1회 유급 휴일, 연차 15일+.</li>
<li><strong>④ 4대 보험</strong>: 가입 여부 명시.</li>
<li><strong>⑤ 시용기간</strong>: 명시 + 시용 기간 임금 (보통 80%).</li>
<li><strong>⑥ 해고 절차</strong>: 30일 전 통지·예고수당.</li>
<li><strong>⑦ 비밀유지·경업금지</strong>: 별도 합의서.</li>
</ol>
<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 미체결 시</h2>
<p>근로계약서 미작성·미교부 시 사업주 500만원 이하 과태료. 임금 분쟁 시 임차인 유리.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/" class="text-primary underline">연봉 실수령액 계산기</a></li></ul></div>
`;

const dismissalProcedure = `
<p class="lead">해고는 정당한 사유 + 30일 전 통지 또는 30일분 예고수당 필수. 부당해고 시 노동위원회 진정 + 복직 명령 + 임금 보상. 5인+ 사업장만 적용.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 정당한 해고 사유</h2>
<ul class="space-y-2 mt-4">
<li>· 근무태도 불량 (반복 경고 후)</li>
<li>· 무단결근 (정당 사유 없는)</li>
<li>· 사업장 손실 (정리해고 절차)</li>
<li>· 비위 사실 (절도·횡령·성희롱)</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 부당해고 대응</h2>
<ol class="space-y-2 mt-4">
<li>1. 해고일로부터 3개월 이내 노동위원회 진정</li>
<li>2. 부당해고 인정 시 복직 + 그동안 임금 100% 보상</li>
<li>3. 거부 시 노동부 → 사법 절차</li>
</ol>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 예고수당</h2>
<p>해고 30일 전 통지 안 한 경우 30일분 통상임금 지급 의무. 통상임금 200만원 직원이면 200만원.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li></ul></div>
`;

const wageDelayed = `
<p class="lead">임금체불 시 노동부 진정 → 시정명령 → 형사처벌(3년 이하 징역 또는 3,000만원 벌금). 임금채권 시효 3년, 그 안에 청구하면 100% + 부가금(200%까지) 가능.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 임금체불 대응 4단계</h2>
<ol class="space-y-2 mt-4">
<li><strong>1단계</strong>: 회사에 정중한 지급 요청 (서면·이메일)</li>
<li><strong>2단계</strong>: 노동부 임금체불 진정 (민원24 또는 노동청 방문)</li>
<li><strong>3단계</strong>: 노동부 시정명령 후 미이행 시 검찰 송치</li>
<li><strong>4단계</strong>: 소액재판 (3,000만 이하 빠른 처리)</li>
</ol>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 체불임금 + 부가금</h2>
<ul class="space-y-2 mt-4">
<li>· 원금 + 부가금(원금의 100% = 2배 보상)</li>
<li>· 지연이자 연 20%</li>
<li>· 사업주 형사처벌 3년·3천</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 시효 3년</h2>
<p>임금채권 시효 3년. 3년 누적된 미지급 임금도 한 번에 청구 가능.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/weekly-holiday-allowance-2026" class="text-primary underline">주휴수당 계산기</a></li></ul></div>
`;

const sexualHarassmentLaw = `
<p class="lead">직장 내 성희롱 시 사업주 조사 의무 + 가해자 징계 + 피해자 보호. 미이행 시 1천만원 이하 과태료 + 손해배상. 노동부 신고는 익명 가능.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 성희롱 대응 절차</h2>
<ol class="space-y-2 mt-4">
<li>1. 증거 확보 (메시지·이메일·녹음)</li>
<li>2. 회사 인사팀·고충처리위원회 신고</li>
<li>3. 노동부 또는 인권위원회 신고</li>
<li>4. 형사 고소(스토킹·강제추행 등)</li>
</ol>
<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 사업주 의무</h2>
<ul class="space-y-2 mt-4">
<li>· 연 1회 성희롱 예방교육 의무</li>
<li>· 신고 접수 후 즉시 조사</li>
<li>· 피해자 분리 조치 (가해자 격리)</li>
<li>· 보복 금지 (해고·인사 불이익)</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/qna" class="text-primary underline">Q&A 직장 관련 질문</a></li></ul></div>
`;

const overtimeProof = `
<p class="lead">야근·시간외 근무 입증은 출퇴근 기록·교통카드·업무 이메일 시각·카톡 출근 인증 등 일상 데이터. 미지급 야근수당 청구 시 3년 누적까지 한 번에 청구 가능.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 야근 증거 5가지</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 출퇴근 기록</strong>: 사내 시스템·태깅 기록</li>
<li><strong>② 교통카드 내역</strong>: 22시 이후 귀가 기록</li>
<li><strong>③ 업무 이메일 시각</strong>: 9시 이전·19시 이후 발송 이메일</li>
<li><strong>④ 카톡 출근 인증</strong>: 단톡방 출근/퇴근 메시지</li>
<li><strong>⑤ 회식·미팅 영수증</strong>: 평일 21시 이후 결제</li>
</ol>
<h2 class="mt-12 text-2xl function-bold text-primary">💰 시뮬 — 월 30시간 미지급</h2>
<ul class="space-y-2 mt-4">
<li>· 통상시급 15,000원 × 1.5배 × 30시간 = 67.5만원/월</li>
<li>· 3년 누적: 약 2,430만원</li>
<li>· 부가금 100% 시 4,860만원 청구 가능</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/weekly-holiday-allowance-2026" class="text-primary underline">주휴수당 계산기</a></li></ul></div>
`;

const annualLeaveRefund = `
<p class="lead">연차 미사용 시 미사용 일수 × 통상임금 = 연차수당. 단 사업주가 휴가 사용 촉진 절차 거치면 미지급 가능. 절차 미이행 시 무조건 지급 의무.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 연차수당 발생 요건</h2>
<ul class="space-y-2 mt-4">
<li>· 1년 80% 이상 출근 시 15일+ 연차</li>
<li>· 미사용 시 매 1일 × 통상임금 보상</li>
<li>· 사업주 휴가 사용 촉진(7월·10월 2회 안내) 시 면제</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>통상임금 일 20만원, 미사용 연차 10일:</p>
<ul class="space-y-2 mt-4">
<li>· 연차수당: 200만원</li>
<li>· 회사가 촉진 안 했으면 무조건 지급</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/annual-leave-pay-quick" class="text-primary underline">연차수당 계산기</a></li></ul></div>
`;

const blacklistEmployer = `
<p class="lead">취업 전 회사 평판 조회 5가지 채널: 잡플래닛·블라인드·크레딧잡·국세청 폐업 검색·노동부 임금체불 명단. 임금체불·갑질 회사 사전 회피로 손해 예방.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 회사 평판 조회 5가지</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>잡플래닛</strong>: 전·현직 직원 리뷰</li>
<li>· <strong>블라인드</strong>: 실명 인증 직장인 커뮤니티</li>
<li>· <strong>크레딧잡</strong>: 회사 신용·재무 정보</li>
<li>· <strong>국세청 사업자등록 폐업 조회</strong>: 폐업·휴업 이력</li>
<li>· <strong>고용노동부 체불사업주 명단</strong>: 공식 임금체불 회사 리스트</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 핵심 점검 포인트</h2>
<ul class="space-y-2 mt-4">
<li>· 잡플래닛 별점 2.5 이하 + 부정 리뷰 다수 → 회피</li>
<li>· 체불사업주 명단 등재 → 절대 입사 X</li>
<li>· 폐업 이력 잦은 사업주 → 신중</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/salary-db" class="text-primary underline">회사별 연봉 DB</a></li></ul></div>
`;

const employmentInsurance = `
<p class="lead">고용보험 실업급여는 퇴직 직전 평균임금의 60%·최대 9개월 지급. 자발적 퇴직은 원칙적 불가, 권고사직·계약만료·중대 사유는 가능. 자격·금액·신청 절차 완벽 정리.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 실업급여 자격</h2>
<ul class="space-y-2 mt-4">
<li>· 고용보험 가입 18개월 중 180일 이상</li>
<li>· 비자발적 이직 (권고사직·계약만료·중대사유)</li>
<li>· 적극적 구직활동 의지</li>
<li>· 만 65세 미만</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 지급 — 평균임금 60%</h2>
<p>평균임금 200만원 직원 7개월 수급:</p>
<ul class="space-y-2 mt-4">
<li>· 일 6.4만원 × 30 = 192만원/월</li>
<li>· 7개월 × 192만원 = 1,344만원</li>
<li>· 최대 9개월(나이·근속별)</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li></ul></div>
`;

const employmentEstoppel = `
<p class="lead">권고사직 → 실업급여 가능하지만 "자진퇴사"로 처리되면 불가. 사직서에 "권고사직" 명시 + 회사 동의 + 노동부 확인. 잘못 처리하면 약 1,000만원 손해.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 권고사직 5단계 안전 절차</h2>
<ol class="space-y-2 mt-4">
<li><strong>1. 사유 명시</strong>: "경영상 이유·사업 축소·구조조정" 등</li>
<li><strong>2. 사직서 표현</strong>: "권고사직 수용"·"경영상 이유"</li>
<li><strong>3. 절대 금지 표현</strong>: "일신상 사유"·"개인 사정"</li>
<li><strong>4. 위로금 별도 협상</strong>: 통상 1~3개월 임금</li>
<li><strong>5. 노동부 신고</strong>: 사직서 + 회사 확인서 제출</li>
</ol>
<h2 class="mt-12 text-2xl function-bold text-primary">⚠️ 함정 — 일신상 사유</h2>
<p>회사가 "일신상 사유"로 적으라고 강요 시 거부. 실업급여 약 1,000만원 + 위로금 모두 손해.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 J — 2026 정책 신설 (10편)
// ═══════════════════════════════════════════════════════════════

const youthMonthlyRentSupport = `
<p class="lead">2026 청년 월세 한시 특별지원 — 만 19~34세 무주택 청년에게 월 최대 20만원, 12개월간 지원. 신청 자격 + 신청 절차 + 누적 240만원 확보.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 자격</h2>
<ul class="space-y-2 mt-4">
<li>· 만 19~34세 무주택 청년</li>
<li>· 부모 가구 소득 중위 100% 이하</li>
<li>· 본인 소득 중위 60% 이하</li>
<li>· 보증금 5천만 + 월세 70만원 이하 주택</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 지원금</h2>
<p>월 20만원 × 12개월 = 최대 240만원. 신청 일부터 12개월 한정. 신청은 복지로(bokjiro.go.kr) 또는 주소지 주민센터.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/monthly-rent-tax-credit-quick" class="text-primary underline">월세 세액공제 계산</a></li></ul></div>
`;

const childSupport100 = `
<p class="lead">아동수당 — 만 0~7세 자녀에게 월 10만원, 매월 25일 지급. 2026년 부모 소득 무관. 자녀 1명 기준 연 120만원, 7년 누적 840만원.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 아동수당</h2>
<ul class="space-y-2 mt-4">
<li>· 대상: 만 0~7세 모든 아동 (출생 직후~만 8세 생일 전월)</li>
<li>· 금액: 월 10만원</li>
<li>· 지급일: 매월 25일</li>
<li>· 소득 무관 보편 지급</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 추가 — 0~1세 부모급여</h2>
<p>만 0세: 월 100만원 / 만 1세: 월 50만원 (육아휴직 못 받는 가구 한정). 아동수당 10만원과 중복 수령 가능.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/parental-leave" class="text-primary underline">육아휴직 급여 계산기</a></li></ul></div>
`;

const basicPension2026 = `
<p class="lead">기초연금 — 만 65세+ 소득 하위 70%에 매월 최대 40만원 지급. 국민연금 수령자도 일부 가능. 부부 모두 받으면 최대 64만원/월(20% 감액).</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 자격·금액</h2>
<ul class="space-y-2 mt-4">
<li>· 만 65세+ 한국 거주</li>
<li>· 소득인정액 단독 213만원/부부 340만원 이하</li>
<li>· 단독 최대 40만원/월</li>
<li>· 부부 동시 수령 시 각 20% 감액 → 32만원씩</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 신청</h2>
<p>만 65세 생일 한 달 전부터 주민센터 또는 국민연금공단(1355) 신청. 매년 소득 재확인.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/national-pension-estimate-2026" class="text-primary underline">국민연금 예상수령액</a></li></ul></div>
`;

const seekingJobBenefit = `
<p class="lead">구직급여(실업급여) — 평균임금 60% × 최대 9개월. 2026년부터 청년·중장년 우대 강화. 정년 60세+ 추가 3개월, 청년 30세 미만 6개월 보장.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 2026 구직급여 변경</h2>
<ul class="space-y-2 mt-4">
<li>· 평균임금 60% (상한 일 7.4만원)</li>
<li>· 지급 기간: 4~9개월 (나이·근속별)</li>
<li>· 청년 30세 미만: 최소 6개월 보장</li>
<li>· 정년 60세+: 추가 3개월</li>
<li>· 자영업·1인 사업자도 가입 시 수급 가능</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>평균임금 250만원 직원 7개월 수급:</p>
<ul class="space-y-2 mt-4">
<li>· 일 7.4만원 × 30 = 222만원/월 (상한 적용)</li>
<li>· 7개월 × 222만원 = 1,554만원</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li></ul></div>
`;

const digitalNomadVisa = `
<p class="lead">한국 디지털 노마드 비자 (2024 시행) — 외국인 원격 근무자가 1년+1년 한국 체류 가능. 연소득 미화 8만 달러 이상 + 건강보험 가입. 한국 거주 외국인 IT 인재 유치.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 비자 자격</h2>
<ul class="space-y-2 mt-4">
<li>· 외국 회사 원격 근무자 또는 외국 클라이언트 프리랜서</li>
<li>· 연소득 미화 8만 달러+ (약 1.08억원)</li>
<li>· 한국에서 한국 회사 일하지 않음</li>
<li>· 건강보험 + 여행자보험 가입</li>
<li>· 1년 + 1년 연장 가능 (총 2년)</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 한국 측 세제 — 비거주자</h2>
<p>디지털 노마드는 한국 비거주자로 분류. 한국 소득세 없음. 단 한국 내 발생 소득(임대료·예금이자)은 과세.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/global" class="text-primary underline">국가별 연봉 비교</a></li></ul></div>
`;

const childcareSupport = `
<p class="lead">육아 정부 지원 종합 — 아동수당 + 부모급여 + 어린이집 보육료 + 초등 돌봄 + 청년주택드림. 자녀 1명 출생부터 초등까지 정부 지원 약 7,000만원+.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 단계별 지원</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>0~1세</strong>: 부모급여 월 100만원/50만원 + 아동수당 10만원</li>
<li>· <strong>2~7세</strong>: 아동수당 10만원 + 어린이집 보육료 무료</li>
<li>· <strong>초등</strong>: 초등 돌봄교실 + 방학 돌봄</li>
<li>· <strong>중·고등</strong>: 자녀세액공제 + 학자금</li>
<li>· <strong>대학</strong>: 청년주택드림 + 학자금 대출</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">💰 누적</h2>
<p>자녀 1명 0~18세 정부 지원 누적 약 6,000~7,000만원. 부모 자녀세액공제 추가 환급 30~70만원/년.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/parental-leave" class="text-primary underline">육아휴직 급여 계산기</a></li></ul></div>
`;

const elderCare = `
<p class="lead">장기요양보험 — 만 65세+ 또는 노인성 질환자 대상. 등급 판정 후 시설·재가 서비스 본인부담 15~20%. 부모 등급 받으면 월 50~200만원 가치 서비스 + 본인 의료비 공제까지.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 장기요양 등급</h2>
<ul class="space-y-2 mt-4">
<li>· 1등급(최중증): 일상생활 전적 도움 필요</li>
<li>· 2등급(중증): 상당 부분 도움</li>
<li>· 3등급(중등도): 부분적 도움</li>
<li>· 4~5등급(경증): 일부 도움</li>
<li>· 인지지원등급: 치매·인지장애</li>
</ul>
<h2 class="mt-12 text-2xl function-bold text-primary">💰 본인부담</h2>
<p>요양시설 약 200만원/월 중 본인부담 약 30~40만원. 재가서비스 약 100만원/월 중 본인부담 15만원.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산기</a></li></ul></div>
`;

const veteranBenefit = `
<p class="lead">국가유공자·보훈대상자 본인·가족 세제 혜택 다양. 양도세·취득세 감면, 의료비 100% 지원, 자녀 학자금·대학 학비 등. 본인 신청해야 적용.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 주요 혜택</h2>
<ul class="space-y-2 mt-4">
<li>· 양도세 100% 감면 (5억 한도)</li>
<li>· 취득세 50% 감면</li>
<li>· 의료비 100% 본인부담 면제</li>
<li>· 자녀 대학 등록금 전액 지원</li>
<li>· 보훈 수당 월 10~150만원</li>
</ul>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const lowIncomeSupport = `
<p class="lead">기초생활보장제도 — 소득 중위 50% 이하 저소득층에게 생계·의료·주거·교육 4종 급여. 2026년 4인 가구 기준 생계급여 약 195만원/월, 의료급여 본인부담 0~5%.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 4종 급여</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>생계급여</strong>: 4인 가구 약 195만원/월</li>
<li>· <strong>의료급여</strong>: 본인부담 0~5%</li>
<li>· <strong>주거급여</strong>: 임대료 일부 지원</li>
<li>· <strong>교육급여</strong>: 입학금·학용품·교과서</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 신청</h2>
<p>주소지 주민센터 방문 또는 복지로 온라인 신청. 소득·재산 조사 후 약 30일 내 결정.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/earned-income-credit" class="text-primary underline">근로장려금 계산기</a></li></ul></div>
`;

const energyVoucher = `
<p class="lead">에너지바우처 — 저소득층 여름·겨울 냉난방비 지원. 1인 가구 약 14만원, 4인 가구 약 30만원. 6월 신청 → 11월부터 사용. 2026년 지원금 확대.</p>
<h2 class="mt-12 text-2xl font-bold text-primary">📋 자격·금액</h2>
<ul class="space-y-2 mt-4">
<li>· 기초생활수급자·차상위·한부모 가정</li>
<li>· 여름(7~9월) + 겨울(11~3월) 사용</li>
<li>· 1인 약 14만원·2인 19만원·3인 26만원·4인+ 30만원+</li>
<li>· 전기·가스·등유·연탄 결제 가능</li>
</ul>
<h2 class="mt-12 text-2xl font-bold text-primary">🎯 신청</h2>
<p>매년 6~7월 주소지 주민센터 또는 복지로 신청. 자동 갱신 가능 가구는 별도 신청 불필요.</p>
<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/earned-income-credit" class="text-primary underline">근로장려금 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// Export — 50개 가이드 통합
// ═══════════════════════════════════════════════════════════════

export const hotNewsDeepDive: Guide[] = [
  // 세금 절세 심화 10편
  { slug: "employee-stock-ownership-2026", title: "우리사주조합 활용 — 시가 30% 할인 매수 + 1년 후 매도 절세", description: "회사 자사주를 시가 70%에 매수 + 1년 보호예수 + 상장 매도 차익 비과세. 100주 매수 시 1년 후 약 1,121만원 실수령.", category: "주식", tags: ["우리사주", "자사주", "근로소득세", "양도세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: employeeStockOwnership, lang: "ko" },
  { slug: "overseas-resident-tax-2026", title: "해외 주재원·해외 근무자 세금 — 거주자 vs 비거주자 분기점", description: "1년+ 해외 거주 + 가족 동반 시 비거주자. 한국 소득세 부담 없음. 한국 부동산 임대만 종합과세.", category: "세금", tags: ["해외주재원", "비거주자", "조세조약", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: overseasResidentTax, lang: "ko" },
  { slug: "comprehensive-financial-income-2000-2026", title: "금융소득 2,000만원 초과 종합과세 — 부부 분산 + ISA 활용", description: "이자·배당 연 2천 초과 시 종합과세 전환. 직장인 한계세율 35%+ 점프. 부부 분산 + ISA + IRP로 절세.", category: "세금", tags: ["금융소득", "종합과세", "분리과세", "ISA", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: comprehensiveFinancialIncome, lang: "ko" },
  { slug: "other-income-tax-strategy-2026", title: "기타소득 8.8% 원천 — 분리과세 vs 종합과세 선택", description: "강연료·원고료·인세 8.8% 원천 후 300만원 초과 시 종합과세 선택 가능. 연봉 5천 + 500 기타 시 종합과세 3만원 유리.", category: "세금", tags: ["기타소득", "강연료", "원고료", "분리과세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: otherIncomeTaxStrategy, lang: "ko" },
  { slug: "personal-vs-corporation-tax-2026", title: "개인사업자 vs 법인 — 순이익 1.5억 이상 법인 유리", description: "개인 6~45% vs 법인 9~24% + 배당 15.4%. 매출 5억 + 순이익 1.5억 이상부터 법인 전환 검토.", category: "세금", tags: ["개인사업자", "법인", "법인세", "전환", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: personalVsCorporation, lang: "ko" },
  { slug: "vat-refund-2026", title: "부가가치세 환급 — 초기 투자 큰 사업자 자금 흐름", description: "매입세액 > 매출세액 시 환급. 스타트업 1분기 매출 1억 vs 매입 1.5억 = 500만원 환급. 분기 신고 또는 월별 조기 환급.", category: "세금", tags: ["부가가치세", "VAT", "환급", "스타트업", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: vatRefund, lang: "ko" },
  { slug: "consumption-tax-simple-vs-general-2026", title: "간이과세자 vs 일반과세자 — 매출 1.04억 분기점 100만원 절세", description: "간이 부가세 1.5~4% vs 일반 10%. 매출 8천 음식점 시 간이가 약 100만원 유리. 단 매입세액 공제 제한.", category: "세금", tags: ["간이과세", "일반과세", "부가세", "자영업", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: consumptionTaxReturn, lang: "ko" },
  { slug: "carryover-loss-15year-2026", title: "이월결손금 15년 — 손실난 해 신고로 미래 3,000만원 절세", description: "사업·양도 손실 15년 이월. 2025년 손실 1억 → 2026 이익 1.5억 시 절세 3,000만원. 가상자산은 5년만.", category: "세금", tags: ["이월결손금", "사업손실", "양도손실", "절세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: carryoverLoss, lang: "ko" },
  { slug: "tax-reduction-disabled-2026", title: "장애인 인적공제 200만원 + 의료비 무한도 — 매년 100~300만원 환급", description: "본인·부양가족 장애 등록 시 인적공제 200 + 의료비 한도 없음 + 보험료 100 + 교육비 무한도. 매년 100~300만원 추가 환급.", category: "세금", tags: ["장애인", "인적공제", "의료비", "보험료", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: taxReductionDisabled, lang: "ko" },
  { slug: "tax-amnesty-self-report-2026", title: "자진 수정신고 — 1개월 이내 가산세 90% 감면", description: "1개월 90% / 3개월 75% / 6개월 50% / 1년 30% / 2년 20% 감면. 무신고 시 20%, 부정 40%, 역외 60% 가산세.", category: "세금", tags: ["수정신고", "가산세", "감면", "세무조사", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: taxAmnestyReform, lang: "ko" },
  // 건강·의료 10편
  { slug: "out-of-pocket-limit-2026", title: "본인부담상한제 — 5분위 시 333만원 자동 환급", description: "1년 의료비 87~808만원 초과 시 다음해 8월 자동 환급. 5분위 직장인 500만원 부담 시 333만원 환급.", category: "기초", tags: ["본인부담상한제", "의료비", "환급", "건강보험", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: outOfPocketLimit, lang: "ko" },
  { slug: "orthodontics-tax-deduction-2026", title: "치아 교정 의료비 공제 — 500만원 시 52만원 환급", description: "부정교합 교정 100% 공제, 미관 단독은 부분 공제. 500만원 시 총급여 3% 초과분 350만원 × 15% = 52만원 환급.", category: "세금", tags: ["치아교정", "의료비공제", "부정교합", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: orthodonticsTax, lang: "ko" },
  { slug: "psychiatry-medical-deduction-2026", title: "정신과 의료비 공제 — 우울증·ADHD 상담 모두 포함", description: "진료비·처방약·검사비 모두 의료비 공제. 국세청 자료는 의료기관명·금액만 표시, 진료 내용은 비공개.", category: "세금", tags: ["정신과", "우울증", "의료비공제", "처방약", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: psychiatryDeduction, lang: "ko" },
  { slug: "industrial-accident-benefit-2026", title: "산업재해보상 — 의료비 100% + 휴업급여 70% + 장해연금", description: "업무 중 부상 시 의료비 무제한 + 휴업급여 평균임금 70% + 후유장해 연금. 임시·알바 모두 의무 가입.", category: "기초", tags: ["산재", "산업재해", "휴업급여", "장해연금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: industrialAccidentBenefit, lang: "ko" },
  { slug: "cancer-checkup-5-2026", title: "5대 암검진 — 본인부담 10% + 무료 검진", description: "위암(40+ 2년), 대장(50+ 1년), 간(40+ 6개월), 유방(40+ 2년), 자궁경부(20+ 2년). 본인부담 5천원~7천원.", category: "기초", tags: ["암검진", "건강검진", "위암", "대장암", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: cancerCheckup5, lang: "ko" },
  { slug: "real-life-insurance-combo-2026", title: "실비보험 + 의료비 공제 + 본인부담상한 — 5중 보상 전략", description: "실비 80~90% + 의료비 공제 15% + 본인부담상한제 환급 + 사내복지기금 + 실비 미보상분만 공제. 영수증 보관 필수.", category: "기초", tags: ["실비보험", "의료비공제", "본인부담상한", "이중보상", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: realLifeInsurance, lang: "ko" },
  { slug: "physical-therapy-tax-2026", title: "물리치료·도수치료 의료비 공제 — 60만원 도수치료 48만원 보상", description: "척추·관절 통증, 수술 후 재활, 한방 추나치료 의료비 공제. 도수치료 6회 60만원 + 실비 80% = 48만원 보상.", category: "세금", tags: ["물리치료", "도수치료", "한방치료", "의료비공제", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: physicalTherapy, lang: "ko" },
  { slug: "infertility-medical-20-percent-2026", title: "난임 시술비 의료비 공제 20% — 800만원 시 160만원 환급", description: "난임 시술비 공제율 20%(일반 15% +5%) + 한도 무제한. 시술 800만 + 일반 200 시 합산 163만원 환급.", category: "세금", tags: ["난임시술", "의료비공제", "시험관", "출산", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: infertilityTax, lang: "ko" },
  { slug: "dementia-insurance-2026", title: "치매보험 — 50~60대 가입 권장 + 부모 명의 12만원 환급", description: "경증 진단 500~1,000만원 + 중증 연금 200~300만원/월. 부모 명의 보험 본인 납입 시 12만원 환급.", category: "기초", tags: ["치매보험", "노후", "부모부양", "보험료공제", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: dementiaInsurance, lang: "ko" },
  { slug: "disability-insurance-2026", title: "장애인 보험료 한도 — 일반 100 + 장애인 100 합 24만원 환급", description: "일반 보장성 100만원 + 장애인 보장성 100만원 = 합산 200만원 한도. 12% 공제 = 최대 24만원 환급.", category: "세금", tags: ["장애인보험", "보험료공제", "보장성보험", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: handicapInsurance, lang: "ko" },
  // 자산관리·노후 10편
  { slug: "inheritance-tax-2026", title: "상속세 — 배우자 공제 활용 20억 상속 시 세금 0원", description: "1억 10%~30억 50% 누진. 일괄공제 5억 + 배우자 공제 최대 30억. 20억 상속 시 배우자 15억 받으면 세금 0원.", category: "부동산", tags: ["상속세", "배우자공제", "일괄공제", "절세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: inheritanceTax, lang: "ko" },
  { slug: "gift-vs-transfer-asset-2026", title: "증여 vs 양도 — 자산별 최적 이전 방법", description: "10억 주택 단순 증여 2.4억 vs 부담부증여 1.1억. 현금은 증여, 부동산은 부담부증여, 주식은 저평가 시기 증여.", category: "부동산", tags: ["증여", "양도", "부담부증여", "자녀이전", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: giftVsTransfer, lang: "ko" },
  { slug: "family-trust-2026", title: "가족 신탁 — 상속분쟁 예방 + 치매 대비 자산 관리", description: "본인 사후 자산 관리 의사 반영 + 상속분쟁 예방 + 치매 시 본인 보호. 수수료 연 0.5~1%.", category: "부동산", tags: ["가족신탁", "상속", "치매", "자산관리", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: familyTrust, lang: "ko" },
  { slug: "annuity-retirement-order-2026", title: "노후 자산 인출 순서 — ISA → IRP → 국민연금 → 주택연금", description: "1) ISA·청년도약 만기 비과세 → 2) 일반 펀드 → 3) IRP·연금저축 → 4) 국민연금 → 5) 주택연금. 세금 최소화.", category: "투자", tags: ["노후", "인출순서", "은퇴", "절세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: annuityRetirement, lang: "ko" },
  { slug: "reverse-mortgage-2026", title: "주택연금 — 만 70세 6억 주택 시 평생 월 180만원", description: "만 55세+ 1주택자 9억 이하. 부부 가입 시 평생 연금 + 사망 시 주택 처분으로 정산. 만 70세 6억 시 180만원/월.", category: "부동산", tags: ["주택연금", "역모기지", "노후", "1주택자", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: reverseMortgage, lang: "ko" },
  { slug: "retirement-home-strategy-2026", title: "은퇴 후 주거 4가지 전략 — 다운사이징 vs 지방 vs 시니어 vs 주택연금", description: "다운사이징 차액 4~6억, 지방 이전 8~10억, 시니어 타운 월 100~300만원, 주택연금 평생 연금.", category: "부동산", tags: ["은퇴주거", "다운사이징", "시니어타운", "노후", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: retirementHomePurchase, lang: "ko" },
  { slug: "life-expectancy-asset-2026", title: "60세 은퇴 30년 자산 — 월 250만원 시 6~9억 필요", description: "남자 84·여자 88세. 60세 은퇴 시 24~28년. 월 250만원 + 인플레 3% + 국민연금 차감 시 약 6~9억 필요.", category: "투자", tags: ["은퇴자산", "안전인출률", "노후준비", "FIRE", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: lifeExpectancyPlanning, lang: "ko" },
  { slug: "health-insurance-continue-after-retire-2026", title: "퇴직 후 임의계속가입 — 직장 보험료로 36개월 유지", description: "퇴직 후 2개월 이내 신청. 직장가입자 시절 본인+회사분 모두 본인 부담이지만 지역가입자 대비 50~70% 저렴.", category: "기초", tags: ["임의계속가입", "퇴직", "건강보험", "지역가입자", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: healthInsuranceContinue, lang: "ko" },
  { slug: "child-lifecycle-savings-2026", title: "자녀 0~30세 저축 로드맵 — 누적 1.5~2억 자녀 자산", description: "0세 2천 증여 + 5세 펀드 + 14세 청약 + 18세 청년주택드림. 30년 누적 1.5~2억 자녀 자산 + 부모 자산 효율적 이전.", category: "투자", tags: ["자녀저축", "증여", "청약", "청년주택드림", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: childLifecycleSavings, lang: "ko" },
  { slug: "property-downsizing-1home-2026", title: "다운사이징 1주택 비과세 — 15억 → 7억 차액 8억 노후자금", description: "강남 1주택 15억 매도(비과세 12억 + 80% 공제) → 강북 7억 매수. 차액 8억 노후 자금 + 양도세 200만원.", category: "부동산", tags: ["다운사이징", "1주택비과세", "양도세", "노후", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: propertyDownsizing, lang: "ko" },
  // 법률·실용 10편
  { slug: "rental-dispute-protection-2026", title: "임대차 분쟁 5가지 — 보증금 반환·묵시적 갱신·차임 인상", description: "보증금 30일 이내 반환 의무 + 5% 인상 상한 + 묵시적 갱신. 대항력·우선변제권 확보 + 분쟁조정위원회 무료.", category: "기초", tags: ["임대차", "보증금", "임차인권리", "분쟁조정", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: rentalDispute, lang: "ko" },
  { slug: "work-contract-check-7-2026", title: "근로계약서 필수 7항목 — 미체결 시 사업주 500만원 과태료", description: "임금구성·근무시간·휴일·4대보험·시용기간·해고절차·비밀유지. 미체결 시 사업주 500만 과태료 + 분쟁 시 직원 유리.", category: "커리어", tags: ["근로계약서", "근로기준법", "임금", "해고", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: workContractCheck, lang: "ko" },
  { slug: "dismissal-procedure-2026", title: "부당해고 — 3개월 이내 노동위원회 진정 + 복직 + 100% 보상", description: "정당 사유 + 30일 전 통지 필수. 부당해고 시 노동위원회 진정 → 복직 명령 + 그동안 임금 100% 보상.", category: "커리어", tags: ["해고", "부당해고", "노동위원회", "예고수당", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: dismissalProcedure, lang: "ko" },
  { slug: "wage-delayed-claim-2026", title: "임금체불 — 3년 시효 + 부가금 100% + 사업주 3년 징역", description: "원금 + 부가금(2배) + 지연이자 20% + 사업주 3년 이하 징역 또는 3,000만 벌금. 3년 시효 내 청구.", category: "커리어", tags: ["임금체불", "노동부", "부가금", "사업주처벌", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: wageDelayed, lang: "ko" },
  { slug: "sexual-harassment-protection-2026", title: "직장 내 성희롱 대응 — 사업주 1천만 과태료 + 손해배상", description: "증거 확보 → 회사 신고 → 노동부 → 형사 고소. 사업주 미이행 시 1천만 과태료 + 보복 금지 의무.", category: "커리어", tags: ["성희롱", "직장내괴롭힘", "노동부", "사업주의무", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: sexualHarassmentLaw, lang: "ko" },
  { slug: "overtime-proof-claim-2026", title: "야근수당 미지급 — 3년 누적 2,430만 + 부가금 4,860만 청구", description: "출퇴근·교통카드·이메일·카톡 증거 5가지. 월 30시간 미지급 시 3년 2,430만원 + 부가금 100% 시 4,860만원.", category: "커리어", tags: ["야근수당", "시간외수당", "노동부진정", "3년시효", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: overtimeProof, lang: "ko" },
  { slug: "annual-leave-refund-2026", title: "연차수당 — 미사용 일수 × 통상임금, 촉진 안 하면 무조건 지급", description: "1년 80%+ 출근 시 15일+ 연차. 미사용 시 일 통상임금 보상. 사업주 휴가 사용 촉진(7·10월 2회) 시 면제.", category: "커리어", tags: ["연차수당", "통상임금", "휴가사용촉진", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: annualLeaveRefund, lang: "ko" },
  { slug: "employer-blacklist-check-2026", title: "취업 전 회사 평판 조회 5채널 — 임금체불 명단까지", description: "잡플래닛·블라인드·크레딧잡·국세청 폐업·노동부 체불 명단. 별점 2.5 이하 회피, 체불 명단 절대 입사 X.", category: "커리어", tags: ["회사평판", "잡플래닛", "블라인드", "체불사업주", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: blacklistEmployer, lang: "ko" },
  { slug: "employment-insurance-detail-2026", title: "실업급여 — 평균임금 60%·최대 9개월 + 청년 6개월 보장", description: "고용보험 18개월 중 180일 이상 가입 + 비자발적 이직. 평균임금 250만원 시 7개월 1,554만원 수령.", category: "커리어", tags: ["실업급여", "고용보험", "구직급여", "권고사직", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: employmentInsurance, lang: "ko" },
  { slug: "voluntary-vs-recommended-resignation-2026", title: "권고사직 안전 절차 5단계 — \"일신상 사유\" 절대 금지", description: "권고사직 → 실업급여 가능. 단 \"일신상 사유\" 표현 거부 + \"경영상 이유\" 명시. 잘못 처리 시 약 1,000만원 손해.", category: "커리어", tags: ["권고사직", "자진퇴사", "실업급여", "사직서", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: employmentEstoppel, lang: "ko" },
  // 2026 정책 신설 10편
  { slug: "youth-monthly-rent-support-2026", title: "2026 청년 월세 한시 특별지원 — 월 20만원 × 12개월 = 240만원", description: "만 19~34세 무주택 + 본인 소득 중위 60% 이하 + 보증금 5천·월세 70만 이하. 복지로·주민센터 신청.", category: "부동산", tags: ["청년월세", "정부지원", "무주택", "특별지원", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: youthMonthlyRentSupport, lang: "ko" },
  { slug: "child-support-100-2026", title: "아동수당 — 만 0~7세 매월 10만원 + 부모급여 100만원 중복", description: "소득 무관 보편 지급. 만 0세 부모급여 100만/월 + 아동수당 10만 중복. 7년 누적 840만원.", category: "기초", tags: ["아동수당", "부모급여", "출산", "보편지급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: childSupport100, lang: "ko" },
  { slug: "basic-pension-65-2026", title: "기초연금 — 만 65세+ 단독 40만원·부부 64만원 매월", description: "소득 하위 70%. 단독 최대 40만 + 부부 동시 수령 시 각 20% 감액(32만씩 = 64만). 국민연금 수령자도 일부 가능.", category: "기초", tags: ["기초연금", "노후", "65세", "정부지원", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: basicPension2026, lang: "ko" },
  { slug: "seeking-job-benefit-2026", title: "2026 구직급여 — 청년 6개월 보장 + 정년 60세+ 3개월 추가", description: "평균임금 60%·상한 일 7.4만. 청년 30세 미만 최소 6개월 보장, 정년 60세+ 3개월 추가. 자영업도 가입 시 가능.", category: "커리어", tags: ["구직급여", "실업급여", "청년", "정년", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: seekingJobBenefit, lang: "ko" },
  { slug: "digital-nomad-visa-korea-2026", title: "한국 디지털 노마드 비자 — 연소득 8만 달러+ 외국인 IT 인재 유치", description: "외국 회사 원격 근무 + 연소득 8만 달러+ + 건강보험. 1+1년 체류. 한국 비거주자 분류로 한국 소득세 없음.", category: "커리어", tags: ["디지털노마드", "비자", "외국인", "원격근무", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: digitalNomadVisa, lang: "ko" },
  { slug: "childcare-support-comprehensive-2026", title: "자녀 1명 0~18세 정부 지원 총 6,000~7,000만원 — 단계별 정리", description: "0~1세 부모급여 + 아동수당, 2~7세 보육료 무료, 초등 돌봄, 중·고 학자금, 대학 청년주택드림. 누적 6~7천만원.", category: "기초", tags: ["육아지원", "아동수당", "보육료", "학자금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: childcareSupport, lang: "ko" },
  { slug: "elder-care-insurance-2026", title: "장기요양보험 — 부모 등급 받으면 월 50~200만원 서비스", description: "만 65+ 또는 노인성 질환. 등급별 시설·재가 서비스 본인부담 15~20%. 의료비 공제까지.", category: "기초", tags: ["장기요양보험", "요양시설", "재가서비스", "노인", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: elderCare, lang: "ko" },
  { slug: "veteran-benefit-2026", title: "국가유공자·보훈대상자 — 양도세 100% 감면 + 자녀 대학 무료", description: "양도세 100% 감면(5억 한도) + 취득세 50% + 의료비 본인부담 0 + 자녀 대학 등록금 + 보훈수당.", category: "기초", tags: ["국가유공자", "보훈", "양도세감면", "대학학자금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: veteranBenefit, lang: "ko" },
  { slug: "low-income-support-4benefits-2026", title: "기초생활보장 4종 — 4인 가구 생계 195만원/월 + 의료 무료", description: "생계·의료·주거·교육 4종 급여. 4인 가구 생계 195만원, 의료 본인부담 0~5%. 주민센터 또는 복지로 신청.", category: "기초", tags: ["기초생활보장", "저소득층", "생계급여", "의료급여", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: lowIncomeSupport, lang: "ko" },
  { slug: "energy-voucher-2026", title: "에너지바우처 — 4인 가구 30만원 + 여름/겨울 냉난방", description: "저소득층 7~9월·11~3월 사용. 1인 14만·2인 19만·3인 26만·4인+ 30만+. 전기·가스·등유·연탄 결제.", category: "기초", tags: ["에너지바우처", "냉난방비", "저소득층", "복지", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: energyVoucher, lang: "ko" },
];
