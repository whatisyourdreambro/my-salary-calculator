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
- `autoads_seen` (prepared 2026-09-26, ships only after operator approval): one read-only observation of AdSense auto in-page placements per landing view, sent once when the page is hidden or unloaded. It counts placements, requests and fills; it does not change ads. See "자동광고 관측 `autoads_seen`" below.
- `coupang_impression`: an actual rendered banner reaches 50% viewport intersection with positive dimensions. Empty fallback wrappers are excluded. `banner_size` and `category` come from the rendered banner, matching click dimensions. The legacy `size_key` alias now reflects actual size.
- `affiliate_impression`: an offer card reaches 50% viewport intersection. Observers restart when pathname or offer changes; callbacks from disposed observers are ignored.

These partner events describe site observations. Partner-recognized clicks, purchases, approvals, and commissions remain separate data sources.

## Analysis and rollout

Register event-scoped definitions for `calc_type`, `measurement_version`, `result_origin`, `slot_kind`, `position`, `offer_id`, `vertical`, `banner_size`, and `nav_type` as needed in the reporting property. `calc_success` may be a key event with no default monetary value. Do not assign fictional revenue to calculation or partner clicks.

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

- **`autoads_seen` 이벤트 — 9/25 에는 보류했고, 9/26 에 아래 '자동광고 관측' 절로 준비했다(운영자 승인 뒤 배포).** 보류 사유였던 두 문제는 이렇게 풀었다. 착지 뷰에서만 재고 소프트 이동이 일어나면 그 시점 값에서 멈추므로 이전 뷰의 자리와 섞이지 않는다. 또 DOM 관찰자 대신 5초 간격 조회(90초)와 보낼 때 1회 조회만 쓴다. 9/25 당시 기록은 다음과 같다. 자동광고 자리는 애드센스가 나중에 DOM 에 끼워 넣어서 언제 붙었는지 코드가 알 수 없다. 알려면 DOM 관찰자(MutationObserver)나 주기 조회가 필요하고, 이전 뷰에서 들어간 자리가 레이아웃에 남아 새 자리와 구분도 되지 않는다. 대신 위 '애드센스 착지 대조'와 수동 점검으로 확인한다. 수동 점검은 운영 사이트 회사 페이지에서 본문 링크로 이동한 뒤 10초 기다려, 개발자 도구 콘솔의 `document.querySelectorAll('.google-auto-placed').length` 가 이동 전보다 늘었는지, 늘어난 자리가 새 본문 안에 있는지 보는 방식이다. 광고는 클릭하지 않는다.

## 자동광고 관측 `autoads_seen` (측정 버전 `aa1`, 2026-09-26 준비 — 운영자 승인 뒤 배포, 측정 전용)

**왜**: 9/26 진단에서 애드센스 콘솔의 자동광고 미리보기는 페이지마다 인페이지 자리 12~17개를 계획했다. 그런데 실제 방문의 자동 인페이지 노출은 PV 당 0.6~0.8 이었고, 9/10 사건 때 가장 많이 잃은 곳은 회사 페이지였다. 실방문에서 구글이 자리를 몇 개 끼워 넣는지(placed), 그중 몇 개를 요청하는지(req), 몇 개가 채워지는지(filled)를 재서 10/9 에스컬레이션 방향을 정한다.

**배포 조건**: 운영자 승인 뒤에만 배포한다. 광고 요청·렌더·위치·광고량은 바꾸지 않는다. 계측은 광고 이벤트 계측 예외(승인②)를 넓히는 것이라 승인이 필요하다. 루트 layout 에 무렌더 컴포넌트 1개를 더할 뿐 DOM 노드를 만들지 않는다. 그래서 자동광고 동결(10/9까지) 규칙과 `verify:autoads` 0% 소실 게이트에 걸리지 않는다. 배포 전 게이트로 `npm run verify:autoads` 가 0% 소실인지 확인한다.

**코드**: `src/lib/autoAdsSeen.ts`(스냅숏·설치) · `src/components/AutoAdsSeenTracker.tsx`(루트 layout, NavTypeTracker 다음 무렌더) · `src/lib/analyticsPrivacy.ts`(`PAGE_SCOPED_MEASUREMENT_EVENTS` 에 추가해 공개 금액 페이지 실경로 유지) · 테스트 `src/lib/__tests__/autoAdsSeen.test.ts`.

### 이벤트 규격

- **언제**: 착지 뷰(`nav_type=landing`)에서만 설치한다. 문서당 1회다. `visibilitychange`→hidden 이나 `pagehide` 중 먼저 온 것에서 **정확히 1번** 보낸다. 탭 전환·앱 전환·이탈·새로고침이 모두 여기에 해당한다. 전송은 `transport_type: beacon` 이다.
- **어떻게 재나**: 5초마다 90초 동안(18회) DOM 을 읽고 보내기 직전에 1번 더 읽는다. 항목마다 그동안의 **최댓값**을 보낸다. DOM 에 쓰지 않고 DOM 관찰자(MutationObserver)도 쓰지 않는다. 모든 경로가 try/catch 로 감싸져 있다.
- **소프트 이동**: 사이트 안 링크 이동 등으로 뷰가 `soft` 가 되면 그 시점 값에서 멈추고, `soft_nav_before_send=1` · `nav_type=soft` 로 보낸다. 다음 뷰의 DOM 은 섞이지 않는다. 그 대신 soft 행은 **잘린 관측**이다. 이동한 뒤에 붙은 자리·요청·채움은 세지 않아 값이 작게 나온다. 그래서 soft 행은 soft 비중과 커버리지 분자에만 쓴다(판독 절차 ①).

| 인자 | 형식 | 뜻 |
|---|---|---|
| `aa_placed` | 숫자 | `.google-auto-placed`(자동 인페이지 자리 컨테이너) 수 |
| `aa_ins` | 숫자 | 그 안의 `ins.adsbygoogle` 수 |
| `aa_req` | 숫자 | 그중 `data-adsbygoogle-status="done"`(요청까지 간 것) |
| `aa_filled` | 숫자 | 그중 `data-ad-status="filled"` |
| `aa_unfilled` | 숫자 | 그중 `data-ad-status="unfilled"` |
| `aa_first_top` · `aa_last_top` | 숫자(100 단위) | 자리의 문서 기준 위치(`rect.top + scrollY`) 최소·최대. 자리 수가 가장 많았던 최근 스냅숏의 값이다. 0×0(숨김) 자리는 빼며, 잴 자리가 없으면 **싣지 않는다** |
| `manual_ins` | 숫자 | `.google-auto-placed` 밖의 `ins.adsbygoogle[data-ad-slot]` = 사이트가 직접 넣은 광고 칸 |
| `doc_h` | 숫자(100 단위) | `documentElement.scrollHeight` |
| `scroll_max` | 숫자(100 단위) | `max(scrollY + innerHeight)`. 1초 스로틀 passive 스크롤 리스너로 잰다 |
| `ama_cfg` | 0/1 | localStorage 에 `google_ama_config`(자동광고 설정 캐시)가 있으면 1. 읽기만 하며, 읽을 수 없으면 0 |
| `page_group` | 문자 | **착지** 경로의 첫 마디(`salary-db`·`salary`·`monthly`·`calc`·`guides` …). 루트는 `home`, 한글·인코딩 경로는 `other` |
| `viewport` | 문자 | `m`(<768) · `t`(<1024) · `d` |
| `nav_type` | 문자 | 보낼 때의 값. `soft` 이면 `soft_nav_before_send=1` 과 같은 뜻이다 |
| `soft_nav_before_send` | 0/1 | 보내기 전에 소프트 이동이 있었는지 |
| `measurement_version` | 문자 | `aa1` |
| `position` | 문자 | `'<aa_ins>-<aa_req>-<aa_filled>'` (예 `14-3-2`). 이미 등록된 맞춤 측정기준 `position` 을 재사용한다 |

- 앵커·전면(vignette) 광고는 `.google-auto-placed` 밖에 붙으므로 `aa_*` 에 들어가지 않는다.
- 개인정보: 경로는 첫 마디만 싣고, 입력값·금액·쿼리는 싣지 않는다. `page_location` 은 다른 광고 이벤트처럼 공개 금액 페이지(`/monthly/N`·`/salary/N`)의 실경로를 유지한다.
- `soft_nav_before_send=1` 행의 `page_location`(페이지 경로)은 **마지막 뷰**의 주소다. 전역 `trackEvent` 는 10/10 판정 전 무변경 규칙이라 바꾸지 않았다. 그래서 `autoads_seen` 을 템플릿으로 나눌 때는 페이지 경로가 아니라 착지 기준인 `page_group` 을 쓴다. 자리·요청·채움(`aa_placed`·`aa_req`·`aa_filled` 와 판독 ② 의 모든 줄)은 **`nav_type=landing` 필터를 건 집계만 인정한다.** `page_group` 으로만 묶고 soft 행을 섞은 합계는 쓰지 않는다.

### GA4 등록 (배포 당일, 모두 **이벤트 범위** — 소급되지 않는다)

관리 → 데이터 표시 → **맞춤 정의**. 표준 속성의 이벤트 범위 한도는 맞춤 측정기준 50개, 맞춤 측정항목 50개라 목록 수를 먼저 확인한다.

| 종류 | 이름 = 이벤트 매개변수 | 단위 | 비고 |
|---|---|---|---|
| 맞춤 측정기준 | `page_group` | — | **새로 등록(필수)** |
| 맞춤 측정항목 | `aa_placed` | 표준 | **필수** |
| 맞춤 측정항목 | `aa_req` | 표준 | **필수** |
| 맞춤 측정항목 | `aa_filled` | 표준 | **필수** |
| 맞춤 측정항목 | `aa_ins` | 표준 | 권장 |
| 맞춤 측정항목 | `aa_unfilled` | 표준 | 권장(응답 대기 판별) |
| 맞춤 측정항목 | `manual_ins` | 표준 | 권장 |
| 맞춤 측정항목 | `scroll_max` | 표준 | 권장(지연 로드 판별) |
| 맞춤 측정항목 | `doc_h` | 표준 | 권장(지연 로드 판별) |
| 맞춤 측정항목 | `aa_last_top` | 표준 | 권장(지연 로드 판별) |
| 맞춤 측정항목 | `ama_cfg` | 표준 | 권장 |

- **새로 등록하지 않는 것**: `position`·`measurement_version`(이미 등록됨), `nav_type`(9/26~27 등록 항목), `viewport`(S1-6 때 등록 안내. 목록에 없으면 이때 함께 등록), `soft_nav_before_send`(`nav_type` 과 같은 정보), `aa_first_top`(판독표에 쓰지 않음).
- 필수 4개(측정기준 1 + 측정항목 3)만 등록해도 판독표의 핵심 줄(뷰당 자리·요청·채움)은 나온다. 권장 7개가 없으면 지연 로드·응답 대기 판별 줄을 채우지 못한다.
- 등록하지 않아도 `position` 측정기준으로 분포(`0-0-0`, `14-3-2` …)는 바로 볼 수 있다.

### 배포 당일 할 일

1. ☐ 위 표대로 등록한다(배포와 같은 날. 늦은 만큼 판독 창이 짧아진다).
2. ☐ **실제 전송 확인(5분, 광고는 클릭하지 않는다)**: 운영 사이트(엣지 캐시 Purge 뒤) 회사 페이지를 새로 연다. 개발자 도구 → 네트워크 → 필터 `collect`. 20초쯤 기다린 뒤 다른 탭으로 전환한다. `en=autoads_seen` 요청(유형 `ping`/beacon)이 1번 나가고, 페이로드에 `epn.aa_placed`·`epn.aa_req`·`epn.aa_filled`(숫자는 `epn.`), `ep.position`·`ep.page_group=salary-db`·`ep.measurement_version=aa1`(문자는 `ep.`)이 있어야 한다. 탭으로 돌아왔다가 다시 전환해도 두 번째 요청은 없어야 한다.
3. ☐ 같은 페이지 콘솔에서 `document.querySelectorAll('.google-auto-placed').length` 가 `epn.aa_placed` 와 대략 같은지 본다(보낸 뒤에 자리가 더 붙었으면 콘솔 쪽이 클 수 있다).
4. ☐ 배포 시각·Purge 시각·등록 시각을 아래 기록표에 적는다.

### 판독 절차 — 10/2(1차 점검)·10/9(판정)

- **기간**: 10/2 조회는 배포 다음 날 ~ 10/1, 10/9 조회는 배포 다음 날 ~ 10/8 이다(완료일만). 10/2 에 창이 3일 미만이면 수집 점검(아래 ①)만 하고 판독은 10/9 로 미룬다.
- **탐색(자유 형식) — 탭 3개**
  - **탭 A(판독용)**: 측정기준 `page_group`·`nav_type`(선택 `viewport`). 측정항목 `이벤트 수`와 위에서 등록한 측정항목. 필터는 `이벤트 이름 = autoads_seen` · `measurement_version = aa1` · `nav_type = landing`. **자리·요청·채움(아래 ②·③)은 이 필터로 낸 값만 쓴다.** 이 밖의 집계 방법은 인정하지 않는다.
  - **탭 B(커버리지 분자·soft 비중)**: 측정기준 `page_group`·`nav_type`. 측정항목 `이벤트 수`. 필터는 `이벤트 이름 = autoads_seen` · `measurement_version = aa1` 만 건다. `nav_type` 필터는 걸지 않아 landing 행과 soft 행이 모두 나온다.
  - **탭 C(커버리지 분모)**: 측정기준 `페이지 경로 및 화면 클래스`. 측정항목 `이벤트 수`. 필터는 `이벤트 이름 = page_view` · `nav_type = landing` 에, 템플릿마다 아래 표의 경로 정규식을 더한다. `page_view` 에는 `page_group` 이 없어서 경로로 템플릿을 가른다.

| `page_group` | 분모 `page_view` 경로 정규식 | 비고 |
|---|---|---|
| `salary-db` | `^/salary-db(/.*)?$` | 목록 `/salary-db` 와 회사 페이지 `/salary-db/…` 를 모두 포함한다. 소프트 내비게이션 절의 `^/salary-db/`(회사 페이지만)와 범위가 다르다 |
| `salary` | `^/salary(/.*)?$` | `^/salary` 처럼 끝을 열어 두면 `/salary-db`·`/salary-raise-2026` 까지 섞인다 |
| `monthly` | `^/monthly(/.*)?$` | |
| `home` | `^/$` | |
| `guides` | `^/guides(/.*)?$` | |
| `calc` | `^/calc(/.*)?$` | |

- **순서**: 회사 DB(`salary-db`)를 먼저 보고, 이어서 `salary`·`monthly`·`home`·`guides`·`calc` 순으로 본다.

① **수집 점검(10/2)**
   - 커버리지 = 탭 B 에서 그 `page_group` 의 `aa1` 이벤트 **전체**(landing 행 + soft 행) ÷ 탭 C 에서 같은 템플릿 경로 정규식의 `page_view`(landing). `autoads_seen` 은 착지 뷰에서만 설치되므로 soft 행도 착지 뷰 1개에서 나온 전송이다. 분자에서 soft 행을 빼면 soft 비중만큼 커버리지가 낮게 나온다. 이탈 순간 유실(iOS 등)이 있어 1보다 작다. **0.5 미만이면 판독 신뢰도가 낮다**고 적고 원인(캐시된 HTML·설치 실패)부터 본다.
   - soft 비중 = 탭 B 의 `nav_type=soft` 이벤트(= `soft_nav_before_send=1`) ÷ `aa1` 이벤트 전체. soft 행은 소프트 이동 순간에 멈춘 **잘린 관측**이다. 이 비중과 커버리지 분자에만 쓰고 ②·③ 의 자리·요청·채움 계산에는 넣지 않는다.

② **계산(템플릿마다, 탭 A 만 사용, N = landing 이벤트 수)**

| 줄 | 식 |
|---|---|
| 뷰당 자리 **P** | Σ`aa_placed` ÷ N |
| 뷰당 요청 **R** | Σ`aa_req` ÷ N |
| 뷰당 채움 **F** | Σ`aa_filled` ÷ N |
| 뷰당 응답 **U** | (Σ`aa_filled` + Σ`aa_unfilled`) ÷ N. 응답(`data-ad-status`)이 돌아온 칸. `aa_unfilled` 가 등록돼 있어야 한다 |
| 요청 비율 | R ÷ P |
| 응답 비율 | U ÷ R |
| 채움 비율 | F ÷ R |
| 설정 캐시 비율 | Σ`ama_cfg` ÷ N |
| 평균 도달 깊이 vs 문서 높이 | Σ`scroll_max` ÷ N 과 Σ`doc_h` ÷ N |
| 평균 마지막 자리 위치(근사) | 필터에 `position` 정규식 `^[1-9]`(자동 ins 1개 이상)를 더한 행에서 Σ`aa_last_top` ÷ 이벤트 수. 탐색의 측정항목 필터는 이벤트 단위가 아니라 행 합계에 걸리므로 이벤트 단위 측정기준인 `position` 으로 거른다 |
| 뷰당 수동 칸 | Σ`manual_ins` ÷ N |

   - **대조**: F 를 애드센스 '자동 인페이지 노출 ÷ PV'(9/26 진단 0.6~0.8)와 같은 기간으로 나란히 적는다. 크게 어긋나면(2배 이상) 수치 해석 전에 필터·기간부터 다시 본다.
   - **분포**: 행 `position`, 열 `page_group`, 값 `이벤트 수`. 평균이 두 무리(예 `0-0-0` 과 `14-3-2`)의 섞임인지 확인한다.
   - **보류**: 한 템플릿의 N 이 300 미만이면 그 템플릿은 판정하지 않는다.

③ **해석과 10/9 조치**

| 관측 | 해석 | 10/9 조치 |
|---|---|---|
| **P ≈ 3 안팎**(미리보기 12~17 보다 크게 적음), 설정 캐시 비율 높음 | 구글 쪽 배치 한도. 설정·학습 때문에 실방문에 자리를 적게 끼운다 | **애드센스 지원 문의**. 템플릿별 P·R·F, 미리보기 12~17 화면, 9/10 사건과 9/24 복구 경위를 첨부한다. 사이트 코드는 바꾸지 않는다 |
| **P 12~17 수준인데 R 이 작음**(R ÷ P < 0.3) | 지연 로드·스크롤 문제. 자리는 있는데 요청이 나가지 않는다 | 아래 두 갈래로 나눈다 |
| └ 평균 도달 깊이 < 평균 마지막 자리 위치 | 방문자가 아래쪽 자리까지 내려가지 않는다. 정상적인 지연 로드다 | 광고 설정 변경 대상이 아니다. 상단 콘텐츠·체류 과제로 기록한다 |
| └ 평균 도달 깊이 ≥ 평균 마지막 자리 위치, 또는 도달 깊이 ≈ 화면 높이인데 문서 높이가 큼 | 창 스크롤이 일어나지 않거나(내부 스크롤 영역 등) 지연 로드가 걸리지 않는다 | 코드 조사 과제로 올린다. 광고 코드 변경은 운영자 승인 뒤에만 한다 |
| **R ≈ P 인데 U 가 R 보다 훨씬 작음**(응답 비율 U ÷ R < 0.5 정도) | 응답 대기. 요청 표시(`done`)까지는 갔지만 응답(`filled`·`unfilled`)이 오기 전에 방문이 끝났다. 요청이 지연 로드로 화면 근처까지 미뤄지는 경우이므로 역시 지연 로드·스크롤 문제다 | 위 두 갈래(도달 깊이 vs 마지막 자리 위치)로 똑같이 나눈다. `aa_unfilled` 가 등록되지 않았으면 이 줄은 판정하지 않는다 |
| R 은 충분하고 응답도 대부분 왔는데(U ≈ R) 채움 비율 < 0.5 | 수요(채움) 문제 | 코드·설정 문제가 아니므로 기록만 한다 |
| P ≈ 0 이고 설정 캐시 비율 < 0.8 | 자동광고 설정을 받지 못한다(스크립트 로드 실패·차단) | 스크립트 로드 경로를 조사한다 |
| P ≈ 0 인데 설정 캐시 비율 높음 | 페이지 제외 설정이나 학습 경로 불일치(9/10 유형) | `verify:autoads` 기준선·콘솔 제외 목록을 확인한다 |
| P 4~11 | 9/24 복구 뒤 재학습 중일 수 있다 | 10/2 대비 추세를 적고 한 주 더 본다 |

### 기록표

| 조회일 | 창 | 배포·Purge·등록 시각 | 템플릿 | N | 커버리지 | soft 비중 | P | R | F | R÷P | U÷R | F÷R | ama | 도달/마지막 자리/문서 높이 | 애드센스 자동 인페이지/PV | 판정 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 10/2 | 배포 익일~10/1 | | salary-db | | | | | | | | | | | | | |
| 10/9 | 배포 익일~10/8 | | salary-db | | | | | | | | | | | | | |

### 한계

- 보낸 뒤(첫 hidden 이후)에 붙은 자리는 세지 않는다. 탭을 잠깐 바꿨다 돌아와 오래 읽은 방문은 적게 잡힌다.
- 광고 차단기를 쓰는 방문은 gtag 도 막혀 이벤트가 없다. 애드센스 PV 도 없으므로 비교는 유효하다.
- 조회 1회는 자리마다 `getBoundingClientRect` 를 읽는 것이다. 5초 간격, 90초까지, 보낼 때 1회라 성능 영향은 무시할 만하다.
