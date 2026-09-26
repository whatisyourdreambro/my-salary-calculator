# 5월 대량 가이드 — 키퍼 목록·308 통합 지도·잔여 정정 목록 (W2-C · 2026-09-26)

운영자 승인(2026-09-26): 13번 — 5월 대량 가이드 재작성(대표 약 39편)·통합(약 35편)·문자열 정정(약 110편) 즉시 시작, 14번 — 틀린 숫자를 담은 무유입 가이드를 재작성된 키퍼로 308 통합 즉시 시작. 이 문서는 W3-A(재작성·308)와 F-C(Tier C 정정)가 그대로 쓰는 입력이다. 사실 근거는 `docs/guides-facts-2026-10-A.md`(이하 "원장").

## 0. 입력과 판정 규칙

- 대상 모집단: 5/23 대량 배치 4개 모듈 181편 — `hot-news-2026-may.ts`(31), `hot-news-2026-extended.ts`(50), `hot-news-2026-deep-dive.ts`(50), `hot-bonus-tax-complete.ts`(50). 모든 슬러그는 작업 브랜치 `claude/r3-push1-20260926`(c59cce4d) 소스에서 존재를 확인했다.
- 유입 데이터(2026-09-26 운영 콘솔 내보내기, 저장소 밖 세션 작업 폴더의 `console/`):
  - GA4 90일(2026-06-28 ~ 09-25) 방문 페이지 '/guides/' 세션: `console/ga4/guides_landing_90d_totals.tsv`
  - 소스별 세션: `guides_landing_90d_by_source.tsv`. 네이버 페이지별 내보내기는 없으므로 소스에 "naver"가 들어간 세션(m.search.naver.com / referral, naver / organic 등)을 네이버 클릭 대용으로 썼다.
  - GSC 전체 기간(2025-09-08 ~ 2026-09-23) 페이지 클릭: `console/gsc/perf-full-pages.tsv`. 표 상한 1,000행이지만 경계 행이 클릭 0·노출 3이라, 표에 없는 가이드는 클릭 0으로 본다.
- 무유입 게이트(통합 출처 전부에 적용): GA4 방문 세션 ≥ 15, 또는 네이버 대용 세션 ≥ 5, 또는 GSC 클릭 > 0 이면 통합하지 않고 남긴다. 아래 40건은 모두 통과(최대 GA4 3·네이버 2·GSC 0).
- 통합 금지: OFFER_GUIDE_SLUGS 13개(`src/app/guides/[slug]/GuidePageClient.tsx` — credit-score-up-2026, credit-score-management, credit-score-850-strategy-2026, loan-types-comparison-2026, minus-loan-vs-credit-loan-2026, personal-loan-vs-debt-consolidation, first-home-buyer-loan, didimdol-newborn-special-loan-2026, newborn-special-loan-application-2026, newlywed-loan-limit-2x-2026, auto-loan-vs-lease-2026, jeonse-scam-prevention, jeonse-vs-monthly-rent-2026), coupang-fulfillment-night-pay-2026, bonus-vs-incentive-vs-allowance-2026, incentive-split-payout-2026, tax-free-meal-commute-2026, nurse-salary. 통합 지도에 이 슬러그는 출처로 없다.
- 목적지 규칙: 1·2차 키퍼이거나, 5월 배치 밖의 충실한 기존 가이드(HTML 3,500자 이상·H2 7개 이상·표 1개 이상, 2026 현행 수치 확인)만. 5월 배치의 비키퍼는 목적지가 될 수 없다.
- 표의 "GA4/네이버/GSC" = GA4 90일 방문 세션 / 그중 네이버 소스 세션 / GSC 전체 기간 클릭. "HTML" = 현재 본문 길이(자), "설명 기준선" = guideSpecAllow.json descriptionBaseline(재작성 뒤 guide.description 상한).

## 1. 1차 키퍼 12편 — 연말정산 묶음 (10/13 배포)

plan W3-A ① 목록 그대로. 12개 모두 존재, 교체 없음.

| # | 슬러그 | 모듈 | 현재 제목 | HTML | 설명 기준선 | GA4/네이버/GSC | 흡수하는 통합 출처 | 재작성 메모 (원장 번호) |
|---|---|---|---|---|---|---|---|---|
| 1 | credit-card-deduction-30-40-strategy-2026 | may | 신용카드 공제 25% 초과분 — 체크/전통시장/대중교통 전환 시 환급 60만원 추가 | 2,023 | 107 | 0/0/0 | card-25-before-bonus-2026, card-30-40-percent-bonus-2026, credit-card-deduction-limit-detail-2026, book-concert-museum-deduction-2026 | 한도표는 cardDeduction2026 값(A-01~A-07). 1.2억 구간·항목별 100만 추가 문구 삭제. 문화체육(도서·신문·공연·박물관·미술관·영화·체육시설) 30%는 총급여 7천만원 이하만. "성과급 받는 해엔 25% 문턱이 올라간다"를 한 단락으로 흡수 |
| 2 | parent-support-deduction-integration-2026 | may | 부모 부양 인적공제 + 의료비 통합 절세 — 매년 100만원 환급 | 1,826 | 97 | 0/0/0 | dependent-deduction-bonus-year-2026, parent-support-bonus-year-2026 | 인적공제 150만·경로우대 100만·장애인 200만(A-20·A-21). 의료비는 세액공제 15%라 한계세율을 곱하지 않는다(흡수 출처의 계산 오류). 65세 이상 부모 의료비는 700만 한도 밖(A-08) |
| 3 | medical-edu-donation-limits-2026 | extended | 의료비·교육비·기부금 한도 — 평균 직장인 135만원 환급 | 963 | 79 | 0/0/0 | medical-edu-donation-bonus-year-2026, medical-edu-donation-concentration-2026 | 의료 15/20/30%·3%·700만(A-08), 교육 300/900·본인 한도 없음(A-15), 기부 15%·1천만 초과 30%·종교단체 한도 산식(A-18). "성과급 받는 해엔 공제 효과 12%p" 류 문장은 세액공제에 해당하지 않음 |
| 4 | implant-dental-medical-deduction-2026 | may | 임플란트·치과 의료비 공제 — 4개 600만원 시 70만원 환급 | 1,668 | 107 | 1/0/0 | infertility-medical-20-percent-2026, eyewear-herb-implant-medical-2026, orthodontics-tax-deduction-2026, physical-therapy-tax-2026, psychiatry-medical-deduction-2026 | "의료비 항목별 공제" 키퍼로 넓힌다: 항목표(치과·교정·안경 50만·치료 목적 한약·정신과·도수·물리치료·난임 30%·미숙아 20%), 제외(미용·성형·건강증진 의약품), 실손보험금 차감(A-08~A-11). 통합 출처 5편의 검색 의도를 H2 하나씩으로 받지 말고 표 행으로 받는다 |
| 5 | postpartum-medical-deduction-200man-2026 | may | 2026 산후조리원 의료비 공제 200만원 — 최대 환급 30만원 | 1,432 | 106 | 2/0/0 | — | 출산 1회당 200만 × 15% = 30만(A-09·A-12). 조문에 총급여 요건 없음 |
| 6 | insurance-100man-limit-2026 | extended | 보장성 보험료 100만원 한도 — 종신·암·실손·자동차 합산 12만원 환급 | 860 | 68 | 0/0/0 | insurance-100-bonus-2026, disability-insurance-2026 | 일반 12%·장애인전용 15%, 각 100만 한도(A-13·A-14) — 최대 12만 + 15만 |
| 7 | housing-subscription-25man-deduction-2026 | may | 청약통장 매월 25만원 소득공제 300만원 — 매년 46만원 환급 + 청약 가점 | 1,431 | 98 | 1/1/0 | housing-25-bonus-2026 | 총급여 7천만 이하 무주택 세대주 또는 배우자, 연 300만 × 40% = 120만 소득공제, 2028년 말까지(A-26·A-27). 총급여 7천만 요건과 35% 구간은 같이 성립하지 않으므로 흡수 출처의 "35%면 42만" 문장은 받지 않는다 |
| 8 | earned-income-deduction-2026 | extended | 근로소득공제 + 근로소득세액공제 — 직장인 자동 200~400만원 절감 | 1,010 | 76 | 0/0/0 | — | §47 구간식·2천만 한도(A-24), §59 55%/30%·한도 체감식(A-25). 표는 엔진 값으로 계산 |
| 9 | standard-vs-special-deduction-2026 | extended | 표준세액공제 13만원 vs 특별공제 — 의료비 80만원이면 표준 유리 | 833 | 72 | 1/0/0 | — | 표준 13만의 적용 조건(A-19). 제목의 "의료비 80만원이면 표준 유리"는 총급여 3% 문턱에 달려 있어 일반화 불가 — 재계산하거나 제목에서 뺀다 |
| 10 | child-education-deduction-limit-2026 | extended | 자녀 교육비 공제 한도 — 미취학 300만원·대학 900만원 | 1,120 | 84 | 0/0/0 | — | 300/900·대학원 자녀 제외(A-15), 2026 신설 초등 1~2학년 예체능 학원(A-16), 부양가족 "나이 및 소득" 제한 문구 개정(A-17 — 효과는 국세청 해설 확인 뒤) |
| 11 | couple-split-bonus-year-2026 | bonus | 성과급 받는 해 부부 분산 — 의료비 600만 시 45만 절감 | 1,069 | 77 | 0/0/0 | — | "맞벌이 몰아주기"로 재구성: 카드는 25% 문턱이 낮은 쪽, 의료비는 3% 문턱이 낮은 쪽, 인적공제는 한계세율이 높은 쪽. 세액공제 항목(의료·교육·기부)은 한계세율과 무관함을 분명히 |
| 12 | newlywed-deduction-first-year-2026 | extended | 신혼부부 첫 연말정산 5가지 — 양가 부모 부양·취득세 200만원 | 823 | 73 | 0/0/0 | — | 혼인 세액공제 50만(2026년 말 이전 혼인신고, 1회 — A-28), 월세 배우자 추가공제(2026 신설 — A-29), 청약 배우자 공제(A-26). 제목의 "취득세 200만원"은 지방세 감면이라 연말정산 항목이 아님 — 확인 전엔 제목·본문에서 뺀다 |

같은 배포에서 할 일(키퍼 아님, H2 불변): `/guides/year-end-tax-2026` 메타만 개명(guidesContent.ts rawGuides, 설명 기준선 54자), 일반 연말정산 5편의 리드 문장·링크만 의도별로 정리 — year-end-tax-13-tips-2026=조건, year-end-tax-refund-secrets-2026=환급 차이, hometax-year-end-preview-2026=미리보기, year-end-tax-deductions-guide=항목, tax-refund-mistakes-2026=누락 공제. 이 중 3편은 아래 3절 잔여 목록에도 있다(같은 커밋에서 문자열 정정).

## 2. 2차 키퍼 13편 — 성과급 세금·4대보험·회사 성과급 (10/20 배포)

plan GUIDES-05 목록 그대로. 13개 모두 존재, 교체 없음. 모든 실수령 표는 `calcBonusNet`(src/lib/bonusTaxCalc)에 2026 요율을 명시적으로 넘겨 계산하고 guideBonusTables.test 로 고정한다.

| # | 슬러그 | 모듈 | 현재 제목 | HTML | 설명 기준선 | GA4/네이버/GSC | 흡수하는 통합 출처 | 재작성 메모 |
|---|---|---|---|---|---|---|---|---|
| 1 | bonus-1eok-net-payment-2026 | bonus | 성과급 1억 실수령 — 연봉 7천 시 세후 약 6,370만원 | 1,622 | 87 | 0/0/0 | — | 제목 숫자는 엔진 재계산값으로(B9 때 1,410만 과소 사례) |
| 2 | bonus-5000-net-payment-2026 | bonus | 성과급 5,000만 실수령 — 약 3,570만, IRP 더하면 3,690만 | 969 | 101 | 0/0/0 | — | 같음. IRP 효과는 A-30 공제율로 |
| 3 | bonus-health-4-percent-2026 | bonus | 성과급 건강보험 4.07% — 1억 시 본인 약 407만 | 1,239 | 108 | 1/0/0 | july-health-adjust-bonus-1eok-2026, july-health-adjust-bonus-detail-2026 | 3.595% × 1.1314 ≈ 4.067%(B-05~B-07). 정산은 4월(3/10 보수총액 통보 → 4월분 정산), 추가징수액이 그달 보험료 이상이면 12회 이내 분할(B-09). 월 상한 9,183,480원(본인 4,591,740원, B-08). "7월 정산" 표현 금지 |
| 4 | four-insurance-ceiling-summary-2026 | bonus | 4대보험 상한·하한 한 번에 — 성과급 1억 시 본인 부담 약 497만 | 1,550 | 86 | 2/2/0 | bonus-pension-45-ceiling-590-2026, bonus-employment-09-2026 | 연금 4.75%·기준소득월액 41만~659만(2026.7~2027.6, B-01·B-03·B-04), 건보 7.19%·월 상한(B-05·B-08), 고용 0.9%(B-10) |
| 5 | income-tax-8-step-bracket-2026 | bonus | 2026 종합소득세 8단계 누진세율 완벽 — 초과분만 높은 세율 | 1,897 | 81 | 1/0/0 | salary-bonus-calc-8step-2026, bonus-bracket-jump-2026 | 세율표(C-01)와 "과세표준에 적용" 구분(C-02). 총급여에 세율을 바로 곱한 흡수 출처 예시는 받지 않는다 |
| 6 | samsung-opi-tai-complete-2026 | bonus | 삼성전자 OPI + TAI 완벽 가이드 — 메모리 호황기 영끌 1억 3,750만 | 1,303 | 99 | 1/1/0 | opi-vs-tai-timing-tax-2026, samsung-wage-negotiation-status-2026 | opiData·taiData 값 그대로, "보도 기준" 표기(F-03·F-04). 2026 임협 결과 한 단락(F-05, 흡수한 임협 글의 검색 의도). 같은 해 안의 지급 시점 분산은 연간 세액을 바꾸지 않음(F-06). /calc/samsung-bonus·/salary-db 링크. 삼성 계산기 파일은 건드리지 않음 |
| 7 | sk-hynix-ps-history-2026-prospect | bonus | SK하이닉스 PS 연도별 추이 — 2026 PS 2,000% 가능? | 2,232 | 110 | 0/0/0 | sk-hynix-ps-bonus-2026 | psData.ts 값(F-01·F-02). 9/16 가결 구조(현금 50·주식 30·이연 10+10). 제목의 "2,000% 가능?" 같은 전망형 문구는 확정값 중심으로 |
| 8 | lgensol-wage-negotiation-2026 | may | LG에너지솔루션 2026 임금협상 — 배터리 캐즘 종료, 인상률 5%+ | 1,463 | 101 | 6/5/0 | — | 엔티티 형식(GUIDES-10): 첫 표는 bonusData.ts·DART 공시값만(추정 금지). 2차 키퍼 중 유일하게 네이버 유입 있음 |
| 9 | lg-hyundai-posco-bonus-2026 | bonus | LG·현대차·기아·포스코 성과급 구조 비교 — 사업부 차등 최대 50% | 1,563 | 82 | 0/0/0 | — | 엔티티 형식. 회사 페이지와 같은 데이터 모듈 값만 |
| 10 | bonus-vs-incentive-vs-allowance-2026 | bonus | 성과급 vs 인센티브 vs 격려금 — 통상임금 포함 평생 1억 차이 | 1,659 | 87 | 3/2/1 | year-end-encouragement-vs-bonus-2026 | 통합 금지 목록에 있지만 키퍼(목적지)로는 가능. 통상임금 판례·정의는 W3-A 가 공식 출처로 따로 확인해 원장에 추가할 것(이번 원장에 없음) |
| 11 | bonus-retire-impact-severance-2026 | bonus | 성과급 받고 퇴직 — 정기상여 vs 일회성 보너스 퇴직금 2,500만 차이 | 857 | 88 | 2/0/0 | before-vs-after-leave-bonus-2026, retire-with-bonus-4insurance-2026 | 퇴직소득세 연분연승(C-05). 흡수 출처의 "IRP 이전 시 연금 5.5~3.3%" 류는 받지 않는다(이연퇴직소득은 연금 수령 시 퇴직소득세 기준 감면 구조 — 쓰려면 원장 추가 후) |
| 12 | executive-severance-limit-2026 | extended | 임원 퇴직금 한도 초과분 — 5억 퇴직 시 1.08억 세금 | 820 | 76 | 1/1/0 | executive-severance-limit-bonus-deep-2026 | 한도 산식(C-03·C-04). 제목 예시값은 산식으로 재계산하거나 뺀다 |
| 13 | it-rsu-vs-cash-bonus-2026 | bonus | 네이버·카카오·쿠팡 RSU vs 현금 보너스 — 5,000만 RSU 175만 유리 | 1,151 | 108 | 3/2/0 | bonus-rsu-same-year-2026 | 해외주식 양도차손은 같은 해 통산만(D-09) |
| + | coupang-fulfillment-night-pay-2026 | may | 쿠팡 풀필먼트 야간 알바 — 시급 17,000원 + 주휴수당 월 354만원 | 1,797 | 104 | 108/100/0 | — | 13편 밖 부록. 슬러그 유지·통합 금지, 엔티티 형식으로만 손본다. 가이드 중 네이버 유입 2위 페이지라 제목·첫 문단 변경은 최소로 |

## 3. 308 통합 지도 (GUIDES-07) — 40건

기준: 5월 배치 안의 얇은 중복(검색 의도가 키퍼와 같음) 또는 틀린 숫자(슬러그·제목·본문)를 담은 가이드. 전부 무유입 게이트 통과. 목적지 21곳: 1·2차 키퍼 15곳 + 5월 밖 기존 가이드 6곳.

| # | 출처 슬러그 | 모듈 | HTML | GA4/네이버/GSC | 목적지 | 사유 |
|---|---|---|---|---|---|---|
| 1 | july-health-adjust-bonus-1eok-2026 | bonus | 1,381 | 2/2/0 | bonus-health-4-percent-2026 | 슬러그가 금지 사실("7월 건보 정산")을 담음. 본문도 "5회 분할 시 7~11월" 등 뒤섞임 |
| 2 | july-health-adjust-bonus-detail-2026 | bonus | 1,330 | 0/0/0 | bonus-health-4-percent-2026 | 같은 슬러그 문제, 1번과 같은 주제 |
| 3 | bonus-pension-45-ceiling-590-2026 | bonus | 1,131 | 0/0/0 | four-insurance-ceiling-summary-2026 | 슬러그가 옛 값(4.5%·590만)을 담음 — 현행 4.75%·659만(B-01·B-03) |
| 4 | bonus-employment-09-2026 | bonus | 852 | 0/0/0 | four-insurance-ceiling-summary-2026 | 4대보험 요약 키퍼의 일부 주제, 얇은 중복 |
| 5 | infertility-medical-20-percent-2026 | deep-dive | 894 | 0/0/0 | implant-dental-medical-deduction-2026 | 슬러그가 틀린 공제율(20%)을 담음 — 법정 30%(A-08) |
| 6 | eyewear-herb-implant-medical-2026 | extended | 840 | 0/0/0 | implant-dental-medical-deduction-2026 | 의료비 항목 얇은 중복 |
| 7 | orthodontics-tax-deduction-2026 | deep-dive | 890 | 1/1/0 | implant-dental-medical-deduction-2026 | 의료비 항목 얇은 중복 |
| 8 | physical-therapy-tax-2026 | deep-dive | 796 | 1/0/0 | implant-dental-medical-deduction-2026 | 의료비 항목 얇은 중복 |
| 9 | psychiatry-medical-deduction-2026 | deep-dive | 819 | 2/2/0 | implant-dental-medical-deduction-2026 | 의료비 항목 얇은 중복 |
| 10 | medical-edu-donation-bonus-year-2026 | bonus | 1,049 | 0/0/0 | medical-edu-donation-limits-2026 | "의료비 본인·부양가족 합산 700만" 오류(본인은 한도 밖), 세액공제에 한계세율 효과를 붙임 |
| 11 | medical-edu-donation-concentration-2026 | bonus | 916 | 0/0/0 | medical-edu-donation-limits-2026 | 같은 한계세율 오류, 10번과 중복 |
| 12 | card-25-before-bonus-2026 | bonus | 925 | 0/0/0 | credit-card-deduction-30-40-strategy-2026 | 도서공연을 40%로 적음(현행 30%), 카드 키퍼와 중복 |
| 13 | card-30-40-percent-bonus-2026 | bonus | 1,066 | 0/0/0 | credit-card-deduction-30-40-strategy-2026 | 허용목록 GUIDES-08 3건(항목별 100만 추가) |
| 14 | credit-card-deduction-limit-detail-2026 | extended | 886 | 0/0/0 | credit-card-deduction-30-40-strategy-2026 | 카드 한도 얇은 중복(수치는 대체로 맞음) |
| 15 | book-concert-museum-deduction-2026 | extended | 793 | 0/0/0 | credit-card-deduction-30-40-strategy-2026 | "별도 한도 100만원"은 폐지된 옛 구조(A-05) — 추가 발굴분 |
| 16 | dependent-deduction-bonus-year-2026 | bonus | 1,036 | 0/0/0 | parent-support-deduction-integration-2026 | 인적공제 얇은 중복 |
| 17 | parent-support-bonus-year-2026 | bonus | 1,086 | 0/0/0 | parent-support-deduction-integration-2026 | 의료비 세액공제를 소득공제처럼 한계세율로 곱함 |
| 18 | monthly-rent-17-bonus-2026 | bonus | 1,208 | 0/0/0 | monthly-rent-tax-credit | 월세 세액공제 중복 |
| 19 | monthly-rent-tax-credit-17-2026 | may | 1,873 | 0/0/0 | monthly-rent-tax-credit | "기준시가 3억 이하"(현행 4억) — 목적지 본문은 4억·1,000만·8,000만 현행 |
| 20 | housing-25-bonus-2026 | bonus | 819 | 1/0/0 | housing-subscription-25man-deduction-2026 | 총급여 7천만 요건과 35% 구간을 함께 가정, "5년 납입 = 가점 만점" 오류 |
| 21 | insurance-100-bonus-2026 | bonus | 728 | 0/0/0 | insurance-100man-limit-2026 | 보험료 공제 얇은 중복 |
| 22 | disability-insurance-2026 | deep-dive | 596 | 0/0/0 | insurance-100man-limit-2026 | 장애인전용 15%를 12%로 계산("합 24만") — 현행 최대 27만(A-13) — 추가 발굴분 |
| 23 | irp-before-bonus-payout-2026 | bonus | 1,110 | 0/0/0 | irp-pension-year-end-2026 | 13.2%(지방세 포함)에 지방세를 다시 더함("131만") |
| 24 | irp-max-bonus-year-2026 | bonus | 1,312 | 1/0/0 | irp-pension-year-end-2026 | 제목 "1,200만 175만"과 본문 158만 불일치 |
| 25 | irp-eligibility-before-bonus-2026 | bonus | 972 | 0/0/0 | irp-pension-year-end-2026 | IRP 얇은 중복 |
| 26 | isa-for-bonus-2026 | bonus | 904 | 0/0/0 | isa-account-guide | ISA 얇은 중복. plan 의 isa-vs-pension-savings(2,512자) 대신 ISA 기둥 글(5,968자·표 3)로 바꿈 |
| 27 | salary-bonus-calc-8step-2026 | bonus | 1,025 | 0/0/0 | income-tax-8-step-bracket-2026 | 허용목록 GUIDES-08 1건(자녀 30~70만) |
| 28 | bonus-bracket-jump-2026 | bonus | 1,595 | 1/1/0 | income-tax-8-step-bracket-2026 | 총급여를 과세표준처럼 써서 한계세율을 판정 |
| 29 | seeking-job-benefit-2026 | deep-dive | 881 | 1/0/0 | unemployment-benefits-complete | 실업급여 4편 중복 |
| 30 | employment-insurance-detail-2026 | deep-dive | 854 | 0/0/0 | unemployment-benefits-complete | 같음 |
| 31 | side-hustle-n-jab-tax-2026 | may | 1,733 | 1/0/0 | side-hustle-tax-2026 | 납부지연가산세 "연 9.125%"(옛 일 0.025% 기준 — 현행 1일 10만분의 22, 원장 D-12), "연 500만 넘으면 신고 의무" 오류 |
| 32 | executive-severance-limit-bonus-deep-2026 | bonus | 1,028 | 0/0/0 | executive-severance-limit-2026 | 키퍼와 같은 예시·같은 숫자의 복제 |
| 33 | bonus-rsu-same-year-2026 | bonus | 810 | 1/0/0 | it-rsu-vs-cash-bonus-2026 | RSU 얇은 중복, 분할 매도 절감액 산술 오류 |
| 34 | before-vs-after-leave-bonus-2026 | bonus | 816 | 0/0/0 | bonus-retire-impact-severance-2026 | 얇은 중복(숫자 없음) |
| 35 | retire-with-bonus-4insurance-2026 | bonus | 1,136 | 0/0/0 | bonus-retire-impact-severance-2026 | "IRP 이전 후 연금 5.5~3.3%"(퇴직소득 연금 수령 과세와 다름) |
| 36 | year-end-encouragement-vs-bonus-2026 | bonus | 914 | 1/1/0 | bonus-vs-incentive-vs-allowance-2026 | "연봉 6천 + 격려금 1천 → 35% 점프"(과세표준 8,800만 이하라 틀림) — 추가 발굴분 |
| 37 | opi-vs-tai-timing-tax-2026 | bonus | 1,151 | 0/0/0 | samsung-opi-tai-complete-2026 | 같은 해 안의 분할이 세금을 150만 줄인다는 주장(F-06과 어긋남) |
| 38 | samsung-wage-negotiation-status-2026 | may | 2,156 | 0/0/0 | samsung-opi-tai-complete-2026 | 5월 협상 개시 시점 기사로 낡음(5/27 타결), "삼성 자사주 양도세 22%(해외주식)" 오류. 키퍼에 2026 임협 결과 단락 필수 |
| 39 | sk-hynix-ps-bonus-2026 | may | 2,618 | 3/0/0 | sk-hynix-ps-history-2026-prospect | 5월 전망 글(9월에 확정치 병기 상태), 키퍼와 중복. GA4 3세션은 전부 direct |
| 40 | religious-donation-100-percent-2026 | extended | 1,036 | 0/0/0 | donation-tax-credit | 설명(5천·57만)과 본문(6천·71만) 불일치, 옛 용어(법정·지정기부금) |

5월 밖 목적지 6곳(충실성 확인): monthly-rent-tax-credit(legacy-rewrite-3, 5,053자·H2 7·표 1, 2026-08-15 재작성, 8,000만·1,000만·4억 현행), irp-pension-year-end-2026(finance-rpm-2026, 5,879자·H2 7·표 1), isa-account-guide(legacy-rewrite-5, 5,968자·H2 7·표 3), unemployment-benefits-complete(hot-keywords-deepdive, 3,532자·H2 8·표 1, 68,100·66,048 현행), side-hustle-tax-2026(2026-season-deepdive, 4,587자·H2 13·표 1), donation-tax-credit(legacy-rewrite-4, 5,003자·H2 7·표 1, 고향사랑 40% 현행). 여섯 곳 모두 금지 사실 허용목록에 없다.

### 3-1. plan 초안과 달라진 점

- 빠짐(목적지가 5월 배치의 비키퍼라 규칙 위반 — 이번 회차 통합 보류):
  - optional-continue-after-bonus-2026 → (초안) health-insurance-continue-after-retire-2026
  - stock-option-with-bonus-2026 → (초안) stock-option-exercise-timing-2026
  - youth-housing-dream-account-detail-2026 → (초안) youth-housing-dream-1eok-2026
  - 세 출처 모두 틀린 숫자가 있어 4절 잔여 목록에 넣었다. 목적지가 3차 키퍼가 되거나 2/1 이후 구조 개편 때 다시 본다.
- 목적지 변경: isa-for-bonus-2026 → isa-vs-pension-savings 에서 isa-account-guide 로. isa-vs-pension-savings 는 2,512자라 충실성 기준에 못 미치고, ISA 기둥 글이 따로 있다.
- 추가(같은 의도·틀린 숫자, 게이트 통과): book-concert-museum-deduction-2026, disability-insurance-2026, year-end-encouragement-vs-bonus-2026.
- 조건부 2건(sk-hynix-ps-bonus-2026, samsung-wage-negotiation-status-2026)은 게이트 통과로 포함. samsung-wage-negotiation-status-2026 은 같은 주제의 5월 밖 글(semiconductor-deepdive 의 samsung-wage-negotiation-2026)도 "협상 시작" 시점 기사라 목적지로 부적합해 OPI·TAI 키퍼로 보낸다.

### 3-2. 통합하지 않은 5월 가이드 중 참고할 것

- 게이트에 걸리는 5월 가이드(통합 후보가 아니었지만 유입 확인용): coupang-fulfillment-night-pay-2026 108/100, business-trip-expense-tax-2026 17/14, child-tuition-tax-free-2026 15/13, foreign-bonus-structure-2026 6/6, lgensol-wage-negotiation-2026 6/5, veteran-benefit-2026 5/5.
- 목적지가 없어 이번 회차에 두는 얇은 중복: december-vs-january-bonus-2026·bonus-split-payout-1000-saving-2026(→ bonus-payout-timing-2026 계열, 모두 5월 비키퍼), dependent-check-before-bonus-2026, total-income-adjustment-bonus-2026, gift-children-with-bonus-2026, bonus-property-sell-same-year-2026, moving-company-bonus-2026.

### 3-3. 통합 커밋(W3-A ②) 체크리스트

- 40개 출처를 각 모듈의 소스 배열에서 제거하고 `next.config.mjs` 에 영구 리디렉트(308) 40줄 추가. 기존 guides 리디렉트 90건 중 목적지가 이 40개 출처인 것은 없다(2026-09-26 확인) — 한 단계 규칙 위반 없음.
- 참조 정리: `src/lib/crossLink.ts` 두 곳 — 130행 `dual-income-year-end` 배열의 medical-edu-donation-concentration-2026, 135행 `donation-tax-credit-2026` 배열의 religious-donation-100-percent-2026. 가이드 본문 안의 `/guides/<출처>` 링크는 0건. 그 밖의 src 참조는 url-ledger.snapshot.json 뿐(`npm run ledger:update`).
- guideSpec 픽스처: 출처가 사라지면 허용목록의 card-30-40-percent-bonus-2026 3건, salary-bonus-calc-8step-2026 1건을 같은 커밋에서 지우고, guidesMayH2.snapshot.json 에서 40개 항목을 손으로 지운다(GUIDE_SPEC_REGEN=h2 금지).
- 404 복구(통합 아님, 별도 줄): `/guides/one-home-prop-tax-12%EC%96%B5-2026` → `/guides/one-home-prop-tax-12eok-2026`. 목적지가 5월 비키퍼지만 같은 글의 정식 주소로 보내는 것이라 목적지 규칙과 무관. 한글 인코딩 함정 때문에 로컬 CF 빌드(wrangler)에서 브라우저 UA 로 308 한 번 → 200 을 확인.
- 키퍼가 먼저 재작성된 뒤에만 리디렉트를 배포한다(1차 10/13, 2차 10/20 → 통합 10/15~10/24 사이, 10/31 구조 동결 전).

## 4. 잔여 문장 정정 목록 (GUIDES-08) — 키퍼·통합 출처 밖

규칙: 문장·셀 안에서만 고친다(H2 개수·문구 불변, 새 블록 금지). description(TL;DR) 은 기준선 길이를 넘기지 않는다. 고친 커밋에서 허용목록 항목을 지우고 gen-guides-meta 를 다시 돌린다. OFFER_GUIDE_SLUGS 가이드는 문자열 정정만 하고 OfferSlot·광고는 건드리지 않는다.

### 4-1. plan 이 지목한 항목

| # | 파일:행(c59cce4d) | 슬러그 | 현재 문구 | 고칠 내용 (원장) |
|---|---|---|---|---|
| R-01 | hot-news-2026-may.ts:597 | crypto-tax-deferred-2027-2026 | "이월결손금: 5년 이월 가능 (주식의 10년보다 짧음)" | 가상자산소득은 연간 손익 통산 후 20% 분리과세·기본공제 250만원, 결손금 이월공제 규정 없음. 주식 양도차손도 같은 해 통산만(D-08·D-09). 허용목록 3건 삭제 |
| R-02 | hot-news-2026-may.ts:1609 | crypto-tax-deferred-2027-2026 (description) | "…시행 시 22% + 연 250만원 공제 + 5년 이월결손금." | "5년 이월결손금" 삭제(기준선 이하로). 22%는 20% + 지방소득세 표기로 두거나 "20%(지방세 별도)" |
| R-03 | hot-news-2026-deep-dive.ts:154 | carryover-loss-15year-2026 | "③ 가상자산 결손: 5년 이월 (15년 아닌 짧음 주의)" | 가상자산은 이월 규정 없음(2027년 과세 시행 후에도 해당 연도 통산만)(D-08). 15년 본문은 맞음(D-10). 허용목록 1건 삭제 |
| R-04 | hot-news-2026-deep-dive.ts:903 | carryover-loss-15year-2026 (description) | "…가상자산은 5년만." | 문구 삭제 — 현재 금지 정규식에 걸리지 않는 표기라 허용목록에 없다. 스윕 때 함께 |
| R-05 | hot-news-2026-may.ts:824 | newborn-special-loan-application-2026 (OFFER) | "소득 별 차등: 8천 이하 1.6%, 8천~1.3억 2.7%, 1.3억 초과 미신청" | 금리 연 1.80~4.50%(소득·만기별), 부부 1.3억 이하·맞벌이 2억 이하(부부 각 1.3억 이하)(D-01·D-02) |
| R-06 | hot-news-2026-may.ts:1544 | didimdol-newborn-special-loan-2026 (OFFER, description) | "…부부 소득 1.3억 이하 + 주택 9억 이하. 최저 1.6% 금리로 5억 30년 대출 시…" | 맞벌이 2억 이하 병기, 최저 1.8%, 한도 4억(2025-06-27 이전 계약만 5억)(D-01~D-03). 절감액 예시는 한도 안 금액으로 재계산하거나 삭제. 제목의 "1.6% — 5억 30년"도 같은 커밋에서 문자열 정정 |
| R-07 | hot-news-2026-may.ts:1674 | newborn-special-loan-application-2026 (OFFER, description) | "…부부 1.3억 이하 + 주택 9억 이하. 5억 30년 시…" | R-06 과 같게. 제목 "1.6% 5억"도 정정 |
| R-08 | (확인만) hot-news-2026-extended.ts | rental-report-obligation-2026 외 | 임대소득 비과세 "9억" 기준 | e73b76d1 에서 이미 12억으로 정정됨. 181편 가시 텍스트에 임대 문맥 "9억" 0건(2026-09-26) — 조치 없음(D-06) |
| R-09 | hot-news-2026-extended.ts:24·30·37·38·1064 | newlywed-didimdol-bomgijari-2026 | 리드 "디딤돌 1.6~3.3%, 보금자리론 한도 5~10억·금리 3.5~4%", 표 "소득 요건 부부 1.3억 이하 / 부부 1.3억 이하", 예시 "5억 30년… 총이자 1.3억/3.1억", description "디딤돌 1.6%·한도 5억 vs 보금자리론 3.5%·한도 10억" | 디딤돌: 소득 6천(신혼 8.5천)·금리 2.85~4.15%·신혼 한도 3.2억·주택 6억 이하(D-04). 보금자리론: 주택 6억 이하·소득 7천(신혼 8.5천)·한도 3.6억(생애최초 4.2억)(D-05). 5억 대출 예시는 한도 초과라 한도 안 금액으로 재계산하거나 셀 문구를 정성 표현으로. 보금자리론 금리는 공사 고시 금리가 매달 바뀌므로 숫자 대신 "고정금리, 공사 공시 금리" |

### 4-2. 허용목록 GUIDES-08 적중 중 키퍼·통합 출처 밖

| # | 파일 | 슬러그 | 현재 문구 | 고칠 내용 |
|---|---|---|---|---|
| R-10 | hot-news-2026-deep-dive.ts | childcare-support-comprehensive-2026 | "부모 자녀세액공제 추가 환급 30~70만원/년" | 자녀세액공제 1명 25만·2명 55만·셋째부터 40만씩(2026년 귀속 9세 이상, 2017년생 제외). 30·50·70만은 출산·입양한 해 1회(A-22·A-23) |
| R-11 | hot-news-2026-may.ts | naver-rsu-tax-strategy-2026 | "차익 발생 시 250만원 공제 후 22%. 손실 시 이월 가능." | "손실은 같은 해 다른 해외주식 등 양도차익과만 통산, 다음 해로 이월 안 됨"(D-09) |
| R-12 | hot-news-2026-extended.ts | newlywed-child-birth-benefit-2026 (description) | "…자녀세액공제 30~70만원 + …" | "출산·입양 세액공제 30~70만원"으로(기준선 이하 유지) |
| R-13 | lifecycle-deepdive.ts | tax-refund-mistakes-2026 | "총급여 7천만 이하 무주택 세대주. 한도 750만의 17% = 최대 약 127만 환급." | 총급여 8,000만 이하(17%는 5,500만 이하), 한도 연 1,000만 → 최대 170만(A-29). 허용목록 2건 삭제 |
| R-14 | hot-keywords-deepdive.ts | year-end-tax-deductions-guide | "대중교통·전통시장·도서공연비 (각 100만원 추가 한도)" | 전통시장·대중교통(총급여 7천만 이하는 문화체육 포함) 합산 추가 한도 300만/200만(A-05). 허용목록 1건 삭제 |
| R-15 | hot-keywords-deepdive.ts | youth-benefits-2026 | "대체 제도: 위의 청년도약계좌, … 등을 활용하세요" 및 "💰 청년도약계좌 — 5년에 최대 5,000만원" 절 | 신규 가입이 끝난 도약계좌를 권유하지 않고 청년미래적금(2026-06-22 출시, 갈아타기 절차)으로 안내(D-11). H2 문구가 도약계좌면 H2 는 두고 본문 문장만. 허용목록 1건 삭제 |

### 4-3. 이번 준비에서 새로 찾은 틀린 문장 (허용목록 밖 — 금지 정규식 추가 검토 권고)

| # | 파일 | 슬러그 | 현재 문구 | 고칠 내용 |
|---|---|---|---|---|
| R-16 | tax-deepdive.ts | year-end-tax-13-tips-2026 | description "자녀 만 8세", 본문 "기본공제 대상 중 만 8세 이상 자녀·손자녀는 1명 25만원…" | 2026년 귀속 9세 이상(2017년생 제외)(A-23). description 기준선 이하 |
| R-17 | lifecycle-deepdive.ts | marriage-tax-benefits-2026 | description "자녀 만 8세 기준", 본문 "만 8세 이상 1명 25만원…", "만 7세도 일반 자녀세액공제의 만 8세 이상…" | 같음 |
| R-18 | 2026-season-deepdive.ts | year-end-tax-refund-secrets-2026 | "자녀공제: 기본공제 대상과 만 8세 이상 세액공제 대상을 나눕니다." | 같음 |
| R-19 | hot-news-2026-extended.ts | newlywed-child-birth-benefit-2026 | "자녀세액공제 (매년): 첫째 25만원·둘째 30만원·셋째+ 40만원/년 (8세 이상 자녀)" | 나이를 9세 이상(2017년생 제외)으로. "자녀장려금 최대 80만원"은 현행 확인 전까지 숫자를 빼거나 확인 후 정정 |
| R-20 | lifecycle-deepdive.ts | tax-refund-mistakes-2026 | "연 240만 한도 40% 소득공제. 매월 10만 자동이체만 해도 연 96만 소득공제." / "도서·공연·박물관·미술관: 총급여 7천만 이하 30% 공제, 연 100만" | 청약저축 연 300만 한도 × 40%(A-26) — "매월 10만 → 연 48만 공제"로 산술도 정정(120만 × 40%). 문화체육은 별도 100만 한도가 아니라 추가 한도 합산 300만(A-05) |
| R-21 | hot-news-2026-may.ts | rental-income-2000man-tax-2026 | 표 "2,500만원 종합과세 24~35% 약 600~875만원 / 3,000만원 종합과세 35% 약 1,050만원"(연봉 7천 가정), description "2,500만원 종합과세 35% = 875만원" | 필요경비·공제 없이 임대수입 전액에 한계세율을 곱한 과대 계산 — Tier C 스윕에서 셀을 정성 표현이나 재계산값으로(원장 추가 필요) |
| R-22 | 5월 보류 3건(3-1절) | optional-continue-after-bonus-2026 · stock-option-with-bonus-2026 · youth-housing-dream-account-detail-2026 | "퇴직 후 2개월 이내 신청·3년 5,000만 절감" / "적격: 양도세 2,160만만(1억×22%와 불일치)" / 청약통장 5년 누적 혜택 | 근거 확인 전까지 숫자를 정성 표현으로. 스톡옵션 산술은 틀림(1억 × 22% = 2,200만) |

R-16~R-19 의 자녀 나이 문제는 가이드 밖(계산기·안내 페이지)에도 있다 — 원장 E-01 참고, 이번 배치 범위 밖이라 통합 담당에게 넘긴다. 금지 정규식 추가 후보: 2026년 문맥의 `자녀[^.]{0,30}만?\s?8세 이상` (dated-historical 예외 필요).
