# 야간 수익 개선 작업 기록 — 2026-09-10 23:35 ~ 09-11 (KST)

기준: main `075f9be`(202종 계산기·숫자 입력 통일 배포) 상태에서 시작. 광고·분석 계정 설정은 일절 변경하지 않았고,
슬롯 ID·쿠팡 트래킹 파라미터·광고 단위 추가/제거도 없다. 수익 수치는 모두 **가정**이며, 이 배포로 수익이 늘었다고
주장하지 않는다(현재 기준선 일 $10 ≒ 30일 $346, 페이지 RPM $3.78 — 2026-09-08 콘솔 읽기값).

## 1. 조사 방법과 실제 발견한 주요 문제

7개 관점(광고 코드·성능·기술 SEO·검색의도/정확성·계산기 입력·다음 행동·라이브 HTTP)으로 병렬 조사 → 발견 43건을
관점별로 중복 제거 → 상위 26건을 각각 2개 독립 검증(재현/의도·영향)에 부쳤다(43건 판정 완료, 17건은 사용량 한도로 미판정).
문서화된 의도로 판정돼 **손대지 않은 것**: 헤더 상시 렌더(PERF-01, e172c3a 결정), 간이↔전용 계산기 canonical 통합(SEO-02, 9/10 결정),
홈 계산기 ssr:false(PERF-03), 폰트 fallback 지표(PERF-06, 97f4a61 결정), 사이드바 스티키 재배치(ADS-02, 10/17 승인 슬롯).

실제로 확인된 문제(근거는 저장소 경로·재현 명령):

| # | 문제 | 근거 | 영향 경로 |
|---|---|---|---|
| A | **/calc/[slug] 202쪽이 202종 정의 전체(설명·FAQ 포함) 507KB 청크를 첫 로드에 실음** | `.next/app-build-manifest.json`: 라우트 JS 950KB(중앙값 377KB), 청크 `7353-*.js` 506,681B(gzip 151KB). 빌드 표 `170 kB / 290 kB` vs 형제 라우트 6~18kB | 하이드레이션 지연 → 결과 직하 `CalcResultAd`·인아티클 광고 마운트(IntersectionObserver 이후 push) 지연, 모바일 데이터 낭비 |
| B | **홈 계산기 '결과 확인하기'가 무효 입력에서 아무 반응 없음** | `SalaryCalculator.tsx:265` `if (!inputsValid) return;` — 안내문은 `canHandoffOffer` 블록 안이라 유효 입력에서만 렌더(도달 불가). 재현: 자녀 +1 후 클릭 | 2번째 랜딩(2,248세션/28일)에서 결과·`ResultAd`·다음 링크에 도달 못 함 |
| C | **간이 계산기 29종이 정상 범위 입력(0)에 '입력값 확인'만 표시, 100종이 음수 금액을 무경고 수용** | 프로브 41케이스(예: 인원 0 → 1인당 Infinity, 재산세 -500,000,000 → -300,000원). batch1/2 필드에 min 0건 | 결과 카드에서 이탈, 무의미한 공유 결과 |
| D | **결과 직후 내부 링크 0건 (202쪽)** | 첫 내부 링크가 광고 3개·섹션 9개 아래(`관련 계산기`), `NextActions`는 86종(생활·사업·가족 등)에서 문맥 없는 급여 CTA(주담대/회사연봉/연말정산) | 세션당 페이지 수 |
| E | **회사·직업·업종 페이지 전부 같은 관련 링크 4개** | `relatedCalculators.ts` salary 8종이 limit 4를 먼저 채워 [홈, 삼성 성과급, 주휴수당, 통상임금] 고정 | 유입 엔진("{회사명} 연봉")의 다음 페이지 |
| F | **회사 페이지 900여 쪽 layout 청크에 직업 프로필 전체(111KB raw/30KB br) 동봉** | `CompanyRelatedJobs`(클라)가 `companyJobsMap.ts`→`jobsData` 118KB import | 회사 페이지 첫 로드 |
| G | **가이드 341쪽이 3px 진행 바 하나 때문에 framer-motion 청크(123KB raw/40KB br) 로드** | `GuidePageClient.tsx:4,90,125` | 가이드 첫 로드·INP |
| H | **간이 계산기 101쪽 meta description이 9~34자 공식 조각, 36쪽 제목이 '…계산'으로 끝나 '계산기' 미포함** | `calc/[slug]/page.tsx:49-50` | 신규 202쪽의 SERP CTR |
| I | **404 화면에 자동광고 로더가 그대로 실행** | 404 HTML에 adsbygoogle preload+로더, 보류 신호 없음. Google 게시자 정책 "콘텐츠 없는 화면·알림/내비게이션 화면" 광고 금지 | 계정 정책 리스크 |
| J | **격자 밖·구형 /salary URL 404 (GSC 404 312건 예시 전부 이 형태)** | `/salary/13400-manwon`, `/salary/6980-manwon`, `/salary/210000000` → 404, `parseSalaryParam`은 dynamicParams=false라 죽은 코드 | 유입 링크·재크롤이 광고 없는 404로 |
| K | 쿠팡 배너: 모바일에서 같은 크리에이티브 2회(가이드), 7곳은 728×90을 41px로 축소 렌더, 삼성 페이지 공유 버튼과 첫 광고 간격 24px | `CoupangBannerCore.tsx:156`(데스크톱 키만 dedup), `job/[slug]/page.tsx:414` 등, `samsung-bonus/page.tsx:388` | 우발 클릭·모바일 배너 가시성 |
| L | 기타 소형: 리다이렉트 Location에 원시 UTF-8(3건), `/monthly/{금액}` 분석 경로 미가림, 글로서리 BreadcrumbList 이중 주입(07-06 사고 재발), speakable 셀렉터 `.calc-explanation` 미존재, 공식 줄바꿈 뭉개짐(42종), 종소세 시뮬레이터 설명이 38자 배치값 우선, dead-end 3쪽 | 각 파일 주석에 기록 | — |

라이브 사실 확인(변경 없음): 사이트맵 1,988 URL 전부 200·self-canonical, robots/ads.txt 정상, 광고 dedup/SPA 재푸시 로직 정상, AdSense 로더 1회(preload 1 + script 1은 중복 아님), 압축 HTML ~30KB/쪽.

## 2. 구현한 변경과 수익에 영향을 줄 수 있는 이유

| # | 변경 | 파일 | 기대 경로(가정) |
|---|---|---|---|
| A | 간이 계산기 클라이언트가 레지스트리 전체 대신 **자기 배치 파일 하나의 compute만 지연 로드**. 텍스트·필드는 서버 props, 첫 화면은 서버 계산 `initialResult` | `simpleCalculators/computeLoader.ts`(신규), `index.ts`(getCalculatorBatch·toClientCalculator·defaultInputsOf), `types.ts`, `SimpleCalculatorView.tsx`, `calc/[slug]/page.tsx` | 라우트 JS 170→18.8kB, First Load 290→140kB(gzip). 하이드레이션·광고 마운트 앞당김 |
| B | 무효 입력 클릭 시 버튼 아래 사유 표시(소득 0·비과세>월급·자녀>부양가족) | `SalaryCalculator.tsx` | 결과·ResultAd·다음 링크 도달률 |
| C | 하한 규칙: 명시 min 없으면 금액·수량 0 이상(비율·음수 기본값만 음수 허용), '-' 입력 차단, 0 나눗셈 시 어느 항목이 0인지 안내, 나눗셈 수량 필드 6개 `min:1` | `SimpleCalculatorView.tsx`, `batch1.ts`·`batch2.ts` | 결과 카드 이탈 감소 |
| D | 결과·공유 패널 **아래**(광고 아래) '다음 계산기' 핀 3개 + 같은 의도의 정밀 페이지 링크(32종 매핑, canonical 미변경); 매핑 없는 카테고리의 범용 CTA 중단·자기 링크 제외; 급여/커리어 외 카테고리의 고정 6개사 블록 중단 | `twins.ts`(신규), `SimpleCalculatorView.tsx`, `calc/[slug]/page.tsx`, `NextActions.tsx` | 세션당 페이지 수 |
| E | 회사·직업·업종·지역 전용 추천 세트(실수령→연말정산→퇴직금→오퍼 비교→성과급→순위), dead-end 3쪽(실업급여·육아휴직·2026-year)에 관련 계산기 추가 | `relatedCalculators.ts`, 3개 페이지 | 유입 엔진 페이지의 2페이지째 |
| F | `resolveHub`를 데이터 import 없는 `companyJobsResolve.ts`로 분리 | `companyJobsResolve.ts`(신규), `companyJobsMap.ts`, `CompanyRelatedJobs.tsx` | layout 청크 111,338→13,605B raw |
| G | 진행 바를 passive scroll+rAF로 교체, framer 제거 | `guides/[slug]/GuidePageClient.tsx` | 가이드 첫 로드에서 framer 청크 제거(빌드 매니페스트 확인) |
| H | `<title>`은 '{제목} 계산기(+연도: 세금·급여·보험)', description은 60~160자(짧으면 설명 본문 이어붙임). 정확히 같은 H1 쌍 2건('복리 계산기','실업급여 계산기')은 '간편' 추가 | `seoText.ts`(신규), `calc/[slug]/page.tsx`, batch 제목 2건 | 신규 202쪽 CTR(28일 후 GSC로 판정, 그 전 재변경 금지) |
| I | 404 화면에서 `adsbygoogle.pauseAdRequests=1`(인라인, 로더보다 먼저) + SPA 이탈 시 해제 컴포넌트 | `not-found.tsx`, `NotFoundAdPause.tsx`(신규) | 정책 리스크 감소(수익 직접 효과 없음) |
| J | 미들웨어에서 `/salary/{숫자|N-manwon|N-eok}` 정규화 → 가장 가까운 정적 페이지로 308. 집합은 코드젠 상수(`gen-salary-amounts.ts`, prebuild·verify:site 게이트) | `middleware.ts`, `salaryRedirect.ts`, `salaryStaticAmounts.generated.ts`, `scripts/gen-salary-amounts.ts`, `package.json` | 404 → 광고 있는 페이지, GSC 404 감소 |
| K | 쿠팡 dedup을 실제 렌더 사이즈 기준으로, 7곳 반응형 배너, 삼성 첫 광고 위 32px 여백 | `CoupangBannerCore.tsx`, 7개 페이지, `samsung-bonus/page.tsx` | 우발 클릭·배너 가시성 (쿠팡 수익은 현재 미미) |
| L | Location percent-encoding, `/monthly` 경로 가림, 글로서리 layout 크럼 제거, `.calc-explanation` 클래스, 공식 `whitespace-pre-line`, 종소세 배치 설명 삭제, placeholder '예:' | 각 파일 | 위생 |

광고 관련 원칙 준수: 광고 위에 새 UI 삽입 0건(핀은 CalcResultAd·공유 패널 아래), 슬롯 ID·트래킹 파라미터 무변경, `ad-audit` ERROR 0.
`ad-audit --diff`가 WARN 1건을 내지만 같은 위치의 `NextActions`를 조건부로 감싼 diff 라인을 신규 UI로 오인한 것이다(위치 불변).

## 3. 검증 결과

로컬(externals 전부 차단 — 광고·분석·제휴 요청 0건, 실제 광고 클릭·노출 없음):

- 테스트: vitest 83 파일 1,486건 통과(신규 4 파일: computeLoader 202종 compute 동일성, calcSeo, salaryRedirect+middleware, analyticsPrivacy 보강). `tsc --noEmit` 0 오류. eslint 0 오류(경고 16, 기존). `ad-audit` ERROR 0/WARN 0. `qa:share` missing 0.
- 성능(동일 조건 전후: 390px, slow-4G+CPU 4x, 5회 중앙값, externals 차단, 로컬 `next start`):

| 라우트 | 원시 JS 전송 | 하이드레이션 준비 | load |
|---|---|---|---|
| /calc/refinance-break-even | 1,080,586 → 678,262 B | 4,531 → 3,783 ms | 4,326 → 3,740 ms |
| /calc/income-tax-bracket-sim | 1,086,491 → 620,144 B | 4,472 → 3,702 ms | 4,279 → 3,658 ms |
| /calc/samsung-bonus·/salary/50000000·/ | 변화 없음(대조군) | ±50 ms | ±노이즈 |

  빌드 표: `/calc/[slug]` 170 kB/290 kB → 18.8 kB/140 kB. `/salary-db/layout` 청크 111,338 → 13,605 B. `/guides/[slug]` framer 청크 미요청.
- 브라우저 동작 확인 결과: §3-1 참조(아래에 기록).
- SEO: 생성 HTML의 title/description은 테스트가 202종 전수 검사(제목 60자 이하·'계산기' 포함·description 60~160자). canonical·사이트맵 변경 없음(`verify:sitemap` 통과).

### 3-1. 브라우저 동작 확인 (로컬 프로덕션 빌드, 모바일 390px, 광고·분석 차단)

Playwright(Chrome) 30개 동작 검사 — 28건 PASS, 2건은 검사 셀렉터 오류(회사 페이지 관련 블록 제목이 '이 회사 연봉으로 시뮬레이션해보세요'이며 HTML에 `/year-end-tax`·`/tools/finance/severance`·`/calc/offer-compare`·`/salary-db/ranking` 링크가 모두 있음을 curl로 확인). 확인된 동작:

- 홈: 자녀 +1 뒤 '결과 확인하기' → 버튼 아래 사유 표시("자녀 수는 본인을 뺀 부양가족 수를 넘을 수 없습니다…"), 결과 카드 미표시.
- /calc/split-bill: title `더치페이 계산기 | 머니샐러리`, description 154자; 인원 0 → "1명 이상의 숫자를 입력해 주세요."; '-3' 입력 시 '-' 차단; 100,000/4 → 25,000원; 결과 직하 광고(`.ad-slot-result`) **아래**에 '다음 계산기' 핀(정밀 `/tools/life/dutch-pay` + 관련 2개).
- /calc/income-tax-bracket-sim: '-500' 차단; 과세표준 0 → "0으로 입력된 항목(과세표준)이 있어 계산할 수 없습니다…"; `.calc-explanation` 존재, 설명 216자(배치 38자 아님).
- 404: 상태 404, `adsbygoogle.pauseAdRequests === 1`; 추천 링크로 SPA 이동 뒤 0으로 해제.
- 가이드: 진행 바 스크롤 시 `scaleX(0.54)`, 모바일 쿠팡 크리에이티브 1개, 요청 청크 17개에 framer 청크 없음.
- /job/professor 모바일: `mobile-banner` 크리에이티브(축소 728×90 아님). 삼성 페이지 첫 인아티클 광고 래퍼 margin-top 32px.
- dead-end 3쪽(실업급여·육아휴직·2026-year) 관련 계산기 블록 렌더.
- 미들웨어: `/salary/6980-manwon → 308 /salary/70000000`, `/salary/13400-manwon → 308 /salary/134000000`, `/salary/210000000 → 308 /salary/207000000`(가장 가까운 정적 금액), `/salary/50000000 → 200`, `/salary/abc → 404`, 끝 슬래시는 Next 정규화에 위임(2단 리다이렉트 없음).
- 라우트 12종 × (모바일·데스크톱) × (라이트·다크) 스크린샷·콘솔·가로 넘침 검사 결과는 §4 아래에 요약.

## 4. 커밋·푸시·배포 상태

- 코드 커밋: `41ce72d` (main, 075f9be 위 fast-forward). 후속 커밋(이 문서 포함): 404 광고 보류 컴포넌트를 `not-found.tsx` 직접 import 에서 루트 layout 마운트로 이동 — 워크트리 `next start` 에서 Edge 라우트(qna·glossary 한글 슬러그, /en 폴백)가 `Cannot read properties of undefined (reading 'default')` 500 을 냈고, main 빌드에서는 재현되지 않았으나 Cloudflare Edge 매니페스트 리스크를 없애기 위해 루트 마운트로 확정(동작 동일: 404 마커 감지로 보류/해제).
- main 에서 재실행한 게이트: vitest·tsc·eslint·ad-audit·qa:share·verify:tax/site/companies/sitemap/bonus·스크립트 테스트·python 검증 통과, `qa:quality` 2,497 HTML 0 이슈. `qa:crawl`·`qa:english` 결과는 아래 푸시 기록에 병기.
- 푸시·배포: (푸시 시각·Cloudflare 배포 확인은 아래에 추가)
- 로컬 서버(3200/3300)에서 광고·분석 요청은 브라우저 검사 시 전부 차단했다. 실제 광고 클릭·노출 유발 0건.
- 정리: 조사 서브에이전트가 남긴 14바이트 임시 파일 `savings` 를 저장소 루트에서 삭제했다(추적되지 않은 파일). `.claude/settings.local.json`·`docs/revenue-audit-2026-09-08/` 은 손대지 않았다.

## 5. 계정 접근·실측이 없어 확인하지 못한 것

- AdSense·GA4·GSC 콘솔은 이 세션에서 열지 않았다. 사용한 수치는 2026-09-08 콘솔 읽기 기록(docs/revenue-audit-2026-09-08, 비공개)이다.
- 실사용자 LCP/CLS(필드 데이터)와 광고 조회 가능 비율 변화는 미측정. 로컬 랩 수치는 광고 차단 상태라 실제 광고 로드 비용을 포함하지 않는다.
- 진행 중인 AdSense 인페이지 간격 실험(50→200px, 9/24·10/8 판정)과 이번 배포의 효과는 창을 나눠 봐야 하며 이 문서는 그 판정에 개입하지 않는다.
- 17개 검증 에이전트가 사용량 한도로 미완료: NAV-03/04/05, CALC-03/06, SI-03/05/06. NAV-03·CALC-03·SI-03은 코드로 직접 재현해 반영했고, NAV-04/05·CALC-06·SI-05/06은 미구현(§7).

## 6. 배포 후 비교 지표 (7일·28일)

T0 = 이 커밋의 Cloudflare 배포 완료 시각. 부분일 제외, KST 첫 완전일부터 7일·28일 창을 잡고 배포 전 같은 길이·요일 구성과 비교한다.

| 지표 | 어디서 | 무엇을 |
|---|---|---|
| /calc/* 세션당 페이지·이탈률 | GA4 (hostname=www), 랜딩 경로 `/calc/` 접두 (대시보드·삼성 등 전용 라우트 제외) | 다음 계산기 핀·정밀 링크 클릭(`guide_cta_click` position) 이후 2페이지째 비율 |
| 홈 `calc_success`/`calc_start` | GA4 | 무효 입력 안내 후 성공 전환이 늘었는지 |
| /calc/* 신규 202쪽 노출·클릭·CTR | GSC 페이지 필터 `/calc/`, 제목 변경 후 28일 창 | 재제목 효과(28일 전 재변경 금지) |
| GSC '찾을 수 없음(404)' 수 | GSC 색인 보고서 | 312 → 감소 여부(재크롤 후) |
| 페이지 RPM·조회 가능 비율 | AdSense URL 채널 `/calc`, `/salary-db` | 광고 실험과 창 분리해 관찰 |
| 데스크톱 CWV LCP | GSC CWV | 108 URL 개선 여부(이번 변경은 /calc·회사·가이드 JS 감소가 대상) |
| 500/404/308 | `scripts/health-check.mjs` 주간 CI + `/salary/6980-manwon` 308 확인 | 회귀 감시 |

## 7. 추가 근거가 필요한 다음 작업 (최대 3)

1. **현대차·SK하이닉스 성과급 결과 카드에 다음 링크 핀(NAV-05)** — 삼성 페이지의 `ResultNextLinks`를 공용화해 `CalcResultAd` 아래에 배치. 근거: 성과급 계산기가 세션의 16%+인데 22/23쪽의 결과 직후 링크 0건. 검증 미완료(사용량 한도).
2. **공무원 2027 페이지에 실수령 이동 링크(NAV-04)** — 예상 기본급 옆에 `/monthly/{격자}` 링크. 근거: 네이버 노출 134,291·평균 참여 14초. 검증 미완료.
3. **삼성 성과급 공유 링크에 입력값 포함(CALC-06)** — 간이 계산기의 `?v=` 패턴 재사용. 근거: #1 랜딩 페이지의 공유가 기본값 8,000만원 예시로만 열림. 검증 미완료.

보류(문서화된 결정과 충돌): 헤더 DOM 축소(2027-02 Phase 5), 간이↔전용 canonical 통합, 홈 계산기 SSR 전환, 사이드바 스티키 재배치(10/17).
