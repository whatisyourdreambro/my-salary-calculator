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
- 라우트 12종 × (모바일 390px·데스크톱 1366px) × (라이트·다크) = 48케이스: HTTP 상태·콘솔 오류·페이지 오류·가로 넘침 모두 0건(의도된 404 라우트 제외). 상호작용: 쉼표 입력 유지(1,234,567), 음수 부호 차단, 빈 값은 aria-invalid + '입력값 확인', 소수점(3.5) 유지. 스크린샷은 로컬 산출물(scratchpad)에 보관, 저장소 미포함.

## 4. 커밋·푸시·배포 상태

- 코드 커밋: `41ce72d` (main, 075f9be 위 fast-forward). 후속 커밋(이 문서 포함): 404 광고 보류 컴포넌트를 `not-found.tsx` 직접 import 에서 루트 layout 마운트로 이동 — 워크트리 `next start` 에서 Edge 라우트(qna·glossary 한글 슬러그, /en 폴백)가 `Cannot read properties of undefined (reading 'default')` 500 을 냈고, main 빌드에서는 재현되지 않았으나 Cloudflare Edge 매니페스트 리스크를 없애기 위해 루트 마운트로 확정(동작 동일: 404 마커 감지로 보류/해제).
- main 에서 재실행한 게이트: vitest·tsc·eslint·ad-audit·qa:share·verify:tax/site/companies/sitemap/bonus·스크립트 테스트·python 검증 통과, `qa:quality` 2,497 HTML 0 이슈. `qa:crawl`·`qa:english` 결과는 아래 푸시 기록에 병기.
- 푸시: 2026-09-11 05:01 KST, main `075f9be` → `1c1fda2` (커밋 2개: `41ce72d` 코드, `1c1fda2` 404 게이트 이동+이 문서). 강제 푸시 없음.
- 배포 확인 (2026-09-11 05:20 KST): 푸시 05:01 KST 이후 약 20분간 프로덕션은 아직 이전 빌드(075f9be)를 서빙 중(`/salary/6980-manwon` 404, split-bill 구 제목, 구 레지스트리 청크 참조). Cloudflare Pages 빌드 완료 여부는 대시보드에서 확인 필요 — 완료 후 `/salary/6980-manwon` 이 308 인지, `/calc/split-bill` 제목이 '더치페이 계산기 | 머니샐러리'인지, 404 HTML 에 pauseAdRequests 스크립트가 있는지 확인하면 배포 완료다. 주간 헬스체크(scripts/health-check.mjs)도 같은 경로를 본다.
- 배포 확인 (2026-09-11 08:05 KST): Cloudflare 배포 완료. 프로덕션 `/calc/split-bill` 제목 '더치페이 계산기 | 머니샐러리', '다음 계산기' nav 1개, 구 레지스트리 청크 참조 0건, 404 HTML 에 pauseAdRequests 스크립트 1건, 미요청 변형 `/salary/6981-manwon` → 308 `/salary/70000000`, `/salary/13401-manwon` → 308, `/salary/210500000` → 308 `/salary/207000000`. `/salary/6980-manwon` 만 엣지 캐시 HIT(Age 11,070/14,400초)로 아직 404 — 캐시 만료(약 1시간) 후 308 로 바뀐다(캐시 퍼지 불필요).
- 2차(광고 배치, §8): 커밋 `f2379fa`, 푸시 2026-09-11 08:59 KST, Cloudflare 배포 확인 09:09 KST(삼성 페이지 1인당 결과 직하 HomeTop 컨테이너가 다음 링크보다 앞, /calc 분산 유닛 SSR 확인). 최종 빌드에서 qa:crawl 266쪽·qa:quality 2,497 HTML 0 이슈·qa-ads 20/21(임계값 항목 1건 제외) 통과.
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

## 8. 광고 배치 변경 — 운영자 승인 후 2차 작업 (2026-09-11 오전)

운영자 지시: "광고 수익 극대화, AdSense 위치를 바꾸더라도". 슬롯 ID·env·쿠팡 트래킹 파라미터는 그대로이며, 콘솔 설정은 손대지 않았다.
근거는 로컬 프로덕션 빌드에서 실브라우저로 잰 **첫 광고 노출 깊이**(`npm run ad-depth`, 광고·분석 요청 차단, 우리 컨테이너 기하만 측정)와
기존 문서의 승인 대기 항목(마스터플랜 §12-2 ⑥⑦⑧, 10x 계획 M02·C6, ad-experiments PageFooterAds 순서)이다.

### 8-1. 변경 전 실측 (모바일 390px 기준)

| 라우트 | 첫 광고 위치 | 문제 |
|---|---:|---|
| /calc/samsung-bonus (#1 랜딩, 세션 16%) | 7,183px (8.5화면) | 결과 카드 2개(1인당 2,721px·개인 세후 ~4,450px) 모두 광고 없이 지나감 |
| /calc (인덱스 202종) | 12,541px (14.9화면) | 문서 66,638px 에 광고 1개 |
| /calc/bonus-calculators | 4,101px (4.9화면) | 카드 23장 아래에 첫 광고 |
| /salary-db/[id] | 2,144px | 연봉표 광고~인사이트 광고 사이 ~8,500px(10화면) 무광고 |
| /table/2026/annual·monthly | 222px | 이후 57,000px(60화면) 광고 0개 |

### 8-2. 변경 내용 (유닛 수는 이동 위주, 순증은 명시)

| # | 변경 | 파일 | 근거·효과 |
|---|---|---|---|
| A | 삼성 성과급: 1인당 결과 직하 `HomeTopAd`(layout 하단 사본은 dedup 으로 이동), 개인 세후 결과 직하 `CalcResultAd`(시나리오 구간에서 이동), 그 자리는 `Display2Ad`(순증 1). 다음 링크·OfferSlot 은 광고 아래 → C6 동시 해소 | `calc/samsung-bonus/Client.tsx`, `page.tsx` | 첫 광고 7,183 → **3,405px** (데스크톱 5,592 → 2,190px), 5유닛 |
| B | /calc 인덱스: 첫 그룹 6번째 카드 뒤 `HomeTopAd`, 그룹 경계에 GuideMid·InArticle·Display2·CalcResult 분산(순증 2). 검색어·분야 필터 상태에서는 그룹 광고를 그리지 않음(재마운트로 요청 반복 방지) | `calc/CalcIndexClient.tsx` | 첫 광고 12,541 → **1,990px** (데스크톱 5,131 → 1,145px) |
| C | 성과급 허브: 카드 그리드 위 `HomeTopAd`(이동) | `calc/bonus-calculators/page.tsx` | 4,101 → **1,051px** |
| D | 회사 페이지: 무광고 구간 중간 `Display2Ad`(순증 1) | `salary-db/[id]/page.tsx` | 최대 공백 ~8,500 → **6,300px** |
| E | 연봉·월급 표: 표 1/3·2/3 지점에 `InArticleAd`·`HomeTopAd` 행 삽입(layout 하단 사본 이동). 모바일 카드/데스크톱 행 중 현재 뷰포트 쪽에만 렌더(같은 슬롯 2회는 dedup 으로 죽음) | `SalaryTable.tsx`, `table/2026/annual|monthly/page.tsx` | 모바일 최대 공백 57,000 → **~19,000px**, 5유닛 |
| F | `AdSlot` 예약 높이에 라벨 20px 포함(마운트 시 ~20px 밀림 제거), 뷰포트 안에서 unfilled 면 높이 유지·내용만 숨김(뷰포트 밖이면 종전처럼 접기) | `AdPlacement.tsx` | 결과 카드·다음 링크 CLS·우발 클릭 방지 |
| G | 하단 공유 바: 인플로 광고가 하단 120px 밴드를 지나는 동안 숨김 | `bottomAdDetect.ts`, `FloatingShareBar.tsx` | "광고를 가리는 요소" 정책 리스크 제거 |
| H | `PageFooterAds` 순서 HomeTop → InArticle → 쿠팡(고지문이 광고를 밀던 것 해소) | `PageFooterAds.tsx` | 41지면 |


### 8-3. 검증 (로컬 프로덕션 빌드, 광고·분석 요청 차단)

- 첫 광고 깊이 재실측(모바일): 삼성 7,183 → **3,405px**(1인당 결과 직하 HomeTop, 개인 세후 직하 CalcResult 4,649px), /calc 12,541 → **1,990px**, 성과급 허브 4,101 → **1,051px**, 표 2종 모바일 최대 공백 60화면 → **~21화면**(유닛 5개), 표 데스크톱 최대 공백 11.1 → **4.1화면**(유닛 5개 유지). 회사 페이지 최대 공백 ~8,500 → **6,313px**. 공무원 2027·/job·/salary·/monthly 는 변화 없음(이미 결과 직하).
- 동작 검사(Playwright, 21항목): 삼성 두 결과 카드 직하 광고·다음 링크는 광고 아래·5유닛 렌더, /calc 6유닛·분야 필터 후 오류 0, 표 데스크톱 tbody 안 광고 행 2개, PageFooterAds 순서, CalcResultAd 컨테이너 270px(250+라벨 20) 예약, 뷰포트 안 unfilled 시 높이 유지(visibility hidden)·페이지 오류 0. 유일한 미달은 회사 페이지 공백 임계값(6,000px, 임의 기준)뿐.
- 게이트: vitest 83 파일 1,486건, tsc 0, eslint 0 오류, `ad-audit` ERROR 0/WARN 0(`--diff` WARN 2는 유닛 이동을 삭제로 오인한 휴리스틱), qa:share missing 0, qa:crawl 266쪽 통과, qa:quality(최종 빌드 재실행 결과는 §4 푸시 기록에 병기).
- 적대적 리뷰 3관점(정책·UX / 운영 규칙·dedup / 코드): 모두 "ship-with-fixes". 반영한 지적 — 표 데스크톱에서 모바일 카드용·행용 같은 슬롯 2회로 데스크톱 광고가 죽던 문제(뷰포트 쪽에만 렌더), 표 광고 셀의 가로 클리핑(sticky·폭 제한), 삼성 결과 광고와 다음 링크 32px 간격, unfilled 유지 조건을 "뷰포트와 실제로 겹칠 때"로 정밀화, /calc 필터 상태의 광고 재마운트(기본 목록에서만 렌더). 세 리뷰 모두 CalcResultAd 위에 삽입된 UI 없음·슬롯 1회 규칙·슬롯 ID·쿠팡 파라미터 불변을 확인.
- 정책 근거: Google 게시자 정책의 "콘텐츠를 가리는 광고 금지"(하단 공유 바 양보), "광고와 콘텐츠 구분"(라벨·여백 유지), 우발 클릭 방지(입력·버튼과 32px 이상). 광고 수는 페이지당 최대 6(문서 길이 22,000~66,000px)으로 콘텐츠 대비 과밀 아님.

### 8-4. 배포 후 확인 지표 (§6 와 같은 창)

- AdSense URL 채널 `/calc`·`/calc/samsung-bonus`·`/salary-db` 의 페이지 RPM·노출/PV·조회 가능 비율 — 특히 삼성 페이지의 노출/PV(첫 광고 8.5→4.0화면).
- 광고 단위별: CALC_RESULT·HOME_TOP·DISPLAY_2 노출과 Active View, 표 페이지(IN_ARTICLE·HOME_TOP)의 요청 증가. 멀티플렉스는 변경 없음.
- GA4 `ad_filled`/`ad_unfilled`(slot_kind·page_path) 비율, `share_bar_impression` 감소 여부(광고 밴드 양보 영향).
- 진행 중인 콘솔 인페이지 간격 실험(50→200px)과 창을 분리해 판정한다. 이 배포가 그 실험의 T0 를 바꾸지는 않는다.

## 9. 스프린트 1 실행 — 2026-09-12 새벽 (계획서 `next-upgrade-plan-2026-09-11.md` §2·§7)

운영자 지시 "진행해" → 계획 §7 순서대로 S1-0 → S1-1 → S1-5 → S1-6 → S1-3 → S1-2 를 독립 커밋으로 구현하고, 병합본에 5관점 적대 리뷰(광고 정책·시즌 키·분석 프라이버시·SEO/리다이렉트·CI 동등성, 발견 10건 → 검증 25에이전트)를 돌린 뒤 확정 지적을 고쳐 배포했다.
광고 슬롯 ID·env·쿠팡 파라미터 무변경, 광고 위 UI 삽입 0건(`ad-audit --diff --base b465bba` 로 커밋 범위 전체 재평가: 삽입 0·삭제 0·인접 신규 0).

### 9-1. 배포 항목 (커밋 순, main)

| 항목 | 커밋 | 변경 | 근거·기대 효과 |
|---|---|---|---|
| S1-0 핀 계측 | `1c8a624` | 계산기 결과 아래 '다음 계산기' 핀 nav 에 `data-msy-module="calc-next-pins"` 1속성 | 9/11 배포분의 클릭이 `guide_cta_click`(position=calc-next-pins) 으로 잡힘 — 9/19 D+7 표본 확보 |
| S1-5 SEO 위생 | `ec6ebcd` + `4a6ce83` | `/community`(2025-09 삭제 후 404) → `/qna` 308, `/company/:id` → `/salary-db/:id` 를 next.config 규칙으로(캐시 재생 시 Location 소실 함정 회피, compare·simulator 는 끝슬래시 형태까지 규칙 자체가 제외) | 구 URL 권위 회수·404 크롤 예산 절약. Edge 페이지는 폴백 유지(마스터플랜 ⑩ 결정 후 삭제) |
| S1-3 공무원 2027 | `7e7e6c8` + `7b16228` | 선택기 카드의 페이지 내 앵커를 `/monthly/{격자}` 링크로 치환(`nearestStaticMonthlyAmount`, 격자 밖 404 불가), 라벨은 리뷰 반영 "일반 근로자 기준 실수령 참고"(공무원연금·수당 미반영을 숨기지 않음), position `civil-forecast-net`. 링크 2개·행 높이 20px 그대로(아래 HomeTopAd 위치 불변) | 3위 랜딩(1,865세션/28일)에서 결과 직하 다음 페이지 0건 → 1건 |
| S1-2 성과급 22쪽 | `add77fd` + `83679d6` + `6c3a260` | `CalcResultAd` **아래** 서버 컴포넌트 `BonusNextLinks`(회사 DB 1 + 같은 섹터 형제 계산기 2, OfferSlot 없음, 삼성 4파일 무접촉). 간격 32px 고정(className 은 추가만) | 결과 직하 다음 링크 0건 → 3건. 도달 소규모(hyundai 519세션/28일) — 실험 |
| S1-1 시즌 키 | `6237a80` + `7a9f8fc` | 세트 선택을 빌드 시점 상수 `SEASON_KEY`(prebuild 코드젠)로: ~9/25 SEP → 9/26 OCT → 12/1 DEC 자동(KST), JAN 은 `SEASON_KEY_OVERRIDE` 수동. `verify:site` 만료·D-7 WARNING(비차단), 주간 health-check 가 프로덕션 `data-season-key` 를 `/table/2026/annual`(캐시 없음)·`/salary/50000000`(엣지 캐시 4h 경로)에서 대조. JAN 만료(2027-03-11) 알람 추가 | 2026-08 7월 세트 장기 잔류 사고 유형 차단. 3소비자(헤더 칩·시즌 상단·표 하단) 동시 전환 |
| S1-6 계측 2종 | `c72ba14` + `e1f8254` | `ad_filled/ad_unfilled` 에 `ad_height`(채움 시 iframe 크리에이티브 높이, 미채움 0)·`viewport`(m/t/d). `web_vitals` 에 20% 표본으로 `lcp_element`·`lcp_load_state`·`cls_target`(태그+id+클래스 2개, 80자, 텍스트·값 없음; bfcache 복원 시 CLS 귀속 리셋). 비표본 이벤트는 종전과 동일 | S3-3(2027-02) 예약 높이 재조정 자료·데스크톱 LCP 108 URL 요소 식별. 승인②(9/5 계측 예외) 필드 확장으로 분류 — 요청·렌더·dedup 무변경 |
| 도구 | `da99a03`, `01ce9fe` | `ad-audit --diff --base <ref>`(커밋 후 사후 평가 가능), `gen-salary-amounts` 줄바꿈만 다른 재작성 중단 | 게이트 공백·Windows 더티 트리 제거 |

### 9-2. 검증 (병합 최종 빌드, 광고·분석 요청 차단)

- CI 동등 게이트: vitest 88파일 1,602건, tsc 0, eslint 추적 파일 0(288 오류는 gitignore 된 `.artifacts/` 로컬 산출물뿐), `ad-audit` ERROR 0/WARN 0, `verify:tax/site/companies/sitemap/bonus` OK(`verify:site` 에 시즌 키 --check 포함), `qa:share` missing 0, node:test 11건, python 저장소 검증 2건 PASS, `qa:quality` 2,497 HTML 구조 이슈 0·미해결 링크 0, `qa:crawl` 266쪽 통과, `qa:english` 39/39.
- 브라우저(Playwright, 모바일 390px·데스크톱 1366px): 리다이렉트 5건(308 목적지·실페이지 200), 공무원 링크(격자 위 href·등급 변경 시 갱신·행 20px·광고 위 높이 불변), 핀 nav 속성, 성과급 22쪽 전부 핀 3개·CalcResultAd 아래 정확히 32px·hrefs 45개 200·삼성 무접촉, 표·/salary·/monthly 의 `data-season-key="SEP"`, 채움 이벤트 실측(dataLayer: 모바일 `ad_unfilled` ad_height 250·viewport m, 데스크톱 `ad_filled` viewport d), 광고 기하 회귀 21항목 중 20 통과(미달 1 = 회사 페이지 공백 임계 6,000px 임의 기준, 9/11 과 동일 6,313px).
- 적대 리뷰 결과: 확정 7 → 수정 6(ad_height 가 예약 minHeight 바닥에 깔리던 것, bfcache CLS 귀속, JAN 이후 알람 공백, 엣지 캐시 경로 미검사, 공무원 라벨 정직성, /company 끝슬래시), 수용 1(별칭 2홉 체인 — 기존 구조·루프 없음); 반박 3 중 2 는 그래도 보강(간격 고정, --base), 1 은 의도된 동작(월요일 헬스체크 FAIL = 알림 채널).
- 검증 중 발견한 함정(재발 방지): (a) 백그라운드 `next start` 를 TaskStop 으로 끊어도 node 자식이 살아남아 재빌드된 `.next` 를 계속 서빙 → React #423 hydration 오류·빈 DOM 거짓 실패. 재빌드 전 포트 3200 리스너를 PID 로 종료할 것. (b) `qa:quality` 는 `.next/server/app` 의 HTML 전부를 읽는데, 로컬 서버가 미등록 슬러그(`/calc/compound-interest` 등)를 온디맨드 렌더하면 404 스텁이 남아 "구조 이슈 3" 거짓 실패 — 빌드 직후·서버 기동 전에 실행. (c) 루트 레이아웃 인라인 GA 스니펫이 `function gtag(){}` 로 전역을 다시 정의하므로 `window.gtag` 스파이는 덮여 사라진다 — `dataLayer` 를 읽어 검증.

### 9-3. 커밋·푸시·배포 상태

- 커밋 14건 `1c8a624`…`01ce9fe` 를 2026-09-12 01:45 KST 에 `origin/main` 으로 푸시(b465bba..01ce9fe, force 아님). 이어서 S2-5 `f19e71e`. Cloudflare Pages 자동 배포 — 프로덕션 확인: **2026-09-12 01:58 KST 라이브 확인** — `/community` 308→`/qna`, `/company/naver` 308→`/salary-db/naver`, `/company/compare`·`/simulator` 200(끝슬래시 형태는 Next 내부 308 로 슬래시 없는 실페이지로), 공무원 2027 카드 새 라벨 1·앵커 0, `/calc/hyundai-bonus` bonus-next-links 1(핀 3), `/table/2026/annual`·`/salary/50000000` `data-season-key="SEP"`, calc 핀 `calc-next-pins` 속성 1. S2-5(`f19e71e`)는 스프린트 2 배치와 함께 배포 예정.

### 9-4. 운영자 항목 (콘솔·날짜)

1. GA4 맞춤 측정기준(이벤트 범위) 등록: `ad_height`, `viewport`, `lcp_element`, `cls_target`, 선택 `lcp_load_state` — 등록 전에는 이벤트에 실려도 보고서에 안 보인다.
2. 9/26(토) 이후 **첫 푸시**가 시즌 세트를 OCT 로 바꾼다(prebuild 자동). 그날 푸시가 없으면 구 세트 잔류 → `verify:site` WARNING·9/28(월) 헬스체크 FAIL 로 알림. 자동 푸시 워크플로는 운영자가 되돌려 두지 않았다 — 9/26 에 아무 커밋이나 푸시 + CF 캐시 퍼지.
3. 1/2 JAN: `src/lib/seasonKey.ts` 의 `SEASON_KEY_OVERRIDE = "JAN" as SeasonKey | null;` → `npx tsx scripts/gen-season-key.ts` → 커밋·푸시·퍼지. JAN 세트는 2027-03-11 부터 만료 경고.
4. 승인②(9/5 계측 예외) 필드 확장 동의는 "진행해"로 갈음했다 — 다른 판단이면 `e1f8254`·`c72ba14` 만 되돌리면 된다(광고 요청·렌더 무관).

### 9-5. 판정 지표 (9/19 D+7 점검, 10/10 D+28 판정 — 9/11 두 배포와 창이 겹치므로 라우트 단면으로 분리)

- GA4 `guide_cta_click` position ∈ {calc-next-pins, bonus-next-links, civil-forecast-net} 클릭 수·클릭한 세션의 세션당 페이지.
- GSC: `/community`·`/company/*` 의 "리다이렉트가 있는 페이지" 증가(정상), `/qna`·`/salary-db/*` 노출 변화 없음 확인.
- `ad_filled` 의 `ad_height` 분포(slot_kind × viewport) — 예약 높이(120/250/280/600)와의 차이가 S3-3(2027-02) 승인 자료.
- `web_vitals` LCP 의 `lcp_element` 상위 5(데스크톱) → 폰트/이미지 원인 분리.

### 9-6. 수익 기대치 — 솔직한 수치

일 $10 → $100 은 코드 변경만으로는 나오지 않는다. 계획서·10x 계획의 실측 근거: RPM $4.40, 노출/PV 5.3(밀도 소진), 코드 레버 합계 ×1.05 미만, 도달 가능 배수 ×1.4~2.0(2027-03), 10배는 **세션 ×3~4** 가 전제(검색 유입 — 회사 연봉·시즌 콘텐츠·색인률)다. 이번 스프린트는 계측·사고 예방·다음 페이지 유도(세션당 페이지)를 확보한 것이고, 수익 증가는 D+28 실측 전까지 **가정**이다. 이어지는 스프린트 2·3(정확성, 회사 430쪽 실수령 hop, 중복 링크 정리, 간이 계산기 50종 본문, /salary 격자 정본화, 허브 H1)이 유입 쪽 레버다.

## 10. 스프린트 2 + S3-5 실행 — 2026-09-12 새벽~오전 (운영자 지시 "계획 전부 순차 진행, 법적 문제·비용 없이")

스프린트 1 배포 직후 계획 §3·§4 를 이어서 실행했다. 날짜 게이트가 있는 것(S2-0 삼성 9/21 이후, S3-2 10/11 이후, 홈·/calc H1 9/20 이후)은 건드리지 않았고, 나머지는 워크트리 병렬 구현 → 순차 병합 → 4관점 적대 리뷰(발견 12 → 전부 수정) → 게이트 → 빌드 → 브라우저 검증 → 푸시 순서다. 광고 코드·슬롯·위치 무접촉, `ad-audit --diff --base 01ce9fe` 로 범위 전체 재평가 0/0.

### 10-1. 배포 항목 (커밋 순, main)

| 항목 | 커밋 | 변경 | 근거·효과 |
|---|---|---|---|
| S2-5 스니펫 실험 | `f19e71e` | `/home-loan` description 만 질의어 선두로(114자, title 무접촉) | 네이버 98,097노출·CTR 0.5%. 판정 = 서치어드바이저 페이지별 CTR 28일(10/5 전후) |
| S2-3 중복 링크 | `9df7b5b` + `854d000` | `getRelatedCalculators(..., exclude)` + 백필로 **블록 항목 수 불변**, `nextActionLinks.ts`(서버 안전 순수 함수), 홈·/salary 416·/monthly 105·/calc 202·/share 배선 | 교차 블록 중복: calc 82→19쪽(href 97→20), 홈·/salary 1→0. pins⊂cards 잔여는 광고 위 높이를 줄여야 해서 **승인 항목으로 보류**(테스트가 잔여치를 고정) |
| S2-2 회사 표 실수령 hop | `54febe1`·`c622d07`·`70a89d0` | `CompanySalaryTable` 연 실수령 셀만 `/salary/{정적}` 인라인 링크(`salaryReportHref`: 범위 밖·괴리 2% 초과는 **클램프 대신 null**), 로컬 스냅 복제 2벌 제거, `verify:site` 에 430쪽×5행 전수 게이트, 모듈 `company-salary-net` | 1,890셀 링크(정확 1,778·2% 이내 스냅 112 — 타이틀에 '구간' 표기), 평문 260(집합 밖 58·괴리 202). 행 높이·td 클래스 불변, 광고와 ≥1,400px |
| S2-1 정확성 | `d10c7df`·`461b8a7`·`d55685f`·`cdf3176` + `687b9dd` | 복리·근로소득세 간이·퇴직금 공식 문구 = compute, 최저임금·실업급여 상수 정본화(`config/unemploymentBenefit.ts`), `verify:tax` 패턴 확장(파일별 허용 패턴), 월 환산 4.345주 → **209시간(48h 앵커)** 통일 | 출력 변경 5라우트: hourly-to-yearly 연 25,828,070→**25,882,560**(+0.21%), yearly-to-hourly 시급 23,974→23,923, weekly-pay 주급 690,449→688,995, holiday-allowance 월 358,723→359,480, 주휴수당 페이지 위젯 2,152,339→2,156,880. 최저임금 왕복(10,320→연봉÷12÷209=10,320) 무손실 |
| S3-5 허브 H1 | `219e74e` | /qna·/glossary·/tools·/insights·/table/2026/annual·/money-check·/hub·영문 허브 5곳 H1 을 키워드 선두로, 슬로건은 부제 `<p>` 첫 문장(줄 수·요소 수 불변). **홈·/calc 는 9/20 M01 판정 후** | 히어로 직하 광고 위치 불변(스냅샷 대조 §10-2) |
| S3-5 시즌 메뉴 | `fffc8dd` | 헤더 시즌 항목 SEP 38→**10**, OCT 37→12, DEC 36→12, JAN 38→12(`SEASON_REST` header 33→5), 푸터에 order 19+ 신설로 도달 보존, 키별 ≤12·성과급 메뉴 교집합 0·제거 href 도달 경로 테스트 | NAV-11 해소, 12/1 자동 전환이 구 구조를 되살리지 않음 |
| S3-1 기반 | `25595ac`·`adf0c1f`·`d854eec`·`f8795ac` | enrichment `sources` 병합(공식 호스트 30개 허용목록 게이트), `details` 장문 필드(explanation 아래 같은 섹션, 메타 무영향), 실측표·작성 규칙·기본값 결과 헬퍼 | 본문 50종 작성은 별도 배치(§11 예정) |
| 리뷰 수정 | `9c243c3`·`4941493`·`854d000`·`70a89d0`·`687b9dd` | §10-3 | — |
| 도구 | `44e2b1b`·`b5bf49e` | `gen-site-metrics`·`gen-guides-meta` 줄바꿈만 다르면 재작성 안 함 | Windows 더티 트리 0 |

### 10-2. 검증 (병합 최종 빌드, 광고·분석 차단)

- CI 동등: vitest 96파일 1,716건, tsc 0, eslint(변경 57파일) 0, `verify:tax` 0(허용 28/28), `verify:site` 0(회사 href 게이트 포함), `ad-audit` 0/0 + `--diff --base 01ce9fe` 0/0, qa:quality 2,497 HTML 구조 이슈 0·미해결 링크 0, qa:crawl 266쪽 통과, qa:english 39/39.
- 브라우저: 회사 표 링크 5쪽(행 5·링크 1~5·inline·행 높이 불변·광고와 ≥1,400px·hrefs 200), S2-3 DOM 대조(/salary·/calc 4종: RelatedCalculators ∩ 상류 = ∅·항목 4 유지; 홈은 결과 카드 상호작용 뒤에만 렌더돼 DOM 검사 대신 단위 테스트로 보장), S2-1 표시값(25,882,560·2,156,880·4.345 라벨 0), S2-5 description 선두 확인, 허브 H1 12곳 h1 1개·히어로 직하 첫 광고 위치 스냅샷 대조 18/18 뷰 ±2px(예외: /glossary 모바일 −12px 위로 이동 — 허용) — **1차 빌드에서 /qna 모바일 +29px·/tools 데스크톱 +32px 가 잡혀 부제로 옮긴 슬로건을 삭제하고 재빌드해 0px 로 복원(`79952a1`)**, 헤더 시즌 드롭다운 10개·푸터 details 5·시즌 링크 29, 스프린트 1 회귀 11/11, 광고 기하 20/21(회사 페이지 임계 6,000px 예외 동일), 채움 이벤트 ad_height/viewport 재확인.
- 회사 링크 5쪽 실측: 행 5·링크 1~5·전부 `display:inline`·행 높이 불변·가장 가까운 광고까지 ≥1,400px·hrefs 200.

### 10-3. 적대 리뷰(4관점: 링크·정확성·게이트·SEO, 발견 12 → 검증 24) 와 수정

| 발견 | 처리 |
|---|---|
| **[high] 계산기 explanation 수정이 메타 description 을 바꿈** — `seoText` 가 description<60자면 explanation 을 이어 붙임(10/9 동결 위반, yearly-to-hourly·weekly-pay 2쪽) | explanation 을 01ce9fe 와 바이트 동일로 복원, 209 기반 서술은 formula·FAQ 로 이동. **202종 title·description 스냅샷 테스트**(`calcDescriptions-2026-09-11.json`) 신설. S3-1 은 `details` 필드로만 작성 |
| [medium] `/share` 카드가 격자 밖 연봉에서 버튼 1개가 사라져 아래 CalcResultAd 가 올라옴 | null 이면 같은 클래스의 홈 계산기 버튼으로 자리 유지 |
| [medium] 쿠팡 야간수당 가이드 본문 355만원 vs 동결된 제목 354만원 | 본문을 제목 기준으로 되돌리고 10/10 에 제목·본문 동시 갱신 TODO |
| [low] hourly-to-yearly 공식·FAQ 가 여전히 4.345주 | 공식 = 209×(주+주휴)/48, FAQ 4.345=365÷7÷12 설명 |
| [low] `/calc` 에서 NextActions 미렌더 86종도 그 href 를 제외 · `/share` 미배선 | 렌더 시에만 제외, `/share` 배선 |
| [low] 회사 표 링크 title 이 스냅 전 금액 | 스냅 금액과 '구간' 표기 |
| [low] verify:tax `\b` 가 10,320,000 도 매칭 · 구형 허용목록 8건이 모든 패턴 허용 | 부정 전방탐색, 파일별 패턴 명시 |

### 10-4. 커밋·푸시·배포 상태

- `f19e71e`…`79952a1` 24커밋을 2026-09-12 3시 27 KST 에 `origin/main` 으로 푸시(01ce9fe..79952a1). 프로덕션 확인: **2026-09-12 03:37 KST 라이브 확인** — `/home-loan` description 선두 "주택담보대출 계산기", `/qna` H1 "연봉·세금 자주 묻는 질문 Q&A", `/salary-db/naver` `company-salary-net` 모듈·/salary 링크 4, `/calc/hourly-to-yearly` 25,882,560 표시, `/table/2026/annual` H1 "2026 연봉 실수령액 표"·`data-season-key=SEP`, `/tools` H1 "금융 계산기 모음 2026 31종".

### 10-5. 운영자 항목·판정

- 9/20 M01 판정 후: 홈·/calc H1 키워드화(S3-5 잔여) 1회. 9/21 이후: S2-0 삼성 배치(L13b + 공유 해시). 10/10: /guides/coupang-fulfillment-night-pay-2026 제목·본문 209 기준 동시 갱신, S3-2 착수(스코핑 `docs/salary-grid-canonicalization-scoping-2026-09-12.md`).
- 판정 지표(10/10 D+28): `guide_cta_click` position=company-salary-net(회사 430쪽 → /salary 이동률), /calc 세션당 페이지(중복 제거 전후), 서치어드바이저 /home-loan CTR, GSC `/calc/hourly-to-yearly` 등 5쪽 노출(값 변경 영향).

## 11. S3-1 본문 2차분 50종 + S3-4 실행 — 2026-09-12 오후 (운영자 지시 "완료된 것 빼고 순차 진행")

날짜 게이트가 없는 잔여 항목만 실행했다. S2-0 삼성(9/21 이후)·M01①/홈·/calc H1(9/20 판정 후)·PWA 배너 수리(9/18~20)·lite 이웃 카드(9/21 이후)·S3-6(10/9 이후)·S3-2(10/11~, 1단계는 운영자 GSC 내보내기)·S3-3(2027-02)은 그대로 둔다. 광고 코드·슬롯·위치·env 무접촉, `ad-audit --diff --base HEAD` 삽입 0·인접 신규 0.

### 11-1. 배포 항목 (커밋 순, main)

| 항목 | 커밋 | 변경 | 근거·효과 |
|---|---|---|---|
| S3-4 문서 갱신 | `f0b4533` | 10x §5-11(OfferSlot 이동) ✅ `f2379fa` 해소 표기, L07' 사이드바 강등 후보(9/8 AdSense 기기 분해 데스크톱 수익 16.6%·자동 사이드레일 중복 — 9/13 GA4 기기 비중으로 확정), 마스터플랜 §12-2 ⑥⑦ 상태, 수익 감사 §7-5(PageFooterAds 순서) 완료 | 계획 §4 S3-4 "문서 갱신 먼저" |
| S3-4 nurse-salary 보강 | `0341bce` | `src/lib/guides/supplements.ts` + `GuideSupplement`(서버 컴포넌트)를 `guides/[slug]/page.tsx` 의 **HomeTopAd 아래**에만 렌더. 연차별 급여 구조·직군/근무처 비교(간호직 8급 봉급표·보건교사 교원 봉급표·간호조무사 최저임금은 저장소 상수 import)·FAQ 4문항. FAQ 추출을 본문+보강으로 확장(FAQPage 3→7). `modifiedDate` 2026-09-12 | 397노출 살아 있는 가이드 온페이지 보강. 본문에 넣으면 본문 내 광고 분할점·CalcResultAd·HomeTopAd 가 밀리므로 전용 슬롯. 수치는 복지부 2020 실태조사·고용24·law.go.kr·경기도/시흥시 2026 공고·인사혁신처 봉급표만(미검증 7건 제외, 로그 `docs/nurse-salary-supplement-facts-2026-09-12.md`) |
| S3-1 배치 D | `aa45940` | enrichment 파일 16종(enrichments 8·ext-a 5·ext-b 3): details·caveats·faqs·sources. formula≠compute 2건 교체(real-estate-flip-cost·real-estate-capital-gains-quick). ext-a 최저임금 표시 리터럴 허용 등재 | 실측표 §2 후보 순 |
| S3-1 배치 E | `ed12743` | expandedFinance 26종: define() 스펙의 questions·caveats(+`individualCaveats`)·details, 해외 출처 키(Microsoft·investor.gov·CFPB·BLS) → 공식 2건 | B02 보일러 47→21 |
| S3-1 배치 F | `103b138` | expandedPractical 8종 + `individualCaveats` 플래그 신설(기본 false), 실측표 재생성 | B01 50→42. details 49→99/202, 출처 2건 49→99 |

### 11-2. 작성·검증 절차 (재사용 가능)

1. 컨텍스트 덤프(슬러그별 JSON: 필드·기본값·compute 결과·compute 소스·twin·현재 본문) → 작성 에이전트 1/슬러그(출처 2건 실제 GET 200 + 본문·시행연도 확인).
2. 적대 검증 에이전트 1/슬러그(기본 태도 반박 — 출처 재요청, 예시 숫자 compute 대조, compute 의미론, 형식, facts 대응, 보일러 재사용) → 지적 시 수정 에이전트 → must-fix 였던 18종은 재검증(전부 통과).
3. 결정론 린터: 600~1,000자·4문단·HTML/마크다운/이모지·마케팅어·타 사이트·내부 경로 실존(routes.txt)·sources 2건 허용 호스트·제목 연도·FAQ 3~5개 120~300자·caveats 2~4개·**202종+초안 전체와 문장 단위 중복**·예시 문단 숫자의 compute 추적. 50/50 통과.
4. 적용 스크립트(3가지 파일 형식 자동 패치, 멱등) → 병합 레지스트리 대조(details/caveats/faqs/sources = 초안, title/description/explanation/fields/relatedSlugs 바이트 동일 50/50).
5. 게이트: vitest 96파일 1,717건, tsc 0, eslint 0, ad-audit 0/0(+diff 0/0), verify:tax 0, 실측표 재생성. 사실 로그 D 186행·E 198행·F 54행(FAIL 로 본문에서 뺀 주장 3건 기록).

### 11-3. 발견·함정 (다음 배치용)

- law.go.kr 조문은 가독 URL 셸 안의 iframe `LSW/lsSideInfoP.do?lsiSeq=…&joNo=<4자리>&joBrNo=00&docCls=jo&urlMode=lsScJoRltInfoR` 로만 본문이 온다(규칙서의 joNo 6자리 힌트는 빈 셸 — 규칙서 갱신 대상).
- `wageConversion.test.ts` 가 시급↔월급 3종 FAQ 문구("209 ÷ 48 ≈ 4.354"·"365 ÷ 7 ÷ 12"·"정확히 209시간(≈ 4.354주)")를 고정 — 수정 에이전트가 문장을 바꿔 1회 실패, 복원.
- 산문의 최저임금 리터럴(10,320·2,156,880)은 `verify:tax` 가 파일별로 막는다 — `scripts/tax-constants-allow.json` 사유 등재.
- 세션 한도로 워크플로가 2회 끊겨 3단계(작성 → 검증/수정 → 마무리)로 나눠 재개했다. 에이전트 합계 약 260, 서브에이전트 토큰 약 2,100만. 다음 배치는 25종 단위로 나누고 검증을 must-fix 재검증만 중간 강도로 두는 편이 싸다.
- 검증자가 지적한 compute 관찰(수정 안 함): `credit-line-daily-interest` 하루 이자만 보려면 둘째 구간 0일 입력 필요(FAQ 로 안내), `deposit-break-switch` 음수 표기는 화면과 같은 ASCII 하이픈으로 통일.

### 11-4. 남은 것·운영자 항목

- S3-1 잔여 103종(실측표 §2 후보 `payment-holiday-cost`부터) — 동결기에도 문자열만으로 계속 가능.
- 운영자: 9/13 GA4 기기 비중(L07' 강등 확정), GA4 맞춤 측정기준 5개 등록(§9-4), 9/21 앵커 ON, 9/26 시즌 세트 교체 푸시 + CF 퍼지, M05(10x §5-12) 승인 여부.
- 다음 코드 슬롯: 9/18~20 InstallPwaBanner PV 수리 → 9/20 판정 후 M01①·홈/calc H1 → 9/21 이후 S2-0 삼성(L13b+공유 해시)·lite 이웃 카드 → 10/9 S3-6 → 10/11 S3-2 → 10/31 구조 마감.
