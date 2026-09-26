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
<div class="mt-2 mb-8 p-5 bg-primary/5 rounded-2xl border border-primary/20">
<p class="font-bold text-primary mb-2">🔄 2026-08-25 업데이트 — 이후 확정된 사실</p>
<ul class="space-y-1 text-sm">
<li>· 2025년분 PS는 <strong>기본급의 2,964%</strong>로 확정 지급됐습니다(2026-02-05, 영업이익 47.2조·상한 1,000% 폐지 첫 적용). 아래 본문의 '한도 1,000%'·'25조' 서술은 작성 시점(2026-05) 전망입니다.</li>
<li>· 2026-08-20 임단협 잠정합의안(PS 현금 40% + 자사주 60%)은 2026-08-25 총투표에서 부결됐고, 수정안(<strong>당해 현금 50% + 자사주 30%, 1·2년 후 자사주 10%씩</strong>)이 <strong>2026-09-16 총투표에서 가결</strong>되어 2026년분부터 적용됩니다.</li>
<li>· 최신 수치·신구 체계 비교는 <a href="/calc/sk-hynix-bonus" class="text-primary underline">SK하이닉스 성과급 계산기</a>를 참고하세요.</li>
</ul>
</div>
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
<li>· <a href="/industry/chemical-energy" class="text-primary underline">화학·에너지·배터리 업계 연봉 순위</a></li>
</ul>
</div>
`;

// ═══════════════════════════════════════════════════════════════
// 4. 카카오 RSU 5년 베스팅 양도세 절세
// ═══════════════════════════════════════════════════════════════
const kakaoRsuTax = `
<p class="lead">RSU는 주식을 받는 단계와 받은 주식을 파는 단계를 나누어 확인해야 합니다. 카카오라는 회사명만으로 베스팅 기간이나 매도 세율이 결정되지 않습니다. 부여 계약, 실제 발행법인, 거주자 여부와 거래 시장을 먼저 확인하세요.</p>
<h2>주식 수령과 매도, 두 단계의 확인</h2>
<p>근로의 대가로 받는 주식 보상은 근로소득 과세와 원천징수 여부를 확인해야 합니다. 권리 확정·주식 인도 조건에 따른 귀속과 평가 금액은 부여 계약과 급여명세서로 대조하세요. 모든 수령자에게 38.5%가 적용되는 것은 아닙니다.</p>
<p>국세청의 2026년 안내에 따르면 국내 상장주식을 장내에서 거래하는 소액주주는 일반적으로 양도소득세 대상이 아닙니다. 대주주·장외거래·비상장주식·국외주식은 판단이 달라집니다. 국내 상장 카카오 주식의 모든 매도차익에 국외주식용 22% 계산을 적용할 수 없습니다. 양도소득세 비과세와 증권거래세·수수료는 별개입니다.</p>
<h2>매도 전 확인표</h2>
<ol>
<li><strong>계약:</strong> 본인의 지급 일정·재직 조건·매도 제한을 확인합니다. 일괄 4~5년 베스팅으로 가정하지 않습니다.</li>
<li><strong>수령 증빙:</strong> 지급 주식 수, 평가 금액, 원천징수 내역을 보관합니다.</li>
<li><strong>과세 유형:</strong> 발행법인·거래 시장·대주주 해당 여부를 구분합니다. 국외주식용 계산기에 국내 장내 비과세 주식을 넣지 않습니다.</li>
<li><strong>손익과 공제:</strong> 과세 대상일 때 해당 연도의 통산 범위·기본공제·취득가액을 확인합니다. 전년도 손실을 자동으로 10년 이월하지 않습니다.</li>
<li><strong>명의 변경:</strong> 배우자 증여는 취득가액과 이후 매도 과세까지 확인해야 합니다. 일정 금액의 절감을 보장하지 않습니다.</li>
</ol>
<p>근거: <a href="https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?mi=&amp;nttSn=1348384">국세청 주식 양도소득세 안내(2026-02-03)</a>. 이 자료는 주식 양도 과세 구분의 근거이며 카카오의 개별 보상 계약을 확인한 자료는 아닙니다.</p>
<p><a href="/salary-db/kakao">카카오 연봉 자료와 기준 보기</a> · <a href="/tools/finance/stock-tax">주식 양도세 계산기 — 과세 유형을 확인한 뒤 사용</a></p>
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
청년도약계좌는 만 19~34세 청년이 5년간 매월 최대 70만원을 납입하면 정부가 최대 144만원의 기여금 + 이자소득 비과세 혜택을 주는 5년 만기 적금입니다. 2025-12-31 신규 가입 종료(청년미래적금 참고) — 기존 가입자 기준으로 정리합니다.
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
<p class="lead">개인 주택분 종합부동산세 기본공제는 인별 9억원, 법령상 1세대 1주택자는 12억원입니다. 다주택 개인의 공제가 0원이거나 부부 공동명의 공제가 각 6억원인 것은 아닙니다.</p>
<h2>먼저 확인할 보유 조건</h2>
<ul><li>과세기준일 6월 1일의 소유자와 세대별 주택 보유를 확인합니다.</li><li>주택 수 제외·합산배제 등 특례는 요건과 신청을 별도로 확인합니다.</li><li>부부 공동명의는 지분별 인별 과세가 기본이며 공동명의 1주택자 특례 선택 여부에 따라 공제 구조가 달라집니다.</li><li>양도소득세의 주택 수 판정을 종부세에 그대로 적용하지 않습니다.</li></ul>
<h2>공시가격에서 과세표준까지 검산</h2>
<p>개인 주택분, 공정시장가액비율 60%를 가정한 표입니다. 인별 공시가격 합계에서 해당 공제를 뺀 양수 금액에 60%를 곱합니다. <strong>아래 금액은 납부 세금이 아니라 과세표준</strong>입니다.</p>
<div class="overflow-x-auto"><table><thead><tr><th>인별 공시가격 합계</th><th>1세대 1주택자(12억 공제)</th><th>일반 개인(9억 공제)</th></tr></thead><tbody>
<tr><td>10억원</td><td>0원</td><td>6,000만원</td></tr><tr><td>15억원</td><td>1억 8,000만원</td><td>3억 6,000만원</td></tr><tr><td>20억원</td><td>4억 8,000만원</td><td>6억 6,000만원</td></tr><tr><td>30억원</td><td>10억 8,000만원</td><td>12억 6,000만원</td></tr>
</tbody></table></div>
<p>법인·토지는 이 표의 대상이 아닙니다. 최종 세액에는 주택 수·과세표준별 세율, 공제할 재산세, 세액공제와 세부담 상한 등을 추가 적용합니다. 종부세가 없어도 재산세는 별개입니다.</p>
<h2>공동명의와 고령·장기보유 공제 비교</h2>
<p>공동명의 지분별 공제와 1주택자 특례를 비교할 때 공제액만 비교하지 마세요. 해당 1세대 1주택자의 고령자 공제는 60~64세 20%, 65~69세 30%, 70세 이상 40%, 장기보유 공제는 5~9년 20%, 10~14년 40%, 15년 이상 50%이며 합산 한도는 80%입니다. 각 요건을 따로 판단합니다.</p>
<p>근거: <a href="https://i.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7735&amp;mi=2353">국세청 종합부동산세 계산 흐름도</a>.</p>
<p><a href="/property-holding-tax-2026">재산세와 종부세 계산</a> · <a href="/guides/newlywed-asset-tax-saving-2026">부부 명의와 공제 확인표</a></p>
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
미국주식(해외주식) 양도차익에는 22%(소득세 20% + 지방소득세 2%) 세금. 한국 주식과 달리 대주주 여부와 무관하게 모든 양도차익에 과세. 다만 연 250만원 기본공제, 같은 해 손익 통산 등 절세 전략이 다양합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 절세 5가지 핵심</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 분할 매도로 250만원 공제 활용</strong>: 매년 250만원 공제 → 5년 분할 매도 시 1,250만원 비과세 효과</li>
<li><strong>② 손익 통산</strong>: 같은 해 손실 종목과 통산. 예: A 종목 +500, B 종목 -300 → 순이익 200만원만 과세</li>
<li><strong>③ 손실은 같은 해에 정리</strong>: 해외주식 양도차손은 같은 해 통산만 가능, 이월 불가</li>
<li><strong>④ 부부 합산 활용</strong>: 배우자 명의로 일부 매도 → 각자 250만원 공제 → 부부 합산 500만원 비과세</li>
<li><strong>⑤ ISA 활용</strong>: ISA로 미국 ETF 투자 → 차익 비과세 200만원 + 초과분 9.9% 분리과세</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 신고 시기</h2>
<p>
매년 5월 1~31일 종합소득세 신고와 함께 양도소득세 확정신고. 양도차익 발생 시 자동 신고 의무. 미신고 시 가산세 최대 40% 부과.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 절세 시뮬</h2>
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
<p class="lead">부모님을 부양가족으로 올리면 1명당 <strong>기본공제 150만원</strong>, 70세 이상이면 <strong>경로우대 추가공제 100만원</strong>을 소득에서 뺍니다. 2026년 귀속 요건은 1966년 12월 31일 이전 출생(60세 이상)과 연간 소득금액 100만원 이하이고, 경로우대는 1956년 12월 31일 이전 출생(70세 이상)입니다. 따로 사셔도 실제로 부양하면 되고, 부모님 의료비는 나이·소득과 관계없이 공제되지만 형제 중 누군가 부모님을 기본공제했다면 그 사람이 직접 낸 의료비만 인정됩니다. 기준일은 2026년 9월 26일, 근거는 소득세법 제50조·제51조입니다.</p>

<h2>공제 요건 — 나이·소득·생계</h2>
<table class="w-full text-sm">
<thead><tr><th>요건</th><th>2026년 귀속 기준</th><th>확인할 점</th></tr></thead>
<tbody>
<tr><td>나이</td><td>60세 이상 — 1966년 12월 31일 이전 출생</td><td>그해 중 60세가 되는 날이 있으면 인정. 장애인은 나이 제한 없음</td></tr>
<tr><td>소득</td><td>연간 소득금액 100만원 이하 (근로소득만 있으면 총급여 500만원 이하)</td><td>비과세·분리과세 소득은 빼고 판단</td></tr>
<tr><td>생계</td><td>주거 형편상 따로 살아도 실제로 부양하면 인정</td><td>해외로 이주해 사는 부모님은 제외</td></tr>
<tr><td>중복</td><td>형제자매 중 한 명만 공제</td><td>배우자의 부모님(장인·장모, 시부모)도 대상</td></tr>
<tr><td>경로우대</td><td>70세 이상 — 1956년 12월 31일 이전 출생</td><td>기본공제를 받는 사람만 추가공제 가능</td></tr>
</tbody>
</table>
<p>'소득금액 100만원'은 수입 전체가 아니라 필요경비·공제를 뺀 금액이고, 종합소득뿐 아니라 퇴직소득·양도소득도 합칩니다. 부모님 소득 종류별 판단은 다음과 같습니다(국세상담센터 상담사례).</p>
<ul>
<li><strong>국민연금 등 공적연금만 있는 경우</strong>: 과세 대상 연금액(2002년 이후 납입분 기초)이 연 5,166,667원 이하면 소득금액 100만원 이하입니다. 정확한 과세 대상 금액은 국민연금공단(1355)에서 확인할 수 있습니다.</li>
<li><strong>예금 이자·배당만 있는 경우</strong>: 합계 2천만원 이하는 분리과세라 요건을 충족합니다.</li>
<li><strong>주택 임대소득</strong>: 기준시가 12억원 이하 1주택의 비과세 임대소득이나, 분리과세를 선택한 연 2천만원 이하 임대소득만 있으면 충족합니다.</li>
<li><strong>유족연금·장애연금</strong>: 비과세 소득이라 소득금액에 넣지 않습니다.</li>
</ul>
<p>요건을 하나씩 확인하려면 <a href="/calc/dependent-check">부양가족 공제 판정기</a>를 이용하세요.</p>

<h2>공제액과 줄어드는 세금</h2>
<p>인적공제는 소득공제라서 줄어드는 세금이 내 한계세율에 따라 달라집니다. 아래는 지방소득세를 포함한 값이고, 과세표준이 같은 구간에 머문다고 가정했습니다.</p>
<table class="w-full text-sm">
<thead><tr><th>한계세율 (과세표준 구간)</th><th>기본 150만원</th><th>기본+경로우대 250만원</th><th>기본+장애인 350만원</th></tr></thead>
<tbody>
<tr><td>6% (1,400만원 이하)</td><td>9만9,000원</td><td>16만5,000원</td><td>23만1,000원</td></tr>
<tr><td>15% (5,000만원 이하)</td><td>24만7,500원</td><td>41만2,500원</td><td>57만7,500원</td></tr>
<tr><td>24% (8,800만원 이하)</td><td>39만6,000원</td><td>66만원</td><td>92만4,000원</td></tr>
<tr><td>35% (1억5,000만원 이하)</td><td>57만7,500원</td><td>96만2,500원</td><td>134만7,500원</td></tr>
</tbody>
</table>
<p>경로우대(100만원)와 장애인(200만원) 추가공제는 겹쳐 받을 수 있어, 70세 이상 장애인 부모님은 1명당 450만원이 공제됩니다. 인적공제 합계가 종합소득금액을 넘으면 넘는 부분은 없어집니다(소득세법 제51조 제4항).</p>

<h2>의료비·카드·보험료는 요건이 다르다</h2>
<p>부모님을 기본공제하지 못해도 받을 수 있는 공제가 있고, 기본공제를 해도 받지 못하는 공제가 있습니다.</p>
<table class="w-full text-sm">
<thead><tr><th>항목</th><th>부모님 나이</th><th>부모님 소득</th><th>누가 공제받나</th></tr></thead>
<tbody>
<tr><td>기본공제·경로우대</td><td>60세 이상 (경로우대 70세 이상)</td><td>100만원 이하</td><td>신청한 자녀 1명</td></tr>
<tr><td>의료비 세액공제 (15%)</td><td>무관</td><td>무관</td><td>의료비를 직접 낸 자녀. 다른 형제가 기본공제를 받았다면 그 형제가 낸 금액만</td></tr>
<tr><td>신용카드 사용액 합산</td><td>무관</td><td>100만원 이하</td><td>생계를 같이하는 자녀 (다른 형제가 기본공제를 받았다면 불가)</td></tr>
<tr><td>보장성 보험료 세액공제</td><td>60세 이상</td><td>100만원 이하</td><td>부모님을 기본공제하고 보험료를 직접 낸 자녀</td></tr>
<tr><td>교육비 세액공제</td><td colspan="3">부모님 교육비는 대상 아님 (장애인 특수교육비만 가능)</td></tr>
</tbody>
</table>
<p>65세 이상 부모님(2026년 귀속은 1961년 12월 31일 이전 출생)의 의료비는 연 700만원 한도가 없습니다. 예를 들어 총급여 5,000만원인 자녀가 66세 부모님 의료비 400만원을 냈고 다른 의료비가 없다면, 문턱(총급여 3%) 150만원을 넘는 250만원의 15%인 <strong>37만5,000원</strong>(지방소득세 포함 41만2,500원)이 공제됩니다. 항목별 공제 여부는 <a href="/guides/implant-dental-medical-deduction-2026">의료비 세액공제 항목 정리</a>에서 확인하세요.</p>

<h2>형제자매 중 누가 올릴까</h2>
<ul>
<li><strong>한 명만</strong>: 같은 부모님을 두 사람이 올리면 한쪽은 공제가 부인돼 덜 낸 세금을 추가로 내야 하고 가산세가 붙을 수 있습니다. 연말정산 전에 누가 신청할지 정해 두세요.</li>
<li><strong>한계세율이 높은 사람이 유리</strong>: 위 표처럼 같은 250만원이라도 15% 구간이면 41만2,500원, 24% 구간이면 66만원이 줄어듭니다.</li>
<li><strong>의료비는 기본공제한 사람이 결제</strong>: 형이 부모님을 기본공제하고 동생이 수술비를 냈다면 두 사람 모두 그 의료비를 공제받지 못합니다. 부모님 병원비는 공제받을 사람이 직접 결제하는 편이 안전합니다.</li>
<li><strong>둘 다 신청했을 때</strong>: 실제로 부양한 사람이 우선이고, 둘 다 부양을 입증하면 직전 연도에 기본공제를 받은 사람, 그다음 그해 소득금액이 많은 사람 순입니다(소득세법 시행령 제106조). 기본공제와 경로우대를 형제가 나눠 받을 수는 없습니다.</li>
<li><strong>따로 사는 자녀</strong>: 부모님 계좌로 생활비를 보낸 내역처럼 실제 부양을 보여 주는 자료를 챙겨 두세요.</li>
</ul>

<h2>건강보험 피부양자와는 따로 본다</h2>
<p>건강보험증에 부모님이 피부양자로 올라 있는 자녀가 반드시 세법상 부양가족 공제를 받아야 하는 것은 아닙니다(국세상담센터). 피부양자 자격은 국민건강보험 기준(소득·재산)으로 따로 판단하므로, 부모님을 피부양자로 올릴 수 있는지는 <a href="/health-insurance-dependent">건강보험 피부양자 자격 판정기</a>에서 확인하세요.</p>
<p>자주 생기는 실수도 함께 점검하세요.</p>
<ul>
<li>퇴직금·양도소득이 생긴 해에도 부모님을 그대로 올린 경우 — 소득금액에는 퇴직소득·양도소득도 합산되므로 100만원을 넘으면 공제되지 않습니다.</li>
<li>해외로 이주해 사는 부모님을 올린 경우 — 주거 형편상 별거로 보지 않아 공제되지 않습니다.</li>
<li>그해 돌아가신 부모님을 뺀 경우 — 사망한 해까지는 요건을 갖추면 기본공제와 경로우대를 받을 수 있습니다.</li>
<li>지난해에 놓친 경우 — 법정신고기한부터 5년 안이면 경정청구로 돌려받을 수 있습니다(국세기본법 제45조의2).</li>
</ul>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 국민연금을 받는 부모님도 공제되나요?</strong> — 다른 소득 없이 과세 대상 연금액이 연 5,166,667원 이하이면 소득금액이 100만원 이하라 공제됩니다. 2001년 이전 납입분을 기초로 한 연금은 과세 대상에서 빠지므로, 정확한 금액은 국민연금공단에서 확인하세요.</li>
<li><strong>Q. 60세가 안 된 부모님 병원비도 공제되나요?</strong> — 기본공제는 받을 수 없지만, 생계를 같이하는 부모님(따로 사셔도 실제로 부양하는 경우 포함)을 위해 직접 낸 의료비는 나이·소득과 관계없이 공제됩니다. 다만 다른 형제가 그 부모님을 기본공제했다면 안 됩니다.</li>
<li><strong>Q. 장인·장모님도 올릴 수 있나요?</strong> — 네. 배우자의 부모님도 같은 요건(60세 이상·소득금액 100만원 이하)으로 공제되고, 다른 형제가 먼저 공제받지 않아야 합니다.</li>
<li><strong>Q. 형제가 해마다 번갈아 공제받아도 되나요?</strong> — 그해 실제로 부양한 사람이 신청하면 됩니다. 같은 해에 둘이 신청하면 직전 연도 공제자가 우선하므로, 번갈아 받으려면 그해 신청자를 미리 정해 한 명만 신청해야 합니다.</li>
</ul>
<p>근거: <a href="https://www.law.go.kr/법령/소득세법/제50조" target="_blank" rel="noopener noreferrer">소득세법 제50조(기본공제)</a> · <a href="https://www.law.go.kr/법령/소득세법/제51조" target="_blank" rel="noopener noreferrer">제51조(추가공제)</a> · <a href="https://www.law.go.kr/법령/소득세법/제53조" target="_blank" rel="noopener noreferrer">제53조(생계를 같이 하는 부양가족)</a> · <a href="https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=1318&amp;ctgId=CTG11923" target="_blank" rel="noopener noreferrer">국세상담센터 부모 공제 상담사례</a> · <a href="https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=1318&amp;ctgId=CTG11934" target="_blank" rel="noopener noreferrer">연간 소득금액 100만원 상담사례</a>. 기준일: 2026년 9월 26일.</p>
<p>함께 보기: <a href="/guides/year-end-tax-2026">2026년 귀속 연말정산 공제 총정리</a> · <a href="/guides/medical-edu-donation-limits-2026">의료비·교육비·기부금 한도</a> · <a href="/year-end-tax">연말정산 계산기</a></p>
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
2019년부터 산후조리원 비용도 의료비 세액공제 대상. 1회 출산당 200만원 한도 × 의료비 세액공제 15% = 최대 30만원(지방세 포함 33만원) 환급 — 총급여 3% 초과 의료비에 합산. 출산 가정의 핵심 절세 항목입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 공제 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>소득 요건 없음</strong> — 2024년 지출분부터 총급여 7,000만원 제한 폐지</li>
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
2024년 신설된 청년주택드림 청약통장은 만 19~34세 청년만 가입 가능. 우대금리 연 4.5%(시중 적금보다 1.5%p 높음) + 청년주택드림 대출(최대 3억원, 신혼 4억원) 자격까지 연계되는 슈퍼 청약통장입니다.
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
<li><strong>② 소득공제</strong>: 연 300만원 한도 40%(최대 120만원) 소득공제 — 이자 비과세는 연 600만원 납입분까지. 환급액 한계세율 24% 기준 연 약 29만원.</li>
<li><strong>③ 청년주택드림 대출</strong>: 통장 가입 후 1년 + 1,000만원 납입 시 자격 발생. 최저 2.2% 금리로 최대 3억원(신혼부부 4억원) 대출 — LTV 70%(생애최초 80%, 수도권·규제지역 70%).</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 5년 누적 효과</h2>
<p>
월 50만원 × 60개월 = 3,000만원 납입 시:
</p>
<ul class="space-y-2 mt-4">
<li>· 4.5% 이자 누적: 약 350만원</li>
<li>· 소득공제 환급 누적: 약 144만원 (연 120만원 공제 × 한계세율 24% × 5년)</li>
<li>· <strong>총 혜택: 약 494만원</strong></li>
<li>· 추가로 청년주택드림 대출(최대 3억원, 신혼 4억원) 자격 확보</li>
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

<h2 class="mt-12 text-2xl font-bold text-primary">💰 양도가 12억 초과 시</h2>
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
// 25. 다주택자 양도세 중과 재개 (2026-05-10~)
// ═══════════════════════════════════════════════════════════════
const multiHomeHeavyTax = `
<p class="lead">
조정대상지역 2주택·3주택 이상 양도세 중과세율(기본세율 + 20~30%p)은 한시 배제 종료로 <strong>2026년 5월 10일부터 재개</strong>됐습니다. 2027~28년 한시 완화 개편안은 아직 국회 통과 전이라 다주택자 매도·증여 시점 결정의 중요한 변수.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 중과세율 — 재개 후 부담 (현재 적용)</h2>
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
한시 배제 기간(2022.5.10 ~ 2026.5.9)에 매도했다면 기본세율만 적용. <strong>2026.5.10부터 중과가 재개</strong>되어 이후 매도분은 중과세율이 적용됩니다. 2027~28년 한시 완화 개편안이 논의 중이지만 국회 통과 전이므로, 현재는 중과세율 기준으로 매도·증여 계획을 세워야 합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 2주택자 양도세</h2>
<p>
조정대상 2주택, 양도차익 5억, 보유 5년:
</p>
<ul class="space-y-2 mt-4">
<li>· <strong>한시 배제 기간(~2026.5.9 매도)</strong>: 양도세 약 1.4억 (기본세율 35%)</li>
<li>· <strong>중과 재개 후(2026.5.10~ 매도, 현재)</strong>: 양도세 약 2.5억 (35% + 20%p = 55%)</li>
<li>· <strong>차이: 약 1.1억</strong> — 시점 1개월 차이로 1억 손해 가능</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 다주택자 5가지 대응</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 완화 개편안 입법 추이 확인</strong>: 2027~28 한시 완화안의 국회 통과 여부를 확인한 뒤 매도 시점 결정</li>
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
청년형 장기집합투자증권저축은 가입 기한 2025-12-31로 종료(2024 세법개정으로 1년 연장 후 일몰)된 적립식 펀드입니다. 기존 가입자만 연 납입 600만원 한도 40% 소득공제(최대 240만원)를 받으며, 운용수익 비과세 상품은 아닙니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 가입 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>나이</strong>: 만 19~34세</li>
<li>· <strong>총급여</strong>: 5,000만원 이하 (종합소득 3,800만원 이하)</li>
<li>· <strong>가입 기간</strong>: 최소 3년, 최대 5년</li>
<li>· <strong>납입 한도</strong>: 연 600만원 (전 금융회사 합산)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 혜택</h2>
<ol class="space-y-3 mt-4">
<li><strong>① 운용수익은 과세</strong>: 비과세 상품이 아니므로 분배금·환매 이익은 일반 펀드처럼 과세됩니다.</li>
<li><strong>② 소득공제 40%</strong>: 연 납입 600만원 한도 × 40% = 최대 240만원 소득공제(계약기간 3~5년). 한계세율 24% 기준 연 약 58만원 환급.</li>
<li><strong>③ 신규 가입 종료</strong>: 2025-12-31로 가입 기한이 끝나 2026년에는 새로 가입할 수 없습니다(청년도약계좌도 같은 날 신규 종료).</li>
</ol>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 5년 시뮬레이션</h2>
<p>
월 50만원 × 60개월 = 3,000만원 납입, 연 수익률 7% 가정:
</p>
<ul class="space-y-2 mt-4">
<li>· 만기 평가액: 약 3,600만원</li>
<li>· 운용수익: 약 600만원</li>
<li>· 비과세 효과: 없음 (운용수익은 과세)</li>
<li>· 소득공제 환급: 연 약 58만원 (연 600만원 한도 × 40% × 한계세율 24%)</li>
<li>· <strong>총 혜택: 5년 납입 시 약 288만원(지방세 제외)</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 주의</h2>
<ul class="space-y-2 mt-4">
<li>· 3년 미만 해지 시 그동안 받은 소득공제 추징</li>
<li>· 2026년부터는 나이와 무관하게 신규 가입 불가 (기존 가입자는 계약기간까지 유지 가능)</li>
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
// 27. 월세 세액공제 15~17% 1,000만원
// ═══════════════════════════════════════════════════════════════
const monthlyRentTaxCredit = `
<p class="lead">
무주택 세대주가 월세를 내고 있다면 연 1,000만원 한도로 15%(총급여 5,500만원 초과)~17%(5,500만원 이하) 세액공제. 매월 50~60만원 월세 거주자는 매년 약 90~122만원 환급 가능. 신청 안 하면 그대로 손해.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 공제 요건</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>무주택 세대주</strong>: 본인 무주택 + 배우자 무주택 (세대원 가능)</li>
<li>· <strong>총급여 8,000만원 이하</strong> (종합소득 7,000만원 이하)</li>
<li>· <strong>국민주택규모 이하 주택</strong>: 전용 85㎡ 이하 또는 기준시가 3억 이하</li>
<li>· <strong>계약자 = 본인</strong>: 임대차계약서상 본인 명의 (배우자 명의는 본인 공제 안 됨)</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 환급액 시뮬</h2>
<p>
월세 50만원(연 600만원) 거주, 총급여 4,000만원:
</p>
<ul class="space-y-2 mt-4">
<li>· 공제 한도 내: 600만원 (≤1,000만원)</li>
<li>· 총급여 5,500만원 이하 → 17% 세액공제 = 102만원 환급</li>
<li>· 지방소득세 포함 시 약 112만원 환급 (총급여 5,500만 초과~8,000만 이하는 15% = 90만원)</li>
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
<p class="lead">2026년 귀속(2027년 1~2월 연말정산) 신용카드 등 소득공제는 <strong>총급여의 25%를 넘게 쓴 금액부터</strong> 계산하고, 공제율은 신용카드 15%, 체크카드·현금영수증 30%, 전통시장·대중교통 40%입니다. 총급여 7천만원 이하라면 도서·공연·영화·수영장 같은 문화체육 사용분도 30%입니다. 기본 한도는 총급여 7천만원 이하 <strong>연 300만원</strong>(자녀 1명 350만원·2명 이상 400만원), 초과 250만원(275만원·300만원)이고, 한도를 넘는 공제액은 전통시장·대중교통(총급여 7천만원 이하는 문화체육 포함) 공제분 범위에서 연 300만원, 총급여 7천만원 초과는 200만원까지 더 인정됩니다. 기준일은 2026년 9월 26일, 근거는 조세특례제한법 제126조의2입니다.</p>

<h2>공제율과 한도 한눈에 보기</h2>
<p>공제율은 어디서, 무엇으로 결제했는지에 따라 정해집니다. 전통시장·대중교통에서 쓴 돈은 신용카드·체크카드·현금영수증 어느 것으로 내도 40%로 계산합니다.</p>
<table class="w-full text-sm">
<thead><tr><th>사용처·결제수단</th><th>공제율</th><th>확인할 점</th></tr></thead>
<tbody>
<tr><td>신용카드</td><td>15%</td><td>25% 문턱을 가장 먼저 채우는 사용분</td></tr>
<tr><td>체크카드·기명식 선불카드·현금영수증</td><td>30%</td><td>선불수단은 실명이 확인된 것만 해당</td></tr>
<tr><td>전통시장</td><td>40%</td><td>결제수단과 관계없이 40% (준대규모점포 제외)</td></tr>
<tr><td>대중교통</td><td>40%</td><td>「대중교통법」상 대중교통수단 이용 요금</td></tr>
<tr><td>문화체육 (도서·신문·공연·박물관·미술관·영화상영관·수영장·체력단련장)</td><td>30%</td><td>총급여 7천만원 이하만, 문화체육관광부 지정 사업자 결제분. 개인 강습비는 제외</td></tr>
</tbody>
</table>
<table class="w-full text-sm">
<thead><tr><th>총급여</th><th>기본 한도 (자녀 없음 / 1명 / 2명 이상)</th><th>추가 한도</th></tr></thead>
<tbody>
<tr><td>7천만원 이하</td><td>300만원 / 350만원 / 400만원</td><td>전통시장·대중교통·문화체육 공제분 합산 연 300만원</td></tr>
<tr><td>7천만원 초과</td><td>250만원 / 275만원 / 300만원</td><td>전통시장·대중교통 공제분 합산 연 200만원</td></tr>
</tbody>
</table>
<ul>
<li>한도를 올려 주는 '자녀'는 20세 이하(장애인은 나이 무관)이고 소득금액 100만원 이하인 자녀·손자녀로, 다른 사람의 기본공제를 받지 않아야 합니다(조세특례제한법 시행령 제121조의2 제18항, 2026년 2월 신설).</li>
<li>추가 한도는 항목마다 따로 있는 것이 아니라 <strong>합산 한도</strong>입니다. 기본 한도를 넘긴 공제액과 전통시장·대중교통(·문화체육) 공제액 중 작은 금액이 추가 한도 안에서 더해집니다.</li>
<li>예전의 '총급여 1억 2천만원 초과' 구간은 현행 조문에 없습니다. 이 공제는 2028년 12월 31일 사용분까지 적용됩니다.</li>
</ul>

<h2>25% 문턱은 공제율 낮은 결제부터 채운다</h2>
<p>최저사용금액(문턱)은 총급여의 25%입니다. 총급여는 연봉에서 식대 같은 비과세 급여를 뺀 금액이라, 연봉 5,000만원에 비과세가 없다면 문턱은 1,250만원입니다. 연간 사용액이 문턱을 넘지 못하면 공제는 0원이고, 넘으면 초과분에만 공제율이 붙습니다.</p>
<p>문턱을 채우는 순서는 법에 정해져 있습니다. <strong>신용카드 사용분이 먼저</strong> 문턱을 채우고, 모자라면 체크카드·현금영수증(총급여 7천만원 이하는 문화체육 포함), 그래도 모자라면 전통시장·대중교통 사용분이 채웁니다. 그래서 문턱까지는 포인트·할인 혜택이 좋은 신용카드를 써도 공제에서 손해가 없고, 문턱을 넘은 뒤부터 체크카드·현금영수증이나 전통시장 결제가 공제액을 키웁니다.</p>
<p><strong>성과급을 받는 해에는 문턱도 함께 올라갑니다.</strong> 연봉 5,000만원인 사람이 성과급 1,000만원을 받아 총급여가 6,000만원이 되면 문턱은 1,250만원에서 1,500만원이 됩니다. 신용카드로 1,500만원을 썼다면 성과급이 없던 해에는 초과분 250만원의 15%인 37만5,000원이 공제되지만, 성과급을 받은 해에는 0원입니다. 성과급으로 총급여가 7천만원을 넘으면 문화체육 30%가 빠지고 기본 한도도 250만원으로 내려갑니다. 1~9월 사용액과 문턱 도달 여부는 <a href="/year-end-tax-preview">홈택스 연말정산 미리보기</a>(예년 10월 말~11월 개통)에서 확인할 수 있습니다.</p>

<h2>같은 2,500만원도 배분에 따라 공제액이 다르다</h2>
<p>총급여 5,000만원, 자녀가 없는 근로자가 1년에 2,500만원을 쓴다고 가정하고 <a href="/credit-card-deduction-2026">신용카드 소득공제 계산기</a>와 같은 계산식으로 비교했습니다.</p>
<table class="w-full text-sm">
<thead><tr><th>결제 배분 (연간 2,500만원)</th><th>한도 적용 전</th><th>최종 소득공제</th><th>세금 감소 추정</th></tr></thead>
<tbody>
<tr><td>전부 신용카드</td><td>187만5,000원</td><td>187만5,000원</td><td>약 30만9,000원</td></tr>
<tr><td>신용카드 1,250만 + 체크카드 1,250만</td><td>375만원</td><td>300만원 (기본 한도)</td><td>약 49만5,000원</td></tr>
<tr><td>신용카드 1,250만 + 체크카드 750만 + 전통시장 300만 + 대중교통 200만</td><td>425만원</td><td>425만원 (기본 300만 + 추가 125만)</td><td>약 70만1,000원</td></tr>
</tbody>
</table>
<p>세금 감소 추정은 과세표준이 15% 구간에 머문다고 보고 지방소득세를 더한 16.5%를 곱한 값입니다. 실제 환급액은 이미 낸 세금(기납부세액)과 다른 공제에 따라 달라집니다.</p>
<ul>
<li><strong>둘째 줄</strong>: 체크카드로 바꾼 효과가 기본 한도 300만원에서 멈춥니다. 한도를 채운 뒤에는 체크카드를 더 써도 공제가 늘지 않습니다.</li>
<li><strong>셋째 줄</strong>: 전통시장·대중교통 공제분(300만원×40% + 200만원×40% = 200만원)이 있어 기본 한도를 넘은 125만원이 추가 한도로 인정됩니다.</li>
<li><strong>자녀 한도 상향</strong>: 같은 총급여에서 체크카드 3,000만원·전통시장 200만원·대중교통 150만원을 쓴 가구는 자녀가 없으면 440만원, 자녀가 1명이면 490만원이 공제됩니다. 한도 상향은 사용액이 많아 기본 한도를 넘는 가구에서 차이가 납니다.</li>
</ul>

<h2>가족 카드 합산과 맞벌이 배분</h2>
<ul>
<li><strong>합산할 수 있는 가족</strong>: 연간 소득금액 100만원 이하(근로소득만 있으면 총급여 500만원 이하)인 배우자와, 생계를 같이하는 직계존비속(배우자의 부모 포함)입니다. 카드 합산은 <strong>나이 요건 없이 소득 요건만</strong> 봅니다. 소득 없는 25세 자녀, 60세가 안 된 무소득 부모님의 사용액도 합산됩니다.</li>
<li><strong>합산할 수 없는 경우</strong>: 형제자매의 사용액, 다른 사람이 기본공제를 받은 가족의 사용액, 소득금액이 100만원을 넘는 맞벌이 배우자의 사용액은 넣지 않습니다. 맞벌이 부부는 각자 자기 사용액으로 공제받습니다.</li>
<li><strong>가족카드</strong>: 카드대금을 누가 냈는지가 아니라 카드 명의자(사용자) 기준으로 공제합니다.</li>
<li><strong>맞벌이 배분</strong>: 문턱(총급여 25%)은 사람마다 따로 계산되므로, 생활비를 한 사람 카드로 모으면 문턱을 한 번만 채우면 됩니다. 다만 총급여가 적은 쪽은 문턱이 낮아 공제액이 커지는 대신 한계세율이 낮을 수 있어, 누구에게 모을지는 두 사람 조건을 넣어 <a href="/calc/dual-income-year-end">맞벌이 연말정산 계산기</a>로 비교하는 편이 정확합니다.</li>
<li><strong>근로 기간</strong>: 입사 전·퇴사 후 사용분은 빠지고, 휴직 기간 사용분은 포함됩니다.</li>
</ul>

<h2>공제 대상에서 빠지는 결제</h2>
<p>아래 지출은 카드나 현금영수증으로 결제해도 사용액에 넣지 않습니다(조세특례제한법 제126조의2 제4항, 같은 법 시행령 제121조의2 제6항).</p>
<ul>
<li>해외에서 사용한 금액, 면세점 구입액</li>
<li>국민연금·건강보험·고용보험료, 보험계약 보험료</li>
<li>학교(대학원 포함)·어린이집에 내는 수업료·입학금·보육비용. 학원비는 카드 공제 대상이고, 취학 전 아동 학원비는 교육비 세액공제와 함께 받을 수 있습니다</li>
<li>국세·지방세, 전기·수도·가스·전화·인터넷 요금, 아파트관리비, 도로통행료(하이패스 포함)</li>
<li>상품권 등 유가증권 구입, 리스료·렌터카 대여료, 대출 이자·금융 수수료, 가상자산 거래 대가</li>
<li>신차 등 취득세가 붙는 재산 구입비. 중고차는 구입금액의 10%만 사용액에 넣습니다</li>
<li>기부금(정치자금·고향사랑기부금 포함), 세액공제를 받은 월세, 회사 경비나 사업 관련 비용</li>
</ul>
<p>반대로 의료비는 카드로 내면 의료비 세액공제와 카드 소득공제를 <strong>둘 다</strong> 받고, 중·고등학생 교복 구입비도 교육비 세액공제와 카드 공제가 함께 됩니다. 보장성 보험료는 카드로 내도 카드 공제가 없습니다(국세상담센터 상담사례).</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 체크카드와 신용카드 중 무엇을 먼저 써야 하나요?</strong> — 문턱(총급여 25%)은 신용카드 사용분부터 채워지므로 문턱까지는 혜택이 좋은 신용카드, 문턱을 넘은 뒤에는 체크카드·현금영수증(30%)이 유리합니다. 기본 한도를 이미 채웠다면 체크카드를 더 써도 공제가 늘지 않고, 전통시장·대중교통(총급여 7천만원 이하는 문화체육 포함) 사용분만 추가 한도로 인정됩니다.</li>
<li><strong>Q. 부모님이 쓴 카드도 합산되나요?</strong> — 생계를 같이하는 부모님(배우자의 부모 포함)의 연간 소득금액이 100만원 이하이면 나이와 관계없이 합산됩니다. 형제자매 중 다른 사람이 부모님 기본공제를 받았다면 합산할 수 없습니다.</li>
<li><strong>Q. 해외 가맹점 결제도 공제되나요?</strong> — 국외에서 사용한 금액은 사용액에서 빠집니다(조세특례제한법 제126조의2 제1항). 면세점 구입액도 제외입니다.</li>
<li><strong>Q. 연말에는 무엇을 점검하면 되나요?</strong> — 12월 31일까지 결제한 금액만 올해 사용액입니다. 문턱을 넘었는지, 기본 한도가 남았는지 확인하고 전체 환급 예상은 <a href="/year-end-tax">연말정산 계산기</a>로 보세요. 공제를 받으려고 필요 없는 지출을 늘리면 줄어드는 세금보다 지출이 더 큽니다.</li>
</ul>
<p>근거: <a href="https://www.law.go.kr/법령/조세특례제한법/제126조의2" target="_blank" rel="noopener noreferrer">조세특례제한법 제126조의2</a> · <a href="https://www.law.go.kr/법령/조세특례제한법시행령/제121조의2" target="_blank" rel="noopener noreferrer">같은 법 시행령 제121조의2</a> · <a href="https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=1318&amp;ctgId=CTG11898" target="_blank" rel="noopener noreferrer">국세상담센터 신용카드 등 사용액 상담사례</a>. 기준일: 2026년 9월 26일(조문은 2026년 9월 18일 시행본 기준).</p>
<p>함께 보기: <a href="/guides/year-end-tax-2026">2026년 귀속 연말정산 공제 총정리</a> · <a href="/guides/cash-receipt-guide">현금영수증 소득공제 가이드</a> · <a href="/guides/parent-support-deduction-integration-2026">부모님 부양가족 공제</a></p>
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

<h2 class="mt-12 text-2xl font-bold text-primary">💰 합산 배제 효과</h2>
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

<h2 class="mt-12 text-2xl font-bold text-primary">💰 1자녀 가정 정부 지원 총액</h2>
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
// TODO(2026-10-10): 본문의 월급 시뮬(× 4.345주 = 약 295만원 · 월 총수입 약 354만원)은 이 가이드의 title·description
// ('월 354만원' — 메타 동결 ~2026-10-09)과 맞추려고 cdf3176(209 ÷ 48 ≈ 4.354주 = 약 296만원 · 약 355만원) 이전 값으로
// 되돌린 것이다 (2026-09-12 리뷰 지적). 동결 해제일에 title·description·본문을 209시간 기준으로 한꺼번에 옮길 것.
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

<h2 class="mt-12 text-2xl font-bold text-primary">💰 월급 시뮬 — 야간 풀타임</h2>
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
      "[9월 업데이트] 2025년분 PS 2,964% 확정(영업이익 47.2조)·상한 폐지. 현금 40%+자사주 60% 잠정합의안은 8/25 부결 → 수정안(현금 50%+자사주 50%) 9/16 가결 — 5월 작성 전망 글에 최신 확정치를 병기.",
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
      "전기차 캐즘 종료 + ESS 본격화로 LG엔솔 2026 임금협상 인상률 5%+ 전망. 신입 영끌 5,500~6,500만원, 시니어 9,500만~1.2억원. 미국 파견 인센티브 확대.",
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
    title: "카카오 RSU 세금 — 주식 수령과 매도 과세 확인표",
    description: "RSU 수령 시 근로소득과 매도 시 양도소득을 구분합니다. 국내 상장 소액주주 장내거래와 대주주·비상장·국외주식의 차이, 계약·증빙 확인표.",
    category: "주식",
    tags: ["카카오", "RSU", "양도세", "스톡옵션", "절세", "2026"],
    level: "고급",
    publishedDate: "2026-05-23", modifiedDate: "2026-09-09",
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
    title: "청년도약계좌 기존 가입자 — 정부기여금 144만원·만기 5,083만원",
    description:
      "2025-12-31 신규 가입 종료(청년미래적금 참고). 월 70만원 × 5년 = 원금 4,200만원 + 정부기여금 144만원 + 이자 비과세 99만원 절감 = 만기 5,083만원.",
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
    // 한글 포함 슬러그는 프리렌더 시 percent-encoding 불일치로 빌드 시점부터
    // 308 유령화(한 번도 200인 적 없음, 2026-07-06 감사) — ASCII로 개명 (아래 2편 동일)
    slug: "one-home-prop-tax-12eok-2026",
    title: "1세대 1주택 종부세 12억 공제 — 인별 9억 공제·공동명의 비교",
    description: "개인 주택분 기본공제 9억원과 1세대 1주택자 12억원을 구분합니다. 공시가격별 과세표준 검산, 공동명의 특례와 고령·장기보유 공제 확인.",
    category: "부동산",
    tags: ["종합부동산세", "1주택자", "종부세", "공제", "보유세", "2026"],
    level: "중급",
    publishedDate: "2026-05-23", modifiedDate: "2026-09-09",
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
      "분할 매도 250만원 공제·손익 통산·같은 해 손실 정리·부부 합산·ISA 활용 5가지 전략. 2,000만원 차익 시 일시 매도 385만원 → 4년 분할 220만원으로 165만원 절감.",
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
    title: "부모님 부양가족 공제 2026 — 나이·소득 요건과 절세액",
    description:
      "60세 이상(1966년 이전 출생)·소득금액 100만원 이하면 1명당 150만원, 70세 이상은 100만원 추가. 의료비는 나이·소득 무관.",
    metaDescription:
      "2026년 귀속 부모님 부양가족 공제는 60세 이상·연간 소득금액 100만원 이하일 때 1명당 150만원, 70세 이상은 100만원이 더해집니다. 국민연금 기준과 의료비 요건을 정리했습니다.",
    category: "세금",
    tags: ["인적공제", "부모 부양", "의료비공제", "연말정산", "절세", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    // W3-A 1차 키퍼 재작성 — 소득세법 §50·§51·§53, 국세상담센터 사례 (사실 원장 docs/guides-facts-2026-10-G1A.md)
    modifiedDate: "2026-09-30",
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
    title: "2026 산후조리원 의료비 공제 200만원 — 최대 환급 30만원",
    description:
      "산후조리원 출산 1회당 200만원 한도 의료비 공제(소득 무관) + 출산 의료비 합산. 최대 30만원(지방세 포함 33만원) 환급. 영수증 5년 보관 + 부부 중 총급여 낮은 쪽 공제 유리.",
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
    slug: "youth-housing-dream-1eok-2026",
    title: "청년주택드림 청약통장 — 만 19~34세, 5년 누적 494만원 혜택 + 3억 대출",
    description:
      "만 19~34세, 연소득 5천만원 이하. 4.5% 우대 적금 + 연 120만원 소득공제 + 청년주택드림 대출(최대 3억) 자격. 월 50만원 5년 시 총 혜택 약 494만원.",
    category: "부동산",
    tags: ["청년주택드림", "청약통장", "청년", "내집마련", "디딤돌", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    views: 0,
    content: youthHousingDream,
    lang: "ko",
  },
  {
    slug: "one-home-capital-gains-12eok-2026",
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
    title: "다주택자 양도세 중과 재개 — 2026년 5월 10일 분기점, 1억 손해 가능",
    description:
      "조정 2주택 +20%p, 3주택+ +30%p 중과. 한시 배제 종료로 2026-05-10부터 재개(2027~28 완화안은 국회 통과 전). 차익 5억 시 배제 기간 1.4억 vs 재개 후 2.5억 = 1.1억 차이.",
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
    title: "청년형 장기집합투자증권저축 — 2025년 가입 종료·소득공제만",
    description:
      "가입 기한 2025-12-31 종료(2024 세법개정으로 1년 연장 후 일몰). 기존 가입자만 연 납입 600만원 한도 40% 소득공제(최대 240만원), 운용수익 비과세 아님.",
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
    title: "월세 세액공제 17% — 무주택자 1,000만원 한도, 매년 100만원 환급",
    description:
      "무주택 세대주 + 총급여 8천만원 이하(5,500만 이하 17%·초과 15%). 월세 50만원(연 600만원) × 17% = 102만원 환급. 5년 미신청자 경정청구로 누적 400~500만원 환급 가능.",
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
    title: "2026 신용카드 소득공제 — 공제율·한도·25% 문턱",
    description:
      "총급여 25% 초과분부터 신용 15%·체크 30%·전통시장·대중교통 40%. 기본 한도 300만원(7천 초과 250만), 자녀 수 따라 상향, 추가 한도는 합산 300만/200만.",
    metaDescription:
      "2026년 귀속 신용카드 소득공제는 총급여 25%를 넘게 쓴 금액부터 신용카드 15%, 체크카드 30%, 전통시장·대중교통 40%입니다. 자녀별 한도표와 결제 배분 예시를 정리했습니다.",
    category: "세금",
    tags: ["신용카드", "체크카드", "전통시장", "대중교통", "소득공제", "2026"],
    level: "중급",
    publishedDate: "2026-05-23",
    // W3-A 1차 키퍼 재작성 — 조특법 §126의2·시행령 §121의2, 예시는 cardDeduction2026 계산식 (사실 원장 docs/guides-facts-2026-10-G1A.md)
    modifiedDate: "2026-09-30",
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
