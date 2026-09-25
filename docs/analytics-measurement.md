# Analytics measurement contract

The measurement update separates user actions, visible results, ad requests, and partner banner impressions. It does not change ad positions or ad load.

## Calculation events

Events with `measurement_version=2` use a calculator within one pathname visit as the counting unit. Navigation away and back starts a new visit. Component remounts within the same visit do not start another funnel.

| Event | Meaning |
|---|---|
| `calc_start` | First trusted interaction with eligible calculator controls |
| `result_view` | First valid result visible in the viewport; `result_origin` distinguishes `default` from `user` |
| `calc_success` | First valid, current result visible after a trusted user interaction |

The home salary calculator also requires an explicit completed calculation matching the current inputs. Restoring shared inputs or viewing defaults is not a successful user calculation. Repeated calculations do not create additional successes in the same visit. Do not compare the legacy input-idle `calc_submit` count directly with the new success count.

Coverage: home salary calculator, shared `SimpleCalculatorView` calculators, Samsung bonus pool and personal calculators, Hyundai bonus calculator (added 2026-09-19), and the Chuseok bonus mini calculator. Other independent calculators are not included in this success funnel. Do not use all site visits as the denominator for this subset. Hyundai's tax-assumption disclosure toggle is not a calculation interaction; its scenario, amount, and tax controls are eligible inputs.

Calculation events contain calculator type, sanitized page path, measurement version, and result origin where applicable. Amounts, income bands, family details, and result payloads are excluded. Custom event URLs remove calculation/share payloads and preserve campaign attribution parameters. Automatic Google tag events are separate and require their own URL-redaction verification; this wrapper is not proof that all automatic telemetry has been sanitized.

## Advertising and partner events

- `ad_request_attempt`: a manual slot is about to push an AdSense request. This is not a served impression.
- `ad_request_error`: that push threw an exception. No error text or input data is included.
- `ad_filled` / `ad_unfilled`: the existing slot status observer; these are not revenue or viewability measurements.
- Since 2026-09-25 the four manual-ad events above and `ad_unit_click` carry `nav_type` (`landing` = first document load, `soft` = after a client-side route change). Automatic `page_view` carries the same value through `gtag('set')`. See "소프트 내비게이션 계측" below.
- `coupang_impression`: an actual rendered banner reaches 50% viewport intersection with positive dimensions. Empty fallback wrappers are excluded. `banner_size` and `category` come from the rendered banner, matching click dimensions. The legacy `size_key` alias now reflects actual size.
- `affiliate_impression`: an offer card reaches 50% viewport intersection. Observers restart when pathname or offer changes; callbacks from disposed observers are ignored.

These partner events describe site observations. Partner-recognized clicks, purchases, approvals, and commissions remain separate data sources.

## Analysis and rollout

Register event-scoped definitions for `calc_type`, `measurement_version`, `result_origin`, `slot_kind`, `position`, `offer_id`, `vertical`, `banner_size`, `nav_type`, and `dest_tpl` as needed in the reporting property. `calc_success` may be a key event with no default monetary value. Do not assign fictional revenue to calculation or partner clicks.

Record the deployment boundary before comparing measurements. Revenue remains the source platform's reported amount; GA views and AdSense pageviews have different definitions. URL-prefix channels overlap and must not be added together as independent revenue.

Verify defaults, invalid input, accepted input, a visible current result, repeated input, and navigation away/back before using the funnel. Confirm received event parameters after deployment. Hold ad load steady while establishing the new measurement baseline, then change one ad setting per experiment.

## 소프트 내비게이션 계측 `nav_type` (2026-09-25 — 수익 추천 #1 '링크 이동 광고 회수' 1단계, 측정 전용)

**왜**: 28일 GA4 page_view 124,965 대 애드센스 집계 PV 93,664, 약 3.1만(25%) 차이. 가설은 "사이트 안 링크 이동(Next.js 클라이언트 전환)으로 본 페이지는 애드센스 PV 로 세지 않고 자동광고도 다시 붙지 않는다"이다(`docs/revenue-recommendations-2026-09-25.md` 1번). 이 계측으로 7일 안에 가설을 확인하고, 10/12 2단계 시험(회사 DB 페이지 본문 링크를 새로 불러오기) 진행 여부를 정한다.

**값의 정의**

| 값 | 뜻 | 애드센스 PV |
|---|---|---|
| `landing` | 이 문서의 첫 로드 — 검색·외부 유입, 새 탭, 새로고침, 하드 링크 | 센다 |
| `soft` | 같은 문서 안에서 주소(경로·쿼리)가 바뀐 뒤의 뷰 — 사이트 안 링크, 검색창 이동, 표 페이지 넘김(`?page=`), 뒤로·앞으로 | 가설: 안 센다 |

한 번 `soft` 가 되면 그 문서가 끝날 때까지 `soft` 다. 해시(`#`)만 바뀌는 이동과 주소가 같은 replaceState 는 새 뷰로 보지 않는다.

**어디에 실리나**

- `page_view`(자동 수집): `gtag('set', { nav_type })` 전역값으로 싣는다. `landing` 은 ga4-init 의 config(첫 page_view)보다 먼저, `soft` 는 주소를 바꾸는 pushState/replaceState 직전에 넣는다. page_view 를 새로 보내지 않으므로 **page_view 수는 그대로다**(중복 집계 없음).
- 광고 계측 `ad_request_attempt`·`ad_request_error`·`ad_filled`·`ad_unfilled`·`ad_unit_click`: 이벤트 인자로 명시한다. gtag 우선순위(이벤트 > config > set)라 전역값보다 이벤트 값이 이긴다.
- 그 밖의 이벤트(자동 수집 스크롤·참여, 계산·공유 이벤트)에도 전역값이 따라갈 수 있지만 이 절의 분석에는 쓰지 않는다.
- 바뀌지 않은 것: 전역 `trackEvent`·ga4-init 스크립트(10/10 판정 전 규칙)·광고 요청/렌더/dedup/접힘 로직·DOM(무렌더 컴포넌트). 광고량 변경이 아니므로 P0 창(9/25~10/8) 규칙과 겹치지 않는다.
- 코드: `src/lib/navType.ts`(정의·설치) · `src/components/NavTypeTracker.tsx`(루트 layout, ga4-init Script 보다 앞 형제) · `src/lib/analytics.ts`(광고 5종 인자) · 테스트 `src/lib/__tests__/navType.test.ts`.

### 배포 당일 할 일

1. ☐ **GA4 맞춤 측정기준 `nav_type` 등록(배포 당일)**: 관리 → 데이터 표시 → **맞춤 정의** → 맞춤 측정기준 만들기 → 측정기준 이름 `nav_type` · 범위 **이벤트** · 이벤트 매개변수 `nav_type` → 저장. 맞춤 측정기준은 **소급되지 않는다**. 만든 뒤 24~48시간이 지나야 보고서·탐색에 보이고, 등록이 늦은 만큼 10/2 창이 짧아진다. 표준 속성의 이벤트 범위 한도는 50개라 목록 수를 먼저 본다.
2. ☐ **실제 전송 확인(5분, 광고는 클릭하지 않는다)**: 운영 사이트(엣지 캐시 Purge 뒤)에서 개발자 도구 → 네트워크 → 필터 `collect`.
   - ① `/salary-db/` 회사 페이지를 새로 열면 `en=page_view` 에 `ep.nav_type=landing`
   - ② 본문 링크로 다른 회사로 이동하면 새 `en=page_view` 에 `ep.nav_type=soft`
   - ③ 광고 자리까지 스크롤하면 `en=ad_request_attempt` 에 같은 값
   - 이벤트는 묶여서 보내질 수 있으므로 요청 주소와 페이로드를 모두 본다.
   - ②의 page_view 에만 `ep.nav_type` 이 없으면: Google 문서는 `set` 이 맞춤 인자를 모든 경우에 전달한다고 보장하지 않는다. 이 경우 page_view 분모를 쓸 수 없으므로 10/2 판정을 보류하고 알린다. 대안(ga4-init config 에 인자 추가)은 ga4-init 변경이라 10/10 판정 뒤에만 할 수 있다.
3. ☐ 배포 시각과 Purge 시각을 아래 기록표에 적는다.

### 10/2 탐색 (자유 형식)

- **기간**: 배포 다음 날 ~ 10/1(완료일만. 배포가 9/25 이면 9/26~10/1, 6일). 10/9(P0 14완료일 조회일)에 같은 탐색을 10/8 까지로 다시 뽑아 확인한다.
- **측정기준**: `이벤트 이름` · `nav_type`(맞춤) · `페이지 경로 및 화면 클래스`. **측정항목**: `이벤트 수`.
- **필터**: 이벤트 이름 정규식 `^(page_view|ad_request_attempt)$`.
- **배치**: 행은 `페이지 경로 및 화면 클래스`, 열은 `이벤트 이름`·`nav_type`. 템플릿별 합계는 아래 정규식으로 필터를 바꿔 가며 보거나 CSV 로 내보내 묶는다.

| 템플릿 | 페이지 경로 정규식 | 비고 |
|---|---|---|
| **회사 DB(판정 대상)** | `^/salary-db/` | 애드센스 URL 채널 `/salary-db` 와 같은 범위 |
| 연봉 금액 | `^/salary/` | |
| 월급 금액 | `^/monthly/` | |
| 계산기 | `^/calc/` | |
| 가이드 | `^/guides/` | |
| 홈 | `^/$` | |
| 전체 | 필터 없음 | 가설의 25% 확인용 |

- **계산(템플릿마다)**
  - 착지 요청률 `R_landing = ad_request_attempt(landing) ÷ page_view(landing)`
  - 소프트 요청률 `R_soft = ad_request_attempt(soft) ÷ page_view(soft)`
  - 비율 `R_soft ÷ R_landing`, 소프트 비중 `page_view(soft) ÷ page_view(landing + soft)`
  - `(not set)` 행(배포 전에 캐시된 HTML, 설치 실패)은 분모·분자 모두에서 빼고 비중만 적는다. 5%를 넘으면 Purge 여부부터 확인한다.

### 10/12 2단계 시험 판정 규칙 (사전 등록)

- **진행**: 회사 DB(`^/salary-db/`)에서 `R_soft < 0.5 × R_landing`. 소프트 뷰의 뷰당 광고 요청이 착지 뷰의 절반 미만일 때만 10/12 '회사 DB 본문 링크 하드 이동' 시험을 올린다. 광고량이 바뀌는 변경이라 운영자 승인이 필요하고, CF 캐시 규칙 HIT 확인이 먼저다(`docs/revenue-recommendations-2026-09-25.md` 1번).
- **진행하지 않음**: `R_soft ≥ 0.5 × R_landing`.
- **보류(권고)**: 회사 DB 의 landing·soft page_view 중 하나라도 500 미만이면 판정하지 않고 10/9 조회(14일 창)로 미룬다.
- **주의 — 이 규칙은 수동 광고 칸만 본다.** `ad_request_attempt` 는 사이트가 직접 넣은 광고 칸의 요청만 센다. AdPlacement 는 경로가 바뀌면 칸을 다시 요청하므로, soft 뷰의 수동 요청률은 landing 과 비슷하게 나올 수 있다. 수익의 81%인 자동광고는 GA4 에 보이지 않는다. 그래서 규칙과 별개로 다음 숫자를 같은 기간·같은 날짜 설정으로 함께 적는다. 규칙을 바꾸지 않는 판단 자료다.
  - **애드센스 착지 대조** = 애드센스 URL 채널 `/salary-db` 페이지뷰 ÷ GA4 `^/salary-db/` page_view(landing). 1에 가까우면(대략 0.85~1.15) 애드센스는 착지 뷰만 센다. 즉 soft 뷰에는 자동광고 집계가 없다. 사이트 전체도 같은 방식(애드센스 전체 PV ÷ GA4 전체 landing page_view)으로 한 줄 적는다.
  - 규칙은 '진행하지 않음'인데 착지 대조가 1 근처라면, 수동 칸 재요청 때문에 규칙에 걸린 것일 수 있다. 이때는 두 숫자를 함께 운영자에게 올려 결정받는다. 반대로 착지 대조가 1보다 크게 높으면(애드센스가 soft 뷰도 센다) 추천 문서의 '링크 이동 뒤에도 자동광고가 새로 붙는다'에 해당하므로 1번 항목은 폐기 후보다.

### 기록표

| 조회일 | 창 | 배포·Purge 시각 | 전체 soft 비중 | 회사 DB page_view landing / soft | R_landing | R_soft | 비율 | (not set) 비중 | 애드센스 착지 대조(/salary-db · 전체) | 판정 |
|---|---|---|---|---|---|---|---|---|---|---|
| 10/2 | 배포 익일~10/1 | | | | | | | | | |
| 10/9 | 배포 익일~10/8 | | | | | | | | | |

### 하지 않은 것

- **`autoads_seen` 이벤트 — 보류.** 자동광고 자리는 애드센스가 나중에 DOM 에 끼워 넣어서 언제 붙었는지 코드가 알 수 없다. 알려면 DOM 관찰자(MutationObserver)나 주기 조회가 필요하고, 이전 뷰에서 들어간 자리가 레이아웃에 남아 새 자리와 구분도 되지 않는다. 대신 위 '애드센스 착지 대조'와 수동 점검으로 확인한다. 수동 점검은 운영 사이트 회사 페이지에서 본문 링크로 이동한 뒤 10초 기다려, 개발자 도구 콘솔의 `document.querySelectorAll('.google-auto-placed').length` 가 이동 전보다 늘었는지, 늘어난 자리가 새 본문 안에 있는지 보는 방식이다. 광고는 클릭하지 않는다.

## 내비 표면 모듈 id + 목적지 템플릿 `dest_tpl` (2026-09-26 RPM-02, 측정 전용)

- **무엇이 바뀌나**: 모듈 id 가 없던 내비 표면 7곳에 `data-msy-module` 속성만 달았다(마크업·class·높이 무변경, 광고를 품은 요소에는 달지 않음). 루트 `InternalLinkTracker` 가 기존 `guide_cta_click`(position=모듈 id)으로 보낸다. 새 이벤트명은 없다.
  - `header-nav`(데스크톱 메뉴·모바일 메뉴 — 안쪽 `header-work-clock`·`header-money-check` 링크는 가까운 id 가 우선), `breadcrumbs`(보이는 이동 경로), `footer`(하단 메뉴), `salary-db-hub`(/salary-db 형제 허브·회사 카드·검색 0건 바로가기), `ranking-list`(/salary-db/ranking 순위표), `job-hub`(/job 직업 목록), `industry-list`(/industry/[slug] 회사·직업·다른 업계 목록).
- **`dest_tpl`**: 위임 계측(`trackInternalLinkClick`) 클릭에만 싣는 목적지 템플릿. href 는 하루 고유값 500개를 넘어 측정기준으로 못 쓰므로 17개 고정값으로 묶는다 — `company` · `compare` · `salary-db-hub` · `ranking` · `job` · `job-hub` · `bonus-calc` · `samsung-bonus` · `calc` · `salary-amount` · `monthly` · `pay-table` · `table` · `guide` · `industry` · `home` · `other`. 규칙은 `src/lib/analytics.ts` `destTemplate` 과 `src/lib/__tests__/destTemplate.test.ts` 표가 정본이다. 상장사 공시 트리는 허브(`/salary-db/listed`)=`salary-db-hub`, 순위형(`top-*`·`industry`)=`ranking`, 종목 페이지=`company`. 직접 onClick 호출부(related-calc·next-action·related-guide 등)는 종전 그대로 `dest_tpl` 이 없다.
- ☐ **운영자 — 배포 당일 GA4 맞춤 측정기준 `dest_tpl` 등록**: 관리 → 데이터 표시 → 맞춤 정의 → 맞춤 측정기준 만들기 → 이름 `dest_tpl` · 범위 **이벤트** · 이벤트 매개변수 `dest_tpl` → 저장. 소급되지 않으므로 늦으면 그만큼 10/19 판정 창이 짧아진다. 이벤트 범위 한도(50개) 여유를 먼저 본다.
- **보는 법**: 탐색 분석 자유 형식, 필터 `이벤트 이름 = guide_cta_click`, 행 `position`, 열 `dest_tpl`, 값 `이벤트 수`. 헤더 대 본문 클릭 비중은 `header-nav`·`breadcrumbs`·`footer` 합 ÷ 전체 위임 클릭. `dest_tpl` 의 `(not set)` 은 직접 호출부 클릭이거나 배포 전 JS 로 열려 있던 탭의 클릭이다.
