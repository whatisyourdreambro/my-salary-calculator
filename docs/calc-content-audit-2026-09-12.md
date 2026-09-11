# 간이 계산기 본문 실측표 (S3-1 선행)

- 생성일: 2026-09-12 (KST) · 스크립트 재실행으로 재생성 가능
- 명령: `npx tsx scripts/calc-content-audit.ts --out docs/calc-content-audit-2026-09-12.md`
- 데이터 원본: `src/lib/simpleCalculators/index.ts` 병합 결과(allCalculators) = `batch1.ts`·`batch2.ts`·`expandedFinance.ts`·`expandedPractical.ts`(정의·sources) + `enrichments.ts`·`enrichments-ext-{a,b,c}.ts`(explanation·formula·faqs·caveats — batch 값이 있으면 batch 우선) + `twins.ts`(정밀 쌍) · 색인 규칙은 `src/app/calc/[slug]/page.tsx`
- 수치 의미: 설명자 = explanation 공백 정규화 글자 수(제목·description·공식·FAQ 제외) · FAQ답변자 = faqs[].a 합계 · 출처 = sources[] URL 수, 국내공식 = *.go.kr/*.or.kr 호스트 수, 해외공공 = .gov/.edu 등 · 보일러 = 다른 슬러그와 글자 단위 동일한 설명(E)/FAQ 답변(F)/유의사항(C) 그룹 ID · 색인 = explanation 있음 && FAQ ≥ 3 이면 index, 아니면 noindex · 숫자 = 설명에 숫자(예시 계산) 포함 여부
- ★ 동결: `<title>`·description(`seoText.ts` 생성분 포함)은 2026-10-09 판정 창까지 무접촉 — S3-1 은 explanation·formula·faqs·caveats·sources 본문 문자열만 수정한다(필드·컴포넌트·라우트 무접촉).

## 1. 요약

### 1-1. 총계

| 항목 | 값 |
|---|---|
| 계산기 수 (getAllSlugs) | 202 |
| explanation 보유 | 202 (100.0%) · 중앙값 237자 · 평균 225자 |
| explanation 에 숫자(예시 계산) 포함 | 106 (52.5%) |
| formula 보유 | 202 (100.0%) |
| faqs 보유 | 202 (100.0%) |
| sources 보유 | 32 (15.8%) |
| caveats 보유 | 202 (100.0%) |
| 정밀 쌍(twins.ts) 보유 | 32 (15.8%) |
| 색인 허용(explanation && FAQ ≥ 3) | 202 (100.0%) · noindex 0 |
| 보일러플레이트 멤버(그룹 1개 이상) | 101 (50.0%) · 그중 설명 자체가 공유된 것 0 |

### 1-2. 설명 길이 분포 (explanation 글자 수)

| 구간 | 수 | 비율 |
|---|---|---|
| <200 | 56 | 27.7% |
| 200-400 | 146 | 72.3% |
| 400-600 | 0 | 0.0% |
| 600-1000 | 0 | 0.0% |
| >1000 | 0 | 0.0% |

### 1-3. FAQ 수 분포

| FAQ 수 | 계산기 수 | 비율 |
|---|---|---|
| 0 | 0 | 0.0% |
| 1 | 0 | 0.0% |
| 2 | 0 | 0.0% |
| 3 | 202 | 100.0% |
| 4 | 0 | 0.0% |
| 5+ | 0 | 0.0% |

### 1-4. 출처 수 분포·공식 출처 비중

| 출처 수 | 계산기 수 | 비율 |
|---|---|---|
| 0 | 170 | 84.2% |
| 1 | 32 | 15.8% |
| 2+ | 0 | 0.0% |

- 출처 URL 총 32건 중 국내 공식(*.go.kr/*.or.kr) 0건 (0.0%) · 해외 공공(.gov/.edu 등) 20건 (62.5%) · 기타 12건
- 국내 공식 출처를 1건 이상 가진 계산기: 0 / 202 (0.0%)
- 발견된 출처 호스트: www.investor.gov×12(해외공공), support.microsoft.com×10, legacy.sba.gov×2(해외공공), www.consumerfinance.gov×2(해외공공), ext.vt.edu×1(해외공공), files.consumerfinance.gov×1(해외공공), ocw.ump.edu.my×1(해외공공), openstax.org×1, www.accaglobal.com×1, www.bls.gov×1(해외공공)

### 1-5. 카테고리별

| 분류 | 수 | 설명 중앙값(자) | 설명 <600자 | 출처 0건 | 보일러 멤버 | noindex | 정밀 쌍 |
|---|---|---|---|---|---|---|---|
| tax ★ | 15 | 190 | 15 | 15 | 0 | 0 | 9 |
| salary ★ | 17 | 190 | 17 | 16 | 6 | 0 | 4 |
| loan ★ | 22 | 231 | 22 | 10 | 12 | 0 | 8 |
| real-estate ★ | 18 | 219 | 18 | 18 | 8 | 0 | 1 |
| investment ★ | 31 | 229 | 31 | 20 | 16 | 0 | 3 |
| insurance | 8 | 189 | 8 | 8 | 0 | 0 | 0 |
| business | 26 | 249 | 26 | 21 | 18 | 0 | 1 |
| life | 31 | 255 | 31 | 30 | 18 | 0 | 5 |
| health | 5 | 261 | 5 | 5 | 0 | 0 | 1 |
| family | 16 | 248 | 16 | 15 | 11 | 0 | 0 |
| career | 6 | 233 | 6 | 6 | 6 | 0 | 0 |
| currency | 7 | 260 | 7 | 6 | 6 | 0 | 0 |

### 1-6. 본문 위치(파일)별

| explanation 이 있는 파일 | 계산기 수 | 설명 중앙값(자) | 출처 0건 |
|---|---|---|---|
| batch2.ts | 1 | 94 | 1 |
| enrichments-ext-a.ts | 26 | 181 | 26 |
| enrichments-ext-b.ts | 20 | 201 | 20 |
| enrichments-ext-c.ts | 24 | 250 | 24 |
| enrichments.ts | 30 | 190 | 30 |
| expandedFinance.ts | 51 | 237 | 26 |
| expandedPractical.ts | 50 | 255 | 43 |

### 1-7. 보일러플레이트 그룹 (총 2개 · 상위 2개)

- 종류별 그룹 수: explanation 0 · faq 0 · caveat 2 (정규화 후 20자 미만 문장은 제외)

| ID | 종류 | 멤버 수 | 글자 | 본문 앞부분 | 멤버 슬러그 |
|---|---|---|---|---|---|
| B01 | caveat | 51 | 46 | 초기 숫자는 계산 예시입니다. 계약서·견적서·실제 지출 내역으로 바꾸어 비교하세요. | allowance-growth-plan, bonus-repayment-reserve, bonus-versus-raise, career-training-payback, childcare-work-return, commute-adjusted-offer, couple-expense-income-split, credit-line-daily-interest, debt-avalanche-vs-snowball, debt-consolidation-payment, deposit-break-switch, education-savings-gap, eldercare-family-budget, emergency-fund-runway, emergency-fund-target, extra-payment-term, family-event-fund, family-insurance-premium-share, family-medical-budget, flex-time-tradeoff, investment-drawdown-recovery, investment-fee-break-even, irregular-income-baseline, job-transition-cash-gap, loan-balance-after-payments, loan-cashflow-effective-rate, loan-interest-principal-split, loan-term-extension-cost, lump-sum-prepayment-term, parental-leave-household-gap, payment-holiday-cost, portfolio-rebalance-amount, refinance-break-even, salary-purchasing-power, salary-raise-timing, savings-beginning-vs-end, savings-contribution-pause, savings-contribution-stepup, savings-ladder-cashflow, savings-rate-after-raise, savings-required-monthly, savings-start-delay, savings-tax-rate-compare, shared-goal-contribution, single-income-transition-budget, sinking-fund-monthly, split-payday-budget, systematic-withdrawal-runway, unpaid-leave-budget, variable-rate-stress, work-from-home-savings |
| B02 | caveat | 50 | 33 | 기본 입력값은 시장 평균이나 추천값이 아닌 계산 예시입니다. | advertising-profit-roas, annual-plan-break-even, appliance-energy-replacement, break-even-order-count, bulk-unit-price-waste, car-total-ownership, cash-conversion-cycle, cloud-storage-growth, commute-time-value, coupon-stack-savings, customer-acquisition-payback, data-plan-overage, discount-volume-target, diy-service-time-cost, equipment-lease-buy, ev-charge-vs-fuel, event-budget-headcount, exchange-spread-cost, export-quote-break-even-rate, foreign-atm-cost, free-shipping-threshold, home-maintenance-reserve, inventory-order-quantity, inventory-turnover-days, invoice-early-payment, leftover-currency-roundtrip, marketplace-settlement, meeting-cost, online-order-profit, operating-cashflow-plan, overseas-card-cost, parking-pass-break-even, prepaid-pass-usage, product-return-cost, project-budget-variance, receivables-aging-loss, relocation-payback, remittance-received, renovation-budget-buffer, rent-free-effective-cost, rental-prorated-rent, return-or-exchange-cost, reusable-item-payback, roommate-utility-share, stock-reorder-point, storage-unit-cost, travel-luggage-shipping, travel-shared-budget, vacancy-carrying-cost, wholesale-price-target |

## 2. S3-1 후보 50종

정렬 규칙:

- 1) 카테고리 계층: tax·salary·loan·real-estate·investment 를 0계층(우선), 나머지를 1계층으로 두고 0계층부터 채운다.
- 2) 설명 길이 구간 오름차순: <200 < 200-400 < 400-600 < 600-1000 < >1000 (짧을수록 먼저).
- 3) 출처 수 오름차순 (0건 먼저).
- 4) 보일러플레이트 멤버(설명·FAQ 답변·유의사항 중 하나라도 타 슬러그와 동일) 우선.
- 5) 동점이면 설명 글자 수 오름차순 → slug 사전순.

| # | 분류 | slug | 제목 | 설명자 | FAQ | 출처 | 보일러 | 색인 | 정밀쌍 | 본문 파일 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | salary | `unemployment-benefit` | 실업급여 간편 계산기 | 94 | 3 | 0 | - | index | Y | batch2.ts |
| 2 | investment | `cagr-quick` | 연평균 수익률 (CAGR) | 155 | 3 | 0 | - | index | Y | enrichments.ts |
| 3 | loan | `level-principal-payment` | 원금균등 상환 계산 | 159 | 3 | 0 | - | index | Y | enrichments-ext-a.ts |
| 4 | tax | `earned-income-tax-quick` | 근로소득세 간편 계산 | 165 | 3 | 0 | - | index | - | enrichments.ts |
| 5 | investment | `simple-interest-quick` | 단리 계산기 | 165 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 6 | salary | `severance-pay-quick` | 퇴직금 간편 계산 | 166 | 3 | 0 | - | index | Y | enrichments.ts |
| 7 | investment | `stock-pl-quick` | 주식 손익 계산 | 166 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 8 | salary | `annual-leave-pay-quick` | 연차수당 계산 | 167 | 3 | 0 | - | index | Y | enrichments.ts |
| 9 | salary | `daily-pay` | 일급 계산 | 167 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 10 | tax | `comprehensive-property-tax-quick` | 종합부동산세 간편 계산 | 168 | 3 | 0 | - | index | Y | enrichments.ts |
| 11 | loan | `monthly-installment` | 할부 이자 계산 | 169 | 3 | 0 | - | index | Y | enrichments-ext-a.ts |
| 12 | loan | `bullet-loan` | 만기일시 상환 계산 | 170 | 3 | 0 | - | index | Y | enrichments-ext-a.ts |
| 13 | loan | `loan-affordability` | 내 연봉 가능 대출액 | 170 | 3 | 0 | - | index | Y | enrichments.ts |
| 14 | tax | `property-tax-quick` | 재산세 간편 계산 | 170 | 3 | 0 | - | index | Y | enrichments.ts |
| 15 | loan | `loan-monthly-payment` | 대출 월 상환액 계산 | 172 | 3 | 0 | - | index | Y | enrichments-ext-a.ts |
| 16 | investment | `real-return-quick` | 실질 수익률 (인플레이션 차감) | 173 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 17 | salary | `weekend-pay-quick` | 휴일 근로 수당 | 173 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 18 | salary | `weekly-pay` | 주급 계산 | 176 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 19 | loan | `loan-refinance-savings` | 대출 갈아타기 절감액 | 177 | 3 | 0 | - | index | - | enrichments.ts |
| 20 | investment | `rule-of-72-quick` | 72의 법칙 — 자산 2배 시간 | 177 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 21 | loan | `loan-total-interest` | 대출 총 이자 계산 | 178 | 3 | 0 | - | index | Y | enrichments-ext-a.ts |
| 22 | real-estate | `jeonse-loan-cost` | 전세대출 월 이자 | 179 | 3 | 0 | - | index | - | enrichments.ts |
| 23 | tax | `stock-capital-gains-quick` | 주식 양도세 간편 계산 | 180 | 3 | 0 | - | index | Y | enrichments-ext-a.ts |
| 24 | investment | `fire-target` | FIRE 목표 자산 | 181 | 3 | 0 | - | index | Y | enrichments-ext-a.ts |
| 25 | investment | `savings-goal-time` | 저축 목표 도달 시간 | 181 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 26 | investment | `compound-interest-quick` | 복리 간편 계산기 | 182 | 3 | 0 | - | index | Y | enrichments.ts |
| 27 | real-estate | `deposit-equivalent` | 월세 → 전세금 환산 | 182 | 3 | 0 | - | index | - | enrichments-ext-b.ts |
| 28 | tax | `gift-tax-quick` | 증여세 간편 계산 | 183 | 3 | 0 | - | index | Y | enrichments.ts |
| 29 | salary | `holiday-allowance-quick` | 주휴수당 계산 | 185 | 3 | 0 | - | index | Y | enrichments.ts |
| 30 | tax | `import-tax-quick` | 해외 직구 관세·부가세 계산 | 185 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 31 | investment | `dollar-cost-average` | 적립식 투자 시뮬 | 186 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 32 | investment | `portfolio-allocation` | 포트폴리오 배분 시뮬 | 186 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 33 | real-estate | `area-conversion` | 평·제곱미터 변환 | 187 | 3 | 0 | - | index | - | enrichments-ext-b.ts |
| 34 | salary | `hourly-to-yearly` | 시급 → 연봉 환산 | 187 | 3 | 0 | - | index | - | enrichments.ts |
| 35 | tax | `interest-tax-quick` | 이자소득세 계산 | 188 | 3 | 0 | - | index | Y | enrichments-ext-a.ts |
| 36 | salary | `night-shift-pay-quick` | 야간 근로 수당 계산 | 190 | 3 | 0 | - | index | - | enrichments.ts |
| 37 | tax | `vat-reverse-quick` | 부가세 역산 (VAT 포함가 → 공급가) | 190 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 38 | real-estate | `mortgage-monthly-quick` | 주택담보대출 월 상환 | 191 | 3 | 0 | - | index | Y | enrichments.ts |
| 39 | tax | `vat-quick` | 부가가치세(VAT) 계산 | 191 | 3 | 0 | - | index | Y | enrichments.ts |
| 40 | real-estate | `rental-yield` | 임대 수익률 | 192 | 3 | 0 | - | index | - | enrichments-ext-b.ts |
| 41 | investment | `exchange-impact-quick` | 환율 변동 자산 영향 | 194 | 3 | 0 | - | index | - | enrichments.ts |
| 42 | salary | `overtime-pay-quick` | 시간외 수당 계산 | 194 | 3 | 0 | - | index | - | enrichments.ts |
| 43 | investment | `bond-yield-quick` | 채권 수익률 계산 | 196 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 44 | investment | `inflation-impact-quick` | 인플레이션 구매력 영향 | 198 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 45 | real-estate | `jeonse-vs-monthly-cost` | 전세 vs 월세 월 비용 | 198 | 3 | 0 | - | index | - | enrichments-ext-b.ts |
| 46 | investment | `dividend-yield-quick` | 배당 수익률 계산 | 199 | 3 | 0 | - | index | - | enrichments.ts |
| 47 | real-estate | `monthly-rent-tax-credit-quick` | 월세 세액공제 환급 | 199 | 3 | 0 | - | index | - | enrichments.ts |
| 48 | salary | `yearly-to-hourly` | 연봉 → 시급 환산 | 199 | 3 | 0 | - | index | - | enrichments-ext-a.ts |
| 49 | investment | `savings-rate-after-raise` | 월급 인상 후 저축률 계획 | 229 | 3 | 0 | B01 | index | - | expandedFinance.ts |
| 50 | investment | `emergency-fund-runway` | 현재 비상금으로 버틸 기간 | 231 | 3 | 0 | B01 | index | - | expandedFinance.ts |

## 3. 전체 표 (202종 · 분류 순서 = types.ts union → slug)

| 분류 | slug | 제목 | 본문 파일 | 설명자 | 숫자 | 공식(자) | FAQ | FAQ답변자 | 출처 | 국내공식 | 유의 | 보일러 | 정밀쌍 | 색인 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| tax | `comprehensive-property-tax-quick` | 종합부동산세 간편 계산 | enrichments.ts | 168 | Y | 72 | 3 | 353 | 0 | 0 | 3 | - | Y | index |
| tax | `dividend-tax-quick` | 배당소득세 계산 | enrichments-ext-a.ts | 201 | Y | 44 | 3 | 343 | 0 | 0 | 3 | - | Y | index |
| tax | `earned-income-tax-quick` | 근로소득세 간편 계산 | enrichments.ts | 165 | Y | 63 | 3 | 380 | 0 | 0 | 3 | - | - | index |
| tax | `gift-tax-quick` | 증여세 간편 계산 | enrichments.ts | 183 | Y | 77 | 3 | 380 | 0 | 0 | 3 | - | Y | index |
| tax | `import-tax-quick` | 해외 직구 관세·부가세 계산 | enrichments-ext-a.ts | 185 | Y | 67 | 3 | 322 | 0 | 0 | 3 | - | - | index |
| tax | `income-tax-bracket-sim` | 소득세 누진세율 시뮬레이터 | enrichments.ts | 216 | Y | 52 | 3 | 387 | 0 | 0 | 3 | - | Y | index |
| tax | `inheritance-tax-sim` | 상속세 시뮬레이터 | enrichments.ts | 206 | Y | 62 | 3 | 342 | 0 | 0 | 3 | - | - | index |
| tax | `interest-tax-quick` | 이자소득세 계산 | enrichments-ext-a.ts | 188 | Y | 46 | 3 | 338 | 0 | 0 | 3 | - | Y | index |
| tax | `property-tax-quick` | 재산세 간편 계산 | enrichments.ts | 170 | Y | 94 | 3 | 410 | 0 | 0 | 4 | - | Y | index |
| tax | `real-estate-capital-gains-quick` | 부동산 양도세 간편 계산 | enrichments.ts | 240 | Y | 83 | 3 | 383 | 0 | 0 | 3 | - | - | index |
| tax | `registration-tax-quick` | 등록면허세 계산 | enrichments.ts | 234 | Y | 93 | 3 | 433 | 0 | 0 | 3 | - | - | index |
| tax | `retirement-income-tax-quick` | 퇴직소득세 간편 계산 | enrichments-ext-a.ts | 238 | Y | 137 | 3 | 359 | 0 | 0 | 3 | - | Y | index |
| tax | `stock-capital-gains-quick` | 주식 양도세 간편 계산 | enrichments-ext-a.ts | 180 | Y | 84 | 3 | 328 | 0 | 0 | 3 | - | Y | index |
| tax | `vat-quick` | 부가가치세(VAT) 계산 | enrichments.ts | 191 | Y | 58 | 3 | 420 | 0 | 0 | 3 | - | Y | index |
| tax | `vat-reverse-quick` | 부가세 역산 (VAT 포함가 → 공급가) | enrichments-ext-a.ts | 190 | Y | 68 | 3 | 305 | 0 | 0 | 3 | - | - | index |
| salary | `annual-leave-pay-quick` | 연차수당 계산 | enrichments.ts | 167 | Y | 64 | 3 | 395 | 0 | 0 | 3 | - | Y | index |
| salary | `bonus-versus-raise` | 일회성 보너스와 기본급 인상 비교 | expandedFinance.ts | 237 | - | 46 | 3 | 93 | 0 | 0 | 1 | B01 | - | index |
| salary | `daily-pay` | 일급 계산 | enrichments-ext-a.ts | 167 | Y | 38 | 3 | 319 | 0 | 0 | 3 | - | - | index |
| salary | `holiday-allowance-quick` | 주휴수당 계산 | enrichments.ts | 185 | Y | 46 | 3 | 399 | 0 | 0 | 3 | - | Y | index |
| salary | `hourly-to-yearly` | 시급 → 연봉 환산 | enrichments.ts | 187 | Y | 80 | 3 | 407 | 0 | 0 | 3 | - | - | index |
| salary | `irregular-income-baseline` | 불규칙 수입의 생활비 점검 | expandedFinance.ts | 232 | - | 53 | 3 | 91 | 0 | 0 | 1 | B01 | - | index |
| salary | `night-shift-pay-quick` | 야간 근로 수당 계산 | enrichments.ts | 190 | Y | 54 | 3 | 393 | 0 | 0 | 3 | - | - | index |
| salary | `overtime-pay-quick` | 시간외 수당 계산 | enrichments.ts | 194 | Y | 51 | 3 | 448 | 0 | 0 | 3 | - | - | index |
| salary | `salary-purchasing-power` | 물가 반영 실질 월급 비교 | expandedFinance.ts | 233 | - | 57 | 3 | 99 | 1 | 0 | 1 | B01 | - | index |
| salary | `salary-raise-timing` | 연봉 인상 적용월의 올해 소득 | expandedFinance.ts | 235 | Y | 37 | 3 | 90 | 0 | 0 | 1 | B01 | - | index |
| salary | `severance-pay-quick` | 퇴직금 간편 계산 | enrichments.ts | 166 | Y | 65 | 3 | 477 | 0 | 0 | 3 | - | Y | index |
| salary | `split-payday-budget` | 월 2회 급여의 현금 부족일 | expandedFinance.ts | 238 | Y | 48 | 3 | 120 | 0 | 0 | 1 | B01 | - | index |
| salary | `unemployment-benefit` | 실업급여 간편 계산기 | batch2.ts | 94 | Y | 67 | 3 | 334 | 0 | 0 | 5 | - | Y | index |
| salary | `unpaid-leave-budget` | 무급휴가 급여 감소 예산 | expandedFinance.ts | 238 | - | 46 | 3 | 110 | 0 | 0 | 1 | B01 | - | index |
| salary | `weekend-pay-quick` | 휴일 근로 수당 | enrichments-ext-a.ts | 173 | Y | 98 | 3 | 336 | 0 | 0 | 3 | - | - | index |
| salary | `weekly-pay` | 주급 계산 | enrichments-ext-a.ts | 176 | Y | 37 | 3 | 272 | 0 | 0 | 3 | - | - | index |
| salary | `yearly-to-hourly` | 연봉 → 시급 환산 | enrichments-ext-a.ts | 199 | Y | 45 | 3 | 327 | 0 | 0 | 3 | - | - | index |
| loan | `bullet-loan` | 만기일시 상환 계산 | enrichments-ext-a.ts | 170 | - | 59 | 3 | 333 | 0 | 0 | 3 | - | Y | index |
| loan | `credit-line-daily-interest` | 마이너스통장 잔액 구간별 이자 | expandedFinance.ts | 231 | Y | 40 | 3 | 99 | 1 | 0 | 1 | B01 | - | index |
| loan | `debt-avalanche-vs-snowball` | 고금리 우선·소액 우선 상환 비교 | expandedFinance.ts | 240 | Y | 48 | 3 | 101 | 1 | 0 | 1 | B01 | - | index |
| loan | `debt-consolidation-payment` | 두 대출 통합 상환 비교 | expandedFinance.ts | 239 | - | 60 | 3 | 95 | 1 | 0 | 1 | B01 | - | index |
| loan | `dsr-quick` | DSR 한도 계산 | enrichments.ts | 202 | Y | 56 | 3 | 474 | 0 | 0 | 3 | - | Y | index |
| loan | `extra-payment-term` | 매달 추가 상환의 기간 단축 | expandedFinance.ts | 225 | Y | 39 | 3 | 105 | 1 | 0 | 1 | B01 | - | index |
| loan | `level-principal-payment` | 원금균등 상환 계산 | enrichments-ext-a.ts | 159 | - | 98 | 3 | 299 | 0 | 0 | 3 | - | Y | index |
| loan | `loan-affordability` | 내 연봉 가능 대출액 | enrichments.ts | 170 | Y | 68 | 3 | 411 | 0 | 0 | 3 | - | Y | index |
| loan | `loan-balance-after-payments` | 납입 횟수별 대출 잔액 | expandedFinance.ts | 227 | - | 57 | 3 | 83 | 1 | 0 | 1 | B01 | - | index |
| loan | `loan-cashflow-effective-rate` | 선취 수수료 포함 대출 유효금리 | expandedFinance.ts | 237 | - | 54 | 3 | 126 | 1 | 0 | 1 | B01 | - | index |
| loan | `loan-interest-principal-split` | 이번 달 원금·이자 분해 | expandedFinance.ts | 234 | Y | 45 | 3 | 96 | 1 | 0 | 1 | B01 | - | index |
| loan | `loan-monthly-payment` | 대출 월 상환액 계산 | enrichments-ext-a.ts | 172 | - | 97 | 3 | 333 | 0 | 0 | 3 | - | Y | index |
| loan | `loan-refinance-savings` | 대출 갈아타기 절감액 | enrichments.ts | 177 | Y | 72 | 3 | 415 | 0 | 0 | 3 | - | - | index |
| loan | `loan-term-extension-cost` | 대출 만기 연장의 총비용 | expandedFinance.ts | 233 | - | 34 | 3 | 82 | 1 | 0 | 1 | B01 | - | index |
| loan | `loan-total-interest` | 대출 총 이자 계산 | enrichments-ext-a.ts | 178 | - | 97 | 3 | 336 | 0 | 0 | 3 | - | Y | index |
| loan | `ltv-quick` | LTV 한도 계산 | enrichments.ts | 238 | Y | 51 | 3 | 428 | 0 | 0 | 3 | - | Y | index |
| loan | `lump-sum-prepayment-term` | 목돈 중도상환의 완납 시점 | expandedFinance.ts | 232 | - | 48 | 3 | 91 | 1 | 0 | 1 | B01 | - | index |
| loan | `monthly-installment` | 할부 이자 계산 | enrichments-ext-a.ts | 169 | - | 90 | 3 | 317 | 0 | 0 | 3 | - | Y | index |
| loan | `payment-holiday-cost` | 납입 유예 이자와 이후 상환액 | expandedFinance.ts | 242 | - | 57 | 3 | 91 | 1 | 0 | 1 | B01 | - | index |
| loan | `prepayment-fee-quick` | 중도상환 수수료 계산 | enrichments.ts | 246 | Y | 61 | 3 | 478 | 0 | 0 | 3 | - | - | index |
| loan | `refinance-break-even` | 대환대출 비용 회수 기간 | expandedFinance.ts | 236 | - | 40 | 3 | 116 | 1 | 0 | 1 | B01 | - | index |
| loan | `variable-rate-stress` | 대출 금리 상승 부담 점검 | expandedFinance.ts | 226 | - | 46 | 3 | 84 | 1 | 0 | 1 | B01 | - | index |
| real-estate | `area-conversion` | 평·제곱미터 변환 | enrichments-ext-b.ts | 187 | Y | 38 | 3 | 363 | 0 | 0 | 3 | - | - | index |
| real-estate | `deposit-equivalent` | 월세 → 전세금 환산 | enrichments-ext-b.ts | 182 | Y | 63 | 3 | 409 | 0 | 0 | 3 | - | - | index |
| real-estate | `home-maintenance-reserve` | 집수리 준비 월 적립액 계산기 | expandedPractical.ts | 255 | - | 54 | 3 | 91 | 0 | 0 | 2 | B02 | - | index |
| real-estate | `housing-affordability-quick` | 내가 살 수 있는 집값 | enrichments-ext-b.ts | 203 | Y | 112 | 3 | 415 | 0 | 0 | 3 | - | - | index |
| real-estate | `jeonse-loan-cost` | 전세대출 월 이자 | enrichments.ts | 179 | Y | 63 | 3 | 416 | 0 | 0 | 3 | - | - | index |
| real-estate | `jeonse-vs-monthly-cost` | 전세 vs 월세 월 비용 | enrichments-ext-b.ts | 198 | Y | 112 | 3 | 439 | 0 | 0 | 3 | - | - | index |
| real-estate | `monthly-rent-tax-credit-quick` | 월세 세액공제 환급 | enrichments.ts | 199 | Y | 88 | 3 | 469 | 0 | 0 | 3 | - | - | index |
| real-estate | `mortgage-monthly-quick` | 주택담보대출 월 상환 | enrichments.ts | 191 | Y | 63 | 3 | 479 | 0 | 0 | 3 | - | Y | index |
| real-estate | `moving-cost-quick` | 이사 비용 추정 | enrichments-ext-b.ts | 209 | Y | 83 | 3 | 401 | 0 | 0 | 3 | - | - | index |
| real-estate | `real-estate-flip-cost` | 단기 매매 부대비용 | enrichments-ext-b.ts | 219 | Y | 113 | 3 | 401 | 0 | 0 | 3 | - | - | index |
| real-estate | `relocation-payback` | 이사 초기비용 회수기간 계산기 | expandedPractical.ts | 251 | - | 50 | 3 | 113 | 0 | 0 | 2 | B02 | - | index |
| real-estate | `renovation-budget-buffer` | 리모델링 예비비·추가공사 예산 계산기 | expandedPractical.ts | 252 | - | 58 | 3 | 104 | 0 | 0 | 2 | B02 | - | index |
| real-estate | `rent-free-effective-cost` | 렌트프리 실질 월 임대비용 계산기 | expandedPractical.ts | 244 | - | 56 | 3 | 122 | 0 | 0 | 2 | B02 | - | index |
| real-estate | `rental-prorated-rent` | 월세·관리비 일할 정산 계산기 | expandedPractical.ts | 255 | - | 50 | 3 | 103 | 0 | 0 | 2 | B02 | - | index |
| real-estate | `rental-yield` | 임대 수익률 | enrichments-ext-b.ts | 192 | Y | 35 | 3 | 387 | 0 | 0 | 3 | - | - | index |
| real-estate | `roommate-utility-share` | 동거 공과금 체류일수 분담 계산기 | expandedPractical.ts | 272 | Y | 46 | 3 | 106 | 0 | 0 | 2 | B02 | - | index |
| real-estate | `storage-unit-cost` | 보관창고 칸수·임대예산 계산기 | expandedPractical.ts | 253 | - | 53 | 3 | 88 | 0 | 0 | 2 | B02 | - | index |
| real-estate | `vacancy-carrying-cost` | 공실 유지비·놓친 임대료 계산기 | expandedPractical.ts | 248 | - | 59 | 3 | 104 | 0 | 0 | 2 | B02 | - | index |
| investment | `bond-yield-quick` | 채권 수익률 계산 | enrichments-ext-a.ts | 196 | - | 85 | 3 | 354 | 0 | 0 | 3 | - | - | index |
| investment | `cagr-quick` | 연평균 수익률 (CAGR) | enrichments.ts | 155 | - | 78 | 3 | 497 | 0 | 0 | 3 | - | Y | index |
| investment | `compound-interest-quick` | 복리 간편 계산기 | enrichments.ts | 182 | Y | 53 | 3 | 432 | 0 | 0 | 3 | - | Y | index |
| investment | `deposit-break-switch` | 예금 중도해지 후 갈아타기 비교 | expandedFinance.ts | 238 | - | 55 | 3 | 107 | 1 | 0 | 1 | B01 | - | index |
| investment | `dividend-yield-quick` | 배당 수익률 계산 | enrichments.ts | 199 | Y | 52 | 3 | 516 | 0 | 0 | 3 | - | - | index |
| investment | `dollar-cost-average` | 적립식 투자 시뮬 | enrichments-ext-a.ts | 186 | - | 96 | 3 | 332 | 0 | 0 | 3 | - | - | index |
| investment | `emergency-fund-runway` | 현재 비상금으로 버틸 기간 | expandedFinance.ts | 231 | - | 49 | 3 | 86 | 0 | 0 | 1 | B01 | - | index |
| investment | `emergency-fund-target` | 생활비 기준 비상금 부족액 | expandedFinance.ts | 239 | - | 51 | 3 | 122 | 0 | 0 | 1 | B01 | - | index |
| investment | `etf-fee-impact` | ETF 운용수수료 누적 영향 | enrichments-ext-a.ts | 207 | - | 98 | 3 | 370 | 0 | 0 | 3 | - | - | index |
| investment | `exchange-impact-quick` | 환율 변동 자산 영향 | enrichments.ts | 194 | Y | 50 | 3 | 479 | 0 | 0 | 3 | - | - | index |
| investment | `fire-target` | FIRE 목표 자산 | enrichments-ext-a.ts | 181 | Y | 69 | 3 | 352 | 0 | 0 | 3 | - | Y | index |
| investment | `inflation-impact-quick` | 인플레이션 구매력 영향 | enrichments-ext-a.ts | 198 | Y | 80 | 3 | 321 | 0 | 0 | 3 | - | - | index |
| investment | `investment-drawdown-recovery` | 손실 회복에 필요한 수익률 | expandedFinance.ts | 233 | Y | 20 | 3 | 108 | 0 | 0 | 1 | B01 | - | index |
| investment | `investment-fee-break-even` | 정액·정률 투자 수수료 교차점 | expandedFinance.ts | 235 | - | 42 | 3 | 98 | 1 | 0 | 1 | B01 | - | index |
| investment | `portfolio-allocation` | 포트폴리오 배분 시뮬 | enrichments-ext-a.ts | 186 | Y | 78 | 3 | 337 | 0 | 0 | 3 | - | - | index |
| investment | `portfolio-rebalance-amount` | 목표 비중으로 리밸런싱 금액 | expandedFinance.ts | 244 | Y | 36 | 3 | 102 | 1 | 0 | 1 | B01 | - | index |
| investment | `real-return-quick` | 실질 수익률 (인플레이션 차감) | enrichments-ext-a.ts | 173 | Y | 48 | 3 | 340 | 0 | 0 | 3 | - | - | index |
| investment | `rule-of-72-quick` | 72의 법칙 — 자산 2배 시간 | enrichments-ext-a.ts | 177 | Y | 25 | 3 | 319 | 0 | 0 | 3 | - | - | index |
| investment | `savings-beginning-vs-end` | 월초·월말 적립 시점 비교 | expandedFinance.ts | 234 | - | 45 | 3 | 82 | 1 | 0 | 1 | B01 | - | index |
| investment | `savings-contribution-pause` | 저축 일시 중단의 목표 차이 | expandedFinance.ts | 234 | - | 38 | 3 | 101 | 1 | 0 | 1 | B01 | - | index |
| investment | `savings-contribution-stepup` | 매년 저축액 증액 시뮬레이션 | expandedFinance.ts | 237 | Y | 60 | 3 | 92 | 1 | 0 | 1 | B01 | - | index |
| investment | `savings-goal-time` | 저축 목표 도달 시간 | enrichments-ext-a.ts | 181 | - | 81 | 3 | 314 | 0 | 0 | 3 | - | - | index |
| investment | `savings-ladder-cashflow` | 예금 사다리 만기 유동성 | expandedFinance.ts | 244 | - | 50 | 3 | 105 | 1 | 0 | 1 | B01 | - | index |
| investment | `savings-rate-after-raise` | 월급 인상 후 저축률 계획 | expandedFinance.ts | 229 | - | 50 | 3 | 84 | 0 | 0 | 1 | B01 | - | index |
| investment | `savings-required-monthly` | 목표까지 필요한 월 저축액 | expandedFinance.ts | 238 | Y | 59 | 3 | 93 | 1 | 0 | 1 | B01 | - | index |
| investment | `savings-start-delay` | 저축 시작을 미룬 기회비용 | expandedFinance.ts | 237 | - | 44 | 3 | 75 | 1 | 0 | 1 | B01 | - | index |
| investment | `savings-tax-rate-compare` | 세후 이자로 예금 조건 비교 | expandedFinance.ts | 230 | - | 33 | 3 | 107 | 1 | 0 | 1 | B01 | - | index |
| investment | `simple-interest-quick` | 단리 계산기 | enrichments-ext-a.ts | 165 | - | 42 | 3 | 298 | 0 | 0 | 3 | - | - | index |
| investment | `sinking-fund-monthly` | 연간 비정기 지출의 월 적립 | expandedFinance.ts | 233 | - | 35 | 3 | 94 | 0 | 0 | 1 | B01 | - | index |
| investment | `stock-pl-quick` | 주식 손익 계산 | enrichments-ext-a.ts | 166 | - | 68 | 3 | 306 | 0 | 0 | 3 | - | - | index |
| investment | `systematic-withdrawal-runway` | 월 정액 인출의 자금 유지 기간 | expandedFinance.ts | 247 | Y | 48 | 3 | 98 | 1 | 0 | 1 | B01 | - | index |
| insurance | `auto-insurance-quick` | 자동차보험 견적 추정 | enrichments.ts | 162 | Y | 40 | 3 | 459 | 0 | 0 | 3 | - | - | index |
| insurance | `cancer-insurance-needs` | 암보험 권장 보장액 | enrichments-ext-b.ts | 205 | Y | 35 | 3 | 397 | 0 | 0 | 3 | - | - | index |
| insurance | `child-insurance-needs` | 어린이보험 권장 | enrichments-ext-b.ts | 187 | Y | 65 | 3 | 423 | 0 | 0 | 3 | - | - | index |
| insurance | `fire-insurance-quick` | 화재보험 보장 한도 | enrichments-ext-b.ts | 189 | Y | 53 | 3 | 405 | 0 | 0 | 3 | - | - | index |
| insurance | `life-insurance-needs` | 생명보험 필요 보장액 | enrichments-ext-b.ts | 216 | Y | 33 | 3 | 409 | 0 | 0 | 3 | - | - | index |
| insurance | `medical-expense-coverage` | 실손보험 청구 가능액 | enrichments.ts | 185 | Y | 63 | 3 | 436 | 0 | 0 | 3 | - | - | index |
| insurance | `pet-insurance-quick` | 반려동물 보험료 | enrichments-ext-b.ts | 188 | Y | 73 | 3 | 376 | 0 | 0 | 3 | - | - | index |
| insurance | `travel-insurance-quick` | 여행자 보험 권장 | enrichments-ext-b.ts | 206 | Y | 23 | 3 | 394 | 0 | 0 | 3 | - | - | index |
| business | `advertising-profit-roas` | 광고 공헌이익·손익분기 ROAS 계산기 | expandedPractical.ts | 261 | - | 60 | 3 | 109 | 1 | 0 | 2 | B02 | - | index |
| business | `break-even-order-count` | 월 고정비 손익분기 주문수 계산기 | expandedPractical.ts | 250 | - | 59 | 3 | 122 | 1 | 0 | 2 | B02 | - | index |
| business | `business-cashflow-runway` | 사업 자금 runway | enrichments-ext-b.ts | 202 | Y | 28 | 3 | 396 | 0 | 0 | 3 | - | - | index |
| business | `business-margin-quick` | 사업 마진율 계산 | enrichments-ext-b.ts | 181 | - | 35 | 3 | 411 | 0 | 0 | 3 | - | - | index |
| business | `cash-conversion-cycle` | 현금전환주기·운전자금 계산기 | expandedPractical.ts | 254 | - | 54 | 3 | 112 | 1 | 0 | 2 | B02 | - | index |
| business | `corporate-tax-quick` | 법인세 간편 계산 | enrichments-ext-b.ts | 195 | Y | 99 | 3 | 410 | 0 | 0 | 3 | - | - | index |
| business | `customer-acquisition-payback` | 고객획득비 회수기간 계산기 | expandedPractical.ts | 244 | - | 49 | 3 | 104 | 0 | 0 | 2 | B02 | - | index |
| business | `discount-volume-target` | 할인 후 이익 유지 판매량 계산기 | expandedPractical.ts | 257 | - | 48 | 3 | 112 | 0 | 0 | 2 | B02 | - | index |
| business | `employee-cost-quick` | 직원 인건비 (회사 부담) | enrichments-ext-b.ts | 197 | Y | 83 | 3 | 412 | 0 | 0 | 3 | - | - | index |
| business | `equipment-lease-buy` | 장비 임대·매입 총비용 비교 계산기 | expandedPractical.ts | 255 | - | 55 | 3 | 107 | 0 | 0 | 2 | B02 | - | index |
| business | `freelancer-yearly-quick` | 프리랜서 연 수입 시뮬 | enrichments.ts | 216 | Y | 80 | 3 | 484 | 0 | 0 | 3 | - | Y | index |
| business | `hourly-billing-rate` | 프리랜서 시간당 청구가 | enrichments-ext-b.ts | 204 | Y | 49 | 3 | 402 | 0 | 0 | 3 | - | - | index |
| business | `inventory-order-quantity` | 경제적 발주량 EOQ 계산기 | expandedPractical.ts | 266 | - | 76 | 3 | 113 | 1 | 0 | 2 | B02 | - | index |
| business | `inventory-turnover-days` | 재고회전율·평균 보유일수 계산기 | expandedPractical.ts | 239 | - | 59 | 3 | 109 | 1 | 0 | 2 | B02 | - | index |
| business | `invoice-early-payment` | 조기결제 할인과 자금비용 비교 계산기 | expandedPractical.ts | 249 | - | 53 | 3 | 99 | 0 | 0 | 2 | B02 | - | index |
| business | `marketplace-settlement` | 마켓 판매대금 정산 예상액 계산기 | expandedPractical.ts | 257 | - | 46 | 3 | 110 | 0 | 0 | 2 | B02 | - | index |
| business | `meeting-cost` | 회의 시간·참석 인건비 계산기 | expandedPractical.ts | 263 | - | 61 | 3 | 92 | 0 | 0 | 2 | B02 | - | index |
| business | `online-order-profit` | 온라인 주문 건별 공헌이익 계산기 | expandedPractical.ts | 250 | - | 54 | 3 | 92 | 0 | 0 | 2 | B02 | - | index |
| business | `operating-cashflow-plan` | 영업현금흐름 운영예산 계산기 | expandedPractical.ts | 245 | - | 46 | 3 | 100 | 0 | 0 | 2 | B02 | - | index |
| business | `product-return-cost` | 상품 반품 처리비용 계산기 | expandedPractical.ts | 244 | - | 47 | 3 | 86 | 0 | 0 | 2 | B02 | - | index |
| business | `project-budget-variance` | 프로젝트 완료예산·초과액 계산기 | expandedPractical.ts | 254 | - | 42 | 3 | 86 | 0 | 0 | 2 | B02 | - | index |
| business | `receivables-aging-loss` | 미수금 구간별 회수손실 시나리오 | expandedPractical.ts | 247 | - | 47 | 3 | 95 | 0 | 0 | 2 | B02 | - | index |
| business | `side-business-net` | 부업 순수입 | enrichments-ext-b.ts | 210 | Y | 101 | 3 | 416 | 0 | 0 | 3 | - | - | index |
| business | `simple-vs-general-vat` | 간이과세자 vs 일반과세자 | enrichments-ext-b.ts | 201 | Y | 82 | 3 | 413 | 0 | 0 | 3 | - | - | index |
| business | `stock-reorder-point` | 재주문 시점·재고 여유 계산기 | expandedPractical.ts | 258 | - | 61 | 3 | 91 | 0 | 0 | 2 | B02 | - | index |
| business | `wholesale-price-target` | 목표마진 도매 견적단가 계산기 | expandedPractical.ts | 250 | - | 60 | 3 | 103 | 0 | 0 | 2 | B02 | - | index |
| life | `annual-plan-break-even` | 연간 구독권 손익분기 이용기간 계산기 | expandedPractical.ts | 263 | Y | 48 | 3 | 97 | 0 | 0 | 2 | B02 | - | index |
| life | `appliance-energy-replacement` | 가전 교체 전력절감·회수기간 계산기 | expandedPractical.ts | 258 | - | 57 | 3 | 108 | 1 | 0 | 2 | B02 | - | index |
| life | `bulk-unit-price-waste` | 폐기율 반영 대용량 상품 단가 비교 | expandedPractical.ts | 258 | Y | 48 | 3 | 88 | 0 | 0 | 2 | B02 | - | index |
| life | `car-total-ownership` | 차량 총보유비·월평균 비용 계산기 | expandedPractical.ts | 246 | - | 55 | 3 | 93 | 0 | 0 | 2 | B02 | - | index |
| life | `cloud-storage-growth` | 클라우드 저장량 증가·초과비용 계산기 | expandedPractical.ts | 260 | - | 64 | 3 | 99 | 0 | 0 | 2 | B02 | - | index |
| life | `commute-time-value` | 출퇴근 수단 시간·비용 비교 계산기 | expandedPractical.ts | 253 | - | 57 | 3 | 75 | 0 | 0 | 2 | B02 | - | index |
| life | `coupon-stack-savings` | 정액·정률 쿠폰 적용순서 비교 계산기 | expandedPractical.ts | 272 | Y | 86 | 3 | 110 | 0 | 0 | 2 | B02 | - | index |
| life | `data-plan-overage` | 데이터 초과요금·요금제 변경 비교 계산기 | expandedPractical.ts | 264 | - | 58 | 3 | 115 | 0 | 0 | 2 | B02 | - | index |
| life | `delivery-fee-split` | 배달비 1인당 | enrichments-ext-c.ts | 231 | Y | 29 | 3 | 444 | 0 | 0 | 3 | - | - | index |
| life | `discount-percent` | 할인율 계산 | enrichments-ext-c.ts | 237 | Y | 47 | 3 | 476 | 0 | 0 | 3 | - | - | index |
| life | `diy-service-time-cost` | 직접 작업·전문가 의뢰 비용 비교 계산기 | expandedPractical.ts | 257 | - | 38 | 3 | 94 | 0 | 0 | 2 | B02 | - | index |
| life | `electricity-bill` | 전기료 추정 | enrichments-ext-c.ts | 253 | Y | 160 | 3 | 496 | 0 | 0 | 3 | - | - | index |
| life | `ev-charge-vs-fuel` | 전기차·내연차 월 에너지비 비교 계산기 | expandedPractical.ts | 264 | - | 57 | 3 | 99 | 0 | 0 | 2 | B02 | - | index |
| life | `event-budget-headcount` | 예산별 행사 수용인원 계산기 | expandedPractical.ts | 259 | Y | 67 | 3 | 105 | 0 | 0 | 2 | B02 | - | index |
| life | `free-shipping-threshold` | 무료배송 추가구매 비용 비교 계산기 | expandedPractical.ts | 265 | - | 55 | 3 | 99 | 0 | 0 | 2 | B02 | - | index |
| life | `fuel-cost-trip` | 주유비 계산 | enrichments-ext-c.ts | 252 | - | 56 | 3 | 457 | 0 | 0 | 3 | - | Y | index |
| life | `increase-decrease-percent` | 증감률 계산 | enrichments-ext-c.ts | 240 | Y | 52 | 3 | 451 | 0 | 0 | 3 | - | - | index |
| life | `parking-pass-break-even` | 주차 정기권 손익분기 이용일 계산기 | expandedPractical.ts | 255 | - | 48 | 3 | 101 | 0 | 0 | 2 | B02 | - | index |
| life | `percent-of` | X%의 N | enrichments-ext-c.ts | 258 | Y | 58 | 3 | 501 | 0 | 0 | 3 | - | Y | index |
| life | `prepaid-pass-usage` | 횟수권 필요한 이용횟수 계산기 | expandedPractical.ts | 259 | - | 52 | 3 | 109 | 0 | 0 | 2 | B02 | - | index |
| life | `return-or-exchange-cost` | 반품 후 교환·재구매 추가비용 계산기 | expandedPractical.ts | 255 | - | 48 | 3 | 109 | 0 | 0 | 2 | B02 | - | index |
| life | `reusable-item-payback` | 다회용품 비용 회수 이용횟수 계산기 | expandedPractical.ts | 251 | - | 68 | 3 | 102 | 0 | 0 | 2 | B02 | - | index |
| life | `split-bill` | 더치페이 | enrichments-ext-c.ts | 254 | Y | 20 | 3 | 463 | 0 | 0 | 3 | - | Y | index |
| life | `subscription-monthly` | 구독 월 비용 합산 | enrichments-ext-c.ts | 238 | Y | 40 | 3 | 457 | 0 | 0 | 3 | - | Y | index |
| life | `time-zone-converter` | 시차 계산기 | enrichments-ext-c.ts | 247 | Y | 53 | 3 | 486 | 0 | 0 | 3 | - | - | index |
| life | `tip-calculator` | 팁 계산기 | enrichments-ext-c.ts | 254 | Y | 37 | 3 | 481 | 0 | 0 | 3 | - | - | index |
| life | `travel-luggage-shipping` | 추가 수하물·짐 배송 비용 비교 계산기 | expandedPractical.ts | 255 | - | 53 | 3 | 102 | 0 | 0 | 2 | B02 | - | index |
| life | `travel-shared-budget` | 여행 공동경비·개인 예산 계산기 | expandedPractical.ts | 267 | - | 54 | 3 | 99 | 0 | 0 | 2 | B02 | - | index |
| life | `unit-converter-length` | 길이 단위 변환 (m·km·mi) | enrichments-ext-c.ts | 255 | Y | 53 | 3 | 507 | 0 | 0 | 3 | - | Y | index |
| life | `water-bill` | 수도료 추정 | enrichments-ext-c.ts | 242 | Y | 47 | 3 | 474 | 0 | 0 | 3 | - | - | index |
| life | `what-percent` | A는 B의 몇 %? | enrichments-ext-c.ts | 238 | Y | 43 | 3 | 440 | 0 | 0 | 3 | - | - | index |
| health | `bmi-quick` | BMI 비만도 | enrichments-ext-c.ts | 272 | Y | 130 | 3 | 486 | 0 | 0 | 3 | - | Y | index |
| health | `bmr-quick` | 기초대사량 (BMR) | enrichments-ext-c.ts | 261 | Y | 85 | 3 | 486 | 0 | 0 | 3 | - | - | index |
| health | `daily-calorie-quick` | 일일 권장 칼로리 | enrichments-ext-c.ts | 281 | Y | 95 | 3 | 498 | 0 | 0 | 3 | - | - | index |
| health | `sleep-cycle-quick` | 수면 주기 계산 | enrichments-ext-c.ts | 239 | Y | 90 | 3 | 477 | 0 | 0 | 3 | - | - | index |
| health | `water-intake-quick` | 권장 물 섭취량 | enrichments-ext-c.ts | 254 | Y | 71 | 3 | 454 | 0 | 0 | 3 | - | - | index |
| family | `alimony-quick` | 양육비 산정 | enrichments-ext-c.ts | 249 | - | 85 | 3 | 447 | 0 | 0 | 3 | - | - | index |
| family | `allowance-growth-plan` | 자녀 용돈 증액·저축 계획 | expandedFinance.ts | 235 | Y | 50 | 3 | 90 | 0 | 0 | 1 | B01 | - | index |
| family | `baby-yearly-cost` | 자녀 양육비 1년차 | enrichments-ext-c.ts | 235 | Y | 44 | 3 | 445 | 0 | 0 | 3 | - | - | index |
| family | `childcare-fee` | 어린이집 보육료 | enrichments-ext-c.ts | 252 | Y | 35 | 3 | 455 | 0 | 0 | 3 | - | - | index |
| family | `childcare-work-return` | 복직 후 보육비 차감 순수입 | expandedFinance.ts | 241 | - | 36 | 3 | 98 | 0 | 0 | 1 | B01 | - | index |
| family | `couple-expense-income-split` | 부부 소득 비례 생활비 분담 | expandedFinance.ts | 250 | Y | 40 | 3 | 102 | 0 | 0 | 1 | B01 | - | index |
| family | `education-cost-cumulative` | 교육비 18년 누적 | enrichments-ext-c.ts | 250 | Y | 52 | 3 | 468 | 0 | 0 | 3 | - | - | index |
| family | `education-savings-gap` | 교육비 물가 반영 준비 저축 | expandedFinance.ts | 249 | - | 57 | 3 | 104 | 1 | 0 | 1 | B01 | - | index |
| family | `eldercare-family-budget` | 가족 돌봄 실비 월 예산 | expandedFinance.ts | 241 | - | 62 | 3 | 105 | 0 | 0 | 1 | B01 | - | index |
| family | `family-event-fund` | 가족 행사 부족자금 월 적립 | expandedFinance.ts | 254 | - | 42 | 3 | 93 | 0 | 0 | 1 | B01 | - | index |
| family | `family-insurance-premium-share` | 가족 보험료의 수입 비중 | expandedFinance.ts | 237 | Y | 49 | 3 | 114 | 0 | 0 | 1 | B01 | - | index |
| family | `family-medical-budget` | 가족 의료비 본인부담 예산 | expandedFinance.ts | 240 | - | 42 | 3 | 101 | 0 | 0 | 1 | B01 | - | index |
| family | `parental-leave-household-gap` | 육아휴직 가계 부족자금 | expandedFinance.ts | 248 | - | 59 | 3 | 102 | 0 | 0 | 1 | B01 | - | index |
| family | `shared-goal-contribution` | 가구 여유자금별 공동 저축 분담 | expandedFinance.ts | 246 | - | 48 | 3 | 102 | 0 | 0 | 1 | B01 | - | index |
| family | `single-income-transition-budget` | 외벌이 전환 후 가계 여유 | expandedFinance.ts | 254 | - | 42 | 3 | 99 | 0 | 0 | 1 | B01 | - | index |
| family | `wedding-cost-quick` | 결혼 평균 비용 | enrichments-ext-c.ts | 245 | Y | 31 | 3 | 463 | 0 | 0 | 3 | - | - | index |
| career | `bonus-repayment-reserve` | 사이닝보너스 반환 준비액 | expandedFinance.ts | 230 | - | 30 | 3 | 93 | 0 | 0 | 1 | B01 | - | index |
| career | `career-training-payback` | 직무교육 투자 비용 회수 | expandedFinance.ts | 239 | - | 54 | 3 | 102 | 0 | 0 | 1 | B01 | - | index |
| career | `commute-adjusted-offer` | 통근 비용·시간 포함 이직 비교 | expandedFinance.ts | 233 | - | 42 | 3 | 95 | 0 | 0 | 1 | B01 | - | index |
| career | `flex-time-tradeoff` | 근무시간 단축의 시간당 비용 | expandedFinance.ts | 228 | - | 43 | 3 | 112 | 0 | 0 | 1 | B01 | - | index |
| career | `job-transition-cash-gap` | 이직 급여 공백 준비금 | expandedFinance.ts | 242 | - | 50 | 3 | 100 | 0 | 0 | 1 | B01 | - | index |
| career | `work-from-home-savings` | 재택근무 전환 순절감액 | expandedFinance.ts | 231 | Y | 45 | 3 | 82 | 0 | 0 | 1 | B01 | - | index |
| currency | `currency-converter` | 환율 환산 | enrichments-ext-c.ts | 237 | Y | 56 | 3 | 475 | 0 | 0 | 3 | - | - | index |
| currency | `exchange-spread-cost` | 환전 우대율·수수료 비용 계산기 | expandedPractical.ts | 255 | - | 45 | 3 | 97 | 0 | 0 | 2 | B02 | - | index |
| currency | `export-quote-break-even-rate` | 수출 견적 손익분기 환율 계산기 | expandedPractical.ts | 265 | - | 44 | 3 | 115 | 0 | 0 | 2 | B02 | - | index |
| currency | `foreign-atm-cost` | 해외 ATM 인출 총비용 계산기 | expandedPractical.ts | 260 | - | 66 | 3 | 108 | 0 | 0 | 2 | B02 | - | index |
| currency | `leftover-currency-roundtrip` | 여행 잔돈 재환전 손익 계산기 | expandedPractical.ts | 263 | - | 37 | 3 | 86 | 0 | 0 | 2 | B02 | - | index |
| currency | `overseas-card-cost` | 해외 카드 결제 수수료 계산기 | expandedPractical.ts | 269 | - | 41 | 3 | 116 | 0 | 0 | 2 | B02 | - | index |
| currency | `remittance-received` | 해외송금 예산별 실제 수취액 계산기 | expandedPractical.ts | 250 | - | 40 | 3 | 101 | 1 | 0 | 2 | B02 | - | index |

## 4. 데이터 모델 메모 (스크립트 자동 판정)

- `sources` 는 batch 정의에만 존재하며 `index.ts` 병합 대상이 아니다 → enrichments 파일에 sources 를 추가해도 페이지에 나오지 않는다. S3-1 출처는 반드시 batch 파일(`batch1.ts`·`batch2.ts`·`expandedFinance.ts`·`expandedPractical.ts`) 의 정의에 넣어야 한다.
- `notes` 필드는 없다. 유의사항은 `caveats: string[]`, 결과 해석은 compute 가 돌려주는 `CalculatorResult.note`(본문 아님) 뿐이다.
- `index.ts` 병합은 `calc.x ?? enrichment.x` — batch 에 값이 있으면 enrichment 는 무시된다(설명 본문 파일 열 참고).
- enrichment 키 중 계산기가 없는 고아 키: 없음
- 두 enrichment 파일에 중복 등록된 슬러그(뒤 파일이 이김): 없음
- batch 배열 내 중복 슬러그: 없음
- allCalculators 길이 202 = getAllSlugs 202

