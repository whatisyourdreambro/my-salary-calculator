// src/lib/guides/stock-deepdive.ts
//
// 주식·반도체 카테고리 가이드 (한국어).
// 삼성전자/SK하이닉스 직원 연봉+자사주 결합형 + 순수 주가 분석을 함께 다룬다.
// 면책 조항: 모든 콘텐츠는 정보 제공 목적이며 투자 권유가 아님.

const DISCLAIMER_HTML = `
<div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 my-8 text-sm">
 <p class="font-bold text-amber-900 dark:text-amber-200 mb-2">⚠️ 투자 유의사항</p>
 <p class="text-amber-800 dark:text-amber-300 leading-relaxed">
  본 글은 정보 제공을 목적으로 하며 특정 종목의 매수·매도를 권유하지 않습니다.
  주식 투자는 원금 손실 위험이 있으며 모든 투자 결정과 그에 따른 결과는 투자자 본인의 책임입니다.
  과거 수익률이 미래 수익률을 보장하지 않습니다.
 </p>
</div>
`;

const samsungStock2026 = `
<p class="lead">
 2025년 하반기부터 시작된 메모리 반등 사이클이 2026년 본격화되면서 삼성전자 주가가 다시 시장의 주인공으로 떠올랐습니다.
 HBM3E 양산 안정화와 파운드리 부문의 손익분기 가시화는 향후 12개월 주가 시나리오의 핵심 변수입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 2026년 삼성전자 주가의 3가지 핵심 동력</h2>

<h3 class="text-xl font-bold mt-8 mb-3">1. HBM3E 12단 양산과 엔비디아 공급망 진입</h3>
<p>
 메모리 부문에서 삼성의 최대 약점은 HBM 시장 후발주자라는 점이었습니다.
 그러나 2025년 4분기 HBM3E 12단 제품의 엔비디아 퀄(품질) 통과 이후, 2026년 1분기부터 본격 출하가 시작될 것으로 시장은 기대하고 있습니다.
 SK하이닉스가 점유한 HBM 매출의 약 30% 수준을 삼성이 가져온다면 메모리 영업이익은 분기당 5조원 이상의 추가 기여가 가능합니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">2. 파운드리 2nm GAA 공정의 수율 정상화</h3>
<p>
 파운드리 부문은 지난 2년간 영업적자의 핵심 원인이었습니다.
 2nm GAA(Gate-All-Around) 공정이 2026년 양산 단계에 들어서면서 모바일 AP·AI 가속기 수주가 늘어날 경우, 파운드리 부문이 분기 적자에서 흑자 전환할 가능성이 있습니다.
 다만 TSMC 대비 가격 경쟁력은 여전히 큰 과제로 남아 있습니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">3. 자사주 매입·소각 정책의 지속 여부</h3>
<p>
 2024~2025년에 진행된 자사주 매입·소각은 EPS 개선에 직접 기여했습니다.
 2026년에도 같은 규모의 환원 정책이 이어질지가 외국인 수급에 큰 영향을 줄 것입니다.
 분기별 실적 발표 때마다 환원 정책 발표 여부를 체크하는 습관이 필요합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 주가 시나리오: 보수적 / 기준 / 강세</h2>
<p>다음 표는 시장 컨센서스 기반 시나리오 예시입니다 (절대값이 아닌 상대 비교용).</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">시나리오</th>
    <th class="p-3 text-left">전제</th>
    <th class="p-3 text-left">상대 변동폭</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">강세</td>
    <td class="p-3">HBM3E 점유율 30%↑ + 2nm 흑자전환</td>
    <td class="p-3">기준 대비 +30~45%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">기준</td>
    <td class="p-3">HBM3E 점유율 15%, 파운드리 적자 축소</td>
    <td class="p-3">현재 수준 유지</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">보수적</td>
    <td class="p-3">HBM 진입 지연 + 메모리 가격 재하락</td>
    <td class="p-3">기준 대비 -15~25%</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 직장인 투자자가 챙겨야 할 3가지</h2>
<ul class="space-y-3 mt-4">
 <li><strong>① 적립식 매수가 답:</strong> 단기 등락이 큰 종목이므로 매월 일정 금액으로 분할 매수하면 평단을 안정적으로 유지할 수 있습니다.</li>
 <li><strong>② ISA·연금저축 활용:</strong> 비과세 한도(ISA 2억) 안에서 매매 차익을 비과세로 가져갈 수 있어 직접 매수보다 절세 효과가 큽니다.</li>
 <li><strong>③ 자사주 직원 가산 혜택:</strong> 삼성전자 직원이라면 우리사주 매입가가 시장가 대비 할인되므로 별도 분석이 필요합니다 (관련 가이드 참고).</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 함께 보면 좋은 가이드</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/guides/samsung-employee-rsu-stock" class="text-primary underline">삼성전자 직원 자사주: 주가 오르면 내 자산은 얼마나 늘어날까?</a></li>
  <li>· <a href="/guides/sk-hynix-stock-2026" class="text-primary underline">SK하이닉스 주가 분석: HBM3E 독점과 2026년 시나리오</a></li>
  <li>· <a href="/guides/semiconductor-cycle-2026" class="text-primary underline">반도체 사이클 2026: 메모리 반등기 직장인 자산관리</a></li>
 </ul>
</div>
`;

const samsungEmployeeRsu = `
<p class="lead">
 삼성전자 직원에게 주가는 단순한 관심사가 아닌 본인 자산의 큰 축입니다.
 우리사주조합, 자사주 매입제도(ESPP 형식), 그리고 임원/특정 직군에 부여되는 양도제한조건부주식(RSU) 모두 주가 변동에 직접 연동되기 때문입니다.
 본 가이드는 직급별로 자산 구성에서 자사주가 차지하는 비중과, 주가 시나리오별로 자산이 어떻게 움직이는지를 시뮬레이션합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🏢 삼성전자 자사주 제도 한눈에 보기</h2>
<div class="grid md:grid-cols-3 gap-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">① 우리사주조합</h4>
  <p class="text-sm text-muted-foreground">신주 발행 시 시장가보다 낮은 가격으로 우선 청약. 1년 의무 보호예수.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">② 우리사주 매입대출</h4>
  <p class="text-sm text-muted-foreground">회사가 이자 일부 보전. 자기자본 부족분을 대출로 메워 청약 가능.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">③ 임원 RSU/스톡옵션</h4>
  <p class="text-sm text-muted-foreground">상무 이상 일부 직군. 일정 베스팅 기간 후 부여. 양도소득세 적용.</p>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">📈 직급별 자산 시뮬레이션</h2>
<p>
 다음은 가정에 기반한 자산 시뮬레이션입니다 (실제 부여 규모는 개인별로 상이).
 우리사주 청약을 5년간 매년 일정 금액(연봉의 5%)씩 했다고 가정합니다.
</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">구분</th>
    <th class="p-3 text-left">5년차 사원</th>
    <th class="p-3 text-left">10년차 책임</th>
    <th class="p-3 text-left">15년차 수석</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">연봉(가정)</td>
    <td class="p-3">7,500만원</td>
    <td class="p-3">1억 1,000만원</td>
    <td class="p-3">1억 5,000만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">연 우리사주 매입</td>
    <td class="p-3">375만원</td>
    <td class="p-3">550만원</td>
    <td class="p-3">750만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">5년 누적 매입가</td>
    <td class="p-3">약 1,875만원</td>
    <td class="p-3">약 2,750만원</td>
    <td class="p-3">약 3,750만원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">주가 +30% 시 평가액</td>
    <td class="p-3 font-bold">2,437만원</td>
    <td class="p-3 font-bold">3,575만원</td>
    <td class="p-3 font-bold">4,875만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">주가 -20% 시 평가액</td>
    <td class="p-3 text-red-600">1,500만원</td>
    <td class="p-3 text-red-600">2,200만원</td>
    <td class="p-3 text-red-600">3,000만원</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">⚖️ 우리사주 매입의 3가지 함정</h2>

<h3 class="text-xl font-bold mt-8 mb-3">함정 1. 자산 집중 리스크</h3>
<p>
 회사에서 받는 월급, 그리고 자사주가 모두 같은 기업의 운명에 묶입니다.
 회사가 어려워지면 월급도 자산도 동시에 흔들립니다.
 분산 투자 원칙상 자사주 비중은 <strong>금융자산의 20% 이내</strong>로 제한하는 것이 일반적인 권고입니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">함정 2. 보호예수 기간 동안의 기회비용</h3>
<p>
 우리사주는 통상 1년 의무 보호예수가 적용됩니다.
 이 기간 동안 주가가 하락하면 매도할 수 없고, 다른 종목으로 갈아탈 기회도 잃습니다.
 청약 직전에 시장 상황을 점검하는 습관이 필요합니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">함정 3. 매입대출 이자의 실효 부담</h3>
<p>
 매입대출을 활용해 청약 규모를 키우는 직원이 많지만, 회사 보전 후에도 본인 부담 이자가 남습니다.
 주가 상승률이 본인 부담 이자율보다 낮으면 실질 수익률은 마이너스가 될 수 있습니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 직급별 추천 전략</h2>
<ul class="space-y-3 mt-4">
 <li><strong>사원~대리:</strong> 청약 한도의 50% 정도만 매입, 나머지는 ETF·연금저축으로 분산.</li>
 <li><strong>책임~수석:</strong> 비중 관리가 핵심. 자사주 평가액이 금융자산의 25% 초과 시 일부 매도 검토.</li>
 <li><strong>임원/RSU 부여 대상:</strong> 베스팅 직후 일부 매도(20~30%)로 분산 + 잔여분 장기 보유.</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">🛠 함께 사용하면 좋은 도구</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/salary-db" class="text-primary underline">기업별 연봉 DB</a> — 삼성전자 직급별 평균 연봉</li>
  <li>· <a href="/calc" class="text-primary underline">100가지 계산기</a> — 자사주 매도 시 양도소득세 계산</li>
  <li>· <a href="/fire-calculator" class="text-primary underline">FIRE 계산기</a> — 자사주 포함 자산 기반 은퇴 시뮬레이션</li>
 </ul>
</div>
`;

const skHynixStock2026 = `
<p class="lead">
 SK하이닉스는 HBM3E 시장에서 사실상의 초기 독점 지위를 누리며 2024년부터 영업이익을 분기당 7조원 이상으로 끌어올렸습니다.
 2026년의 핵심 질문은 명확합니다: <strong>삼성전자가 본격 진입한 뒤에도 이 점유율과 마진을 지킬 수 있는가?</strong>
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🏆 SK하이닉스의 구조적 강점 3가지</h2>

<h3 class="text-xl font-bold mt-8 mb-3">1. HBM3E·HBM4 로드맵의 1년 선행</h3>
<p>
 HBM3E 8단·12단을 가장 먼저 양산했고, HBM4도 2026년 하반기 양산을 목표로 하고 있습니다.
 엔비디아·AMD 등 주요 AI 가속기 고객사와의 공동 개발 관계가 견고하다는 점이 점유율 방어의 1선입니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">2. 마진율의 압도적 우위</h3>
<p>
 일반 DRAM 대비 HBM은 평균 5~7배의 단위 가격을 받습니다.
 SK하이닉스의 HBM 매출 비중이 메모리 매출의 30%를 넘어서면서 영업이익률이 30~40% 수준까지 회복됐습니다.
 이는 메모리 업계 역사상 매우 이례적인 수치입니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">3. 청주·이천 신규 팹과 미국 인디애나 진출</h3>
<p>
 청주 M15X, 이천 M16, 그리고 미국 인디애나 첨단 패키징 공장이 순차 가동되면 HBM 캐파(생산능력)가 두 배 가까이 늘어납니다.
 단, 캐파 확장은 양날의 검입니다 — 수요가 둔화되면 가격 하락 압력으로 작용합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 2026년 리스크 3가지</h2>

<div class="bg-red-50 dark:bg-red-950/20 p-6 rounded-xl border border-red-200 dark:border-red-800 my-6">
 <ul class="space-y-3">
  <li><strong>① 삼성전자의 HBM3E 12단 본격 출하</strong> — 점유율 분산 시 가격 협상력 약화 가능.</li>
  <li><strong>② 일반 DRAM·NAND 가격 변동성</strong> — 매출의 60%는 여전히 일반 메모리. 사이클 정점 통과 시 큰 폭 하락 가능.</li>
  <li><strong>③ 환율과 미·중 무역 정책</strong> — 미국·중국 매출 비중이 높아 관세·수출 통제 변수에 민감.</li>
 </ul>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 시나리오별 주가 흐름 (상대값)</h2>
<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">시나리오</th>
    <th class="p-3 text-left">전제</th>
    <th class="p-3 text-left">기준 대비 변동</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">강세</td>
    <td class="p-3">HBM 점유율 60%+ 유지, HBM4 양산 성공</td>
    <td class="p-3">+25~40%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">기준</td>
    <td class="p-3">HBM 점유율 50% 수준, 일반 메모리 안정</td>
    <td class="p-3">현재 수준</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">보수적</td>
    <td class="p-3">HBM 가격 인하 + 일반 메모리 사이클 둔화</td>
    <td class="p-3">-20~30%</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 매수 타이밍 체크리스트</h2>
<ul class="space-y-3 mt-4">
 <li>✅ DDR5 가격이 2분기 연속 상승하는지 (수요 지표)</li>
 <li>✅ 엔비디아 분기 매출 가이던스에서 데이터센터 비중 60% 이상 유지</li>
 <li>✅ 회사 분기 실적에서 HBM 매출 비중이 35% 이상</li>
 <li>✅ 외국인 순매수 추세 (4주 누적 +)</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 관련 가이드</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/guides/sk-hynix-employee-bonus-stock" class="text-primary underline">SK하이닉스 직원 PS/PI 보너스와 자사주 ROI</a></li>
  <li>· <a href="/guides/samsung-vs-hynix-employee-comparison" class="text-primary underline">삼성전자 vs SK하이닉스 직원 연봉/복지 완전 비교</a></li>
 </ul>
</div>
`;

const skHynixEmployeeBonus = `
<p class="lead">
 SK하이닉스는 PS(Profit Sharing)와 PI(Productivity Incentive)라는 두 종류의 성과급 제도로 유명합니다.
 2024~2025년 메모리 호황기 PS는 연봉의 50%를 넘는 수준까지 올라가면서 'PS 부자' 라는 신조어까지 만들어냈습니다.
 본 가이드는 PS/PI의 실제 구조, 자사주 매수 방식, 그리고 보너스+자사주 결합 시 ROI를 분석합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 PS·PI 제도 한눈에</h2>

<div class="grid md:grid-cols-2 gap-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">PS (Profit Sharing)</h4>
  <p class="text-sm text-muted-foreground mb-2">회사 영업이익 기반. 연 1회(보통 1~2월) 지급.</p>
  <ul class="text-xs space-y-1">
   <li>· 호황기: 연봉의 30~50%</li>
   <li>· 평균: 연봉의 10~20%</li>
   <li>· 불황기: 0~5% 또는 미지급</li>
  </ul>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">PI (Productivity Incentive)</h4>
  <p class="text-sm text-muted-foreground mb-2">반기 단위 사업부 KPI 평가. 연 2회 지급.</p>
  <ul class="text-xs space-y-1">
   <li>· 최고 등급: 월 기본급의 100~150%</li>
   <li>· 평균 등급: 월 기본급의 50~100%</li>
   <li>· 사업부별 차등</li>
  </ul>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">📈 직급별 PS/PI 시뮬레이션</h2>
<p>2024년 호황기 기준 가정 (연봉의 50% PS, PI 연 200%).</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">구분</th>
    <th class="p-3 text-left">신입</th>
    <th class="p-3 text-left">5년차</th>
    <th class="p-3 text-left">10년차</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">기본 연봉</td>
    <td class="p-3">5,800만원</td>
    <td class="p-3">8,500만원</td>
    <td class="p-3">1억 2,000만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">PS (연봉의 50%)</td>
    <td class="p-3">2,900만원</td>
    <td class="p-3">4,250만원</td>
    <td class="p-3">6,000만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">PI (월 기본급 200%)</td>
    <td class="p-3">약 970만원</td>
    <td class="p-3">약 1,420만원</td>
    <td class="p-3">약 2,000만원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">총 보상</td>
    <td class="p-3 font-bold">9,670만원</td>
    <td class="p-3 font-bold">1억 4,170만원</td>
    <td class="p-3 font-bold">2억원</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 PS 받은 다음 날의 선택지</h2>

<h3 class="text-xl font-bold mt-8 mb-3">선택지 1. 우리사주 매입</h3>
<p>
 SK하이닉스 우리사주 매입가는 시장가 대비 일정 할인이 적용됩니다(시기별 변동).
 호황기 PS를 우리사주로 재투자한 직원이 다음 호황기에 자산 점프를 경험한 사례가 다수입니다.
 다만 회사 자산 집중 리스크는 동일하게 존재합니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">선택지 2. ISA + S&P500/KOSPI 분산</h3>
<p>
 ISA 계좌의 비과세 한도(연 2,000만원, 누적 1억) 내에서 SP500 ETF·KOSPI ETF로 분산하면
 회사 외 다른 산업·국가에 베팅하면서 매매차익을 비과세로 가져갈 수 있습니다.
 PS를 받은 1월~3월에 한 번에 ISA 한도를 채우는 직원이 많습니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">선택지 3. 주택 청약/대출 상환</h3>
<p>
 주택담보대출 또는 신용대출이 있다면 PS의 일부를 상환에 사용해 이자 부담을 줄이는 것도 합리적입니다.
 특히 변동금리 대출이라면 금리 인상 위험을 줄이는 효과가 있습니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ PS 의존의 위험성</h2>
<div class="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800 my-6">
 <p class="font-bold text-amber-900 dark:text-amber-200 mb-3">PS는 변동성이 큰 보너스입니다.</p>
 <ul class="space-y-2 text-sm text-amber-800 dark:text-amber-300">
  <li>· 2018년 메모리 호황 PS 50%+ → 2019년 PS 거의 미지급</li>
  <li>· 매년 PS 50%를 가정한 자산계획은 위험</li>
  <li>· 고정비(주택대출 원리금)는 기본급 기준으로 설계해야 함</li>
 </ul>
</div>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">🛠 함께 사용하면 좋은 도구</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급(보너스) 세금 계산기</a></li>
  <li>· <a href="/calc/incentive-tax" class="text-primary underline">인센티브 세후 계산기</a></li>
  <li>· <a href="/salary-db" class="text-primary underline">SK하이닉스 직급별 연봉 DB</a></li>
 </ul>
</div>
`;

const semiconductorCycle2026 = `
<p class="lead">
 메모리 반도체 산업은 약 3~4년 주기의 사이클을 그립니다.
 2022~2023년 다운사이클을 거쳐 2024년부터 시작된 반등은 2026년에 정점에 도달할 것이라는 전망이 많습니다.
 본 가이드는 사이클 단계별 직장인 자산 전략을 정리합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🔄 메모리 사이클 4단계</h2>

<div class="space-y-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-blue-500">
  <h4 class="font-bold mb-2">① 회복 (Recovery) — 2024 상반기</h4>
  <p class="text-sm">재고 소진, 가격 바닥 통과. 주가가 가장 먼저 반등 시작.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-green-500">
  <h4 class="font-bold mb-2">② 확장 (Expansion) — 2024 하반기 ~ 2025</h4>
  <p class="text-sm">수요 회복 + 가격 인상. 영업이익 급증. 회사 PS·PI 풍년.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-amber-500">
  <h4 class="font-bold mb-2">③ 정점 (Peak) — 2026 예상</h4>
  <p class="text-sm">증설 효과 본격화, 가격 상승률 둔화. 시장 컨센서스 정점.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-red-500">
  <h4 class="font-bold mb-2">④ 조정 (Correction) — 2027~2028 가능성</h4>
  <p class="text-sm">캐파 과잉, 가격 하락. 주가는 정점에서 30~50% 조정 사례 다수.</p>
 </div>
</div>

<h2 class="mt-12 text-2xl function-bold text-primary">💡 단계별 직장인 자산 전략</h2>

<h3 class="text-xl font-bold mt-8 mb-3">정점 구간(현재 추정)에서의 행동 원칙</h3>
<ul class="space-y-3">
 <li><strong>① 자사주 비중 점검:</strong> 평가액 기준 금융자산의 30% 초과 시 일부 매도 검토.</li>
 <li><strong>② PS 일부를 안전 자산으로:</strong> 호황기 PS의 30% 이상은 채권형 ETF·예금에 분산.</li>
 <li><strong>③ 고정비 늘리지 말 것:</strong> PS가 큰 시기에 주택대출 한도를 늘리는 건 위험. 다음 사이클에서 PS 0이 되면 부담.</li>
 <li><strong>④ 비현금성 자산 평가:</strong> 우리사주 보호예수가 풀리는 시기를 캘린더에 등록.</li>
</ul>

<h3 class="text-xl font-bold mt-8 mb-3">조정 구간(향후 1~2년 가능성)에서의 행동 원칙</h3>
<ul class="space-y-3">
 <li><strong>① 적립식 매수 지속:</strong> 주가가 빠질수록 평단을 낮출 기회. 단, 회사 펀더멘털이 깨지지 않았을 때만.</li>
 <li><strong>② PS 0 가정한 가계 운영:</strong> 기본급으로만 고정비를 충당할 수 있는 구조 유지.</li>
 <li><strong>③ 글로벌 분산:</strong> 한국 메모리 외 미국 빅테크·소비재 ETF로 분산하면 사이클 충격 완화.</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 사이클별 주가/PS 패턴 (역사적 평균)</h2>
<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">단계</th>
    <th class="p-3 text-left">주가 변동</th>
    <th class="p-3 text-left">PS 수준</th>
    <th class="p-3 text-left">권장 행동</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">회복</td>
    <td class="p-3">+30~50%</td>
    <td class="p-3">10~20%</td>
    <td class="p-3">적립식 매수</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">확장</td>
    <td class="p-3">+50~80%</td>
    <td class="p-3">30~50%</td>
    <td class="p-3">분산 시작</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">정점</td>
    <td class="p-3 font-bold">횡보</td>
    <td class="p-3 font-bold">40~60%</td>
    <td class="p-3 font-bold">일부 차익실현</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">조정</td>
    <td class="p-3">-30~50%</td>
    <td class="p-3">0~10%</td>
    <td class="p-3">현금 보유 + 적립</td>
   </tr>
  </tbody>
 </table>
</div>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">🛠 함께 사용하면 좋은 도구</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/fire-calculator" class="text-primary underline">FIRE 은퇴 계산기</a> — 사이클 변동을 반영한 자산 시뮬레이션</li>
  <li>· <a href="/dashboard" class="text-primary underline">내 대시보드</a> — 자산 추적</li>
 </ul>
</div>
`;

const samsungVsHynix = `
<p class="lead">
 반도체 신입 채용 시즌마다 빠지지 않는 질문: "삼성전자와 SK하이닉스, 어디로 갈까요?"
 표면적인 연봉만으로는 답이 안 나옵니다. 보너스 구조, 자사주 제도, 복지, 그리고 회사 사이클 위치까지 종합 비교해야 합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 핵심 항목 비교표 (2026년 기준 추정)</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">항목</th>
    <th class="p-3 text-left">삼성전자 DS부문</th>
    <th class="p-3 text-left">SK하이닉스</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">신입 초봉 (계약연봉)</td>
    <td class="p-3">5,300~5,800만원</td>
    <td class="p-3">5,800~6,200만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">사이닝 보너스</td>
    <td class="p-3">없음 (일부 직군 예외)</td>
    <td class="p-3">300~500만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">주요 보너스</td>
    <td class="p-3">OPI(연 1회) + TAI(반기)</td>
    <td class="p-3">PS(연 1회) + PI(반기)</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">호황기 보너스 합계</td>
    <td class="p-3">기본급의 50%~연봉의 50%</td>
    <td class="p-3">연봉의 50%+ (PS만으로도)</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">자사주 제도</td>
    <td class="p-3">우리사주 + 매입대출 보전</td>
    <td class="p-3">우리사주 + 매입대출 보전</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">사택/주거</td>
    <td class="p-3">기숙사, 사택, 주거지원금</td>
    <td class="p-3">기숙사, 사택, 주거지원금</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">의료/복지</td>
    <td class="p-3">삼성서울병원 우대</td>
    <td class="p-3">SK 계열사 의료비 지원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">호황기 종합 보상 (10년차 가정)</td>
    <td class="p-3 font-bold">1.5~1.8억</td>
    <td class="p-3 font-bold">1.8~2.2억</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 어디로 갈 것인가 — 6가지 판단 기준</h2>

<h3 class="text-xl font-bold mt-8 mb-3">1. 보상 변동성 선호도</h3>
<p>
 보너스 변동성이 큰 SK하이닉스는 호황기에 폭발적이지만 불황기에는 0에 가깝습니다.
 변동성을 즐긴다면 SK, 안정을 선호한다면 삼성이 상대적으로 유리합니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">2. 직무 다양성</h3>
<p>
 삼성전자 DS는 메모리/파운드리/시스템LSI까지 직무 폭이 넓고 부서 이동 기회가 많습니다.
 SK하이닉스는 메모리 단일 회사로, 메모리 도메인을 깊게 파고 싶다면 적합합니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">3. 위치 (출퇴근)</h3>
<p>
 삼성: 화성, 평택, 기흥, 천안. SK하이닉스: 이천, 청주, 미국 인디애나(일부).
 본인의 거주 계획과 맞물려 보는 것이 1순위 고려사항입니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">4. 회사 위상과 글로벌 인지도</h3>
<p>
 삼성전자는 글로벌 브랜드 파워가 압도적이라 이직이나 해외 진출 시 유리합니다.
 SK하이닉스도 메모리 업계에서는 최상위 인지도를 가지고 있습니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">5. 자사주 매수의 장기 기대수익률</h3>
<p>
 두 회사 모두 한국 메모리 사이클에 민감합니다.
 다만 삼성은 비메모리(파운드리, MX) 비중이 커 메모리 사이클 충격을 일부 분산하고,
 SK하이닉스는 메모리 호황기에 더 큰 탄력을 받는 구조입니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">6. 워라밸과 조직문화</h3>
<p>
 두 회사 모두 라인 운영 부서는 교대 근무가 있습니다.
 사무직 기준으로는 부서별 차이가 회사 간 차이보다 큽니다.
 입사 전 부서별 분위기를 확인하는 것이 회사 선택만큼 중요합니다.
</p>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 관련 가이드</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/guides/samsung-employee-rsu-stock" class="text-primary underline">삼성전자 직원 자사주 시뮬레이션</a></li>
  <li>· <a href="/guides/sk-hynix-employee-bonus-stock" class="text-primary underline">SK하이닉스 직원 PS/PI 보너스 가이드</a></li>
  <li>· <a href="/salary-db" class="text-primary underline">기업별 연봉 DB로 비교하기</a></li>
 </ul>
</div>
`;

const chipStockTax = `
<p class="lead">
 직장인이 삼성전자나 SK하이닉스 주식을 일반 증권 계좌로 직접 매수해 보유하다 매도하면 양도소득세 과세 대상이 될 수 있습니다.
 (현재 한국 주식 양도소득세는 대주주 기준이며, 2026년 정책 변동 가능성이 있어 본 가이드는 일반 원칙 위주로 정리합니다.)
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📚 한국 주식 양도소득세의 기본 구조</h2>
<ul class="space-y-3 mt-4">
 <li><strong>대주주 기준 과세:</strong> 종목별 보유액 또는 지분율이 일정 기준을 넘으면 매도 차익에 양도소득세 부과.</li>
 <li><strong>일반 소액주주:</strong> 한국 주식 매도 차익은 비과세 (현행).</li>
 <li><strong>해외 주식:</strong> 연 250만원 공제 후 22% 양도소득세 (지방세 포함).</li>
</ul>

<div class="bg-amber-50 dark:bg-amber-950/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800 my-6">
 <p class="font-bold text-amber-900 dark:text-amber-200 mb-2">⚠️ 정책 변동성 주의</p>
 <p class="text-sm text-amber-800 dark:text-amber-300">
  주식 양도소득세 과세 대상 확대 여부는 매년 세법 개정 논의의 단골 주제입니다.
  본 가이드는 일반 원칙을 다루며, 매도 직전에 반드시 최신 세법을 확인해야 합니다.
 </p>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 직장인을 위한 절세 4가지 전략</h2>

<h3 class="text-xl font-bold mt-8 mb-3">전략 1. ISA 계좌 활용 (최우선)</h3>
<p>
 ISA(개인종합자산관리계좌)는 연 2,000만원, 누적 1억까지 비과세 한도가 있습니다.
 일반 직장인이 삼성전자/SK하이닉스를 ISA 안에서 매매하면 매매차익이 비과세입니다.
 단, 만기 3년 이상 유지 조건과 출금 제한이 있습니다.
</p>

<h3 class="text-xl function-bold mt-8 mb-3">전략 2. 연금저축펀드/IRP의 ETF 매매</h3>
<p>
 연금저축이나 IRP 계좌 안에서 KOSPI 200 ETF 또는 반도체 ETF를 매매하면 매매차익에 대한 세금이 이연됩니다.
 연금 수령 시점에 낮은 세율(연금소득세 3.3~5.5%)로 정산되어 일반 양도세보다 유리합니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">전략 3. 손익통산 활용</h3>
<p>
 같은 해 매도한 종목 중 손실 종목과 이익 종목이 있다면 손익통산이 가능합니다(해외주식 기준).
 12월에 손익을 계산해 손실 종목을 일부 매도하면 이익 종목의 세금을 줄일 수 있습니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">전략 4. 250만원 공제 분할 활용 (해외주식)</h3>
<p>
 해외주식 양도소득세는 연 250만원 공제됩니다.
 한 해에 큰 차익을 한 번에 실현하기보다 매년 250만원 이내로 분할 매도하면 세금을 0으로 만들 수 있습니다.
 (한국 주식 양도세 적용 대주주 케이스에는 별도 규정 적용)
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🧮 매도 전 체크리스트</h2>
<ul class="space-y-3 mt-4">
 <li>☐ ISA 한도가 남아있는가?</li>
 <li>☐ 대주주 요건에 해당되는가? (보유액·지분율 점검)</li>
 <li>☐ 동일 해에 손실 종목이 있는가? (손익통산 가능성)</li>
 <li>☐ 연말 매도 vs 이듬해 매도 중 어느 것이 유리한가?</li>
 <li>☐ 우리사주의 경우 보호예수 해제일을 확인했는가?</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">🛠 함께 사용하면 좋은 계산기</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도소득세 계산기</a></li>
  <li>· <a href="/guides/isa-account-guide" class="text-primary underline">ISA 만능통장 활용 가이드</a></li>
  <li>· <a href="/guides/capital-gains-tax-stock" class="text-primary underline">해외주식 양도소득세 가이드</a></li>
 </ul>
</div>
`;

const kospiLeaderStrategy = `
<p class="lead">
 삼성전자와 SK하이닉스는 한국 코스피 시가총액 1, 2위를 다투는 대장주입니다.
 두 종목만으로 코스피 시총의 30% 이상을 차지하므로, 사실상 "한국 시장에 베팅한다"는 의미와 가깝습니다.
 본 가이드는 적립식과 일시매수 전략을 비교하고, 직장인 자산 비중 가이드라인을 제시합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">⚖️ 적립식 vs 일시매수: 백테스트 결과</h2>

<p>과거 10년 데이터(2015~2025) 기반 단순 시뮬레이션:</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">전략</th>
    <th class="p-3 text-left">방식</th>
    <th class="p-3 text-left">변동성</th>
    <th class="p-3 text-left">평균 수익률</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">적립식 (DCA)</td>
    <td class="p-3">매월 일정 금액</td>
    <td class="p-3">낮음</td>
    <td class="p-3">시장 평균 ± α</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">일시매수</td>
    <td class="p-3">한 번에 전액</td>
    <td class="p-3">매우 높음</td>
    <td class="p-3">진입 시점에 따라 -50% ~ +100%</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">하이브리드</td>
    <td class="p-3 font-bold">초기 50% + 나머지 6개월 분할</td>
    <td class="p-3 font-bold">중간</td>
    <td class="p-3 font-bold">대부분 시기에서 양호</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 직장인을 위한 실전 적립식 설계</h2>

<h3 class="text-xl font-bold mt-8 mb-3">A. 월급의 5~10% 자동이체 매수</h3>
<p>
 매월 월급일 다음 날 자동으로 일정 금액을 매수하도록 증권사 자동매수 기능을 설정합니다.
 감정 개입을 줄여 평단을 안정적으로 유지할 수 있습니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">B. 비중 상한 설정 (포트폴리오 룰)</h3>
<p>
 삼성+SK하이닉스 합산 비중이 금융자산의 30% 초과 시 추가 매수 중단.
 평가액이 늘어 비중이 커지는 것은 자연스럽지만, 그때부터는 다른 자산으로 자금 흐름을 이동.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">C. 사이클 정점 신호 시 일부 매도</h3>
<p>
 업계 PS가 50% 이상 지급되는 해 = 사이클 정점 가능성 높음.
 그 시기에 보유분의 20~30%를 차익실현하고 채권형 ETF로 이전하면 사이클 충격을 완화할 수 있습니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📈 연봉별 추천 비중 가이드</h2>
<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">연봉</th>
    <th class="p-3 text-left">월 적립 권장</th>
    <th class="p-3 text-left">총 자산 중 비중 상한</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">5,000만원</td>
    <td class="p-3">25~50만원</td>
    <td class="p-3">20%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">8,000만원</td>
    <td class="p-3">50~100만원</td>
    <td class="p-3">25%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">1억 5,000만원</td>
    <td class="p-3">100~200만원</td>
    <td class="p-3">30%</td>
   </tr>
  </tbody>
 </table>
</div>

<p class="mt-4 text-sm text-muted-foreground">
 ※ 위 비중은 일반 가이드입니다. 본인의 위험 선호도, 가족 부양 여부, 주택 구입 계획 등에 따라 조정해야 합니다.
</p>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">🛠 함께 사용하면 좋은 도구</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/tools/finance/compound" class="text-primary underline">복리 계산기</a> — 적립식 장기 시뮬레이션</li>
  <li>· <a href="/fire-calculator" class="text-primary underline">FIRE 계산기</a> — 은퇴 자산 목표 역산</li>
 </ul>
</div>
`;

export const stockDeepdiveGuides = [
 {
  slug: "samsung-electronics-stock-2026",
  title: "삼성전자 2026년 주가 전망: HBM·파운드리 반등 시나리오 📊",
  description: "HBM3E 12단 양산과 2nm 파운드리 흑자 전환 가능성. 직장인 투자자를 위한 시나리오별 매수 전략.",
  category: "주식",
  tags: ["삼성전자", "주가", "HBM", "반도체", "2026"],
  level: "중급" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "ko" as const,
  content: samsungStock2026,
 },
 {
  slug: "samsung-employee-rsu-stock",
  title: "삼성전자 직원 자사주: 주가 +30%일 때 내 자산은? 💼",
  description: "우리사주조합·매입대출·임원 RSU까지. 직급별 자사주 비중과 주가 변동 시 자산 시뮬레이션.",
  category: "주식",
  tags: ["삼성전자", "우리사주", "RSU", "직원", "자산관리"],
  level: "중급" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "ko" as const,
  content: samsungEmployeeRsu,
 },
 {
  slug: "sk-hynix-stock-2026",
  title: "SK하이닉스 주가 분석: HBM3E 독점은 2026년에도 유지될까? 🚀",
  description: "HBM4 로드맵, 청주·이천·인디애나 캐파 확장, 그리고 삼성전자 진입의 영향까지 종합 분석.",
  category: "주식",
  tags: ["SK하이닉스", "주가", "HBM3E", "HBM4", "메모리"],
  level: "중급" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "ko" as const,
  content: skHynixStock2026,
 },
 {
  slug: "sk-hynix-employee-bonus-stock",
  title: "SK하이닉스 직원 PS·PI 보너스와 자사주 ROI 💰",
  description: "PS 50% 받은 다음 날의 선택지: 우리사주 vs ISA vs 대출상환. 직급별 보너스 시뮬레이션 포함.",
  category: "주식",
  tags: ["SK하이닉스", "PS", "PI", "보너스", "자사주"],
  level: "중급" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "ko" as const,
  content: skHynixEmployeeBonus,
 },
 {
  slug: "semiconductor-cycle-2026",
  title: "반도체 사이클 2026: 메모리 정점기 직장인 자산관리 🔄",
  description: "회복-확장-정점-조정 4단계 사이클. 단계별 자사주 비중·PS 활용·고정비 관리 원칙.",
  category: "주식",
  tags: ["반도체사이클", "메모리", "자산관리", "정점", "직장인"],
  level: "고급" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "ko" as const,
  content: semiconductorCycle2026,
 },
 {
  slug: "samsung-vs-hynix-employee-comparison",
  title: "삼성전자 vs SK하이닉스: 신입 보상·복지·주식 완전 비교 ⚖️",
  description: "초봉, 사이닝 보너스, OPI/TAI vs PS/PI, 자사주 제도, 사택까지. 6가지 판단 기준으로 정리.",
  category: "주식",
  tags: ["삼성전자", "SK하이닉스", "신입연봉", "비교", "취업"],
  level: "초급" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "ko" as const,
  content: samsungVsHynix,
 },
 {
  slug: "chip-stock-tax-guide",
  title: "반도체 주식 세금 절세 가이드: ISA·연금저축 활용법 🧾",
  description: "직장인이 삼성전자/SK하이닉스를 매도할 때 챙겨야 할 4가지 절세 전략. ISA·IRP·손익통산·해외 250만원 공제.",
  category: "주식",
  tags: ["주식세금", "양도소득세", "ISA", "연금저축", "절세"],
  level: "중급" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "ko" as const,
  content: chipStockTax,
 },
 {
  slug: "kospi-leader-stock-strategy",
  title: "코스피 대장주(삼성·SK하이닉스) 적립식 vs 일시매수 전략 📈",
  description: "월급의 5~10% 자동이체로 평단 관리. 연봉별 비중 상한과 정점 신호 시 매도 가이드.",
  category: "주식",
  tags: ["적립식투자", "DCA", "삼성전자", "SK하이닉스", "포트폴리오"],
  level: "중급" as const,
  publishedDate: "2026-05-06",
  views: 0,
  lang: "ko" as const,
  content: kospiLeaderStrategy,
 },
];
