// src/lib/guides/overseas-living-deepdive.ts
// 해외 거주·이주 심화 5편.

export const overseasLivingGuides = [
 {
 slug: "korea-resident-overseas-tax-2026",
 title: "한국 거주자 해외 원격근무 세금 2026",
 description: "183일 거주자 판정·종합과세·외국 납부세액 공제·이중과세 방지 협정 종합.",
 category: "해외거주",
 tags: ["해외 원격근무", "거주자 세금", "디지털 노마드"],
 level: "고급" as const,
 publishedDate: "2026-04-30",
 views: 0,
 content: `
<p class="lead">한국 거주자가 해외 회사에서 원격근무하는 경우, 한국 세법상 전세계 소득에 대해 한국 종합소득세를 내야 합니다. 이중과세를 피하려면 외국 납부세액 공제와 이중과세 방지 협정을 활용해야 합니다.</p>

<h2>📌 거주자 vs 비거주자 판정</h2>
<ul>
<li><strong>거주자</strong>: 1년 중 183일 이상 한국 체류 OR 한국에 가족·재산 근거지. 전세계 소득 한국 과세.</li>
<li><strong>비거주자</strong>: 183일 미만 한국 체류. 한국 발생 소득만 한국 과세.</li>
</ul>

<h2>💰 거주자 + 해외 회사 급여 시나리오</h2>
<p>한국 거주 (183일+) + 미국 회사 원격근무 + 연 10만 USD 수령:</p>
<ol>
<li>입금 시점 환율로 원화 환산 (예: 1USD = 1,380원 → 1.38억)</li>
<li>한국 종합소득세 신고 (5월) → 누진세율 적용 (35% 구간)</li>
<li>미국에서 이미 떼인 세금 (Federal + State 약 25%) → 외국 납부세액 공제</li>
<li>한국-미국 이중과세 방지 협정 적용 → 한국이 미국 세금만큼 공제</li>
</ol>

<h2>🚀 외국 납부세액 공제</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>한국 종합소득세 산출 후 외국에서 낸 세금만큼 공제. 단, 한도는 '한국 세율 × 외국 소득'.</p>
<ul>
<li>한국 세금 (5,000만 가정) - 미국 세금 (3,500만) = <strong>한국 추가 납부 1,500만</strong></li>
<li>이중 부담 없음 (한국 + 미국 합 = 한국 단일 세금과 동일)</li>
</ul>
</div>

<h2>🌐 이중과세 방지 협정</h2>
<p>한국은 OECD 대부분 국가와 협정 체결. 양국 동시 과세 X.</p>
<ul>
<li>미국·일본·중국·독일·영국·캐나다·호주 등 모두 적용</li>
<li>비협정 국가 (일부 동남아·중동) 시 본인 부담 ↑</li>
</ul>

<h2>🚨 자주 하는 실수</h2>
<ol>
<li><strong>외화 입금 신고 X</strong>: 5월 종합소득세 의무. 미신고 시 가산세 20% + 5년 내 추징.</li>
<li><strong>환율 평균 적용 X</strong>: 매월 입금일 환율 적용해야 정확. 연말 평균 사용은 부정확.</li>
<li><strong>건강보험 미가입</strong>: 직장 미가입자는 지역가입자 자동 등록. 사업소득 신고 시 건보료 자동 산정.</li>
<li><strong>세금계산 후 신고만 함</strong>: 외국 납부세액 공제 신청 안 하면 자동 적용 X. 명시적 신청 필수.</li>
</ol>

<h2>📝 결론</h2>
<p>한국 거주자 + 해외 원격근무는 이중 신고 (한국 + 외국)이지만 협정으로 이중 부담 없음. <strong>5월 한국 신고 + 외국 납부세액 공제 신청</strong>이 핵심. 세무사 활용 권장 (월 30~50만).</p>
`.trim(),
 },
 {
 slug: "foreigner-korea-tax-2026",
 title: "외국인 한국 취업 세금 가이드 2026",
 description: "외국인 근로자 19% 단일세율 (Flat Tax) 옵션 + 거주자 일반 누진 vs 비교.",
 category: "해외거주",
 tags: ["외국인 세금", "Flat 19%", "Expat tax"],
 level: "중급" as const,
 publishedDate: "2026-04-30",
 views: 0,
 content: `
<p class="lead">외국인이 한국에서 취업할 경우 한국 세법상 거주자 또는 비거주자로 판정됩니다. 거주자는 일반 누진세율(6~45%) 또는 단일 19% Flat Tax 중 선택 가능. 본 가이드는 외국인 근로자에게 가장 유리한 선택을 안내합니다.</p>

<h2>📌 Flat Tax 19% 자격</h2>
<ul>
<li>외국인 근로자 (한국 국적 아닌 자)</li>
<li>한국 첫 입국부터 5년간 적용 가능</li>
<li>한국에서 일하는 외국인 임원·전문직 대상</li>
<li>5년 후 자동으로 일반 누진세율 적용</li>
</ul>

<h2>💰 일반 누진세율 vs Flat 19% 비교</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<h3>연봉 1억 외국인 시나리오</h3>
<p><strong>일반 누진 (한국 거주자)</strong>:</p>
<ul>
<li>과세표준 약 8,500만 (공제 후) → 35% 구간</li>
<li>산출세액 약 2,400만 + 지방세 240만 = <strong>2,640만</strong></li>
</ul>
<p><strong>Flat 19% (외국인 옵션)</strong>:</p>
<ul>
<li>총 연봉 1억 × 19% = <strong>1,900만</strong></li>
<li>지방세 별도 (190만) → 합 2,090만</li>
</ul>
<p><strong>Flat이 약 550만 절세</strong>. 단, 공제 항목 활용 안 됨.</p>
</div>

<h2>🤔 어느 게 유리?</h2>
<ul>
<li><strong>연봉 7,000만 이상 + 공제 항목 적음</strong> → Flat 19% 유리</li>
<li><strong>연봉 7,000만 이하</strong> → 일반 누진세율 + 공제 활용 유리</li>
<li><strong>한국에 가족·자녀 있고 공제 많음</strong> → 일반 누진</li>
<li><strong>독신 외국인 임원·전문직</strong> → Flat 19%</li>
</ul>

<h2>🚀 신고 절차</h2>
<ol>
<li>매월 회사가 원천징수 (선택한 방식 기준)</li>
<li>매년 2월 연말정산 (회사 진행)</li>
<li>5월 종합소득세 신고 (다른 소득 있으면)</li>
<li>외국 가족 송금 시 별도 신고</li>
</ol>

<h2>🌐 4대보험·국민연금</h2>
<p>외국인도 한국 4대보험 가입 의무. 단, 국민연금은 본국과 협정에 따라 면제 가능:</p>
<ul>
<li>미국·캐나다·호주·독일·영국 → 사회보장 협정 적용 → 본국 연금만 가입 가능</li>
<li>본인 본국 연금 가입 + 한국 국민연금 면제 → 절감</li>
</ul>

<h2>🚨 비거주자 (183일 미만) 세금</h2>
<p>한국 체류 183일 미만 시 비거주자 → 한국 발생 소득에만 22% 단일 세율 (지방세 포함). 이중과세 방지 협정 적용.</p>

<h2>📝 결론</h2>
<p>외국인 한국 취업은 Flat 19%가 대부분 유리하지만, 가족 동반·공제 많은 경우 일반 누진. 한국 첫 입사 시 회사에 명시적 신청. 자세한 영문 가이드는 <a href="/en/flat-tax">English Flat Tax Guide</a>.</p>
`.trim(),
 },
 {
 slug: "us-h1b-visa-tax-2026",
 title: "미국 H1B 비자 + 세금 가이드 2026",
 description: "H1B 추첨·LCA·연봉·연방·주세·Social Security·Medicare. 한국 vs 미국 세금 차이.",
 category: "해외거주",
 tags: ["미국 H1B", "미국 비자", "미국 세금"],
 level: "고급" as const,
 publishedDate: "2026-04-30",
 views: 0,
 content: `
<p class="lead">미국 H1B 비자는 한국 IT·전문직이 가장 많이 노리는 비자입니다. 매년 4월 추첨 (당첨률 30~40%), 연봉 최저 $60,000+, 6년 근무 + Green Card 신청 가능. 단, 세금은 한국보다 훨씬 복잡합니다.</p>

<h2>📌 H1B 비자 핵심</h2>
<ul>
<li><strong>추첨 시점</strong>: 매년 4월 1주차</li>
<li><strong>당첨률</strong>: 약 30~40% (석사 별도 풀)</li>
<li><strong>최저 연봉</strong>: $60,000+ (지역·직군별 차등)</li>
<li><strong>유효기간</strong>: 3년 (1회 갱신, 총 6년)</li>
<li><strong>이직</strong>: 가능하지만 새 회사가 H1B 후원 필수</li>
</ul>

<h2>💰 미국 세금 구조</h2>
<table class="my-4">
<thead><tr><th>세금</th><th>비율</th><th>적용</th></tr></thead>
<tbody>
<tr><td>연방 소득세 (Federal)</td><td>10~37% 누진</td><td>전국 동일</td></tr>
<tr><td>주세 (State)</td><td>0~13.3%</td><td>주별 차등</td></tr>
<tr><td>Social Security</td><td>6.2%</td><td>$160,200 한도</td></tr>
<tr><td>Medicare</td><td>1.45%</td><td>한도 X</td></tr>
<tr><td>지방세 (City)</td><td>0~3.876%</td><td>NYC·시카고 등</td></tr>
</tbody>
</table>

<h3>실리콘밸리 (캘리포니아) 연봉 $200K 시나리오</h3>
<ul>
<li>연방 소득세: 약 $35,000 (24% 구간)</li>
<li>주세 (CA): 약 $18,000 (9.3%)</li>
<li>Social Security: $9,932 (한도 $160,200 × 6.2%)</li>
<li>Medicare: $2,900 (200K × 1.45%)</li>
<li><strong>총 세금 약 $66,000 (33%)</strong></li>
<li>실수령: 약 $134,000 ≈ 1.85억원/년 (한국 환산)</li>
</ul>

<h2>🚨 한국 vs 미국 비교</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>한국 IT 시니어 연봉 1억 vs 미국 H1B 시니어 $200K:</p>
<ul>
<li>한국 1억 - 세금·4대보험 약 22% = 실수령 7,800만 (월 650만)</li>
<li>미국 $200K - 세금 33% = 실수령 약 1.85억원 (월 1,540만)</li>
<li><strong>차이 약 2.4배 (단, 미국 생활비 ↑)</strong></li>
</ul>
<p>실리콘밸리 1인 가구 월 생활비 약 $5,000 (700만원). 한국 200만원 대비 3.5배. 실 가용 차이 1.5~2배.</p>
</div>

<h2>🚀 절세 전략 (미국)</h2>
<ol>
<li><strong>401(k) 가입</strong>: 회사 매칭 (보통 6%) + 연 $22,500 한도. 세전 공제 → 절세.</li>
<li><strong>HSA (Health Savings)</strong>: 의료비 절세 계좌. 연 $3,850 한도.</li>
<li><strong>Roth IRA</strong>: 세후 입금 → 인출 시 비과세. 연 $7,000 한도.</li>
<li><strong>주세 0% 주 이주</strong>: 텍사스·플로리다·워싱턴 등 주세 X. 캘리포니아·뉴욕 대비 9% 절감.</li>
</ol>

<h2>📝 결론</h2>
<p>미국 H1B는 연봉 측면 압도적이지만 비자·세금·생활비 종합 검토 필수. 5~10년 미국 근무 후 한국 복귀하는 케이스가 일반적. 본격 해외 이주는 Green Card 후 검토 권장.</p>
`.trim(),
 },
 {
 slug: "singapore-tech-pass-2026",
 title: "싱가포르 Tech.Pass 비자 + 세금",
 description: "싱가포르 IT 인재 비자·연봉 SGD 180K+·세금 10%·EP·PEP 비교.",
 category: "해외거주",
 tags: ["싱가포르", "Tech.Pass", "EP 비자"],
 level: "고급" as const,
 publishedDate: "2026-04-30",
 views: 0,
 content: `
<p class="lead">싱가포르는 아시아 IT·금융 허브. Tech.Pass·EP(Employment Pass)·PEP(Personalized EP) 비자로 외국인이 취업 가능. 세금이 매우 낮고(10%) 영어로 일할 수 있어 한국 IT 인재의 인기 목적지입니다.</p>

<h2>📌 비자 종류 비교</h2>
<table class="my-4">
<thead><tr><th>비자</th><th>최저 연봉</th><th>유효기간</th><th>특징</th></tr></thead>
<tbody>
<tr><td>EP (일반)</td><td>SGD 5,500/월 ≈ 5,600만/년</td><td>2년 갱신</td><td>회사 후원 필수</td></tr>
<tr><td>EP (40세+)</td><td>SGD 11,500/월 ≈ 1.4억/년</td><td>2년 갱신</td><td>경력 시니어</td></tr>
<tr><td>PEP</td><td>SGD 12,000/월 (연 SGD 270K)</td><td>3년 (자영업 가능)</td><td>본인이 비자 보유</td></tr>
<tr><td>Tech.Pass</td><td>SGD 22,500/월 (3억+)</td><td>2년 + 갱신</td><td>최고 IT 인재 대상</td></tr>
</tbody>
</table>

<h2>💰 싱가포르 세금 (매우 낮음)</h2>
<p>거주자 (183일+) 누진세율:</p>
<ul>
<li>SGD 20K 이하: 0%</li>
<li>SGD 30K~40K: 3.5%</li>
<li>SGD 80K~120K: 11.5%</li>
<li>SGD 200K~240K: 19%</li>
<li>SGD 320K 초과: 22% (최고)</li>
</ul>

<h3>SGD 180K (약 1.84억) 시나리오</h3>
<ul>
<li>세금 약 SGD 18,150 = <strong>10.1%</strong></li>
<li>한국 동일 연봉 기준 약 25% 세금 → <strong>15%p 절세</strong></li>
</ul>

<h2>🚀 싱가포르 vs 한국 vs 미국 종합 비교</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>IT 시니어 (한국 연봉 1억 vs 싱가포르 SGD 180K vs 미국 $200K):</p>
<table>
<thead><tr><th></th><th>한국 1억</th><th>싱가포르 SGD 180K</th><th>미국 $200K (CA)</th></tr></thead>
<tbody>
<tr><td>세금</td><td>22%</td><td>10%</td><td>33%</td></tr>
<tr><td>연 실수령 (원)</td><td>7,800만</td><td>1.65억</td><td>1.85억</td></tr>
<tr><td>월 생활비 (1인)</td><td>200만</td><td>400만</td><td>700만</td></tr>
<tr><td>월 가용</td><td>450만</td><td>970만</td><td>840만</td></tr>
</tbody>
</table>
<p>싱가포르가 월 가용 측면 가장 유리. 세금 ↓ + 생활비 미국보다 ↓.</p>
</div>

<h2>🚨 싱가포르 단점</h2>
<ol>
<li><strong>주거비 매우 높음</strong>: 1인 원룸 SGD 2,500~4,000/월 (250~400만)</li>
<li><strong>CPF 미적용</strong>: 외국인은 싱가포르 연금 (CPF) 가입 안 됨 → 노후 자금 본인 책임</li>
<li><strong>비자 종속</strong>: 회사 그만두면 30일 내 새 직장 + EP 갱신 필요</li>
<li><strong>영주권 어려움</strong>: PR 신청 가능하지만 까다로움 (5년+ 거주 + 기여)</li>
<li><strong>의료비 자비</strong>: 외국인은 공공의료 X. 민간 보험 (월 SGD 200~500)</li>
</ol>

<h2>📝 결론</h2>
<p>싱가포르는 세금·영어·아시아 위치·안정성 종합 시 한국 IT 인재 최고 옵션. 단, 주거비 + 의료비 + 비자 종속 고려. 5~10년 근무 후 PR 또는 한국 복귀 일반적.</p>
`.trim(),
 },
 {
 slug: "japan-residency-tax-2026",
 title: "일본 재류자격 + 세금 가이드 2026",
 description: "일본 기술·인문 비자·고도외국인재·연봉·일본 세금 (소득세·주민세·사회보험) + 한국 비교.",
 category: "해외거주",
 tags: ["일본 비자", "일본 취업", "일본 세금"],
 level: "중급" as const,
 publishedDate: "2026-04-30",
 views: 0,
 content: `
<p class="lead">일본은 한국과 가장 가까운 해외 취업지. 거리·문화·언어 진입장벽이 미국보다 낮고, IT·서비스업 외국인 채용이 활발합니다. 단, 일본 세금 + 사회보험은 한국보다 부담이 큽니다.</p>

<h2>📌 일본 비자 종류</h2>
<table class="my-4">
<thead><tr><th>비자</th><th>대상</th><th>유효기간</th></tr></thead>
<tbody>
<tr><td>기술·인문지식·국제업무</td><td>대학 졸업 + 사무직</td><td>1·3·5년 갱신</td></tr>
<tr><td>고도전문직 1호</td><td>고도외국인재 (포인트 70+)</td><td>5년 + 영주권 빠름</td></tr>
<tr><td>경영·관리</td><td>회사 설립자</td><td>1·3·5년</td></tr>
<tr><td>특정기능</td><td>인력 부족 산업 (간호·외식·건설 등)</td><td>5년 (1호) / 무기한 (2호)</td></tr>
</tbody>
</table>

<h2>💰 일본 세금 (소득세 + 주민세)</h2>
<table class="my-4">
<thead><tr><th>구분</th><th>세율</th></tr></thead>
<tbody>
<tr><td>소득세 (国税)</td><td>5~45% 누진</td></tr>
<tr><td>주민세 (住民税)</td><td>10% 일률</td></tr>
<tr><td>사회보험 (本人)</td><td>약 15% (건보·연금·고용·개호)</td></tr>
</tbody>
</table>

<h3>도쿄 연봉 800만엔 (약 7,000만) 시나리오</h3>
<ul>
<li>소득세: 약 80만엔 (10% 구간)</li>
<li>주민세: 약 80만엔 (10%)</li>
<li>사회보험 (본인): 약 120만엔 (15%)</li>
<li><strong>총 약 280만엔 (35%)</strong></li>
<li>실수령 520만엔 ≈ 4,576만원</li>
</ul>

<h2>🚀 일본 vs 한국 비교</h2>
<div class="bg-secondary/30 p-6 rounded-xl mt-6 border border-primary/10">
<p>한국 6,500만 IT 시니어 vs 일본 800만엔 (약 7,000만):</p>
<ul>
<li>한국: 실수령 약 5,200만 (월 433만)</li>
<li>일본: 실수령 약 4,576만 (월 380만, JPY 환산)</li>
<li><strong>일본이 월 약 50만 ↓</strong></li>
</ul>
<p>단, 일본 도쿄 1인 생활비 약 250만 (한국 200만 vs 50만 ↑) → 실 가용 약 100만 ↓.</p>
</div>

<h2>🌐 고도외국인재 비자 — 영주권 빠름</h2>
<p>학력·경력·연봉으로 점수 산정. 70점+ → 1호 비자, 80점+ → 1년 후 영주권, 70점+ → 3년 후 영주권.</p>
<ul>
<li>박사 30점 / 석사 20점 / 학사 10점</li>
<li>경력 5년 10점, 7년 15점, 10년 20점</li>
<li>연봉 600만엔 5점 / 1,000만엔 30점</li>
<li>일본어 N1 15점</li>
</ul>

<h2>🚨 일본 거주자 단점</h2>
<ol>
<li><strong>사회보험 부담 큼</strong>: 본인 약 15% (한국 9.4% 대비 1.6배)</li>
<li><strong>한국 IT 평균 연봉이 일본보다 ↑</strong> (싱가포르·미국 ↓)</li>
<li><strong>도쿄 부동산 천정부지</strong>: 매수 어려움. 세입자 90%</li>
<li><strong>외국인 영주권 까다로움</strong>: 일반 비자는 10년+ 거주 필요. 고도외국인재만 빠름.</li>
</ol>

<h2>📝 결론</h2>
<p>일본은 한국 인접 + 문화 친숙 + 안정성 측면 좋지만 세금·생활비 측면 한국과 큰 차이 X. 일본어 N1 + 고도외국인재 비자 활용 시 영주권 빠른 옵션.</p>
`.trim(),
 },
];
