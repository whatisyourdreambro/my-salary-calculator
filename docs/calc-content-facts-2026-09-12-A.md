# 간이 계산기 본문 사실 검증 로그 — 배치 A (S3-1 · 2026-09-12)

- 대상: `src/lib/simpleCalculators/enrichments.ts` 의 19종 — `details`(신설)·`caveats`·`faqs`·`sources`. 형식은 `docs/calc-content-writing-guide-2026-09-12.md` §4.
- 예시 계산은 `npx tsx scripts/calc-default-result.ts <slug>` 출력, 기본값이 아닌 입력의 값은 같은 레지스트리의 `compute()` 를 직접 호출해 얻었다(로그 status `computed`). 출처 페이지는 브라우저 UA 로 GET 하여 상태 코드·본문을 확인했고, law.go.kr 조문 URL 은 200 응답의 셸이 iframe(`/LSW/lsSideInfoP.do`)으로 조문을 싣는 구조라 그 iframe 본문에서 조문 텍스트와 시행일을 확인했다.
- status 표기: `200·<규정 연도>` — 페이지에 보이는 시행일·고시 연도·기준일. 연도 표기가 없는 참고 페이지는 `200·연도 미표기` 로 적고 `sources` 에는 쓰지 않았다(본문 근거의 보조 확인용).
- `formula≠compute` 2건: `comprehensive-property-tax-quick`(종전 공식의 '재산세 중복분 공제' 항은 compute 에 없음 → 항 삭제), `loan-affordability`(종전 근사식 ≠ compute 의 원리금균등 역산 n=360 → 실제 산식으로 교체).

| slug | claim | source URL | fetched date | status |
|---|---|---|---|---|
| `gift-tax-quick` | 기본값 증여재산 200,000,000원·공제 한도 50,000,000원 → 예상 증여세 20,000,000원·과세표준 150,000,000원 | compute() | 2026-09-12 | computed |
| `gift-tax-quick` | 증여재산 공제: 배우자 6억원, 직계존속 5천만원(미성년자 2천만원), 직계비속 5천만원, 4촌 이내 혈족·3촌 이내 인척 1천만원, 증여 전 10년 이내 공제액과 합산 | https://www.law.go.kr/법령/상속세및증여세법/제53조 | 2026-09-12 | 200·2025 (시행 2025.10.1) |
| `gift-tax-quick` | 세율 1억원 이하 10%, 5억원 이하 20%, 10억원 이하 30%, 30억원 이하 40%, 30억원 초과 50% | https://www.law.go.kr/법령/상속세및증여세법/제26조 | 2026-09-12 | 200·2025 |
| `gift-tax-quick` | 증여세는 제26조 세율을 적용(제56조) | https://www.law.go.kr/법령/상속세및증여세법/제56조 | 2026-09-12 | 200·2025 |
| `gift-tax-quick` | 누진공제 1천만원·6천만원·1억 6천만원·4억 6천만원, 증여일 전 10년 이내 동일인 증여 1천만원 이상 합산 | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6533&cntntsId=7960 | 2026-09-12 | 200·연도 미표기 |
| `gift-tax-quick` | 혼인·출산 증여재산 공제는 제53조의2 로 별도(제53조 본문 인용) | https://www.law.go.kr/법령/상속세및증여세법/제53조 | 2026-09-12 | 200·2025 |
| `comprehensive-property-tax-quick` | 기본값 주택 공시가격 합계 1,500,000,000원 → 종부세(연) 900,000원·공정시장가액 180,000,000원 | compute() | 2026-09-12 | computed |
| `comprehensive-property-tax-quick` | 공시가격 합계 1,200,000,000원 → 종부세 0원 | compute() | 2026-09-12 | computed |
| `comprehensive-property-tax-quick` | 1세대 1주택자 12억원 공제·그 외 9억원·법인 0원, 공정시장가액비율 60~100% 범위, 합산배제 주택 9월 16일~30일 보유현황 신고(제8조 제3항) | https://www.law.go.kr/법령/종합부동산세법/제8조 | 2026-09-12 | 200·2026 |
| `comprehensive-property-tax-quick` | 공정시장가액비율 100분의 60 | https://www.law.go.kr/법령/종합부동산세법시행령/제2조의4 | 2026-09-12 | 200·2026 |
| `comprehensive-property-tax-quick` | 2023년 귀속분 이후 개인 세율: 2주택 이하 0.5/0.7/1.0/1.3/1.5/2.0/2.7%, 3주택 이상 0.5/0.7/1.0/2.0/3.0/4.0/5.0% (과표 3억·6억·12억·25억·50억·94억 구간) | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2354&cntntsId=7736 | 2026-09-12 | 200·2023 |
| `comprehensive-property-tax-quick` | 주택분 재산세액 공제(제9조 제3항), 1세대 1주택자 연령·보유기간 세액공제 합계 100분의 80 한도(제9조 제5항) | https://www.law.go.kr/법령/종합부동산세법/제9조 | 2026-09-12 | 200·2026 |
| `comprehensive-property-tax-quick` | 종전 formula 의 '- 재산세 중복분 공제' 항은 compute 에 없음 → formula 에서 삭제하고 미반영을 명시 | compute() | 2026-09-12 | formula≠compute |
| `property-tax-quick` | 기본값 공시가격 500,000,000원 → 재산세(연) 570,000원·과세표준(60%) 300,000,000원·도시지역분 420,000원 | compute() | 2026-09-12 | computed |
| `property-tax-quick` | 공시가격 300,000,000원 → 재산세 270,000원·과세표준 180,000,000원·도시지역분 252,000원 | compute() | 2026-09-12 | computed |
| `property-tax-quick` | 주택 공정시장가액비율 100분의 60, 2026년 납세의무 성립 1세대 1주택 43/44/45%(3억·6억 구간) | https://www.law.go.kr/법령/지방세법시행령/제109조 | 2026-09-12 | 200·2026 (시행 2026.7.1) |
| `property-tax-quick` | 주택 표준세율 6천만원 이하 1/1000, 1억5천만원 이하 6만원+초과분 1.5/1000, 3억원 이하 195,000원+2.5/1000, 3억원 초과 570,000원+4/1000; 1세대 1주택(9억 이하) 특례세율 0.5~3.5/1000 | https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1259&ccfNo=4&cciNo=1&cnpClsNo=3 | 2026-09-12 | 200·2026 (2026.8.15 기준) |
| `property-tax-quick` | 분납: 250만원 초과 시 초과분(500만원 초과 시 세액의 50% 이하)을 납부기한 후 3개월 이내 | https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1259&ccfNo=4&cciNo=1&cnpClsNo=3 | 2026-09-12 | 200·2026 |
| `property-tax-quick` | 도시지역분 과세표준의 1천분의 1.4, 조례로 1천분의 2.3 까지 | https://www.law.go.kr/법령/지방세법/제112조 | 2026-09-12 | 200·2026 |
| `property-tax-quick` | 과세표준상한액(제110조 제3항), 조례로 표준세율의 100분의 50 범위 가감(제111조 제3항) | https://www.law.go.kr/법령/지방세법/제110조 · https://www.law.go.kr/법령/지방세법/제111조 | 2026-09-12 | 200·2026 |
| `vat-quick` | 기본값 공급가액 1,000,000원 → VAT 100,000원·총 청구액 1,100,000원 | compute() | 2026-09-12 | computed |
| `vat-quick` | 공급가액 5,000,000원 → VAT 500,000원·총 청구액 5,500,000원 | compute() | 2026-09-12 | computed |
| `vat-quick` | 부가가치세 세율 10퍼센트 | https://www.law.go.kr/법령/부가가치세법/제30조 | 2026-09-12 | 200·2026 (시행 2026.1.2) |
| `vat-quick` | 간이과세 기준은 대통령령(제61조 제1항) → 1억4백만원(시행령 제109조 제1항) | https://www.law.go.kr/법령/부가가치세법/제61조 · https://www.law.go.kr/법령/부가가치세법시행령/제109조 | 2026-09-12 | 200·2026 |
| `vat-quick` | 일반과세자 모든 업종 10%; 간이과세자 업종별 부가가치율(2021.7.1 이후) 소매·음식점 15%, 제조 20%, 숙박 25%, 건설·정보통신 30%, 금융·전문서비스 40% | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2275&cntntsId=7696 | 2026-09-12 | 200·2021 |
| `earned-income-tax-quick` | 기본값 월 급여 4,000,000원·부양가족 1명 → 월 원천징수 190,125원·월 지방소득세 19,013원·연 결정세액 2,281,500원·연 지방소득세 228,150원·연 과세표준 28,010,000원 | compute() | 2026-09-12 | computed |
| `earned-income-tax-quick` | 월 급여 4,000,000원·부양가족 3명 → 월 원천징수 122,875원(1명 대비 67,250원 감소) | compute() | 2026-09-12 | computed |
| `earned-income-tax-quick` | 매월분 근로소득은 근로소득 간이세액표에 따라 원천징수 | https://www.law.go.kr/법령/소득세법/제134조 | 2026-09-12 | 200·2026 |
| `earned-income-tax-quick` | 종합소득 기본세율 조문(제55조 제1항) | https://www.law.go.kr/법령/소득세법/제55조 | 2026-09-12 | 200·2026 |
| `earned-income-tax-quick` | 개인지방소득세 = 원천징수 소득세의 100분의 10 특별징수 | https://www.law.go.kr/법령/지방세법/제103조의13 | 2026-09-12 | 200·2026 |
| `earned-income-tax-quick` | 간이세액표 비율 80%·100%·120% 선택, 8세 이상 20세 이하 자녀 감액 | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6583&cntntsId=7862 | 2026-09-12 | 200·연도 미표기 |
| `earned-income-tax-quick` | 국민연금 근로자 부담 보험료율 4.75%(2026) | https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0095M0.do | 2026-09-12 | 200·2026 (EUC-KR 페이지, 4.75%·2026 표기 확인) |
| `holiday-allowance-quick` | 기본값 시급 10,320원 → 주 1회 주휴수당 82,560원·월 환산분(209시간) 359,480원 | compute() | 2026-09-12 | computed |
| `holiday-allowance-quick` | 1주에 평균 1회 이상의 유급휴일 보장 | https://www.law.go.kr/법령/근로기준법/제55조 | 2026-09-12 | 200·2026 (시행 2026.8.20) |
| `holiday-allowance-quick` | 2026년 최저임금 시급 10,320원·일급 82,560원(8시간)·월급 2,156,880원(209시간), 고시 2025.8.5 | https://www.minimumwage.go.kr/minWage/policy/decisionMain.do | 2026-09-12 | 200·2026 |
| `holiday-allowance-quick` | 유급휴일은 1주 소정근로일을 개근한 자에게 | https://www.law.go.kr/법령/근로기준법시행령/제30조 | 2026-09-12 | 200·2025 (시행 2025.10.23) |
| `holiday-allowance-quick` | 4주 평균 1주 소정근로시간 15시간 미만은 제55조·제60조 미적용 | https://www.law.go.kr/법령/근로기준법/제18조 | 2026-09-12 | 200·2026 |
| `annual-leave-pay-quick` | 기본값 월급 3,000,000원·남은 연차 5일 → 연차수당 574,163원·1일 통상임금 114,833원 | compute() | 2026-09-12 | computed |
| `annual-leave-pay-quick` | 월급 3,000,000원·남은 연차 15일 → 연차수당 1,722,488원 | compute() | 2026-09-12 | computed |
| `annual-leave-pay-quick` | 1년 80% 이상 출근 15일, 1년 미만·80% 미만은 1개월 개근 1일, 3년 이상 2년마다 1일 가산·25일 한도, 휴가 기간 통상임금 또는 평균임금 | https://www.law.go.kr/법령/근로기준법/제60조 | 2026-09-12 | 200·2026 |
| `annual-leave-pay-quick` | 월급의 시간급 환산: 1주 통상임금 산정 기준시간 × 1년 평균 주 수 ÷ 12 | https://www.law.go.kr/법령/근로기준법시행령/제6조 | 2026-09-12 | 200·2025 |
| `annual-leave-pay-quick` | 월 209시간 = 최저임금 월급 환산 기준(고시 209시간 기준) | https://www.minimumwage.go.kr/minWage/policy/decisionMain.do | 2026-09-12 | 200·2026 |
| `annual-leave-pay-quick` | 4주 평균 주 15시간 미만은 제60조 미적용 | https://www.law.go.kr/법령/근로기준법/제18조 | 2026-09-12 | 200·2026 |
