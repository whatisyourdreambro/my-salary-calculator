import { CompanyProfile } from "@/types/company";

export const seedCompanies: CompanyProfile[] = [
 {
 id: "samsung-electronics",
 name: { ko: "삼성전자", en: "Samsung Electronics" },
 industry: "Semiconductor / Consumer Electronics",
 tier: "conglomerate",
 logo: "🏢",
 description:
 "대한민국 시가총액 1위, 글로벌 반도체·모바일·가전 리더. DS(반도체) / DX(가전·모바일) / 하만 3대 사업부 운영, 임직원 약 12만명. 2026년 임금협약 잠정합의(Base-up 4.1% + 성과인상률 평균 2.1%)로 셀러리캡 전면 상향 — CL2 0.76→0.80억, CL3 1.03→1.10억, CL4 (개발 1.22억/비개발 1.20억) → 개발·비개발 통합 1.30억. 전 직급 가중 평균 영끌 연봉 약 8,000만원(반도체 사이클 평탄화 기준).",
 salary: {
 // CL1 (신입~사원): base 4,800만 + OPI/TAI 평균 800만 = 영끌 5,600만원.
 // 셀러리캡(CL1 상한) 약 5,500만원 base. 평균 OPI 회사 인상률에 OPI 변동 ±30% 반영.
 entry: {
 base: 48000000,
 incentive: { target: 25, max: 50, avgAmount: 8000000 },
 },
 // CL2 (대리, 3~7년차): base 6,000만 + 평균 OPI 1,200만 = 영끌 7,200만원.
 // 셀러리캡 약 7,200만원 base. 동기 진급 격차 첫 발생 구간.
 junior: {
 base: 60000000,
 incentive: { target: 30, max: 50, avgAmount: 12000000 },
 },
 // CL3 (과장, 7~12년차): base 7,500만 + 평균 OPI 1,700만 = 영끌 9,200만원.
 // 셀러리캡 약 8,800만원 base. 진급 누락 시 cap에 가까워져 인상폭 정체.
 senior: {
 base: 75000000,
 incentive: { target: 35, max: 50, avgAmount: 17000000 },
 },
 // CL4 (차장/부장, 12~18년차): base 9,000만 + 평균 OPI 2,200만 = 영끌 1억 1,200만원.
 // 셀러리캡 약 1억 500만원 base. 임원 진급 전 마지막 cap, 정체 시 가장 강함.
 lead: {
 base: 90000000,
 incentive: { target: 40, max: 60, avgAmount: 22000000 },
 },
 // 임원 (상무·부사장·사장): base 1.5억 + 평균 성과급·RSU 5,000만 = 영끌 2억+.
 // 임원 cap 은 직무·사업부 적자/흑자별 차등 폭이 매우 큼.
 executive: {
 base: 150000000,
 incentive: { target: 50, max: 100, avgAmount: 50000000 },
 stock: { type: "RSU", amount: 50000000, vesting: "3 years" },
 },
 },
 // ─────────────────────────────────────────────────────────────
 // 삼성전자 CL(Career Level) 세부 직급 — 2026년 임금협약 잠정합의서 원문 기준.
 // ⚠️ 셀러리캡 수치는 합의서 명시값(추정 아님):
 //   - CL4: 개발 1.22억 / 비개발 1.20억 → 개발/비개발 통합 1.30억
 //   - CL3: 1.03억 → 1.10억
 //   - CL2: 0.76억 → 0.80억
 // 임금인상률: 기준인상률(Base-up) 4.1% + 성과인상률 평균 2.1% (CL/고과 차등).
 // CL1=고졸/전문대졸, CL2=대졸 사원·대리, CL3=과장·차장·책임, CL4=부장·수석.
 // 정규 진급: CL2 → 9년차 CL3 → 19년차 CL4 (단, 점수제로 연차 무관 진급 확대 추세).
 // 영끌(총액)은 base + 평균 OPI(연봉의 25~50%) + TAI(월 기본급의 100% × 2회).
 // 반도체 사이클·사업부 흑/적자에 따라 OPI는 ±30% 변동.
 // ─────────────────────────────────────────────────────────────
 careerLevels: [
 {
 group: "CL1 (고졸·전문대졸 입사)",
 promotionNote: "고졸·전문대졸 신입은 CL1 시작. 평균 4~6년 이상 근무 + 점수 충족 시 CL2 진급 가능",
 salaryCapManwon: 5000,
 steps: [
 {
 label: "CL1-1 (1~2년차)",
 description: "고졸·전문대졸 입사 신입~2년차. 생산직·기술직 중심",
 baseManwon: 3800,
 totalManwon: 4800,
 },
 {
 label: "CL1-2 (3~4년차)",
 description: "CL1-1 이후 호봉 상승, CL2 진급 직전 구간",
 baseManwon: 4200,
 totalManwon: 5400,
 isCapReached: true,
 },
 ],
 },
 {
 group: "CL2 (대졸 신입 사원·대리)",
 promotionNote: "대졸 신입 입사 시작점. 정규 진급은 9년차 CL3. 2026년 셀캡 0.76억 → 0.80억 상향(합의서)",
 salaryCapManwon: 8000,
 steps: [
 {
 label: "CL2 (1~2년차)",
 description: "대졸 신입 입사. 보도 초봉 5,300만원 + OPI/TAI",
 baseManwon: 5300,
 totalManwon: 7200,
 },
 {
 label: "CL2 (3~4년차)",
 description: "사원 중반. 호봉 + Base-up 4.1% + 성과인상률 2.1% 누적",
 baseManwon: 6000,
 totalManwon: 8100,
 },
 {
 label: "CL2 (5~6년차)",
 description: "사원 후반~대리 진입. 부서별 직책 책임 증가",
 baseManwon: 6800,
 totalManwon: 9100,
 },
 {
 label: "CL2 (7~8년차)",
 description: "대리. CL3 진급 직전 — 2026 신규 셀러리캡 0.80억 도달",
 baseManwon: 8000,
 totalManwon: 10500,
 isCapReached: true,
 },
 ],
 },
 {
 group: "CL3 (과장·차장·책임)",
 promotionNote: "CL2 → CL3 진급은 평균 9년차. 2026년 셀캡 1.03억 → 1.10억 상향(합의서)",
 salaryCapManwon: 11000,
 steps: [
 {
 label: "CL3 (1~2년차)",
 description: "과장 진급 직후. base 상승 + OPI 비중 증가",
 baseManwon: 8500,
 totalManwon: 11800,
 },
 {
 label: "CL3 (3~4년차)",
 description: "과장 중반. 책임자 직책 수당 가능",
 baseManwon: 9300,
 totalManwon: 13000,
 },
 {
 label: "CL3 (5~6년차)",
 description: "책임/차장 진입. 사업부 핵심 인력",
 baseManwon: 10200,
 totalManwon: 14200,
 },
 {
 label: "CL3 (7~8년차)",
 description: "차장 후반. CL4 진급 임박 — 2026 신규 셀러리캡 1.10억 도달",
 baseManwon: 11000,
 totalManwon: 15500,
 isCapReached: true,
 },
 ],
 },
 {
 group: "CL4 (부장·수석)",
 promotionNote: "정규 진급은 19년차. 2026년 셀캡 (개발 1.22억/비개발 1.20억) → 개발/비개발 통합 1.30억 상향(합의서)",
 salaryCapManwon: 13000,
 steps: [
 {
 label: "CL4 (1~2년차)",
 description: "부장 진급 직후. 보도 부장 base 1억~1억 700만",
 baseManwon: 11200,
 totalManwon: 16800,
 },
 {
 label: "CL4 (3~4년차)",
 description: "부장 중반. 직책 책임·팀장 보임 시 추가 수당",
 baseManwon: 12100,
 totalManwon: 18000,
 },
 {
 label: "CL4 (5년차+)",
 description: "수석부장. 2026 신규 셀러리캡 1.30억 도달 — 임원 진급 대기 구간",
 baseManwon: 13000,
 totalManwon: 19500,
 isCapReached: true,
 },
 ],
 },
 {
 group: "임원 (수석·연구위원·상무 이상)",
 promotionNote: "CL4 → 임원 진급률 약 1%. 보도 임원 평균 연봉 2억 5,600만원",
 steps: [
 {
 label: "상무 (1~3년차)",
 description: "상무보 진급. base 1.5억 + 성과급/RSU 50%",
 baseManwon: 15000,
 totalManwon: 22000,
 },
 {
 label: "상무 (4년차+)·전무",
 description: "사업부 임원. RSU 비중 증가",
 baseManwon: 18000,
 totalManwon: 28000,
 },
 {
 label: "부사장·사장",
 description: "그룹 핵심 경영진. base + RSU + 장기 인센티브 누적",
 baseManwon: 30000,
 totalManwon: 60000,
 },
 ],
 },
 ],
 workLife: {
 weeklyHours: { contract: 40, real: 48 },
 remoteWork: { policy: "office", description: "원칙적 출근, 사업부·직무별 재택 일부 허용" },
 vacation: { days: 15, usageRate: 85 },
 },
 culture: {
 score: 8.0,
 keywords: ["성과주의", "체계적", "대기업", "OPI/TAI", "DS·DX사업부", "글로벌커리어", "CL셀러리캡"],
 pros: [
 "2026 임금협약 — Base-up 4.1% + 성과인상률 평균 2.1%(CL·고과 차등)",
 "셀러리캡 전면 상향 — CL2 0.80억 / CL3 1.10억 / CL4 1.30억(개발·비개발 통합)",
 "OPI 성과급(연봉의 최대 50%) + TAI(월 기본급 최대 100% 연 2회)",
 "자녀출산경조금 대폭 상향 — 첫째 100만 / 둘째 200만 / 셋째이상 500만(2026 신규)",
 "사내 주택대부 제도 신설(2026) — 무주택 조합원 주거안정 지원",
 "사내 식당 3끼 무료 + 사내 병원/약국 + 가족 의료비 + 자녀 학자금",
 ],
 cons: [
 "직급별 연봉 셀러리캡(상한) 존재 — 동일 CL에서 base 인상폭 제한",
 "CL3·CL4 진급 누락 시 base 인상이 회사 인상률(2026년 합산 6.2%)에 수렴",
 "반도체 다운사이클·DS 사업부 적자 시 OPI 0% — 영끌 30% 감소 위험",
 "지방 근무(평택·기흥·온양·구미·천안) 비중 높음",
 "DS 사업부 강도(야간/교대 비중), 부서 바이 부서(부바부) 편차",
 ],
 },
 benefits: [
 { category: "financial", title: "OPI (성과인센티브)", description: "연 1회, 사업부 영업이익 연동. 연봉의 최대 50% — 단, 사업부 적자 시 0% 지급(셀러리캡 상한 도달 시 가장 큰 변동성).", value: 12000000 },
 { category: "financial", title: "TAI (목표달성장려금)", description: "연 2회(상/하반기), 월 기본급의 최대 100%. OPI보다 변동성 낮음.", value: 6000000 },
 { category: "financial", title: "성과인상률 (2026 신규)", description: "기준 Base-up 4.1% 외 성과인상률 평균 2.1%를 CL/고과 차등 적용 — 합산 약 6.2%", value: 2000000 },
 { category: "financial", title: "사내 주택대부 (2026 신규)", description: "무주택 조합원 주거안정 지원 — 임금협약 잠정합의서 명시, 세부 금액·대상은 별도 인사규정", value: 5000000 },
 { category: "financial", title: "우리사주조합", description: "급여의 일정 비율을 자사주로 매입, 1년 보호예수 후 매도 가능", value: 3000000 },
 { category: "family", title: "자녀출산경조금 (2026 상향)", description: "첫째 30→100만 / 둘째 50→200만 / 셋째이상 100→500만으로 대폭 상향", value: 1000000 },
 { category: "family", title: "자녀 학자금", description: "유치원~대학원 학자금 지원, 2자녀 출산 시 추가 지원", value: 18000000 },
 { category: "family", title: "출산·육아 휴직", description: "육아휴직 보장 + 자녀양육수당", value: 2000000 },
 { category: "health", title: "사내 병원/약국 + 가족 의료비", description: "임직원 및 가족 의료비 지원, 평택·기흥·수원 종합검진 무료", value: 2000000 },
 { category: "lifestyle", title: "삼시세끼 무료", description: "아침·점심·저녁 사내식당 무료 제공 (전 사업장)", value: 3600000 },
 { category: "lifestyle", title: "휴양소·콘도 지원", description: "전국 휴양소 + 콘도 회원권 무상 이용", value: 500000 },
 { category: "lifestyle", title: "변형교대 휴일근무 보상 개선 (2026 신규)", description: "변형교대 지정근무일 휴일근로 시 통상시급 4시간분 추가 지급", value: 1000000 },
 { category: "growth", title: "글로벌 MBA·박사 파견", description: "선발 시 학비 전액 + 급여 지급 (해외 명문대 위주)", value: 50000000 },
 { category: "growth", title: "사내 교육·자격증 지원", description: "직무 교육 + 어학·자격증 비용 환급", value: 1500000 },
 ],
 lastUpdated: "2026-05-24",
 },
 {
 id: "sk-hynix",
 name: { ko: "SK하이닉스", en: "SK Hynix" },
 industry: "Semiconductor",
 tier: "conglomerate",
 logo: "💾",
 description: "글로벌 메모리 반도체 2위, AI 반도체(HBM) 선두주자.",
 salary: {
 entry: {
 base: 53000000,
 incentive: { target: 50, max: 50, avgAmount: 28000000 }, // Recent boom
 },
 junior: {
 base: 72000000,
 incentive: { target: 50, max: 50, avgAmount: 38000000 },
 },
 senior: {
 base: 98000000,
 incentive: { target: 50, max: 50, avgAmount: 50000000 },
 },
 lead: {
 base: 135000000,
 incentive: { target: 50, max: 50, avgAmount: 70000000 },
 },
 executive: {
 base: 260000000,
 incentive: { target: 50, max: 50, avgAmount: 150000000 },
 },
 },
 // ─────────────────────────────────────────────────────────────
 // SK하이닉스 CL 직급 체계 — 보도값 기반(캐치·인크루트·언론 2026), 공개 자료 추정.
 // 직급 호칭은 TL(테크니컬 리더)로 통일. 기술사무직: CL2(사원)/CL3(대리)/CL4(과장·차장)/CL5(부장).
 // total(영끌)은 보도 직급별 연봉, base 는 회사 salary 블록과 정합. PS(영업이익 10% 재원)로 연도 변동 큼.
 // ─────────────────────────────────────────────────────────────
 careerLevels: [
 {
 group: "CL2 (사원·신입)",
 promotionNote: "대졸 기술사무직 신입 시작점(호칭 TL 통일). 평균 5~6년차 CL3 진급. PS·성과급에 따라 영끌 변동 큼.",
 salaryCapManwon: 8000,
 steps: [
 {
 label: "CL2 (1~2년차)",
 description: "대졸 기술사무직 신입. 보도 초봉 6,500~7,000만원(영끌)",
 baseManwon: 5300,
 totalManwon: 6800,
 },
 {
 label: "CL2 (3~5년차)",
 description: "사원 중반. 호봉 상승 + PS 비중 증가",
 baseManwon: 6000,
 totalManwon: 7800,
 },
 ],
 },
 {
 group: "CL3 (대리)",
 promotionNote: "보도 대리급 연봉 약 8,500만원(영끌). HBM 호황기 PS로 영끌 상향.",
 salaryCapManwon: 9000,
 steps: [
 {
 label: "CL3 (대리)",
 description: "대리 진급. 보도 영끌 약 8,500만원",
 baseManwon: 6500,
 totalManwon: 8500,
 isCapReached: true,
 },
 ],
 },
 {
 group: "CL4 (과장·차장)",
 promotionNote: "보도 과장·차장급 연봉 약 1억원(영끌). 핵심 실무·리더 구간.",
 salaryCapManwon: 11000,
 steps: [
 {
 label: "CL4 (과장)",
 description: "과장 진급. 보도 영끌 약 1억원",
 baseManwon: 7800,
 totalManwon: 10000,
 },
 {
 label: "CL4 (차장)",
 description: "차장. 사업부 핵심 인력",
 baseManwon: 8800,
 totalManwon: 11500,
 isCapReached: true,
 },
 ],
 },
 {
 group: "CL5 (부장·수석)",
 promotionNote: "보도 부장급 연봉 약 1억 3,000만원(영끌). 임원 진급 대기 구간.",
 salaryCapManwon: 14000,
 steps: [
 {
 label: "CL5 (부장)",
 description: "부장 진급. 보도 영끌 약 1억 3,000만원",
 baseManwon: 9800,
 totalManwon: 13000,
 isCapReached: true,
 },
 ],
 },
 ],
 workLife: {
 weeklyHours: { contract: 40, real: 46 },
 remoteWork: { policy: "hybrid", daysPerWeek: 1, description: "거점 오피스 활용 가능" },
 vacation: { days: 15, usageRate: 90 },
 },
 culture: {
 score: 8.5,
 keywords: ["수평적 지향", "성과공유", "해피프라이데이"],
 pros: ["해피프라이데이(월 2회 휴무)", "높은 성과급", "자유로운 연차 사용"],
 cons: ["이천/청주 근무", "반도체 사이클에 따른 성과급 변동"],
 },
 benefits: [
 { category: "lifestyle", title: "해피프라이데이", description: "월 2회 금요일 휴무 (주 4일 근무 효과)", value: 5000000 },
 { category: "financial", title: "PS (초과이익분배금)", description: "영업이익의 10% 재원 활용", value: 30000000 },
 { category: "family", title: "난임 시술 지원", description: "최대 1000만원 지원", value: 0 },
 ],
 lastUpdated: "2025-11-23",
 },
 {
 id: "naver",
 name: { ko: "네이버", en: "NAVER" },
 industry: "IT / Internet",
 tier: "unicorn",
 logo: "💚",
 description: "대한민국 대표 검색 포털 및 테크 기업.",
 salary: {
 entry: {
 base: 55000000,
 incentive: { target: 15, max: 30, avgAmount: 8000000 },
 stock: { type: "RSU", amount: 10000000, vesting: "3 years" },
 },
 junior: {
 base: 75000000,
 incentive: { target: 20, max: 40, avgAmount: 15000000 },
 stock: { type: "RSU", amount: 20000000, vesting: "3 years" },
 },
 senior: {
 base: 105000000,
 incentive: { target: 25, max: 50, avgAmount: 25000000 },
 stock: { type: "RSU", amount: 40000000, vesting: "3 years" },
 },
 lead: {
 base: 150000000,
 incentive: { target: 30, max: 60, avgAmount: 45000000 },
 stock: { type: "RSU", amount: 80000000, vesting: "3 years" },
 },
 executive: {
 base: 300000000,
 incentive: { target: 50, max: 100, avgAmount: 150000000 },
 },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 42 },
 remoteWork: { policy: "remote", description: "Type R(Remote) / Type O(Office) 선택 가능" },
 vacation: { days: 20, usageRate: 95 },
 },
 culture: {
 score: 9.0,
 keywords: ["자율", "수평", "기술중심", "워라밸"],
 pros: ["완전 자율 근무(재택 선택)", "눈치 안 보는 휴가", "최고의 동료"],
 cons: ["성과 압박", "개인주의 성향", "정체된 연봉 상승률"],
 },
 benefits: [
 { category: "growth", title: "업무 기기 지원", description: "최고사양 맥북/노트북 및 장비 지원", value: 3000000 },
 { category: "financial", title: "스톡그랜트", description: "매년 1천만원 상당 자사주 지급", value: 10000000 },
 { category: "lifestyle", title: "커넥티드 워크", description: "원격 근무 지원금 (월 15만원)", value: 1800000 },
 ],
 lastUpdated: "2025-11-23",
 },
 // 4. Kakao
 {
 id: "kakao",
 name: { ko: "카카오", en: "Kakao" },
 industry: "IT/Platform",
 tier: "conglomerate",
 logo: "🟡",
 description: "국민 메신저 카카오톡을 기반으로 한 대한민국 대표 모바일 생활 플랫폼 기업입니다.",
 salary: {
 entry: { base: 55000000, incentive: { target: 15, max: 30, avgAmount: 8000000 }, stock: { type: "RSU", amount: 10000000, vesting: "4 years" }, signOn: 0 },
 junior: { base: 65000000, incentive: { target: 15, max: 30, avgAmount: 10000000 }, stock: { type: "RSU", amount: 15000000, vesting: "4 years" } },
 senior: { base: 90000000, incentive: { target: 20, max: 40, avgAmount: 18000000 }, stock: { type: "RSU", amount: 30000000, vesting: "4 years" } },
 lead: { base: 130000000, incentive: { target: 25, max: 50, avgAmount: 30000000 }, stock: { type: "RSU", amount: 50000000, vesting: "4 years" } },
 executive: { base: 250000000, incentive: { target: 50, max: 100, avgAmount: 100000000 }, stock: { type: "RSU", amount: 100000000, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 42 },
 vacation: { days: 25, usageRate: 95 },
 remoteWork: { policy: "hybrid", description: "부서별 자율 근무제" },
 },
 benefits: [
 { category: "health", title: "안식휴가", description: "3년 근속 시 1개월 유급 휴가", value: 5000000 },
 { category: "financial", title: "대출 지원", description: "최대 3억 주택자금 대출 이자 지원", value: 4000000 },
 { category: "lifestyle", title: "점심/저녁 식대", description: "월 30만원 포인트 지급", value: 3600000 },
 ],
 culture: {
 score: 8.5,
 keywords: ["자율", "수평", "영어이름"],
 pros: ["자유로운 연차 사용", "3년마다 돌아오는 안식휴가", "수평적인 소통 문화"],
 cons: ["잦은 조직 개편", "부서바부서(케바케) 심함"],
 },
 lastUpdated: "2025-11-23",
 },
 // 5. Coupang
 {
 id: "coupang",
 name: { ko: "쿠팡", en: "Coupang" },
 industry: "E-commerce",
 tier: "unicorn",
 logo: "🚀",
 description: "로켓배송으로 쇼핑의 상식을 깬 글로벌 이커머스 기업입니다.",
 salary: {
 entry: { base: 60000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" }, signOn: 0 },
 junior: { base: 80000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" } },
 senior: { base: 120000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" } },
 lead: { base: 180000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" } },
 executive: { base: 350000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "RSU", amount: 0, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 45 },
 vacation: { days: 15, usageRate: 80 },
 remoteWork: { policy: "hybrid", description: "주 1~2회 재택 (직군별 상이)" },
 },
 benefits: [
 { category: "lifestyle", title: "쿠팡캐시", description: "연 100만원 상당 지급", value: 1000000 },
 { category: "financial", title: "단체상해보험", description: "본인 및 가족 의료비 지원", value: 1000000 },
 ],
 culture: {
 score: 7.8,
 keywords: ["치열함", "데이터", "글로벌"],
 pros: ["업계 최고 수준의 연봉", "글로벌 인재와 협업 기회", "빠른 성장 속도"],
 cons: ["높은 업무 강도", "성과 압박", "외국계 특유의 냉정함"],
 },
 lastUpdated: "2025-11-23",
 },
 // 6. Viva Republica (Toss)
 {
 id: "toss",
 name: { ko: "비바리퍼블리카 (토스)", en: "Viva Republica" },
 industry: "Fintech",
 tier: "unicorn",
 logo: "🔵",
 description: "금융의 모든 것을 토스에서. 대한민국 핀테크 혁신을 주도하는 유니콘입니다.",
 salary: {
 entry: { base: 65000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 100000000, vesting: "4 years" }, signOn: 20000000 },
 junior: { base: 80000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 100000000, vesting: "4 years" } },
 senior: { base: 120000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 200000000, vesting: "4 years" } },
 lead: { base: 180000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 300000000, vesting: "4 years" } },
 executive: { base: 300000000, incentive: { target: 0, max: 0, avgAmount: 0 }, stock: { type: "Option", amount: 500000000, vesting: "4 years" } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 50 },
 vacation: { days: 25, usageRate: 90 },
 remoteWork: { policy: "office", description: "오피스 퍼스트 (전원 출근)" },
 },
 benefits: [
 { category: "lifestyle", title: "식대/간식 무제한", description: "법인카드 식대 전액 지원", value: 6000000 },
 { category: "financial", title: "주택자금 대출", description: "1억 무이자 대출", value: 5000000 },
 { category: "lifestyle", title: "통신비 지원", description: "월 10만원 지원", value: 1200000 },
 ],
 culture: {
 score: 8.2,
 keywords: ["몰입", "자율", "책임"],
 pros: ["업계 최고 대우 (사이닝, 스톡)", "최고의 동료들", "식대 무제한 등 실질적 복지"],
 cons: ["높은 업무 강도 (워라밸 부족)", "오피스 출근 필수", "치열한 생존 경쟁"],
 },
 lastUpdated: "2025-11-23",
 },
 // 7. Hyundai Motor
 {
 id: "hyundai",
 name: { ko: "현대자동차", en: "Hyundai Motor" },
 industry: "Automotive",
 tier: "conglomerate",
 logo: "🚙",
 description: "글로벌 Top 3 완성차 업체로 도약한 대한민국 자동차 산업의 심장입니다.",
 salary: {
 entry: { base: 55000000, incentive: { target: 30, max: 50, avgAmount: 20000000 }, signOn: 0 },
 junior: { base: 65000000, incentive: { target: 30, max: 50, avgAmount: 25000000 } },
 senior: { base: 85000000, incentive: { target: 30, max: 50, avgAmount: 35000000 } },
 lead: { base: 110000000, incentive: { target: 30, max: 50, avgAmount: 45000000 } },
 executive: { base: 200000000, incentive: { target: 50, max: 100, avgAmount: 100000000 } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 40 },
 vacation: { days: 20, usageRate: 95 },
 remoteWork: { policy: "hybrid", description: "주 1~2회 재택 권장" },
 },
 benefits: [
 { category: "lifestyle", title: "차량 할인", description: "최대 30% 자사 차량 할인 (근속별 상이)", value: 10000000 },
 { category: "lifestyle", title: "삼시세끼 제공", description: "사내 식당 무료", value: 3000000 },
 ],
 culture: {
 score: 8.8,
 keywords: ["안정", "변화", "워라밸"],
 pros: ["강력한 노조와 고용 안정성", "높은 성과급", "차량 할인 혜택"],
 cons: ["수직적인 군대 문화 (부서바부서)", "보수적인 의사결정"],
 },
 lastUpdated: "2025-11-23",
 },
 // 8. LG Energy Solution
 {
 id: "lgensol",
 name: { ko: "LG에너지솔루션", en: "LG Energy Solution" },
 industry: "Battery",
 tier: "conglomerate",
 logo: "🔋",
 description:
 "글로벌 배터리 시장을 선도하는 2차전지 분야의 세계적 기업. LG화학에서 분사한 후 코스피 시가총액 상위권으로 직진. 전기차(EV) 배터리·ESS·소형 배터리 사업 + GM·스텔란티스·혼다 등 글로벌 합작 공장 운영. 신입 영끌 6,800만원, 시니어 1억원 수준.",
 salary: {
 entry: { base: 53000000, incentive: { target: 20, max: 40, avgAmount: 15000000 }, signOn: 0 },
 junior: { base: 62000000, incentive: { target: 20, max: 40, avgAmount: 18000000 } },
 senior: { base: 82000000, incentive: { target: 20, max: 40, avgAmount: 25000000 } },
 lead: { base: 105000000, incentive: { target: 20, max: 40, avgAmount: 35000000 } },
 executive: { base: 190000000, incentive: { target: 40, max: 80, avgAmount: 80000000 } },
 },
 workLife: {
 weeklyHours: { contract: 40, real: 42 },
 vacation: { days: 20, usageRate: 90 },
 remoteWork: { policy: "hybrid", description: "원격 근무 활성화" },
 },
 benefits: [
 { category: "financial", title: "복지 포인트", description: "연 200만원 지급", value: 2000000 },
 { category: "health", title: "의료비 지원", description: "본인/가족 실비 지원, 종합검진 연 1회", value: 1000000 },
 { category: "financial", title: "성과급 PS", description: "전년 실적 연동, 호황기 기본급 400~700% 사례", value: 18000000 },
 { category: "family", title: "사택·기숙사", description: "오창·대전 근무자 사택 + 자녀 학자금", value: 12000000 },
 { category: "growth", title: "해외 법인 파견", description: "미국·헝가리·인도네시아 공장 파견 기회", value: 0 },
 ],
 culture: {
 score: 8.3,
 keywords: ["성장", "글로벌", "인화", "전기차배터리", "GM합작", "ESS"],
 pros: [
 "폭발적인 산업 성장성 (EV 시장 확대)",
 "LG 특유의 인화 문화 + 워라밸 비교적 양호",
 "높은 성과급 기대감 (호황기 기본급 400~700%)",
 "글로벌 합작 공장 다수로 해외 파견 기회",
 "코스피 상위주 + 우리사주 매력",
 ],
 cons: [
 "오창·대전 등 지방 근무 가능성",
 "급격한 성장에 따른 성장통·조직 변화 잦음",
 "전기차 캐즘(수요 둔화) 시 성과급 변동성",
 "공장 근무 시 교대 근무 비중",
 ],
 },
 lastUpdated: "2026-05-22",
 },
];
