# 간이 계산기 본문 사실 검증 로그 B (S3-1 · 2026-09-12)

- 범위: `src/lib/simpleCalculators/enrichments-ext-a.ts` 의 21종 — level-principal-payment, simple-interest-quick, stock-pl-quick, daily-pay, monthly-installment, bullet-loan, loan-monthly-payment, real-return-quick, weekend-pay-quick, rule-of-72-quick, loan-total-interest, stock-capital-gains-quick, fire-target, savings-goal-time, import-tax-quick, dollar-cost-average, portfolio-allocation, interest-tax-quick, vat-reverse-quick, bond-yield-quick, inflation-impact-quick. (yearly-to-hourly·weekly-pay 는 다른 에이전트 담당 — 무접촉)
- 수정 필드: `details`(신설)·`caveats`(전면 개별화)·`faqs`(기존 3개 답변 120자 이상으로 보강 + 검색 의도형 4번째 추가)·`sources`(2건). title·description·explanation·formula·fields·compute·relatedSlugs 무접촉.
- 형식: 규칙서 §4. 1행 = 주장 1개. `computed` = `npx tsx scripts/calc-default-result.ts <slug>` 출력 그대로(표기는 SimpleCalculatorView formatNumber 규칙: 원 = 반올림 정수·천 단위 콤마, % = 소수 2자리, 기타 단위 소수 최대 2자리). fetched date 는 KST.
- 출처 검증 방법: 모든 URL 은 2026-09-12 에 GET 200 확인(WebFetch 본문 확인 + curl 브라우저 UA 상태코드). law.go.kr 의 가독 URL(`/법령/<법령명>/제n조`)은 본문을 iframe 으로 싣기 때문에 조문 원문과 시행일은 같은 도메인의 `LSW/lsSideInfoP.do?lsiSeq=…&joNo=…` 응답에서 확인했다(각 행의 시행일이 그 확인값). 연도가 표기되지 않은 상시 안내 페이지는 `200·연도 미표기(2026 현행 확인)` 으로 적고 sources 제목의 연도는 확인 연도(2026)로 썼다.
- 허용 목록 밖 호스트: 관세청(customs.go.kr) 페이지 2건은 기존 FAQ 문장(미국발 200달러)의 사실 검증에만 썼고 sources 에는 넣지 않았다(후보 호스트로 보고). import-tax-quick 의 sources 는 규칙을 직접 적은 법령 원문(law.go.kr) 2건으로 채웠다.

| slug | claim | source URL | fetched date | status |
|---|---|---|---|---|
| `interest-tax-quick` | 기본값 `이자 수령액 1,000,000원` → `원천징수세` 154,000원 · `실수령 이자` 846,000원 | compute() | 2026-09-12 | computed |
| `interest-tax-quick` | 소득세법 제129조(2026년 1월 1일 시행)는 비영업대금의 이익을 제외한 일반 이자소득의 원천징수세율을 100분의 14로 정함(비영업대금의 이익 100분의 25) | https://www.law.go.kr/법령/소득세법/제129조 | 2026-09-12 | 200·2026 (시행 2026. 1. 1., 법률 제21221호) |
| `interest-tax-quick` | 국세청 원천징수 세율표: 그 밖의 이자소득 14%, 비영업대금의 이익 25%, 그 밖의 배당소득 14% | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2220&cntntsId=7703 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `interest-tax-quick` | 이자소득세 14%에 지방소득세(주민세) 1.4%가 더해져 15.4% 원천징수 | https://fine.fss.or.kr/main/prc/dp/sub/dp005.jsp?menuNo=900238 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `interest-tax-quick` | 소득세법 제14조 제3항 제6호: 이자·배당소득 합계 2천만원 이하이면서 원천징수된 소득은 종합과세 제외(이자소득등의 종합과세기준금액) | https://www.law.go.kr/법령/소득세법/제14조 | 2026-09-12 | 200·2026 |
| `interest-tax-quick` | (FAQ) 비과세종합저축은 만 65세 이상 등 대상, 원금 5천만원까지 이자 비과세 | https://fine.fss.or.kr/main/prc/dp/sub/dp005.jsp?menuNo=900238 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `vat-reverse-quick` | 기본값 `VAT 포함 총액 1,100,000원` → `공급가액` 1,000,000원 · `부가세 (10%)` 100,000원 | compute() | 2026-09-12 | computed |
| `vat-reverse-quick` | 부가가치세법 제30조: 부가가치세의 세율은 10퍼센트 | https://www.law.go.kr/법령/부가가치세법/제30조 | 2026-09-12 | 200·2026 (시행 2026. 1. 2., 법률 제21065호) |
| `vat-reverse-quick` | 국세청 부가가치세 세율 안내: 일반과세자 모든 업종 10% | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2275&cntntsId=7696 | 2026-09-12 | 200·2021(간이과세 부가가치율 개정 기준일 2021. 7. 1. 표기) |
| `vat-reverse-quick` | 간이과세자는 2021년 7월 1일 이후 업종별 부가가치율 15%~40%에 세율 10%를 곱해 납부세액 계산 | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2275&cntntsId=7696 | 2026-09-12 | 200·2021 |
| `import-tax-quick` | 기본값 `물품가 + 운송비 (CIF) 200,000원`·`관세율 8%` → `총 세금 (관세+VAT)` 37,600원 · `관세` 16,000원 · `부가세` 21,600원 | compute() | 2026-09-12 | computed |
| `import-tax-quick` | 부가가치세법 제29조 제2항: 수입 재화의 과세표준 = 관세의 과세가격 + 관세 + 개별소비세 + 주세 + 교육세 + 농어촌특별세 + 교통·에너지·환경세 | https://www.law.go.kr/법령/부가가치세법/제29조 | 2026-09-12 | 200·2026 (시행 2026. 1. 2.) |
| `import-tax-quick` | 관세법 시행규칙 제45조 제1항 제1호: 물품가격 미화 150달러 이하 자가사용 물품은 관세 면제, 반복·분할 수입으로 관세청장이 정하는 기준에 해당하면 제외 | https://www.law.go.kr/법령/관세법 시행규칙/제45조 | 2026-09-12 | 200·2026 (시행 2026. 7. 31.) |
| `import-tax-quick` | (기존 FAQ 유지 근거) 목록통관 기준 물품가격 미화 150달러(미국발 200달러) 이하 | https://www.customs.go.kr/call/ad/crmcc/selectFaqViewPage.do?mi=6822&cnslKnwlSrno=463 | 2026-09-12 | 200·연도 미표기 — 허용 목록 외 호스트, sources 미등재(검증용) |
| `import-tax-quick` | (검증용) 소액면세 한도 물품가격 150달러, 근거 관세법 제94조 | https://www.customs.go.kr/call/ad/crmcc/selectFaqViewPage.do?mi=6822&cnslKnwlSrno=512 | 2026-09-12 | 200·연도 미표기 — 허용 목록 외 호스트, sources 미등재 |
| `stock-capital-gains-quick` | 기본값 `매수가 합계 10,000,000원`·`매도가 합계 15,000,000원` → `예상 양도세 (22%)` 550,000원 · `양도차익` 5,000,000원 · `기본공제 250만 차감` 2,500,000원 | compute() | 2026-09-12 | computed |
| `stock-capital-gains-quick` | 소득세법 제104조 제1항 제12호: 국외주식(제94조제1항제3호다목) 양도소득과세표준의 100분의 20 | https://www.law.go.kr/법령/소득세법/제104조 | 2026-09-12 | 200·2026 (시행 2026. 1. 1.) |
| `stock-capital-gains-quick` | 지방세법 제103조의3 제1항 제12호: 국외주식 양도소득 개인지방소득세 과세표준의 1천분의 20 → 합계 22% | https://www.law.go.kr/법령/지방세법/제103조의3 | 2026-09-12 | 200·2026 (시행 2026. 1. 1.) |
| `stock-capital-gains-quick` | 소득세법 제103조 제1항: 양도소득 기본공제 소득별 연 250만원 | https://www.law.go.kr/법령/소득세법/제103조 | 2026-09-12 | 200·2026 |
| `stock-capital-gains-quick` | 국세청 세액계산요령: 양도일까지 계속 5년 이상 국내 주소·거소를 둔 거주자의 국외주식 과세, 기본공제는 국내·국외주식 합산 연 250만원, 국내·국외주식 손익통산 허용 | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=8800&mi=12274 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `daily-pay` | 기본값 `연봉 50,000,000원`·`연 근무일수 250일` → `일급` 200,000원 | compute() | 2026-09-12 | computed |
| `daily-pay` | 근로기준법 제2조 제1항 제6호: 평균임금 = 사유 발생일 이전 3개월 임금 총액 ÷ 그 기간의 총일수; 제2항: 통상임금보다 적으면 통상임금을 평균임금으로 | https://www.law.go.kr/법령/근로기준법/제2조 | 2026-09-12 | 200·2026 (시행 2026. 8. 20., 법률 제21373호) |
| `daily-pay` | 근로기준법 시행령 제6조 제3항: 통상임금을 일급으로 산정할 때 시간급 금액 × 1일 소정근로시간 수 | https://www.law.go.kr/법령/근로기준법 시행령/제6조 | 2026-09-12 | 200·2025 (시행 2025. 10. 23.) |
| `daily-pay` | (FAQ) 월 소정근로시간 209시간 | 저장소 상수 `MONTHLY_HOURS`(src/config/minimumWage) | 2026-09-12 | computed(저장소 정본) |
| `weekend-pay-quick` | 기본값 `통상시급 15,000원`·`휴일 근무시간 8시간` → `휴일 수당` 180,000원 · `8시간 이내 (1.5배)` 180,000원 · `8시간 초과 (2배)` 0원 | compute() | 2026-09-12 | computed |
| `weekend-pay-quick` | 근로기준법 제56조 제2항: 8시간 이내의 휴일근로 통상임금의 100분의 50, 8시간을 초과한 휴일근로 100분의 100 가산 | https://www.law.go.kr/법령/근로기준법/제56조 | 2026-09-12 | 200·2026 (시행 2026. 8. 20.) |
| `weekend-pay-quick` | 고용노동부 인터넷상담 회신: 휴일근로 8시간 이내 100분의 50 이상, 8시간 초과 100분의 100 가산(제56조) | https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202503100929369700026 | 2026-09-12 | 200·2025(상담 ID 연도, 본문 날짜 미표기) |
| `weekend-pay-quick` | 근로기준법 제11조: 상시 5명 이상 사업장 적용, 상시 4명 이하 사업장은 대통령령으로 정하는 일부 규정만 적용 | https://www.law.go.kr/법령/근로기준법/제11조 | 2026-09-12 | 200·2026 |
| `weekend-pay-quick` | (FAQ) 상시 5인 미만 사업장에는 제56조 가산수당 미적용(제55조 주휴일은 적용, 추가 근로 자체의 임금은 지급) | https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202205231448099101000 | 2026-09-12 | 200·2022(상담 ID 연도) |
| `loan-monthly-payment` | 기본값 `대출액 100,000,000원`·`연이자율 4%`·`기간 10년` → `월 상환액` 1,012,451원 · `총 상환액` 121,494,166원 · `총 이자` 21,494,166원 | compute() | 2026-09-12 | computed |
| `loan-monthly-payment` | 파인: 원리금균등분할상환 = 만기까지의 원금과 이자를 미리 계산해 매월 일정한 금액 상환, 부채관리 편리하나 남은 원금에 이자가 붙어 원금균등보다 이자 많음 | https://fine.fss.or.kr/main/prc/lo/sub/lo005.jsp?menuNo=9000287 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `loan-monthly-payment` | 한국주택금융공사 보금자리론 FAQ: 원리금균등은 원금과 이자 합계가 매월 일정, 초기 이자 비중 높음 | https://www.hf.go.kr/ko/sub01/sub01_07_01.do?mode=list&pagerLimit=10&pager.offset=70 | 2026-09-12 | 200·2025 (FAQ 아코디언, 수수료 기준일 2025. 4. 1. 표기) |
| `loan-monthly-payment` | 보금자리론 중도상환수수료 = 중도상환원금 × 수수료율 × (3년 − 경과기간) ÷ 3년, 2025. 4. 1. 이후 최대 0.5% | https://www.hf.go.kr/ko/sub01/sub01_07_01.do?mode=list&pagerLimit=10&pager.offset=70 | 2026-09-12 | 200·2025 |
| `loan-monthly-payment` | (caveat) COFIX 는 변동금리 대출의 기준금리, 신규취급액·잔액·신 잔액·단기 4종, 매월 15일 공시 | https://portal.kfb.or.kr/compare/cofix_overview.php | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `loan-total-interest` | 기본값 `대출액 100,000,000원`·`연이자율 4%`·`기간 30년` → `총 이자` 71,869,506원 · `원금 대비 비율` 71.87% | compute() | 2026-09-12 | computed |
| `loan-total-interest` | 파인: 이자율이 같아도 상환방법에 따라 이자부담액이 달라지므로 상환부담을 고려해 선택 | https://fine.fss.or.kr/main/prc/lo/sub/lo005.jsp?menuNo=9000287 | 2026-09-12 | 200·연도 미표기 |
| `loan-total-interest` | 금융감독원 주택담보대출 계산기: 원리금균등·원금균등·만기일시 선택, 만기까지 고정금리 가정 예시 상환금액, 실제와 차이 가능 | https://www.fss.or.kr/fss/cvpl/houseMrtggLonCalc/list.do?menuNo=200640 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `loan-total-interest` | (FAQ) 실행 후 3년 안에는 중도상환수수료가 붙을 수 있음(보금자리론 산식) | https://www.hf.go.kr/ko/sub01/sub01_07_01.do?mode=list&pagerLimit=10&pager.offset=70 | 2026-09-12 | 200·2025 |
| `level-principal-payment` | 기본값 `대출액 100,000,000원`·`연이자율 4%`·`기간 10년` → `초기 월 상환액` 1,166,667원 · `월 원금` 833,333원 · `총 이자` 20,166,667원 | compute() | 2026-09-12 | computed |
| `level-principal-payment` | 총 이자 = 첫 달 이자 × (회차 수 + 1) ÷ 2 — 매달 같은 원금을 갚을 때 잔액 이자의 등차수열 합(정확식) | compute() 검토 | 2026-09-12 | computed (formula 의 ≈ 표기는 보수적 표기, formula≠compute 아님) |
| `level-principal-payment` | 보금자리론 FAQ: 원금균등(체감식) = 원금을 대출기간에 균등 분할해 매월 일정 원금 상환, 이자는 매월 줄어든 잔액에 납부, 초기 부담 크고 회차 진행에 따라 감소; 체증식은 만 40세 미만 | https://www.hf.go.kr/ko/sub01/sub01_07_01.do?mode=list&pagerLimit=10&pager.offset=70 | 2026-09-12 | 200·2025 |
| `level-principal-payment` | 금융감독원 주택담보대출 계산기: 원금균등상환 선택지, 고정금리 가정 예시 금액 | https://www.fss.or.kr/fss/cvpl/houseMrtggLonCalc/list.do?menuNo=200640 | 2026-09-12 | 200·연도 미표기 |
| `bullet-loan` | 기본값 `대출액 100,000,000원`·`연이자율 4%`·`기간 5년` → `월 이자` 333,333원 · `총 이자` 20,000,000원 · `만기 시 원금 상환` 100,000,000원 | compute() | 2026-09-12 | computed |
| `bullet-loan` | 파인: 만기일시상환 = 대출기간 동안 이자만 내다가 만기일에 원금을 모두 상환 | https://fine.fss.or.kr/main/prc/lo/sub/lo005.jsp?menuNo=9000287 | 2026-09-12 | 200·연도 미표기 |
| `bullet-loan` | 금융상품한눈에 전세자금대출 비교공시: 상환방식 만기일시상환·원리금분할상환·원금분할상환, 금리방식 고정·변동, 전월 취급 평균금리 = 공시일 직전월 신규 취급 대출의 가중평균 | https://finlife.fss.or.kr/finlife/ldng/lfstsFunds/list.do?menuNo=700008 | 2026-09-12 | 200·2026(월별 공시, 현행) |
| `monthly-installment` | 기본값 `할부 원금 5,000,000원`·`할부 수수료율 12%`·`할부 개월 12개월` → `월 납부액` 444,244원 · `총 납부액` 5,330,927원 · `총 수수료(이자)` 330,927원 | compute() | 2026-09-12 | computed |
| `monthly-installment` | (FAQ) 총 수수료 330,927원은 원금 5,000,000원의 약 6.6% | compute() 파생(330,927 ÷ 5,000,000) | 2026-09-12 | computed |
| `monthly-installment` | 수수료율 0% 입력 시 원금 ÷ 개월 균등분할 | batch1.ts compute 가드 | 2026-09-12 | computed |
| `monthly-installment` | 신용카드가이드: 할부 이용기간 구간별(2개월, 3개월, 4~5개월, 6~9개월) 동일 금리, 카드사별 2~3개월 무이자 할부 가맹점, 구입일·인도일부터 7일 이내 철회(하자 여부 무관), 항변권 | https://www.fss.or.kr/fss/main/contents.do?menuNo=200499 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `monthly-installment` | 할부거래에 관한 법률 제8조 제1항: 계약서를 받은 날부터 7일(재화 공급이 늦으면 공급받은 날부터 7일) 이내 청약 철회 | https://www.law.go.kr/법령/할부거래에 관한 법률/제8조 | 2026-09-12 | 200·2026 개정(가독 URL 표시본은 시행 2027. 9. 9., 법률 제21906호 2026. 9. 8. — 7일 규정은 개정 전후 동일, fss 가이드에도 동일 기재) |
| `simple-interest-quick` | 기본값 `원금 10,000,000원`·`연 이자율 4%`·`기간 5년` → `총 이자` 2,000,000원 · `만기 자산` 12,000,000원 | compute() | 2026-09-12 | computed |
| `simple-interest-quick` | e-금융교육센터 성인을 위한 실용금융(3): 단리 = 원금에 대해서만 약정 이자율 적용, 복리 = 원금뿐 아니라 이자에도 이자; 금융회사가 14%(지방소득세 포함 15.4%) 원천징수; 개발연도 2023 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=618&menuNo=300017 | 2026-09-12 | 200·2023 |
| `simple-interest-quick` | 파인 예금 꿀팁: 단리는 원금에 대해서만, 복리는 일정 기간마다 이자를 원금에 합산, 금액이 크고 기간이 길수록 복리 유리; 이자소득세 14.0% + 주민세 1.4% | https://fine.fss.or.kr/main/prc/dp/sub/dp005.jsp?menuNo=900238 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `rule-of-72-quick` | 기본값 `연 수익률 7%` → `자산 2배 되는 시간` 10.29년(72 ÷ 7); 0% 이하 입력 시 note 만 표시 | compute() | 2026-09-12 | computed |
| `rule-of-72-quick` | e-금융교육센터 성인을 위한 실용금융(3): 72를 수익률로 나누면 원금이 두 배로 불어나는 데 걸리는 기간 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=618&menuNo=300017 | 2026-09-12 | 200·2023 |
| `rule-of-72-quick` | 파인 예금 꿀팁: 복리 = 일정 기간마다 이자를 원금에 합산 | https://fine.fss.or.kr/main/prc/dp/sub/dp005.jsp?menuNo=900238 | 2026-09-12 | 200·연도 미표기 |
| `rule-of-72-quick` | (FAQ) 한국은행 물가안정목표 2%(2019년 이후) 입력 시 72 ÷ 2 = 36년 | https://www.bok.or.kr/portal/main/contents.do?menuNo=200291 + compute 공식 | 2026-09-12 | 200·2019(현행) / computed |
| `rule-of-72-quick` | (FAQ) 기대수익률이 높다면 위험도 높다 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=620&menuNo=300017 | 2026-09-12 | 200·2023 |
| `savings-goal-time` | 기본값 `목표 자산 100,000,000원`·`월 저축 1,000,000원`·`연 수익률 5%` → `도달 시간` 6.98년 · `총 월수` 84개월 | compute() | 2026-09-12 | computed |
| `savings-goal-time` | (FAQ) 수익률 0% 이면 100,000,000 ÷ 1,000,000 = 100개월 | finance.ts monthsToGoal(0% 분기) | 2026-09-12 | computed |
| `savings-goal-time` | 월말 납입(기말 연금) 가정 — futureValue/monthsToGoal 공식 | src/lib/simpleCalculators/finance.ts | 2026-09-12 | computed |
| `savings-goal-time` | e-금융교육센터 성인을 위한 실용금융(3): 복리 정의, 이자·인플레이션·세금이 저축에 미치는 영향 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=618&menuNo=300017 | 2026-09-12 | 200·2023 |
| `savings-goal-time` | 파인 예금 꿀팁: 같은 기간이면 정기예금보다 자유적립식 적금 금리가 높은 편, 예금·외환·카드·자동이체 거래실적 우대금리, 이자소득세 14.0% + 주민세 1.4% | https://fine.fss.or.kr/main/prc/dp/sub/dp005.jsp?menuNo=900238 | 2026-09-12 | 200·연도 미표기 |
| `fire-target` | 기본값 `은퇴 후 월 생활비 3,000,000원`·`안전 인출률 3.5%` → `FIRE 목표 자산` 1,028,571,429원 · `연 인출 가능액` 36,000,000원 | compute() | 2026-09-12 | computed |
| `fire-target` | (FAQ) 인출률 4% → 연 생활비의 25배, 3% → 약 33배 | compute 공식(연 생활비 ÷ 인출률) | 2026-09-12 | computed |
| `fire-target` | 국가데이터처 2024년 생명표(2025. 12. 3. 발표): 기대수명 남녀 전체 83.7년, 남자 80.8년, 여자 86.6년; 60세 남자 23.7년·여자 28.4년 더 생존 예상 | https://mods.go.kr/board.es?mid=a10301010000&bid=208&act=view&list_no=439533 | 2026-09-12 | 200·2025 |
| `fire-target` | 국민연금공단: 노령연금은 가입기간 10년 이상 + 출생연도별 지급개시연령, 1969년 이후 출생 65세, 평생 지급; 조기노령연금 별도 | https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0056M0.do?menuId=MN24001118 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `fire-target` | (교차 확인) KOSIS 100대 지표 기대수명 2024년 83.7세(남 80.8·여 86.6) | https://kosis.kr/visual/nsportalStats/detailContents.do?statJipyoId=3668&listId=D&vStatJipyoId=5093 | 2026-09-12 | 200·2024 |
| `dollar-cost-average` | 기본값 `월 매수액 500,000원`·`연 평균 수익률 8%`·`기간 10년` → `최종 자산` 91,473,018원 · `총 투자` 60,000,000원 · `수익` 31,473,018원 | compute() | 2026-09-12 | computed |
| `dollar-cost-average` | 월말 납입 가정(futureValue: 월 납입 × ((1+r)^n − 1) ÷ r) | src/lib/simpleCalculators/finance.ts | 2026-09-12 | computed |
| `dollar-cost-average` | e-금융교육센터 성인을 위한 실용금융(5): 적립식 펀드투자는 매입가격 평균화 효과로 한 번에 거금을 투자할 때 높은 가격에 매입할 위험을 줄임; 기대수익률이 높다면 위험도 높다; 개발연도 2023 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=620&menuNo=300017 | 2026-09-12 | 200·2023 |
| `dollar-cost-average` | 금융감독원 펀드 상품 안내: 거치식(목돈 일시 가입)/적립식(특정 기간 분할 납입), 주식형 = 주식 및 주식 관련 파생상품에 60% 이상 투자 | https://fss.or.kr/main/prc/fu/sub/fu001.jsp?menuNo=900438 | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `portfolio-allocation` | 기본값 `주식 비중 60%`·`채권 비중 30%`·`현금 비중 10%` → `예상 연 수익률` 6.25% · `총 비중 합계` 100.00% · `주식 8% × 비중` 4.80% | compute() | 2026-09-12 | computed |
| `portfolio-allocation` | 국민연금기금운용본부 2026년도 목표 포트폴리오(2026년 말): 국내주식 20.8%, 해외주식 34.7%, 국내채권 23.1%, 해외채권 7.4%, 대체투자 14.0% | https://fund.nps.or.kr/oprtplcy/astaprtplcy/getOHEC0005M0.do | 2026-09-12 | 200·2026 |
| `portfolio-allocation` | 국민연금 자산배분은 목표수익률과 위험한도(CVaR)를 함께 규정(기금운용지침), 중기자산배분에 따른 연도별 목표 포트폴리오 설정 | https://fund.nps.or.kr/oprtplcy/astaprtplcy/getOHEC0005M0.do | 2026-09-12 | 200·2026 |
| `portfolio-allocation` | e-금융교육센터 성인을 위한 실용금융(5): 자산 종류·시점 분산으로 포트폴리오 위험 감소, 기대수익률이 높다면 위험도 높다 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=620&menuNo=300017 | 2026-09-12 | 200·2023 |
| `real-return-quick` | 기본값 `명목 수익률 7%`·`인플레이션율 3%` → `실질 수익률` 3.88% | compute() | 2026-09-12 | computed |
| `real-return-quick` | 한국은행: 2019년 이후 물가안정목표는 소비자물가 상승률(전년동기대비) 기준 2%, 근거 한국은행법 제6조 제1항(정부와 협의) | https://www.bok.or.kr/portal/main/contents.do?menuNo=200291 | 2026-09-12 | 200·2019(현행 목표, 2026 확인) |
| `real-return-quick` | 국가데이터처 2025년 12월 및 연간 소비자물가동향(2025. 12. 31. 발표): 2025년 연간 소비자물가지수 전년 대비 2.1% 상승, 12월 전년동월대비 2.3% | https://mods.go.kr/board.es?act=view&bid=213&list_no=442792&mid=a10301010000 | 2026-09-12 | 200·2025 |
| `real-return-quick` | (caveat·FAQ) 예금 이자 원천징수 이자소득세 14% + 지방소득세 1.4% = 15.4% | https://fine.fss.or.kr/main/prc/dp/sub/dp005.jsp?menuNo=900238 | 2026-09-12 | 200·연도 미표기 |
| `inflation-impact-quick` | 기본값 `현재 자산 100,000,000원`·`연 인플레이션 3%`·`기간 20년` → `20년 후 실질 가치` 55,367,575원 · `구매력 감소` 44.63% | compute() | 2026-09-12 | computed |
| `inflation-impact-quick` | 2025년 연간 소비자물가지수 전년 대비 2.1% 상승 | https://mods.go.kr/board.es?act=view&bid=213&list_no=442792&mid=a10301010000 | 2026-09-12 | 200·2025 |
| `inflation-impact-quick` | KOSIS 100대 지표 소비자물가지수: 기준연도 2020=100, 출처 국가데이터처 소비자물가조사 | https://kosis.kr/visual/nsportalStats/detailContents.do?statJipyoId=3698&vStatJipyoId=4991&listId=F | 2026-09-12 | 200·연도 미표기(2020=100 지수, 2026 현행 확인) |
| `inflation-impact-quick` | 한국은행 물가안정목표 2019년 이후 2% | https://www.bok.or.kr/portal/main/contents.do?menuNo=200291 | 2026-09-12 | 200·2019(현행) |
| `stock-pl-quick` | 기본값 `매수가 50,000원`·`매도가 60,000원`·`수량 100주` → `손익` 1,000,000원 · `수익률` 20.00% · `총 매도금` 6,000,000원 | compute() | 2026-09-12 | computed |
| `stock-pl-quick` | 증권거래세법 시행령 제5조(탄력세율): 유가증권시장 주권 1만분의 5, 코넥스시장 주권 1만분의 10, 코스닥시장 주권 등 1만분의 20 (개정 2025. 12. 31.) | https://www.law.go.kr/법령/증권거래세법 시행령/제5조 | 2026-09-12 | 200·2026 (시행 2026. 1. 2.) |
| `stock-pl-quick` | 농어촌특별세법 제5조 제1항: 자본시장법에 따른 증권시장으로서 대통령령으로 정하는 증권시장에서 거래된 증권의 양도가액 1만분의 15 | https://www.law.go.kr/법령/농어촌특별세법/제5조 | 2026-09-12 | 200·2026 (시행 2026. 5. 12., 법률 제21611호) |
| `stock-pl-quick` | (참고, 본문 미인용) 증권거래세법 제8조 제1항 기본세율 1만분의 35 | https://www.law.go.kr/법령/증권거래세법/제8조 | 2026-09-12 | 200·2022 (시행 2022. 7. 1.) |
| `stock-pl-quick` | (caveat) 해외주식 양도차익 기본공제 연 250만원 | https://www.law.go.kr/법령/소득세법/제103조 | 2026-09-12 | 200·2026 |
| `bond-yield-quick` | 기본값 `액면가 10,000원`·`매수가 9,500원`·`연 쿠폰 (이자) 400원`·`잔여기간 5년` → `만기수익률 (YTM)` 5.13% · `쿠폰 수익률` 4.21% · `자본 수익` 500원 | compute() | 2026-09-12 | computed |
| `bond-yield-quick` | 재정경제부 국채시장: 국고채권은 2·3·5·10·20·30·50년물 7가지 만기의 고정금리부 채권, 거래가 가장 활발한 채권시장의 지표금리 | https://ktb.moef.go.kr/ntpbnd.do | 2026-09-12 | 200·연도 미표기(2026 현행 확인) |
| `bond-yield-quick` | 개인투자용 국채: 2024년 6월 최초 발행, 5·10·20년물, 표면금리 = 전월 발행한 동일 연물 국고채 낙찰금리, 가산금리 매월 결정·공표, 만기 보유 시 표면금리+가산금리에 연복리 적용 이자 지급, 매입액 총 2억원까지 이자소득 14% 분리과세, 1년 후 중도환매 가능(가산금리·복리·세제혜택 미적용) | https://ktb.moef.go.kr/personalInvGovBonds.do | 2026-09-12 | 200·2024 |
