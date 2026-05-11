// src/lib/guides/semiconductor-deepdive.ts
//
// 반도체 산업 시즌 가이드 (2026년 5월 12일 삼성전자 임금협상 본격 시작 기준).
// 삼성전자/SK하이닉스/반도체 직장인 키워드를 광범위하게 흡수하는 7개 가이드.
// 면책: 모든 수치는 공개된 보도·잡플래닛·블라인드·전자공시(DART) 기반 추정치이며 회사 공식 입장이 아님.

const DISCLAIMER_HTML = `
<div class="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 my-8 text-sm">
 <p class="font-bold text-amber-900 dark:text-amber-200 mb-2">⚠️ 본 가이드 이용 안내</p>
 <p class="text-amber-800 dark:text-amber-300 leading-relaxed">
  본 글의 수치(연봉, 인상률, 성과급, 협상 결과 등)는 공개된 보도자료·잡플래닛·블라인드 후기·DART 공시 등 공개 정보 기반의 추정치입니다.
  회사 공식 입장이 아니며, 협상 결과는 노사 합의에 따라 실시간으로 변동될 수 있습니다.
  자세한 사항은 본인 회사 인사팀 또는 노조 공식 발표를 확인하시기 바랍니다.
 </p>
</div>
`;

const samsungWageNegotiation2026 = `
<p class="lead">
 <time datetime="2026-05-12">2026년 5월 12일</time>, 삼성전자 노사가 2026년도 임금·복지 협상의 본격 교섭에 돌입했습니다.
 매출 300조원·영업이익 50조원대 회복이 가시화된 상황에서 이번 협상의 인상률과 성과급 체계 개편은 반도체 업계 전반에 파급될 핵심 이슈입니다.
 본 가이드는 협상 핵심 쟁점 5가지, 직급별 예상 인상폭, 그리고 직원이 미리 준비할 가계 시나리오까지 정리합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📅 협상 일정과 핵심 쟁점</h2>

<div class="bg-card p-6 rounded-xl border border-border my-6">
 <p class="font-bold mb-3">📍 2026년 5월 12일 본격 교섭 시작</p>
 <ul class="space-y-2 text-sm">
  <li>· 노조 측 요구안 제시 → 사측 제시안 교환</li>
  <li>· 일반적으로 6~8주에 걸쳐 5~10차 본교섭 진행</li>
  <li>· 잠정 합의 → 조합원 찬반투표 → 최종 타결의 단계</li>
  <li>· 과거 패턴: 합의 시점은 6~8월, 소급 적용은 1월 1일자</li>
 </ul>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">⚖️ 노사 핵심 쟁점 5가지</h2>

<h3 class="text-xl font-bold mt-8 mb-3">쟁점 1. 기본급 인상률</h3>
<p>
 노조 측은 통상 7~9%대를 요구하고 사측은 3~5%대를 제시하는 흐름이 일반적입니다.
 2025년 협상에서는 결과적으로 5%대에서 타결됐는데, 2026년은 메모리 호황 지속과 HBM3E 매출 본격 반영으로 노조 요구안이 상향될 가능성이 큽니다.
 <strong>합의선 추정: 5.0~6.5%</strong>
</p>

<h3 class="text-xl font-bold mt-8 mb-3">쟁점 2. OPI(초과이익성과금) 산정 방식</h3>
<p>
 OPI는 사업부 영업이익의 일정 비율을 기본급 대비 배수로 환산해 지급하는 삼성전자 고유 제도입니다.
 DS(반도체) 부문은 메모리 흑자 폭에 따라 OPI 한도가 결정되며, 2025년 기준 일부 사업부는 연봉의 50%(기본급 기준 1000%)에 근접했습니다.
 2026년 쟁점은 산정 베이스를 '기본급' 기준에서 '통상임금' 기준으로 확대 적용할지 여부입니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">쟁점 3. TAI(목표달성장려금) 통합 여부</h3>
<p>
 TAI는 반기 단위로 사업부별 KPI를 평가해 지급하는 제도입니다.
 노조는 OPI와 TAI를 통합하고 산정 기준을 단순화하자는 요구를 지속해왔습니다.
 이는 직원 입장에서 예측 가능성을 높이는 효과가 있어 협상 우선순위가 높은 항목입니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">쟁점 4. 복지포인트·자녀 학자금</h3>
<p>
 현행 복지포인트(약 100만원/년), 자녀 학자금(대학 등록금 전액), 사내 병원 무상 이용 등을 확대할지 여부.
 특히 자녀가 있는 30~40대 직원의 만족도와 직결되어 임금 인상보다 체감 효과가 크다는 분석이 있습니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">쟁점 5. 노조 가입률과 단체협약 적용 범위</h3>
<p>
 삼성전자 노조 가입률은 2025년 말 기준 약 25%로 추정됩니다.
 단체협약 조항이 비조합원에게 어디까지 자동 적용되는지가 인사팀과 노조의 신경전 영역입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 직급별 예상 인상폭 시뮬레이션</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">직급(2025년 연봉 가정)</th>
    <th class="p-3 text-left">5% 인상 시</th>
    <th class="p-3 text-left">6% 인상 시</th>
    <th class="p-3 text-left">7% 인상 시</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">사원 (5,500만원)</td>
    <td class="p-3">5,775만원</td>
    <td class="p-3">5,830만원</td>
    <td class="p-3 font-bold text-primary">5,885만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">대리 (7,500만원)</td>
    <td class="p-3">7,875만원</td>
    <td class="p-3">7,950만원</td>
    <td class="p-3 font-bold text-primary">8,025만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">책임 (1억)</td>
    <td class="p-3">1억 500만원</td>
    <td class="p-3">1억 600만원</td>
    <td class="p-3 font-bold text-primary">1억 700만원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">수석 (1억 4,000만원)</td>
    <td class="p-3 font-bold">1억 4,700만원</td>
    <td class="p-3 font-bold">1억 4,840만원</td>
    <td class="p-3 font-bold text-primary">1억 4,980만원</td>
   </tr>
  </tbody>
 </table>
</div>

<p class="text-xs text-muted-foreground mt-2">
 ※ 위 표는 기본 연봉만 반영. OPI/TAI 성과급은 별도. 1월 1일자 소급 적용 시 7월 급여에 5~7개월치 차액이 일시 지급되는 패턴.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 협상 결과를 기다리는 동안 챙길 4가지</h2>

<ul class="space-y-3 mt-4">
 <li><strong>① 소급분 일시 입금 대비:</strong> 잠정합의가 6~8월에 이뤄지면 1~합의시점까지 5~8개월치가 한 번에 입금됩니다. 비상금 통장 대신 단기 적금이나 CMA로 분산하면 이자 손실을 줄일 수 있습니다.</li>
 <li><strong>② 종합소득세 신고분 변동 가능:</strong> 인상분이 연소득 1.5억·3억·5억 구간을 넘기는 직원은 누진세율 구간 변동을 사전에 시뮬레이션해야 합니다.</li>
 <li><strong>③ 우리사주 청약 한도 재계산:</strong> 연봉의 일정 비율로 한도가 설정되는 경우, 인상분만큼 청약 가능액이 늘어납니다.</li>
 <li><strong>④ 주택대출 한도 재산정 가능:</strong> 연봉 증가는 DSR·DTI 한도 확대로 이어집니다. 대출 갈아타기·증액 계획이 있다면 협상 타결 직후가 적기.</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 함께 보면 좋은 가이드</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/samsung-negotiation-2026" class="text-primary underline">삼성전자 2026 임금협상 통합 페이지</a></li>
  <li>· <a href="/company/samsung-electronics" class="text-primary underline">삼성전자 연봉·복지 회사 프로필</a></li>
  <li>· <a href="/guides/sk-hynix-wage-2026" class="text-primary underline">SK하이닉스 2026 임금·PS 분석</a></li>
  <li>· <a href="/guides/samsung-hynix-2026-deepdive" class="text-primary underline">삼성 vs 하이닉스 2026 종합 비교</a></li>
  <li>· <a href="/calc/year-end-bonus" class="text-primary underline">성과급(보너스) 세후 계산기</a></li>
 </ul>
</div>
`;

const skHynixWage2026 = `
<p class="lead">
 SK하이닉스는 2024~2025년 HBM3E 슈퍼사이클로 분기 영업이익 7조원대를 기록하며 사상 최대 PS(이익분배금)를 직원에게 지급했습니다.
 2026년 임금협상의 핵심 질문은 명확합니다: <strong>이 PS 수준을 2026년에도 유지할 수 있는가, 그리고 기본급 인상은 어떻게 될 것인가?</strong>
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 SK하이닉스 보상 구조 한눈에</h2>

<div class="grid md:grid-cols-3 gap-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">① 기본급 (연봉)</h4>
  <p class="text-sm text-muted-foreground">2025년 신입 5,800만원 수준. 매년 임단협 인상률 적용.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-primary">
  <h4 class="font-bold mb-2">② PS (이익분배금)</h4>
  <p class="text-sm text-muted-foreground">영업이익 기반. 연 1회(1~2월) 지급. 2024년 호황기 연봉의 1000% 수준(기본급 기준)을 기록.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">③ PI (생산성 격려금)</h4>
  <p class="text-sm text-muted-foreground">반기 단위 사업부 KPI 평가. 연 2회. 최고 등급 시 기본급의 100~150%.</p>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">📈 PS 5년 추이와 2026년 전망</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">연도</th>
    <th class="p-3 text-left">영업이익(추정)</th>
    <th class="p-3 text-left">PS 지급률(기본급 기준)</th>
    <th class="p-3 text-left">시장 상황</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">2021</td>
    <td class="p-3">12조원</td>
    <td class="p-3">1,000%</td>
    <td class="p-3">호황</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">2022</td>
    <td class="p-3">7조원</td>
    <td class="p-3">820%</td>
    <td class="p-3">하반기 둔화</td>
   </tr>
   <tr class="border-t border-border bg-red-50 dark:bg-red-950/20">
    <td class="p-3">2023</td>
    <td class="p-3 text-red-600">-7.7조원 (적자)</td>
    <td class="p-3 text-red-600">0% (미지급)</td>
    <td class="p-3">메모리 다운사이클 최저점</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">2024</td>
    <td class="p-3 font-bold">23조원</td>
    <td class="p-3 font-bold text-primary">1,500%</td>
    <td class="p-3">HBM 본격 매출</td>
   </tr>
   <tr class="border-t border-border bg-primary/10">
    <td class="p-3 font-bold">2025</td>
    <td class="p-3 font-bold">30조원+</td>
    <td class="p-3 font-bold text-primary">1,500% 안팎</td>
    <td class="p-3">HBM3E 양산 안정화</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-bold">2026 (예상)</td>
    <td class="p-3">30~35조원</td>
    <td class="p-3">1,000~1,500%</td>
    <td class="p-3">HBM4 진입, 삼성 경쟁 격화</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 2026년 임단협 핵심 변수</h2>

<h3 class="text-xl font-bold mt-8 mb-3">변수 1. 기본급 인상률</h3>
<p>
 2025년 임단협에서는 약 5.5% 수준에서 타결됐습니다.
 2026년은 사상 최대 이익 행진 중인 만큼 노조 요구안이 7~9%대로 상향될 가능성이 큽니다.
 <strong>합의선 추정: 5.5~7.0%</strong>
</p>

<h3 class="text-xl font-bold mt-8 mb-3">변수 2. PS 산정 기준 변경 가능성</h3>
<p>
 PS는 영업이익 일정 비율 자체에 연동되지만, '기본급'을 기준으로 환산하는 점이 직원 만족도에 영향을 줍니다.
 노조는 산정 기준을 '통상임금' 또는 '총연봉'으로 확대 적용해달라는 요구를 반복해왔습니다.
 이 변경이 실현되면 같은 영업이익에서도 직원 수령액이 20~30% 증가하는 효과가 있습니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">변수 3. PI 등급 분포 조정</h3>
<p>
 PI는 사업부별로 'S/A/B/C/D' 5단계 등급으로 지급되며, 최고 등급(S) 비율을 현재 약 10%에서 20%로 확대해달라는 요구가 있습니다.
 호황기에 사업부 간 격차가 작아지고 있다는 점이 노조의 근거입니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 PS 받고 나면 해야 할 3가지</h2>

<ul class="space-y-3 mt-4">
 <li><strong>① ISA 한도 풀로 채우기:</strong> ISA 비과세 한도(연 2,000만원)는 매년 새로 부여되므로 1~3월에 PS 입금 시 그해 한도를 즉시 채우는 게 유리합니다.</li>
 <li><strong>② 변동성 인지 비상금:</strong> PS는 2023년처럼 0이 될 수 있는 변동성이 큰 보상입니다. 호황기 PS의 30% 이상을 채권형 ETF·정기예금에 분산하면 다음 다운사이클 충격을 완화할 수 있습니다.</li>
 <li><strong>③ 대출 한도 늘리지 말 것:</strong> PS가 큰 해에 주택대출 한도를 늘리면 다음 사이클에서 PS 0일 때 원리금 부담이 가계를 무너뜨립니다. 고정비는 기본급으로만 충당할 수 있게 설계.</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 함께 보면 좋은 가이드</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/company/sk-hynix" class="text-primary underline">SK하이닉스 회사 프로필</a></li>
  <li>· <a href="/guides/samsung-wage-negotiation-2026" class="text-primary underline">삼성전자 2026 임금협상 분석</a></li>
  <li>· <a href="/guides/samsung-hynix-2026-deepdive" class="text-primary underline">삼성 vs 하이닉스 2026 종합 비교</a></li>
  <li>· <a href="/guides/semiconductor-performance-bonus-tax" class="text-primary underline">반도체 성과급 세금 계산법</a></li>
  <li>· <a href="/calc/incentive-tax" class="text-primary underline">인센티브 세후 계산기</a></li>
 </ul>
</div>
`;

const samsungHynix2026Deepdive = `
<p class="lead">
 2026년 5월, 삼성전자 임금협상 본격 개시를 기점으로 반도체 양대 기업의 보상 격차가 다시 주목받고 있습니다.
 단순 연봉 비교를 넘어 OPI vs PS, TAI vs PI, 자사주 제도, 사이클 노출도, 그리고 직원이 실제 느끼는 '체감 보상'까지 종합 비교합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 종합 보상 비교표 (2026년 기준 추정)</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">항목</th>
    <th class="p-3 text-left">삼성전자 DS</th>
    <th class="p-3 text-left">SK하이닉스</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">신입 계약연봉</td>
    <td class="p-3">5,300~5,800만원</td>
    <td class="p-3">5,800~6,200만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">사이닝 보너스</td>
    <td class="p-3">없음 (일부 직군 예외)</td>
    <td class="p-3">300~500만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">주요 성과급</td>
    <td class="p-3">OPI(연 1회) + TAI(반기 2회)</td>
    <td class="p-3">PS(연 1회) + PI(반기 2회)</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">2024 호황기 성과급</td>
    <td class="p-3">연봉의 30~45%</td>
    <td class="p-3 font-bold">연봉의 50~65%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">2023 다운사이클 성과급</td>
    <td class="p-3 font-bold text-amber-600">연봉의 5~15%</td>
    <td class="p-3 text-red-600">PS 0%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">자사주 제도</td>
    <td class="p-3">우리사주 + 매입대출 이자 보전</td>
    <td class="p-3">우리사주 + 매입대출 이자 보전</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">근무지</td>
    <td class="p-3">기흥·화성·평택·천안·온양</td>
    <td class="p-3">이천·청주·미국 인디애나(예정)</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">사택/주거지원</td>
    <td class="p-3">기숙사·사택·주거지원금</td>
    <td class="p-3">기숙사·사택·해피프라이데이(월 1회 휴무)</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">10년차 호황기 총보상 추정</td>
    <td class="p-3 font-bold">1.5~1.7억원</td>
    <td class="p-3 font-bold text-primary">1.7~2.2억원</td>
   </tr>
   <tr class="border-t border-border bg-amber-50 dark:bg-amber-950/20">
    <td class="p-3 font-bold">10년차 다운사이클 총보상 추정</td>
    <td class="p-3 font-bold text-amber-700">1.1~1.3억원</td>
    <td class="p-3 font-bold text-amber-700">0.9~1.1억원</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 6가지 판단 기준</h2>

<h3 class="text-xl font-bold mt-8 mb-3">1. 보상 변동성 선호</h3>
<p>
 SK하이닉스는 호황기에 압도적이지만 2023년처럼 PS 0% 사례도 있습니다.
 삼성은 비메모리(파운드리·MX) 비중이 커서 사이클 충격이 분산되어 다운사이클에도 OPI가 일정 수준 유지되는 패턴.
 <strong>변동성 선호: SK하이닉스 / 안정 선호: 삼성전자</strong>
</p>

<h3 class="text-xl font-bold mt-8 mb-3">2. 직무 다양성</h3>
<p>
 삼성전자 DS: 메모리·파운드리·시스템LSI 3축 → 부서 이동 폭 넓음.
 SK하이닉스: 메모리 전문 → 깊이 있는 도메인 경력.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">3. 글로벌 인지도와 이직 카드</h3>
<p>
 글로벌 브랜드 파워는 삼성전자가 압도적입니다. 향후 빅테크·외국계 이직 시 가산점.
 SK하이닉스도 메모리 업계 글로벌 톱2로 미국·유럽·일본 메모리 기업 이직 시 유리.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">4. 위치(출퇴근)</h3>
<p>
 본인 거주 계획과 가장 직결되는 변수. 화성·평택·기흥 vs 이천·청주의 통근 가능성을 1순위로 따져야 합니다.
 SK하이닉스는 2027년 이후 미국 인디애나 첨단 패키징 공장 가동 시 일부 인력 해외 파견 기회 확대.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">5. 자사주 매입의 장기 ROI</h3>
<p>
 두 회사 모두 우리사주 매입 시 매입대출 이자 보전 제도가 있습니다.
 다만 사이클 정점(2026~2027 추정)에 매입한 자사주는 이듬해 조정 국면에서 일시적 평가손이 발생할 수 있어 분할 매입이 안전.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">6. 워라밸과 라이프스타일</h3>
<p>
 두 회사 모두 라인 운영 부서는 교대근무. 사무직은 부서 간 차이가 회사 간 차이보다 큰 편.
 SK하이닉스 '해피프라이데이'(월 1회 금요일 휴무)는 직원 만족도 항목에서 자주 언급되는 차별점.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 케이스별 추천</h2>

<div class="grid md:grid-cols-2 gap-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border">
  <p class="font-bold mb-3">🏆 SK하이닉스 추천 케이스</p>
  <ul class="text-sm space-y-2">
   <li>· 호황기 보상 극대화 선호</li>
   <li>· 메모리 도메인 깊이 파고 싶음</li>
   <li>· 이천·청주 거주 가능</li>
   <li>· 변동성 감내 가능한 가계 구조</li>
  </ul>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <p class="font-bold mb-3">🏛 삼성전자 추천 케이스</p>
  <ul class="text-sm space-y-2">
   <li>· 안정적인 사이클 분산 선호</li>
   <li>· 부서 이동·해외 주재 기회 중요</li>
   <li>· 글로벌 브랜드 가산점 활용</li>
   <li>· 화성·평택·기흥 거주 가능</li>
  </ul>
 </div>
</div>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 함께 보면 좋은 페이지</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/company/samsung-electronics" class="text-primary underline">삼성전자 회사 프로필</a></li>
  <li>· <a href="/company/sk-hynix" class="text-primary underline">SK하이닉스 회사 프로필</a></li>
  <li>· <a href="/samsung-negotiation-2026" class="text-primary underline">2026 임금협상 통합 페이지</a></li>
  <li>· <a href="/guides/samsung-wage-negotiation-2026" class="text-primary underline">삼성전자 임금협상 심층 분석</a></li>
  <li>· <a href="/guides/sk-hynix-wage-2026" class="text-primary underline">SK하이닉스 PS 분석</a></li>
 </ul>
</div>
`;

const semiconductorPerformanceBonusTax = `
<p class="lead">
 반도체 대기업 직원의 평균 연봉이 1억원을 넘기는 시대, 성과급 입금일에 가장 먼저 떠올리는 질문은 "이 보너스, 세금이 얼마나 빠질까?"입니다.
 OPI·PS·PI·TAI 각각의 세무 처리 방식이 미묘하게 다르고, 같은 금액이라도 일시 지급과 분할 지급의 실수령액 차이가 큽니다.
 본 가이드는 반도체 직장인을 위한 성과급 세금 절감 4가지 전략을 정리합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 성과급 세무 처리 한눈에</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">제도</th>
    <th class="p-3 text-left">회사</th>
    <th class="p-3 text-left">소득 분류</th>
    <th class="p-3 text-left">원천징수</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">OPI</td>
    <td class="p-3">삼성전자</td>
    <td class="p-3">근로소득(상여)</td>
    <td class="p-3">간이세액표 적용 후 연말정산 합산</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">TAI</td>
    <td class="p-3">삼성전자</td>
    <td class="p-3">근로소득(상여)</td>
    <td class="p-3">간이세액표 적용</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">PS</td>
    <td class="p-3">SK하이닉스</td>
    <td class="p-3">근로소득(상여)</td>
    <td class="p-3">합계 연봉 누진세율 적용</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">PI</td>
    <td class="p-3">SK하이닉스</td>
    <td class="p-3">근로소득(상여)</td>
    <td class="p-3">간이세액표 적용</td>
   </tr>
  </tbody>
 </table>
</div>

<p class="text-sm text-muted-foreground mt-2">
 핵심: 모두 '근로소득 상여'로 잡혀 합산 누진세율이 적용됩니다. 별도의 우대 세율은 없습니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💸 누진세율 구조 (2026년 기준)</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">과세표준 구간</th>
    <th class="p-3 text-left">세율</th>
    <th class="p-3 text-left">누진공제</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">1,400만원 이하</td>
    <td class="p-3">6%</td>
    <td class="p-3">-</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">~5,000만원</td>
    <td class="p-3">15%</td>
    <td class="p-3">126만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">~8,800만원</td>
    <td class="p-3">24%</td>
    <td class="p-3">576만원</td>
   </tr>
   <tr class="border-t border-border bg-amber-50 dark:bg-amber-950/20">
    <td class="p-3 font-bold">~1.5억원</td>
    <td class="p-3 font-bold">35%</td>
    <td class="p-3 font-bold">1,544만원</td>
   </tr>
   <tr class="border-t border-border bg-red-50 dark:bg-red-950/20">
    <td class="p-3 font-bold">~3억원</td>
    <td class="p-3 font-bold">38%</td>
    <td class="p-3 font-bold">1,994만원</td>
   </tr>
   <tr class="border-t border-border bg-red-100 dark:bg-red-950/30">
    <td class="p-3 font-bold">~5억원</td>
    <td class="p-3 font-bold">40%</td>
    <td class="p-3 font-bold">2,594만원</td>
   </tr>
   <tr class="border-t border-border bg-red-200 dark:bg-red-950/40">
    <td class="p-3 font-bold">~10억원</td>
    <td class="p-3 font-bold">42%</td>
    <td class="p-3 font-bold">3,594만원</td>
   </tr>
  </tbody>
 </table>
</div>

<p class="text-sm text-amber-700 dark:text-amber-300 mt-2 font-semibold">
 ⚠️ 반도체 호황기 PS 받으면 연봉이 35%→38% 구간으로 한 단계 점프하는 경우가 흔합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 4가지 절세 전략</h2>

<h3 class="text-xl font-bold mt-8 mb-3">전략 1. 연금저축펀드·IRP 한도 최대 활용</h3>
<p>
 연금저축 연 600만원 + IRP 추가 300만원 = <strong>총 900만원까지 세액공제</strong> 가능.
 연소득 5,500만원 초과 시 13.2% 공제율 적용 → 연간 약 119만원 환급.
 호황기 PS 받은 직후 PS의 10% 정도를 IRP에 부으면 즉시 세금 환급으로 회수됩니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">전략 2. ISA(개인종합자산관리계좌)로 매매차익 비과세</h3>
<p>
 PS 받은 자금으로 ISA 한도(연 2,000만원, 누적 1억) 내에서 ETF·국내주식 매매하면 매매차익 200만원까지 비과세, 초과분은 9.9% 분리과세.
 일반 계좌(15.4%) 대비 절세 효과 큽니다.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">전략 3. 주택청약저축·청년형 우대상품</h3>
<p>
 주택청약저축 연 240만원까지 소득공제(40%).
 청년형 절세 상품(연 600만원 한도, 만기 시 비과세)도 30대 초반까지 가능.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">전략 4. 기부금·의료비·교육비 세액공제 누락 점검</h3>
<p>
 PS 받은 해는 종합소득이 상위 구간으로 점프하기 쉬워 의료비·교육비 한도 활용도가 높아집니다.
 1년 의료비 본인 7% 초과분, 자녀 교육비 1인당 300만원까지 공제 가능.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🧮 실전 절세 시뮬레이션</h2>

<p>SK하이닉스 10년차(연봉 1.2억) PS 6,000만원 수령 케이스:</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">시나리오</th>
    <th class="p-3 text-left">총소득</th>
    <th class="p-3 text-left">대략 소득세 + 지방세</th>
    <th class="p-3 text-left">실수령</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">절세 미적용</td>
    <td class="p-3">1억 8,000만원</td>
    <td class="p-3">약 3,800만원</td>
    <td class="p-3">1억 4,200만원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">IRP 900만 + ISA 2,000만 활용</td>
    <td class="p-3 font-bold">1억 8,000만원</td>
    <td class="p-3 font-bold text-primary">약 3,500만원</td>
    <td class="p-3 font-bold">1억 4,500만원</td>
   </tr>
  </tbody>
 </table>
</div>

<p class="text-xs text-muted-foreground mt-2">
 ※ 위는 단순화한 예시. 실제 환급액은 부양가족·신용카드 사용액·기부금 등에 따라 변동.
</p>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">🛠 함께 사용하면 좋은 도구</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/calc/incentive-tax" class="text-primary underline">인센티브 세후 계산기</a></li>
  <li>· <a href="/tools/finance/bonus" class="text-primary underline">성과급 세금 계산기</a></li>
  <li>· <a href="/tools/finance/irp" class="text-primary underline">IRP 세액공제 계산기</a></li>
  <li>· <a href="/year-end-tax-2026" class="text-primary underline">2026 연말정산 종합 가이드</a></li>
  <li>· <a href="/guides/sk-hynix-wage-2026" class="text-primary underline">SK하이닉스 PS 가이드</a></li>
 </ul>
</div>
`;

const hbmSupercycleWorker2026 = `
<p class="lead">
 HBM(고대역폭메모리)은 2024~2025년 AI 가속기 폭증과 함께 메모리 업계의 게임 체인저가 되었습니다.
 직장인이 단순히 '회사 주가 오른다'를 넘어, HBM 사이클을 자신의 자산 배분에 어떻게 반영할지가 중요합니다.
 본 가이드는 HBM 산업 구조 → 2026년 슈퍼사이클 시나리오 → 직장인 자산 전략까지 단계별로 정리합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🔬 HBM이 왜 게임 체인저인가</h2>

<p>
 일반 DRAM 대비 HBM의 단위 가격은 약 5~7배.
 같은 웨이퍼에서 HBM을 만들면 매출과 마진이 모두 점프합니다.
 더 중요한 건 <strong>고객 다변화의 거꾸로 효과</strong>: 엔비디아·AMD·구글·메타·아마존 등 빅테크 AI 가속기 수요가 모두 HBM으로 몰리면서 메모리 업계의 수요 변동성이 일시적으로 낮아졌습니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📅 HBM 로드맵과 사이클 단계</h2>

<div class="space-y-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-green-500">
  <h4 class="font-bold mb-2">2024 — HBM3E 8단 양산 본격화</h4>
  <p class="text-sm">SK하이닉스가 선도. 삼성도 8단 진입. 시장 규모 약 200억 달러.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-blue-500">
  <h4 class="font-bold mb-2">2025 — HBM3E 12단 + 삼성 본격 참전</h4>
  <p class="text-sm">12단 제품 엔비디아 퀄 통과. 점유율 재편 시작.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-primary">
  <h4 class="font-bold mb-2">2026 — HBM4 양산 진입 (상반기 샘플, 하반기 양산)</h4>
  <p class="text-sm">베이스 다이를 로직 파운드리(TSMC·삼성 파운드리)에서 제작 → 새 공급망 등장.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-amber-500">
  <h4 class="font-bold mb-2">2027~2028 — 캐파 증설 결과 본격 반영</h4>
  <p class="text-sm">SK하이닉스 미국 인디애나, 청주 M15X, 삼성 평택 P4 가동. 가격 협상력 변동 가능성.</p>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 직장인을 위한 3가지 자산 시나리오</h2>

<h3 class="text-xl font-bold mt-8 mb-3">시나리오 A. 강세 지속 (확률 40%)</h3>
<p>
 AI 가속기 수요가 2027년까지 두 자릿수 성장 → HBM 점유율 격차 유지 → 메모리 영업이익률 30%+ 유지.
 직장인 대응: 자사주 보유분 그대로 유지, 적립식 매수 지속, ISA 한도 비과세 매매 확대.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">시나리오 B. 정점 후 완만한 조정 (확률 45%)</h3>
<p>
 2026년 정점 → 2027년 캐파 증설 본격 반영 → 가격 10~20% 조정.
 직장인 대응: 자사주 비중을 금융자산의 25% 이하로 점진 조정, PS 받은 자금의 30% 채권형 ETF 분산.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">시나리오 C. 급격한 다운사이클 (확률 15%)</h3>
<p>
 빅테크 AI 자본지출 둔화 + 캐파 과잉 → 2027~2028 메모리 가격 30~50% 조정.
 직장인 대응: 고정비를 기본급 100% 기준으로 재설계, 비상금 6개월치 확보, 단기 대출 우선 상환.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 시나리오별 추천 자산 배분</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">자산</th>
    <th class="p-3 text-left">강세 시</th>
    <th class="p-3 text-left">정점 후 조정 시</th>
    <th class="p-3 text-left">다운사이클 시</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">자사주(삼성/하이닉스)</td>
    <td class="p-3">25~30%</td>
    <td class="p-3">15~20%</td>
    <td class="p-3">10% 이하</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">S&P 500·나스닥 ETF</td>
    <td class="p-3">20%</td>
    <td class="p-3">25%</td>
    <td class="p-3">30%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">채권형 ETF·예금</td>
    <td class="p-3">10%</td>
    <td class="p-3">15%</td>
    <td class="p-3">25%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">금·달러</td>
    <td class="p-3">5%</td>
    <td class="p-3">10%</td>
    <td class="p-3">10%</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">부동산(자가)</td>
    <td class="p-3">30%</td>
    <td class="p-3">25%</td>
    <td class="p-3">20%</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">현금성</td>
    <td class="p-3 font-bold">10%</td>
    <td class="p-3 font-bold">10%</td>
    <td class="p-3 font-bold">5%</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💡 HBM 시대의 직장인 체크리스트</h2>

<ul class="space-y-3 mt-4">
 <li>☐ 분기 실적 발표에서 HBM 매출 비중 추이 모니터링 (회사 IR 페이지)</li>
 <li>☐ 엔비디아·AMD 분기 가이던스 데이터센터 비중 60%+ 유지 여부</li>
 <li>☐ DDR5 일반 메모리 가격 추이 (DRAMeXchange)</li>
 <li>☐ 본인 자사주 평가액이 금융자산의 30%를 넘는지 분기마다 점검</li>
 <li>☐ 호황기 PS의 30% 이상은 다른 자산군으로 분산</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 함께 보면 좋은 가이드</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/guides/semiconductor-cycle-2026" class="text-primary underline">반도체 사이클 4단계 자산 전략</a></li>
  <li>· <a href="/guides/samsung-electronics-stock-2026" class="text-primary underline">삼성전자 2026 주가 시나리오</a></li>
  <li>· <a href="/guides/sk-hynix-stock-2026" class="text-primary underline">SK하이닉스 주가 분석</a></li>
  <li>· <a href="/fire-calculator" class="text-primary underline">FIRE 계산기로 자산 시뮬레이션</a></li>
 </ul>
</div>
`;

const semiconductorEntrySalary2026 = `
<p class="lead">
 반도체 채용 시장에서 학사·석사·박사의 초봉 격차는 단순한 학력 차이가 아닙니다.
 직무 배치, 사이닝 보너스, 커리어 트랙, 그리고 5년 후 누적 보상까지 모두 다릅니다.
 2026년 채용 기준 가장 최신 자료를 종합해 학력별·직무별 초봉 가이드를 정리합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 학력별 신입 초봉 비교 (2026년 추정)</h2>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">학력</th>
    <th class="p-3 text-left">삼성전자 DS</th>
    <th class="p-3 text-left">SK하이닉스</th>
    <th class="p-3 text-left">사이닝 보너스</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">학사 (4년제)</td>
    <td class="p-3">5,300~5,500만원</td>
    <td class="p-3">5,800~6,000만원</td>
    <td class="p-3">없음 / 0~300만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3 font-semibold">석사</td>
    <td class="p-3">6,000~6,500만원</td>
    <td class="p-3">6,500~7,000만원</td>
    <td class="p-3">300~500만원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">박사</td>
    <td class="p-3 font-bold">8,000~9,500만원</td>
    <td class="p-3 font-bold">8,500~1억원</td>
    <td class="p-3 font-bold">1,000~3,000만원 (직무별)</td>
   </tr>
  </tbody>
 </table>
</div>

<p class="text-xs text-muted-foreground mt-2">
 ※ 위는 계약연봉 기준. 성과급(OPI/PS)은 별도. 호황기 박사 신입 총보상은 1.5억원을 넘기는 경우도 흔합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🔬 직무별 초봉 격차</h2>

<div class="grid md:grid-cols-2 gap-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-primary">
  <h4 class="font-bold mb-2">⭐ 고연봉 직무 (학사 기준 5,800만원~)</h4>
  <ul class="text-sm space-y-1">
   <li>· 반도체 설계 (회로/SoC)</li>
   <li>· 공정 기술 (포토·식각·증착)</li>
   <li>· 패키지 (HBM·CoWoS·TSV)</li>
   <li>· AI/SW (메모리 펌웨어)</li>
  </ul>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">일반 직무 (학사 기준 5,300만원)</h4>
  <ul class="text-sm space-y-1">
   <li>· 양산기술·제조·품질</li>
   <li>· 마케팅·영업</li>
   <li>· 경영지원·HR</li>
   <li>· 재무·구매</li>
  </ul>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 5년 누적 보상 시뮬레이션</h2>

<p>학사·석사·박사가 같은 회사(SK하이닉스 추정)에서 5년 근무했을 때 총 누적 보상.</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">학력</th>
    <th class="p-3 text-left">기본급 5년 누적</th>
    <th class="p-3 text-left">PS/PI 5년 누적 (호황기)</th>
    <th class="p-3 text-left">총 누적</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">학사 (입사 ~5년차)</td>
    <td class="p-3">3.2억원</td>
    <td class="p-3">1.5억원</td>
    <td class="p-3">4.7억원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">석사 (입사 ~5년차)</td>
    <td class="p-3">3.7억원</td>
    <td class="p-3">1.8억원</td>
    <td class="p-3">5.5억원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">박사 (입사 ~5년차)</td>
    <td class="p-3 font-bold">5.0억원</td>
    <td class="p-3 font-bold">2.5억원</td>
    <td class="p-3 font-bold text-primary">7.5억원</td>
   </tr>
  </tbody>
 </table>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">⚖️ 학사 vs 석사 vs 박사 — 어떻게 결정할까</h2>

<h3 class="text-xl font-bold mt-8 mb-3">학사 추천 케이스</h3>
<ul class="space-y-2 mt-3">
 <li>· 빨리 사회 진출해서 자산 적립 시작하고 싶음</li>
 <li>· 양산기술·제조 직군 적합 (학력 격차 작음)</li>
 <li>· 외부 자격증·실무 경력으로 격차 메울 자신 있음</li>
</ul>

<h3 class="text-xl font-bold mt-8 mb-3">석사 추천 케이스</h3>
<ul class="space-y-2 mt-3">
 <li>· R&D 트랙·연구소 직무 선호</li>
 <li>· 학사 대비 +500~700만원 보상에 +2년 등록금 트레이드오프 OK</li>
 <li>· 박사까지는 부담스러움</li>
</ul>

<h3 class="text-xl font-bold mt-8 mb-3">박사 추천 케이스</h3>
<ul class="space-y-2 mt-3">
 <li>· 회로 설계·공정 R&D 등 전문 영역</li>
 <li>· 글로벌 빅테크·해외 이직 카드 활용 의향</li>
 <li>· 5년 학위과정의 기회비용을 5년 차 이후 따라잡을 수 있는 도메인</li>
</ul>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">📌 함께 보면 좋은 페이지</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/company/samsung-electronics" class="text-primary underline">삼성전자 회사 프로필</a></li>
  <li>· <a href="/company/sk-hynix" class="text-primary underline">SK하이닉스 회사 프로필</a></li>
  <li>· <a href="/new-employee-2026" class="text-primary underline">2026 신입 연봉 협상 가이드</a></li>
  <li>· <a href="/salary-db" class="text-primary underline">회사별 연봉 DB</a></li>
  <li>· <a href="/guides/samsung-hynix-2026-deepdive" class="text-primary underline">삼성 vs 하이닉스 종합 비교</a></li>
 </ul>
</div>
`;

const chipRsuStockTax2026 = `
<p class="lead">
 반도체 대기업 직원의 자산 구성에서 우리사주·자사주 매입 비중은 30%를 넘는 경우가 흔합니다.
 매입 시점과 매도 시점의 세금 처리를 잘못하면 같은 보유 기간에도 실효 수익률이 크게 달라집니다.
 본 가이드는 우리사주·매입대출·임원 RSU·자사주 매도 시 세금까지 직장인 관점에서 통합 정리합니다.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📚 4가지 자사주 제도 한눈에</h2>

<div class="grid md:grid-cols-2 gap-4 mt-6">
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">① 우리사주조합 청약</h4>
  <p class="text-sm text-muted-foreground mb-2">신주 발행 시 시장가 대비 일정 할인 청약. 1년 의무 보호예수.</p>
  <p class="text-xs"><strong>세무:</strong> 청약 차익은 근로소득 비과세. 매도 시점에 양도소득세 적용 가능성.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">② 우리사주 매입대출</h4>
  <p class="text-sm text-muted-foreground mb-2">회사가 이자 일부 보전. 본인 부담 이자는 비용 처리 불가.</p>
  <p class="text-xs"><strong>세무:</strong> 회사 보전 이자는 근로소득에 합산되어 과세.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border border-l-4 border-l-primary">
  <h4 class="font-bold mb-2">③ 임원 RSU (양도제한조건부주식)</h4>
  <p class="text-sm text-muted-foreground mb-2">상무 이상 일부 직군. 베스팅 기간 후 부여. 베스팅 시점에 시가 기준 근로소득 과세.</p>
  <p class="text-xs"><strong>세무:</strong> 베스팅 시점 가치 = 근로소득 과세. 이후 양도 차익은 별도 양도소득세.</p>
 </div>
 <div class="bg-card p-5 rounded-xl border border-border">
  <h4 class="font-bold mb-2">④ 일반 자사주 직접 매수</h4>
  <p class="text-sm text-muted-foreground mb-2">증권 계좌로 직접 매수. 우리사주 한도 외에 추가 매수 가능.</p>
  <p class="text-xs"><strong>세무:</strong> 대주주 요건 충족 시 양도소득세 부과.</p>
 </div>
</div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 매도 시점별 세금 차이</h2>

<p>삼성전자 5,000만원 어치를 매수해서 7,000만원에 매도한 케이스 가정 (양도차익 2,000만원).</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">매수 경로</th>
    <th class="p-3 text-left">매도 세금</th>
    <th class="p-3 text-left">실수령(세후)</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">우리사주 (1년 보호예수 후)</td>
    <td class="p-3 text-primary">대주주 아니면 비과세</td>
    <td class="p-3 font-bold">7,000만원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">ISA 내 매수</td>
    <td class="p-3 font-bold text-primary">200만원까지 비과세, 초과분 9.9% 분리과세</td>
    <td class="p-3 font-bold">6,822만원 ~ 7,000만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">일반 증권계좌 (소액주주)</td>
    <td class="p-3 text-primary">대주주 아니면 비과세</td>
    <td class="p-3 font-bold">7,000만원</td>
   </tr>
   <tr class="border-t border-border bg-amber-50 dark:bg-amber-950/20">
    <td class="p-3">대주주 요건 충족 시</td>
    <td class="p-3 text-amber-700">양도세 22% (지방세 포함)</td>
    <td class="p-3 font-bold text-amber-700">6,560만원</td>
   </tr>
   <tr class="border-t border-border">
    <td class="p-3">임원 RSU 매도</td>
    <td class="p-3">베스팅 시 근로소득 과세 + 매도 시 양도세 가능</td>
    <td class="p-3">6,300만원~ (개인 누진세율 의존)</td>
   </tr>
  </tbody>
 </table>
</div>

<p class="text-sm text-amber-700 dark:text-amber-300 mt-2 font-semibold">
 ⚠️ 대주주 기준: 종목별 보유 시가총액 또는 지분율 기준. 매년 세법 변동 가능성 있어 매도 직전 최신 기준 확인 필수.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 매수·매도 시점 결정 4원칙</h2>

<h3 class="text-xl font-bold mt-8 mb-3">원칙 1. 우리사주 청약은 시장가 -할인폭이 본인 부담 이자보다 클 때만</h3>
<p>
 회사가 보전해주는 이자 외에 본인이 부담하는 이자가 시장가 대비 할인폭보다 크면, 청약 자체가 손해가 됩니다.
 청약 직전에 본인 부담 이자율과 청약 할인율을 명확히 계산.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">원칙 2. ISA 한도 우선, 그다음 일반 계좌</h3>
<p>
 매년 ISA 한도(2,000만원) 만큼은 ISA 계좌로 매수해 매매차익을 비과세로 가져갑니다.
 한도 초과분만 일반 계좌로.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">원칙 3. 보호예수 해제일 매도 가능 시점 캘린더에 등록</h3>
<p>
 우리사주 1년 보호예수 해제일을 캘린더에 등록하고, 그 시점에 시장 상황을 점검해 부분 매도 여부를 결정.
 호황기 사이클 정점에 해제일이 걸린다면 절호의 차익실현 기회.
</p>

<h3 class="text-xl font-bold mt-8 mb-3">원칙 4. 매도는 분산이 정답</h3>
<p>
 한 번에 전량 매도하면 종합소득세 누진 구간 점프 가능성.
 3~4년에 걸쳐 분산 매도하면 같은 차익도 더 낮은 누적 세율 적용.
</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🧮 사례: PS + 우리사주 통합 절세 시뮬레이션</h2>

<p>SK하이닉스 10년차(연봉 1.2억) PS 6,000만원 + 우리사주 평가차익 2,000만원 케이스:</p>

<div class="overflow-x-auto my-6">
 <table class="w-full text-sm border border-border">
  <thead class="bg-secondary">
   <tr>
    <th class="p-3 text-left">시나리오</th>
    <th class="p-3 text-left">PS 세후</th>
    <th class="p-3 text-left">우리사주 세후</th>
    <th class="p-3 text-left">총 실수령</th>
   </tr>
  </thead>
  <tbody>
   <tr class="border-t border-border">
    <td class="p-3">절세 미적용 + 일반계좌 매도</td>
    <td class="p-3">4,500만원</td>
    <td class="p-3">2,000만원 (소액주주 비과세)</td>
    <td class="p-3">6,500만원</td>
   </tr>
   <tr class="border-t border-border bg-primary/5">
    <td class="p-3 font-bold">IRP 900만 + ISA 2,000만 분산 + 보호예수 해제 후 매도</td>
    <td class="p-3 font-bold">4,700만원</td>
    <td class="p-3 font-bold">2,000만원</td>
    <td class="p-3 font-bold text-primary">6,700만원</td>
   </tr>
  </tbody>
 </table>
</div>

${DISCLAIMER_HTML}

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20">
 <p class="font-bold text-primary mb-2">🛠 함께 사용하면 좋은 도구</p>
 <ul class="space-y-1 text-sm">
  <li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도소득세 계산기</a></li>
  <li>· <a href="/calc/incentive-tax" class="text-primary underline">인센티브 세후 계산기</a></li>
  <li>· <a href="/guides/semiconductor-performance-bonus-tax" class="text-primary underline">반도체 성과급 세금 가이드</a></li>
  <li>· <a href="/guides/samsung-employee-rsu-stock" class="text-primary underline">삼성전자 직원 자사주 시뮬레이션</a></li>
 </ul>
</div>
`;

export const semiconductorDeepdiveGuides = [
 {
  slug: "samsung-wage-negotiation-2026",
  title: "삼성전자 2026 임금협상 - 5월 12일 본격 시작, 인상률·OPI·복지 핵심 쟁점 📊",
  description: "2026년 5월 12일 본격 교섭에 들어간 삼성전자 임금협상. 5가지 핵심 쟁점, 직급별 예상 인상폭, 소급분 가계 준비까지.",
  category: "주식",
  tags: ["삼성전자", "임금협상", "OPI", "TAI", "2026", "노사협상"],
  level: "중급" as const,
  publishedDate: "2026-05-12",
  views: 0,
  lang: "ko" as const,
  content: samsungWageNegotiation2026,
 },
 {
  slug: "sk-hynix-wage-2026",
  title: "SK하이닉스 2026 임금협상과 PS 1,500% 시대 - HBM 슈퍼사이클 보상 분석 💰",
  description: "2024년 PS 1,500%를 기록한 SK하이닉스. 2026년 임단협 주요 변수와 PS 받고 해야 할 3가지 행동까지.",
  category: "주식",
  tags: ["SK하이닉스", "임금협상", "PS", "PI", "이익분배금", "2026"],
  level: "중급" as const,
  publishedDate: "2026-05-13",
  views: 0,
  lang: "ko" as const,
  content: skHynixWage2026,
 },
 {
  slug: "samsung-hynix-2026-deepdive",
  title: "삼성전자 vs SK하이닉스 2026 종합 보상 비교 - 호황기·다운사이클까지 ⚖️",
  description: "OPI vs PS, TAI vs PI, 자사주, 사이클 노출도까지 양대 반도체 기업 보상 구조를 사이클별로 비교합니다.",
  category: "주식",
  tags: ["삼성전자", "SK하이닉스", "비교", "성과급", "사이클", "2026"],
  level: "초급" as const,
  publishedDate: "2026-05-13",
  views: 0,
  lang: "ko" as const,
  content: samsungHynix2026Deepdive,
 },
 {
  slug: "semiconductor-performance-bonus-tax",
  title: "반도체 성과급 세금 완벽 가이드 - OPI·PS·PI 누진세율과 4가지 절세법 🧾",
  description: "성과급 받으면 누진세 구간 점프. IRP·ISA·청약저축으로 PS 실수령액을 늘리는 4가지 절세 전략과 실전 시뮬레이션.",
  category: "주식",
  tags: ["성과급세금", "OPI", "PS", "IRP", "ISA", "절세", "반도체"],
  level: "중급" as const,
  publishedDate: "2026-05-14",
  views: 0,
  lang: "ko" as const,
  content: semiconductorPerformanceBonusTax,
 },
 {
  slug: "hbm-supercycle-worker-2026",
  title: "HBM 슈퍼사이클 2026 - 반도체 직장인 자산 시나리오 3가지 🚀",
  description: "HBM3E·HBM4 로드맵과 2026년 정점 가능성. 강세/조정/다운사이클 시나리오별 자산 배분 가이드와 직장인 체크리스트.",
  category: "주식",
  tags: ["HBM", "슈퍼사이클", "자산배분", "반도체", "직장인", "2026"],
  level: "고급" as const,
  publishedDate: "2026-05-14",
  views: 0,
  lang: "ko" as const,
  content: hbmSupercycleWorker2026,
 },
 {
  slug: "semiconductor-entry-salary-2026",
  title: "반도체 신입 초봉 2026 - 학사·석사·박사 격차와 5년 누적 보상 시뮬레이션 🎓",
  description: "삼성전자·SK하이닉스 학력별 초봉 비교(학사 5,300만원 ~ 박사 1억원), 직무별 격차, 5년 누적 보상까지.",
  category: "주식",
  tags: ["신입초봉", "반도체", "학사", "석사", "박사", "삼성전자", "SK하이닉스"],
  level: "초급" as const,
  publishedDate: "2026-05-12",
  views: 0,
  lang: "ko" as const,
  content: semiconductorEntrySalary2026,
 },
 {
  slug: "chip-rsu-stock-tax-2026",
  title: "반도체 우리사주·RSU·자사주 절세 통합 가이드 2026 💼",
  description: "우리사주 청약, 매입대출, 임원 RSU, 일반 자사주 매도까지. 매수·매도 시점별 세금과 4가지 절세 원칙.",
  category: "주식",
  tags: ["우리사주", "RSU", "자사주", "절세", "양도소득세", "반도체"],
  level: "고급" as const,
  publishedDate: "2026-05-13",
  views: 0,
  lang: "ko" as const,
  content: chipRsuStockTax2026,
 },
];
