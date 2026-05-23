// src/lib/guides/hot-news-2026-may.ts
//
// 10차 점검 — 검색량 높은 핫이슈 31개 SEO 가이드.
// 삼성전자 임금협상 현황 1편 + 금융 핫이슈 30편.
// 운영자 명시 요청: SEO 초대박 유입 노림.
// 각 가이드는 자동으로 사이트맵 + /guides 인덱스에 노출됨.

import type { Guide } from "@/lib/guidesData";

// ═══════════════════════════════════════════════════════════════
// 1. 삼성전자 임금협상 현황
// ═══════════════════════════════════════════════════════════════
const samsungWageStatus = `
<p class="lead">
2026년 삼성전자 임금협상이 5월 12일 본격적으로 시작됐습니다. 사측과 노조(전국삼성전자노동조합)는 기본급 인상률, OPI 산정 기준 변경, TAI 통합, 복지포인트·학자금 확대 4대 쟁점을 두고 본교섭에 들어갔습니다. 메모리 업황 회복으로 PS(Performance Sharing)가 다시 사업부별로 차이가 벌어지고 있어, 인상률 협상에 큰 변수가 됩니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🔥 5월 12일 본교섭 5대 쟁점</h2>
<ul class="space-y-3 mt-4">
<li><strong>1. 기본급 인상률</strong>: 노조 측은 작년 5.1% 인상 대비 6% 이상을 요구. 사측은 4.5~5% 선에서 협의 가능성. 격차 1.5%p가 핵심.</li>
<li><strong>2. OPI 산정 기준 변경</strong>: 메모리 사업부 OPI는 영업이익 연동. HBM3E 본격 출하로 2026년 OPI 한도 50% 가능성. 단 사업부별 격차 확대 우려.</li>
<li><strong>3. TAI 통합 논의</strong>: TAI(목표달성장려금)와 OPI를 단일 성과급 체계로 통합하는 방안. 평가 단순화는 좋지만 사업부 간 형평성 이슈.</li>
<li><strong>4. 복지포인트 확대</strong>: 현재 연 100만원 → 150만원 인상 요구. 카페테리아식 자유 사용 확대.</li>
<li><strong>5. 자녀 학자금 한도</strong>: 자녀 대학 등록금 전액 → 대학원·해외 유학까지 확대 검토.</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📅 협상 일정 & 변수</h2>
<p>
5월 12일 본교섭을 시작으로 매주 1회 협상 진행. 통상 7~8월에 잠정합의안 도출 후 조합원 투표를 거쳐 9월 타결되는 것이 일반적입니다. 다만 2024~2025년 임금협상 결렬·파업 사례가 있어, 2026년에도 변수 발생 가능성 상존.
</p>
<p>
가장 큰 외부 변수는 <strong>HBM3E 12-Hi 양산 안정화 시점</strong>입니다. NVIDIA 공급 본격화 시 메모리 사업부 영업이익이 분기 5조원+ 가능. 이 경우 PS 1,000% 이상도 가능해 협상의 핵심 카드가 됩니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 직원 입장에서 챙길 3가지</h2>
<ol class="space-y-3 mt-4">
<li><strong>① OPI 시점 절세</strong>: 1월·7월 OPI 지급 직전 IRP·연금저축에 추가 납입하면 한계세율 35~38% 구간에서 효과 큼. 최대 900만원 → 환급 약 119~149만원.</li>
<li><strong>② RSU·ESPP 행사 시점</strong>: ESPP 할인분 + 자사주 양도세 22%(해외주식)는 1년 250만원 공제 활용. 분할 매도 권장.</li>
<li><strong>③ 협상 결과 즉시 반영</strong>: 합의안 조합원 투표 통과 후 소급분이 한 번에 지급되므로, 그달 종합소득세 한계세율 점프 주의.</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/calc/samsung-bonus" class="text-primary underline">삼성전자 성과급 계산기 (OPI·TAI 듀얼)</a></li>
<li>· <a href="/samsung-negotiation-2026" class="text-primary underline">삼성 임금협상 가이드 페이지</a></li>
<li>· <a href="/income-tax-2026" class="text-primary underline">2026 종합소득세 계산기</a></li>
<li>· <a href="/tools/finance/irp" class="text-primary underline">IRP·연금저축 세액공제 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 2. SK하이닉스 2026 PS 성과급 전망
// ═══════════════════════════════════════════════════════════════
const skHynixPS2026 = `
<p class="lead">
2025년 4분기 SK하이닉스가 분기 영업이익 약 12조원을 기록하며 HBM 시장을 사실상 독점한 결과, 2026년 PS(생산성격려금) 최고치 갱신 기대가 커지고 있습니다. 통상 PS는 기본급 대비 1,000%(=10개월치)가 한도지만, 2025년 메모리 사업부 PS 1,500% 사례 이후 2026년에는 더 큰 폭이 가능하다는 전망입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 2025 vs 2026 PS 비교</h2>
<div class="overflow-x-auto my-6">
<table class="w-full text-sm border border-border">
<thead class="bg-secondary"><tr><th class="p-3 text-left">항목</th><th class="p-3 text-left">2025년</th><th class="p-3 text-left">2026년 전망</th></tr></thead>
<tbody>
<tr class="border-t"><td class="p-3">연간 영업이익</td><td class="p-3">약 25조원</td><td class="p-3">약 40조원+</td></tr>
<tr class="border-t"><td class="p-3">PS 한도</td><td class="p-3">기본급 1,500%</td><td class="p-3">기본급 2,000% 가능성</td></tr>
<tr class="border-t"><td class="p-3">HBM 점유율</td><td class="p-3">약 50%</td><td class="p-3">약 50% 유지(삼성 추격)</td></tr>
</tbody>
</table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💸 PS 1,500% 시 실수령액</h2>
<p>
기본급 5,000만원 직원이 PS 1,500% 받으면 7,500만원 추가 지급. 단 성과급은 종합소득세 누진세율 적용으로 한계세율 35~38% 구간 → 실수령 약 4,650~4,875만원. 추가로 4대보험 상한선 적용 후 실제 통장 입금액은 더 낮을 수 있습니다.
</p>
<p>
<strong>절세 전략</strong>: 지급 직전 월 IRP·연금저축 900만원 만기 납입 → 약 119~149만원 환급. 또한 비과세 식대 20만원 100% 활용 + 부양가족 인적공제 1인 150만원도 동시 적용.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 변수 — 메모리 사이클 후반</h2>
<p>
2025~2026년 메모리 슈퍼사이클의 끝이 언제냐가 관건. AI 수요가 지속되면 2027년까지 PS 고점 유지 가능. 반면 NAND 가격 급락이나 HBM 경쟁 심화 시 2026 4분기부터 둔화 가능성. 사이클 후반에는 PS가 절반 이하로 줄 수 있어 자산 배분 전략이 중요합니다.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/salary-db/sk-hynix" class="text-primary underline">SK하이닉스 연봉 상세 페이지</a></li>
<li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산기</a></li>
<li>· <a href="/income-tax-2026" class="text-primary underline">2026 종합소득세 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 3. LG에너지솔루션 2026 임금협상
// ═══════════════════════════════════════════════════════════════
const lgensolWage2026 = `
<p class="lead">
2026년 배터리 시장은 전기차 캐즘(일시적 정체)을 지나 다시 회복 국면. LG에너지솔루션은 GM·현대차·도요타와의 합작 확대와 ESS(에너지저장장치) 시장 진입으로 매출 성장 재시작. 이에 따라 2026년 임금협상도 인상률 5%+ 가능성이 거론됩니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 LG엔솔 직급별 영끌 연봉(2026 추정)</h2>
<ul class="space-y-2 mt-4">
<li><strong>신입</strong>: 영끌 약 5,500~6,500만원 (기본급 4,800만원 + 성과급)</li>
<li><strong>대리(주니어)</strong>: 약 7,000~8,500만원</li>
<li><strong>과장(시니어)</strong>: 약 9,500~12,000만원</li>
<li><strong>부장·팀장</strong>: 약 13,000~18,000만원</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 2026 임금협상 3대 쟁점</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 기본급 인상률 5%+</strong>: 캐즘 종료 + ESS 매출 본격화로 인상 명분 확보. 단 미국 현지 공장 확대 비용 부담 변수.</li>
<li><strong>② 변동 성과급 비중 확대</strong>: 사업부별 성과 격차 반영 — 미국·유럽 사업부 vs 한국 본사 격차 확대 우려.</li>
<li><strong>③ 미국 현지 파견 인센티브</strong>: 미시간 합작공장 파견자 대상 주거비·자녀학자금 등 인센티브 확대.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 2차전지 직무 가치 — 5년 후 전망</h2>
<p>
2030년까지 글로벌 EV 시장 연 18% 성장 전망(IEA). LG엔솔·삼성SDI·SK온 3사 합산 인력 수요는 5년간 약 5만명 추가 채용 예상. 배터리 셀 설계·BMS·소재 분야는 신입 영끌 7,000만원 + 시니어 1.5억까지 가능.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/salary-db/lgensol" class="text-primary underline">LG에너지솔루션 연봉 상세</a></li>
<li>· <a href="/industry/battery" class="text-primary underline">배터리 업계 연봉 순위</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 4. 카카오 RSU 5년 베스팅 양도세 절세
// ═══════════════════════════════════════════════════════════════
const kakaoRsuTax = `
<p class="lead">
카카오 임직원에게 부여되는 RSU(Restricted Stock Unit)는 4~5년 베스팅 구조. 베스팅된 주식을 매도할 때 양도세 22%(소득세 20% + 지방소득세 2%)가 부과되며, 1년 250만원 기본공제와 손익 통산으로 절세 가능합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 RSU 베스팅 단계별 세금</h2>
<p>
<strong>1단계 — 베스팅 시점(근로소득세 부과)</strong>: 베스팅된 주식 시가만큼이 근로소득으로 잡혀 원천징수됨. 한계세율 35~38% 적용 시 시가의 약 38.5% 세금.
</p>
<p>
<strong>2단계 — 매도 시점(양도세)</strong>: 매도가에서 베스팅 시점 시가를 뺀 차익에 22% 양도세. 1년 250만원 기본공제. 즉 차익 500만원이면 (500-250) × 22% = 55만원.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 RSU 1억 매도 시 절세 5가지</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 분할 매도</strong>: 연 250만원 공제 활용 — 4년에 나눠 매도하면 1,000만원 공제 효과</li>
<li><strong>② 손익 통산</strong>: 같은 해 손실 종목과 통산해 과세표준 줄이기</li>
<li><strong>③ 부부 합산</strong>: 배우자 명의로 일부 증여 후 매도 (증여세 비과세 한도 6억 활용)</li>
<li><strong>④ 베스팅 직후 매도</strong>: 시가 = 매도가 → 차익 0원으로 양도세 회피 (단 가격 하락 리스크)</li>
<li><strong>⑤ 이월결손금 활용</strong>: 작년 손실분을 10년간 이월 가능</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산기</a></li>
<li>· <a href="/salary-db/kakao" class="text-primary underline">카카오 연봉 상세</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 5. 토스 비상장 RSU 양도세
// ═══════════════════════════════════════════════════════════════
const tossRsuTax = `
<p class="lead">
토스(비바리퍼블리카)는 비상장 회사라 RSU가 베스팅돼도 즉시 매도가 어렵습니다. 2026년 IPO 가시화로 임직원 RSU 가치가 다시 주목받고 있으나, IPO 후 거래 가능 시점·세금 처리에 주의가 필요합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🏦 비상장 RSU의 3가지 특이점</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 베스팅 = 근로소득 인식</strong>: 비상장이라도 베스팅 시점에 공정가치를 산정해 근로소득으로 과세. 토스의 경우 외부 평가법인이 평가한 시가 기준.</li>
<li><strong>② 매도 불가 기간 길음</strong>: IPO 전에는 회사·동료에게만 매도 가능하거나 lockup. 현금화 시점이 멀어 세금만 먼저 내는 경우 발생.</li>
<li><strong>③ IPO 후 의무 보유 6개월</strong>: IPO 전 부여 RSU는 통상 IPO 후 6개월 lockup. 그 후에야 시장 매도 가능.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 IPO 가까울 때 절세 체크</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>베스팅 직전 IRP 추가 납입</strong>: 한계세율 38% 구간 진입 시 IRP 900만원으로 119만원 환급</li>
<li>· <strong>분할 베스팅 활용</strong>: 4년 분할 베스팅이라면 매년 한계세율 점검</li>
<li>· <strong>증여세 활용</strong>: IPO 전 저평가 시기에 가족 증여 → IPO 후 시세 상승분은 양도세만 부과</li>
<li>· <strong>이연 과세 검토</strong>: 일부 스타트업은 적격주식매수선택권으로 양도소득세만 적용 가능</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/salary-db/toss" class="text-primary underline">토스 연봉 + RSU 정보</a></li>
<li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 6. 네이버 RSU 행사 양도세 절세
// ═══════════════════════════════════════════════════════════════
const naverRsuStrategy = `
<p class="lead">
네이버는 임직원에게 매년 RSU를 부여하며 4년 베스팅. 상장 주식이라 베스팅 즉시 매도 가능하지만, 매도 시점에 따라 세금 부담이 달라집니다. 네이버 주가가 회복 국면이라 매도 시점 선택이 중요한 절세 포인트.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⏰ RSU 매도 타이밍 3가지 전략</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 즉시 매도(베스팅 당일)</strong>: 시가=매도가 → 양도세 0원. 단 가격 변동 리스크 없음. 가장 안전.</li>
<li><strong>② 단기 보유(3~6개월)</strong>: 단기 상승 기대. 차익 발생 시 250만원 공제 후 22%. 손실 시 이월 가능.</li>
<li><strong>③ 장기 보유(1년+)</strong>: 큰 상승 기대. 단 같은 해 합산 250만원만 공제. 매년 분할 매도 권장.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 네이버 RSU 1억 매도 시 세금</h2>
<p>
베스팅 시 근로소득세 약 3,850만원(한계세율 38.5%) 원천징수. 매도 시 차익이 1,500만원이면 (1,500-250) × 22% = 275만원 양도세 추가.
</p>
<p>
<strong>전체 세부담</strong>: 약 4,125만원 → 실수령 약 5,875만원 (60%).
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 4가지 핵심</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>4년 분할 매도</strong>: 매년 250만원 공제 활용 → 4년 누적 1,000만원 절감</li>
<li>· <strong>손실 종목 통산</strong>: 같은 해 미국주식·국내 대주주주식 손실과 통산</li>
<li>· <strong>증여세 활용</strong>: 배우자 6억 한도, 자녀 5,000만원 한도 활용</li>
<li>· <strong>IRP 900만원 만기 납입</strong>: RSU 베스팅 직전 납입으로 119만원 환급</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산기</a></li>
<li>· <a href="/salary-db/naver" class="text-primary underline">네이버 연봉 + RSU</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 7. 청년도약계좌 144만원 정부기여금
// ═══════════════════════════════════════════════════════════════
const youthLeapAccount = `
<p class="lead">
청년도약계좌는 만 19~34세 청년이 5년간 매월 최대 70만원을 납입하면 정부가 최대 144만원의 기여금 + 이자소득 비과세 혜택을 주는 5년 만기 적금입니다. 2026년 가입 조건과 활용법을 정리합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 자격 요건 (2026 기준)</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>나이</strong>: 만 19~34세 (병역 이행자는 최대 6년 연장)</li>
<li>· <strong>개인소득</strong>: 연 7,500만원 이하</li>
<li>· <strong>가구소득</strong>: 중위소득 250% 이하 (4인 가구 약 1억 5천)</li>
<li>· <strong>금융소득종합과세</strong>: 직전 3년 1회 미만 대상자만 가능</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 만기 수령액 시뮬</h2>
<p>
월 70만원 × 60개월(5년) = 원금 4,200만원. 여기에:
</p>
<ul class="space-y-2 mt-4">
<li>· 정부기여금 5년 누적: 약 144만원</li>
<li>· 이자(연 6% 가정): 약 640만원</li>
<li>· 비과세 혜택: 이자소득세 15.4% 면제 → 약 99만원 절감</li>
<li>· <strong>만기 총 수령액</strong>: 약 <strong class="text-electric">5,083만원</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 주의사항</h2>
<p>
5년 만기 전 중도해지 시 정부기여금·비과세 혜택 모두 환수. 단 특별중도해지 사유(혼인·출산·내집마련·생애최초 주택 구입 등) 충족 시 일부 혜택 유지. 가입 후 매년 소득 재확인.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/savings-interest-2026" class="text-primary underline">적금 이자 계산기</a></li>
<li>· <a href="/career-stages-2026" class="text-primary underline">20대 자산 형성 가이드</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 8. ISA 만기 비과세 200만원
// ═══════════════════════════════════════════════════════════════
const isaMaturity = `
<p class="lead">
ISA(개인종합자산관리계좌)는 연간 2,000만원 한도(5년 누적 1억)로 적립할 수 있는 만능 절세 계좌. 만기(3~5년) 시 발생한 손익을 통산해 비과세 200만원(서민형 400만원), 초과분 9.9% 분리과세로 처리됩니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 ISA 3가지 유형</h2>
<ul class="space-y-3 mt-4">
<li><strong>일반형</strong>: 비과세 200만원 한도. 만 19세 이상 누구나.</li>
<li><strong>서민형</strong>: 비과세 400만원 한도. 직전 과세년도 종합소득 4,000만원 이하 또는 총급여 5,000만원 이하.</li>
<li><strong>농어민형</strong>: 비과세 400만원 한도. 농어업인 전용.</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 만기 시 세금 비교</h2>
<p>
원금 5,000만원이 만기 시 7,000만원(차익 2,000만원)이 됐다고 가정.
</p>
<ul class="space-y-2 mt-4">
<li>· <strong>일반 증권계좌</strong>: 차익 2,000만원 × 15.4% = 308만원 세금</li>
<li>· <strong>ISA 일반형</strong>: 비과세 200만원 + 초과 1,800만원 × 9.9% = 178만원 세금 (130만원 절감)</li>
<li>· <strong>ISA 서민형</strong>: 비과세 400만원 + 초과 1,600만원 × 9.9% = 158만원 세금 (150만원 절감)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 ISA 만기 후 전략</h2>
<p>
만기 시 일시 인출 또는 연금계좌(IRP·연금저축)로 전환 가능. 연금계좌로 전환하면 추가 세액공제(전환금의 10%, 최대 300만원) 혜택. 단 연금 수령 시점까지 인출 제한.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/savings-interest-2026" class="text-primary underline">적금·예금 이자 계산기</a></li>
<li>· <a href="/tools/finance/irp" class="text-primary underline">IRP·연금저축 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 9. 1주택 종부세 12억 공제
// ═══════════════════════════════════════════════════════════════
const oneHomePropTax = `
<p class="lead">
1세대 1주택자는 종합부동산세에서 공시가격 12억원을 공제받습니다. 즉 공시가 12억 이하 1주택 보유자는 종부세 부담 0원. 1주택자 보유세 부담을 크게 낮추는 핵심 혜택입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 1세대 1주택 요건</h2>
<ul class="space-y-2 mt-4">
<li>· 본인 + 배우자 합산 1주택만 보유</li>
<li>· 주민등록 + 실거주 일치</li>
<li>· 부부 공동명의는 별도 신청 필요(각자 6억씩 공제 vs 12억 통합)</li>
<li>· 분양권·입주권은 주택 수에 포함</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 공시가별 종부세 부담(2026)</h2>
<div class="overflow-x-auto my-6">
<table class="w-full text-sm border border-border">
<thead class="bg-secondary"><tr><th class="p-3">공시가</th><th class="p-3">1주택자 (12억 공제)</th><th class="p-3">다주택자 (공제 0)</th></tr></thead>
<tbody>
<tr class="border-t"><td class="p-3">10억</td><td class="p-3 text-emerald-600">0원</td><td class="p-3">약 300만원</td></tr>
<tr class="border-t"><td class="p-3">15억</td><td class="p-3">약 90만원</td><td class="p-3">약 600만원</td></tr>
<tr class="border-t"><td class="p-3">20억</td><td class="p-3">약 240만원</td><td class="p-3">약 1,200만원</td></tr>
<tr class="border-t"><td class="p-3">30억</td><td class="p-3">약 700만원</td><td class="p-3">약 3,600만원</td></tr>
</tbody>
</table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 추가 세액공제 — 만 60세·5년 보유</h2>
<p>
만 60세 이상 + 5년 이상 보유 시 추가 종부세 세액공제:
</p>
<ul class="space-y-2 mt-4">
<li>· 60~64세: 20% / 65~69세: 30% / 70세+: 40%</li>
<li>· 5~9년 보유: 20% / 10~14년: 40% / 15년+: 50%</li>
<li>· <strong>합산 최대 80%</strong>까지 감면</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/property-holding-tax-2026" class="text-primary underline">부동산 보유세 계산기</a></li>
<li>· <a href="/calc/comprehensive-property-tax-quick" class="text-primary underline">종부세 빠른 계산</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 10. 디딤돌 대출 신생아 특례 1.6%
// ═══════════════════════════════════════════════════════════════
const didimdolNewborn = `
<p class="lead">
2026년 신생아 특례 디딤돌 대출은 최저 1.6% 금리(5년)로 최대 5억까지 주택 구입 자금을 빌릴 수 있는 정부 정책 상품. 2023년 이후 출생아를 둔 가구의 내집마련 부담을 크게 낮춥니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">✅ 자격 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>출생</strong>: 2023년 1월 1일 이후 출생·입양 자녀가 있는 가구</li>
<li>· <strong>소득</strong>: 부부 합산 1억 3,000만원 이하</li>
<li>· <strong>주택가격</strong>: 9억 이하 (수도권 12억까지 일부 가능)</li>
<li>· <strong>면적</strong>: 전용 85㎡ 이하 (수도권 외 100㎡ 이하)</li>
<li>· <strong>무주택</strong>: 본인·배우자 모두 무주택 또는 1주택자(처분 조건)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 금리·한도</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>금리</strong>: 1.6~3.3% (소득·자녀 수별 차등)</li>
<li>· <strong>한도</strong>: 최대 5억원</li>
<li>· <strong>기간</strong>: 10~30년 (5년·10년·15년·20년·30년)</li>
<li>· <strong>금리 5년 고정</strong> 후 변동</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 시중은행 대비 절감액</h2>
<p>
5억 원 30년 대출 시:
</p>
<ul class="space-y-2 mt-4">
<li>· 시중은행 4.5% 변동: 월 약 253만원 → 총 이자 약 4억 1,200만원</li>
<li>· 신생아 특례 1.6%: 월 약 175만원 → 총 이자 약 1억 3,000만원</li>
<li>· <strong>절감액: 약 2억 8,200만원</strong> (월 78만원 차이)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 신청 절차</h2>
<ol class="space-y-2 mt-4">
<li>1. 주택도시기금 위탁은행(우리·KB·NH·신한·하나·기업) 방문 또는 온라인 접수</li>
<li>2. 소득·자녀출생증명·주택매매계약서 제출</li>
<li>3. 심사 약 1~2주 → 승인 시 잔금 지급일에 대출 실행</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/home-loan" class="text-primary underline">주택담보대출 계산기</a></li>
<li>· <a href="/tools/real-estate/dsr" class="text-primary underline">DSR 한도 계산</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 11. 청약통장 매월 25만원 소득공제 300만원
// ═══════════════════════════════════════════════════════════════
const housing25Man = `
<p class="lead">
2024년부터 청약통장(주택청약종합저축) 소득공제 한도가 월 25만원(연 300만원)으로 인상됐습니다. 무주택 세대주 직장인은 매년 약 40~96만원의 세금을 절감할 수 있는 핵심 절세 항목.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 소득공제 효과</h2>
<p>
청약통장 매월 25만원(연 300만원) 납입 시:
</p>
<ul class="space-y-2 mt-4">
<li>· 공제율: 40% → 공제액 120만원</li>
<li>· 한계세율 24% 적용 시: 28.8만원 환급 (지방소득세 포함 31.7만원)</li>
<li>· 한계세율 35% 적용 시: 42만원 환급 (지방세 포함 46.2만원)</li>
<li>· 한계세율 38%: 45.6만원 환급 (지방세 포함 50.2만원)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 공제 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>총급여 7,000만원 이하</strong> (개정 전 7,000 → 8,000 검토 중)</li>
<li>· <strong>무주택 세대주</strong> (배우자도 무주택)</li>
<li>· <strong>본인 명의 청약통장</strong> (배우자 명의는 불가)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 가점·청약 전략과 연계</h2>
<p>
청약통장은 절세뿐만 아니라 청약 가점에도 영향. 납입 횟수(120회 이상 만점) + 납입 총액(1,500만원 이상 만점)이 청약 가점의 핵심. 월 25만원 × 60개월 = 1,500만원 → 5년이면 만점.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 주의</h2>
<p>
중도 해지 시 그동안 공제받은 금액을 추징당할 수 있음 (5년 이내 해지). 또한 2024년 인상 전 가입자도 자동 적용. 청년주택드림 청약통장(만 19~34세)은 별도로 더 큰 혜택.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li>
<li>· <a href="/calc/housing-subscription" class="text-primary underline">청약 시뮬레이터</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 12. 인터넷은행 5% 적금 비교
// ═══════════════════════════════════════════════════════════════
const internetBankSavings = `
<p class="lead">
2026년 카카오뱅크·토스뱅크·케이뱅크 등 인터넷은행이 우대 조건 충족 시 5% 이상 적금을 출시. 시중은행 정기적금(3~4%) 대비 1~2%p 높은 금리로 1년 만기 12만~25만원 추가 이자 가능.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 2026 5월 기준 주요 적금 비교</h2>
<div class="overflow-x-auto my-6">
<table class="w-full text-sm border border-border">
<thead class="bg-secondary"><tr><th class="p-3">상품</th><th class="p-3">기본금리</th><th class="p-3">우대 후</th><th class="p-3">한도</th></tr></thead>
<tbody>
<tr class="border-t"><td class="p-3">카카오뱅크 26주적금</td><td class="p-3">3.5%</td><td class="p-3">최대 7.0%</td><td class="p-3">월 10만원 (26주)</td></tr>
<tr class="border-t"><td class="p-3">토스뱅크 자유적금</td><td class="p-3">4.0%</td><td class="p-3">최대 5.5%</td><td class="p-3">월 100만원</td></tr>
<tr class="border-t"><td class="p-3">케이뱅크 코드K 자유적금</td><td class="p-3">3.5%</td><td class="p-3">최대 5.0%</td><td class="p-3">월 30만원</td></tr>
<tr class="border-t"><td class="p-3">신한 쏠편한 정기적금</td><td class="p-3">3.2%</td><td class="p-3">최대 4.7%</td><td class="p-3">월 100만원</td></tr>
</tbody>
</table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 우대금리 조건 — 주의</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>카드 사용 실적</strong>: 월 30~50만원 카드 사용 필요</li>
<li>· <strong>급여 이체</strong>: 해당 은행 계좌로 50만원 이상 급여</li>
<li>· <strong>자동이체 등록</strong>: 통신비·아파트관리비 자동이체</li>
<li>· <strong>마케팅 동의</strong>: SMS·이메일 알림 수신 동의</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 함정 주의</h2>
<p>
"최고 7%"라고 표시된 카카오뱅크 26주적금은 26주(6개월) 만기 + 매주 적립 증액 구조로 실제 평균 운용금리는 3.7% 수준. 또한 우대조건 미충족 시 기본금리만 적용되므로 가입 전 조건 확인 필수.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/savings-interest-2026" class="text-primary underline">적금·예금 이자 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 13. 미국주식 양도세 22% 절세 5가지
// ═══════════════════════════════════════════════════════════════
const usStockTaxSaving = `
<p class="lead">
미국주식(해외주식) 양도차익에는 22%(소득세 20% + 지방소득세 2%) 세금. 한국 주식과 달리 대주주 여부와 무관하게 모든 양도차익에 과세. 다만 연 250만원 기본공제, 손익 통산, 이월결손금 등 절세 전략이 다양합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 5가지 핵심</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 분할 매도로 250만원 공제 활용</strong>: 매년 250만원 공제 → 5년 분할 매도 시 1,250만원 비과세 효과</li>
<li><strong>② 손익 통산</strong>: 같은 해 손실 종목과 통산. 예: A 종목 +500, B 종목 -300 → 순이익 200만원만 과세</li>
<li><strong>③ 이월결손금 10년</strong>: 손실분을 10년간 이월해 미래 이익과 통산 가능</li>
<li><strong>④ 부부 합산 활용</strong>: 배우자 명의로 일부 매도 → 각자 250만원 공제 → 부부 합산 500만원 비과세</li>
<li><strong>⑤ ISA 활용</strong>: ISA로 미국 ETF 투자 → 차익 비과세 200만원 + 초과분 9.9% 분리과세</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 신고 시기</h2>
<p>
매년 5월 1~31일 종합소득세 신고와 함께 양도소득세 확정신고. 양도차익 발생 시 자동 신고 의무. 미신고 시 가산세 최대 40% 부과.
</p>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 절세 시뮬</h2>
<p>
미국 ETF에 5,000만원 투자해 2,000만원 차익 시:
</p>
<ul class="space-y-2 mt-4">
<li>· <strong>일시 매도</strong>: (2,000 - 250) × 22% = 385만원 세금</li>
<li>· <strong>4년 분할 매도</strong>: 매년 500만원씩 → (500-250) × 22% = 55만원 × 4년 = 220만원 (165만원 절감)</li>
<li>· <strong>부부 분할</strong>: 부부 각각 매년 250만원 공제 → 더 큰 절감</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산기</a></li>
<li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 14. 부업·N잡 종합소득세 신고
// ═══════════════════════════════════════════════════════════════
const sideHustleTax = `
<p class="lead">
직장인 부업·N잡 수익은 연 500만원을 넘으면 종합소득세 신고 의무. 5월 1~31일 신고 시기를 놓치면 가산세 최대 20%. 부업 유형별 신고 방식과 절세 전략을 정리합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 부업 유형별 신고</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 사업소득(3.3% 원천징수)</strong>: 강사·디자이너·개발자 외주 등. 종합소득세 신고 의무.</li>
<li><strong>② 기타소득(8.8% 원천징수)</strong>: 강연료·원고료·인세. 연 300만원 초과 시 종합과세 vs 분리과세 선택.</li>
<li><strong>③ 사업자등록 후 소득</strong>: 부가세 신고(1·7월) + 종합소득세 신고(5월) 별도.</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 필요경비 활용 절세</h2>
<p>
사업소득은 매출에서 필요경비를 차감해 과세표준 계산. 필요경비로 인정되는 항목:
</p>
<ul class="space-y-2 mt-4">
<li>· 노트북·모니터·소프트웨어 (감가상각 또는 즉시상각)</li>
<li>· 사무실 임대료·관리비 (재택 사무실 일부)</li>
<li>· 통신비 (업무용 비율 70~100%)</li>
<li>· 차량 유지비 (업무용 비율)</li>
<li>· 교육비·도서비 (직무 관련)</li>
<li>· 외부 미팅 식대 (영수증 보관)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 단순경비율 vs 기준경비율</h2>
<p>
업종별 정해진 비율로 필요경비를 산정하는 간이 방식:
</p>
<ul class="space-y-2 mt-4">
<li>· <strong>단순경비율</strong> (소득 7,500만원 이하): 업종 평균 경비율 적용. 영수증 없어도 OK.</li>
<li>· <strong>기준경비율</strong> (소득 7,500만원 초과): 일부 항목만 적용. 영수증 필요.</li>
<li>· <strong>실비 신고</strong>: 모든 경비 실비 적용. 영수증 보관 필수.</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 미신고 시 불이익</h2>
<ul class="space-y-2 mt-4">
<li>· 무신고 가산세: 20% (단순 누락은 10%)</li>
<li>· 납부불성실 가산세: 연 9.125%</li>
<li>· 매년 가산세 누적 → 3년 후 원래 세액의 1.5~2배</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/tools/finance/freelance-tax" class="text-primary underline">프리랜서 종합소득세 계산기</a></li>
<li>· <a href="/income-tax-2026" class="text-primary underline">2026 종합소득세 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 15. 가상자산 양도세 유예
// ═══════════════════════════════════════════════════════════════
const cryptoTaxDeferred = `
<p class="lead">
2025년 1월부터 시행 예정이었던 가상자산(암호화폐) 양도세 22%가 2027년 1월로 추가 유예. 코인 투자자 입장에서는 1년 더 비과세 기간이 연장된 셈. 2026년 동안 매매·정리 전략을 미리 점검할 시기입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 가상자산 과세 (시행 시점 기준)</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>과세 시점</strong>: 2027년 1월 1일 양도분부터 (현재 2026 동안 비과세)</li>
<li>· <strong>세율</strong>: 22% (소득세 20% + 지방소득세 2%)</li>
<li>· <strong>공제</strong>: 연 250만원 (주식 양도세와 별도)</li>
<li>· <strong>분류과세</strong>: 종합소득과 별도 신고</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 2026년 동안 점검할 3가지</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 취득가 기록 정리</strong>: 2027년 1월 1일 기준 보유 가상자산의 시가가 취득가로 의제. 거래소별 시가 스냅샷 + 평균 단가 기록 필수.</li>
<li><strong>② 손실 종목 정리</strong>: 손실 코인은 2026년 내 매도해 비과세 처분. 2027년 이후 손실 통산은 단년 적용.</li>
<li><strong>③ 양도세 시뮬</strong>: 2027년 시행 시 본인 보유 코인의 예상 양도세 미리 계산 → 분할 매도 전략 수립.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 변수 — 추가 유예 가능성</h2>
<p>
2025년에도 1년 유예된 전례. 2026년 정치·경제 상황에 따라 또 유예될 가능성도 있음. 다만 OECD 권고 + 글로벌 추세상 결국 시행 방향. 미리 대비.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 양도세 절세 전략</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>분할 매도</strong>: 매년 250만원 공제 활용 → 5년 1,250만원 비과세</li>
<li>· <strong>손익 통산</strong>: 같은 해 다른 코인 손실과 통산</li>
<li>· <strong>이월결손금</strong>: 5년 이월 가능 (주식의 10년보다 짧음)</li>
<li>· <strong>해외 거래소 신고</strong>: 미신고 시 가산세 + 자금세탁방지법 위반 가능성</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산기 (코인 22%와 동일)</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 16. 신용점수 850 만들기 6개월 전략
// ═══════════════════════════════════════════════════════════════
const creditScore850 = `
<p class="lead">
신용점수 850점 이상이면 모든 주거래 우대금리 적용 + 디딤돌·신생아 특례대출 최저 금리 적용. 현재 650~750점이라면 6개월 안에 100점 이상 올릴 수 있는 검증된 5가지 전략.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 6개월 안에 850점 만드는 5가지</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 카드 사용액 관리 (가장 큰 효과)</strong>: 신용카드 사용액을 한도의 30% 이내로 유지. 한도 1,000만원이면 매월 300만원 이하 사용. 한도 가까이 쓰면 점수 급락.</li>
<li><strong>② 자동이체 6건 이상 등록</strong>: 통신비·아파트관리비·전기·가스·수도·월세 자동이체. 매월 정시 결제 → 신용도 +30~50점 효과.</li>
<li><strong>③ 카카오뱅크·토스 신용관리</strong>: 무료 신용점수 조회. 잦은 조회는 영향 없음(타기관 조회와 다름). 신용행위 점수 가산.</li>
<li><strong>④ 마이너스통장 사용 자제</strong>: 마통 사용액이 신용도에 가장 부정적. 사용 안 하는 마통은 해지 권장.</li>
<li><strong>⑤ 카드론·현금서비스 즉시 정리</strong>: 카드론 잔액 1건만 있어도 점수 -50점 이상. 우선 상환 1순위.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 점수대별 대출 금리</h2>
<div class="overflow-x-auto my-6">
<table class="w-full text-sm border border-border">
<thead class="bg-secondary"><tr><th class="p-3">신용점수</th><th class="p-3">신용대출 금리</th><th class="p-3">5천만원 1년 이자 차이</th></tr></thead>
<tbody>
<tr class="border-t"><td class="p-3">900+</td><td class="p-3">4.5~5.5%</td><td class="p-3">기준</td></tr>
<tr class="border-t"><td class="p-3">850~899</td><td class="p-3">5.0~6.0%</td><td class="p-3">+25~50만원</td></tr>
<tr class="border-t"><td class="p-3">750~849</td><td class="p-3">6.0~8.0%</td><td class="p-3">+75~125만원</td></tr>
<tr class="border-t"><td class="p-3">650~749</td><td class="p-3">8.0~12.0%</td><td class="p-3">+175~325만원</td></tr>
</tbody>
</table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 점수 떨어뜨리는 행위 — 절대 금지</h2>
<ul class="space-y-2 mt-4">
<li>· 카드 단기 연체(7일 이상) — 1회 -50점</li>
<li>· 마통 한도 가까이 사용</li>
<li>· 카드론·현금서비스 빈번 이용</li>
<li>· 짧은 기간 다수 카드 발급 신청</li>
<li>· 통신비 자동이체 해지 후 청구서 미납</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 가이드</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/guides" class="text-primary underline">전체 금융 가이드</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 17. 부모 부양 인적공제 통합 절세
// ═══════════════════════════════════════════════════════════════
const parentSupportDeduction = `
<p class="lead">
60세 이상 부모님을 부양가족으로 등록하면 인적공제 150만원 + 경로우대 100만원 + 부모님 의료비 100% 공제. 형제·자매가 있다면 누가 부양 등록할지 협의로 매년 약 50~100만원 추가 환급 가능.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 부양 등록 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>나이</strong>: 부모 만 60세 이상 (배우자 부모도 가능)</li>
<li>· <strong>소득</strong>: 부모님 연소득 100만원 이하 (근로소득은 500만원)</li>
<li>· <strong>주민등록</strong>: 같이 살지 않아도 부양관계 인정</li>
<li>· <strong>다른 자녀</strong>: 형제·자매 중 1인만 등록 가능</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 공제 항목·환급액</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 기본 인적공제 150만원</strong>: 부모 1인당. 한계세율 24% 시 36만원 환급</li>
<li><strong>② 경로우대 추가공제 100만원</strong>: 만 70세 이상. 한계세율 24% 시 24만원 환급</li>
<li><strong>③ 장애인 공제 200만원</strong>: 부모 장애인 등록 시. 한계세율 24% 시 48만원 환급</li>
<li><strong>④ 의료비 세액공제 100% 차감 후 15%</strong>: 부모님 의료비 200만원 시 약 18만원 환급</li>
<li><strong>⑤ 부모 보장성 보험료</strong>: 부모 명의 + 본인이 납입 시 100만원 한도 12% 공제</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">🎯 형제·자매와 협의 — 누가 등록?</h2>
<p>
부모 1인은 자녀 중 1인만 등록 가능. 누가 등록하면 가장 유리한지:
</p>
<ul class="space-y-2 mt-4">
<li>· <strong>한계세율 높은 자녀</strong>가 등록 시 환급 효과 최대</li>
<li>· 예: A(한계세율 38%) 등록 시 250만원 공제 → 95만원 환급</li>
<li>· B(한계세율 24%) 등록 시 같은 250만원 → 60만원 환급 (35만원 차이)</li>
<li>· 매년 협의로 변경 가능</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 주의 — 의료보험 영향</h2>
<p>
부모님을 본인의 건강보험 피부양자로 동시 등재 가능. 단 2022년 11월 피부양자 요건 강화로 부모 연소득 2,000만원 초과 시 피부양자 자격 박탈. 인적공제는 별개로 가능하지만 의료보험만 따로 점검 필요.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li>
<li>· <a href="/health-insurance-fee-2026" class="text-primary underline">건강보험료 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 18. IRP·연금저축 만기 수령 절세
// ═══════════════════════════════════════════════════════════════
const irpPensionPayout = `
<p class="lead">
IRP·연금저축은 만 55세 이상부터 수령 가능. 일시금 수령 시 기타소득세 16.5%, 연금 수령 시 3.3~5.5%로 약 11~13%p 절감. 만기 수령 시 분할 연금 선택이 절세의 핵심입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 일시금 vs 연금 수령 세금 비교</h2>
<p>
적립금 1억원 수령 시 (가정):
</p>
<ul class="space-y-2 mt-4">
<li>· <strong>일시금 수령</strong>: 1억 × 16.5% = 1,650만원 세금. 실수령 8,350만원</li>
<li>· <strong>10년 분할 연금</strong>: 매년 1,000만원 × 5.5%(만 55세) = 55만원 × 10년 = 550만원 세금. 실수령 9,450만원 (1,100만원 절감)</li>
<li>· <strong>20년 분할 + 만 70세부터</strong>: 4.4% 세율 → 더 큰 절감</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 연금 수령 시 세율</h2>
<ul class="space-y-2 mt-4">
<li>· 만 55~69세: <strong>5.5%</strong></li>
<li>· 만 70~79세: <strong>4.4%</strong></li>
<li>· 만 80세 이상: <strong>3.3%</strong></li>
<li>· 연 1,500만원 초과 시 종합과세 가능성</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 연금 수령 최적 전략</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 10년 이상 분할</strong>: 최소 10년 분할 수령 → 연 1,200만원 이하 유지로 세율 5.5% 고정</li>
<li><strong>② 만 70세 이후 본격 수령</strong>: 만 55~69세는 일부, 만 70세 이후 본격 → 4.4% 적용</li>
<li><strong>③ 종합과세 한도 관리</strong>: 연 1,500만원 초과 시 종합과세 전환. 다른 연금소득과 합산 주의</li>
<li><strong>④ ISA 만기 자금 추가 적립</strong>: ISA 만기 자금 연금계좌 전환 시 추가 300만원 세액공제</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 중도 해지 시 손해</h2>
<p>
만 55세 전 중도해지 시 그동안 세액공제받은 금액 + 운용수익 합계의 16.5% 기타소득세 부과. 약 30년 누적 세제혜택을 한 번에 환수당하므로 절대 권장 안 함.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/tools/finance/irp" class="text-primary underline">IRP·연금저축 계산기</a></li>
<li>· <a href="/national-pension-estimate-2026" class="text-primary underline">국민연금 예상수령액</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 19. 임대소득 2,000만원 분리과세
// ═══════════════════════════════════════════════════════════════
const rentalIncome2000 = `
<p class="lead">
주택 임대소득이 연 2,000만원 이하면 14% 분리과세, 초과 시 종합과세로 누진세율 적용. 다주택자·임대사업자 입장에서 임대료 수준 조정으로 큰 세금 차이가 발생합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 2,000만원 기준 세금 비교</h2>
<p>
연봉 7,000만원 직장인 + 임대소득 추가 시:
</p>
<div class="overflow-x-auto my-6">
<table class="w-full text-sm border border-border">
<thead class="bg-secondary"><tr><th class="p-3">임대소득</th><th class="p-3">처리 방식</th><th class="p-3">추가 세금</th></tr></thead>
<tbody>
<tr class="border-t"><td class="p-3">1,500만원</td><td class="p-3">분리과세 14%</td><td class="p-3">약 210만원</td></tr>
<tr class="border-t"><td class="p-3">2,000만원</td><td class="p-3">분리과세 14%</td><td class="p-3">약 280만원</td></tr>
<tr class="border-t"><td class="p-3">2,500만원</td><td class="p-3">종합과세 24~35%</td><td class="p-3">약 600~875만원</td></tr>
<tr class="border-t"><td class="p-3">3,000만원</td><td class="p-3">종합과세 35%</td><td class="p-3">약 1,050만원</td></tr>
</tbody>
</table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 2,000만원 기준 핵심</h2>
<p>
임대소득 2,001만원 → 2,500만원 사이가 가장 손해. 차라리 임대료를 1,900만원으로 낮추거나 2,500만원 이상으로 올리는 게 절세에 유리한 경우가 많습니다. 단순 임대료 인하만으로 200~400만원 절세 효과.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 분리과세 신청 요건</h2>
<ul class="space-y-2 mt-4">
<li>· 연 임대소득 합계 2,000만원 이하</li>
<li>· 별도 신청 — 5월 종소세 신고 시 "분리과세 선택" 표시</li>
<li>· 기본공제 200만원 (등록임대주택은 400만원)</li>
<li>· 필요경비율 50% (등록임대주택은 60%)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 등록임대주택 우대</h2>
<p>
임대사업자로 등록한 주택은 분리과세 시 필요경비율 60% + 기본공제 400만원 적용. 같은 임대소득 1,800만원이라도 등록 vs 비등록 시 세금이 약 80~100만원 차이.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/property-holding-tax-2026" class="text-primary underline">부동산 보유세 계산기</a></li>
<li>· <a href="/income-tax-2026" class="text-primary underline">종합소득세 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 20. 신생아 특례대출 5억 자격·신청
// ═══════════════════════════════════════════════════════════════
const newbornSpecialLoan = `
<p class="lead">
신생아 특례대출은 2023년 이후 출생·입양 자녀가 있는 가구에 최저 1.6%, 최대 5억원까지 주택구입자금을 빌려주는 정부 지원 상품. 신생아 특례 디딤돌(매매) + 버팀목(전세) 두 종류가 있습니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 자격 요건</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 출생</strong>: 2023년 1월 1일 이후 출생 또는 입양한 자녀 보유 (대출 신청일 기준 2년 이내)</li>
<li><strong>② 소득</strong>: 부부 합산 1억 3,000만원 이하</li>
<li><strong>③ 주택가격</strong>: 9억원 이하 (수도권 12억까지 일부 가능)</li>
<li><strong>④ 무주택 또는 1주택 처분 조건</strong>: 기존 주택은 대출 실행일로부터 1년 이내 처분</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 금리 구조</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>기본금리</strong>: 연 1.6~3.3%</li>
<li>· <strong>소득 별 차등</strong>: 8천 이하 1.6%, 8천~1.3억 2.7%, 1.3억 초과 미신청</li>
<li>· <strong>자녀 수 우대</strong>: 추가 출산 시 0.2%p씩 인하 (최대 -1.0%p)</li>
<li>· <strong>금리 5년 고정</strong> 후 6년차부터 변동금리</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 5억 대출 30년 부담</h2>
<ul class="space-y-2 mt-4">
<li>· 1.6% 적용: 월 약 175만원, 총 이자 1억 3,000만원</li>
<li>· 2.7% 적용: 월 약 203만원, 총 이자 2억 3,000만원</li>
<li>· 시중은행 4.5% 대비 5억 30년 약 <strong>2억 8,000만원 절감</strong> (1.6% 적용 시)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 신청 절차</h2>
<ol class="space-y-2 mt-4">
<li>1. 주택도시기금 위탁 6개 은행 방문 (우리·KB·NH·신한·하나·기업)</li>
<li>2. 소득증빙·자녀출생증명·주택매매계약서 제출</li>
<li>3. 심사 1~2주 → 승인 후 잔금일에 대출 실행</li>
<li>4. 5년간 금리 고정. 추가 출산 시 우대금리 갱신 신청</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/home-loan" class="text-primary underline">주택담보대출 계산기</a></li>
<li>· <a href="/tools/real-estate/dsr" class="text-primary underline">DSR 한도</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 21. 산후조리원 의료비 공제 200만원
// ═══════════════════════════════════════════════════════════════
const postpartumMedical = `
<p class="lead">
2019년부터 산후조리원 비용도 의료비 세액공제 대상. 1회 출산당 200만원 한도로 공제 가능해 한계세율 24% 기준 약 48만원 환급. 출산 가정의 핵심 절세 항목입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 공제 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>총급여 7,000만원 이하</strong> 직장인 또는 그 배우자가 결제</li>
<li>· 산후조리원 1회 출산당 최대 200만원 한도</li>
<li>· 신용카드·현금영수증으로 결제분만 인정</li>
<li>· 출산일 기준 1년 이내 산후조리 비용</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 환급 효과</h2>
<p>
산후조리원 비용 평균 250~400만원 중 200만원이 의료비로 인정.
</p>
<ul class="space-y-2 mt-4">
<li>· 총급여의 3% 초과분만 공제 → 총급여 5,000만원이면 150만원 초과분 공제</li>
<li>· 200만원 - 150만원 = 50만원 공제 → 15% 세액공제 = 7.5만원 환급</li>
<li>· 출산·산모 의료비(분만비·검진비 등) 합산하면 환급액 큼</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 통합 공제 전략 — 출산 가정</h2>
<p>
산후조리원 + 출산 의료비 + 신생아 검진비를 한 사람에게 모으면 총급여의 3% 한도를 넘기기 쉬워 환급 효과 커짐. 부부 중 총급여가 낮은 쪽(3% 한도가 낮은 쪽)이 공제받는 게 유리.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 영수증 보관 — 5년</h2>
<p>
산후조리원·산부인과·소아과·약국 영수증 모두 보관. 카드로 결제했다면 카드사 사용내역에 자동 기록되지만 산후조리원은 별도 영수증 필요. 의료비 명세표(국세청 발급)로 종합 정리.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/year-end-tax" class="text-primary underline">연말정산 환급금 계산기</a></li>
<li>· <a href="/parental-leave" class="text-primary underline">육아휴직 급여 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 22. 임플란트·치과 의료비 공제
// ═══════════════════════════════════════════════════════════════
const implantMedical = `
<p class="lead">
임플란트, 치아 교정, 보철, 스케일링 등 치과 의료비도 모두 의료비 세액공제 대상. 임플란트 1개 약 150만원 기준 한계세율 35% 시 약 7~8만원 환급. 영수증 보관 + 카드 결제가 핵심.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 공제 가능한 치과 비용</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>임플란트</strong>: 1개당 80~200만원, 보통 1악 4~6개</li>
<li>· <strong>치아 교정</strong>: 전체 300~700만원 (성인 미용 목적도 일부 공제)</li>
<li>· <strong>보철·크라운</strong>: 1개당 30~100만원</li>
<li>· <strong>스케일링·치료</strong>: 모두 공제 대상</li>
<li>· <strong>치과 사후 처방약</strong>: 약국 영수증도 포함</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 임플란트 환급액</h2>
<p>
임플란트 4개 600만원 시 (총급여 6,000만원, 한계세율 24% 가정):
</p>
<ul class="space-y-2 mt-4">
<li>· 총급여 3% = 180만원 초과분만 공제</li>
<li>· 600만원 - 180만원 = 420만원 공제 대상</li>
<li>· 15% 세액공제 = 63만원 환급</li>
<li>· 지방소득세 10% 포함 시 약 69만원 환급</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 핵심 4가지</h2>
<ol class="space-y-2 mt-4">
<li><strong>① 한 사람에게 몰아서 결제</strong>: 부부 중 총급여 낮은 쪽이 결제 → 3% 한도 낮아 공제 가능액 커짐</li>
<li><strong>② 같은 해 한 번에 시술</strong>: 매년 3% 한도를 넘는 게 핵심. 2년에 나눠 시술하면 두 번 모두 한도 미달 가능</li>
<li><strong>③ 카드 결제 우선</strong>: 신용카드·체크카드·현금영수증 모두 OK. 단 카드 결제분이 자동 집계되어 편리</li>
<li><strong>④ 자녀·부모 의료비 합산</strong>: 부양가족 등록된 자녀·부모 의료비도 합산 → 한도 도달 용이</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 미용 목적은 제외</h2>
<p>
미용 목적의 라미네이트·치아 미백·잇몸 성형 등은 의료비 공제 대상 아님. 다만 부정교합 교정은 의료 목적으로 공제 인정. 모호한 경우 치과에 "의료비 공제 가능 시술"인지 확인 후 진행.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 23. 청년주택드림 청약통장 1.3억
// ═══════════════════════════════════════════════════════════════
const youthHousingDream = `
<p class="lead">
2024년 신설된 청년주택드림 청약통장은 만 19~34세 청년만 가입 가능. 우대금리 연 4.5%(시중 적금보다 1.5%p 높음) + 청년주택드림 대출(최대 1.3억) 자격까지 연계되는 슈퍼 청약통장입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 가입 자격</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>나이</strong>: 만 19~34세 (병역 이행자 39세까지 가능)</li>
<li>· <strong>소득</strong>: 연 5,000만원 이하 (총급여 7,000만원도 일부 가능)</li>
<li>· <strong>무주택</strong>: 본인 무주택 (세대 무주택일 필요는 없음)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 혜택 3가지</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 적금 금리 우대</strong>: 기본 2.0% + 우대 2.5% = 최대 4.5%. 5년 납입 시 일반 적금 대비 약 250만원 추가 이자.</li>
<li><strong>② 소득공제 확대</strong>: 매년 납입액 600만원까지 40% 공제 (일반 청약통장 300만원 대비 2배). 환급액 한계세율 24% 기준 약 57만원.</li>
<li><strong>③ 청년주택드림 대출</strong>: 통장 가입 후 1년 + 1,000만원 납입 시 자격 발생. 최저 2.2% 금리로 최대 1억 3천만원 대출.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 5년 누적 효과</h2>
<p>
월 50만원 × 60개월 = 3,000만원 납입 시:
</p>
<ul class="space-y-2 mt-4">
<li>· 4.5% 이자 누적: 약 350만원</li>
<li>· 소득공제 환급 누적: 약 285만원 (한계세율 24% 5년)</li>
<li>· <strong>총 혜택: 약 635만원</strong></li>
<li>· 추가로 청년주택드림 대출 1.3억 자격 확보</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 주의</h2>
<ul class="space-y-2 mt-4">
<li>· 만 34세 초과 시 자동으로 일반 주택청약종합저축으로 전환</li>
<li>· 중도해지 시 우대금리 + 소득공제 환수</li>
<li>· 만 1년 가입 + 1,000만원 납입까지는 대출 자격 없음</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/calc/housing-subscription" class="text-primary underline">청약 시뮬레이터</a></li>
<li>· <a href="/home-loan" class="text-primary underline">주택담보대출 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 24. 1세대 1주택 양도세 12억 비과세
// ═══════════════════════════════════════════════════════════════
const oneHomeCapitalGains = `
<p class="lead">
1세대 1주택자는 양도가액 12억원 이하 매도 시 양도세 100% 비과세. 12억 초과분만 일반 양도세 적용. 장기보유 + 거주 요건 충족 시 80% 추가 공제까지 받아 사실상 비과세 효과.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 비과세 핵심 요건</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 1세대 1주택</strong>: 본인 + 배우자 합산 1주택 (분양권·입주권 포함)</li>
<li><strong>② 보유 2년 이상</strong>: 매수일~매도일 기준</li>
<li><strong>③ 거주 2년 이상</strong>: 조정대상지역만 적용. 비조정 지역은 거주 요건 없음</li>
<li><strong>④ 양도가액 12억 이하</strong>: 초과 시 초과분에만 양도세 부과</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 양도가 12억 초과 시</h2>
<p>
양도가 15억원, 매수가 8억원, 보유 5년 + 거주 4년인 경우:
</p>
<ul class="space-y-2 mt-4">
<li>· 비과세 한도: 12억 초과분 = 15-12 = 3억</li>
<li>· 비과세 비율: 3억 / 15억 = 20% → 양도차익 7억의 20% = 1.4억이 과세 대상</li>
<li>· 장기보유특별공제: 4년 거주 + 5년 보유 → 약 48% 공제</li>
<li>· 과세표준: 1.4억 × (1 - 0.48) = 0.728억</li>
<li>· 양도세: 약 1,150만원 (지방세 포함 약 1,265만원)</li>
<li>· <strong>15억 주택 매도 세금이 약 1,265만원에 그침</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 장기보유 + 거주 = 80% 공제</h2>
<ul class="space-y-2 mt-4">
<li>· 보유 10년 + 거주 10년: 80% (각 4% × 10년)</li>
<li>· 보유 9년 + 거주 9년: 72%</li>
<li>· 보유 5년 + 거주 5년: 40%</li>
<li>· 비과세 한도 12억 초과분도 80% 공제까지 가능 → 실효 세부담 매우 낮음</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 함정 — 일시적 2주택</h2>
<p>
이사를 위해 잠시 2주택이 된 경우, 종전 주택을 신규 주택 취득 후 3년 이내 매도하면 1주택자로 인정. 단 신규 주택은 1년 이상 보유 후 매도해야 비과세 적용.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">부동산 양도세 계산</a></li>
<li>· <a href="/property-holding-tax-2026" class="text-primary underline">보유세 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 25. 다주택자 양도세 중과 폐지 vs 유지
// ═══════════════════════════════════════════════════════════════
const multiHomeHeavyTax = `
<p class="lead">
조정대상지역 2주택·3주택 이상 양도세 중과세율(기본세율 + 20~30%p)은 2022~2025년 한시 폐지 상태. 2026년 5월 이후 재시행 가능성이 거론되고 있어 다주택자 매도·증여 시점 결정의 중요한 변수.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 중과세율 — 시행 시 부담</h2>
<div class="overflow-x-auto my-6">
<table class="w-full text-sm border border-border">
<thead class="bg-secondary"><tr><th class="p-3">대상</th><th class="p-3">기본세율</th><th class="p-3">중과 추가</th><th class="p-3">최종</th></tr></thead>
<tbody>
<tr class="border-t"><td class="p-3">조정 2주택</td><td class="p-3">6~45%</td><td class="p-3">+20%p</td><td class="p-3">26~65%</td></tr>
<tr class="border-t"><td class="p-3">조정 3주택+</td><td class="p-3">6~45%</td><td class="p-3">+30%p</td><td class="p-3">36~75%</td></tr>
<tr class="border-t"><td class="p-3">비조정 다주택</td><td class="p-3">6~45%</td><td class="p-3">없음</td><td class="p-3">6~45%</td></tr>
</tbody>
</table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">⏰ 시점 결정 핵심</h2>
<p>
한시 폐지 기간 (2022.5.10 ~ 2025.5.9) 동안 매도하면 기본세율만 적용. 2025.5.10 이후 재시행 시 갑자기 중과세율로 점프. 다주택자라면 2026년 5월 이전에 매도 결정 또는 증여 전환 검토.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 2주택자 양도세</h2>
<p>
조정대상 2주택, 양도차익 5억, 보유 5년:
</p>
<ul class="space-y-2 mt-4">
<li>· <strong>한시 폐지 기간(2026 현재)</strong>: 양도세 약 1.4억 (기본세율 35%)</li>
<li>· <strong>중과 재시행 시</strong>: 양도세 약 2.5억 (35% + 20%p = 55%)</li>
<li>· <strong>차이: 약 1.1억</strong> — 시점 1개월 차이로 1억 손해 가능</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 다주택자 5가지 대응</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 한시 폐지 기간 내 매도</strong>: 기본세율 적용으로 매도</li>
<li><strong>② 임대사업자 등록</strong>: 8년·10년 장기 임대 등록 시 종부세 합산 배제 + 양도세 우대</li>
<li><strong>③ 자녀 증여</strong>: 5,000만원 한도 비과세 증여 + 양도세 보단 증여세가 작을 수도</li>
<li><strong>④ 비조정 지역으로 이전</strong>: 비조정 지역 다주택은 중과 대상 아님</li>
<li><strong>⑤ 1주택 정리</strong>: 다주택을 1주택으로 만들어 비과세 12억 + 80% 공제 활용</li>
</ol>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/property-holding-tax-2026" class="text-primary underline">부동산 보유세 계산기</a></li>
<li>· <a href="/tools/real-estate/gift-tax" class="text-primary underline">증여세 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 26. 청년형 장기집합투자증권저축
// ═══════════════════════════════════════════════════════════════
const youthInvestmentSavings = `
<p class="lead">
청년형 장기집합투자증권저축은 만 19~34세 청년이 5년 이상 가입 시 펀드 운용수익 비과세 + 소득공제 600만원(연 200만원 × 3년)을 동시에 받는 적립식 펀드. 청년도약계좌·청년주택드림과 조합 가능.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 가입 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>나이</strong>: 만 19~34세</li>
<li>· <strong>총급여</strong>: 5,000만원 이하 (종합소득 3,800만원 이하)</li>
<li>· <strong>가입 기간</strong>: 최소 3년, 최대 5년</li>
<li>· <strong>월 한도</strong>: 60만원 (연 720만원)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 혜택</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 운용수익 비과세</strong>: 일반 펀드 15.4% 과세 → 비과세 100%. 5년 운용 시 약 100~300만원 절세.</li>
<li><strong>② 소득공제 600만원</strong>: 3년간 매년 200만원 한도 소득공제. 한계세율 24% 기준 약 144만원 환급.</li>
<li><strong>③ 청년도약계좌와 중복 가능</strong>: 두 상품 모두 가입 가능. 절세 시너지 효과.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 5년 시뮬레이션</h2>
<p>
월 60만원 × 60개월 = 3,600만원 납입, 연 수익률 7% 가정:
</p>
<ul class="space-y-2 mt-4">
<li>· 만기 평가액: 약 4,300만원</li>
<li>· 운용수익: 약 700만원</li>
<li>· 비과세 효과: 약 108만원 절세 (15.4% 비과세)</li>
<li>· 소득공제 환급: 약 144만원 (3년)</li>
<li>· <strong>총 혜택: 약 252만원</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 주의</h2>
<ul class="space-y-2 mt-4">
<li>· 3년 미만 해지 시 그동안 받은 소득공제·비과세 모두 추징</li>
<li>· 만 34세 초과 후 가입 신규 불가 (가입 후 만 34세 넘어도 만기까지 유지 가능)</li>
<li>· 펀드 손실 시 원금 손실 가능 (예적금이 아닌 펀드)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/savings-interest-2026" class="text-primary underline">적금·예금 이자 계산기</a></li>
<li>· <a href="/fire-calculator" class="text-primary underline">FIRE 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 27. 월세 세액공제 17% 750만원
// ═══════════════════════════════════════════════════════════════
const monthlyRentTaxCredit = `
<p class="lead">
무주택 세대주가 월세를 내고 있다면 연 750만원 한도로 17% 세액공제. 매월 50~60만원 월세 거주자는 매년 약 80~125만원 환급 가능. 신청 안 하면 그대로 손해.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 공제 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>무주택 세대주</strong>: 본인 무주택 + 배우자 무주택 (세대원 가능)</li>
<li>· <strong>총급여 7,000만원 이하</strong> (종합소득 6,000만원 이하)</li>
<li>· <strong>국민주택규모 이하 주택</strong>: 전용 85㎡ 이하 또는 기준시가 3억 이하</li>
<li>· <strong>계약자 = 본인</strong>: 임대차계약서상 본인 명의 (배우자 명의는 본인 공제 안 됨)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 환급액 시뮬</h2>
<p>
월세 50만원(연 600만원) 거주, 총급여 4,000만원:
</p>
<ul class="space-y-2 mt-4">
<li>· 공제 한도 내: 600만원 (≤750만원)</li>
<li>· 17% 세액공제 = 102만원 환급</li>
<li>· 지방소득세 포함 시 약 112만원 환급</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 신청 방법</h2>
<ol class="space-y-2 mt-4">
<li>1. 월세 계약서 확보 (본인 명의)</li>
<li>2. 월세 이체 확인 (은행 이체 내역 또는 현금영수증)</li>
<li>3. 연말정산 시 회사 제출 또는 5월 종소세 신고에 포함</li>
<li>4. 추후 누락 시 5년 이내 경정청구로 환급 가능</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 함께 신청하면 좋은 공제</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>전세자금 대출 이자 소득공제</strong>: 전세대출 원리금 상환액의 40% (한도 400만원)</li>
<li>· <strong>주택청약저축 소득공제</strong>: 월 25만원 × 40% = 120만원</li>
<li>· <strong>장기주택저당차입금 이자 공제</strong>: 1주택자만</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 5년 경정청구</h2>
<p>
월세 공제를 그동안 안 받았다면 5년 이내 경정청구로 환급 가능. 2021~2025년 월세분 모두 신청 시 환급 누적 약 400~500만원 가능.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/calc/monthly-rent-tax-credit-quick" class="text-primary underline">월세 세액공제 환급액 계산</a></li>
<li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 28. 신용카드 공제 30·40% 전략
// ═══════════════════════════════════════════════════════════════
const cardDeductionStrategy = `
<p class="lead">
연말정산 신용카드 등 사용액 소득공제는 총급여의 25% 초과분만 공제. 다만 결제 수단별 공제율이 15~80%까지 큰 차이가 있어 전략적 사용으로 환급액을 2~3배 늘릴 수 있습니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 결제 수단별 공제율</h2>
<div class="overflow-x-auto my-6">
<table class="w-full text-sm border border-border">
<thead class="bg-secondary"><tr><th class="p-3">결제 수단</th><th class="p-3">공제율</th></tr></thead>
<tbody>
<tr class="border-t"><td class="p-3">신용카드</td><td class="p-3">15%</td></tr>
<tr class="border-t"><td class="p-3">체크카드·현금영수증</td><td class="p-3">30%</td></tr>
<tr class="border-t"><td class="p-3">전통시장</td><td class="p-3">40%</td></tr>
<tr class="border-t"><td class="p-3">대중교통</td><td class="p-3">40%</td></tr>
<tr class="border-t"><td class="p-3">도서·공연·박물관·미술관</td><td class="p-3">30%</td></tr>
</tbody>
</table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 최적 전략</h2>
<p>
연소득 5,000만원 기준, 25% = 1,250만원이 공제 기준선. 그 위로 쓴 금액만 공제 대상. 1,250만원까지는 신용카드 우대(포인트 적립 등) 활용, 초과분은 체크카드·전통시장·대중교통으로 전환.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 환급 시뮬 — 5,000만원 연봉</h2>
<ul class="space-y-2 mt-4">
<li>· 25% 기준선: 1,250만원</li>
<li>· 연 카드 사용 2,500만원 가정</li>
<li>· 초과분 1,250만원을 모두 신용카드: 1,250 × 15% = 187.5만원 공제 → 환급 약 45만원</li>
<li>· 초과분 1,250만원을 체크+전통시장+대중교통: 평균 35% 공제 = 437.5만원 → 환급 약 105만원</li>
<li>· <strong>차이: 60만원 추가 환급</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 한도 (총급여별)</h2>
<ul class="space-y-2 mt-4">
<li>· 총급여 7,000만원 이하: 한도 300만원</li>
<li>· 7,000만원 초과 ~ 1.2억: 한도 250만원</li>
<li>· 1.2억 초과: 한도 200만원</li>
<li>· 전통시장·대중교통·도서공연은 별도 한도 100만원씩 추가</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 부부 결제 분리</h2>
<p>
신용카드 공제는 결제자(본인) 기준. 가족 명의 카드로 결제하면 그 가족의 공제로 잡힘. 부부 중 한 사람에게 결제를 몰아 25% 기준선을 빠르게 넘기는 게 유리.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/year-end-tax" class="text-primary underline">연말정산 환급금 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 29. 부동산 임대업 등록 종부세 합산 배제
// ═══════════════════════════════════════════════════════════════
const rentalBusinessPropTax = `
<p class="lead">
다주택자가 임대주택을 8년·10년 장기 임대사업자로 등록하면 그 주택은 종합부동산세 합산 대상에서 배제. 다주택 종부세 부담을 크게 줄이는 핵심 방법.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 등록 임대주택 종부세 합산 배제 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>임대 기간</strong>: 8년 장기 또는 10년 단기 등록 (현재는 10년 장기만 신규)</li>
<li>· <strong>임대료 상한</strong>: 연 5% 이내 인상</li>
<li>· <strong>면적</strong>: 전용 85㎡ 이하 (수도권 외 100㎡)</li>
<li>· <strong>공시가</strong>: 6억 이하 (수도권 외 3억)</li>
<li>· <strong>등록</strong>: 렌트홈(rent.go.kr) 또는 시청 임대등록</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 합산 배제 효과</h2>
<p>
3주택 보유자(본채 + 임대 2채), 총 공시가 18억 가정:
</p>
<ul class="space-y-2 mt-4">
<li>· <strong>등록 전</strong>: 18억 전체 종부세 부담 → 약 1,800만원/년</li>
<li>· <strong>임대 2채 등록 후</strong>: 본채 공시가 8억만 종부세 → 약 0원 (1주택자 12억 공제)</li>
<li>· <strong>연 절감: 약 1,800만원</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 추가 혜택</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 양도세 우대</strong>: 등록 임대주택 매도 시 장기보유특별공제 추가 적용 (최대 70%)</li>
<li><strong>② 재산세 감면</strong>: 신축 임대주택 25~75% 재산세 감면</li>
<li><strong>③ 임대소득세 분리과세 우대</strong>: 등록 임대는 필요경비율 60% (비등록 50%) + 기본공제 400만원 (비등록 200만원)</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 단점·의무</h2>
<ul class="space-y-2 mt-4">
<li>· 임대료 5% 상한 — 시세 상승 시 임대료 손해</li>
<li>· 임대기간 10년 동안 매도 시 위반 과태료 + 그동안 혜택 환수</li>
<li>· 임대 의무 위반 시 최대 3,000만원 과태료</li>
<li>· 2020년 이후 신축 다세대·다가구는 등록 제한</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/property-holding-tax-2026" class="text-primary underline">부동산 보유세 계산기</a></li>
<li>· <a href="/calc/real-estate-capital-gains-quick" class="text-primary underline">부동산 양도세 빠른 계산</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 30. 출산휴가 + 육아휴직 6+6 부모 통합
// ═══════════════════════════════════════════════════════════════
const parentalLeave66 = `
<p class="lead">
2024년 신설된 "6+6 부모 육아휴직" 제도는 부모가 각각 6개월씩 육아휴직 시 첫 6개월 통상임금 100%(상한 월 450만원) 지급. 출산휴가 90일과 합산 시 부모 합산 약 2,400~3,200만원의 정부 지원금 가능.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 6+6 부모 육아휴직 핵심</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 첫 6개월</strong>: 통상임금 100% (월 상한 250만원~450만원, 차수별 인상)</li>
<li><strong>② 7~12개월</strong>: 통상임금 80% (월 상한 150만원)</li>
<li><strong>③ 부모 모두 사용 시</strong>: 둘 다 6개월 100% 지원</li>
<li><strong>④ 사용 기간 제한</strong>: 자녀 만 18세까지 (영유아는 통상 출산 1~2년 내 권장)</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 1자녀 가정 정부 지원 총액</h2>
<div class="overflow-x-auto my-6">
<table class="w-full text-sm border border-border">
<thead class="bg-secondary"><tr><th class="p-3">단계</th><th class="p-3">기간</th><th class="p-3">지원금</th></tr></thead>
<tbody>
<tr class="border-t"><td class="p-3">출산휴가 (산모)</td><td class="p-3">90일</td><td class="p-3">월 통상임금 100% (상한 별도)</td></tr>
<tr class="border-t"><td class="p-3">아빠 육아휴직</td><td class="p-3">최대 12개월</td><td class="p-3">6+6 적용 시 첫 6개월 100%</td></tr>
<tr class="border-t"><td class="p-3">엄마 육아휴직</td><td class="p-3">최대 12개월</td><td class="p-3">6+6 적용 시 첫 6개월 100%</td></tr>
<tr class="border-t"><td class="p-3">총 부모 합산</td><td class="p-3">최대 약 24개월</td><td class="p-3">약 2,400~3,200만원</td></tr>
</tbody>
</table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 사용 전략</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 출산 직후 부모 동시 사용 가능</strong>: 산모 출산휴가 + 아빠 육아휴직 동시. 신생아 적응 + 산모 회복기 가족 케어.</li>
<li><strong>② 순차 사용</strong>: 아빠가 먼저 6개월 → 엄마가 그 다음 6개월. 둘 다 100% 지원 받음.</li>
<li><strong>③ 분할 사용</strong>: 자녀 만 18세까지 분할 가능. 어린이집 적응기·초등 입학기 등 핵심 시점에 활용.</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 함정 — 회사 권유 거부 가능</h2>
<p>
법적으로 회사는 육아휴직 신청을 거부할 수 없음. 단 인사 평가나 복귀 후 보직 등에서 불이익 발생 시 노동부·노동위원회 진정 가능. 또한 휴직 후 복귀하지 않으면 지원금 일부 환수.
</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/parental-leave" class="text-primary underline">육아휴직 급여 계산기</a></li>
<li>· <a href="/unemployment-benefit" class="text-primary underline">실업급여 계산기</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 31. 쿠팡 풀필먼트 야간 알바 시급
// ═══════════════════════════════════════════════════════════════
const coupangFulfillmentPay = `
<p class="lead">
쿠팡 풀필먼트 센터(CFS)는 전국 30+ 거점에서 운영되며 야간·새벽 알바 수요 매우 큼. 2026년 기준 야간(22시~6시) 시급은 기본 + 야간수당 50% 가산 = 약 1만 5천~1만 8천원 수준. 주휴수당까지 포함하면 주 40시간 풀타임 월 약 280~330만원 가능.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 쿠팡 풀필먼트 시급 구조 (2026)</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>기본 시급</strong>: 약 10,500~11,500원 (최저시급 + 알파)</li>
<li>· <strong>야간 가산</strong>: 22~06시 근무 시 50% 추가 → 약 15,750~17,250원</li>
<li>· <strong>휴일 가산</strong>: 일·공휴일 근무 50% 추가</li>
<li>· <strong>주휴수당</strong>: 주 15시간+ 근무 + 개근 시 추가 (별도)</li>
</ul>

<h2 class="mt-12 text-2xl function-bold text-primary">💰 월급 시뮬 — 야간 풀타임</h2>
<p>
야간 시급 17,000원 × 주 40시간 × 4.345주 = 약 295만원
</p>
<ul class="space-y-2 mt-4">
<li>· 주휴수당 (주 8시간분 17,000원): 월 약 59만원 추가</li>
<li>· <strong>월 총수입: 약 354만원</strong></li>
<li>· 4대보험·소득세 공제 후 실수령 약 305~315만원</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 신청·근무 패턴</h2>
<ol class="space-y-2 mt-4">
<li>1. 쿠팡플렉스 또는 쿠팡 단기근무 앱에서 신청</li>
<li>2. 출근 시간대 선택 — 보통 22시·02시 두 타임</li>
<li>3. 1회 근무 8시간 기준 (휴게 1시간 별도)</li>
<li>4. 일급 즉시 정산 또는 주급/월급 선택</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 주의사항</h2>
<ul class="space-y-2 mt-4">
<li>· 야간 근무 강도 매우 높음 — 평균 시간당 200~300개 패킹·픽킹</li>
<li>· 일부 센터는 안전사고 발생 — 보호장구 착용 필수</li>
<li>· 단기 알바라도 산재보험 자동 가입 (사업주 부담)</li>
<li>· 3.3% 원천징수 후 종합소득세 신고 의무 (연 500만원 초과 시)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">📌 관련 도구</p>
<ul class="space-y-1 text-sm">
<li>· <a href="/weekly-holiday-allowance-2026" class="text-primary underline">주휴수당 계산기</a></li>
<li>· <a href="/table/2026/hourly" class="text-primary underline">2026 시급 실수령액 표</a></li>
<li>· <a href="/salary-db/coupang" class="text-primary underline">쿠팡 정직원 연봉 정보</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// Export — 31개 가이드 통합
// ═══════════════════════════════════════════════════════════════
export const hotNewsMay2026: Guide[] = [
  {
    slug: "samsung-wage-negotiation-status-2026",
    title: "삼성전자 2026 임금협상 본격 시작 — 5월 12일, 5대 쟁점 총정리",
    description:
      "5월 12일 본교섭 시작. 기본급 인상률 6%, OPI 산정 변경, TAI 통합, 복지포인트 150만원까지 5대 쟁점. HBM3E 양산 안정화가 PS 1,000% 가능 변수.",
    category: "연봉",
    tags: ["삼성전자", "임금협상", "OPI", "PS", "성과급", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: samsungWageStatus,
    lang: "ko",
  },
  {
    slug: "sk-hynix-ps-bonus-2026",
    title: "SK하이닉스 2026 PS 성과급 — 기본급 2,000% 가능할까",
    description:
      "2025년 영업이익 25조원 → 2026년 40조원+ 전망. PS 한도 2,000% 가능성. 기본급 5,000만원 직원 7,500만원 추가 지급 + IRP 절세 119만원 환급.",
    category: "연봉",
    tags: ["SK하이닉스", "PS", "성과급", "HBM", "메모리", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: skHynixPS2026,
    lang: "ko",
  },
  {
    slug: "lgensol-wage-negotiation-2026",
    title: "LG에너지솔루션 2026 임금협상 — 배터리 캐즘 종료, 인상률 5%+",
    description:
      "전기차 캐즘 종료 + ESS 본격화로 LG엔솔 2026 임금협상 인상률 5%+ 전망. 신입 영끌 5,500~6,500만원, 시니어 9,500~12,000만원. 미국 파견 인센티브 확대.",
    category: "연봉",
    tags: ["LG에너지솔루션", "배터리", "임금협상", "전기차", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: lgensolWage2026,
    lang: "ko",
  },
  {
    slug: "kakao-rsu-tax-saving-2026",
    title: "카카오 RSU 5년 베스팅 + 양도세 절세 5가지 — 1억 매도 시 165만원 절감",
    description:
      "카카오 RSU 베스팅 시 근로소득세 38.5%, 매도 시 양도세 22%. 분할 매도·손익 통산·부부 합산·이월결손금·즉시 매도까지 5가지 절세 전략으로 165만원+ 절감.",
    category: "주식",
    tags: ["카카오", "RSU", "양도세", "스톡옵션", "절세", "2026"],
    level: "고급",
    publishedDate: "2026-05-23",
    views: 0,
    content: kakaoRsuTax,
    lang: "ko",
  },
  {
    slug: "toss-rsu-ipo-tax-2026",
    title: "토스 비상장 RSU + IPO 양도세 절세 — 임직원 필수 가이드",
    description:
      "토스 IPO 가시화. 비상장 RSU 베스팅 시 근로소득 인식 + 매도 불가 기간 + IPO 후 6개월 lockup. IRP 추가 납입·증여세 활용 등 4가지 절세 전략.",
    category: "주식",
    tags: ["토스", "RSU", "IPO", "비상장", "양도세", "2026"],
    level: "고급",
    publishedDate: "2026-05-23",
    views: 0,
    content: tossRsuTax,
    lang: "ko",
  },
  {
    slug: "naver-rsu-tax-strategy-2026",
    title: "네이버 RSU 행사 양도세 절세 — 1억 매도 시 실수령 5,875만원 확보",
    description:
      "네이버 RSU 베스팅 즉시 매도/단기/장기 보유 3가지 전략 비교. 1억 차익 시 베스팅 근로소득세 3,850만원 + 양도세 275만원 → 절세 4가지로 추가 절감.",
    category: "주식",
    tags: ["네이버", "RSU", "양도세", "스톡옵션", "절세", "2026"],
    level: "고급",
    publishedDate: "2026-05-23",
    views: 0,
    content: naverRsuStrategy,
    lang: "ko",
  },
  {
    slug: "youth-leap-account-2026",
    title: "2026 청년도약계좌 정부기여금 144만원 — 5년 만기 5,083만원",
    description:
      "만 19~34세, 연소득 7,500만원 이하. 월 70만원 × 5년 = 원금 4,200만원 + 정부기여금 144만원 + 이자 비과세 99만원 절감 = 만기 5,083만원.",
    category: "투자",
    tags: ["청년도약계좌", "정부기여금", "청년", "적금", "비과세", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    views: 0,
    content: youthLeapAccount,
    lang: "ko",
  },
  {
    slug: "isa-maturity-tax-saving-2026",
    title: "ISA 만기 비과세 200만원 + 9.9% 분리과세 — 일반 계좌 대비 150만원 절감",
    description:
      "5,000만원 원금 → 7,000만원 만기 시 일반 증권 308만원 세금 vs ISA 서민형 158만원 = 150만원 절감. 연 2,000만원 한도, 5년 누적 1억. 만기 후 IRP 전환 시 추가 공제 300만원.",
    category: "세금",
    tags: ["ISA", "비과세", "분리과세", "만기", "절세", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: isaMaturity,
    lang: "ko",
  },
  {
    slug: "one-home-prop-tax-12억-2026",
    title: "1세대 1주택 종합부동산세 12억 공제 — 공시가 12억 이하 종부세 0원",
    description:
      "1세대 1주택자 종부세 12억 공제 + 고령자·장기보유 최대 80% 추가 감면. 공시가 15억 = 종부세 90만원, 다주택자 600만원 대비 1/7. 부부 공동명의 각자 6억 vs 통합 12억 비교.",
    category: "부동산",
    tags: ["종합부동산세", "1주택자", "종부세", "공제", "보유세", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: oneHomePropTax,
    lang: "ko",
  },
  {
    slug: "didimdol-newborn-special-loan-2026",
    title: "디딤돌 신생아 특례대출 1.6% — 5억 30년 시 2억 8천만원 절감",
    description:
      "2023년 이후 출생 자녀 + 부부 소득 1.3억 이하 + 주택 9억 이하. 최저 1.6% 금리로 5억 30년 대출 시 시중 4.5% 대비 약 2억 8천만원 이자 절감. 자녀 추가 출산 시 우대.",
    category: "부동산",
    tags: ["디딤돌대출", "신생아특례", "주택구입", "정책대출", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: didimdolNewborn,
    lang: "ko",
  },
  {
    slug: "housing-subscription-25man-deduction-2026",
    title: "청약통장 매월 25만원 소득공제 300만원 — 매년 46만원 환급 + 청약 가점",
    description:
      "무주택 세대주 + 총급여 7천만원 이하. 청약통장 월 25만원 × 40% = 120만원 공제 → 한계세율 35% 시 46.2만원 환급. 5년 1,500만원이면 청약 가점 만점.",
    category: "부동산",
    tags: ["청약통장", "소득공제", "주택청약", "절세", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    views: 0,
    content: housing25Man,
    lang: "ko",
  },
  {
    slug: "internet-bank-savings-5percent-2026",
    title: "2026 카카오뱅크·토스뱅크·케이뱅크 5% 적금 비교 — 우대조건 함정",
    description:
      "카카오뱅크 26주적금 최대 7%, 토스뱅크 자유적금 5.5%, 케이뱅크 5.0%. 우대조건(카드 사용 30만·급여이체·자동이체 등) 충족 필수. 시중은행 3.2% 대비 1년 12~25만원 추가 이자.",
    category: "투자",
    tags: ["적금", "인터넷은행", "카카오뱅크", "토스뱅크", "케이뱅크", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    views: 0,
    content: internetBankSavings,
    lang: "ko",
  },
  {
    slug: "us-stock-tax-saving-5strategies-2026",
    title: "미국주식 양도세 22% 절세 5가지 — 2,000만원 차익 시 165만원 절감",
    description:
      "분할 매도 250만원 공제·손익 통산·이월결손금 10년·부부 합산·ISA 활용 5가지 전략. 2,000만원 차익 시 일시 매도 385만원 → 4년 분할 220만원으로 165만원 절감.",
    category: "주식",
    tags: ["미국주식", "양도세", "해외주식", "절세", "ISA", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: usStockTaxSaving,
    lang: "ko",
  },
  {
    slug: "side-hustle-n-jab-tax-2026",
    title: "부업·N잡 종합소득세 신고 절세 — 5월 미신고 시 가산세 최대 40%",
    description:
      "사업소득 3.3% 원천징수·기타소득 8.8%·사업자등록 부가세 분리. 필요경비(노트북·통신비·차량·교육비) 활용 + 단순경비율/기준경비율/실비 신고 선택으로 절세.",
    category: "세금",
    tags: ["종합소득세", "부업", "N잡", "프리랜서", "필요경비", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: sideHustleTax,
    lang: "ko",
  },
  {
    slug: "crypto-tax-deferred-2027-2026",
    title: "가상자산 양도세 2027년 유예 — 2026년 코인 투자자 점검 3가지",
    description:
      "2025→2027년 1월 추가 유예. 2026년 동안 취득가 기록 정리·손실 종목 매도·양도세 시뮬 필수. 시행 시 22% + 연 250만원 공제 + 5년 이월결손금.",
    category: "투자",
    tags: ["가상자산", "코인", "암호화폐", "양도세", "유예", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: cryptoTaxDeferred,
    lang: "ko",
  },
  {
    slug: "credit-score-850-strategy-2026",
    title: "신용점수 6개월 850 만드는 5가지 — 대출 금리 2~4%p 절감",
    description:
      "카드 사용액 한도 30% 이하·자동이체 6건·카뱅/토스 신용관리·마통 자제·카드론 즉시 정리. 750점 → 900점 시 5천만원 1년 대출 이자 약 175만원 절감.",
    category: "기초",
    tags: ["신용점수", "신용평가", "대출 금리", "마이너스통장", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    views: 0,
    content: creditScore850,
    lang: "ko",
  },
  {
    slug: "parent-support-deduction-integration-2026",
    title: "부모 부양 인적공제 + 의료비 통합 절세 — 매년 100만원 환급",
    description:
      "60세+ 부모 인적공제 150만원 + 경로우대 100만원 + 부모 의료비 100% 공제. 형제 중 한계세율 높은 자녀가 등록 시 환급 효과 최대. 피부양자 자격은 별도 점검.",
    category: "세금",
    tags: ["인적공제", "부모 부양", "의료비공제", "연말정산", "절세", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: parentSupportDeduction,
    lang: "ko",
  },
  {
    slug: "irp-pension-payout-tax-2026",
    title: "IRP·연금저축 만기 수령 절세 — 일시금 16.5% vs 연금 5.5%",
    description:
      "1억 IRP/연금저축 수령 시 일시금 16.5% = 1,650만원 vs 10년 연금 5.5% = 550만원 → 1,100만원 절감. 만 70세+ 4.4%, 만 80세+ 3.3% 추가 절세.",
    category: "세금",
    tags: ["IRP", "연금저축", "연금수령", "절세", "노후", "2026"],
    level: "고급",
    publishedDate: "2026-05-23",
    views: 0,
    content: irpPensionPayout,
    lang: "ko",
  },
  {
    slug: "rental-income-2000man-tax-2026",
    title: "임대소득 2,000만원 분리과세 vs 종합과세 — 200~400만원 절세",
    description:
      "임대 1,500만원 분리과세 14% = 210만원 vs 2,500만원 종합과세 35% = 875만원. 임대료 200만원 차이로 600만원 세금 차이. 등록임대주택은 필요경비율 60% + 공제 400만원 우대.",
    category: "부동산",
    tags: ["임대소득", "분리과세", "종합과세", "임대사업자", "2026"],
    level: "고급",
    publishedDate: "2026-05-23",
    views: 0,
    content: rentalIncome2000,
    lang: "ko",
  },
  {
    slug: "newborn-special-loan-application-2026",
    title: "신생아 특례대출 1.6% 5억 — 자격·신청 절차·금리 우대 총정리",
    description:
      "2023년 이후 출생 자녀 + 부부 1.3억 이하 + 주택 9억 이하. 5억 30년 시 시중은행 4.5% 대비 약 2억 8천만원 이자 절감. 자녀 추가 출산 시 0.2%p 우대.",
    category: "부동산",
    tags: ["신생아특례대출", "디딤돌", "정책대출", "출산", "내집마련", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: newbornSpecialLoan,
    lang: "ko",
  },
  {
    slug: "postpartum-medical-deduction-200man-2026",
    title: "2026 산후조리원 의료비 공제 200만원 — 출산 환급액 70만원",
    description:
      "총급여 7천만원 이하 직장인. 산후조리원 200만원 한도 의료비 공제 + 출산 의료비 합산. 한계세율 24% 시 약 7만원 환급. 영수증 5년 보관 + 부부 중 총급여 낮은 쪽 공제 유리.",
    category: "세금",
    tags: ["산후조리원", "의료비공제", "출산", "연말정산", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    views: 0,
    content: postpartumMedical,
    lang: "ko",
  },
  {
    slug: "implant-dental-medical-deduction-2026",
    title: "임플란트·치과 의료비 공제 — 4개 600만원 시 70만원 환급",
    description:
      "임플란트·교정·보철·스케일링 모두 의료비 공제. 600만원 시 총급여 3% 초과분 420만원 × 15% = 63만원 환급. 미용 목적 제외. 영수증 + 카드 결제 + 부부 한쪽 몰아주기 전략.",
    category: "세금",
    tags: ["임플란트", "치과", "의료비공제", "교정", "환급", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    views: 0,
    content: implantMedical,
    lang: "ko",
  },
  {
    slug: "youth-housing-dream-1억-2026",
    title: "청년주택드림 청약통장 — 만 19~34세, 5년 누적 635만원 혜택 + 1.3억 대출",
    description:
      "만 19~34세, 연소득 5천만원 이하. 4.5% 우대 적금 + 소득공제 600만원 + 청년주택드림 대출 1.3억 자격. 월 50만원 5년 시 총 혜택 635만원.",
    category: "부동산",
    tags: ["청년주택드림", "청약통장", "청년", "내집마련", "디딤돌", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: youthHousingDream,
    lang: "ko",
  },
  {
    slug: "one-home-capital-gains-12억-2026",
    title: "1세대 1주택 양도세 12억 비과세 — 15억 매도 시 세금 1,265만원",
    description:
      "1세대 1주택 + 보유 2년 + 거주 2년(조정) + 12억 이하 = 양도세 0원. 15억 매도 시 초과분 3억만 과세, 장기보유공제 48% 적용 시 약 1,265만원. 10년+10년 시 80% 공제.",
    category: "부동산",
    tags: ["양도세", "1세대1주택", "12억", "비과세", "장기보유공제", "2026"],
    level: "고급",
    publishedDate: "2026-05-23",
    views: 0,
    content: oneHomeCapitalGains,
    lang: "ko",
  },
  {
    slug: "multi-home-heavy-tax-2026",
    title: "다주택자 양도세 중과 폐지 vs 유지 — 2026년 5월 분기점, 1억 손해 가능",
    description:
      "조정 2주택 +20%p, 3주택+ +30%p 중과. 2022~2025년 한시 폐지 → 2026년 5월 재시행 가능성. 차익 5억 시 폐지 1.4억 vs 재시행 2.5억 = 1.1억 차이.",
    category: "부동산",
    tags: ["다주택자", "양도세", "중과세", "조정대상지역", "2026"],
    level: "고급",
    publishedDate: "2026-05-23",
    views: 0,
    content: multiHomeHeavyTax,
    lang: "ko",
  },
  {
    slug: "youth-investment-savings-tax-free-2026",
    title: "청년형 장기집합투자증권저축 — 5년 252만원 절세 + 청년도약 중복",
    description:
      "만 19~34세, 총급여 5천만원 이하. 월 60만원 × 5년 시 운용수익 비과세 108만원 + 소득공제 환급 144만원. 청년도약계좌·청년주택드림과 모두 중복 가능.",
    category: "투자",
    tags: ["청년형장기투자", "비과세", "소득공제", "청년", "펀드", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: youthInvestmentSavings,
    lang: "ko",
  },
  {
    slug: "monthly-rent-tax-credit-17-2026",
    title: "월세 세액공제 17% — 무주택자 750만원 한도, 매년 100만원 환급",
    description:
      "무주택 세대주 + 총급여 7천만원 이하. 월세 50만원(연 600만원) × 17% = 102만원 환급. 5년 미신청자 경정청구로 누적 400~500만원 환급 가능.",
    category: "세금",
    tags: ["월세", "세액공제", "무주택", "전세대출", "연말정산", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    views: 0,
    content: monthlyRentTaxCredit,
    lang: "ko",
  },
  {
    slug: "credit-card-deduction-30-40-strategy-2026",
    title: "신용카드 공제 25% 초과분 — 체크/전통시장/대중교통 전환 시 환급 60만원 추가",
    description:
      "총급여 5천만원 25% = 1,250만원 초과분만 공제. 신용카드 15% vs 체크 30%, 전통시장 40%, 대중교통 40%. 초과분을 고공제 카테고리로 전환 시 매년 60만원+ 추가 환급.",
    category: "세금",
    tags: ["신용카드", "체크카드", "전통시장", "대중교통", "소득공제", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: cardDeductionStrategy,
    lang: "ko",
  },
  {
    slug: "rental-business-prop-tax-exclusion-2026",
    title: "부동산 임대업 등록 종부세 합산 배제 — 다주택자 연 1,800만원 절세",
    description:
      "임대 8년·10년 장기 등록 + 임대료 5% 상한 + 전용 85㎡ 이하 + 공시가 6억 이하. 3주택자 종부세 1,800만원 → 본채만 0원으로 절감. 양도세·재산세 우대도 동시.",
    category: "부동산",
    tags: ["임대사업자", "종합부동산세", "다주택자", "장기임대", "절세", "2026"],
    level: "고급",
    publishedDate: "2026-05-23",
    views: 0,
    content: rentalBusinessPropTax,
    lang: "ko",
  },
  {
    slug: "parental-leave-6plus6-2026",
    title: "출산휴가 + 6+6 부모 육아휴직 — 부모 합산 정부 지원 3,200만원",
    description:
      "산모 출산휴가 90일 + 아빠/엄마 각 6개월 100%(월 상한 450만원) + 7~12개월 80%. 1자녀 가정 부모 합산 약 24개월 휴직 + 정부 지원 2,400~3,200만원.",
    category: "커리어",
    tags: ["출산휴가", "육아휴직", "부모육아휴직", "정부지원금", "출산", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: parentalLeave66,
    lang: "ko",
  },
  {
    slug: "coupang-fulfillment-night-pay-2026",
    title: "쿠팡 풀필먼트 야간 알바 — 시급 17,000원 + 주휴수당 월 354만원",
    description:
      "쿠팡 풀필먼트 야간(22~6시) 시급 약 15,750~17,250원. 주 40시간 + 주휴수당 시 월 약 354만원, 실수령 305~315만원. 산재보험 자동 가입 + 종소세 신고 의무.",
    category: "연봉",
    tags: ["쿠팡", "풀필먼트", "야간 알바", "주휴수당", "시급", "2026"],
    level: "초급",
    publishedDate: "2026-05-23",
    views: 0,
    content: coupangFulfillmentPay,
    lang: "ko",
  },
];
