// src/lib/guides/hot-keywords-deepdive.ts
// 네이버 핫 키워드 기반 가이드 — 실업급여, 육아휴직, 근로장려금, 국민연금, 청년정책

export const hotKeywordsGuides = [
 {
  slug: "unemployment-benefits-complete",
  title: "2026 실업급여 완벽 가이드 — 조건·금액·신청방법 총정리",
  description: "실업급여(구직급여) 수급 조건, 지급액 계산법, 신청 절차, 구직활동 요건까지 2026년 기준으로 완벽 정리. 자진 퇴사도 받을 수 있는 예외 조건과 조기재취업수당 활용법까지 포함.",
  category: "커리어",
  tags: ["실업급여", "구직급여", "고용보험", "권고사직", "퇴사", "2026"],
  level: "초급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">직장을 잃으면 가장 먼저 떠오르는 것이 <strong>실업급여(구직급여)</strong>입니다. 2026년 기준 실업급여는 퇴직 전 평균임금의 60%, 최대 일 66,000원을 최대 270일간 받을 수 있습니다. 하지만 조건과 절차를 정확히 알아야 한 푼도 놓치지 않습니다.</p>

<h2>✅ 실업급여 수급 자격 — 이 3가지를 충족해야 합니다</h2>
<ol>
<li><strong>비자발적 퇴사:</strong> 해고, 권고사직, 계약 만료, 정년퇴직 등. 자진 퇴사는 원칙적으로 불가하지만 예외 있음.</li>
<li><strong>고용보험 피보험 기간:</strong> 퇴직 전 18개월 중 180일 이상 고용보험 가입.</li>
<li><strong>근로 의지 및 구직활동:</strong> 일할 능력과 의지가 있으며 적극적으로 재취업 활동 중이어야 함.</li>
</ol>

<h2>💡 자진 퇴사도 실업급여 받는 예외 조건</h2>
<p>다음 사유에 해당하면 자진 퇴사라도 실업급여를 받을 수 있습니다:</p>
<ul>
<li><strong>임금 체불:</strong> 2개월 이상 임금이 지급되지 않은 경우</li>
<li><strong>직장 내 괴롭힘·성희롱 피해:</strong> 사업주에게 신고했지만 적절한 조치가 없는 경우</li>
<li><strong>통근 불가:</strong> 사업장 이전 등으로 편도 통근 시간이 3시간 이상인 경우</li>
<li><strong>건강 악화:</strong> 의사 진단으로 현 직무 수행이 불가한 경우</li>
<li><strong>배우자 동반 이주:</strong> 배우자의 직장 이전으로 원거리 이사가 필요한 경우</li>
<li><strong>부양가족 간호:</strong> 가족의 질병·부상으로 30일 이상 간호가 필요한 경우</li>
</ul>

<h2>💰 실업급여 지급액 계산 (2026년 기준)</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-4 border border-primary/10">
<h3 class="text-lg font-bold text-primary mb-3">1일 구직급여액 계산식</h3>
<p><strong>퇴직 전 3개월 평균임금 × 60%</strong></p>
<ul>
<li>상한: 일 <strong>66,000원</strong> (월 약 198만원)</li>
<li>하한: 최저임금의 80% × 1일 소정근로시간</li>
</ul>
<h3 class="text-lg font-bold text-primary mb-3 mt-4">지급 일수 (50세 미만 기준)</h3>
<table class="w-full text-sm border-collapse">
<tr class="bg-primary/10"><th class="p-2 text-left">고용보험 가입 기간</th><th class="p-2 text-right">지급 일수</th></tr>
<tr class="border-b"><td class="p-2">1년 미만</td><td class="p-2 text-right font-bold">120일</td></tr>
<tr class="border-b"><td class="p-2">1년 이상 ~ 3년 미만</td><td class="p-2 text-right font-bold">150일</td></tr>
<tr class="border-b"><td class="p-2">3년 이상 ~ 5년 미만</td><td class="p-2 text-right font-bold">180일</td></tr>
<tr class="border-b"><td class="p-2">5년 이상 ~ 10년 미만</td><td class="p-2 text-right font-bold">210일</td></tr>
<tr><td class="p-2">10년 이상</td><td class="p-2 text-right font-bold">240일</td></tr>
</table>
<p class="text-sm text-muted-foreground mt-2">※ 50세 이상 또는 장애인은 각 구간에 30일 추가. 최대 270일.</p>
</div>

<h2>📋 실업급여 신청 절차 (단계별)</h2>
<ol>
<li><strong>이직확인서 제출 요청:</strong> 회사에 고용보험 EDI 이직확인서 제출을 요청합니다. 지연 시 고용노동부(1350)에 신고.</li>
<li><strong>수급자격 신청:</strong> 퇴직일 다음 날부터 12개월 이내에 관할 고용센터 방문 또는 고용24(www.work24.go.kr) 온라인 신청.</li>
<li><strong>수급자격 인정:</strong> 고용센터에서 수급 자격 심사 후 인정 여부 통보 (보통 2~3주 소요).</li>
<li><strong>대기기간 7일:</strong> 수급 자격 인정 후 7일간 대기. 이 기간은 급여 미지급.</li>
<li><strong>취업특강 참석:</strong> 1회 필수. 온라인 또는 오프라인 모두 가능.</li>
<li><strong>1차 급여 수령:</strong> 대기기간 이후 첫 구직급여 지급 시작.</li>
<li><strong>4주마다 실업 인정:</strong> 4주마다 고용센터에 구직활동 실적 신고 → 급여 지급 반복.</li>
</ol>

<h2>🔍 구직활동 인정 기준</h2>
<ul>
<li>4주 기간 중 2회 이상 구직활동 증명</li>
<li>인정되는 활동: 입사지원, 면접 참가, 직업훈련 수강, 직업안정기관 상담, 고용센터 취업특강</li>
<li>워크넷에 이력서 등록 + 입사지원은 구직활동으로 자동 연계</li>
</ul>

<h2>🎁 조기재취업수당 — 빨리 취업하면 더 받는다</h2>
<p>수급 기간 중 조기에 재취업하면 남은 급여의 50%를 일시금으로 받을 수 있습니다.</p>
<ul>
<li><strong>조건:</strong> 잔여 급여 일수 30일 이상, 취업 후 6개월 이상 근무 예정</li>
<li><strong>금액:</strong> 잔여 일수 × 일 구직급여액 × 50%</li>
<li><strong>신청:</strong> 재취업일 다음 날부터 12개월 이내</li>
</ul>

<h2>⚠️ 주의사항 — 부정수급 절대 금지</h2>
<ul>
<li>알바·부업 시 반드시 신고 (주 15시간 이상 또는 월 60만원 초과)</li>
<li>부정수급 적발 시: 전액 반환 + 추가 징수(최대 5배) + 5년간 수급 자격 박탈</li>
<li>근로소득이 생기면 취업 신고를 해야 지급일수가 연장됩니다 (총 수령액은 동일)</li>
</ul>

<h2>📞 실업급여 관련 기관</h2>
<ul>
<li><strong>고용노동부 고객상담센터:</strong> 국번 없이 <strong>1350</strong></li>
<li><strong>고용24(온라인 신청):</strong> www.work24.go.kr</li>
<li><strong>워크넷(구직활동):</strong> www.work.go.kr</li>
</ul>
`
 },
 {
  slug: "parental-leave-complete-guide",
  title: "2026 육아휴직 완벽 가이드 — 급여 계산부터 신청까지",
  description: "2026년 최신 육아휴직 급여 계산법, 6+6 부모 육아휴직 혜택, 출산전후휴가와의 차이, 신청 절차, 육아기 근로시간 단축까지 한 번에 정리.",
  category: "커리어",
  tags: ["육아휴직", "출산휴가", "육아휴직급여", "6+6부모육아휴직", "출산", "2026"],
  level: "초급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">2026년 육아휴직 제도는 크게 강화되었습니다. <strong>6+6 부모 육아휴직</strong>으로 부모 모두 사용 시 첫 6개월 최대 월 450만원, 합산 최대 월 900만원을 받을 수 있습니다. 자격 요건부터 신청 방법까지 완벽하게 알아보겠습니다.</p>

<h2>✅ 육아휴직 신청 자격</h2>
<ul>
<li><strong>자녀 나이:</strong> 만 8세 이하 또는 초등학교 2학년 이하</li>
<li><strong>고용보험 기간:</strong> 육아휴직 시작일 기준 고용보험 피보험 기간 180일 이상</li>
<li><strong>고용 형태:</strong> 정규직·계약직·기간제 모두 가능 (30인 미만 사업장도 동일)</li>
<li><strong>사용 기간:</strong> 자녀 1명당 최대 1년, 3회까지 분할 사용 가능</li>
</ul>

<h2>💰 육아휴직 급여 계산 (2026년 기준)</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-4 border border-primary/10">
<h3 class="text-lg font-bold text-primary mb-3">일반 육아휴직 급여</h3>
<ul>
<li><strong>지급액:</strong> 통상임금의 80%</li>
<li><strong>상한:</strong> 월 150만원</li>
<li><strong>하한:</strong> 월 70만원</li>
</ul>
<h3 class="text-lg font-bold text-primary mb-3 mt-4">6+6 부모 육아휴직 (생후 18개월 이내)</h3>
<p>부모가 모두 육아휴직을 사용하면 첫 6개월간 급여가 크게 상향됩니다.</p>
<table class="w-full text-sm border-collapse mt-2">
<tr class="bg-primary/10"><th class="p-2 text-left">사용 월</th><th class="p-2 text-right">상한액 (1인 기준)</th><th class="p-2 text-right">부부 합산 상한</th></tr>
<tr class="border-b"><td class="p-2">1개월</td><td class="p-2 text-right font-bold">월 200만원</td><td class="p-2 text-right">월 400만원</td></tr>
<tr class="border-b"><td class="p-2">2개월</td><td class="p-2 text-right font-bold">월 250만원</td><td class="p-2 text-right">월 500만원</td></tr>
<tr class="border-b"><td class="p-2">3개월</td><td class="p-2 text-right font-bold">월 300만원</td><td class="p-2 text-right">월 600만원</td></tr>
<tr class="border-b"><td class="p-2">4개월</td><td class="p-2 text-right font-bold">월 350만원</td><td class="p-2 text-right">월 700만원</td></tr>
<tr class="border-b"><td class="p-2">5개월</td><td class="p-2 text-right font-bold">월 400만원</td><td class="p-2 text-right">월 800만원</td></tr>
<tr><td class="p-2">6개월</td><td class="p-2 text-right font-bold">월 450만원</td><td class="p-2 text-right">월 900만원</td></tr>
</table>
<p class="text-sm text-muted-foreground mt-2">※ 7~12개월은 일반 급여(통상임금 80%, 상한 150만원) 적용</p>
</div>

<h2>👶 출산전후휴가 vs 육아휴직 차이</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">구분</th><th class="p-2">출산전후휴가</th><th class="p-2">육아휴직</th></tr>
<tr class="border-b"><td class="p-2 font-bold">기간</td><td class="p-2">90일 (다태아 120일)</td><td class="p-2">최대 12개월</td></tr>
<tr class="border-b"><td class="p-2 font-bold">급여</td><td class="p-2">통상임금 100% (상한 월 210만원)</td><td class="p-2">통상임금 80% (상한 월 150만원)</td></tr>
<tr class="border-b"><td class="p-2 font-bold">재원</td><td class="p-2">고용보험 (대기업 초과분은 회사)</td><td class="p-2">고용보험 100%</td></tr>
<tr><td class="p-2 font-bold">중복 가능</td><td class="p-2 text-center" colspan="2">불가. 순차 사용 (출산휴가 → 육아휴직)</td></tr>
</table>

<h2>📋 육아휴직 신청 절차</h2>
<ol>
<li><strong>사전 신청:</strong> 시작 30일 전까지 회사에 서면으로 신청</li>
<li><strong>고용센터 신청:</strong> 육아휴직 시작 후 1개월 이내 고용24(www.work24.go.kr)에서 급여 신청</li>
<li><strong>급여 지급:</strong> 매월 25일 고용보험에서 지급. 단 매달 급여의 25%는 복직 후 일괄 지급</li>
<li><strong>복직 신청:</strong> 복직 후 6개월 이상 근무 시 사후 지급분 청구</li>
</ol>

<h2>⏱️ 육아기 근로시간 단축제도</h2>
<p>육아휴직 대신 근무 시간을 줄여 일하는 대안입니다.</p>
<ul>
<li><strong>대상:</strong> 만 8세 이하 자녀를 둔 근로자</li>
<li><strong>단축 범위:</strong> 주 15~35시간으로 단축 (기존 40시간 대비 최대 25시간 단축)</li>
<li><strong>급여 지원:</strong> 단축 시간 중 첫 주 5시간은 통상임금 100% 지원</li>
<li><strong>사용 기간:</strong> 자녀 1명당 최대 2년</li>
</ul>

<h2>🚫 회사가 거부하면?</h2>
<p>회사는 정당한 사유 없이 육아휴직을 거부할 수 없습니다. 거부 시 <strong>500만원 이하 과태료</strong>가 부과됩니다. 불이익 처우(해고, 임금 삭감 등)는 <strong>3년 이하 징역 또는 3,000만원 이하 벌금</strong> 대상입니다.</p>
<p>권리 침해 시 고용노동부(1350)에 신고하거나 근로복지공단에 구제 신청을 할 수 있습니다.</p>
`
 },
 {
  slug: "earned-income-credit-2026",
  title: "2026 근로장려금 완벽 가이드 — 최대 330만원 받는 방법",
  description: "2026년 근로장려금 지급 기준, 신청 방법, 반기 신청 vs 정기 신청 비교, 자녀장려금 동시 수령 전략까지 완전 정리. 놓치면 손해인 최대 330만원 지원금.",
  category: "세금",
  tags: ["근로장려금", "자녀장려금", "EITC", "저소득", "소득지원", "2026"],
  level: "초급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead"><strong>근로장려금(EITC)</strong>은 저소득 근로자·사업자에게 정부가 지급하는 소득 지원금입니다. 2026년 기준 맞벌이 가구 최대 <strong>330만원</strong>, 자녀장려금까지 합산하면 더 많이 받을 수 있습니다. 신청만 하면 되는데 매년 수백만 명이 놓치고 있습니다.</p>

<h2>💰 2026년 근로장려금 지급 기준</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-4 border border-primary/10">
<table class="w-full text-sm border-collapse">
<tr class="bg-primary/10"><th class="p-2 text-left">가구 유형</th><th class="p-2">소득 기준</th><th class="p-2">재산 기준</th><th class="p-2 text-right">최대 지급액</th></tr>
<tr class="border-b"><td class="p-2 font-bold">단독 가구</td><td class="p-2">2,200만원 미만</td><td class="p-2">2억 4,000만원 미만</td><td class="p-2 text-right font-bold text-primary">165만원</td></tr>
<tr class="border-b"><td class="p-2 font-bold">홑벌이 가구</td><td class="p-2">3,200만원 미만</td><td class="p-2">2억 4,000만원 미만</td><td class="p-2 text-right font-bold text-primary">285만원</td></tr>
<tr><td class="p-2 font-bold">맞벌이 가구</td><td class="p-2">3,800만원 미만</td><td class="p-2">2억 4,000만원 미만</td><td class="p-2 text-right font-bold text-primary">330만원</td></tr>
</table>
<p class="text-sm text-muted-foreground mt-2">※ 소득 기준: 전년도 부부 합산 총소득. 근로소득, 사업소득, 기타소득 포함.</p>
</div>

<h2>👶 자녀장려금도 함께 받기</h2>
<ul>
<li><strong>대상:</strong> 만 18세 미만 자녀가 있는 가구, 총소득 4,000만원 미만</li>
<li><strong>지급액:</strong> 자녀 1명당 최대 100만원</li>
<li><strong>중복 수령 가능:</strong> 근로장려금 + 자녀장려금 동시 신청·수령</li>
<li><strong>예시:</strong> 홑벌이 + 자녀 2명 → 최대 285만원 + 200만원 = <strong>485만원</strong></li>
</ul>

<h2>📅 2026년 신청 일정</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">신청 유형</th><th class="p-2">신청 기간</th><th class="p-2">지급 시기</th></tr>
<tr class="border-b"><td class="p-2 font-bold">반기 (상반기)</td><td class="p-2">2026년 3월 1일~15일</td><td class="p-2">2026년 9월</td></tr>
<tr class="border-b"><td class="p-2 font-bold">정기 신청</td><td class="p-2">2026년 5월 1일~31일</td><td class="p-2">2026년 9월</td></tr>
<tr><td class="p-2 font-bold">반기 (하반기)</td><td class="p-2">2026년 9월 1일~15일</td><td class="p-2">2027년 3월</td></tr>
</table>

<h2>🖥️ 신청 방법 (3가지)</h2>
<ol>
<li><strong>홈택스 (PC):</strong> hometax.go.kr → 장려금·연말정산 → 근로장려금 신청</li>
<li><strong>손택스 (모바일 앱):</strong> 국세청 손택스 앱 → 근로장려금 신청</li>
<li><strong>ARS 전화:</strong> 1544-9944로 전화 후 음성 안내에 따라 신청</li>
</ol>

<h2>✅ 반기 신청 vs 정기 신청 — 어떤 게 유리할까?</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">구분</th><th class="p-2">반기 신청</th><th class="p-2">정기 신청</th></tr>
<tr class="border-b"><td class="p-2 font-bold">지급 방식</td><td class="p-2">상·하반기 2회 분할</td><td class="p-2">1년치 일시 지급</td></tr>
<tr class="border-b"><td class="p-2 font-bold">지급액</td><td class="p-2">추정액의 35% × 2회</td><td class="p-2">확정액 100%</td></tr>
<tr class="border-b"><td class="p-2 font-bold">정확도</td><td class="p-2">추정 기반 (차액 정산)</td><td class="p-2">확정 소득 기반</td></tr>
<tr><td class="p-2 font-bold">적합 대상</td><td class="p-2">현금 흐름이 빠듯한 경우</td><td class="p-2">정확한 금액을 원하는 경우</td></tr>
</table>

<h2>🔍 자동신청 동의하면 편합니다</h2>
<p>홈택스 또는 손택스에서 <strong>자동신청에 동의</strong>하면, 매년 요건 충족 시 별도 신청 없이 자동으로 신청됩니다. 한 번 설정하면 놓칠 위험이 없습니다.</p>

<h2>⚠️ 이런 경우 받지 못할 수 있습니다</h2>
<ul>
<li>가구원 재산 합계가 2억 4,000만원 이상인 경우</li>
<li>전문직 사업자(변호사, 의사, 회계사 등)인 경우</li>
<li>타 가구원이 동일 근로장려금을 수령한 경우</li>
<li>국세·지방세 체납이 있는 경우 (일부 공제 후 지급)</li>
</ul>
`
 },
 {
  slug: "national-pension-strategy-2026",
  title: "2026 국민연금 완벽 가이드 — 내 예상 수령액과 납부 전략",
  description: "2026년 국민연금 보험료율, 예상 수령액 계산법, 임의가입·임의계속가입 전략, 조기 vs 연기 수령 비교, 반납·추후납부 활용법까지 완벽 정리.",
  category: "기초",
  tags: ["국민연금", "노후준비", "연금수령", "임의가입", "노령연금", "2026"],
  level: "중급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">국민연금은 대한민국 최강의 노후 보장 수단입니다. 2026년 현재 보험료율은 9%이며, 수령 나이와 가입 기간에 따라 월 수십만원에서 백만원 이상을 평생 받을 수 있습니다. 내 예상 수령액과 납부 전략을 지금 확인하세요.</p>

<h2>📊 2026년 국민연금 보험료율</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-4 border border-primary/10">
<table class="w-full text-sm border-collapse">
<tr class="bg-primary/10"><th class="p-2 text-left">구분</th><th class="p-2 text-right">근로자 부담</th><th class="p-2 text-right">사업주 부담</th><th class="p-2 text-right">합계</th></tr>
<tr class="border-b"><td class="p-2">직장가입자</td><td class="p-2 text-right font-bold">4.5%</td><td class="p-2 text-right">4.5%</td><td class="p-2 text-right">9%</td></tr>
<tr><td class="p-2">지역가입자</td><td class="p-2 text-right font-bold">9% (전액 본인)</td><td class="p-2 text-right">-</td><td class="p-2 text-right">9%</td></tr>
</table>
<p class="text-sm text-muted-foreground mt-2">※ 기준소득월액: 하한 37만원 ~ 상한 617만원 (2026년 기준). 이 범위 밖은 적용 안 됨.</p>
</div>

<h2>💰 예상 수령액 계산 기준</h2>
<p>국민연금 수령액은 <strong>A값(전체 가입자 평균 소득)과 B값(본인 평균 소득), 가입 기간</strong>으로 결정됩니다.</p>
<div class="bg-secondary/30 p-4 rounded-xl mt-4">
<p><strong>어림 계산 예시:</strong></p>
<ul>
<li>월 소득 300만원 × 20년 가입 → 예상 수령 약 55~65만원/월</li>
<li>월 소득 300만원 × 30년 가입 → 예상 수령 약 75~90만원/월</li>
<li>월 소득 400만원 × 30년 가입 → 예상 수령 약 90~110만원/월</li>
</ul>
</div>

<h2>🔍 내 예상 수령액 조회 방법</h2>
<ol>
<li><strong>국민연금공단 내연금:</strong> nps.or.kr → 내 연금 → 예상연금 조회</li>
<li><strong>정부24:</strong> gov.kr → 국민연금 예상 수령액 조회</li>
<li><strong>국민연금 앱:</strong> 스마트폰 '내 곁에 국민연금' 앱 설치 후 조회</li>
</ol>

<h2>📅 수령 시작 연령 선택 전략</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">구분</th><th class="p-2">수령 시작 나이</th><th class="p-2">지급액 변화</th><th class="p-2">적합한 경우</th></tr>
<tr class="border-b"><td class="p-2 font-bold">조기수령</td><td class="p-2">58~62세</td><td class="p-2 text-red-500">1년당 6% 감액</td><td class="p-2">건강 우려, 당장 필요</td></tr>
<tr class="border-b"><td class="p-2 font-bold">정상수령</td><td class="p-2">63세 (→65세)</td><td class="p-2">기준 100%</td><td class="p-2">일반적인 선택</td></tr>
<tr><td class="p-2 font-bold">연기수령</td><td class="p-2">최대 68세까지</td><td class="p-2 text-green-500">1년당 7.2% 증액</td><td class="p-2">건강·장수, 다른 소득 있음</td></tr>
</table>
<p class="text-sm text-muted-foreground mt-2">※ 2033년까지 단계적으로 정상수령 나이가 65세로 상향됩니다.</p>

<h2>💡 가입 기간 늘리는 전략</h2>
<h3 class="text-lg font-bold mt-4">1. 임의가입 (전업주부·학생·무직자)</h3>
<p>소득이 없어도 자발적으로 국민연금에 가입하여 납부할 수 있습니다.</p>
<ul>
<li>최소 월 34,650원(최저 기준소득월액 37만원 × 9% 실제 부담 4.5% 아님 — 지역가입자이므로 9% 전액)부터 납부 가능</li>
<li>10년 이상 납부해야 노령연금 수령 자격 발생</li>
</ul>

<h3 class="text-lg font-bold mt-4">2. 임의계속가입 (60세 이후)</h3>
<p>60세에 의무 납부가 종료되지만 65세까지 자발적으로 계속 납부하여 수령액을 높일 수 있습니다.</p>

<h3 class="text-lg font-bold mt-4">3. 추후납부 (납부예외 기간 메우기)</h3>
<p>과거 납부예외 기간(휴직, 무직 등)분을 나중에 한꺼번에 납부하여 가입 기간을 늘릴 수 있습니다.</p>

<h3 class="text-lg font-bold mt-4">4. 반납 (과거 반환일시금 되돌리기)</h3>
<p>과거에 받은 반환일시금(이민, 국적 취득 등)을 다시 납부하면 해당 기간이 가입 기간으로 복원됩니다.</p>

<h2>⚠️ 국민연금 관련 자주 묻는 질문</h2>
<ul>
<li><strong>Q. 월급이 없으면 안 내도 되나요?</strong> → 소득이 없으면 납부예외 신청 가능. 하지만 기간 미포함 주의.</li>
<li><strong>Q. 국민연금 없어질 수 있나요?</strong> → 제도 자체가 소멸할 가능성은 낮지만, 기금 고갈(2055년경 예측) 후에도 부과 방식으로 지속될 예정.</li>
<li><strong>Q. 연금이 소득보다 적으면 손해인가요?</strong> → 수익률로만 보면 그럴 수 있지만, 사망할 때까지 평생 지급되는 종신 보험의 성격을 고려해야 합니다.</li>
</ul>
`
 },
 {
  slug: "youth-benefits-2026",
  title: "2026 청년 지원 정책 총정리 — 월세·취업·적금·소득세 감면",
  description: "2026년 청년을 위한 주요 지원 정책 완전 총정리. 청년도약계좌, 청년 월세 지원, 청년내일채움공제, 중소기업 소득세 감면, 청년 전용 대출 상품까지 한 번에.",
  category: "기초",
  tags: ["청년지원", "청년도약계좌", "청년내일채움공제", "소득세감면", "청년월세", "2026"],
  level: "초급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">2026년 청년을 위한 정부 지원 정책이 대폭 강화되었습니다. <strong>적금·월세·취업·세금·대출</strong> 모든 분야에서 청년만 받을 수 있는 특별 혜택이 있습니다. 지금 받지 않으면 시효가 지나 영영 못 받을 수도 있습니다.</p>

<h2>💰 청년도약계좌 — 5년에 최대 5,000만원</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-4 border border-primary/10">
<ul>
<li><strong>대상:</strong> 만 19~34세, 총급여 7,500만원 이하, 가구 중위소득 250% 이하</li>
<li><strong>납입:</strong> 월 40~70만원, 5년 만기</li>
<li><strong>혜택:</strong> 비과세 + 정부 기여금 (소득 낮을수록 더 많이)</li>
<li><strong>정부 기여금:</strong> 총급여 2,400만원 이하 → 월 최대 2.4만원 (연 28.8만원)</li>
<li><strong>중도해지 허용 사유:</strong> 결혼, 생애최초 주택 구입, 퇴직, 폐업, 장기 요양</li>
</ul>
</div>

<h2>🏠 청년 월세 특별지원 — 월 최대 20만원</h2>
<ul>
<li><strong>대상:</strong> 만 19~34세 무주택 청년, 1인 가구, 부모로부터 독립 거주</li>
<li><strong>소득 기준:</strong> 중위소득 60% 이하 (2인 가구 환산)</li>
<li><strong>재산 기준:</strong> 1억 2,200만원 이하</li>
<li><strong>지원액:</strong> 실 월세 범위 내 최대 20만원/월, 최대 12개월</li>
<li><strong>신청:</strong> 복지로(bokjiro.go.kr) 또는 주민센터</li>
</ul>

<h2>💼 청년내일채움공제 — 2년에 1,200만원</h2>
<ul>
<li><strong>대상:</strong> 만 15~34세, 중소·중견기업 정규직 취업 6개월 이내</li>
<li><strong>구조:</strong> 청년 400만원 + 정부 400만원 + 기업 400만원 = 1,200만원</li>
<li><strong>신청 기한:</strong> 취업 후 6개월 이내 (필수! 이후 신청 불가)</li>
<li><strong>중도해지:</strong> 청년 납입분 + 이자만 수령, 정부·기업 기여분 환수</li>
</ul>

<h2>💸 중소기업 취업 청년 소득세 감면 — 5년간 최대 90%</h2>
<ul>
<li><strong>대상:</strong> 만 15~34세 (군 복무 기간 차감, 최대 39세), 중소기업 취업자</li>
<li><strong>감면율:</strong> 소득세의 90%, 연간 200만원 한도</li>
<li><strong>신청:</strong> 취업한 중소기업에 '소득세 감면 신청서' 제출</li>
<li><strong>중요:</strong> 이직 시 새 직장에 재신청 필수. 5년 한도는 누적 적용</li>
<li><strong>놓쳤다면:</strong> 5년 내 경정청구로 소급 적용 가능</li>
</ul>

<h2>🏦 청년 전용 대출 상품</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">상품명</th><th class="p-2">대상</th><th class="p-2">금리</th><th class="p-2">한도</th></tr>
<tr class="border-b"><td class="p-2 font-bold">청년 버팀목 전세 대출</td><td class="p-2">만 19~34세 무주택</td><td class="p-2 text-green-600">연 1.5~2.1%</td><td class="p-2">최대 2억원</td></tr>
<tr class="border-b"><td class="p-2 font-bold">청년 햇살론</td><td class="p-2">저신용 청년</td><td class="p-2">연 10.5% 이하</td><td class="p-2">최대 1,200만원</td></tr>
<tr><td class="p-2 font-bold">중소기업 청년 전세 대출</td><td class="p-2">중소기업 재직 청년</td><td class="p-2 text-green-600">연 1.2%</td><td class="p-2">최대 1억원</td></tr>
</table>

<h2>📱 지자체별 청년 추가 지원</h2>
<ul>
<li><strong>서울시:</strong> 청년월세지원(월 20만원), 청년 대중교통비 지원</li>
<li><strong>경기도:</strong> 청년기본소득(분기 25만원), 청년 면접 수당</li>
<li><strong>기타 지자체:</strong> 각 시·도 청년포털에서 확인 필수</li>
</ul>
<p class="mt-4 p-4 bg-primary/5 rounded-xl"><strong>TIP:</strong> 복지로(bokjiro.go.kr)의 '복지서비스 모의계산' 또는 '혜택정보'에서 내가 받을 수 있는 모든 복지 혜택을 한 번에 조회할 수 있습니다.</p>
`
 },
 {
  slug: "etf-beginner",
  title: "ETF 완전 초보 가이드 — 월 10만원부터 시작하는 인덱스 투자",
  description: "ETF가 뭔지도 모르는 완전 초보를 위한 ETF 투자 입문서. 국내·해외 ETF 종류, 매수 방법, 세금, ISA 계좌 활용법, 추천 ETF 포트폴리오까지 실전 위주로 정리.",
  category: "투자",
  tags: ["ETF", "인덱스펀드", "주식투자", "장기투자", "S&P500", "KODEX"],
  level: "초급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">ETF(상장지수펀드)는 개별 주식 종목을 고르지 않아도 지수 전체에 투자할 수 있는 상품입니다. 연 0.01~0.5% 수준의 저렴한 수수료, 높은 분산 효과, 주식처럼 실시간 거래 가능한 유연함 덕분에 장기 투자자에게 가장 추천되는 방법입니다.</p>

<h2>🔰 ETF vs 펀드 vs 개별 주식 — 뭐가 다른가요?</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">구분</th><th class="p-2">ETF</th><th class="p-2">일반 펀드</th><th class="p-2">개별 주식</th></tr>
<tr class="border-b"><td class="p-2 font-bold">거래 방법</td><td class="p-2">실시간 (주식처럼)</td><td class="p-2">하루 1번 기준가</td><td class="p-2">실시간</td></tr>
<tr class="border-b"><td class="p-2 font-bold">수수료</td><td class="p-2 text-green-600">연 0.01~0.5%</td><td class="p-2 text-red-500">연 1~2.5%</td><td class="p-2">거래세 0.2%</td></tr>
<tr class="border-b"><td class="p-2 font-bold">분산 효과</td><td class="p-2 text-green-600">높음 (수십~수백 종목)</td><td class="p-2 text-green-600">높음</td><td class="p-2 text-red-500">낮음 (1종목)</td></tr>
<tr><td class="p-2 font-bold">최소 투자금</td><td class="p-2">1주부터 (보통 5천~5만원)</td><td class="p-2">1만원부터</td><td class="p-2">1주부터</td></tr>
</table>

<h2>🇰🇷 국내 추천 ETF</h2>
<ul>
<li><strong>KODEX 200:</strong> 코스피 200 대형주 추종. 한국 대표 기업에 분산 투자</li>
<li><strong>TIGER 코스닥150:</strong> 코스닥 성장주 위주. 변동성 높지만 성장성 있음</li>
<li><strong>KODEX 국채10년:</strong> 안전 자산. 금리 하락 시 수익</li>
<li><strong>TIGER 리츠부동산인프라:</strong> 부동산 임대 수익 ETF</li>
</ul>

<h2>🌍 해외 추천 ETF (미국 노출)</h2>
<ul>
<li><strong>TIGER 미국S&P500:</strong> 미국 대형주 500개 추종. 장기 투자 핵심 상품</li>
<li><strong>KODEX 미국나스닥100:</strong> 나스닥 기술주 100개 추종. 높은 성장성·변동성</li>
<li><strong>TIGER 미국채10년선물:</strong> 미국 채권 노출. 안전 자산 역할</li>
</ul>

<h2>💸 ETF 세금 완벽 정리</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">ETF 유형</th><th class="p-2">매매차익</th><th class="p-2">분배금(배당)</th></tr>
<tr class="border-b"><td class="p-2">국내 주식형 ETF</td><td class="p-2 text-green-600">비과세</td><td class="p-2">15.4% 과세</td></tr>
<tr class="border-b"><td class="p-2">국내 채권·혼합형 ETF</td><td class="p-2">15.4% 과세</td><td class="p-2">15.4% 과세</td></tr>
<tr><td class="p-2">해외 주식형 ETF (국내 상장)</td><td class="p-2">15.4% 과세</td><td class="p-2">15.4% 과세</td></tr>
</table>
<p class="mt-2 p-3 bg-primary/5 rounded-xl text-sm"><strong>절세 포인트:</strong> ISA 계좌 내에서 ETF에 투자하면 200~400만원까지 비과세, 초과분도 9.9% 분리과세! ISA를 최우선 활용하세요.</p>

<h2>📱 ETF 매수 방법 (단계별)</h2>
<ol>
<li><strong>증권 계좌 개설:</strong> 은행 앱(키움, 미래에셋, 삼성증권 등)에서 비대면 개설. 5분 완료</li>
<li><strong>ISA 계좌도 함께 개설:</strong> 절세를 위해 ISA 계좌에서 먼저 투자</li>
<li><strong>ETF 검색:</strong> 앱에서 'TIGER 미국S&P500' 검색 후 가격 확인</li>
<li><strong>매수:</strong> 원하는 수량 입력 후 시장가 또는 지정가 주문</li>
<li><strong>자동 적립 설정:</strong> 증권사 앱의 '자동매수' 기능으로 매월 정해진 날 자동 매수</li>
</ol>

<h2>📈 초보자를 위한 3:7 포트폴리오 추천</h2>
<ul>
<li><strong>70%:</strong> TIGER 미국S&P500 (안정적 성장)</li>
<li><strong>30%:</strong> KODEX 200 (국내 분산)</li>
</ul>
<p>매달 일정액을 이 비율로 자동 매수하면 '달러 평균법(DCA)'으로 가격 변동 리스크를 줄이면서 장기 수익을 추구할 수 있습니다.</p>
`
 },
 {
  slug: "four-major-insurance-complete",
  title: "4대 보험 완벽 가이드 — 직장인이 내는 건강·연금·고용·산재보험",
  description: "2026년 4대 보험(건강보험, 국민연금, 고용보험, 산재보험) 보험료율과 계산법, 회사·근로자 부담 비율, 퇴직 후 변화, 피부양자 조건까지 한 번에 이해.",
  category: "기초",
  tags: ["4대보험", "건강보험", "국민연금", "고용보험", "산재보험", "2026"],
  level: "초급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">직장인이라면 매달 급여에서 4대 보험이 빠져나갑니다. 2026년 기준 근로자 부담 총액은 월 급여의 약 <strong>9.4%</strong>입니다. 내가 정확히 얼마나, 왜 내는지 알아야 제대로 활용할 수 있습니다.</p>

<h2>📊 2026년 4대 보험 보험료율 한눈에 보기</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-4 border border-primary/10">
<table class="w-full text-sm border-collapse">
<tr class="bg-primary/10"><th class="p-2 text-left">보험 종류</th><th class="p-2 text-right">근로자 부담</th><th class="p-2 text-right">사용자 부담</th><th class="p-2 text-right">합계</th></tr>
<tr class="border-b"><td class="p-2">국민연금</td><td class="p-2 text-right font-bold">4.5%</td><td class="p-2 text-right">4.5%</td><td class="p-2 text-right">9%</td></tr>
<tr class="border-b"><td class="p-2">건강보험</td><td class="p-2 text-right font-bold">3.545%</td><td class="p-2 text-right">3.545%</td><td class="p-2 text-right">7.09%</td></tr>
<tr class="border-b"><td class="p-2">장기요양보험</td><td class="p-2 text-right font-bold">0.459%</td><td class="p-2 text-right">0.459%</td><td class="p-2 text-right">0.918%</td></tr>
<tr class="border-b"><td class="p-2">고용보험 (실업급여분)</td><td class="p-2 text-right font-bold">0.9%</td><td class="p-2 text-right">0.9%</td><td class="p-2 text-right">1.8%</td></tr>
<tr><td class="p-2">산재보험</td><td class="p-2 text-right font-bold text-green-600">0% (없음)</td><td class="p-2 text-right">업종별 다름</td><td class="p-2 text-right">업종별</td></tr>
</table>
<p class="mt-3 font-bold">근로자 총 부담: 약 9.4% (국민연금 4.5% + 건강·장기요양 약 4% + 고용보험 0.9%)</p>
</div>

<h2>💰 월급별 4대 보험 실제 공제액 예시</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">월급 (세전)</th><th class="p-2 text-right">국민연금</th><th class="p-2 text-right">건강·장기요양</th><th class="p-2 text-right">고용보험</th><th class="p-2 text-right">합계</th></tr>
<tr class="border-b"><td class="p-2">200만원</td><td class="p-2 text-right">9만원</td><td class="p-2 text-right">8.1만원</td><td class="p-2 text-right">1.8만원</td><td class="p-2 text-right font-bold">18.9만원</td></tr>
<tr class="border-b"><td class="p-2">300만원</td><td class="p-2 text-right">13.5만원</td><td class="p-2 text-right">12.2만원</td><td class="p-2 text-right">2.7만원</td><td class="p-2 text-right font-bold">28.4만원</td></tr>
<tr class="border-b"><td class="p-2">400만원</td><td class="p-2 text-right">18만원</td><td class="p-2 text-right">16.2만원</td><td class="p-2 text-right">3.6만원</td><td class="p-2 text-right font-bold">37.8만원</td></tr>
<tr><td class="p-2">500만원</td><td class="p-2 text-right">22.5만원</td><td class="p-2 text-right">20.3만원</td><td class="p-2 text-right">4.5만원</td><td class="p-2 text-right font-bold">47.3만원</td></tr>
</table>

<h2>🏥 건강보험 피부양자 자격 조건</h2>
<p>소득과 재산이 일정 기준 이하면 가족의 건강보험 피부양자로 등록해 보험료를 내지 않아도 됩니다.</p>
<ul>
<li><strong>소득 기준:</strong> 연간 합산소득 2,000만원 이하 (이자, 배당, 연금, 근로, 사업소득 포함)</li>
<li><strong>재산 기준:</strong> 재산세 과세표준 5억 4,000만원 이하</li>
<li><strong>자격 박탈 사유:</strong> 사업자 등록 후 사업소득 발생 시 즉시 탈락</li>
</ul>

<h2>📤 퇴직 후 4대 보험 변화</h2>
<ul>
<li><strong>건강보험:</strong> 직장 → 지역가입자 전환. 소득·재산·자동차에 보험료 부과. 가족 피부양자로 등록하면 면제.</li>
<li><strong>국민연금:</strong> 직장 → 지역가입자 전환. 소득 없으면 납부예외 신청 가능.</li>
<li><strong>고용보험:</strong> 퇴직 시 실업급여 신청 가능 (비자발적 퇴사 시).</li>
<li><strong>임의계속가입 (건강보험):</strong> 퇴직 후 최대 36개월간 직장가입자 수준 보험료로 유지 가능.</li>
</ul>

<h2>🔧 4대 보험 관련 주요 기관</h2>
<ul>
<li><strong>국민연금공단:</strong> 1355</li>
<li><strong>건강보험공단:</strong> 1577-1000</li>
<li><strong>근로복지공단 (고용·산재):</strong> 1588-0075</li>
<li><strong>4대 사회보험 정보연계센터:</strong> www.4insure.or.kr</li>
</ul>
`
 },
 {
  slug: "year-end-tax-deductions-guide",
  title: "연말정산 공제 항목 완전 정리 — 직장인이 반드시 챙겨야 할 공제 20가지",
  description: "2026년 연말정산에서 놓치면 안 되는 공제 항목 20가지를 한 번에 정리. 소득공제와 세액공제의 차이, 효과 높은 순서, 맞벌이 부부 전략까지 포함.",
  category: "세금",
  tags: ["연말정산", "소득공제", "세액공제", "IRP", "연금저축", "월세공제", "2026"],
  level: "중급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">연말정산은 '13월의 월급'이라고 하지만, 아는 만큼 돌려받습니다. 2026년 귀속 연말정산에서 반드시 챙겨야 할 핵심 공제 항목 20가지를 세액공제 효과가 큰 순서로 정리합니다.</p>

<h2>💡 소득공제 vs 세액공제 — 뭐가 더 유리한가요?</h2>
<div class="bg-secondary/30 p-4 rounded-xl mt-4">
<ul>
<li><strong>소득공제:</strong> 과세 소득 자체를 줄임. 세율 높을수록 효과 큼. (예: 신용카드, 인적공제)</li>
<li><strong>세액공제:</strong> 산출된 세금에서 직접 차감. 세율과 무관하게 정액 환급. (예: IRP, 의료비, 교육비)</li>
<li><strong>결론:</strong> 세액공제가 일반적으로 더 확실하고 예측 가능. 고소득자는 소득공제도 효과 큼.</li>
</ul>
</div>

<h2>🥇 TOP 5 — 세액공제 효과 최강</h2>
<ol>
<li><strong>IRP + 연금저축 (최대 148만원 환급):</strong> 연간 900만원 한도 납입 시 13.2~16.5% 세액공제. 총급여 5,500만원 이하라면 16.5% 적용으로 최대 148.5만원 환급.</li>
<li><strong>월세 세액공제 (최대 127만원 환급):</strong> 총급여 7,000만원 이하 무주택 세대주. 연 750만원 한도의 15~17%. 집주인 동의 불필요.</li>
<li><strong>의료비 세액공제:</strong> 총급여의 3% 초과분의 15%. 본인·부양가족 합산. 본인·장애인·65세 이상 의료비는 한도 없음.</li>
<li><strong>교육비 세액공제:</strong> 본인 교육비 15%(한도 없음), 자녀 교육비 15%(1인 한도 300만원), 미취학 아동 15%(1인 한도 300만원).</li>
<li><strong>기부금 세액공제:</strong> 법정·지정 기부금 15%(1,000만원 초과분 30%). 노동조합비 포함.</li>
</ol>

<h2>🥈 TOP 5 — 소득공제 효과 우수</h2>
<ol>
<li><strong>인적공제 (1인 150만원):</strong> 본인·배우자·자녀·부모(소득 요건 충족 시). 장애인·경로우대 추가공제 포함 시 1인 최대 500만원 이상.</li>
<li><strong>신용카드·체크카드:</strong> 총급여의 25% 초과분에 대해 신용카드 15%, 체크카드·현금영수증 30% 공제. 한도 300만원.</li>
<li><strong>주택청약종합저축:</strong> 총급여 7,000만원 이하 무주택자. 연 납입액의 40% (한도 300만원 → 공제액 최대 120만원).</li>
<li><strong>전세·주담대 이자상환액:</strong> 장기주택저당차입금 이자 공제. 요건 충족 시 최대 2,000만원까지 소득공제.</li>
<li><strong>개인연금저축 (구 연금):</strong> 2000년 이전 가입한 구 개인연금은 연 72만원 한도 소득공제.</li>
</ol>

<h2>📋 자주 놓치는 공제 항목 10가지</h2>
<ul>
<li>안경·콘택트렌즈 구입비 (1인 50만원 한도, 의료비 공제)</li>
<li>산후조리원 비용 (총급여 7,000만원 이하, 200만원 한도)</li>
<li>대중교통·전통시장·도서공연비 (각 100만원 추가 한도)</li>
<li>중소기업 청년 소득세 감면 신청 (5년간 90% 감면)</li>
<li>장애인 보장구 구입 비용 (의료비로 전액 공제 가능)</li>
<li>학자금 대출 원리금 상환액 (교육비 공제)</li>
<li>노인장기요양보험 관련 본인 부담금 (의료비 포함)</li>
<li>6세 이하 자녀 의료비 (한도 제한 없음)</li>
<li>실손보험 환급분 차감 (이중 공제 주의)</li>
<li>현금영수증 미발행 시 현금영수증 발급 요청권 행사</li>
</ul>

<h2>👫 맞벌이 부부 연말정산 전략</h2>
<ul>
<li><strong>인적공제:</strong> 연봉이 높은 배우자가 부양가족을 몰아 공제받으면 세율 구간 효과로 환급 극대화</li>
<li><strong>신용카드:</strong> 총급여 낮은 배우자 카드로 몰아쓰기 (25% 문턱을 먼저 돌파)</li>
<li><strong>의료비:</strong> 소득 낮은 배우자에게 몰아주면 3% 문턱을 더 쉽게 넘겨 공제 가능</li>
<li><strong>교육비:</strong> 자녀 교육비는 실제 지출한 배우자에게 공제 (임의 이동 불가)</li>
</ul>
`
 },
 {
  slug: "health-insurance-2026-guide",
  title: "2026 건강보험 완벽 가이드 — 보험료 계산부터 피부양자 조건까지",
  description: "2026년 건강보험료율, 지역가입자 vs 직장가입자 차이, 피부양자 조건, 임의계속가입, 본인부담상한제, 실비보험과의 차이까지 모두 정리.",
  category: "기초",
  tags: ["건강보험", "건강보험료", "피부양자", "지역가입자", "본인부담상한제", "2026"],
  level: "초급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">건강보험은 대한민국 국민이라면 누구나 가입해야 하는 의무 보험입니다. 2026년 건강보험료율은 7.09%이며, 직장가입자와 지역가입자의 계산 방식이 완전히 다릅니다. 나에게 유리한 가입 방식과 절세 방법을 알아보겠습니다.</p>

<h2>📊 직장가입자 vs 지역가입자 보험료 차이</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">구분</th><th class="p-2">직장가입자</th><th class="p-2">지역가입자</th></tr>
<tr class="border-b"><td class="p-2 font-bold">부과 기준</td><td class="p-2">보수월액(급여)</td><td class="p-2">소득+재산+자동차</td></tr>
<tr class="border-b"><td class="p-2 font-bold">보험료율</td><td class="p-2">7.09% (절반 회사 부담)</td><td class="p-2">소득 7.09% + 재산점수</td></tr>
<tr class="border-b"><td class="p-2 font-bold">실부담률</td><td class="p-2">약 3.545% (+ 장기요양)</td><td class="p-2">전액 본인 부담</td></tr>
<tr><td class="p-2 font-bold">유리한 경우</td><td class="p-2">고소득 직장인</td><td class="p-2">소득·재산이 낮은 경우</td></tr>
</table>

<h2>👨‍👩‍👧 피부양자 등록 조건</h2>
<p>직장가입자의 가족은 일정 조건을 충족하면 피부양자로 등록하여 보험료를 내지 않아도 됩니다.</p>
<div class="bg-secondary/30 p-4 rounded-xl mt-4">
<h3 class="font-bold mb-2">소득 요건</h3>
<ul>
<li>연간 합산소득 2,000만원 이하</li>
<li>이자소득, 배당소득, 사업소득, 근로소득, 연금소득, 기타소득 모두 합산</li>
<li>사업자 등록이 있으면 사업소득 1원이라도 발생 시 탈락</li>
</ul>
<h3 class="font-bold mt-4 mb-2">재산 요건</h3>
<ul>
<li>재산세 과세표준 5억 4,000만원 이하</li>
<li>단, 재산이 1억 8,000만원 초과 시 연소득 1,000만원 이하여야 함</li>
</ul>
</div>

<h2>🔄 임의계속가입 — 퇴직 후 보험료 아끼는 방법</h2>
<p>퇴직 후 지역가입자로 전환되면 보험료가 크게 오를 수 있습니다. 임의계속가입으로 최대 36개월간 직장가입자 수준의 보험료를 유지할 수 있습니다.</p>
<ul>
<li><strong>신청 기한:</strong> 퇴직일로부터 2개월 이내 건강보험공단에 신청</li>
<li><strong>유지 기간:</strong> 최대 36개월</li>
<li><strong>보험료:</strong> 퇴직 전 보수월액 기준 보험료 (회사 부담분까지 본인 납부)</li>
<li><strong>효과:</strong> 고소득자였다면 보험료가 오히려 낮아질 수 있음</li>
</ul>

<h2>💊 본인부담상한제 — 의료비 많이 쓰면 돌려받는다</h2>
<p>연간 의료비 본인 부담이 소득 수준별 상한액을 초과하면 초과분을 환급받습니다.</p>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2">소득 분위</th><th class="p-2 text-right">연간 상한액</th></tr>
<tr class="border-b"><td class="p-2">1분위 (최저소득)</td><td class="p-2 text-right font-bold">약 83만원</td></tr>
<tr class="border-b"><td class="p-2">2~3분위</td><td class="p-2 text-right font-bold">약 103만원</td></tr>
<tr class="border-b"><td class="p-2">4~5분위</td><td class="p-2 text-right font-bold">약 153만원</td></tr>
<tr class="border-b"><td class="p-2">6~7분위</td><td class="p-2 text-right font-bold">약 289만원</td></tr>
<tr class="border-b"><td class="p-2">8분위</td><td class="p-2 text-right font-bold">약 360만원</td></tr>
<tr class="border-b"><td class="p-2">9분위</td><td class="p-2 text-right font-bold">약 443만원</td></tr>
<tr><td class="p-2">10분위 (최고소득)</td><td class="p-2 text-right font-bold">약 780만원</td></tr>
</table>
<p class="text-sm text-muted-foreground mt-2">※ 공단이 자동 계산해 익년도 8월경 환급. 별도 신청 불필요.</p>

<h2>📞 건강보험 관련 민원 기관</h2>
<ul>
<li><strong>국민건강보험공단:</strong> 1577-1000</li>
<li><strong>건강보험 EDI:</strong> edi.nhis.or.kr</li>
<li><strong>The건강보험 앱:</strong> 보험료 조회, 피부양자 등록, 건강검진 예약</li>
</ul>
`
 },
 {
  slug: "retirement-planning",
  title: "2026 노후 준비 완벽 가이드 — 국민연금부터 퇴직연금·개인연금까지 3층 전략",
  description: "2026년 기준 노후 준비를 위한 3층 연금 구조 완벽 가이드. 국민연금 예상 수령액, 퇴직연금 DC·DB 비교, IRP·연금저축 절세 전략까지 실전 로드맵 제공.",
  category: "투자",
  tags: ["노후준비", "연금", "퇴직연금", "IRP", "연금저축", "국민연금", "FIRE"],
  level: "중급" as const,
  publishedDate: "2026-05-16",
  views: 0,
  content: `
<p class="lead">노후 준비는 이르게 시작할수록 유리합니다. 대한민국의 노후 보장은 <strong>3층 연금 구조</strong>(국민연금 + 퇴직연금 + 개인연금)로 이루어집니다. 각 층의 역할과 최대화 전략을 알면 은퇴 후 월 수입이 크게 달라집니다.</p>

<h2>🏗️ 3층 연금 구조</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-4 border border-primary/10">
<table class="w-full text-sm border-collapse">
<tr class="bg-primary/10"><th class="p-2 text-left">층</th><th class="p-2">구분</th><th class="p-2">특징</th><th class="p-2 text-right">예상 월 수령액</th></tr>
<tr class="border-b"><td class="p-2 font-bold text-blue-600">1층</td><td class="p-2">국민연금</td><td class="p-2">의무 가입, 국가 보장</td><td class="p-2 text-right">70~120만원</td></tr>
<tr class="border-b"><td class="p-2 font-bold text-green-600">2층</td><td class="p-2">퇴직연금 (DC/DB)</td><td class="p-2">회사 의무 제공</td><td class="p-2 text-right">30~80만원</td></tr>
<tr><td class="p-2 font-bold text-orange-600">3층</td><td class="p-2">개인연금 (IRP/연금저축)</td><td class="p-2">자발적, 세액공제 혜택</td><td class="p-2 text-right">30~100만원+</td></tr>
</table>
<p class="mt-3 font-bold text-primary">목표: 3층 합산 월 200~300만원 이상 확보</p>
</div>

<h2>🏦 퇴직연금 DC형 vs DB형 — 어떤 게 유리한가요?</h2>
<table class="w-full text-sm border-collapse mt-4">
<tr class="bg-primary/10"><th class="p-2 text-left">구분</th><th class="p-2">DB형 (확정급여형)</th><th class="p-2">DC형 (확정기여형)</th></tr>
<tr class="border-b"><td class="p-2 font-bold">운용 주체</td><td class="p-2">회사</td><td class="p-2">근로자 본인</td></tr>
<tr class="border-b"><td class="p-2 font-bold">수령액 기준</td><td class="p-2">퇴직 전 3개월 평균임금 × 근속 연수</td><td class="p-2">납입 원금 + 운용 수익</td></tr>
<tr class="border-b"><td class="p-2 font-bold">투자 위험</td><td class="p-2 text-green-600">회사 부담</td><td class="p-2 text-orange-600">근로자 부담</td></tr>
<tr class="border-b"><td class="p-2 font-bold">유리한 경우</td><td class="p-2">임금 상승률 높음, 장기 근속 예정</td><td class="p-2">이직 잦음, 투자 역량 있음</td></tr>
<tr><td class="p-2 font-bold">IRP 추가 납입</td><td class="p-2">가능 (세액공제)</td><td class="p-2">가능 (세액공제)</td></tr>
</table>

<h2>💰 IRP + 연금저축 — 최대 세액공제 전략</h2>
<ul>
<li><strong>연금저축 (펀드/보험):</strong> 연 600만원 한도, 13.2~16.5% 세액공제 → 최대 99만원 환급</li>
<li><strong>IRP (개인형 퇴직연금):</strong> 연금저축과 합산 900만원 한도 → 최대 148.5만원 환급</li>
<li><strong>합산 한도:</strong> IRP 단독으로 900만원 가능. 연금저축과 합산 시 연금저축 최대 600만원 + IRP 300만원</li>
</ul>
<div class="bg-primary/5 p-4 rounded-xl mt-4">
<strong>절세 황금 루트:</strong><br/>
ISA 3년 납입 → 만기 수령액을 IRP·연금저축으로 이전 → 이전 금액의 10% (최대 300만원) 추가 세액공제<br/>
이 루트를 활용하면 연간 최대 세액공제 합산 가능
</div>

<h2>📈 30대부터 시작하는 노후 준비 로드맵</h2>
<ol>
<li><strong>30대 초반:</strong> 비상금 확보(생활비 6개월) + 퇴직연금 DC 운용 시작 (ETF 위주) + IRP/연금저축 소액 시작</li>
<li><strong>30대 후반:</strong> IRP/연금저축 납입 늘리기 + ISA 병행 운용 + 국민연금 예상액 조회</li>
<li><strong>40대:</strong> IRP/연금저축 900만원 풀 납입 + 주택 자산 관리 + FIRE 시뮬레이션 해보기</li>
<li><strong>50대:</strong> 임의계속가입 국민연금 고려 + 연기 수령 전략 검토 + 은퇴 후 지출 계획 세밀화</li>
</ol>

<h2>🔢 은퇴 후 얼마가 필요한가? — 4% 룰 적용</h2>
<ul>
<li>목표 월 생활비 200만원 → 연 2,400만원 → 필요 자산: 2,400만원 × 25 = <strong>6억원</strong></li>
<li>목표 월 생활비 300만원 → 연 3,600만원 → 필요 자산: 3,600만원 × 25 = <strong>9억원</strong></li>
<li>국민연금 월 70만원 수령 가정 → 추가 필요 자산: (300-70)만원 × 12 × 25 = <strong>6.9억원</strong></li>
</ul>
<p class="mt-4 text-sm text-muted-foreground">※ 4% 룰은 포트폴리오에서 연 4%씩 인출해도 30년 이상 자산이 유지된다는 연구 결과 기반입니다.</p>
`
 },
];
