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
<p class="lead">혼인했다고 모든 세금의 공제 한도가 두 배가 되지는 않습니다. 부부 각자의 소득, 자산 명의와 지분, 실제 지출자를 나누어 확인해야 합니다.</p>
<h2>부부 자산·공제를 비교하는 다섯 가지 질문</h2>
<ol><li><strong>주식은 누가 소유하고 매도했나요?</strong> 국내 상장 장내 소액주주와 국외주식의 과세는 다릅니다. 상대 배우자의 사용하지 않은 공제를 자신의 매도에 합산할 수 있다고 가정하지 마세요.</li><li><strong>명의를 바꾸나요?</strong> 배우자 증여는 기존 10년간 증여 내역, 재산 평가와 이후 처분 과세를 함께 확인해야 합니다. 공동명의 전환 자체의 비용도 별개입니다.</li><li><strong>주택 지분은 얼마인가요?</strong> 개인 주택분 종부세는 인별 9억원 공제가 기본이며 해당하는 1세대 1주택자는 12억원입니다. 50:50 공동명의의 지분별 공제와 1주택자 특례는 고령·장기보유 공제까지 비교해야 합니다.</li><li><strong>부양가족 소득 요건을 충족하나요?</strong> 같은 가족을 부부가 중복 공제할 수 없습니다. 배우자 본인의 소득과 실제 부양 관계를 확인합니다.</li><li><strong>누가 지출했나요?</strong> 신용카드·의료비·교육비는 각각 소득·연령·지출자 조건이 다릅니다. 맞벌이 배우자의 지출을 한쪽에 자유롭게 합산할 수 있는 것은 아닙니다.</li></ol>
<h2>같은 가격의 집도 결과가 달라지는 이유</h2>
<p>공시가격 18억원인 주택 한 채를 부부가 50:50으로 소유하고 각자의 다른 주택이 없다면, 지분별 9억원에서 일반 공제 9억원을 빼는 구조를 먼저 비교합니다. 단독명의의 12억원 공제와 결과가 다르며, 취득·증여·처분세까지 포함해 항상 공동명의가 유리하다는 뜻은 아닙니다.</p>
<p>근거: <a href="https://i.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7735&amp;mi=2353">국세청 종합부동산세 흐름도</a> · <a href="https://www.nts.go.kr/nts/na/ntt/selectNttInfo.do?mi=&amp;nttSn=1348384">국세청 주식 과세 대상 안내</a>.</p>
<p><a href="/guides/one-home-prop-tax-12eok-2026">주택 공제와 과세표준 예시</a> · <a href="/guides/marriage-tax-benefits-2026">혼인 세액공제 조건</a> · <a href="/calc/child-deduction">자녀공제액 확인</a></p>
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
<li>· 청년주택드림(신규): 최대 금리 4.5% + 소득공제 40% × 연 300만원(최대 120만원, 이자 비과세는 연 600만원 납입분) + 최대 3억원(신혼 4억원) 대출 자격</li>
</ul>
<p>청년우대형 기존 가입자는 청년주택드림으로 전환 신청 가능. 더 큰 혜택을 위해 전환 권장.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 청년주택드림 5년 누적 효과</h2>
<ul class="space-y-2 mt-4">
<li>· 월 50만원 × 60개월 = 3,000만원</li>
<li>· 4.5% 이자: 약 350만원</li>
<li>· 소득공제 환급: 약 144만원 (연 120만원 공제 × 한계세율 24%, 5년 누적)</li>
<li>· 청년주택드림 대출 자격: 최대 3억원·신혼 4억원 (1년 + 1,000만원 납입 시)</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/calc/housing-subscription" class="text-primary underline">청약 시뮬레이터</a></li></ul></div>
`;

const newlywedDeduction = `
<p class="lead">2026년에 혼인신고를 했다면 첫 연말정산에서 <strong>부부가 각자 혼인 세액공제 50만원</strong>을 받을 수 있습니다(1인당 생애 1회, 2026년 12월 31일 이전 혼인신고분까지). 배우자의 연간 소득금액이 100만원(근로소득만 있으면 총급여 500만원) 이하라면 <strong>배우자 기본공제 150만원</strong>, 60세 이상인 양가 부모가 소득 요건을 채우면 <strong>한 명당 150만원 기본공제</strong>도 더해집니다. 배우자·부양가족 여부는 12월 31일 현재 상황으로 판정합니다. 기준일은 2026년 9월 26일이며 2026년 귀속(2027년 1~2월 연말정산) 기준입니다.</p>

<h2>신혼 첫해 체크리스트</h2>
<table class="w-full text-sm">
<thead>
<tr><th>항목</th><th>요건</th><th>금액</th><th>근거</th></tr>
</thead>
<tbody>
<tr><td>혼인 세액공제</td><td>2024~2026년에 혼인신고, 1인당 생애 1회, 혼인신고한 해에 적용</td><td>50만원(세액공제)</td><td>조세특례제한법 제92조</td></tr>
<tr><td>배우자 기본공제</td><td>배우자 소득금액 100만원 이하(근로소득만 있으면 총급여 500만원 이하)</td><td>150만원(소득공제)</td><td>소득세법 제50조</td></tr>
<tr><td>양가 부모 기본공제</td><td>60세 이상, 소득금액 100만원 이하, 주거 형편상 따로 살아도 인정</td><td>1명당 150만원, 70세 이상이면 경로우대 100만원 추가</td><td>소득세법 제50조·제51조·제53조</td></tr>
<tr><td>월세 세액공제</td><td>무주택 세대주, 총급여 8,000만원 이하</td><td>월세의 15%(총급여 5,500만원 이하 17%), 연 1,000만원 한도</td><td>조세특례제한법 제95조의2</td></tr>
<tr><td>청약통장 소득공제</td><td>무주택 세대의 세대주 또는 배우자, 총급여 7,000만원 이하</td><td>연 300만원 한도 납입액의 40%</td><td>조세특례제한법 제87조</td></tr>
<tr><td>출산·입양 세액공제</td><td>그해 출산하거나 입양 신고한 공제대상 자녀</td><td>첫째 30만원, 둘째 50만원, 셋째 이상 70만원</td><td>소득세법 제59조의2</td></tr>
<tr><td>산후조리원 비용</td><td>의료비 세액공제에 포함, 총급여 요건 없음</td><td>출산 1회당 200만원 한도 × 15%</td><td>소득세법 시행령 제118조의5</td></tr>
</tbody>
</table>
<p>배우자와 양가 부모의 공제 여부는 모두 과세기간 종료일인 12월 31일 상황으로 판단합니다. 12월에 혼인신고를 했더라도 그해 배우자 기본공제를 받을 수 있고, 반대로 부모님을 이미 다른 형제가 기본공제로 올리고 있다면 같은 해에 중복으로 올릴 수 없습니다.</p>

<h2>외벌이 신혼부부 계산 예시</h2>
<p>총급여 5,000만원인 근로자가 2026년에 혼인신고를 했고 배우자는 소득이 없다고 가정했습니다. 이 사이트 <a href="/year-end-tax">연말정산 계산기</a>와 같은 엔진으로 결정세액(소득세)을 계산했습니다. 계산기에는 혼인 세액공제 입력란이 없어 50만원은 결정세액에서 직접 뺐습니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>단계</th><th>결정세액</th><th>줄어든 세금</th></tr>
</thead>
<tbody>
<tr><td>본인만 공제(혼인 전과 같은 조건)</td><td>2,788,696원</td><td>—</td></tr>
<tr><td>배우자 기본공제 150만원 추가</td><td>2,563,696원</td><td>225,000원</td></tr>
<tr><td>혼인 세액공제 50만원 추가</td><td>2,063,696원</td><td>500,000원</td></tr>
<tr><td>장인·장모(60세 이상, 소득 요건 충족) 2명 추가 시</td><td>1,613,696원</td><td>450,000원</td></tr>
</tbody>
</table>
<p>배우자 기본공제와 혼인 세액공제만으로 소득세가 72만 5,000원, 지방소득세까지 합치면 79만 7,500원 줄어듭니다. 부모님 공제는 소득공제라 적용 세율(이 예시에서는 15%)만큼 줄고, 혼인 세액공제는 세액공제라 세율과 관계없이 50만원이 그대로 빠집니다. 다만 세액공제는 결정세액을 0원 아래로 만들지 못하므로 원래 낼 세금이 50만원보다 적으면 그만큼만 공제됩니다.</p>

<h2>맞벌이 신혼부부라면</h2>
<ul>
<li><strong>혼인 세액공제는 각자</strong>: 혼인신고를 한 거주자마다 50만원이므로 부부가 모두 근로소득이 있으면 합쳐서 최대 100만원입니다. 같은 엔진으로 총급여 3,500만원·4,000만원 맞벌이 부부를 계산하면 두 사람 모두 결정세액이 50만원보다 커서 각자 50만원을 온전히 받습니다.</li>
<li><strong>배우자 기본공제는 불가</strong>: 두 사람 모두 총급여가 500만원을 넘으면 서로를 기본공제로 올릴 수 없습니다.</li>
<li><strong>신용카드는 각자 명의만</strong>: 맞벌이는 각자 쓴 금액을 각자 공제받습니다. 외벌이라도 배우자가 혼인 전에 쓴 카드 금액은 공제 대상이 아니고, 혼인일 이후 사용분만 소득 요건을 채운 경우에 합산할 수 있습니다.</li>
<li><strong>양가 부모는 한 사람에게</strong>: 장인·장모나 시부모를 부부 중 누구의 부양가족으로 올릴지는 선택할 수 있지만 중복은 안 됩니다. 소득공제라서 대체로 적용 세율이 높은 쪽이 유리하고, 부모님 의료비를 누가 낼지도 함께 정해야 합니다. 자세한 기준은 <a href="/guides/couple-split-bonus-year-2026">맞벌이 몰아주기 가이드</a>에 있습니다.</li>
</ul>

<h2>신혼집 공제 — 월세·청약·전세대출</h2>
<ul>
<li><strong>월세 세액공제</strong>: 무주택 세대주가 총급여 8,000만원 이하(종합소득금액 7,000만원 초과자 제외)이면 월세의 15%, 총급여 5,500만원 이하(종합소득금액 4,500만원 초과자 제외)이면 17%를 연 1,000만원 한도로 공제합니다. 2026년부터는 주소를 달리하는 등 요건을 갖춘 배우자도 추가로 공제받을 수 있고, 이때 부부 월세 합계 한도는 1,000만원입니다. 계산은 <a href="/rent-tax-credit-2026">월세 세액공제 계산기</a>에서 할 수 있습니다.</li>
<li><strong>청약통장 소득공제</strong>: 세대주의 배우자도 2025년 납입분부터 본인 명의 통장으로 공제받습니다. 조세특례제한법 제87조에는 월세 공제(부부 합계 1,000만원)와 달리 부부 합산 한도가 없어, 두 사람이 각각 총급여 7,000만원 이하 등 요건을 채우면 각자 본인 통장 납입액을 연 300만원 한도로 공제받는 구조입니다. 요건과 실제 절감액은 <a href="/guides/housing-subscription-25man-deduction-2026">청약통장 소득공제 가이드</a>에 정리했습니다.</li>
<li><strong>전세자금대출 원리금</strong>: 무주택 세대주가 요건을 갖춘 주택임차자금 대출의 원리금을 갚으면 상환액의 40%를 소득공제하며, 청약통장 공제와 합쳐 연 400만원이 한도입니다.</li>
</ul>
<p>한 세대 안에서 세대주가 청약·주택자금·월세 공제 중 하나라도 받으면 세대원은 월세 세액공제를 받을 수 없으므로, 신혼집 계약 명의와 세대주를 누구로 할지 정할 때 공제 순서도 함께 따져 보세요.</p>

<h2>출산·산후조리 그리고 연말정산이 아닌 것</h2>
<ul>
<li><strong>출산·입양 세액공제</strong>: 그해 출산하거나 입양 신고한 자녀가 첫째면 30만원, 둘째 50만원, 셋째 이상 70만원을 공제합니다. 매년 받는 자녀세액공제와는 별개입니다.</li>
<li><strong>산후조리원</strong>: 출산 1회당 200만원까지 의료비에 넣어 15%를 공제하므로 최대 30만원입니다. 총급여 요건은 없고, 다른 의료비와 합쳐 총급여 3% 문턱을 넘는 부분부터 공제됩니다.</li>
<li><strong>주택 취득세 감면은 별개</strong>: 생애최초 주택 취득세 감면 같은 제도는 지방세라 연말정산 항목이 아닙니다. 연말정산 환급액에 섞어 계산하지 마세요.</li>
<li><strong>결혼식·신혼여행 비용</strong>: 예식장처럼 국내에서 결제한 금액은 따로 공제되는 항목이 아니라 신용카드 등 사용액에 포함될 뿐이며, 총급여 25%를 넘는 부분부터 공제됩니다. 신혼여행지에서 카드로 결제한 해외 사용액은 국외 사용분이라 신용카드 등 사용액에서 아예 빠집니다.</li>
</ul>
<p>연말정산 전체 일정은 <a href="/year-end-tax-2027">연말정산 2027 총정리</a>, 부모님 공제 요건은 <a href="/calc/dependent-check">부양가족 공제 판정기</a>에서 확인할 수 있습니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 2025년에 혼인신고를 했는데 2026년 귀속 연말정산(2027년 1월)에서 받을 수 있나요?</strong> — 받을 수 없습니다. 혼인 세액공제는 혼인신고를 한 날이 속하는 과세기간에만 적용되므로, 2025년 혼인신고라면 2025년 귀속 연말정산(2026년 1~2월)에서 받는 것입니다. 그때 놓쳤다면 경정청구로 바로잡을 수 있습니다.</li>
<li><strong>Q. 재혼이어도 혼인 세액공제를 받나요?</strong> — 조문은 초혼과 재혼을 나누지 않고 1인당 1회로 제한합니다. 2024년 이후 이미 한 번 받았다면 다시 받을 수 없습니다.</li>
<li><strong>Q. 12월에 혼인신고를 해도 배우자 기본공제가 되나요?</strong> — 됩니다. 배우자 해당 여부는 12월 31일 현재 상황으로 판정하므로, 배우자 소득 요건만 채우면 그해 150만원 기본공제를 받습니다.</li>
<li><strong>Q. 결혼 전에 배우자가 쓴 카드 금액도 합칠 수 있나요?</strong> — 합칠 수 없습니다. 국세청 안내에 따르면 혼인일 이후 사용한 금액만 대상이고, 그마저도 배우자 소득 요건을 채운 경우에 한합니다.</li>
</ul>

<p>근거: <a href="https://www.law.go.kr/법령/조세특례제한법/제92조" target="_blank" rel="noopener noreferrer">조세특례제한법 제92조(혼인 세액공제)</a> · <a href="https://www.law.go.kr/법령/소득세법/제50조" target="_blank" rel="noopener noreferrer">소득세법 제50조(기본공제)</a> · <a href="https://www.law.go.kr/법령/소득세법/제53조" target="_blank" rel="noopener noreferrer">소득세법 제53조(판정 시기)</a> · <a href="https://www.law.go.kr/법령/조세특례제한법/제95조의2" target="_blank" rel="noopener noreferrer">조세특례제한법 제95조의2(월세 세액공제)</a> · <a href="https://www.law.go.kr/법령/조세특례제한법/제87조" target="_blank" rel="noopener noreferrer">조세특례제한법 제87조(청약저축 소득공제)</a> · <a href="https://www.law.go.kr/법령/조세특례제한법/제126조의2" target="_blank" rel="noopener noreferrer">조세특례제한법 제126조의2(신용카드 등 소득공제, 국외 사용분 제외)</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6596&amp;cntntsId=7875" target="_blank" rel="noopener noreferrer">국세청 근로소득 세액공제 안내(혼인세액공제)</a> · <a href="https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=1318&amp;ctgId=CTG11898" target="_blank" rel="noopener noreferrer">국세상담센터 신용카드 Q&amp;A</a>. 기준일 2026-09-26 — 법령은 소득세법 2026년 1월 1일 시행본, 조세특례제한법 2026년 9월 18일 시행본 기준이며, 계산 예시는 이 사이트 연말정산 엔진 값입니다.</p>
`;

const newlywedChildBirthBenefit = `
<p class="lead">자녀 출산 시 받는 세제·정부 지원: 출산휴가 + 6+6 육아휴직 정부지원금 합산 약 3,200만원, 자녀세액공제 연 25~40만원 + 출산·입양 세액공제(일회성) 30~70만원, 산후조리원 의료비 공제 200만원, 자녀장려금 최대 80만원.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">👶 자녀 1명 출산 시 합산 혜택</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>출산휴가 90일</strong> (산모): 통상임금 100%</li>
<li>· <strong>6+6 육아휴직</strong>: 부부 합산 최대 24개월, 약 3,200만원 정부지원</li>
<li>· <strong>자녀세액공제 (매년)</strong>: 첫째 25만원·둘째 30만원·셋째+ 40만원/년 (8세 이상 자녀)</li>
<li>· <strong>출산·입양 세액공제 (일회성)</strong>: 첫째 30만원·둘째 50만원·셋째+ 70만원 (출산·입양한 해 1회)</li>
<li>· <strong>산후조리원 의료비 공제</strong>: 200만원 한도</li>
<li>· <strong>자녀장려금</strong>: 가구당 최대 80만원 (소득·자녀수 조건)</li>
<li>· <strong>출산축하금</strong>: 지자체별 50~500만원</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/parental-leave" class="text-primary underline">육아휴직 급여 계산기</a></li></ul></div>
`;

const youthAccountCombination = `
<p class="lead">청년이 가장 큰 절세·혜택을 얻으려면 청년도약계좌 + 청년주택드림 청약통장 + 청년형 장기집합투자증권저축 3가지를 동시 가입(도약계좌·장기투자는 2025-12-31 신규 가입 종료 — 2026년 6월 출시 청년미래적금 참고). 기존 가입자 기준 5년 누적 약 640만원+ 혜택.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 청년 3종 조합 5년 혜택</h2>
<ul class="space-y-3 mt-4">
<li><strong>① 청년도약계좌</strong>(2025-12-31 신규 가입 종료, 기존 가입자): 정부기여금 144만원 + 비과세 99만원 = <strong>243만원</strong></li>
<li><strong>② 청년주택드림</strong>: 우대금리 250만원 + 소득공제 환급 약 144만원(연 300만원 한도 40%) = <strong>약 394만원</strong></li>
<li><strong>③ 청년형 장기집합투자</strong>: 가입 기한 2025-12-31 종료(2024 세법개정으로 1년 연장 후 일몰) — 기존 가입자만 연 납입 600만원 한도 40% 소득공제(최대 240만원), 운용수익 비과세 아님</li>
<li><strong>합산 5년 혜택: 기존 가입자 기준 ①+② 약 637만원 + ③ 소득공제 환급(한계세율 24%면 연 최대 약 58만원)</strong></li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 동시 가입 자격</h2>
<ul class="space-y-2 mt-4">
<li>· 청년도약: 만 19~34세, 연 7,500만원 이하</li>
<li>· 청년주택드림: 만 19~34세, 무주택 본인, 연 5,000만원 이하</li>
<li>· 청년형 장기투자: 만 19~34세, 총급여 5,000만원 이하</li>
<li>· 2026년 신규 가입은 청년주택드림만 가능 — 도약계좌·장기투자는 2025-12-31 신규 가입 종료</li>
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
<p class="lead">신혼부부 주택 공동명의 vs 단독명의 — 종부세·양도세·증여세 모두 다르게 적용. 종부세 공제는 단독 1주택 12억, 공동명의 인별 9억씩 18억이라 공시가 12억 초과부터 공동명의가 유리해지기 쉽습니다(단독은 세액공제 비교).</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 1주택 시 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">공시가 (종부세, 재산세 공제 전)</th><th class="p-3">단독명의</th><th class="p-3">공동명의(50:50)</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">10억</td><td class="p-3 text-emerald-600">0원</td><td class="p-3">0원(각 9억 공제)</td></tr>
<tr class="border-t"><td class="p-3">14억</td><td class="p-3">약 60만원</td><td class="p-3">0원(각 7억 &lt; 9억)</td></tr>
<tr class="border-t"><td class="p-3">18억</td><td class="p-3">약 192만원</td><td class="p-3">0원(각 9억 = 18억 공제)</td></tr>
<tr class="border-t"><td class="p-3">24억</td><td class="p-3">약 480만원</td><td class="p-3">약 180만원(각 12억 − 9억)</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 결정 기준</h2>
<ul class="space-y-2 mt-4">
<li>· 공시가 12억 이하: <strong>단독·공동 모두 종부세 0원</strong></li>
<li>· 12~18억: <strong>공동명의 유리</strong> (각 9억 = 18억 공제 → 0원)</li>
<li>· 18억+: <strong>공동명의가 대체로 유리</strong> — 단 단독 1세대1주택은 고령자·장기보유 세액공제(최대 80%) 비교</li>
<li>· 공동명의 1주택 특례: 9월 16~30일 신청하면 1세대1주택자(12억 공제·세액공제)로 계산 가능 — 유리한 쪽 선택</li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련 도구</p><ul class="space-y-1 text-sm"><li>· <a href="/property-holding-tax-2026" class="text-primary underline">부동산 보유세 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 B — 부동산 심화 (10편)
// ═══════════════════════════════════════════════════════════════

const gangnamVsGangbuk = `
<p class="lead">강남 1주택(공시가 20억) vs 강북 2주택(공시가 합산 16억) 연 보유세 비교. 1세대1주택 12억 공제 덕분에 강남 약 632만원 vs 강북 약 544만원으로 차이는 약 88만원입니다(도시지역분·세액공제 반영 전).</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 연 보유세 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">시나리오</th><th class="p-3">재산세</th><th class="p-3">종부세</th><th class="p-3">합계</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">강남 1주택 20억</td><td class="p-3">약 356만원(교육세 포함)</td><td class="p-3">약 276만원(12억 공제)</td><td class="p-3"><strong>약 632만원</strong></td></tr>
<tr class="border-t"><td class="p-3">강북 2주택 합 16억(각 8억)</td><td class="p-3">약 310만원(2채·교육세 포함)</td><td class="p-3">약 234만원(인별 9억 공제)</td><td class="p-3"><strong>약 544만원</strong></td></tr>
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
<li>· <strong>1주택자 + 기준시가 12억 이하</strong>: 월세 금액과 무관하게 비과세 (신고 면제)</li>
<li>· <strong>2주택 이상 + 임대료 발생</strong>: 신고 의무 (금액 무관)</li>
<li>· <strong>1주택 + 기준시가 12억 초과 임대</strong>: 신고 의무</li>
<li>· <strong>국외 소재 주택 임대</strong>: 1주택이라도 신고 의무</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 미신고 시 가산세</h2>
<ul class="space-y-2 mt-4">
<li>· 무신고: 20% (단순 누락 10%)</li>
<li>· 납부지연가산세: 일 0.022%(연 약 8.03%)</li>
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
<p class="lead">근로소득공제는 총급여에서 자동으로 빼 주는 금액으로 <strong>총급여 5,000만원이면 1,225만원, 1억원이면 1,475만원</strong>이고 한도는 2,000만원입니다. 근로소득세액공제는 계산된 세금(산출세액)에서 빼 주는 금액으로 산출세액 130만원까지는 55%, 그 초과분은 30%를 공제하되 <strong>총급여에 따라 한도가 74만원에서 20만원까지</strong> 내려갑니다. 두 공제 모두 따로 신청하지 않아도 연말정산에 자동으로 들어갑니다. 기준일은 2026년 9월 26일이며 2026년 귀속(2027년 1~2월 연말정산) 기준입니다.</p>

<h2>근로소득공제 구간표</h2>
<p>근로소득공제는 소득세법 제47조에 따라 총급여가 커질수록 공제율이 낮아지는 누적식 구간표로 계산합니다. 구간이 바뀌어도 앞 구간의 공제액을 그대로 더해 가기 때문에, 총급여가 경계를 넘는다고 공제액이 갑자기 줄지는 않습니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>총급여 구간</th><th>근로소득공제 산식</th><th>구간 끝에서의 공제액</th></tr>
</thead>
<tbody>
<tr><td>500만원 이하</td><td>총급여 × 70%</td><td>350만원</td></tr>
<tr><td>500만원 초과 ~ 1,500만원 이하</td><td>350만원 + 500만원 초과분 × 40%</td><td>750만원</td></tr>
<tr><td>1,500만원 초과 ~ 4,500만원 이하</td><td>750만원 + 1,500만원 초과분 × 15%</td><td>1,200만원</td></tr>
<tr><td>4,500만원 초과 ~ 1억원 이하</td><td>1,200만원 + 4,500만원 초과분 × 5%</td><td>1,475만원</td></tr>
<tr><td>1억원 초과</td><td>1,475만원 + 1억원 초과분 × 2%</td><td>한도 2,000만원(총급여 3억 6,250만원부터)</td></tr>
</tbody>
</table>
<p>국세청 안내의 사례로 확인하면, 총급여 3,380만원의 근로소득공제는 750만원 + (3,380만원 − 1,500만원) × 15% = 1,032만원이고 근로소득금액은 2,348만원입니다. 여기서 <strong>총급여는 연봉 전체가 아니라 비과세 소득을 뺀 금액</strong>입니다. 같은 총급여가 신용카드 공제의 최저사용금액(25%), 의료비 세액공제 문턱(3%), 월세 세액공제 요건, 연금계좌 세액공제율, 부양가족 소득 요건 판단에도 쓰이므로 원천징수영수증의 총급여 칸부터 확인하는 습관이 좋습니다.</p>

<h2>근로소득세액공제 — 55%·30%와 총급여별 한도</h2>
<p>근로소득세액공제(소득세법 제59조)는 두 단계로 계산합니다. 먼저 산출세액에 비율을 곱해 공제액을 구하고, 그다음 총급여별 한도와 비교해 작은 쪽을 씁니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>산출세액</th><th>공제액</th></tr>
</thead>
<tbody>
<tr><td>130만원 이하</td><td>산출세액 × 55%</td></tr>
<tr><td>130만원 초과</td><td>71만 5,000원 + 130만원 초과분 × 30%</td></tr>
</tbody>
</table>
<table class="w-full text-sm">
<thead>
<tr><th>총급여</th><th>한도 산식</th><th>실제 한도</th></tr>
</thead>
<tbody>
<tr><td>3,300만원 이하</td><td>74만원</td><td>74만원</td></tr>
<tr><td>3,300만원 초과 ~ 7,000만원 이하</td><td>74만원 − (총급여 − 3,300만원) × 8/1,000, 최저 66만원</td><td>4,000만원이면 68만 4,000원, 4,300만원 이상은 66만원</td></tr>
<tr><td>7,000만원 초과 ~ 1억 2,000만원 이하</td><td>66만원 − (총급여 − 7,000만원) × 1/2, 최저 50만원</td><td>7,032만원을 넘으면 50만원</td></tr>
<tr><td>1억 2,000만원 초과</td><td>50만원 − (총급여 − 1억 2,000만원) × 1/2, 최저 20만원</td><td>1억 2,060만원을 넘으면 20만원</td></tr>
</tbody>
</table>
<p>한도 산식에서 눈여겨볼 곳은 7,000만원과 1억 2,000만원 경계입니다. 두 구간 모두 초과분의 절반을 한도에서 빼기 때문에, 총급여가 경계를 조금만 넘어도 한도가 곧바로 최저치로 내려갑니다. 예를 들어 연봉 6,900만원인 사람이 성과급 200만원을 받아 총급여 7,100만원이 되면 한도가 66만원에서 50만원으로 16만원 줄어듭니다. 성과급 자체에 붙는 세금과 별도로 생기는 차이라, 성과급 실수령을 계산할 때 함께 봐야 합니다.</p>

<h2>총급여별 계산 예시</h2>
<p>아래 표는 이 사이트 <a href="/year-end-tax">연말정산 계산기</a>와 같은 엔진으로 계산했습니다. 부양가족이 없는 1인 가구이고 국민연금·건강보험·장기요양보험·고용보험 근로자 부담분만 소득공제했다고 가정했습니다. 결정세액은 소득세만의 금액이며 지방소득세(소득세의 10%)는 별도입니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>총급여</th><th>근로소득공제</th><th>산출세액</th><th>근로소득세액공제</th><th>결정세액</th></tr>
</thead>
<tbody>
<tr><td>2,000만원</td><td>825만원</td><td>498,391원</td><td>274,115원</td><td>224,276원</td></tr>
<tr><td>3,000만원</td><td>975만원</td><td>1,115,218원</td><td>613,370원</td><td>501,848원</td></tr>
<tr><td>4,000만원</td><td>1,125만원</td><td>2,244,457원</td><td>684,000원 (한도)</td><td>1,560,457원</td></tr>
<tr><td>5,000만원</td><td>1,225만원</td><td>3,448,696원</td><td>660,000원 (한도)</td><td>2,788,696원</td></tr>
<tr><td>7,000만원</td><td>1,325만원</td><td>6,007,175원</td><td>660,000원 (한도)</td><td>5,347,175원</td></tr>
<tr><td>1억원</td><td>1,475만원</td><td>12,246,316원</td><td>500,000원 (한도)</td><td>11,746,316원</td></tr>
<tr><td>1억 5,000만원</td><td>1,575만원</td><td>27,099,919원</td><td>200,000원 (한도)</td><td>26,899,919원</td></tr>
</tbody>
</table>
<p>총급여 3,000만원까지는 산출세액이 크지 않아 55% 비율이 그대로 적용되고, 4,000만원부터는 비율로 계산한 금액이 한도를 넘어 한도액만 받습니다. 총급여가 높을수록 한도는 오히려 줄어드는 구조라, 연봉 1억원 이상에서는 근로소득세액공제가 결정세액에 주는 영향이 작습니다. 내 조건의 결과는 <a href="/year-end-tax">연말정산 계산기</a>에서, 세율 구간은 <a href="/income-tax-2026">종합소득세 계산기</a>와 <a href="/tax-rates-2026">2026 세율표</a>에서 확인할 수 있습니다.</p>

<h2>공제액과 줄어드는 세금은 다릅니다</h2>
<ul>
<li><strong>근로소득공제는 소득공제</strong>입니다. 1,225만원을 공제받는다고 세금이 1,225만원 줄어드는 것이 아니라, 과세표준이 줄어 그만큼에 세율을 곱한 세금이 덜 붙습니다. "직장인은 두 공제로 수백만원을 절세한다" 같은 문장은 공제액과 절감액을 섞어 쓴 표현입니다.</li>
<li><strong>근로소득세액공제는 세액공제</strong>입니다. 결정세액에서 바로 빠지지만 산출세액을 넘는 부분은 돌려받지 못합니다.</li>
<li><strong>한도 74만원은 총급여 3,300만원 이하에만</strong> 해당합니다. 총급여 4,300만~7,000만원은 66만원, 7,032만원 초과는 50만원, 1억 2,060만원 초과는 20만원이 한도입니다.</li>
<li><strong>매달 떼는 세금에도 이미 반영</strong>돼 있습니다. 근로소득 간이세액표가 두 공제를 반영해 만들어져 있어, 연말정산 때 따로 한 번 더 돌려받는 돈이 아닙니다. 환급이나 추가 납부는 부양가족·카드·의료비 같은 다른 공제에서 갈립니다.</li>
<li><strong>연도 중 입사·퇴사</strong>했다면 그해 실제로 받은 급여가 총급여가 되므로, 같은 연봉이라도 근로소득공제 비율과 세액공제 한도가 달라집니다.</li>
</ul>
<p>표준세액공제 13만원과 건강보험료 공제 중 어느 쪽이 유리한지는 <a href="/guides/standard-vs-special-deduction-2026">표준세액공제 vs 특별공제</a>, 청약통장 공제 효과는 <a href="/guides/housing-subscription-25man-deduction-2026">청약통장 소득공제</a>에서 같은 엔진으로 계산해 두었습니다. 연말정산 전체 일정은 <a href="/year-end-tax-2027">연말정산 2027 총정리</a>에 있습니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 근로소득공제는 따로 신청해야 하나요?</strong> — 아닙니다. 회사가 연말정산을 할 때 총급여에 구간표를 적용해 자동으로 빼며, 근로자가 제출할 서류는 없습니다.</li>
<li><strong>Q. 연봉 1억원이면 근로소득세액공제는 얼마인가요?</strong> — 총급여 1억원의 한도는 50만원입니다. 이 구간은 산출세액이 커서 비율로 계산한 금액이 한도를 넘으므로 대부분 50만원을 그대로 받습니다.</li>
<li><strong>Q. 비과세 식대도 총급여에 들어가나요?</strong> — 비과세 소득은 총급여에서 빠집니다. 국세청은 총급여를 연간 근로소득에서 비과세 소득을 뺀 금액으로 정의하므로, 비과세 항목이 많을수록 근로소득공제 계산의 출발점이 낮아집니다.</li>
<li><strong>Q. 맞벌이 부부는 한도를 합쳐 쓸 수 있나요?</strong> — 합칠 수 없습니다. 근로소득공제와 근로소득세액공제는 각자의 총급여와 산출세액으로 따로 계산합니다.</li>
<li><strong>Q. 총급여가 7,000만원을 살짝 넘으면 손해인가요?</strong> — 근로소득세액공제 한도가 66만원에서 50만원으로 내려가 최대 16만원 차이가 납니다. 다만 총급여 증가분이 그보다 크면 실수령은 여전히 늘어납니다.</li>
</ul>

<p>근거: <a href="https://www.law.go.kr/법령/소득세법/제47조" target="_blank" rel="noopener noreferrer">소득세법 제47조(근로소득공제)</a> · <a href="https://www.law.go.kr/법령/소득세법/제59조" target="_blank" rel="noopener noreferrer">소득세법 제59조(근로소득세액공제)</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6592&amp;cntntsId=7871" target="_blank" rel="noopener noreferrer">국세청 근로소득금액 안내</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6596&amp;cntntsId=7875" target="_blank" rel="noopener noreferrer">국세청 근로소득 세액공제 안내</a>. 기준일 2026-09-26 — 법령은 소득세법 2026년 1월 1일 시행본 기준이며, 계산 예시는 이 사이트 연말정산 엔진(2026년 귀속 세율·4대보험 요율) 값입니다.</p>
`;

const standardDeductionVsSpecial = `
<p class="lead">근로자의 <strong>표준세액공제는 연 13만원</strong>입니다. 다만 받으려면 건강보험료·고용보험료·주택자금 소득공제(특별소득공제), 보험료·의료비·교육비·기부금 세액공제(특별세액공제), 월세 세액공제를 <strong>하나도 신청하지 않아야</strong> 합니다(소득세법 제59조의4 제9항). 그래서 비교할 대상은 의료비 몇십만원이 아니라 <strong>건강보험료 공제까지 포함한 특별공제 전체</strong>입니다. 이 사이트 연말정산 엔진으로 다른 특별공제가 없는 1인 가구를 계산하면 총급여 3,000만원 이하에서는 표준세액공제가, 4,000만원 이상에서는 특별공제가 유리했습니다. 기준일은 2026년 9월 26일이며 2026년 귀속(2027년 1~2월 연말정산) 기준입니다.</p>

<h2>표준세액공제를 고르면 포기하는 것과 남는 것</h2>
<p>조문은 표준세액공제와 맞바꾸는 항목을 세 묶음으로 정해 두었습니다. 목록에 없는 공제는 표준세액공제를 받아도 그대로 적용됩니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>구분</th><th>항목</th><th>표준세액공제와 함께 받나</th></tr>
</thead>
<tbody>
<tr><td>특별소득공제</td><td>건강보험료·노인장기요양보험료·고용보험료, 주택임차차입금 원리금 상환액, 장기주택저당차입금 이자상환액</td><td>함께 못 받음</td></tr>
<tr><td>특별세액공제</td><td>보장성 보험료, 의료비, 교육비, 기부금</td><td>함께 못 받음</td></tr>
<tr><td>월세 세액공제</td><td>조세특례제한법 제95조의2</td><td>함께 못 받음</td></tr>
<tr><td>그 밖의 공제</td><td>기본공제·추가공제, 국민연금보험료 공제, 신용카드 등 소득공제, 주택청약종합저축 소득공제, 근로소득세액공제, 자녀세액공제, 연금계좌 세액공제</td><td>제외 목록에 없어 그대로 적용</td></tr>
</tbody>
</table>
<p>국세청 상담 안내도 같은 구조로 설명합니다. 건강보험료를 공제받으면 표준세액공제는 중복 적용되지 않고, 특별소득공제 등을 적용하는 편이 유리하면 그쪽을, 반대라면 표준세액공제 13만원을 적용합니다. 국민연금 보험료 공제는 특별소득공제가 아니라 연금보험료 공제라서 어느 쪽을 고르든 남습니다.</p>

<h2>총급여별 비교 — 다른 특별공제가 없는 1인 가구</h2>
<p>아래 표는 이 사이트 <a href="/year-end-tax">연말정산 계산기</a>와 같은 엔진으로 두 방식의 결정세액(소득세)을 각각 계산한 값입니다. 부양가족 없는 1인 가구가 4대보험료 외에 의료비·교육비·보험료 등 특별공제 항목이 없다고 가정했습니다. 표준세액공제 쪽은 건강·장기요양·고용보험료 소득공제를 빼고 13만원을 공제했습니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>총급여</th><th>건강·장기요양·고용보험료(연)</th><th>특별공제 결정세액</th><th>표준세액공제 결정세액</th><th>유리한 쪽(차이)</th></tr>
</thead>
<tbody>
<tr><td>1,500만원</td><td>745,107원</td><td>122,645원</td><td>12,763원</td><td>표준 (109,882원)</td></tr>
<tr><td>2,000만원</td><td>993,477원</td><td>224,276원</td><td>121,100원</td><td>표준 (103,176원)</td></tr>
<tr><td>2,500만원</td><td>1,241,846원</td><td>325,908원</td><td>229,437원</td><td>표준 (96,471원)</td></tr>
<tr><td>3,000만원</td><td>1,490,215원</td><td>501,848원</td><td>482,125원</td><td>표준 (19,723원)</td></tr>
<tr><td>4,000만원</td><td>1,986,953원</td><td>1,560,457원</td><td>1,728,500원</td><td>특별 (168,043원)</td></tr>
<tr><td>5,000만원</td><td>2,483,692원</td><td>2,788,696원</td><td>3,031,250원</td><td>특별 (242,554원)</td></tr>
<tr><td>7,000만원</td><td>3,477,168원</td><td>5,347,175원</td><td>5,912,000원</td><td>특별 (564,825원)</td></tr>
</tbody>
</table>
<p>총급여가 낮을 때 표준세액공제가 이기는 이유는 근로소득세액공제에 있습니다. 산출세액이 130만원 이하이면 근로소득세액공제가 산출세액의 55%라서, 보험료 소득공제로 산출세액이 줄어도 그 절반 넘게는 세액공제 감소로 상쇄됩니다. 반대로 총급여가 4,000만원을 넘어 근로소득세액공제가 한도에 걸리면 보험료 소득공제 효과가 온전히 남아 13만원을 훌쩍 넘습니다. 다만 표준세액공제도 결정세액을 0원 아래로 내리지는 못하므로, 총급여가 1,500만원보다 더 낮아 공제 전 세금이 13만원에 못 미치면 그 세금만큼만 줄어듭니다.</p>

<h2>'의료비 80만원이면 표준이 유리'는 맞을까</h2>
<p>의료비 세액공제는 총급여의 3%를 넘는 금액부터 15%를 공제합니다. 총급여 3,000만원이면 문턱이 90만원이라 의료비 80만원은 공제액이 0원입니다. 그래서 이 경우 표준이 유리한 것은 사실이지만, 이유는 '12만원 대 13만원'이 아니라 의료비가 아예 공제되지 않기 때문입니다. 같은 엔진으로 몇 가지 조합을 계산하면 다음과 같습니다(1인 가구, 결정세액 기준).</p>
<ul>
<li><strong>총급여 3,000만원 + 의료비 80만원</strong>: 의료비 공제 0원 → 표준세액공제가 19,723원 유리</li>
<li><strong>총급여 3,000만원 + 보장성 보험료 50만원</strong>: 보험료 세액공제 6만원이 더해져 특별공제가 40,277원 유리</li>
<li><strong>총급여 2,000만원 + 보장성 보험료 100만원</strong>: 특별공제가 16,824원 유리</li>
<li><strong>총급여 2,000만원 + 의료비 130만원</strong>: 문턱 60만원을 넘는 70만원의 15%가 공제돼 특별공제가 1,824원 유리. 의료비 200만원이면 106,824원 유리</li>
<li><strong>총급여 2,500만원 + 신용카드 등 1,500만원</strong>: 카드 공제는 양쪽에 똑같이 들어가므로 판단을 바꾸지 않습니다. 이 경우 표준세액공제가 96,470원 유리</li>
</ul>
<p>정리하면 총급여 3,000만원 이하 1인 가구는 <strong>보장성 보험료나 문턱을 넘는 의료비가 조금이라도 있으면 특별공제 쪽으로 기울고</strong>, 그런 항목이 전혀 없으면 표준세액공제가 낫습니다. 4,000만원 이상은 건강보험료 공제만으로도 특별공제가 유리한 경우가 대부분입니다.</p>

<h2>어떻게 정해지고 어디서 확인하나</h2>
<ul>
<li><strong>유리한 쪽 적용</strong>: 국세청 상담 안내는 두 방식을 비교해 유리한 쪽을 적용하도록 설명합니다. 회사 연말정산 결과인 근로소득 원천징수영수증에서 표준세액공제 칸에 13만원이 있으면 표준으로, 건강보험료 공제나 특별세액공제 칸에 금액이 있으면 특별공제로 정산된 것입니다.</li>
<li><strong>미리보기로 확인</strong>: 12월 전에 대략의 결과를 보려면 <a href="/year-end-tax-preview">홈택스 연말정산 미리보기 이용법</a>을 참고하세요. 이 사이트 계산기는 특별공제 방식으로 계산하므로, 총급여 3,000만원 이하라면 위 표와 함께 비교하는 것이 좋습니다.</li>
<li><strong>놓쳤다면 경정청구</strong>: 불리한 방식으로 정산된 것을 뒤늦게 알았다면 법정신고기한부터 5년 안에 홈택스에서 경정청구로 바로잡을 수 있습니다.</li>
</ul>

<h2>맞벌이 몰아주기와 표준세액공제</h2>
<p>맞벌이 부부가 의료비·교육비·보험료를 한쪽에 몰면 다른 쪽에는 건강보험료 공제만 남습니다. 그쪽 총급여가 3,000만원 안팎으로 낮다면 표준세액공제가 더 나을 수 있으므로, 몰아주기 결과를 볼 때 두 사람 모두의 방식을 따로 확인해야 합니다. 부부 합산 기준의 계산은 <a href="/calc/dual-income-year-end">맞벌이 연말정산 몰아주기 계산기</a>와 <a href="/guides/couple-split-bonus-year-2026">맞벌이 몰아주기 가이드</a>에서 이어서 볼 수 있습니다. 근로소득세액공제 한도가 총급여별로 어떻게 바뀌는지는 <a href="/guides/earned-income-deduction-2026">근로소득공제·근로소득세액공제</a>에 정리했습니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 건강보험료 공제를 안 받으면 손해 아닌가요?</strong> — 총급여에 따라 다릅니다. 다른 특별공제가 없는 1인 가구라면 총급여 3,000만원 이하에서는 건강보험료 공제를 포기하고 13만원을 받는 쪽이 결정세액이 더 작았습니다.</li>
<li><strong>Q. 표준세액공제를 받아도 신용카드 소득공제는 되나요?</strong> — 됩니다. 신용카드 등 소득공제는 조세특례제한법상 공제라 표준세액공제와 맞바꾸는 목록에 들어 있지 않습니다. 자녀세액공제와 연금계좌 세액공제도 마찬가지입니다.</li>
<li><strong>Q. 월세 세액공제를 받으면 표준세액공제는 어떻게 되나요?</strong> — 함께 받을 수 없습니다. 월세 세액공제는 표준세액공제와 맞바꾸는 항목이라, 월세 공제액이 13만원보다 크면 대개 월세 쪽이 유리합니다.</li>
<li><strong>Q. 근로소득이 없는 사업자도 13만원인가요?</strong> — 아닙니다. 근로소득이 없는 종합소득자는 조세특례제한법상 성실사업자 의료비 등 세액공제를 신청하지 않은 경우 성실사업자 연 12만원, 그 밖에는 연 7만원입니다.</li>
</ul>

<p>근거: <a href="https://www.law.go.kr/법령/소득세법/제59조의4" target="_blank" rel="noopener noreferrer">소득세법 제59조의4(특별세액공제·표준세액공제)</a> · <a href="https://www.law.go.kr/법령/소득세법/제52조" target="_blank" rel="noopener noreferrer">소득세법 제52조(특별소득공제)</a> · <a href="https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=1318&amp;ctgId=CTG11912" target="_blank" rel="noopener noreferrer">국세상담센터 표준세액공제 Q&amp;A</a>. 기준일 2026-09-26 — 법령은 소득세법 2026년 1월 1일 시행본 기준이며, 비교표는 이 사이트 연말정산 엔진(2026년 귀속 세율·4대보험 요율)으로 계산한 값입니다.</p>
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
<p class="lead">자녀 교육비 세액공제는 낸 교육비의 <strong>15%</strong>를 세금에서 빼 주는 제도로, <strong>취학 전 아동과 초·중·고생은 1명당 연 300만원(최대 45만원), 대학생은 1명당 연 900만원(최대 135만원)</strong>까지 인정합니다. 2026년 지출분부터는 <strong>초등학교 1·2학년(또는 9세 미만)의 예체능 학원비</strong>가 새로 포함되고, <strong>자녀에게 소득이 있어도</strong> 부모가 교육비 공제를 받을 수 있게 바뀌었습니다. 자녀의 대학원 학비는 여전히 대상이 아닙니다. 기준일은 2026년 9월 26일이며 2026년 귀속(2027년 1~2월 연말정산) 기준입니다.</p>

<h2>한도와 공제 대상 한눈에 보기</h2>
<p>근거는 소득세법 제59조의4 제3항과 같은 법 시행령 제118조의6입니다. 한도는 학생 1명 단위로 따로 계산하고, 공제율은 모두 15%입니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>구분</th><th>1명당 연 한도</th><th>최대 세액공제</th><th>주요 인정 비용</th></tr>
</thead>
<tbody>
<tr><td>취학 전 아동</td><td>300만원</td><td>45만원</td><td>어린이집·유치원 비용, 월 단위 주 1회 이상 학원·체육시설 수강료, 급식비, 방과후 과정 수업료</td></tr>
<tr><td>초등 1·2학년(9세 미만 포함)</td><td>300만원</td><td>45만원</td><td>학교 교육비에 더해 2026년 지출분부터 예능 학원·체육시설 수강료(월 단위, 주 1회 이상)</td></tr>
<tr><td>초등 3학년~고등학생</td><td>300만원</td><td>45만원</td><td>수업료·급식비·교과서대, 방과후학교 수업료와 교재비, 교복(중·고생 1명당 50만원까지), 현장체험학습비(1명당 30만원까지)</td></tr>
<tr><td>대학생</td><td>900만원</td><td>135만원</td><td>등록금·입학금 등 공납금(대학원 제외)</td></tr>
<tr><td>본인</td><td>한도 없음</td><td>—</td><td>대학·대학원, 직업능력개발훈련 수강료, 학자금 대출 원리금 상환액</td></tr>
<tr><td>장애인 특수교육비</td><td>한도 없음</td><td>—</td><td>기본공제대상 장애인의 재활교육비(직계존속 포함)</td></tr>
</tbody>
</table>
<p>수능 응시료와 대학 입학전형료도 교육비로 인정됩니다. 반면 방문 학습지는 공제 대상이 아니고, 12월 31일 현재 9세 이상인 초등 3학년 이상 학생의 학원비도 대상이 아닙니다. 부모 등 직계존속을 위해 낸 일반 교육비도 대상이 아니며, 장애인 특수교육비만 예외입니다.</p>

<h2>2026년에 달라진 두 가지</h2>
<p>2025년 12월 23일 개정된 소득세법(법률 제21221호)이 2026년 1월 1일 이후 지급하는 교육비부터 적용됩니다.</p>
<ul>
<li><strong>초등 저학년 예체능 학원비 추가</strong>: 과세기간 종료일(12월 31일) 현재 9세 미만이거나 2학년 이하인 초등학생이 예능 분야 교습과정을 운영하는 학원이나 체육시설에서 월 단위로 주 1회 이상 교습을 받고 낸 수강료가 공제 대상에 들어갑니다. 국어·영어·수학 같은 교과 학원은 해당하지 않고, 한도는 기존 초등학생 한도인 1명당 연 300만원 안에서 계산합니다.</li>
<li><strong>자녀 소득 요건 폐지</strong>: 종전에는 자녀의 연간 소득금액이 100만원(근로소득만 있으면 총급여 500만원)을 넘으면 부모가 교육비 공제를 받지 못했습니다. 개정 후에는 기본공제 대상이 될 수 있는 직계비속 등의 교육비를 그 사람의 소득과 관계없이 공제합니다. 아르바이트 소득이 있는 대학생 자녀의 등록금이 대표적인 예입니다. 나이 제한은 원래 없으므로 만 21세 이상 대학생도 대상입니다.</li>
</ul>
<p>두 개정 모두 2026년에 낸 교육비부터 적용되는 첫해라서, 2027년 1월 연말정산 간소화 자료에 예체능 학원비가 어떻게 조회되는지는 국세청 공지를 한 번 더 확인하는 편이 안전합니다. 조회되지 않으면 학원에서 교육비 납입증명서를 받아 회사에 내면 됩니다.</p>

<h2>계산 예시 — 대학생과 중학생 자녀가 있는 경우</h2>
<p>총급여 6,000만원인 근로자가 중학생 자녀(기본공제 대상)와 만 21세 대학생 자녀를 두고 2026년에 다음처럼 교육비를 냈다고 가정합니다. 이 사이트 <a href="/year-end-tax">연말정산 계산기</a>와 같은 엔진으로 결정세액을 계산했습니다.</p>
<table class="w-full text-sm">
<thead>
<tr><th>항목</th><th>지출</th><th>인정액</th></tr>
</thead>
<tbody>
<tr><td>대학생 등록금</td><td>800만원</td><td>800만원 (한도 900만원 이내)</td></tr>
<tr><td>중학생 교복</td><td>60만원</td><td>50만원 (1명당 50만원 한도)</td></tr>
<tr><td>중학생 현장체험학습</td><td>20만원</td><td>20만원 (30만원 한도 이내)</td></tr>
<tr><td>중학생 방과후학교 수업료</td><td>60만원</td><td>60만원</td></tr>
<tr><td>합계</td><td>940만원</td><td>930만원 → 세액공제 139만 5,000원</td></tr>
</tbody>
</table>
<p>이 가정에서 결정세액은 3,592,936원에서 2,197,936원으로 139만 5,000원 줄었고, 지방소득세까지 합치면 153만 4,500원입니다. 대학생 자녀는 나이 때문에 기본공제 대상이 아니지만 교육비 공제는 나이 제한이 없어 등록금이 그대로 인정됩니다.</p>
<p>세액공제는 산출세액을 넘어서 돌려받지 못한다는 점도 함께 보세요. 같은 엔진으로 총급여 2,500만원 1인 가구가 대학 등록금 900만원을 냈다고 계산하면, 공제 가능액은 135만원이지만 원래 결정세액이 325,908원이라 실제로 줄어드는 세금은 그 금액까지입니다. 교육비 세액공제는 다음 해로 넘어가지 않으므로, 맞벌이라면 자녀를 누구의 부양가족으로 올릴지 정할 때 산출세액 크기도 함께 보세요.</p>

<h2>공제가 빠지거나 줄어드는 경우</h2>
<ul>
<li><strong>장학금</strong>: 학교·직장·사내근로복지기금 등에서 받은 장학금으로 낸 부분은 공제 대상 교육비에서 뺍니다.</li>
<li><strong>자녀 명의 학자금 대출</strong>: 자녀가 학자금 대출을 받아 낸 등록금은 부모가 공제받을 수 없습니다. 이 경우 자녀가 나중에 대출 원리금을 갚을 때 근로소득이 있으면 본인 교육비로 공제받을 수 있습니다.</li>
<li><strong>자녀 대학원</strong>: 대학원 학비는 본인이 다닐 때만 공제됩니다.</li>
<li><strong>맞벌이 부부</strong>: 자녀 기본공제를 받는 사람만 그 자녀의 교육비를 공제받습니다. 남편이 기본공제를, 아내가 교육비를 나눠 받을 수는 없습니다.</li>
<li><strong>연도 중 혼인 등으로 부양가족에서 빠진 자녀</strong>: 혼인 등의 사유로 자녀가 과세기간 중에 기본공제대상자에서 벗어나면, 그 사유가 생긴 날까지 낸 교육비만 공제합니다(소득세법 제59조의4 제5항). 반면 2026년 지출분부터는 교육비 공제에서 자녀의 소득을 따지지 않으므로, 자녀가 연도 중 취업해 소득이 생겼다는 이유만으로 그 뒤에 낸 교육비가 빠지지는 않습니다.</li>
<li><strong>국외 교육기관</strong>: 국내 학교에 해당하는 국외 교육기관 교육비도 인정되지만, 부모가 국내에서 근무하면 취학 전 아동과 초·중학생은 자비유학 자격 등 요건을 갖춘 경우만 해당합니다.</li>
</ul>
<p>부양가족 요건은 <a href="/calc/dependent-check">부양가족 공제 판정기</a>, 맞벌이 부부의 자녀 귀속 비교는 <a href="/calc/dual-income-year-end">맞벌이 연말정산 몰아주기 계산기</a>와 <a href="/guides/couple-split-bonus-year-2026">맞벌이 몰아주기 가이드</a>에서 이어서 확인할 수 있습니다. 연말정산 전체 일정은 <a href="/year-end-tax-2027">연말정산 2027 총정리</a>에 있습니다.</p>

<h2>자주 묻는 질문</h2>
<ul>
<li><strong>Q. 초등학교 3학년 자녀의 태권도 학원비도 공제되나요?</strong> — 12월 31일 현재 9세 이상인 3학년이라면 되지 않습니다. 2026년에 새로 들어온 예체능 학원비는 12월 31일 현재 9세 미만이거나 2학년 이하인 초등학생만 대상이므로, 3학년이라도 12월 31일에 9세가 되지 않았다면 공제됩니다.</li>
<li><strong>Q. 아르바이트 소득이 있는 대학생 자녀 등록금도 공제되나요?</strong> — 2026년에 낸 등록금부터는 자녀의 소득과 관계없이 1명당 연 900만원 한도에서 15%를 공제받습니다. 다만 자녀 본인의 기본공제 150만원은 소득 요건을 따로 봅니다.</li>
<li><strong>Q. 대학원에 다니는 자녀 학비는 공제되나요?</strong> — 되지 않습니다. 대학원 교육비는 근로자 본인 것만 한도 없이 공제됩니다.</li>
<li><strong>Q. 유치원생 영어학원비는 공제되나요?</strong> — 취학 전 아동이 학원에서 월 단위로 주 1회 이상 교습을 받고 낸 수강료는 1명당 연 300만원 한도에서 공제됩니다. 방문 학습지는 대상이 아닙니다.</li>
<li><strong>Q. 맞벌이인데 기본공제는 남편이, 교육비는 아내가 받을 수 있나요?</strong> — 안 됩니다. 국세청 안내에 따르면 자녀 기본공제를 받는 근로자가 그 자녀의 교육비도 공제받습니다. 교육비가 큰 해에는 자녀를 어느 쪽 부양가족으로 올릴지부터 함께 정하세요.</li>
</ul>

<p>근거: <a href="https://www.law.go.kr/법령/소득세법/제59조의4" target="_blank" rel="noopener noreferrer">소득세법 제59조의4 제3항(교육비 세액공제)</a> · <a href="https://www.law.go.kr/법령/소득세법시행령/제118조의6" target="_blank" rel="noopener noreferrer">소득세법 시행령 제118조의6(교육비 범위)</a> · <a href="https://www.law.go.kr/LSW/lsRvsRsnListP.do?lsId=001565&amp;chrClsCd=010102" target="_blank" rel="noopener noreferrer">소득세법 개정이유(법률 제21221호)</a> · <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=40633&amp;cntntsId=239024" target="_blank" rel="noopener noreferrer">국세청 교육비 세액공제 안내</a> · <a href="https://call.nts.go.kr/call/qna/selectQnaInfo.do?mi=1318&amp;ctgId=CTG11910" target="_blank" rel="noopener noreferrer">국세상담센터 교육비 Q&amp;A</a> · <a href="https://www.korea.kr/news/policyNewsView.do?newsId=148957544" target="_blank" rel="noopener noreferrer">정책브리핑 2026년 달라지는 것(2026-01-06)</a>. 기준일 2026-09-26 — 법령은 소득세법 2026년 1월 1일 시행본과 시행령 2026년 7월 1일 시행본 기준이며, 계산 예시는 이 사이트 연말정산 엔진 값입니다.</p>
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
<p class="lead">신용카드 등 사용액 소득공제는 결제 수단별 공제율과 한도가 모두 다름. 신용카드 15%, 체크/현금 30%, 도서공연 등 문화비 30%(총급여 7천 이하), 전통시장·대중교통 40%. 기본 한도는 7천 이하 300만원·초과 250만원(자녀 수에 따라 상향).</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 한도 — 총급여별</h2>
<ul class="space-y-2 mt-4">
<li>· 7천 이하: 300만원 (자녀 1명 350만·2명 이상 400만)</li>
<li>· 7천 초과: 250만원 (자녀 1명 275만·2명 이상 300만)</li>
<li>· 1.2억 초과 별도 구간(200만원)은 2023년 귀속부터 폐지 — 7천 초과와 같은 한도</li>
<li>· 추가 한도: 전통시장·대중교통(7천 이하는 문화비 포함) 합산 300만원 / 7천 초과 200만원</li>
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
<li>· 난임시술 (한도 없음, 30% 공제)</li>
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
<li>· 국내 최초 근로 제공일부터 20년간 적용(2023년 개정)</li>
<li>· 연말정산 시 또는 5월 종소세 신고 시 선택</li>
<li>· 19% 단일세율 + 지방소득세 1.9% = 총 20.9%</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 비교 — 연봉 1억</h2>
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
<p class="lead">종교단체 기부금은 소득금액의 10% 한도, 그 외 지정기부금은 30% 한도. 정치자금 기부는 100% 세액공제(10만원 한도) + 초과분 15%. 절세 효과 큰 기부 전략.</p>

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
<li>· 한도 = 근로소득금액(약 4,725만원) × 10% ≈ 472만원 (나머지 128만원은 한도 초과)</li>
<li>· 472만원 × 15% 세액공제 ≈ 71만원 환급</li>
</ul>

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 영수증 필수</h2>
<p>기부금 영수증 없으면 공제 불가. 종교단체·시민단체에 연말 영수증 요청 + 5년 보관.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/year-end-tax" class="text-primary underline">연말정산 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// 카테고리 D — 투자·재테크 (10편)
// ═══════════════════════════════════════════════════════════════

const domesticVsOverseasEtf = `
<p class="lead">국내 상장 주식형 ETF만 매매차익 비과세 — 국내상장 해외지수 ETF는 과표기준가 증가분 15.4% 배당소득 과세, 해외 ETF는 22% 양도세. 같은 S&P500이라도 TIGER 미국S&P500(국내 상장) vs SPY(미국 상장)는 세금 구조가 완전 다름.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📊 세금 비교</h2>
<div class="overflow-x-auto my-6"><table class="w-full text-sm border border-border"><thead class="bg-secondary"><tr><th class="p-3">항목</th><th class="p-3">국내상장 해외지수 ETF</th><th class="p-3">해외 ETF</th></tr></thead><tbody>
<tr class="border-t"><td class="p-3">매매차익</td><td class="p-3">배당소득 15.4% (매매차익과 과표기준가 증가분 중 작은 금액)</td><td class="p-3">22% 양도세</td></tr>
<tr class="border-t"><td class="p-3">배당소득</td><td class="p-3">15.4% 분리</td><td class="p-3">15% 원천(미국)</td></tr>
<tr class="border-t"><td class="p-3">기본공제</td><td class="p-3">없음(배당소득)</td><td class="p-3">연 250만원</td></tr>
<tr class="border-t"><td class="p-3">손익통산</td><td class="p-3">불가(배당소득)</td><td class="p-3">가능</td></tr>
</tbody></table></div>

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 5천만원 → 7천만원</h2>
<ul class="space-y-2 mt-4">
<li>· 국내 TIGER S&P500: 약 308만원(15.4%) — 금융소득종합과세 합산 대상</li>
<li>· 미국 SPY: (2,000 - 250) × 22% = 385만원 세금</li>
<li>· <strong>차이 약 77만원</strong> — 금융소득 연 2,000만원 초과 여부까지 함께 비교</li>
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

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬</h2>
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

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 리스크 — 원금 손실</h2>
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
<tr class="border-t"><td class="p-3">IRP 이전</td><td class="p-3">0원 (이연)</td><td class="p-3">10년 이내 연금수령 30% 감면 → 약 700만원</td><td class="p-3">700만원</td></tr>
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
<p class="lead">비과세 식대 월 20만원 + 자가운전보조금·실비변상적 급여 등 비과세. 한 달에 약 25~30만원 비과세 → 연 300~360만원 세금 부담 없는 소득. 한계세율 24% 적용 시 약 72~86만원 세금 절감 효과.</p>

<h2 class="mt-12 text-2xl font-bold text-primary">📋 비과세 항목</h2>
<ul class="space-y-2 mt-4">
<li>· <strong>식대</strong>: 월 20만원 (외부 식사 또는 회사 제공 식대)</li>
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

<h2 class="mt-12 text-2xl font-bold text-primary">🎯 활용 — 사내복지기금 등록 회사</h2>
<p>대기업은 대부분 사내복지기금으로 학자금 지원. 입사 전 회사 복지 항목 확인. 자녀 1명 학자금 연 500만원 비과세 = 한계세율 35% 시 약 175만원 세금 차이.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/salary-db" class="text-primary underline">회사별 연봉·복지</a></li></ul></div>
`;

const bonusTiming = `
<p class="lead">성과급을 12월 대신 1월에 받으면 세금이 줄어들까요? <strong>입금한 달보다 어느 연도의 소득인지가 먼저입니다.</strong> 같은 귀속연도에 총급여와 공제 조건이 같다면 지급 월이 달라졌다는 이유만으로 최종 소득세가 줄지는 않습니다. 지급 때 뗀 원천징수액과 연말정산 후 확정되는 세액을 구분하세요.</p>
<p>확인 기준: 2026년 9월 9일. 현행 세법과 국세청의 2026년 3월 11일 사전답변을 확인했으며, 지급일을 바꾸면 특정 금액을 절세한다는 계산은 제시하지 않습니다.</p>

<h2 id="three-bonus-dates">성과급 명세서에서 확인할 세 가지 날짜</h2>
<div class="overflow-x-auto" role="region" aria-label="성과급 날짜와 귀속연도 구분" tabindex="0">
<table class="w-full text-sm">
<thead><tr><th scope="col">날짜</th><th scope="col">뜻</th><th scope="col">확인할 자료</th></tr></thead>
<tbody>
<tr><th scope="row">근로·성과 대상 기간</th><td>어느 기간의 일과 실적에 대한 보상인지</td><td>성과급 지급 규정, 평가 대상 기간</td></tr>
<tr><th scope="row">지급액 확정일</th><td>지표나 개인별 평가를 반영해 금액을 확정한 날</td><td>개인별 통지, 노사 합의, 확정 내역</td></tr>
<tr><th scope="row">실제 지급일</th><td>계좌에 돈이 들어온 날</td><td>급여명세서, 입금 내역</td></tr>
</tbody></table></div>
<p>급여는 원칙적으로 근로를 제공한 때, 잉여금처분 상여는 처분결의일을 기준으로 귀속을 판단합니다. 성과급은 지급 규정과 금액 확정 방식까지 확인해야 합니다. <a href="https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7869&amp;mi=2315">국세청 근로소득 수입시기 안내</a>와 <a href="https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&amp;joBrNo=00&amp;joNo=0049&amp;lsiSeq=286211&amp;urlMode=lsScJoRltInfoR">소득세법 시행령 제49조</a>가 기준입니다.</p>

<h2 id="bonus-attribution-example">올해 확정하고 내년에 나누어 받는다면?</h2>
<p>국세청은 계량·비계량 평가를 거쳐 개인별 성과급이 확정된 뒤 일부를 다음 연도 이후에 나누어 지급하는 사안에서, <strong>개인별 지급액이 확정된 연도</strong>를 귀속연도로 보았습니다. 이는 해당 사실관계에 대한 답변이며, 모든 성과급을 같은 방식으로 분류하라는 뜻은 아닙니다. <a href="https://taxlaw.nts.go.kr/qt/USEQTA002P.do?ntstDcmId=200000000000020060">사전-2025-법규소득-1070, 2026년 3월 11일 답변·4월 16일 등록</a>을 참고했습니다.</p>
<p><strong>가정 사례:</strong> 회사가 2026년에 개인별 성과급 1,000만원을 확정하고 2027년 1월에 입금하기로 했다면, “1월에 받으니 무조건 2027년 소득”으로 계산하지 않습니다. 먼저 회사에 확정 근거와 귀속연도를 확인한 뒤 해당 연도의 다른 급여와 합산합니다.</p>

<h2 id="withholding-vs-final-tax">많이 떼인 달의 세금이 최종 세금은 아닙니다</h2>
<p>상여 지급 때의 원천징수는 지급대상기간 등의 영향을 받습니다. 연말정산은 해당 연도의 근로소득과 적용 가능한 공제를 반영한 확정 세액에서 이미 낸 세금을 빼 추가 납부 또는 환급을 정합니다. 따라서 “1월은 24%, 12월은 35%”처럼 지급 월만으로 세율을 고정할 수 없습니다. <a href="https://s.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7870&amp;mi=6434">국세청 연말정산·원천징수 안내</a>.</p>
<ol>
<li>회사에 성과급 귀속연도와 지급대상기간을 확인합니다.</li>
<li>명세서에서 세전 상여, 소득세, 지방소득세, 기타 공제를 나누어 봅니다.</li>
<li>최종 세금 비교에서는 같은 귀속연도의 급여·상여와 같은 공제 조건을 사용합니다.</li>
<li>현금 계획은 실제 입금일 기준으로 따로 세웁니다. 퇴사 후 지급이면 이전 회사 자료의 합산·정산 여부도 확인합니다.</li>
</ol>

<h2 id="pension-tax-credit">보너스 직전 IRP 납입은 별도 판단입니다</h2>
<p>연금계좌 세액공제는 성과급의 한계세율을 곱하는 소득공제가 아닙니다. 일반 한도는 연금저축 연 600만원, 퇴직연금계좌를 합쳐 연 900만원입니다. 국세 공제율은 12% 또는 15%이며, 근로소득만 있다면 총급여 5,500만원 이하 여부가 공제율 기준입니다. <a href="https://j.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7875&amp;mi=6596">국세청 연금계좌 세액공제 안내</a>.</p>
<p>이미 낸 금액, 공제 대상 납입액, 남은 세액과 자금 사용 계획을 먼저 확인하세요. 납입액만으로 환급액을 보장할 수 없고, 입금 직전 납입했다는 사실만으로 공제율이 커지지 않습니다. 당장 쓸 생활비를 장기 계좌에 넣기 전에는 해당 금융회사의 중도인출·해지 조건도 확인해야 합니다.</p>

<h2 id="bonus-next-step">내 상황에 맞는 다음 확인</h2>
<ul>
<li><a href="/calc/year-end-bonus">연말 성과급 계산기</a>: 명세서를 보기 전 예상 수령액을 확인하는 보조 도구입니다. 귀속연도를 판정하거나 실제 원천징수를 재현하는 증빙은 아닙니다.</li>
<li><a href="/guides/incentive-split-payout-2026">인센티브 분할 지급 확인표</a>: 확정된 금액과 지급 조건, 퇴사 시 잔액을 구분합니다.</li>
<li><a href="/year-end-tax-mid-resign">중도퇴사자 연말정산</a>: 이직·퇴사 후 받은 성과급의 서류와 정산 경로를 확인합니다.</li>
</ul>
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

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 임원 퇴직 5억</h2>
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

<h2 class="mt-12 text-2xl font-bold text-primary">💰 시뮬 — 1억 차익</h2>
<ul class="space-y-2 mt-4">
<li>· 일반: 행사 근로소득세 3,800만원 + 매도 양도세 220만원 = 4,020만원</li>
<li>· 적격: 양도세 약 2,160만원만</li>
<li>· <strong>차이: 약 1,860만원</strong></li>
</ul>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/tools/finance/stock-tax" class="text-primary underline">주식 양도세 계산</a></li></ul></div>
`;

const incentiveSplitPayout = `
<p class="lead">인센티브를 여러 해에 나누어 받는다고 소득 귀속연도도 자동으로 나뉘지는 않습니다. <strong>개인별 금액이 언제 확정됐는지, 지급을 미룬 것인지, 앞으로 충족해야 할 조건이 남아 있는지</strong>를 먼저 확인하세요. 분할 지급은 입금 일정과 미수령 잔액을 바꾸므로 세금과 현금흐름을 따로 비교해야 합니다.</p>
<p>확인 기준: 2026년 9월 9일. 이 글은 분할 지급 조건을 검토하는 안내이며, 지급 월에 따른 귀속연도·원천징수 설명은 <a href="/guides/bonus-payout-timing-2026">성과급 지급 시점과 세금</a>에 모았습니다.</p>

<h2 id="split-payout-ruling">국세청이 답한 80%·10%·10% 지급 사례</h2>
<p><a href="https://taxlaw.nts.go.kr/qt/USEQTA002P.do?ntstDcmId=200000000000020060">국세청 사전-2025-법규소득-1070</a>은 2026년 3월 11일 답변, 4월 16일 등록된 사안입니다. 개인별 성과급 총액을 정하고 80%는 해당 연도, 나머지는 다음 두 해에 10%씩 지급하는 사실관계를 다뤘습니다. 계량·비계량 평가에 따라 개인별 지급액이 확정된 경우, 일부를 나중에 지급해도 귀속연도는 그 확정 연도라는 답변입니다.</p>
<p>따라서 “5,000만원을 2년으로 나누면 세금 350만원 절감” 같은 고정 결론을 적용할 수 없습니다. 지급액이 아직 확정되지 않았거나 별도 조건이 남은 계약은 위 사안과 같은지부터 확인해야 합니다.</p>

<h2 id="split-payout-cashflow">5,000만원 분할 사례: 입금 일정만 비교하기</h2>
<p>아래는 총액이 확정되고 추가 지급 조건이 없다고 가정한 <strong>세전 현금흐름 예시</strong>입니다. 실수령액이나 절세액을 계산한 표가 아닙니다.</p>
<div class="overflow-x-auto" role="region" aria-label="인센티브 분할 지급 현금흐름 예시" tabindex="0">
<table class="w-full text-sm">
<thead><tr><th scope="col">시점</th><th scope="col">해당 시점 지급액</th><th scope="col">아직 받지 않은 금액</th></tr></thead>
<tbody>
<tr><th scope="row">확정 연도, 80% 지급</th><td>4,000만원</td><td>1,000만원</td></tr>
<tr><th scope="row">다음 연도, 10% 지급</th><td>500만원</td><td>500만원</td></tr>
<tr><th scope="row">그다음 연도, 10% 지급</th><td>500만원</td><td>0원</td></tr>
</tbody></table></div>
<p>위 국세청 답변과 같은 사실관계라면, 현금이 나뉘어 들어오더라도 소득 귀속은 확정 연도입니다. 지급·원천징수·정산 일정은 회사 급여 담당자에게 함께 확인해야 합니다.</p>

<h2 id="split-payout-contract-checklist">회사에 서면으로 확인할 여섯 가지</h2>
<ol>
<li><strong>총액과 확정일:</strong> 목표 인센티브인지, 개인별로 확정된 금액인지 구분합니다.</li>
<li><strong>분할 날짜:</strong> 매회 지급액, 지급일, 아직 지급하지 않은 잔액을 확인합니다.</li>
<li><strong>재직 조건:</strong> 퇴사·휴직·이직하면 잔액 지급 여부나 시점이 바뀌는지 확인합니다.</li>
<li><strong>추가 조건:</strong> 실적 재평가·감액·반환 조건이 있다면 적용 사유와 계산 방식을 확인합니다.</li>
<li><strong>귀속·원천징수:</strong> 어느 연도의 근로소득인지, 각 지급 때 얼마를 원천징수하고 어떻게 정산하는지 확인합니다.</li>
<li><strong>미지급 대응:</strong> 약정일에 지급되지 않을 때 담당 부서와 확인할 문서를 남깁니다.</li>
</ol>
<p>회사와 분할 일정을 논의할 때는 세금 감소를 전제로 동의하기보다, 당장 필요한 생활비와 나중에 받을 금액을 함께 비교하세요. 미지급 잔액이 임금체불에 해당하는지는 지급 의무와 약정일 등 구체적인 사실에 따라 판단합니다.</p>

<h2 id="split-payout-next-step">다음 확인</h2>
<ul>
<li><a href="/guides/bonus-payout-timing-2026">성과급의 귀속연도와 원천징수 구분</a></li>
<li><a href="/tools/finance/bonus">성과급 수령액 계산기</a> — 입력 가정에 따른 참고 계산이며, 분할계약의 세무 판정을 대신하지 않습니다.</li>
<li><a href="/guides/wage-delayed-claim-2026">약정한 지급일을 넘겼을 때 임금체불 확인·신고</a></li>
</ul>
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

<h2 class="mt-12 text-2xl font-bold text-primary">⚠️ 포괄임금제 함정</h2>
<p>포괄임금제 근로계약 시 월 일정 시간(예: 20시간) 야근 수당 미리 포함. 그 이상은 추가 지급 의무. 미지급 시 노동부 진정.</p>

<div class="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/20"><p class="font-bold text-primary mb-2">📌 관련</p><ul class="space-y-1 text-sm"><li>· <a href="/weekly-holiday-allowance-2026" class="text-primary underline">주휴수당 계산기</a></li></ul></div>
`;

// ═══════════════════════════════════════════════════════════════
// Export — 50개 가이드 통합
// ═══════════════════════════════════════════════════════════════

export const hotNewsExtended: Guide[] = [
  // 청년·신혼부부 10편
  { slug: "newlywed-asset-tax-saving-2026", title: "신혼부부 자산·공제 확인표 — 공동명의와 맞벌이 비교", description: "부부 공제가 자동으로 두 배가 되지 않는 이유. 종부세 인별 9억원·1주택 12억원, 자산 명의와 지출자, 중복 공제 조건을 구분합니다.", category: "세금", tags: ["신혼부부", "절세", "공동명의", "증여세", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-09", views: 0, content: newlywedAssetTax, lang: "ko" },
  { slug: "newlywed-didimdol-bomgijari-2026", title: "신혼부부 디딤돌 vs 보금자리론 — 5억 30년 시 1.8억 절감", description: "디딤돌 1.6%·한도 5억 vs 보금자리론 3.5%·한도 10억. 부부 소득·집값별 유리한 상품 선택.", category: "부동산", tags: ["신혼부부", "디딤돌", "보금자리론", "주택대출", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedDidimdolVsBomgijari, lang: "ko" },
  { slug: "youth-subscription-60points-2026", title: "청약 가점 60점+ 5년 안에 만드는 5가지 전략", description: "청약통장 만 17점·무주택 10점·부양가족 25점 = 60점. 청년주택드림 + 특별공급 활용.", category: "부동산", tags: ["청약", "가점", "청년", "특별공급", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: youthSubscriptionGapyo5y, lang: "ko" },
  { slug: "youth-housing-dream-account-detail-2026", title: "청년우대형 vs 청년주택드림 청약통장 — 4.5% 금리 + 3억 대출", description: "청년주택드림 신규 가입 (만 19~34세) 최대 4.5% + 연 120만원 소득공제 + 최대 3억 대출 자격. 5년 누적 약 494만원 혜택.", category: "부동산", tags: ["청년주택드림", "청약", "청년", "내집마련", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: youthSubscriptionAccount, lang: "ko" },
  { slug: "newlywed-deduction-first-year-2026", title: "신혼부부 첫 연말정산 2026 — 혼인 세액공제 50만원", description: "2026년 혼인신고 시 부부 각자 혼인 세액공제 50만원, 배우자·양가 부모 기본공제는 12월 31일 기준으로 판정합니다.", metaDescription: "2026년에 혼인신고를 했다면 부부 각자 혼인 세액공제 50만원을 받습니다. 배우자·양가 부모 기본공제, 월세·청약 공제, 출산·산후조리원까지 신혼 첫 연말정산 항목을 계산 예시와 정리했습니다.", category: "세금", tags: ["신혼부부", "연말정산", "인적공제", "혼인세액공제", "2026"], level: "초급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: newlywedDeduction, lang: "ko" },
  { slug: "newlywed-child-birth-benefit-2026", title: "자녀 1명 출산 시 정부 지원 3,200만원 — 6+6 + 자녀세액공제 + 산후조리원", description: "출산휴가 90일 + 6+6 부모 육아휴직 3,200만원 + 자녀세액공제 30~70만원 + 산후조리원 200만원 + 자녀장려금 80만원.", category: "세금", tags: ["출산", "자녀", "정부지원", "육아휴직", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedChildBirthBenefit, lang: "ko" },
  { slug: "youth-3account-combination-2026", title: "청년 3종 조합 — 도약계좌·장기투자 2025년 말 신규 종료", description: "청년도약·청년형 장기투자는 2025-12-31 신규 가입 종료(청년미래적금 참고). 기존 가입자 기준 도약 243만 + 주택드림 약 394만원.", category: "투자", tags: ["청년", "도약계좌", "주택드림", "장기투자", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: youthAccountCombination, lang: "ko" },
  { slug: "youth-k-pass-mass-transit-2026", title: "K-패스 대중교통 환급 — 청년 30% 연 28만원, 저소득층 53%", description: "월 15회+ 대중교통 이용 시 일반 20%·청년 30%·저소득 53% 환급. 청년 월 8만원 사용 시 연 28만원 환급.", category: "기초", tags: ["K-패스", "대중교통", "청년", "환급", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: youthKpass, lang: "ko" },
  { slug: "newlywed-loan-limit-2x-2026", title: "신혼부부 대출 한도 부부 합산 — 단독 대비 2배 가능", description: "부부 합산 DSR 40% + LTV 70%. 부부 연 1.2억 시 8.5억 대출 + 12억 주택 매수 가능. 공동 채무자 리스크 점검 필수.", category: "부동산", tags: ["신혼부부", "대출 한도", "DSR", "LTV", "공동명의", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedLoanLimit, lang: "ko" },
  { slug: "newlywed-joint-ownership-2026", title: "신혼부부 공동명의 vs 단독명의 — 공시가 12억 기준 분기점", description: "1주택 공시가 12억 이하: 둘 다 0원 / 12~18억: 공동명의(각 9억)면 0원 / 18억+: 공동명의 대체로 유리, 단독 세액공제 비교.", category: "부동산", tags: ["신혼부부", "공동명의", "종부세", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: newlywedJointOwnership, lang: "ko" },
  // 부동산 심화 10편
  { slug: "gangnam-vs-gangbuk-prop-tax-2026", title: "강남 1주택 20억 vs 강북 2주택 16억 — 보유세 632만 vs 544만원", description: "강남 1주택 20억 보유세 약 632만원 vs 강북 2주택 합 16억 약 544만원. 1주택 12억 공제로 공시가 4억 차이에도 세금 차이는 약 88만원.", category: "부동산", tags: ["보유세", "종부세", "1주택자", "다주택", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: gangnamVsGangbuk, lang: "ko" },
  { slug: "parcel-vs-occupancy-right-tax-2026", title: "분양권 vs 입주권 양도세 — 단기 양도세 70%·60% 점검", description: "분양권 단기 양도세 2년 미만 70%, 입주권 보유기간 합산(원조합원+본인). 8억 입주권 매도 시 양도세 약 6,800만원.", category: "부동산", tags: ["분양권", "입주권", "양도세", "재개발", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: parcelRightVsOccupancyRight, lang: "ko" },
  { slug: "temp-two-home-3year-rule-2026", title: "일시적 2주택 3년 룰 — 1일 초과 시 양도세 2~3억 점프", description: "신규 주택 취득 후 3년 이내 종전 주택 매도 시 1주택자 비과세 12억. 3년 1일 초과 시 다주택자 분류, 양도세 폭탄.", category: "부동산", tags: ["일시적2주택", "양도세", "비과세", "이사", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: tempTwoHomeRule, lang: "ko" },
  { slug: "redevelopment-tax-3-step-2026", title: "재건축·재개발 양도세 3단계 — 사업시행·관리처분·준공 시점별", description: "사업시행 전 일반 양도세, 관리처분~준공 입주권 보유기간 합산, 준공 후 새 주택 양도세 + 청산금 차익 별도.", category: "부동산", tags: ["재건축", "재개발", "양도세", "입주권", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: redevelopmentTax, lang: "ko" },
  { slug: "lease-right-transfer-tax-2026", title: "전세권·임차권 양도세 — 권리금 차익도 신고 의무", description: "전세권 매매 시 권리금 차익에 양도세 6~45%. 보유 3년 미만은 단기 세율 45%. 등기 전세권은 임대인 동의 없이 양도 가능.", category: "부동산", tags: ["전세권", "임차권", "양도세", "권리금", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: leaseRightTax, lang: "ko" },
  { slug: "farmland-forest-capital-gains-2026", title: "농지·임야 양도세 — 자경 8년 100% 감면 vs 비사업용 10%p 가산", description: "자경 농지 8년+ 거주 + 직접 경작 시 양도세 100% 감면(연 1억 한도). 비사업용 토지는 10%p 가산세 추가.", category: "부동산", tags: ["농지", "임야", "양도세", "자경", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: farmlandForestTax, lang: "ko" },
  { slug: "commercial-office-capital-gains-2026", title: "상가·오피스텔 양도세 — 7억→12억 매도 시 1.25억 부담", description: "상가·오피스텔은 비과세 12억 한도 없음. 차익 5억 + 장기보유공제 30% 시 약 1.25억 세금. 임대사업자 등록으로 우대 가능.", category: "부동산", tags: ["상가", "오피스텔", "양도세", "임대사업", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: commercialOfficeTax, lang: "ko" },
  { slug: "burdened-gift-strategy-2026", title: "부담부증여 — 시가 10억 + 대출 6억 증여 시 증여세 절반 이하", description: "자녀에게 부동산 + 대출 동시 이전. 증여 부분 4억만 증여세, 채무 인수 6억은 부모 양도세. 단순 증여 2.4억 → 6,000만원으로 절감.", category: "부동산", tags: ["부담부증여", "증여세", "양도세", "절세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: burdenedGift, lang: "ko" },
  { slug: "child-gift-10year-rule-2026", title: "자녀 증여 10년 룰 — 평생 1.4억 비과세 자산 이전", description: "미성년 10년 2,000만원, 성인 5,000만원 비과세. 자녀 0세부터 시작하면 40년 1.4억 비과세. 운용수익도 자녀 자산.", category: "부동산", tags: ["자녀증여", "증여세", "10년룰", "자산이전", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: childGift50m, lang: "ko" },
  { slug: "rental-report-obligation-2026", title: "주택임대 신고 의무 — 미신고 시 5년 추징 + 가산세 2~3배", description: "1주택 기준시가 12억 초과 또는 2주택+ 임대료 발생 시 신고 의무. 무신고 20% + 납부지연 일 0.022%. 5월 종소세 신고 시 임대 포함.", category: "부동산", tags: ["임대신고", "임대소득", "가산세", "종소세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: rentalReportObligation, lang: "ko" },
  // 직장인 세부 절세 10편
  { slug: "earned-income-deduction-2026", title: "근로소득공제·근로소득세액공제 2026 구간표와 한도", description: "근로소득공제는 총급여 구간별 70~2%(한도 2,000만원), 세액공제는 산출세액의 55%·30%에 한도 74만~20만원.", metaDescription: "근로소득공제는 총급여 5,000만원이면 1,225만원, 한도 2,000만원입니다. 근로소득세액공제 55%·30% 산식과 총급여별 한도 74만~20만원, 1인 가구 계산 예시를 정리했습니다.", category: "세금", tags: ["근로소득공제", "근로소득세액공제", "직장인", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: earnedIncomeDeduction, lang: "ko" },
  { slug: "standard-vs-special-deduction-2026", title: "표준세액공제 13만원 vs 특별공제 — 건보료까지 비교", description: "표준세액공제 13만원은 건강보험료 공제와 의료비·교육비 등 특별공제를 하나도 신청하지 않을 때만 받습니다.", metaDescription: "표준세액공제 13만원은 건강·고용보험료 소득공제와 의료비·교육비·보험료·기부금 세액공제를 모두 포기할 때 받습니다. 1인 가구 총급여별 유불리와 의료비 80만원 사례를 계산했습니다.", category: "세금", tags: ["표준세액공제", "특별세액공제", "의료비", "절세", "2026"], level: "초급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: standardDeductionVsSpecial, lang: "ko" },
  { slug: "medical-edu-donation-limits-2026", title: "의료비·교육비·기부금 한도 — 평균 직장인 135만원 환급", description: "의료비 15% 한도 700, 교육비 본인 무제한·자녀 300/900, 기부금 종교 10%·일반 30%. 5천만원 직장인 평균 135만원 환급.", category: "세금", tags: ["의료비공제", "교육비공제", "기부금공제", "한도", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: medicalEduDonation, lang: "ko" },
  { slug: "child-education-deduction-limit-2026", title: "자녀 교육비 세액공제 2026 — 300만·900만원 한도", description: "취학 전·초중고 1명당 300만원, 대학생 900만원 한도로 15% 공제. 2026년부터 초1·2 예체능 학원비 포함, 자녀 소득 요건 폐지.", metaDescription: "자녀 교육비 세액공제는 취학 전·초중고 1명당 연 300만원, 대학생 900만원 한도로 15%입니다. 2026년 추가된 초1·2 예체능 학원비와 자녀 소득 요건 폐지, 계산 예시를 정리했습니다.", category: "세금", tags: ["자녀교육비", "공제", "대학등록금", "학원비", "2026"], level: "초급", publishedDate: "2026-05-23", modifiedDate: "2026-09-30", views: 0, content: childEducationLimit, lang: "ko" },
  { slug: "insurance-100man-limit-2026", title: "보장성 보험료 100만원 한도 — 종신·암·실손·자동차 합산 12만원 환급", description: "한도 100만원 × 12% = 12만원 환급. 종신·암·정기·실손·자동차·운전자·어린이 보험 포함. 저축성·연금보험 제외.", category: "세금", tags: ["보험료공제", "종신보험", "실손보험", "자동차보험", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: insurance100Limit, lang: "ko" },
  { slug: "credit-card-deduction-limit-detail-2026", title: "신용카드 한도 상세 — 7천 이하 300만원·초과 250만원", description: "기본 한도 7천 이하 300만·초과 250만원(자녀 상향) + 전통시장·대중교통 추가 300만(7천 초과 200만). 25% 초과 후 체크·전통시장으로.", category: "세금", tags: ["신용카드", "체크카드", "한도", "공제율", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: cardLimitDetail, lang: "ko" },
  { slug: "book-concert-museum-deduction-2026", title: "도서·공연·박물관·영화 30% 공제 — 100만원 한도 추가 환급", description: "총급여 7천 이하. 도서·공연·박물관·미술관·영화 티켓 30% 공제. 100만원 사용 시 한계세율 24% 약 7만원 추가 환급.", category: "세금", tags: ["도서공연비", "박물관", "영화", "공제", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: bookConcertDeduction, lang: "ko" },
  { slug: "eyewear-herb-implant-medical-2026", title: "안경·한약·임플란트 의료비 — 종합 영수증으로 환급 극대화", description: "안경 50만 한도, 한약·한방, 임플란트·치과, 출산·산후조리원 200만 포함. 미용 목적·건강기능식품·마사지 제외.", category: "세금", tags: ["의료비공제", "안경", "한약", "임플란트", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: eyewearHerbMedical, lang: "ko" },
  { slug: "foreign-flat-tax-19-2026", title: "외국인 근로자 단일세율 19% — 연봉 2억+ 외국인에게 유리", description: "국내 최초 근로 제공일부터 20년간 외국인 근로자 단일세율 19% + 지방세 = 20.9%. 연봉 2억+ 외국인에게 일반 누진세율 대비 유리.", category: "세금", tags: ["외국인", "단일세율", "Flat Tax", "근로자", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: foreignFlatTax19, lang: "ko" },
  { slug: "religious-donation-100-percent-2026", title: "기부금 한도 — 종교 10%·정치 10만원 100% 환급", description: "정치자금 10만원까지 100% 세액공제 + 초과분 15%. 법정 100%, 지정 30%, 종교 10% 한도. 5천만원 + 종교 600만원 시 약 57만원 환급.", category: "세금", tags: ["기부금공제", "종교단체", "정치자금", "법정기부금", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: religiousDonation100, lang: "ko" },
  // 투자·재테크 10편
  { slug: "domestic-vs-overseas-etf-tax-2026", title: "국내상장 vs 해외 ETF 세금 — 5천 → 7천 매도 시 77만원 차이", description: "같은 S&P500이라도 TIGER(국내상장) 배당소득 15.4% vs SPY(미국) 22% 양도세. 2,000만원 차익 시 308만 vs 385만원, 약 77만원 차이.", category: "투자", tags: ["ETF", "양도세", "S&P500", "TIGER", "SPY", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: domesticVsOverseasEtf, lang: "ko" },
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
  { slug: "severance-lump-vs-irp-2026", title: "퇴직금 일시금 vs IRP — 1억 퇴직금 시 300만원 절감", description: "일시금 세금 1,000만원 vs IRP 이전 후 10년 이내 연금수령 700만원(30% 감면). 만 55세부터 수령 + 운용수익 누적까지 IRP 우위.", category: "커리어", tags: ["퇴직금", "IRP", "연금수령", "절세", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: severanceLumpVsIrp, lang: "ko" },
  { slug: "career-gap-rehire-benefit-2026", title: "경력단절 후 재취업 — 정부지원 4가지 + 중소기업 감면 70%", description: "고용촉진지원금 월 30~80만원 × 6~12개월 + 출산 후 재취업 우대 + 중소기업 취업 소득세 70% 감면 + 직업훈련 500만원.", category: "커리어", tags: ["경력단절", "재취업", "고용촉진", "중소기업감면", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: careerGapRehire, lang: "ko" },
  { slug: "tax-free-meal-commute-2026", title: "비과세 식대 20만원 + 자가운전 — 연 360만원 세금 부담 없는 소득", description: "월 비과세 식대 20만원 + 자가운전보조금 20만원(요건 충족 시) + 일직수당. 월 30만원 비과세 시 연 360만원 → 한계세율 24%면 86만원 절감.", category: "연봉", tags: ["비과세", "식대", "통신비", "자가운전", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: taxFreeMealCommute, lang: "ko" },
  { slug: "business-trip-expense-tax-2026", title: "출장비 비과세 — 국내 1일 2만원·해외 1일 5만원", description: "실비 영수증 출장비 비과세. 일비 정액은 국내 2만원·해외 5만원까지. 초과분은 근로소득으로 과세.", category: "연봉", tags: ["출장비", "일비", "비과세", "해외출장", "2026"], level: "초급", publishedDate: "2026-05-23", views: 0, content: travelExpenseTax, lang: "ko" },
  { slug: "child-tuition-tax-free-2026", title: "자녀 학자금 비과세 — 사내복지기금 vs 회사 직접 지급", description: "사내복지기금 학자금 지원 비과세 + 본인 대학원 업무 관련 비과세 + 해외 주재원 자녀 학비 비과세. 연 500만원 = 175만원 절감.", category: "연봉", tags: ["자녀학자금", "사내복지기금", "비과세", "주재원", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: childTuitionTaxFree, lang: "ko" },
  { slug: "bonus-payout-timing-2026", title: "성과급 12월·1월 지급 차이 — 귀속연도와 원천징수 확인", description: "성과급 지급일과 소득 귀속연도는 다를 수 있습니다. 국세청 2026년 답변으로 분할 지급, 최종 세금과 원천징수, IRP 세액공제를 구분합니다.", category: "세금", tags: ["성과급", "귀속연도", "원천징수", "IRP", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-09", views: 0, content: bonusTiming, lang: "ko" },
  { slug: "executive-severance-limit-2026", title: "임원 퇴직금 한도 초과분 — 5억 퇴직 시 1.08억 세금", description: "임원 퇴직금 한도는 일반 직원 × 3~5배. 한도 내 퇴직소득세 + 한도 초과분 근로소득세 누진세율. 5억 퇴직 시 약 1.08억 세금.", category: "커리어", tags: ["임원", "퇴직금", "한도초과", "근로소득세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: executiveSeveranceLimit, lang: "ko" },
  { slug: "stock-option-exercise-timing-2026", title: "스톡옵션 행사 시점 — 일반 vs 적격 시 1,860만원 차이", description: "일반 스톡옵션: 행사 시 근로소득세 + 매도 양도세 22%. 적격 스톡옵션: 매도 시 양도세만. 1억 차익 시 1,860만원 절감.", category: "주식", tags: ["스톡옵션", "행사", "적격스톡옵션", "양도세", "2026"], level: "고급", publishedDate: "2026-05-23", views: 0, content: stockOptionExercise, lang: "ko" },
  { slug: "incentive-split-payout-2026", title: "인센티브 분할 지급 — 귀속연도·미수령 잔액·퇴사 조건 확인", description: "80%·10%·10% 분할 지급에 관한 국세청 2026년 답변을 확인합니다. 세금이 자동으로 줄지 않는 이유와 지급 일정·재직 조건 확인표를 제공합니다.", category: "연봉", tags: ["인센티브", "분할지급", "귀속연도", "지급조건", "2026"], level: "중급", publishedDate: "2026-05-23", modifiedDate: "2026-09-09", views: 0, content: incentiveSplitPayout, lang: "ko" },
  { slug: "overtime-night-holiday-pay-2026", title: "야근·휴일·시간외 수당 — 50% 가산 + 생산직 연 240만원 비과세", description: "8시간 초과·22~6시 야간·휴일 근로 50% 가산. 야간+시간외 중복 시 100%. 생산직 연 240만원 야근수당 비과세. 포괄임금제 함정 점검.", category: "연봉", tags: ["야근수당", "휴일근로", "시간외수당", "포괄임금제", "2026"], level: "중급", publishedDate: "2026-05-23", views: 0, content: overtimeNightHolidayTax, lang: "ko" },
];
