// src/lib/guides/hot-news-2026-extended.ts
//
// 11차 점검 — 추가 SEO 가이드 50편 (10차 31편에 이어).
// 청년·신혼부부 10, 부동산 심화 10, 직장인 세부 절세 10, 투자·재테크 10, 직업·이직 10.
// 운영자 명시 요청: 더 많은 검색 트래픽 확보.

import type { Guide } from "@/lib/guidesData";

// ═══════════════════════════════════════════════════════════════
// 카테고리 A — 청년·신혼부부 (10편)
// ═══════════════════════════════════════════════════════════════

const newlywedAssetTax = `
<p class="lead">신혼부부는 합산 자산을 활용해 단독보다 큰 절세 효과를 얻을 수 있습니다. 부부 각자 250만원 양도세 공제, 6억 증여세 비과세, 공동명의 종부세 12억 등 부부 합산 시 절감 한도가 2배가 됩니다.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">👫 신혼부부 절세 5가지 핵심</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 부부 합산 양도세 공제</strong>: 부부 각자 연 250만원 → 합산 500만원 비과세. 미국주식·해외주식 매도 시 부부 분할.</li>
<li><strong>② 6억 증여 비과세</strong>: 배우자 간 10년 6억 비과세. 부동산 공동명의 전환·자산 이전에 활용.</li>
<li><strong>③ 공동명의 종부세</strong>: 부부 공동명의 1주택은 각자 6억 공제 vs 단독 12억. 공시가 18억 이하는 단독 1주택자가 유리.</li>
<li><strong>④ 인적공제 활용</strong>: 부부 중 한 명이 무소득이면 인적공제 150만원 + 부모 부양 등록도 1인에게 몰기.</li>
<li><strong>⑤ 신용카드·의료비 합산</strong>: 의료비·교육비·신용카드는 한 명에게 몰아야 한도 빠르게 도달.</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li><li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산기</a></li></ul></div>
`;

const newlywedDidimdolVsBomgijari = `
<p class="lead">신혼부부 내집마련의 두 축은 디딤돌 대출과 보금자리론. 디딤돌은 1.6~3.3% 초저금리, 보금자리론은 한도 5~10억으로 더 크지만 금리 3.5~4%. 부부 소득·집값별로 어느 게 유리한지 비교합니다.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 디딤돌 vs 보금자리론 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">항목</th><th class="p-3">디딤돌</th><th class="p-3">보금자리론</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">금리</td><td class="p-3">1.6~3.3%</td><td class="p-3">3.5~4.0%</td></tr>
<tr class="border-t"><td class="p-3">한도</td><td class="p-3">최대 5억</td><td class="p-3">최대 10억</td></tr>
<tr class="border-t"><td class="p-3">소득 요건</td><td class="p-3">부부 1.3억 이하</td><td class="p-3">부부 1.3억 이하</td></tr>
<tr class="border-t"><td class="p-3">집값</td><td class="p-3">9억 이하</td><td class="p-3">12억 이하</td></tr>
<tr class="border-t"><td class="p-3">자녀 우대</td><td class="p-3">0.2%p × 자녀수</td><td class="p-3">최대 -0.4%p</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 5억 30년 부담 비교</h2>
<ul class="space-y-2 mt-4">
<li>· 디딤돌 1.6%: 월 175만원, 총이자 1.3억</li>
<li>· 보금자리론 3.5%: 월 224만원, 총이자 3.1억</li>
<li>· <strong>차이: 약 1.8억</strong> — 자격되면 디딤돌 압도적 유리</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/home-loan" class="text-primary underline">주택담보대출 계산기</a></li></ul></div>
`;

const youthSubscriptionGapyo5y = `
<p class="lead">청약 가점 만점 84점 = 무주택 32점(15년+) + 부양가족 35점(6인+) + 청약통장 17점(15년+). 청년이 5년 안에 가점을 빠르게 올리는 핵심 전략 5가지.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 5년 안에 가점 60점+ 만들기</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 청약통장 만 17점 (15년+)</strong>: 최소 24개월 + 240회 납입. 5년이면 60회 × 5년 = 300회 가능.</li>
<li><strong>② 무주택 가점 적립</strong>: 만 30세부터 무주택 점수 적립 시작. 5년이면 10점.</li>
<li><strong>③ 부양가족 등록</strong>: 부모 + 배우자 + 자녀 합산. 5인 가구면 25점.</li>
<li><strong>④ 특별공급 노리기</strong>: 청년 특공·신혼 특공·생애최초 특공은 가점보다 추첨/소득 위주.</li>
<li><strong>⑤ 청년주택드림 청약통장 전환</strong>: 만 19~34세는 우대금리 + 소득공제 + 대출 자격.</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/housing-subscription" class="text-primary underline">청약 가점 시뮬레이터</a></li></ul></div>
`;

const youthSubscriptionAccount = `
<p class="lead">청년우대형 주택청약종합저축은 만 19~34세 청년이 가입하는 일반 청약통장. 2024년 청년주택드림 청약통장 신설로 청년우대형은 신규 가입 불가. 기존 가입자는 자동 유지 + 만 34세까지 우대.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 청년우대형 vs 청년주택드림 비교</h2>
<ul class="space-y-2 mt-4">
<li>· 청년우대형: 최대 금리 3.3% + 소득공제 40% × 300만원</li>
<li>· 청년주택드림(신규): 최대 금리 4.5% + 소득공제 40% × 600만원 + 1.3억 대출 자격</li>
</ul>
<p>청년우대형 기존 가입자는 청년주택드림으로 전환 신청 가능. 더 큰 혜택을 위해 전환 권장.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 청년주택드림 5년 누적 효과</h2>
<ul class="space-y-2 mt-4">
<li>· 월 50만원 × 60개월 = 3,000만원</li>
<li>· 4.5% 이자: 약 350만원</li>
<li>· 소득공제 환급: 약 285만원 (5년 누적)</li>
<li>· 청년주택드림 대출 자격: 1.3억 (1년 + 1,000만원 납입 시)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/housing-subscription" class="text-primary underline">청약 시뮬레이터</a></li></ul></div>
`;

const newlywedDeduction = `
<p class="lead">신혼부부 첫 연말정산에서 가장 자주 놓치는 공제 5가지: 부부 합산 인적공제, 배우자 출산휴가, 신혼부부 첫 주택 취득세 감면, 결혼 비용 카드 사용, 양가 부모 합산 부양.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎁 신혼 첫 연말정산 5가지 핵심</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 무소득 배우자 인적공제 150만원</strong>: 배우자 연소득 100만원 이하면 등록.</li>
<li><strong>② 양가 부모 부양 등록</strong>: 처가·시가 부모 만 60세+ 무소득이면 각각 등록. 4명까지.</li>
<li><strong>③ 신혼 첫 주택 취득세 감면 최대 200만원</strong>: 생애최초 주택 구입 시.</li>
<li><strong>④ 결혼·예식·신혼여행 카드 사용 누적</strong>: 25% 초과분부터 공제. 한쪽에 몰아주기.</li>
<li><strong>⑤ 출산·산후조리원 의료비 200만원</strong>: 출산 1년 이내 카드결제분.</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const newlywedChildBirthBenefit = `
<p class="lead">자녀 출산 시 받는 세제·정부 지원: 출산휴가 + 6+6 육아휴직 정부지원금 합산 약 3,200만원, 자녀세액공제 연 30~70만원, 산후조리원 의료비 공제 200만원, 자녀장려금 최대 80만원.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">👶 자녀 1명 출산 시 합산 혜택</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>출산휴가 90일</strong> (산모): 통상임금 100%</li>
<li>· <strong>6+6 육아휴직</strong>: 부부 합산 최대 24개월, 약 3,200만원 정부지원</li>
<li>· <strong>자녀세액공제</strong>: 첫째 30만원·둘째 50만원·셋째+ 70만원/년 (8세부터)</li>
<li>· <strong>산후조리원 의료비 공제</strong>: 200만원 한도</li>
<li>· <strong>자녀장려금</strong>: 가구당 최대 80만원 (소득·자녀수 조건)</li>
<li>· <strong>출산축하금</strong>: 지자체별 50~500만원</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/parental-leave" class="text-primary underline">육아휴직 급여 계산기</a></li></ul></div>
`;

const youthAccountCombination = `
<p class="lead">청년이 가장 큰 절세·혜택을 얻으려면 청년도약계좌 + 청년주택드림 청약통장 + 청년형 장기집합투자증권저축 3가지를 동시 가입. 5년 누적 약 1,000만원+ 혜택.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 청년 3종 조합 5년 혜택</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 청년도약계좌</strong>: 정부기여금 144만원 + 비과세 99만원 = <strong>243만원</strong></li>
<li><strong>② 청년주택드림</strong>: 우대금리 250만원 + 소득공제 285만원 = <strong>535만원</strong></li>
<li><strong>③ 청년형 장기집합투자</strong>: 운용수익 비과세 108만원 + 소득공제 144만원 = <strong>252만원</strong></li>
<li><strong>합산 5년 혜택: 약 1,030만원</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 동시 가입 자격</h2>
<ul class="space-y-2 mt-4">
<li>· 청년도약: 만 19~34세, 연 7,500만원 이하</li>
<li>· 청년주택드림: 만 19~34세, 무주택 본인, 연 5,000만원 이하</li>
<li>· 청년형 장기투자: 만 19~34세, 총급여 5,000만원 이하</li>
<li>· 공통 자격 만족 시 3개 동시 가능</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/savings-interest-2026" class="text-primary underline">적금 이자 계산기</a></li></ul></div>
`;

const youthKpass = `
<p class="lead">2024년 5월 시작된 K-패스는 월 15회 이상 대중교통 이용 시 일반 20%, 청년 30%, 저소득층 53% 환급. 청년(만 19~34세) 월 8만원 사용 시 약 24,000원 환급 = 연 288,000원.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 K-패스 환급률 비교</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>일반</strong>: 20% (월 한도 약 60회)</li>
<li>· <strong>청년 (만 19~34세)</strong>: 30%</li>
<li>· <strong>저소득층</strong>: 53.3%</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 월 사용액별 환급</h2>
<ul class="space-y-2 mt-4">
<li>· 월 6만원(일반): 12,000원 환급 → 연 144,000원</li>
<li>· 월 8만원(청년): 24,000원 → 연 288,000원</li>
<li>· 월 10만원(저소득): 53,300원 → 연 639,600원</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 신청·사용</h2>
<ol class="space-y-2 mt-4">
<li>1. K-패스 앱 또는 카드사 앱에서 발급 (KB·신한·삼성·NH·하나·우리)</li>
<li>2. 신용/체크카드 형태로 발급</li>
<li>3. 매월 자동 환급 (사용 다음 달 말 카드 결제 청구액 차감)</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">대중교통 40% 공제 활용</a></li></ul></div>
`;

const newlywedLoanLimit = `
<p class="lead">신혼부부는 부부 합산 DSR 40%, LTV 70%로 대출 한도 계산. 단독 신청 대비 1.8~2.2배 한도 가능. 단 부부 모두 신용점수·소득증명 필요.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 부부 합산 한도 시뮬</h2>
<p>부부 합산 연소득 1.2억(각 6천), 무주택, 신용점수 850+ 가정:</p>
<ul class="space-y-2 mt-4">
<li>· DSR 40% → 연 4,800만원 원리금 가능</li>
<li>· 30년 4% 대출 가능: 약 8.5억</li>
<li>· LTV 70% 적용 시 12억 주택 매수 가능</li>
<li>· 단독(연 6천) 대비 약 2배 한도</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 주의 — 공동 채무자</h2>
<p>부부 공동 대출은 양쪽 모두 채무자가 되어 신용점수에 동일 영향. 이혼 시 공동 채무 정리 필요. 단독 명의 + 배우자 보증 형태가 더 유연.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/real-estate/dsr" class="text-primary underline">DSR 한도 계산기</a></li><li>· <a href="/home-loan" class="text-primary underline">주택담보대출 계산기</a></li></ul></div>
`;

const newlywedJointOwnership = `
<p class="lead">신혼부부 주택 공동명의 vs 단독명의 — 종부세·양도세·증여세 모두 다르게 적용. 일반적으로 공시가 18억 이하 1주택은 단독, 18억 초과 또는 2주택은 공동명의가 유리합니다.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 1주택 시 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">공시가</th><th class="p-3">단독명의</th><th class="p-3">공동명의(50:50)</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">10억</td><td class="p-3 text-emerald-600">0원</td><td class="p-3">0원(각 6억 공제)</td></tr>
<tr class="border-t"><td class="p-3">14억</td><td class="p-3">60만원</td><td class="p-3">0원(각 6억 = 12억 공제)</td></tr>
<tr class="border-t"><td class="p-3">18억</td><td class="p-3">180만원</td><td class="p-3">90만원</td></tr>
<tr class="border-t"><td class="p-3">24억</td><td class="p-3">480만원</td><td class="p-3">240만원</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 결정 기준</h2>
<ul class="space-y-2 mt-4">
<li>· 공시가 12억 이하: <strong>단독</strong>(12억 단일 공제로 종부세 0원)</li>
<li>· 12~18억: <strong>공동명의 유리</strong> (각 6억 = 12억 공제 + 분산)</li>
<li>· 18억+: <strong>공동명의 절대 유리</strong> (세금 분산)</li>
<li>· 2주택 이상: <strong>무조건 공동명의</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/property-holding-tax-2026" class="text-primary underline">부동산 보유세 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 B — 부동산 심화 (10편)
// ═══════════════════════════════════════════════════════════════

const gangnamVsGangbuk = `
<p class="lead">강남 1주택(공시가 20억) vs 강북 2주택(공시가 합산 16억) 보유세 비교. 일반적으로 같은 자산가치라도 1주택 집중이 다주택 분산보다 세금 부담 50~70% 적습니다.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 연 보유세 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">시나리오</th><th class="p-3">재산세</th><th class="p-3">종부세</th><th class="p-3">합계</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">강남 1주택 20억</td><td class="p-3">600만원</td><td class="p-3">240만원(12억 공제)</td><td class="p-3"><strong>840만원</strong></td></tr>
<tr class="border-t"><td class="p-3">강북 2주택 합 16억(각 8억)</td><td class="p-3">800만원(2채)</td><td class="p-3">1,200만원(공제 0)</td><td class="p-3"><strong>2,000만원</strong></td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 양도세까지 고려</h2>
<p>강남 1주택은 비과세 12억 + 80% 장기보유공제 가능. 강북 2주택은 양도세 일반세율 + 중과세 가능성. 5년 후 매도 시 강남 1주택이 압도적 유리.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/property-holding-tax-2026" class="text-primary underline">보유세 계산기</a></li></ul></div>
`;

const parcelRightVsOccupancyRight = `
<p class="lead">분양권은 입주 전 분양 계약의 권리, 입주권은 재개발·재건축에서 받은 권리. 두 경우 모두 주택 수에 포함되지만 양도세 계산 방식이 다릅니다.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 분양권 vs 입주권 세금 차이</h2>
<ul class="space-y-3 mt-4">
<li><strong>분양권 (조정대상지역)</strong>: 양도 시 일반 누진세율 + 70%(2년 미만)/60%(2년+) 단기 양도세</li>
<li><strong>입주권</strong>: 토지 부분은 일반세율, 건물 부분은 양도세. 보유 기간은 원조합원이 보유한 기간 합산</li>
<li><strong>주택 수 포함</strong>: 둘 다 종부세·양도세 계산에 주택 수로 인정</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 입주권 양도 시뮬</h2>
<p>재개발 입주권 매수가 5억, 양도가 8억, 보유 7년(원조합원 4년 + 본인 3년):</p>
<ul class="space-y-2 mt-4">
<li>· 차익 3억 × (1-장기보유공제 28%) = 약 2.16억 과세</li>
<li>· 양도세 약 6,800만원</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">부동산 양도세 계산</a></li></ul></div>
`;

const tempTwoHomeRule = `
<p class="lead">이사를 위해 잠시 2주택이 된 경우 일시적 2주택자 특례 적용. 종전 주택을 신규 주택 취득 후 3년 이내 매도하면 1주택자로 인정 = 12억 비과세.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 일시적 2주택 3년 룰 핵심</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 신규 주택 취득 후 3년 이내 종전 주택 매도</strong></li>
<li><strong>② 신규 주택은 1년 이상 보유 후 매도</strong></li>
<li><strong>③ 종전 주택은 2년 이상 보유 + 2년 거주(조정)</strong></li>
<li><strong>④ 종전 주택을 비과세 받으려면 매도 시점에 1주택만 보유 인정</strong></li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 함정 — 3년 초과 시 양도세 폭탄</h2>
<p>3년 1일 초과해서 종전 주택 매도 시 일시적 2주택 적용 X → 다주택자로 분류 → 비과세 0원 + 양도세 중과 가능성. 양도세 1억 → 3억 점프 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 안전 매도 일정</h2>
<p>신규 주택 잔금일 기준 정확히 3년 이내. 예: 2026.6.1 신규 취득 → 2029.5.31까지 매도 필수.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">양도세 계산</a></li></ul></div>
`;

const redevelopmentTax = `
<p class="lead">재건축·재개발 입주권 양도 시 토지·건물 분리 과세 + 청산금 추가 정산. 일반 주택 양도와 다른 복잡한 세금 구조라 사전 시뮬레이션 필수.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 재건축·재개발 양도세 3단계</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 사업시행 인가 전</strong>: 일반 주택 양도와 동일</li>
<li><strong>② 관리처분 후~준공</strong>: 입주권으로 분류, 보유기간 합산</li>
<li><strong>③ 준공 후 매도</strong>: 새 주택 + 일반 양도세 + 청산금 차익 별도 과세</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 청산금 차익 — 특수 항목</h2>
<p>재개발 시 추가 부담금이나 청산금이 발생. 매도 시 청산금 부분의 차익은 별도 양도세 적용. 양수받은 환급금도 과세 대상.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 매도 시점</h2>
<ul class="space-y-2 mt-4">
<li>· 관리처분 직전 매도: 일반 양도세, 비과세 12억 가능</li>
<li>· 준공 후 1세대 1주택 + 2년 보유: 12억 비과세</li>
<li>· 입주권 단계 매도: 단기 양도세 위험</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">양도세 계산</a></li></ul></div>
`;

const leaseRightTax = `
<p class="lead">전세권·임차권을 매매할 때도 양도세 발생. 일반 부동산 양도세와 달리 권리만 양도하므로 차익이 작지만, 신고 의무는 동일.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 임차권 양도 — 세금 계산</h2>
<p>전세권자가 전세권을 매매할 때 발생하는 차익(매도가 - 매수가)에 양도세. 일반세율 6~45% + 지방세 10%.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 사례</h2>
<p>전세권 5억(보증금)에 권리금 3,000만원 추가해 매수 → 3년 후 권리금 5,000만원에 매도. 차익 2,000만원에 양도세 발생. 보유 3년이라 단기 세율 45% 적용 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 임차권 양도 — 임대인 동의</h2>
<p>전세권은 등기되어 있어 임대인 동의 없이도 양도 가능. 단 일반 임차권(미등기)은 임대인 동의 없으면 양도 불가.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/property-holding-tax-2026" class="text-primary underline">부동산 보유세 계산기</a></li></ul></div>
`;

const farmlandForestTax = `
<p class="lead">농지·임야 양도세는 일반 주택과 다른 특례 적용. 자경 농지 8년 이상 보유 시 양도세 100% 감면(연 1억 한도). 산림 보유는 특수 농지로 분류돼 우대.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 자경 농지 8년 감면 요건</h2>
<ul class="space-y-2 mt-4">
<li>· 농지 소재지 또는 인접 시·군에 거주</li>
<li>· 8년 이상 직접 경작 (위탁 경작은 불가)</li>
<li>· 양도가액 연 1억 한도 감면 (초과분 정상 과세)</li>
<li>· 양도일로부터 5년 이내 농지로 전용 시 추징</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 임야 양도 — 일반 양도세</h2>
<p>임야는 농지가 아니라 일반 토지 양도세 적용. 비사업용 토지는 양도세 + 10%p 가산. 사업용 토지(임업·축산업 등록)는 일반 양도세.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">양도세 계산</a></li></ul></div>
`;

const commercialOfficeTax = `
<p class="lead">상가·오피스텔은 주택과 달리 양도세에 비과세 12억 한도가 없음. 모든 차익에 일반 양도세 + 지방세 적용. 다만 사업용 등록 시 일부 우대.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 상가 양도세 시뮬</h2>
<p>상가 7억 매수 → 12억 매도, 보유 10년:</p>
<ul class="space-y-2 mt-4">
<li>· 차익 5억</li>
<li>· 장기보유공제 30% (보유 10년)</li>
<li>· 과세표준 3.5억</li>
<li>· 양도세 약 1억 1,400만원 + 지방세 1,140만원 = <strong>약 1.25억</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 임대 부동산 등록</h2>
<p>임대사업자로 등록한 상가·오피스텔은 양도세 우대 적용 가능. 단 10년 이상 임대 유지 의무 등 조건 충족 필요.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">양도세 계산</a></li></ul></div>
`;

const burdenedGift = `
<p class="lead">부담부증여는 자녀에게 부동산을 증여하면서 그 부동산의 대출(채무)도 함께 넘기는 방식. 채무 인수분만큼은 양도세, 나머지는 증여세 적용으로 세금 분산 효과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 부담부증여 시뮬</h2>
<p>부모가 자녀에게 시가 10억 주택 + 대출 6억 증여:</p>
<ul class="space-y-2 mt-4">
<li>· 증여 부분: 10억 - 6억 = 4억 (증여세 약 6,000만원)</li>
<li>· 양도 부분: 채무 인수 6억 (부모 양도세 발생)</li>
<li>· <strong>단순 증여</strong> 10억일 때 증여세 약 2.4억 → <strong>부담부증여</strong>는 절반 이하</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 함정 — 자녀가 대출 상환 가능해야</h2>
<p>자녀 소득이 대출 원리금 상환을 감당할 수 있어야 함. 안 그러면 부모가 대신 상환 → 추가 증여로 간주.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산기</a></li></ul></div>
`;

const childGift50m = `
<p class="lead">자녀에게 10년 5,000만원(미성년자 2,000만원)까지 증여세 비과세. 매 10년마다 갱신되므로 어릴 때부터 분할 증여하면 평생 1억+ 비과세 자산 이전 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 자녀 증여 10년 룰</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>미성년 자녀</strong>: 10년 2,000만원 비과세</li>
<li>· <strong>성인 자녀</strong>: 10년 5,000만원 비과세</li>
<li>· <strong>10년 누적</strong>: 그 이전 증여분과 합산</li>
<li>· <strong>증여세 신고</strong>: 비과세라도 신고 의무 (증여일 다음달 말일까지)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 평생 비과세 증여 시뮬</h2>
<p>자녀 0살부터 시작:</p>
<ul class="space-y-2 mt-4">
<li>· 0~10세: 2,000만원</li>
<li>· 11~20세: 2,000만원</li>
<li>· 21~30세: 5,000만원 (성인)</li>
<li>· 31~40세: 5,000만원</li>
<li>· <strong>40년 누적: 1.4억 비과세</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 활용 전략</h2>
<p>증여한 자금으로 펀드·청약통장 등 운용 → 운용수익도 자녀 명의로 자산 형성. 부모 자산이 자녀에게 점진적 이전.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산기</a></li></ul></div>
`;

const rentalReportObligation = `
<p class="lead">2020년부터 주택임대소득 신고 의무화. 연 임대료 합계 2,000만원 이하라도 신고 필요(분리과세 선택). 미신고 시 가산세 + 다른 세금 추징 위험.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 임대소득 신고 의무</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>1주택자 + 9억 이하 + 임대료 2,000만원 이하</strong>: 비과세 (신고 면제)</li>
<li>· <strong>2주택 이상 + 임대료 발생</strong>: 신고 의무 (금액 무관)</li>
<li>· <strong>1주택 + 9억 초과 임대</strong>: 신고 의무</li>
<li>· <strong>1주택 + 임대료 2,000만원 초과</strong>: 신고 의무</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 미신고 시 가산세</h2>
<ul class="space-y-2 mt-4">
<li>· 무신고: 20% (단순 누락 10%)</li>
<li>· 납부불성실: 연 9.125%</li>
<li>· 5년 누적 추징 가능 — 원래 세액의 약 2~3배</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 신고 방법</h2>
<p>매년 5월 1~31일 종합소득세 신고 시 임대소득 포함. 분리과세(2,000만원 이하) 선택 가능. 등록임대주택은 별도 우대.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 C — 직장인 세부 절세 (10편)
// ═══════════════════════════════════════════════════════════════

const earnedIncomeDeduction = `
<p class="lead">근로소득공제는 총급여의 70%~5%(누진 차감)를 자동 적용하는 직장인 전용 공제. 한편 근로소득세액공제는 산출세액의 55~30%를 차감(한도 74만원). 두 공제로 직장인 평균 200~400만원 세금 절감.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 근로소득공제 — 자동 적용</h2>
<ul class="space-y-2 mt-4">
<li>· 총급여 500만원 이하: 70%</li>
<li>· 500~1,500만원: 350만 + 40%</li>
<li>· 1,500~4,500만원: 750만 + 15%</li>
<li>· 4,500~1억: 1,200만 + 5%</li>
<li>· 1억 초과: 1,475만 + 2%</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 근로소득세액공제 (산출세액 기준)</h2>
<ul class="space-y-2 mt-4">
<li>· 산출세액 130만원 이하: 55%</li>
<li>· 130만원 초과: 30%</li>
<li>· <strong>한도: 74만원</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 함정 — 한도 74만원</h2>
<p>연봉 1억 직장인은 산출세액이 커도 세액공제는 74만원 한도. 한도 도달 후에는 추가 세액공제(자녀·연금저축·기부금 등)로 환급 노림.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const standardDeductionVsSpecial = `
<p class="lead">연말정산에서 의료비·교육비·기부금 등 특별세액공제를 받지 않으면 표준세액공제 13만원을 일괄 적용. 특별공제가 13만원보다 작으면 표준 선택이 유리.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 표준 vs 특별 선택 기준</h2>
<p>특별세액공제 합계가 13만원 초과 시 특별, 미만이면 표준. 자동 비교 후 유리한 쪽 적용.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 사례</h2>
<ul class="space-y-2 mt-4">
<li>· 의료비 80만원 (15% 공제) = 12만원 → 표준 13만원이 유리</li>
<li>· 의료비 200만원 + 교육비 100만원 + 기부금 50만원 합산 시 약 50만원 공제 → 특별 선택</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 한 사람에게 몰아주기</h2>
<p>부부 중 한 명에게 의료비·교육비·기부금 몰아 결제하면 특별 한도 빠르게 도달. 다른 한 명은 표준 자동 적용.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const medicalEduDonation = `
<p class="lead">의료비·교육비·기부금 한도는 항목별 다름. 의료비 700만원, 교육비 본인 무제한·자녀 1인당 300~900만원, 기부금 100% 한도 종교는 10%까지.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 한도 상세</h2>
<ul class="space-y-3 mt-4">
<li><strong>의료비 15% 공제</strong>: 본인·부양가족 합산 700만원 한도 (난임시술·미숙아 등은 제한 없음)</li>
<li><strong>교육비 15% 공제</strong>: 본인 무제한, 자녀 유치원~고교 300만원, 대학 900만원</li>
<li><strong>기부금 15~30% 공제</strong>: 지정기부금 30% 한도, 종교단체 10% 한도</li>
<li><strong>주택자금 15% 공제</strong>: 청약저축 + 주택임차차입금 원리금</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 사례 — 직장인 5천만원</h2>
<ul class="space-y-2 mt-4">
<li>· 의료비 200만원 → 30만원 환급</li>
<li>· 교육비 600만원 → 90만원 환급</li>
<li>· 기부금 100만원 → 15만원 환급</li>
<li>· <strong>합산 135만원 환급</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const childEducationLimit = `
<p class="lead">자녀 교육비 세액공제 한도: 미취학 아동 300만원, 초·중·고 300만원, 대학·대학원 900만원. 학원비는 미취학·취학 전만 인정, 자녀 교복·체육복도 일부 포함.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 자녀 교육비 한도</h2>
<ul class="space-y-2 mt-4">
<li>· 미취학(0~7세): 300만원 (어린이집·유치원·학원·체육관)</li>
<li>· 초·중·고: 300만원 (수업료·교복·체육복·교과서·급식비)</li>
<li>· 대학·대학원: 900만원 (등록금·기숙사비)</li>
<li>· 본인: 무제한 (대학원 등록금 포함)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 학원비 — 취학 전만</h2>
<p>초등학교 입학 후 학원비는 공제 불가. 미취학 아동의 미술·음악·체육 학원은 OK. 단 학원비 영수증 보관 필수.</p>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 시뮬</h2>
<p>자녀 1명(대학생) 등록금 800만원 + 교복 30만원:</p>
<ul class="space-y-2 mt-4">
<li>· 공제 한도 900만원 내</li>
<li>· 15% 세액공제 = 124.5만원 환급</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const insurance100Limit = `
<p class="lead">보장성 보험료 세액공제 한도 100만원, 공제율 12% = 최대 12만원 환급. 종신·암·실손·자동차보험 모두 포함. 단 저축성 보험은 공제 대상 아님.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 공제 가능 보험 종류</h2>
<ul class="space-y-2 mt-4">
<li>· 종신보험·암보험·정기보험</li>
<li>· 실손의료보험</li>
<li>· 자동차보험(의무가입)</li>
<li>· 운전자보험</li>
<li>· 어린이보험</li>
<li>· 단 변액보험·연금보험·저축성 보험은 제외</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 환급 시뮬</h2>
<p>월 보험료 10만원(연 120만원) → 한도 100만원 × 12% = 12만원 환급</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 부양가족 보험료</h2>
<p>부모·배우자·자녀 명의 보험을 본인이 결제하면 본인 공제 가능. 단 본인이 계약자 + 결제자 + 피보험자 중 하나는 본인이어야 함.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const cardLimitDetail = `
<p class="lead">신용카드 등 사용액 소득공제는 결제 수단별 공제율과 한도가 모두 다름. 신용카드 15%, 체크/현금 30%, 전통시장·대중교통·도서공연 40%. 한도는 총급여별 200~300만원.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 한도 — 총급여별</h2>
<ul class="space-y-2 mt-4">
<li>· 7천 이하: 300만원</li>
<li>· 7천~1.2억: 250만원</li>
<li>· 1.2억 초과: 200만원</li>
<li>· 전통시장·대중교통·도서공연 각 100만원 추가 한도</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 최적 사용 비율</h2>
<p>25% 기준선 도달 전까지는 신용카드(포인트), 초과분은 체크카드·전통시장·대중교통. 본인 의지에 따라 50~100만원 추가 환급 가능.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const bookConcertDeduction = `
<p class="lead">도서·공연·박물관·미술관 사용액 30% 공제(별도 한도 100만원). 영화 티켓도 포함. 총급여 7천만원 이하 직장인에게 추가 절세 항목.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 공제 대상</h2>
<ul class="space-y-2 mt-4">
<li>· 도서 구매(서점·인터넷서점)</li>
<li>· 공연 티켓(콘서트·연극·뮤지컬·국악)</li>
<li>· 박물관·미술관 입장료</li>
<li>· 영화 티켓(2023년부터)</li>
<li>· 신문 구독료(일부)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>연 도서 50만원 + 공연 40만원 + 영화 30만원 = 120만원 사용:</p>
<ul class="space-y-2 mt-4">
<li>· 한도 100만원 적용</li>
<li>· 30% 공제 = 30만원</li>
<li>· 한계세율 24% 시 7.2만원 환급</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const eyewearHerbMedical = `
<p class="lead">의료비 공제는 일반 의료비뿐만 아니라 안경·렌즈·콘택트렌즈, 한약·한방치료, 임플란트·치과치료, 출산·산후조리원까지 포함. 영수증 보관이 절세 핵심.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 의료비로 인정되는 항목</h2>
<ul class="space-y-2 mt-4">
<li>· 안경·콘택트렌즈 (시력 교정 목적) — 연 50만원 한도</li>
<li>· 한약 (보약 아닌 처방한약)</li>
<li>· 한방치료·침</li>
<li>· 임플란트·치과·교정</li>
<li>· 출산·분만 의료비</li>
<li>· 산후조리원 (200만원 한도)</li>
<li>· 난임시술 (한도 없음, 20% 공제)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 제외 항목</h2>
<ul class="space-y-2 mt-4">
<li>· 미용 목적 시술(라미네이트·미백·필러)</li>
<li>· 건강기능식품·비타민</li>
<li>· 마사지·찜질방</li>
<li>· 보약(보양 목적 한약)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

const foreignFlatTax19 = `
<p class="lead">한국에 거주하는 외국인 근로자는 단일세율 19%를 선택 가능. 일반 누진세율(6~45%)과 비교해 유리한 쪽 선택. 연봉 8천만원+ 외국인 직장인에게 큰 절세.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 적용 요건</h2>
<ul class="space-y-2 mt-4">
<li>· 한국 거주 외국인 근로자</li>
<li>· 한국 거주 시작일로부터 5년간 적용</li>
<li>· 연말정산 시 또는 5월 종소세 신고 시 선택</li>
<li>· 19% 단일세율 + 지방소득세 1.9% = 총 20.9%</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 비교 — 연봉 1억</h2>
<ul class="space-y-2 mt-4">
<li>· 일반 누진세율: 약 1,500~1,800만원 세금</li>
<li>· 단일세율 19%: 1,900만원 + 지방세 = 약 2,090만원</li>
<li>· 일반 누진세율이 유리 (의외)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 유리한 구간</h2>
<p>연봉 약 2억+ 외국인은 단일세율 유리. 그 이하는 일반 누진세율(특히 공제·세액공제 받을 게 많으면) 유리.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/en/flat-tax" class="text-primary underline">Foreign Worker 19% Flat Tax (EN)</a></li></ul></div>
`;

const religiousDonation100 = `
<p class="lead">종교단체 기부금은 연소득의 10% 한도, 그 외 지정기부금은 30% 한도. 정치자금 기부는 100% 세액공제(10만원 한도) + 초과분 15%. 절세 효과 큰 기부 전략.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 기부금 한도</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>정치자금</strong>: 10만원까지 100% (그 외 15%)</li>
<li>· <strong>법정기부금</strong>: 종합소득의 100% (국가·지자체·재해구호)</li>
<li>· <strong>지정기부금</strong>: 종합소득의 30% (사회복지·교육·문화)</li>
<li>· <strong>종교단체</strong>: 종합소득의 10%</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>연소득 6,000만원 + 종교단체 기부 600만원:</p>
<ul class="space-y-2 mt-4">
<li>· 한도 = 6,000 × 10% = 600만원 (모두 인정)</li>
<li>· 15% 세액공제 = 90만원 환급</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 영수증 필수</h2>
<p>기부금 영수증 없으면 공제 불가. 종교단체·시민단체에 연말 영수증 요청 + 5년 보관.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 D — 투자·재테크 (10편)
// ═══════════════════════════════════════════════════════════════

const domesticVsOverseasEtf = `
<p class="lead">국내 상장 ETF는 매매차익 비과세(일반), 해외 ETF는 22% 양도세. 같은 S&P500이라도 TIGER 미국S&P500(국내 상장) vs SPY(미국 상장)는 세금 구조가 완전 다름.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 세금 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">항목</th><th class="p-3">국내 ETF</th><th class="p-3">해외 ETF</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">매매차익</td><td class="p-3 text-emerald-600">비과세 (일반)</td><td class="p-3">22% 양도세</td></tr>
<tr class="border-t"><td class="p-3">배당소득</td><td class="p-3">15.4% 분리</td><td class="p-3">15% 원천(미국)</td></tr>
<tr class="border-t"><td class="p-3">기본공제</td><td class="p-3">대주주 외 없음</td><td class="p-3">연 250만원</td></tr>
<tr class="border-t"><td class="p-3">손익통산</td><td class="p-3">불가</td><td class="p-3">가능</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 시뮬 — 5천만원 → 7천만원</h2>
<ul class="space-y-2 mt-4">
<li>· 국내 TIGER S&P500: 0원 세금</li>
<li>· 미국 SPY: (2,000 - 250) × 22% = 385만원 세금</li>
<li>· <strong>차이 385만원</strong> → 국내 ETF 압도적 유리</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산기</a></li></ul></div>
`;

const bondTax = `
<p class="lead">채권 투자 세금: 만기 시 원금 회수는 비과세, 이자·쿠폰은 15.4% 분리과세, 채권 자체를 매매한 차익은 비과세(일반). 다만 가산금리 채권·환매조건부채권(RP)은 다른 처리.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 채권 세금 구조</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>이자(쿠폰)</strong>: 15.4% 원천징수 분리과세</li>
<li>· <strong>만기 시 원금</strong>: 비과세</li>
<li>· <strong>장내 채권 매매차익</strong>: 비과세(일반인)</li>
<li>· <strong>외화채권 환차익</strong>: 일부 과세 (환차익 부분만)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 1억 국채 10년 5%</h2>
<ul class="space-y-2 mt-4">
<li>· 연 이자 500만원 × 15.4% = 77만원 세금</li>
<li>· 10년 누적 세금: 770만원</li>
<li>· 매매 시 차익은 비과세</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/bond-yield-quick" class="text-primary underline">채권 수익률 계산</a></li></ul></div>
`;

const reitsTax = `
<p class="lead">리츠(REITs)는 부동산 간접 투자 상품. 배당은 일반 주식과 동일하게 15.4% 분리과세, 매매차익은 국내 상장 리츠라 비과세(일반). 부동산 직접 보유 대비 세금이 매우 가벼움.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 리츠 vs 직접 부동산</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">항목</th><th class="p-3">리츠</th><th class="p-3">직접 부동산</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">매매차익</td><td class="p-3 text-emerald-600">비과세</td><td class="p-3">양도세 6~45%</td></tr>
<tr class="border-t"><td class="p-3">배당·임대수익</td><td class="p-3">15.4% 분리</td><td class="p-3">임대소득 종합과세</td></tr>
<tr class="border-t"><td class="p-3">보유세</td><td class="p-3 text-emerald-600">없음</td><td class="p-3">재산세·종부세</td></tr>
<tr class="border-t"><td class="p-3">취득세</td><td class="p-3 text-emerald-600">없음</td><td class="p-3">취득세 1~12%</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 5천만원 투자, 연 6% 배당</h2>
<ul class="space-y-2 mt-4">
<li>· 연 배당 300만원 × 15.4% = 46만원 세금</li>
<li>· 직접 부동산이라면 임대소득 종합과세 시 약 100~200만원</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
`;

const fundSellTiming = `
<p class="lead">펀드 매도 시점에 따라 세금이 달라짐. 국내 주식형 펀드 차익은 비과세(일반), 해외 주식형 펀드는 15.4% 분리과세, 채권형 펀드 분배금은 15.4%. 가입 전 펀드 유형 확인.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 펀드 유형별 세금</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>국내 주식형</strong>: 매매차익 비과세, 배당 15.4% 분리</li>
<li>· <strong>해외 주식형</strong>: 매매차익 15.4% 분리</li>
<li>· <strong>채권형</strong>: 분배금 15.4%</li>
<li>· <strong>혼합형</strong>: 자산 비율에 따라 다름</li>
<li>· <strong>ETF</strong>: 국내 상장 ETF는 일반 주식과 동일</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 매도 타이밍 — 분배락 직전 vs 직후</h2>
<p>펀드는 분기·반기 분배금 지급. 분배락 직전 매도 시 분배금 미포함 차익만 비과세 가능. 분배락 후 매도 시 분배금 포함되어 세금 발생.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식·펀드 세금 계산</a></li></ul></div>
`;

const childFundGift = `
<p class="lead">자녀 명의 펀드는 증여세 비과세 한도(미성년 2천, 성인 5천만원 / 10년) 내 자유 운용 가능. 운용수익도 자녀 자산으로 누적되어 세대 간 자산 이전 효과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 자녀 명의 펀드 절세</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 부모가 자녀에게 비과세 한도 증여</strong>: 미성년 2,000만원, 성인 5,000만원</li>
<li><strong>② 자녀 명의로 펀드 운용</strong>: 운용수익 자녀 명의로 누적</li>
<li><strong>③ 운용수익은 자녀 소득</strong>: 부모 종합소득과 합산 안 됨</li>
<li><strong>④ 10년마다 갱신</strong>: 매 10년 추가 증여 가능</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
<p>자녀 0세에 2,000만원 증여 → 연 7% 운용 → 18세 약 7,800만원. 그 사이 부모 종합소득과 분리되어 별도 절세.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산기</a></li></ul></div>
`;

const dividendVsGrowth = `
<p class="lead">배당주는 현금흐름 + 분기 배당세 부담. 성장주는 매매차익 비과세(국내). 같은 자산 운용 시 배당주 누적 세금이 성장주의 5~10배. 직장인 절세 관점에선 성장주 중심 권장.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 10년 운용 누적 세금</h2>
<p>1억 투자, 연 7% 가정:</p>
<ul class="space-y-2 mt-4">
<li>· <strong>배당주 (배당 4% + 성장 3%)</strong>: 매년 약 60만원 세금 × 10년 = 600만원</li>
<li>· <strong>성장주 (배당 0% + 성장 7%)</strong>: 매도 시점에만 세금. 국내라면 비과세.</li>
<li>· <strong>차이: 600만원</strong> (성장주 우위)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 전략</h2>
<p>배당주는 ISA·연금저축 계좌로 운용 → 비과세 또는 분리과세 우대. 성장주는 일반 계좌 OK. 미국 배당주는 ISA 비과세 한도 활용.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
`;

const usDividendWithholding = `
<p class="lead">미국 주식 배당금은 미국 정부가 15% 원천징수 후 한국에 입금. 한국에서 별도 15.4% 과세 시 이중 과세 문제. 한미 조세조약에 따라 미국 15%만 적용되고 한국 추가 과세 없음.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 미국 배당 세금 구조</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>미국 원천징수</strong>: 15% (한미조세조약)</li>
<li>· <strong>한국 추가 과세</strong>: 0% (이미 15% 납부 인정)</li>
<li>· <strong>실수령</strong>: 배당금 × 85%</li>
<li>· <strong>금융소득 종합과세 대상</strong>: 연 합계 2천만원 초과 시 종합 과세</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 시뮬</h2>
<p>미국 배당주 5천만원 보유, 연 배당 3% (150만원):</p>
<ul class="space-y-2 mt-4">
<li>· 미국 원천징수 15%: 22.5만원</li>
<li>· 한국 실수령: 127.5만원</li>
<li>· 한국 추가 세금: 0원 (이중과세 면제)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
`;

const fxGainTax = `
<p class="lead">환차익(외화 → 원화 환전 시 발생하는 이익)은 일반적으로 비과세. 단 외화예금·외화채권의 환차익은 일부 과세될 수 있음. 해외 자산 보유 시 환율 변동 활용 절세.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 환차익 과세 구분</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>외화 현금·예금 환차익</strong>: 비과세</li>
<li>· <strong>외화채권 환차익</strong>: 일부 과세(이자와 분리)</li>
<li>· <strong>해외주식 환차익</strong>: 매도 시 양도세에 포함</li>
<li>· <strong>해외부동산 환차익</strong>: 양도세에 포함</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 환차익 활용 절세</h2>
<p>달러 약세기에 미국주식 매도 시 환차익 부분만큼 양도차익이 줄어듦 → 양도세 절감 효과. 반대로 달러 강세기에 매수 시 동일 효과.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/global" class="text-primary underline">국가별 연봉 비교</a></li></ul></div>
`;

const p2pTax = `
<p class="lead">P2P 투자(온라인투자연계금융업) 수익은 이자소득으로 14% 원천징수 + 지방세 = 15.4%. 종합과세 한도(2천만원) 초과 시 종합소득세 합산. 일반 예금 이자와 동일 처리.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 P2P 투자 세금</h2>
<ul class="space-y-2 mt-4">
<li>· 이자수익 15.4% 원천징수</li>
<li>· 손실 발생 시 손익통산 불가(과세 결과는 그대로)</li>
<li>· 부도 발생 시 손실은 비용 인정 안 됨</li>
<li>· 연 합산 2천만원 초과 시 종합과세</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">⚠️ 리스크 — 원금 손실</h2>
<p>P2P는 예금자보호 대상 아님. 부도 시 원금 손실. 금융소득세는 따로 부과되므로 세금 + 원금 손실 이중 부담 가능.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/savings-interest-2026" class="text-primary underline">적금·예금 이자 계산기</a></li></ul></div>
`;

const bondFundDistribution = `
<p class="lead">채권형 펀드의 분배금은 이자성격이라 15.4% 분리과세. 매매차익도 일부 과세 가능. 채권 직접 보유와 비교해 분배금이 빈번한 단점이 있지만 분산투자 효과는 큼.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 채권형 펀드 세금</h2>
<ul class="space-y-2 mt-4">
<li>· 분배금(이자성): 15.4% 분리과세</li>
<li>· 매매차익: 일부 과세 (펀드 유형별)</li>
<li>· 분배락 시점: 분배금 빼고 매매하면 세금 회피 가능</li>
<li>· ISA·연금계좌 활용: 비과세 한도 활용</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 채권형 펀드 vs 채권 직접</h2>
<ul class="space-y-2 mt-4">
<li>· 직접: 만기 명확, 분배금 1~2회</li>
<li>· 펀드: 다양한 채권 분산, 분배금 자주</li>
<li>· 절세: 직접이 더 단순</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/savings-interest-2026" class="text-primary underline">적금·예금 이자 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 E — 직업·이직 (10편)
// ═══════════════════════════════════════════════════════════════

const severanceLumpVsIrp = `
<p class="lead">퇴직금 일시금 수령 vs IRP 이전 비교. 일시금은 즉시 사용 + 퇴직소득세 부과, IRP는 과세 이연 + 연금 수령 시 30~40% 세금 감면. 통상 IRP가 유리.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 1억 퇴직금 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">방식</th><th class="p-3">즉시 세금</th><th class="p-3">연금 수령 시</th><th class="p-3">총 세금</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">일시금</td><td class="p-3">약 1,000만원</td><td class="p-3">—</td><td class="p-3">1,000만원</td></tr>
<tr class="border-t"><td class="p-3">IRP 이전</td><td class="p-3">0원 (이연)</td><td class="p-3">10년 분할 시 약 600만원</td><td class="p-3">600만원</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 IRP 이전 권장 케이스</h2>
<ul class="space-y-2 mt-4">
<li>· 즉시 큰 자금이 필요 없는 경우</li>
<li>· 만 55세 이후 본격 수령 가능</li>
<li>· 운용 수익 누적 효과 큼</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/irp" class="text-primary underline">IRP 계산기</a></li><li>· <a href="/tools/finance/severance" class="text-primary underline">퇴직금 계산기</a></li></ul></div>
`;

const careerGapRehire = `
<p class="lead">경력단절 후 재취업 시 받는 세제 혜택: 고용촉진지원금 매월 30~80만원(최대 12개월) + 중소기업 취업 시 소득세 70% 감면 + 출산 후 재취업 우대.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 경력단절 우대 4가지</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 고용촉진지원금</strong>: 매월 30~80만원 × 6~12개월</li>
<li><strong>② 출산 후 재취업 우대</strong>: 만 18세 미만 자녀 양육 여성 우대</li>
<li><strong>③ 중소기업 취업자 감면</strong>: 만 34세 이하 또는 60세 이상 5년간 70~90% 감면</li>
<li><strong>④ 직업훈련 지원</strong>: 내일배움카드 최대 500만원</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li></ul></div>
`;

const taxFreeMealCommute = `
<p class="lead">비과세 식대 월 20만원 + 출퇴근 통신비 일부 비과세. 한 달에 약 25~30만원 비과세 → 연 300~360만원 세금 부담 없는 소득. 한계세율 24% 적용 시 약 72~86만원 세금 절감 효과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 비과세 항목</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>식대</strong>: 월 20만원 (외부 식사 또는 회사 제공 식대)</li>
<li>· <strong>출퇴근 통신비</strong>: 회사 업무용 일부 (월 5~10만원)</li>
<li>· <strong>자가운전보조금</strong>: 월 20만원 (본인 차량 업무 사용)</li>
<li>· <strong>일직·숙직 수당</strong>: 1일 5만원 한도</li>
<li>· <strong>실비변상적 급여</strong>: 출장비·일비·차량유지비</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 환산 효과</h2>
<p>월 비과세 30만원 = 연 360만원 → 한계세율 24% 시 86만원, 35% 시 126만원 세금 차이.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/" class="text-primary underline">연봉 실수령액 계산기</a></li></ul></div>
`;

const travelExpenseTax = `
<p class="lead">국내·해외 출장비는 실비 변상이라 비과세. 단 출장 일비를 정액으로 지급할 경우 일정 한도 초과분은 과세. 해외 출장은 비과세 한도가 국내보다 큼.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 출장비 비과세 범위</h2>
<ul class="space-y-2 mt-4">
<li>· 교통비·숙박비·식대(실비 영수증)</li>
<li>· 출장 일비 정액: 국내 1일 2만원, 해외 1일 5만원까지 비과세</li>
<li>· 초과 정액분은 근로소득으로 과세</li>
<li>· 출장수당(별도 인센티브)는 과세</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 해외 출장 시뮬</h2>
<p>1주일 해외 출장, 일비 정액 10만원:</p>
<ul class="space-y-2 mt-4">
<li>· 비과세 한도: 5만원 × 7일 = 35만원</li>
<li>· 과세분: 5만원 × 7일 = 35만원 (근로소득에 합산)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/" class="text-primary underline">연봉 실수령액 계산기</a></li></ul></div>
`;

const childTuitionTaxFree = `
<p class="lead">회사가 직원 자녀 학자금을 지원할 경우 일정 한도까지 비과세. 통상 사업주 학자금 지원금은 근로소득이지만, 사규에 명시된 사내복지기금 지원은 비과세 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 자녀 학자금 비과세</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>사내복지기금</strong>: 학자금 지원금 비과세</li>
<li>· <strong>회사 직접 지급 학자금</strong>: 일반적으로 근로소득(과세)</li>
<li>· <strong>대학원 학비</strong>: 본인 업무 관련 시 비과세</li>
<li>· <strong>주재원 자녀 학비</strong>: 해외 주재원 자녀 학교비 비과세</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">🎯 활용 — 사내복지기금 등록 회사</h2>
<p>대기업은 대부분 사내복지기금으로 학자금 지원. 입사 전 회사 복지 항목 확인. 자녀 1명 학자금 연 500만원 비과세 = 한계세율 35% 시 약 175만원 세금 차이.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/salary-db" class="text-primary underline">회사별 연봉·복지</a></li></ul></div>
`;

const bonusTiming = `
<p class="lead">성과급·인센티브 지급 시점에 따라 세금 부담 차이 큼. 같은 1,000만원 보너스라도 1월(연 시작)에 받으면 누진세율 낮은 구간에서 처리, 12월(연 말)에 받으면 누진세율 점프 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 시점별 세금 비교</h2>
<p>연봉 6,000만원 + 보너스 1,000만원:</p>
<ul class="space-y-2 mt-4">
<li>· 1월 지급: 1월부터 균등 가산 → 누진세율 24% 적용</li>
<li>· 12월 지급: 12월에 한 번에 가산 → 일시적 35%+ 점프 가능</li>
<li>· 연 합산 동일하지만 매월 실수령 변동성 큼</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 — 보너스 직전 IRP</h2>
<p>보너스 지급 직전 IRP·연금저축 900만원 만기 납입 → 한계세율 35~38% 구간에서 절세 효과 최대. 약 119~149만원 환급.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산기</a></li></ul></div>
`;

const executiveSeveranceLimit = `
<p class="lead">임원 퇴직금은 일반 직원과 달리 한도가 있음. 임원 직급별·연차별 한도 초과분은 근로소득으로 과세되어 누진세율 적용. 임원 퇴직 직전 IRP·연금저축 활용으로 절세.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 임원 퇴직금 한도</h2>
<ul class="space-y-2 mt-4">
<li>· 통상 일반 직원 퇴직금 × 3~5배</li>
<li>· 직급별·연차별 회사 정관 명시</li>
<li>· 한도 초과분: 근로소득으로 과세</li>
<li>· 부여 RSU·스톡옵션은 별도 처리</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 시뮬 — 임원 퇴직 5억</h2>
<ul class="space-y-2 mt-4">
<li>· 한도 내 3억: 퇴직소득세 약 3,000만원</li>
<li>· 한도 초과 2억: 근로소득 → 약 7,800만원 (한계세율 38%+)</li>
<li>· <strong>총 세금 약 1.08억</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/severance" class="text-primary underline">퇴직금 계산기</a></li></ul></div>
`;

const stockOptionExercise = `
<p class="lead">스톡옵션 행사 시점에 따라 세금 부담 큰 차이. 행사 시 행사가-시가 차익이 근로소득으로 과세, 매도 시 추가 양도세. 적격 스톡옵션은 양도세만 적용으로 절세 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 일반 vs 적격 스톡옵션</h2>
<ul class="space-y-3 mt-4">
<li><strong>일반 스톡옵션</strong>: 행사 시 차익 근로소득세(누진 35~45%) + 매도 시 양도세 22%</li>
<li><strong>적격 스톡옵션</strong>: 매도 시점 양도세 22%만 적용</li>
<li><strong>적격 요건</strong>: 부여 후 2년 + 행사 후 1년 보유 + 한도 등 조건 충족</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 시뮬 — 1억 차익</h2>
<ul class="space-y-2 mt-4">
<li>· 일반: 행사 근로소득세 3,800만원 + 매도 양도세 220만원 = 4,020만원</li>
<li>· 적격: 양도세 약 2,160만원만</li>
<li>· <strong>차이: 약 1,860만원</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
`;

const incentiveSplitPayout = `
<p class="lead">대형 인센티브를 한 번에 받으면 한계세율이 점프해 세금 부담 큼. 분할 지급 협상으로 누진세율 구간을 유지하면 같은 인센티브도 세금 30~50% 절감 가능.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 분할 vs 일시 시뮬</h2>
<p>인센티브 5,000만원, 연봉 8,000만원 가정:</p>
<ul class="space-y-2 mt-4">
<li>· <strong>일시 지급</strong>: 1억 3천 한 해 → 한계세율 35% + 일부 38% → 약 1,850만원 세금</li>
<li>· <strong>2년 분할</strong>: 각 1억 500 → 한계세율 35% 유지 → 약 1,500만원 (1,500 + 0)</li>
<li>· <strong>차이: 약 350만원 절감</strong></li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">🎯 회사와 협상</h2>
<p>인사팀과 분할 지급 협상 가능. 2~3년 분할 지급 시 회사도 세무상 이점 일부 있어 협상 가능성 큼.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산</a></li></ul></div>
`;

const overtimeNightHolidayTax = `
<p class="lead">야근·시간외·휴일 근로수당은 통상임금 기준 50% 가산. 모두 근로소득으로 과세되며 비과세 한도 없음. 단 생산직 직원의 연 240만원 야근수당은 비과세.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 수당별 가산율</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>시간외근로(8h 초과)</strong>: 50% 가산</li>
<li>· <strong>야간근로(22~06시)</strong>: 50% 가산</li>
<li>· <strong>휴일근로</strong>: 50% 가산 (8시간 초과분은 100%)</li>
<li>· <strong>중복 시</strong>: 야간 + 시간외 = 100% 가산</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 생산직 비과세 — 연 240만원</h2>
<p>생산직(공장 근로자 등) 야근수당은 연 240만원까지 비과세. 사무직은 해당 안 됨. 직급·직무별 확인.</p>

<h2 class="mt-12 text-2xl function-bold text-primary">⚠️ 포괄임금제 함정</h2>
<p>포괄임금제 근로계약 시 월 일정 시간(예: 20시간) 야근 수당 미리 포함. 그 이상은 추가 지급 의무. 미지급 시 노동부 진정.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/weekly-holiday-allowance-2026" class="text-primary underline">주휴수당 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// Export — 50개 가이드 통합
// ═══════════════════════════════════════════════════════════════

export const hotNewsExtended: Guide[] = [
  // 청년·신혼부부 10편
  { slug: "newlywed-asset-tax-saving-2026", title: "신혼부부 합산 자산 활용 절세 5가지 — 부부 합산 한도 2배 활용", description: "부부 각자 250만원 양도세 공제 + 6억 증여 비과세 + 공동명의 종부세 12억까지. 단독 대비 절세 한도 2배 활용.", category: "세금", tags: ["신혼부부", "절세", "공동명의", "증여세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedAssetTax, lang: "ko" },
  { slug: "newlywed-didimdol-bomgijari-2026", title: "신혼부부 디딤돌 vs 보금자리론 — 5억 30년 시 1.8억 절감", description: "디딤돌 1.6%·한도 5억 vs 보금자리론 3.5%·한도 10억. 부부 소득·집값별 유리한 상품 선택.", category: "부동산", tags: ["신혼부부", "디딤돌", "보금자리론", "주택대출", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedDidimdolVsBomgijari, lang: "ko" },
  { slug: "youth-subscription-60points-2026", title: "청약 가점 60점+ 5년 안에 만드는 5가지 전략", description: "청약통장 만 17점·무주택 10점·부양가족 25점 = 60점. 청년주택드림 + 특별공급 활용.", category: "부동산", tags: ["청약", "가점", "청년", "특별공급", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: youthSubscriptionGapyo5y, lang: "ko" },
  { slug: "youth-housing-dream-account-detail-2026", title: "청년우대형 vs 청년주택드림 청약통장 — 4.5% 금리 + 1.3억 대출", description: "청년주택드림 신규 가입 (만 19~34세) 최대 4.5% + 소득공제 600만원 + 1.3억 대출 자격. 5년 누적 635만원 혜택.", category: "부동산", tags: ["청년주택드림", "청약", "청년", "내집마련", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: youthSubscriptionAccount, lang: "ko" },
  { slug: "newlywed-deduction-first-year-2026", title: "신혼부부 첫 연말정산 5가지 — 양가 부모 부양·취득세 200만원", description: "무소득 배우자 인적공제 + 양가 부모 부양 + 신혼 첫 주택 취득세 감면 + 결혼 카드 사용 + 출산·산후조리원 의료비 200만원.", category: "세금", tags: ["신혼부부", "연말정산", "인적공제", "취득세", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: newlywedDeduction, lang: "ko" },
  { slug: "newlywed-child-birth-benefit-2026", title: "자녀 1명 출산 시 정부 지원 3,200만원 — 6+6 + 자녀세액공제 + 산후조리원", description: "출산휴가 90일 + 6+6 부모 육아휴직 3,200만원 + 자녀세액공제 30~70만원 + 산후조리원 200만원 + 자녀장려금 80만원.", category: "세금", tags: ["출산", "자녀", "정부지원", "육아휴직", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedChildBirthBenefit, lang: "ko" },
  { slug: "youth-3account-combination-2026", title: "청년 3종 조합 5년 1,030만원 혜택 — 도약계좌 + 주택드림 + 장기투자", description: "청년도약 243만원 + 청년주택드림 535만원 + 청년형 장기투자 252만원 = 5년 누적 1,030만원. 만 19~34세 동시 가입 가능.", category: "투자", tags: ["청년", "도약계좌", "주택드림", "장기투자", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: youthAccountCombination, lang: "ko" },
  { slug: "youth-k-pass-mass-transit-2026", title: "K-패스 대중교통 환급 — 청년 30% 연 28만원, 저소득층 53%", description: "월 15회+ 대중교통 이용 시 일반 20%·청년 30%·저소득 53% 환급. 청년 월 8만원 사용 시 연 28만원 환급.", category: "기초", tags: ["K-패스", "대중교통", "청년", "환급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: youthKpass, lang: "ko" },
  { slug: "newlywed-loan-limit-2x-2026", title: "신혼부부 대출 한도 부부 합산 — 단독 대비 2배 가능", description: "부부 합산 DSR 40% + LTV 70%. 부부 연 1.2억 시 8.5억 대출 + 12억 주택 매수 가능. 공동 채무자 리스크 점검 필수.", category: "부동산", tags: ["신혼부부", "대출 한도", "DSR", "LTV", "공동명의", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedLoanLimit, lang: "ko" },
  { slug: "newlywed-joint-ownership-2026", title: "신혼부부 공동명의 vs 단독명의 — 공시가 12억 기준 분기점", description: "1주택 공시가 12억 이하: 단독(12억 공제) / 12~18억: 공동명의(각 6억 합 12억) / 18억+: 공동명의 절대 유리.", category: "부동산", tags: ["신혼부부", "공동명의", "종부세", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedJointOwnership, lang: "ko" },
  // 부동산 심화 10편
  { slug: "gangnam-vs-gangbuk-prop-tax-2026", title: "강남 1주택 vs 강북 2주택 — 같은 자산 합 16억일 때 세금 1,160만원 차이", description: "강남 1주택 20억 보유세 840만원 vs 강북 2주택 합 16억 보유세 2,000만원. 1주택 집중이 다주택 분산 대비 50~70% 적은 세금.", category: "부동산", tags: ["보유세", "종부세", "1주택자", "다주택", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: gangnamVsGangbuk, lang: "ko" },
  { slug: "parcel-vs-occupancy-right-tax-2026", title: "분양권 vs 입주권 양도세 — 단기 양도세 70%·60% 점검", description: "분양권 단기 양도세 2년 미만 70%, 입주권 보유기간 합산(원조합원+본인). 8억 입주권 매도 시 양도세 약 6,800만원.", category: "부동산", tags: ["분양권", "입주권", "양도세", "재개발", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: parcelRightVsOccupancyRight, lang: "ko" },
  { slug: "temp-two-home-3year-rule-2026", title: "일시적 2주택 3년 룰 — 1일 초과 시 양도세 2~3억 점프", description: "신규 주택 취득 후 3년 이내 종전 주택 매도 시 1주택자 비과세 12억. 3년 1일 초과 시 다주택자 분류, 양도세 폭탄.", category: "부동산", tags: ["일시적2주택", "양도세", "비과세", "이사", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: tempTwoHomeRule, lang: "ko" },
  { slug: "redevelopment-tax-3-step-2026", title: "재건축·재개발 양도세 3단계 — 사업시행·관리처분·준공 시점별", description: "사업시행 전 일반 양도세, 관리처분~준공 입주권 보유기간 합산, 준공 후 새 주택 양도세 + 청산금 차익 별도.", category: "부동산", tags: ["재건축", "재개발", "양도세", "입주권", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: redevelopmentTax, lang: "ko" },
  { slug: "lease-right-transfer-tax-2026", title: "전세권·임차권 양도세 — 권리금 차익도 신고 의무", description: "전세권 매매 시 권리금 차익에 양도세 6~45%. 보유 3년 미만은 단기 세율 45%. 등기 전세권은 임대인 동의 없이 양도 가능.", category: "부동산", tags: ["전세권", "임차권", "양도세", "권리금", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: leaseRightTax, lang: "ko" },
  { slug: "farmland-forest-capital-gains-2026", title: "농지·임야 양도세 — 자경 8년 100% 감면 vs 비사업용 10%p 가산", description: "자경 농지 8년+ 거주 + 직접 경작 시 양도세 100% 감면(연 1억 한도). 비사업용 토지는 10%p 가산세 추가.", category: "부동산", tags: ["농지", "임야", "양도세", "자경", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: farmlandForestTax, lang: "ko" },
  { slug: "commercial-office-capital-gains-2026", title: "상가·오피스텔 양도세 — 7억→12억 매도 시 1.25억 부담", description: "상가·오피스텔은 비과세 12억 한도 없음. 차익 5억 + 장기보유공제 30% 시 약 1.25억 세금. 임대사업자 등록으로 우대 가능.", category: "부동산", tags: ["상가", "오피스텔", "양도세", "임대사업", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: commercialOfficeTax, lang: "ko" },
  { slug: "burdened-gift-strategy-2026", title: "부담부증여 — 시가 10억 + 대출 6억 증여 시 증여세 절반 이하", description: "자녀에게 부동산 + 대출 동시 이전. 증여 부분 4억만 증여세, 채무 인수 6억은 부모 양도세. 단순 증여 2.4억 → 6,000만원으로 절감.", category: "부동산", tags: ["부담부증여", "증여세", "양도세", "절세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: burdenedGift, lang: "ko" },
  { slug: "child-gift-10year-rule-2026", title: "자녀 증여 10년 룰 — 평생 1.4억 비과세 자산 이전", description: "미성년 10년 2,000만원, 성인 5,000만원 비과세. 자녀 0세부터 시작하면 40년 1.4억 비과세. 운용수익도 자녀 자산.", category: "부동산", tags: ["자녀증여", "증여세", "10년룰", "자산이전", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: childGift50m, lang: "ko" },
  { slug: "rental-report-obligation-2026", title: "주택임대 신고 의무 — 미신고 시 5년 추징 + 가산세 2~3배", description: "1주택 9억+ 또는 2주택+ 임대료 발생 시 신고 의무. 무신고 20% + 납부불성실 9.125%. 5월 종소세 신고 시 임대 포함.", category: "부동산", tags: ["임대신고", "임대소득", "가산세", "종소세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: rentalReportObligation, lang: "ko" },
  // 직장인 세부 절세 10편
  { slug: "earned-income-deduction-2026", title: "근로소득공제 + 근로소득세액공제 — 직장인 자동 200~400만원 절감", description: "근로소득공제(자동 적용 5~70%) + 근로소득세액공제(산출세액 55%·30%, 한도 74만원) = 직장인 자동 절세 200~400만원.", category: "세금", tags: ["근로소득공제", "근로소득세액공제", "직장인", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: earnedIncomeDeduction, lang: "ko" },
  { slug: "standard-vs-special-deduction-2026", title: "표준세액공제 13만원 vs 특별공제 — 의료비 80만원이면 표준 유리", description: "특별세액공제(의료비·교육비·기부금) 합계가 13만원 초과 시 특별, 미만이면 표준 자동 적용. 부부 한쪽 몰아주기로 한도 빠르게.", category: "세금", tags: ["표준세액공제", "특별세액공제", "의료비", "절세", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: standardDeductionVsSpecial, lang: "ko" },
  { slug: "medical-edu-donation-limits-2026", title: "의료비·교육비·기부금 한도 — 평균 직장인 135만원 환급", description: "의료비 15% 한도 700, 교육비 본인 무제한·자녀 300/900, 기부금 종교 10%·일반 30%. 5천만원 직장인 평균 135만원 환급.", category: "세금", tags: ["의료비공제", "교육비공제", "기부금공제", "한도", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: medicalEduDonation, lang: "ko" },
  { slug: "child-education-deduction-limit-2026", title: "자녀 교육비 공제 한도 — 미취학 300만원·대학 900만원", description: "미취학 300, 초중고 300, 대학·대학원 900만원 한도 15% 공제. 학원비는 미취학·취학 전만 인정. 자녀 1명 800만원 시 125만원 환급.", category: "세금", tags: ["자녀교육비", "공제", "대학등록금", "학원비", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: childEducationLimit, lang: "ko" },
  { slug: "insurance-100man-limit-2026", title: "보장성 보험료 100만원 한도 — 종신·암·실손·자동차 합산 12만원 환급", description: "한도 100만원 × 12% = 12만원 환급. 종신·암·정기·실손·자동차·운전자·어린이 보험 포함. 저축성·연금보험 제외.", category: "세금", tags: ["보험료공제", "종신보험", "실손보험", "자동차보험", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: insurance100Limit, lang: "ko" },
  { slug: "credit-card-deduction-limit-detail-2026", title: "신용카드 한도 상세 — 7천 이하 300만원·1.2억+ 200만원", description: "총급여별 한도 200~300만원 + 전통시장·대중교통·도서공연 각 100만원 추가. 25% 기준선 도달 후 체크·전통시장으로 전환.", category: "세금", tags: ["신용카드", "체크카드", "한도", "공제율", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: cardLimitDetail, lang: "ko" },
  { slug: "book-concert-museum-deduction-2026", title: "도서·공연·박물관·영화 30% 공제 — 100만원 한도 추가 환급", description: "총급여 7천 이하. 도서·공연·박물관·미술관·영화 티켓 30% 공제. 100만원 사용 시 한계세율 24% 약 7만원 추가 환급.", category: "세금", tags: ["도서공연비", "박물관", "영화", "공제", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bookConcertDeduction, lang: "ko" },
  { slug: "eyewear-herb-implant-medical-2026", title: "안경·한약·임플란트 의료비 — 종합 영수증으로 환급 극대화", description: "안경 50만 한도, 한약·한방, 임플란트·치과, 출산·산후조리원 200만 포함. 미용 목적·건강기능식품·마사지 제외.", category: "세금", tags: ["의료비공제", "안경", "한약", "임플란트", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: eyewearHerbMedical, lang: "ko" },
  { slug: "foreign-flat-tax-19-2026", title: "외국인 근로자 단일세율 19% — 연봉 2억+ 외국인에게 유리", description: "한국 거주 외국인 근로자 5년간 단일세율 19% + 지방세 = 20.9%. 연봉 2억+ 외국인에게 일반 누진세율 대비 유리.", category: "세금", tags: ["외국인", "단일세율", "Flat Tax", "근로자", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: foreignFlatTax19, lang: "ko" },
  { slug: "religious-donation-100-percent-2026", title: "기부금 한도 — 종교 10%·정치 10만원 100% 환급", description: "정치자금 10만원까지 100% 세액공제 + 초과분 15%. 법정 100%, 지정 30%, 종교 10% 한도. 5천만원 + 종교 600만원 시 90만원 환급.", category: "세금", tags: ["기부금공제", "종교단체", "정치자금", "법정기부금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: religiousDonation100, lang: "ko" },
  // 투자·재테크 10편
  { slug: "domestic-vs-overseas-etf-tax-2026", title: "국내 ETF vs 해외 ETF 세금 — 5천 → 7천 매도 시 385만원 차이", description: "같은 S&P500이라도 TIGER(국내) 비과세 vs SPY(미국) 22% 양도세. 2,000만원 차익 시 385만원 세금 차이. 국내 ETF 압도적 유리.", category: "투자", tags: ["ETF", "양도세", "S&P500", "TIGER", "SPY", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: domesticVsOverseasEtf, lang: "ko" },
  { slug: "bond-investment-tax-2026", title: "채권 투자 세금 — 이자 15.4% 분리, 매매차익 비과세", description: "1억 국채 10년 5% 보유 시 연 이자 500만원 × 15.4% = 77만원 세금, 10년 누적 770만원. 매매차익은 일반인 비과세.", category: "투자", tags: ["채권", "국채", "이자소득세", "분리과세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bondTax, lang: "ko" },
  { slug: "reits-tax-vs-direct-real-estate-2026", title: "리츠 vs 직접 부동산 — 5천 투자 연 6% 배당 시 46만원 세금만", description: "리츠 매매차익 비과세 + 배당 15.4% 분리 + 보유세 0원 + 취득세 0원. 직접 부동산 임대소득 종합과세 대비 50~70% 세금 절감.", category: "투자", tags: ["REITs", "리츠", "부동산", "배당세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: reitsTax, lang: "ko" },
  { slug: "fund-sell-timing-tax-2026", title: "펀드 매도 시점 — 분배락 전후 세금 차이", description: "국내 주식형 비과세, 해외 주식형 15.4%, 채권형 분배금 15.4%. 분배락 직전 매도 시 분배금 미포함으로 세금 회피 가능.", category: "투자", tags: ["펀드", "매도", "분배락", "분배금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: fundSellTiming, lang: "ko" },
  { slug: "child-fund-gift-strategy-2026", title: "자녀 명의 펀드 — 18세 7,800만원 만들기", description: "자녀 0세에 2,000만원 비과세 증여 → 연 7% 운용 → 18세 7,800만원. 부모 종합소득과 분리 운용으로 세대 간 자산 이전.", category: "투자", tags: ["자녀", "펀드", "증여세", "10년룰", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: childFundGift, lang: "ko" },
  { slug: "dividend-vs-growth-tax-2026", title: "배당주 vs 성장주 세금 — 10년 누적 600만원 차이", description: "1억 + 7% 운용 10년 시 배당주 누적 세금 600만원 vs 성장주 0원(국내). 배당주는 ISA·연금계좌로 운용 시 비과세.", category: "투자", tags: ["배당주", "성장주", "세금", "ISA", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: dividendVsGrowth, lang: "ko" },
  { slug: "us-dividend-withholding-15-2026", title: "미국 주식 배당 15% 원천징수 — 한국 추가 과세 0원", description: "한미조세조약으로 미국 15% 원천징수 후 한국 추가 과세 없음. 미국 배당주 5천만원 연 3% 시 22.5만원만 세금.", category: "투자", tags: ["미국주식", "배당", "원천징수", "조세조약", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: usDividendWithholding, lang: "ko" },
  { slug: "fx-gain-tax-2026", title: "환차익 세금 — 외화 현금·예금 비과세, 외화채권·해외주식은 일부 과세", description: "외화 현금·외화예금 환차익 비과세. 외화채권·해외주식·해외부동산 매도 시 환차익 양도세에 포함. 환율 활용 절세 가능.", category: "투자", tags: ["환차익", "외화", "양도세", "환율", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: fxGainTax, lang: "ko" },
  { slug: "p2p-investment-tax-2026", title: "P2P 투자 세금 — 15.4% + 손실 시 손익통산 불가", description: "P2P 이자 15.4% 원천징수 + 종합과세 한도 2천만원 초과 시 종합. 부도 시 손실 비용 인정 안 됨 + 예금자보호 대상 아님.", category: "투자", tags: ["P2P", "이자소득", "온라인투자", "리스크", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: p2pTax, lang: "ko" },
  { slug: "bond-fund-distribution-tax-2026", title: "채권형 펀드 분배금 — 15.4% 분리, ISA 활용 시 비과세", description: "채권형 펀드 분배금 15.4% 분리과세 + 매매차익 일부 과세. ISA·연금계좌 활용 시 비과세 한도 활용 가능.", category: "투자", tags: ["채권형펀드", "분배금", "ISA", "분리과세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bondFundDistribution, lang: "ko" },
  // 직업·이직 10편
  { slug: "severance-lump-vs-irp-2026", title: "퇴직금 일시금 vs IRP — 1억 퇴직금 시 400만원 절감", description: "일시금 즉시 세금 1,000만원 vs IRP 이전 + 10년 연금 600만원. 만 55세부터 수령 + 운용수익 누적까지 IRP 우위.", category: "커리어", tags: ["퇴직금", "IRP", "연금수령", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: severanceLumpVsIrp, lang: "ko" },
  { slug: "career-gap-rehire-benefit-2026", title: "경력단절 후 재취업 — 정부지원 4가지 + 중소기업 감면 70%", description: "고용촉진지원금 월 30~80만원 × 6~12개월 + 출산 후 재취업 우대 + 중소기업 취업 소득세 70% 감면 + 직업훈련 500만원.", category: "커리어", tags: ["경력단절", "재취업", "고용촉진", "중소기업감면", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: careerGapRehire, lang: "ko" },
  { slug: "tax-free-meal-commute-2026", title: "비과세 식대 20만원 + 통신비 — 연 360만원 세금 부담 없는 소득", description: "월 비과세 식대 20만원 + 통신비 5~10만원 + 자가운전 20만원 + 일직수당. 연 360만원 비과세 → 한계세율 24% 시 86만원 절감.", category: "연봉", tags: ["비과세", "식대", "통신비", "자가운전", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: taxFreeMealCommute, lang: "ko" },
  { slug: "business-trip-expense-tax-2026", title: "출장비 비과세 — 국내 1일 2만원·해외 1일 5만원", description: "실비 영수증 출장비 비과세. 일비 정액은 국내 2만원·해외 5만원까지. 초과분은 근로소득으로 과세.", category: "연봉", tags: ["출장비", "일비", "비과세", "해외출장", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: travelExpenseTax, lang: "ko" },
  { slug: "child-tuition-tax-free-2026", title: "자녀 학자금 비과세 — 사내복지기금 vs 회사 직접 지급", description: "사내복지기금 학자금 지원 비과세 + 본인 대학원 업무 관련 비과세 + 해외 주재원 자녀 학비 비과세. 연 500만원 = 175만원 절감.", category: "연봉", tags: ["자녀학자금", "사내복지기금", "비과세", "주재원", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: childTuitionTaxFree, lang: "ko" },
  { slug: "bonus-payout-timing-2026", title: "성과급 지급 시점 절세 — 12월 vs 1월 누진세율 점프", description: "1,000만원 보너스 1월 vs 12월 지급 차이. 보너스 직전 IRP 900만원 만기 납입으로 한계세율 35~38% 구간 환급 119~149만원.", category: "세금", tags: ["성과급", "보너스", "한계세율", "IRP", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: bonusTiming, lang: "ko" },
  { slug: "executive-severance-limit-2026", title: "임원 퇴직금 한도 초과분 — 5억 퇴직 시 1.08억 세금", description: "임원 퇴직금 한도는 일반 직원 × 3~5배. 한도 내 퇴직소득세 + 한도 초과분 근로소득세 누진세율. 5억 퇴직 시 약 1.08억 세금.", category: "커리어", tags: ["임원", "퇴직금", "한도초과", "근로소득세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: executiveSeveranceLimit, lang: "ko" },
  { slug: "stock-option-exercise-timing-2026", title: "스톡옵션 행사 시점 — 일반 vs 적격 시 1,860만원 차이", description: "일반 스톡옵션: 행사 시 근로소득세 + 매도 양도세 22%. 적격 스톡옵션: 매도 시 양도세만. 1억 차익 시 1,860만원 절감.", category: "주식", tags: ["스톡옵션", "행사", "적격스톡옵션", "양도세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: stockOptionExercise, lang: "ko" },
  { slug: "incentive-split-payout-2026", title: "인센티브 분할 지급 협상 — 5천만원 일시 vs 2년 분할 350만원 절감", description: "인센티브 5,000만원 일시 지급 시 1,850만원 세금 vs 2년 분할 1,500만원. 인사팀 협상으로 분할 가능, 350만원 절감.", category: "연봉", tags: ["인센티브", "분할지급", "절세", "협상", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: incentiveSplitPayout, lang: "ko" },
  { slug: "overtime-night-holiday-pay-2026", title: "야근·휴일·시간외 수당 — 50% 가산 + 생산직 연 240만원 비과세", description: "8시간 초과·22~6시 야간·휴일 근로 50% 가산. 야간+시간외 중복 시 100%. 생산직 연 240만원 야근수당 비과세. 포괄임금제 함정 점검.", category: "연봉", tags: ["야근수당", "휴일근로", "시간외수당", "포괄임금제", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: overtimeNightHolidayTax, lang: "ko" },
];
