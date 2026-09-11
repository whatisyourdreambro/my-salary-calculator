# 간이 계산기 본문 사실 검증 로그 — 배치 C (S3-1 · 2026-09-12)

- 형식: `docs/calc-content-writing-guide-2026-09-12.md` §4. 표 1행 = 주장 1개. 예시 계산은 `npx tsx scripts/calc-default-result.ts <slug>` 출력, 출처는 실제 GET(브라우저 UA curl 상태코드 + WebFetch 본문) 확인.
- 대상 9종: `deposit-equivalent` `area-conversion` `rental-yield` `jeonse-vs-monthly-cost` (enrichments-ext-b.ts) · `unemployment-benefit` (batch2.ts) · `savings-rate-after-raise` `emergency-fund-runway` `irregular-income-baseline` `investment-drawdown-recovery` (expandedFinance.ts, batch 정의에 직접 기재).
- law.go.kr 은 `/법령/<법령명>/<조문>` 주소(200)를 인용한다. 조문 본문은 같은 페이지가 iframe 으로 불러오는 `LSW/lsSideInfoP.do?lsiSeq=…&joNo=…` 에서 확인했고, 시행일 헤더는 `LSW/lsInfoP.do?lsiSeq=…` 에서 확인했다(아래 status 의 연도).
- 화면 표기 규칙: 원 = 반올림 정수 + 콤마, % = 소수 2자리, 그 외 단위 = 소수 최대 2자리(`SimpleCalculatorView.formatNumber`).

| slug | claim | source URL | fetched date | status |
|---|---|---|---|---|
| `deposit-equivalent` | 기본값 월세 `800,000원`·현재 보증금 `50,000,000원`·전월세 전환율 `5%` → 환산 전세금 `242,000,000원` / 월세 → 전세 추가분 `192,000,000원` | compute() | 2026-09-12 | computed |
| `deposit-equivalent` | 주택임대차보호법 제7조의2: 보증금의 전부 또는 일부를 월 단위 차임으로 전환하는 경우 각 호 중 낮은 비율(1호 대통령령으로 정하는 비율, 2호 한국은행 공시 기준금리 + 대통령령으로 정하는 이율)을 곱한 월차임을 초과할 수 없다 — [시행 2026. 1. 2.] [법률 제21065호] | https://www.law.go.kr/법령/주택임대차보호법/제7조의2 | 2026-09-12 | 200·2026 |
| `deposit-equivalent` | 주택임대차보호법 시행령 제9조: ① 제1호의 비율은 연 1할 ② 제2호의 이율은 연 2퍼센트 — [시행 2026. 7. 1.] [대통령령 제36423호] | https://www.law.go.kr/법령/주택임대차보호법시행령/제9조 | 2026-09-12 | 200·2026 |
| `deposit-equivalent` | 한국은행 기준금리 2026-08-27 결정 연 3.00% → 법정 상한 연 5.00%(3.00 + 2.00, 10% 보다 낮음) | https://www.bok.or.kr/portal/singl/baseRate/list.do?dataSeCd=01&menuNo=200643 | 2026-09-12 | 200·2026 |
| `deposit-equivalent` | FAQ 예시: 보증금 1억원 감소 × 5% = 연 500만원, ÷ 12 = 월 약 41만 7천원(416,667원) | formula 역산 | 2026-09-12 | computed |
| `deposit-equivalent` | KOSIS 지역별 전월세전환율(한국부동산원 작성) — kosis.kr 본주소는 SSO 302, stat.kosis.kr 호스트는 200 이나 표·시점이 스크립트 렌더라 확인 불가 → sources 미사용 | https://stat.kosis.kr/statHtml_host/statHtml.do?orgId=408&tblId=DT_30404_N0010&dbUser=NSI_IN_408 | 2026-09-12 | FAIL 본문 미표시 |
| `area-conversion` | 기본값 `25평` → 제곱미터 `82.645㎡`(화면 82.65㎡) / 1평 `3.3058㎡` | compute() | 2026-09-12 | computed |
| `area-conversion` | 정책브리핑 2007-07-20 산업자원부 장관 기고: 1평은 약 3.3058(400/121)㎡, 1자(尺)는 30.303(1000/33)cm; 정부는 1963년 미터법을 법정 계량단위로 채택; 이달(2007년 7월) 1일부터 평·돈 계도·단속 | https://www.korea.kr/news/policyNewsView.do?newsId=148628433 | 2026-09-12 | 200·2007 |
| `area-conversion` | 계량에 관한 법률 제6조(비법정단위의 사용금지 등) ② 누구든지 비법정단위를 계량이나 광고에 사용해서는 아니 된다 ③ 산업통상부령으로 정하는 표시요건을 만족하면 비법정단위를 법정단위와 함께 표시할 수 있다 — [시행 2026. 3. 3.] [법률 제21151호] | https://www.law.go.kr/법령/계량에관한법률/제6조 | 2026-09-12 | 200·2026 |
| `area-conversion` | FAQ: 84㎡ ÷ 3.3058 = 25.41평 | formula | 2026-09-12 | computed |
| `area-conversion` | 정책브리핑 2013-01-22 기사: 2010년 6월부터 일간지 광고의 평·돈 상습 사용 단속·과태료, 106~109㎡가 모두 32평으로 표시 — 참고 확인만, 본문 미인용 | https://www.korea.kr/news/interviewView.do?newsId=148755047 | 2026-09-12 | 200·2013 |
| `rental-yield` | 기본값 매수가 `100,000,000원`·월세 `500,000원` → 연 임대 수익률 `6.00%` / 연 월세 수입 `6,000,000원` | compute() | 2026-09-12 | computed |
| `rental-yield` | 국세청 주택임대소득 과세 개요: 주택임대소득은 사업소득; 1주택은 비과세이되 기준시가 12억원 초과·국외 주택은 과세(기준시가 기준 9억→12억, 2023년부터); 2주택 이상 월세 과세; 3주택 이상 보증금 간주임대료 과세; 필요경비 50%/60%, 공제 200만/400만원, 세율 14%; 페이지에 2026년 12월 31일까지 문구 표시 | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2246&cntntsId=7678 | 2026-09-12 | 200·2026 |
| `rental-yield` | 소득세법 제64조의2: 분리과세 주택임대소득 사업소득금액 × 100분의 14; 사업소득금액 = 총수입금액 − 필요경비(총수입금액의 100분의 50); 분리과세 제외 종합소득금액 2천만원 이하이면 200만원 추가 차감 — [시행 2026. 7. 1.] [법률 제21221호] | https://www.law.go.kr/법령/소득세법/제64조의2 | 2026-09-12 | 200·2026 |
| `rental-yield` | 국세청 분리과세 안내: 수입금액 2천만원 이하 종합·분리 선택, 등록임대주택 필요경비 60%·공제 400만원, 미등록 50%·200만원(FAQ 근거) — 연도 표기 없어 sources 제목에는 미사용 | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2247&cntntsId=7679 | 2026-09-12 | 200·연도 미표시 |
| `jeonse-vs-monthly-cost` | 기본값 전세금 `200,000,000원`·전세대출 금리 `4%`·대출 비율 `70%`·월세 `800,000원` → 전세 월 실비용 `716,667원` / 월세 `800,000원` / 전세가 유리한 차이 `83,333원` | compute() | 2026-09-12 | computed |
| `jeonse-vs-monthly-cost` | 전국은행연합회 가계대출 금리 비교공시: 전세자금대출 항목 포함, 공시 기준 2026년 8월, 평균금리는 각 은행 금리의 단순산술평균 | https://portal.kfb.or.kr/compare/loan_household_new.php | 2026-09-12 | 200·2026 |
| `jeonse-vs-monthly-cost` | 한국은행 기준금리 추이: 2026-08-27 3.00%, 2026-07-16 2.75%, 2025-05-29 2.50% | https://www.bok.or.kr/portal/singl/baseRate/list.do?dataSeCd=01&menuNo=200643 | 2026-09-12 | 200·2026 |
| `jeonse-vs-monthly-cost` | 한국주택금융공사 일반전세자금보증: 임차보증금 7억(서울·경기·인천 외 5억) 이하, 보증한도 4억·임차보증금의 80% 등 — 검토만, 연도 미표시라 sources 미사용 | https://www.hf.go.kr/ko/sub02/sub02_01_02.do | 2026-09-12 | 200·연도 미표시 |
| `unemployment-benefit` | 기본값 이직 전 3개월 평균 월급 `3,000,000원`·근무 기간 `24개월` → 예상 총 수급액 `9,907,200원` / 일일 구직급여 `66,048원` / 수급 가능 기간 `150일` / 월 환산 수급액 `1,981,440원` | compute() | 2026-09-12 | computed |
| `unemployment-benefit` | 고용노동부 보도자료(2025-12-16, 고용보험법 시행령 등 일부개정령안 국무회의 심의·의결): '26년 최저임금 인상에 따라 최저임금과 연동된 구직급여 하한액이 상한액보다 높아지게 되어 기초일액 상한을 11만원에서 11만3500원으로 상향, 구직급여 상한액은 66,000원에서 68,100원으로 인상 | https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18736 | 2026-09-12 | 200·2026 |
| `unemployment-benefit` | 고용보험법 제46조(구직급여일액): 기초일액 × 100분의 60; 제45조 제4항의 경우 기초일액 × 100분의 80 = 최저구직급여일액; 60% 금액이 최저구직급여일액보다 낮으면 최저구직급여일액 — [시행 2026. 8. 20.] [법률 제21372호] | https://www.law.go.kr/법령/고용보험법/제46조 | 2026-09-12 | 200·2026 |
| `unemployment-benefit` | 고용보험법 제40조 ①1호: 기준기간 동안의 피보험 단위기간이 합산하여 180일 이상일 것 | https://www.law.go.kr/법령/고용보험법/제40조 | 2026-09-12 | 200·2026 |
| `unemployment-benefit` | 고용보험법 제48조 ①: 이직일의 다음 날부터 계산하기 시작하여 12개월 내에 소정급여일수를 한도로 지급 | https://www.law.go.kr/법령/고용보험법/제48조 | 2026-09-12 | 200·2026 |
| `unemployment-benefit` | 하한 66,048원 = 2026년 최저임금 시급 10,320원 × 80% × 8시간 (`src/config/unemploymentBenefit.ts`·`minimumWage.ts`, 고용노동부 고시) | repo config | 2026-09-12 | computed |
| `unemployment-benefit` | 고용노동부 고객상담센터 페이지 — 2025년 상한 66,000원·하한 66,048원 언급은 있으나 2026년 68,100원 표가 보이지 않음 → 미사용 | https://1350.moel.go.kr/rtmview.do?id=1000285955 | 2026-09-12 | FAIL 2026 표 미표시 |
| `unemployment-benefit` | 고용24 고용정책 제도안내(구직급여) — 응답 503 → 미사용 | https://m.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systClId=SC00000256&systId=SI00000412 | 2026-09-12 | FAIL 503 |
| `savings-rate-after-raise` | 기본값 현재 사용 가능 월 수입 `3,000,000원`·현재 월 저축액 `600,000원`·인상 후 월 수입 증가 `300,000원`·증가 수입의 저축 배분 `70%` → 인상 후 전체 저축률 `24.55%` / 새 월 저축액 `810,000원` / 추가 소비 가능액 `90,000원` / 현재 저축률 `20.00%` | compute() | 2026-09-12 | computed |
| `savings-rate-after-raise` | 국가데이터처 2026년 2/4분기 가계동향조사 결과(보도 2026-08-27): 가구당 월평균 소득 529만 5천원(+4.5%), 처분가능소득 423만 5천원(+5.2%), 가계지출(소비지출+비소비지출) 399만 3천원(+3.4%), 흑자액 130만 2천원(+9.6%), 평균소비성향 69.2%(−1.2%p) | https://mods.go.kr/board.es?mid=a10301040400&bid=214&act=view&list_no=446633 | 2026-09-12 | 200·2026 |
| `savings-rate-after-raise` | 금융감독원 e-금융교육센터 금융체력 키우기(1편) 저축은 왜 해야할까 — 영상, 2024년, 청년기: 요구불·저축성 예금, 이자 과세, 단리·복리; 최고 금리만 좇지 말고 본인 상황에 맞는 저축 상품 선택 | https://www.fss.or.kr/edu/fec/contMng/view.do?menuNo=300017&contentsSlno=682 | 2026-09-12 | 200·2024 |
| `savings-rate-after-raise` | FAQ 예시: 300,000원 × 70% = 210,000원(= 새 월 저축액 810,000 − 기존 600,000) | formula | 2026-09-12 | computed |
| `emergency-fund-runway` | 기본값 현재 사용 가능 현금 `12,000,000원`·감소 후 월 수입 `1,000,000원`·월 지출 합계 `2,500,000원`·시작 시 일회성 지출 `0원` → 전액 충당 가능한 기간 `8개월` / 매달 부족한 금액 `1,500,000원` / 전액 충당 후 남는 현금 `0원` | compute() | 2026-09-12 | computed |
| `emergency-fund-runway` | 금융감독원 e-금융교육센터 성인을 위한 실용금융(5) — 영상, 2023년: 비상예비자금은 월평균 생활비의 3~6배를 보통예금·MMF·CMA 등 단기 상품에; 투자 결과는 수익·손실 불문 투자자 본인 귀속; 자산·시점 분산투자 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=620&menuNo=300017 | 2026-09-12 | 200·2023 |
| `emergency-fund-runway` | 2026년 2/4분기 가계동향조사: 가구당 월평균 가계지출(소비지출+비소비지출) 399만 3천원, 처분가능소득 423만 5천원 | https://mods.go.kr/board.es?mid=a10301040400&bid=214&act=view&list_no=446633 | 2026-09-12 | 200·2026 |
| `irregular-income-baseline` | 기본값 첫·둘째·셋째 달 사용 가능 수입 `2,000,000원`·`3,000,000원`·`5,000,000원`·매달 필수 지출 `2,500,000원` → 최저 수입 월의 지출 부족 `500,000원` / 세 달 중앙값 수입 `3,000,000원` / 세 달 평균 수입 `3,333,333원` / 평균 기준 월 여유 `833,333원` | compute() | 2026-09-12 | computed |
| `irregular-income-baseline` | 소득세법 제129조 ①3호: 원천징수대상 사업소득에 대해서는 100분의 3 — [시행 2026. 7. 1.] [법률 제21221호] | https://www.law.go.kr/법령/소득세법/제129조 | 2026-09-12 | 200·2026 |
| `irregular-income-baseline` | 국세청 종합소득세 모두채움 신고 안내(납부): 인적용역 사업소득(3.3% 원천징수)이 있는 경우에도 종합소득세 신고 대상; 2025년 귀속 소득을 2026년 6월 1일까지 신고·납부 | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=40483&cntntsId=238978 | 2026-09-12 | 200·2026 |
| `irregular-income-baseline` | 국세청 원천징수 대상 사업소득 페이지 — 인적용역 범위는 있으나 세율·연도 미표시 → sources 미사용 | https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6620&cntntsId=7900 | 2026-09-12 | 200·연도 미표시 |
| `investment-drawdown-recovery` | 기본값 하락 전 평가금액 `10,000,000원`·평가금액 하락률 `20%` → 원금 회복에 필요한 상승률 `25.00%` / 하락 후 평가금액 `8,000,000원` / 되찾아야 할 평가금액 `2,000,000원` | compute() | 2026-09-12 | computed |
| `investment-drawdown-recovery` | 금융감독원 파인 금융꿀팁 신입사원의 금융상품 현명하게 가입하기(투자편) — 본문 등록일 2024-06-27(목록 표기 2024-01-09): 신용융자 등 레버리지 투자는 주가하락 시 회복하기 어려운 손실 가능, 소득·자산에 맞는 투자규모 유지; 적립식·분산 | https://fine.fss.or.kr/fine/bbs/B0000340/view.do?nttId=136764&menuNo=900014 | 2026-09-12 | 200·2024 |
| `investment-drawdown-recovery` | 성인을 위한 실용금융(5) 2023년: 투자 결과는 투자자 본인 귀속, 자산 종류·매수 시점 분산 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=620&menuNo=300017 | 2026-09-12 | 200·2023 |
| `investment-drawdown-recovery` | FAQ 예시: 8,000,000원 × 1.2 = 9,600,000원(20% 반등 시) | formula | 2026-09-12 | computed |

## 미사용·후보 호스트 (허용 목록 추가는 별도 커밋)

- 한국부동산원 전월세전환율 원자료(r-one.co.kr) — 허용 목록 밖. KOSIS 경유는 위 FAIL 행 참고.
- 고용24(work24.go.kr)는 허용 목록에 있으나 2026-09-12 기준 제도안내·게이트웨이 페이지가 503 — 재시도 시 구직급여 지급액 페이지를 `unemployment-benefit` 2번째 출처 후보로 검토.
- edu.fss.or.kr 루트는 error.html 로 302 — e-금융교육센터는 `www.fss.or.kr/edu/...` 주소를 쓴다.

## compute 관련 관찰 (수정하지 않음)

- `deposit-equivalent` compute note 문구 "정부 고시 전월세 전환율 5% 기준" — 전환율은 고시값이 아니라 주택임대차보호법 제7조의2·시행령 제9조의 상한(기준금리+2%와 10% 중 낮은 값)이다. 2026-08-27 기준금리 3.00% 로 상한이 5.00% 라 값은 맞지만 표현이 부정확하다.
- `unemployment-benefit` compute note 의 "워크넷" 은 2024년 고용24 로 통합된 명칭이다(본문·FAQ 는 고용24 로 적음).
- `jeonse-vs-monthly-cost` 의 기회비용 5% 는 입력으로 바꿀 수 없는 상수인데 종전 FAQ 가 "본인 운용수익률로 바꿔 보면" 이라고 안내하고 있어 FAQ 문장을 고정값 설명으로 고쳤다.
