# S3-1 사실 확인 — 금융 계산기 잔여 4종 (배치 G)

확인일: 2026-09-14 KST. 대상은 `expandedFinance.ts`의 `payment-holiday-cost`, `portfolio-rebalance-amount`, `savings-ladder-cashflow`, `systematic-withdrawal-runway`다. 장문 본문·FAQ·개별 유의사항·공식 출처만 보강했다. 계산 로직, 입력 필드, 제목, description, explanation, 관련 링크, 광고는 수정하지 않았다.

공식 출처는 일반 검색으로 발견한 뒤 기관 원문을 읽고 별도의 Node `fetch` GET으로 상태를 확인했다. 기본 sandbox에서 네트워크 요청이 실패했으므로 공개 출처 8건의 읽기 전용 GET만 승격해 재확인했다. HTTP 200만으로 주장을 승인하지 않았고 내용과 날짜도 대조했다. 시행·개발 연도가 없는 상시 안내는 제목에 **2026년 9월 확인**이라고 표시했다. 이는 2026년 신설 규정이라는 뜻이 아니다.

기본값은 `scripts/calc-default-result.ts`의 방식과 동일하게 실제 `fields[].defaultValue`를 읽어 실제 `compute()`에 전달했다. tsx 실행이 환경의 `os.userInfo` 오류로 실패하여, TypeScript `transpileModule`로 해당 원본 모듈을 CommonJS로 변환하고 VM에서 실행했다. 산식을 다시 구현하거나 결과를 추정하지 않았다.

## 출처 GET 기록

| ID | 출처 URL | GET 상태 | 응답 바이트 | 연도·내용 확인 |
|---|---|---|---|---|
| H1 | https://www.hf.go.kr/ko/sub02/sub01_09_02_01.do | 200 | 194,359 | 상시 안내, 2026-09-14 확인. 디딤돌 원금상환유예의 유예방법: 약정 만기 유지·유예 원금 잔여기간 분할. 발표·개정 연도 미표시 |
| H2 | https://www.fsc.go.kr/edu/news/76658 | 200 | 172,320 | 본문 게시일 2021-03-02. 코로나19 지원의 연착륙 원칙에서 유예이자에 이자를 더 부과하지 않음. 현재 신규 신청 안내로 재사용하지 않음 |
| S1 | https://www.fsc.go.kr/po020201/84975 | 200 | 107,652 | 본문 게시일 2025-07-22. 문답 6·8: 보호대상 예금의 원금·소정의 이자를 금융기관별로 합산 |
| S2 | https://www.fsc.go.kr/edu/news/85346 | 200 | 28,160 | 본문 게시일 2025-09-15. 예·적금 등은 만기 이후 적용금리가 점차 낮아질 수 있음을 설명 |
| P1 | https://fund.nps.or.kr/fileDown.do?atchFileId=FU24000180&atchFileSn=146415 | 200 | 290,166 | PDF 표지 시행일 2025-01-01. 제8조와 별표 1의 목표비중·허용범위·범위 이탈 시 조정. 개인의 추천 배분으로 사용하지 않음 |
| P2 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=620&menuNo=300017 | 200 | 680,635 | 콘텐츠 소개 개발연도 2023. 본문 학습내용에서 펀드 운용특성·투자위험·보수·수수료 확인 안내. 웹 도구의 이 URL 읽기는 오류였으나 직접 GET의 HTML 텍스트에서 확인 |
| W1 | https://www.nps.or.kr/pnsgdnc/newgdnc/getOHAE0001M1.do?hmpgBbsCd=BS20240137&hmpgCd=01&menuId=MN24000897&pageIndex=1&pstId=ZZ202600000000000024&searchGbu=&searchText=&sortSe=FR | 200 | 694,826 | 등록일 2026-01-12. 전년도 전국소비자물가변동률에 따른 2026년 연금액 조정. 인상률 숫자는 본문에 재사용하지 않음 |
| W2 | https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0100M0.do | 200 | 740,228 | 2026년 A값과 2026-06-17 시행 변경을 포함하는 상시 안내. 조기·연기연금 문답에서 평생 지급을 설명. 2026-09-14 확인이며 페이지 전체 신규 발표 연도는 아님 |

## 주장별 대조

| slug | claim | source URL | fetched date | status |
|---|---|---|---|---|
| payment-holiday-cost | 잔액 10,000,000원·연이율 4%·유예 6개월·재개 뒤 36개월 → 월 상환액 301,194원, 합산 이자 201,674원, 재개 잔액 10,201,674원 | compute() | 2026-09-14 | computed |
| payment-holiday-cost | 연이율을 월이율로 바꾸고 매달 증가한 잔액에 다시 이자를 붙인 뒤 원리금균등으로 상환한다 | compute(): monthly, growth, payment | 2026-09-14 | computed |
| payment-holiday-cost | 유예와 재개 뒤에 동일한 연이율을 쓰므로 유예 중에만 무이자인 상품을 재현하지 못한다 | fields(rate), compute() | 2026-09-14 | computed |
| payment-holiday-cost | 원금과 이자를 전부 납부하지 않는 가정이므로 이자만 내는 거치와 다르다 | compute() | 2026-09-14 | computed |
| payment-holiday-cost | 디딤돌대출 원금상환유예는 약정 만기를 유지하고 유예 원금을 잔여기간에 나눈다 | https://www.hf.go.kr/ko/sub02/sub01_09_02_01.do | 2026-09-14 | 200·상시 안내 확인 |
| payment-holiday-cost | 금융위원회의 2021년 코로나19 연착륙 방안은 유예이자에 추가 이자를 부과하지 않았다 | https://www.fsc.go.kr/edu/news/76658 | 2026-09-14 | 200·2021, 과거 사례로만 표기 |
| savings-ladder-cashflow | A 3,000,000원·3개월, B 3,000,000원·6개월, C 3,000,000원·12개월, 필요 시점 6개월, 연이율 4%, 차감률 0% → 회수액 6,090,000원, 미만기 원금 3,000,000원, 원금 합계 9,000,000원 | compute() | 2026-09-14 | computed |
| savings-ladder-cashflow | 필요 시점과 같은 개월에 만기인 예금도 회수액에 포함한다 | compute(): n <= check | 2026-09-14 | computed |
| savings-ladder-cashflow | 이자 차감률은 원금이 아닌 단리 이자에 적용하며 차감률 0은 과세 여부 판정이 아니다 | compute() | 2026-09-14 | computed |
| savings-ladder-cashflow | 만기 뒤 이자·재예치·중간 지출을 추가하지 않은 누적 회수액이다 | compute() | 2026-09-14 | computed |
| savings-ladder-cashflow | 같은 금융기관에서 여러 계좌로 나눈 보호대상 예금은 원금과 소정의 이자를 합쳐 판단한다 | https://www.fsc.go.kr/po020201/84975 | 2026-09-14 | 200·2025 |
| savings-ladder-cashflow | 예·적금 등은 만기 이후 적용금리가 점차 낮아질 수 있으므로 만기 처리 방법을 확인한다 | https://www.fsc.go.kr/edu/news/85346 | 2026-09-14 | 200·2025 |
| portfolio-rebalance-amount | A 6,000,000원·B 3,000,000원·C 1,000,000원, 목표 50%·30%·20% → 총 매수 1,000,000원, A -1,000,000원·B 0원·C 1,000,000원 | compute() | 2026-09-14 | computed |
| portfolio-rebalance-amount | 음수는 목표액 초과분의 매도 가정이며, 추가 입금 없이 매도대금으로 매수하고 세금·거래비용을 제외한다 | compute(), result.note | 2026-09-14 | computed |
| portfolio-rebalance-amount | 목표 비중 합계가 100%가 아니면 계산 대신 입력 안내를 표시한다(허용 오차 1e-6) | compute() | 2026-09-14 | computed |
| portfolio-rebalance-amount | 원화 평가액 차이만 계산하며 실제 주문 수량·결제일·세금·환전비용을 산정하지 않는다 | fields, compute() | 2026-09-14 | computed |
| portfolio-rebalance-amount | 국민연금의 2025년 시행 지침은 목표비중과 허용범위를 두고 조정하는 기관 운용 사례다 | https://fund.nps.or.kr/fileDown.do?atchFileId=FU24000180&atchFileSn=146415 | 2026-09-14 | 200·2025, PDF 제8조·별표 1 |
| portfolio-rebalance-amount | 금융감독원의 2023년 실용금융은 펀드 투자 전 운용특성·위험·보수·수수료를 확인하도록 안내한다 | https://www.fss.or.kr/edu/fec/contMng/view.do?contentsSlno=620&menuNo=300017 | 2026-09-14 | 200·2023, HTML 학습내용·개발연도 |
| systematic-withdrawal-runway | 현재 자산 12,000,000원·월 인출 1,000,000원·연수익률 0%·확인 한도 120개월 → 전액 가능 12개월, 마지막 잔액 0원, 완료 인출 합계 12,000,000원 | compute() | 2026-09-14 | computed |
| systematic-withdrawal-runway | 다음 달에는 예정한 인출액 전부를 충당하지 못한다 | compute(), result.note | 2026-09-14 | computed |
| systematic-withdrawal-runway | 매달 수익을 먼저 붙이고 전액을 낼 수 있는 경우에만 월말 인출을 수행하며 부족한 달의 부분 인출은 하지 않는다 | compute() | 2026-09-14 | computed |
| systematic-withdrawal-runway | 최대 기간은 600개월이고 연수익률은 비음수만 입력할 수 있으므로 음의 수익률·기간별 손실은 계산하지 않는다 | fields: months, rate | 2026-09-14 | computed |
| systematic-withdrawal-runway | 인출액 물가 연동·세금·수수료·예정 밖 지출·향후 연금 입금은 반영되지 않는다 | fields, compute() | 2026-09-14 | computed |
| systematic-withdrawal-runway | 2026년 국민연금 수령액은 전년도 전국소비자물가변동률을 반영해 조정한다 | https://www.nps.or.kr/pnsgdnc/newgdnc/getOHAE0001M1.do?hmpgBbsCd=BS20240137&hmpgCd=01&menuId=MN24000897&pageIndex=1&pstId=ZZ202600000000000024&searchGbu=&searchText=&sortSe=FR | 2026-09-14 | 200·2026 |
| systematic-withdrawal-runway | 평생 지급되는 노령연금은 개인 보유 자금의 정액 인출과 구분해야 한다 | https://www.nps.or.kr/pnsinfo/ntpsklg/getOHAF0100M0.do | 2026-09-14 | 200·2026년 상시 안내 확인 |

## 적용 검증

- 본문 길이: 납입 유예 870자, 예금 사다리 931자, 리밸런싱 931자, 정액 인출 915자. 각 4문단이며 FAQ 4개(각 답변 156~192자), 개별 유의사항 3개, 공식 출처 2개다.
- `define()`의 기존 `source` 키는 공통 해외 출처를 나중에 덮어씌우므로 대상 4종에서만 제거하고 개별 `sources`를 사용했다. 병합 후 2개 공식 출처가 실제 전달되는지 확인했다.
- 변경 전후 finance 51종 전체에서 허용 콘텐츠 필드(details/faqs/caveats/sources) 외 직렬화 가능한 필드가 동일하며, 기본값 compute 결과도 전부 동일함을 대조했다. 대상 외 계산기는 콘텐츠도 동일하다.
- `node node_modules/vitest/vitest.mjs run src/lib/__tests__/calcSources.test.ts src/lib/__tests__/computeLoader.test.ts`: 2파일·27테스트 PASS. 빌드·전체 게이트·감사표 갱신은 통합 작업에서 수행한다.
- 수정한 TypeScript 파일의 ESLint와 `git diff --check`도 exit 0으로 통과했다.
