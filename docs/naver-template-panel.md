# 네이버 템플릿 패널 (R6-05) — GA4 'NAVER-PANEL' 운영 절차와 사전 등록 판독

네이버 서치어드바이저 TOP30 은 네이버 클릭의 약 18.5% 만 보여 주고, 네이버는 섹션별 색인 수도 주지 않습니다.
그래서 **GA4 방문 페이지 × 네이버 검색 세션**을 템플릿별로 묶어 매주 같은 자로 잽니다(R6 계획 `docs/traffic-masterplan-2026-10.md` §7).

- 코드: `src/lib/naverTemplatePanel.ts`(순수 집계) · `scripts/naver-template-panel.ts`(CLI) · 테스트 `src/lib/__tests__/naverTemplatePanel.test.ts`
- 사이트에는 아무 영향이 없습니다. 어떤 페이지·컴포넌트도 이 모듈을 import 하지 않습니다(테스트가 grep 으로 고정). 빌드·광고·계측 무변경.
- **`DEST_TEMPLATES`(src/lib/analytics.ts)는 절대 고치지 않습니다.** 패널은 `destTemplate()` 을 읽기만 하고 그 결과를 세분화할 뿐입니다. 17값을 바꾸면 GA4 `dest_tpl` 과거 행과 이어지지 않습니다. 세분값은 모두 `PARENT` 표로 정확히 하나의 `DEST_TEMPLATES` 값에 돌아갑니다(테스트가 200경로 이상으로 고정).
- 원본 CSV 는 **저장소 밖** `C:/Users/ruby1/moneysalary-exports/ga4/` 에 둡니다(비밀 폴더 아님). CLI 는 저장소 안 경로를 거부합니다(exit 2).
- 결과는 화면(stdout)에만 나옵니다. 파일을 쓰지 않습니다. 기록에는 집계값만 남깁니다.

---

## 1. 템플릿 — destTemplate 세분화

`destTemplate()` 결과가 company·calc·other 일 때만 더 쪼갭니다. 나머지 14값은 그대로입니다. 오른쪽 수는 9/27 운영 사이트맵(1,950 URL) 기준입니다.

| 템플릿 | 상위 dest_tpl | 경로 규칙 | 9/27 사이트맵 URL |
|---|---|---|---:|
| company | company | `/salary-db/<회사>` (lite 제외) | 430 |
| **lite** | company | `/salary-db/listed/<6자리 종목코드>` | 219 |
| salary-db-hub · ranking · compare | 같은 값 | destTemplate 그대로 | 2 · 32 · 0 |
| job · job-hub | 같은 값 | `/job/*` · `/job` | 62 · 1 |
| bonus-calc · samsung-bonus | 같은 값 | `/calc/*-bonus`·`/calc/bonus-calculators` · `/calc/samsung-bonus` | 26 · 1 |
| calc | calc | 그 밖의 `/calc/*` | 216 |
| **yearend-calc** | calc | `/calc/child-deduction` · `/calc/dependent-check` · `/calc/dual-income-year-end` | 3 |
| salary-amount · monthly · table | 같은 값 | `/salary/<금액>` · `/monthly*` · `/table/*` | 211 · 105 · 8 |
| pay-table | pay-table | `/(teacher\|police\|firefighter\|civil-servant)-pay-*` | 5 |
| guide · industry · home | 같은 값 | `/guides*` · `/industry*` · `/` | 302 · 28 · 1 |
| **yearend** | other | `/year-end-tax*` · `/credit-card-deduction-YYYY` · `/(medical\|rent\|donation)-tax-credit-YYYY` | 11 |
| **rollover** | other | `/social-insurance-rates-*` · `/minimum-wage-*` · `/unemployment-benefit` · `/weekly-holiday-allowance-YYYY` | 6 |
| **pay-military** | other | `/military-pay-*` | 1 |
| **home-loan** | other | `/home-loan*` | 1 |
| **insights** | other | `/insights*` | 4 |
| **fun** | other | `/fun*` | 21 |
| **en** | other | `/en*` | 37 |
| other | other | 나머지(주요 구성 `/qna` 60 · `/glossary` 59 · `/tools` 31 · `/region` 20 · `/hub` 9 · 단일 페이지 38) | 217 |

- `/calc/january-bonus`(13월의 월급 시뮬레이터)는 destTemplate 이 bonus-calc 라서 **템플릿은 bonus-calc** 로 둡니다(PARENT 일관성). 대신 주제 클러스터에서는 yearend 로 셉니다.
- 경로는 쿼리·해시를 떼고, 퍼센트 인코딩을 풀고, 끝 슬래시를 무시합니다. 다른 도메인·`(not set)` 은 other 입니다.
- 새 세분값은 `LANDING_TEMPLATES` 끝에만 추가합니다. 분류 규칙을 바꾸면 한 줄 기록의 `v1` 을 `v2` 로 올려 전후를 섞어 읽지 않게 합니다.

## 2. 주제 클러스터 — 템플릿과 별개 축

판독 (b)·(c)·(d)의 '계열'은 이 클러스터로 봅니다. 템플릿 표에는 섞지 않고 **따로 한 표**로 냅니다.

| 클러스터 | 경로 규칙(위에서부터 먼저 맞는 것) |
|---|---|
| company | `/salary-db*` · `/company*` · `/industry*` · `/public-institutions*` |
| yearend | yearend 템플릿 경로 + `/calc/(child-deduction\|dependent-check\|dual-income-year-end\|january-bonus)` |
| bonus | `/calc/*-bonus`·`bonus-calculators`·`year-end-bonus-tax`·`incentive-tax` + 첫 경로에 `bonus` 가 든 페이지 + `/samsung-negotiation-YYYY` |
| paytables | `/(teacher\|police\|firefighter\|civil-servant\|military)-pay-*` |
| rollover | rollover 템플릿 경로 |
| job | `/job*` |
| home-loan | `/home-loan*` |
| other | 나머지 · `/en*` 전체 |

- `/guides/<slug>` 는 slug 키워드로 근사합니다: `year-end-tax`·`hometax-year-end`·`deduction`·`tax-credit`·`tax-refund` → yearend, `bonus`·`incentive`·`performance-pay` → bonus, `(교원·경찰·소방·공무원·군)-pay` → paytables, `minimum-wage`·`unemployment`·`insurance-rates`·`weekly-holiday` → rollover.

## 3. 무엇을 재나

| 열 | 뜻 |
|---|---|
| 세션 · 참여 세션 · 조회수 | NAVER-PANEL 필터(네이버 검색 소스)를 통과한 세션. 조회수는 그 세션들의 페이지 조회 |
| URL 수 | 네이버 세션이 1 이상인 고유 방문 페이지(`(not set)`·`(other)` 제외) |
| 세션/페이지 | 세션 ÷ URL 수 |
| 커버리지 | 그 템플릿의 **사이트맵 URL** 중 네이버 세션 1 이상인 URL ÷ 그 템플릿의 사이트맵 URL. 사이트맵에 없는 랜딩(옛 주소 등)은 분자에서 뺍니다(그래서 100% 를 넘지 않습니다). 사이트맵 밖 랜딩 수는 따로 보여 줍니다 |
| 롱테일 | 28일 네이버 세션 상위 30개 URL 을 뺀 나머지 URL 의 세션 합(판독 (e)) |

- 네이버 검색 = 세션 소스 `naver`(organic) + `m.search.naver.com` + `search.naver.com`(리퍼럴). 한 채널로 봅니다([100x 계획](revenue-100x-plan-2026-09.md) §10 규칙 2). 블로그·카페·포털 메인(`m.naver.com`)은 뺍니다.
- GA4 는 작은 행을 임계값 처리합니다. **페이지 판독은 28일 창, 7일 창은 템플릿·클러스터 합계만** 봅니다.
- 사이트맵은 실행할 때마다 운영 사이트에서 새로 읽으므로 분모가 바뀔 수 있습니다. 그래서 한 줄 기록에 사이트맵 URL 수를 같이 남깁니다.

---

## 4. 운영자 A — GA4 탐색 'NAVER-PANEL' 만들기 (10/3, 한 번, 약 8분)

1. GA4 → 왼쪽 **탐색** → **빈 보고서(자유 형식)**. 왼쪽 위 이름을 `NAVER-PANEL` 로 바꿉니다.
2. **측정기준** 옆 `+` → 검색해서 체크 후 **가져오기**: `방문 페이지 + 쿼리 문자열`, `세션 소스`, `페이지 리퍼러`, `이벤트 이름`.
3. **측정항목** 옆 `+` → `세션수`, `참여 세션수`, `조회수` → **가져오기**.
4. **탭 1 이름 `PANEL`**
   - 행: `방문 페이지 + 쿼리 문자열` 하나만(세션 소스는 행에 넣지 않습니다 — 행 수가 늘어납니다).
   - 값: `세션수`, `참여 세션수`, `조회수`.
   - 행 표시: **500**(기본값 10 이면 표가 잘립니다).
   - 필터: `세션 소스` → **정규식과 일치** → 아래를 그대로 붙여 넣기 → 적용.
     ```
     ^(naver|m\.search\.naver\.com|search\.naver\.com)$
     ```
5. **탭 2 이름 `REFERRER`**(탭 옆 `+`) — 슬레이트 검색어 판독용, R4 리퍼러 도구(`scripts/naver-referrer-queries.ts`)와 같은 모양입니다.
   - 행: `페이지 리퍼러`, `방문 페이지 + 쿼리 문자열`. 값: `세션수`, `조회수`. 행 표시 500.
   - 필터: `이벤트 이름` → **정확히 일치** → `page_view`.
6. 10/3 에는 탭 2 를 28일(9/5~10/2)로 한 번 내보내 둡니다(아래 B 의 방법, 파일 이름 `referrer-28d-20261003.csv`).

## 5. 운영자 B — 매주 월요일 내보내기 (약 3분)

- 폴더: `C:/Users/ruby1/moneysalary-exports/ga4/` (없으면 새로 만듭니다. 저장소 폴더 안에 두면 도구가 거부합니다).
- 기간은 **월요일 전날(일요일)까지의 완료일**입니다.
  - 28일 = 4주 전 월요일 ~ 어제. 예) 10/5 → 9/7~10/4
  - 7일 = 1주 전 월요일 ~ 어제. 예) 10/5 → 9/28~10/4
- 순서
  1. 탭 `PANEL` 을 열고 기간을 28일로 → 오른쪽 위 **내보내기(다운로드 아이콘) → CSV**(화면 판에 따라 '공유 → 파일 다운로드 → CSV') → `panel-28d-YYYYMMDD.csv` 로 저장(YYYYMMDD = 그 월요일).
  2. 기간만 7일로 바꿔 같은 방법으로 → `panel-7d-YYYYMMDD.csv`.
  3. 표 아래 행 수가 500 을 넘으면 **시작 행**을 501 로 바꿔 한 번 더 받아 `panel-28d-YYYYMMDD-p2.csv`. 도구는 행 수가 GA4 '행 표시' 값(10·25·50·100·250·500)과 같으면 '잘렸을 수 있다'고 알려 줍니다.
  4. 슬레이트 판독이 있는 날(10/5, 10/30, 11/11, 12/7, 12/14, 2/1)에는 탭 `REFERRER` 도 28일로 → `referrer-28d-YYYYMMDD.csv`.
- 한 번만 받는 파일(판독 (b) 기준·비교)
  - 10/5: 탭 `PANEL` 기간 **9/1~9/30** → `panel-sep-20260930.csv`
  - 2/1: 탭 `PANEL` 기간 **1/1~1/31** → `panel-jan-20270131.csv`
- 기록 목표: 10/5~2/28 주간 기록 90% 이상(R6-05 KPI).

## 6. Claude — 월요일 실행과 기록

```
npx tsx scripts/naver-template-panel.ts C:/Users/ruby1/moneysalary-exports/ga4/panel-28d-20261005.csv --7d C:/Users/ruby1/moneysalary-exports/ga4/panel-7d-20261005.csv --sitemap https://www.moneysalary.com/sitemap.xml
npx tsx scripts/naver-template-panel.ts C:/Users/ruby1/moneysalary-exports/ga4/panel-28d-20261005.csv --7d C:/Users/ruby1/moneysalary-exports/ga4/panel-7d-20261005.csv --sitemap https://www.moneysalary.com/sitemap.xml --log-line
npx tsx scripts/naver-template-panel.ts C:/Users/ruby1/moneysalary-exports/ga4/panel-28d-20261005.csv --slate /job/professor,/job/doctor,/home-loan --referrer C:/Users/ruby1/moneysalary-exports/ga4/referrer-28d-20261005.csv
```

- 첫 줄: 템플릿 표 + 클러스터 표(검토용, 저장하지 않음). `-p2` 파일이 있으면 28일 파일 뒤에 이어서 넣습니다(같은 내용 파일을 두 번 넣으면 거부).
- 둘째 줄(`--log-line`): URL·경로·검색어가 없는 한 줄. [metrics-log.md](metrics-log.md) 에 날짜·창(예: `28일 9/7~10/4 · 7일 9/28~10/4`)을 적은 행을 추가하고 비고 칸에 이 줄을 붙입니다(문서 커밋). 형식은 `NAVER-PANEL v1 28d 세션 N 롱테일 N 사이트맵 N 커버 x% ; 열=세션·페이지당·커버·7d ; <템플릿> N·x·x%·N ; … ; 계열 28d … ; 계열 7d … ; 7d 세션 N` 입니다.
- 셋째 줄(`--slate`, 판독일만): 슬레이트 경로의 28일 네이버 세션과, `--referrer` 를 주면 그 경로의 검색어 × 방문 페이지(경로마다 상위 10개)만 나옵니다. 리퍼러 원문은 나오지 않습니다. 경로·검색어가 들어가므로 metrics-log 가 아니라 [gsc-sniping-log.md](gsc-sniping-log.md) Round 4 행에 적습니다.
- 사이트맵 주소가 막히면(403 등) 브라우저로 `sitemap.xml` 을 저장해 `--sitemap <파일>` 로 줍니다(저장소 밖).

## 7. 슬레이트 선정 (10/5)

- 후보는 R6-06 목록에서만 고릅니다: `/job/professor`, `/job/doctor`, `/home-loan`, B20 패자 1쪽. 새 후보를 여기서 추가하지 않습니다.
- 10/5 에 위 셋째 명령(후보 전부, 최대 20쪽)으로 경로별 28일 네이버 세션·검색어 확인 세션·상위 검색어를 gsc-sniping-log Round 4 에 기준선으로 적습니다.
- 교정 여부와 날짜는 R6-06 규칙 그대로입니다(예: 교수는 10/30 판독 CTR < 6.0% 일 때만 11/2 교정, 의사는 순위 검색어와 제목 선두가 다를 때만, /home-loan 은 W1-F 가 10/7 에 폐기됐을 때만 11/9). 이 패널은 판독 자료만 줍니다.

---

## 8. 사전 등록 판독 (a)~(f)

아래 규칙은 결과를 보기 전에 정해 둔 것입니다. 판독 뒤에 기준을 바꾸지 않습니다. 계획서 §7-3 과 같은 내용이며, 여기에는 날짜·창·입력 파일을 붙였습니다.

| 규칙 | 판독일 | 창(완료일) | 입력 | 판정 | 결과에 따라 |
|---|---|---|---|---|---|
| **(a) CTR 교정 페이지** | 교정일 T0 + 35일: **10/30**(9/25 META-06·B20 변경분) · **11/11**(W1-F, 10/7 에 나갔을 때) · **12/7**(11/2 교정분) · **12/14**(11/9 /home-loan, W1-F 폐기 시) | 전 = T0−28 ~ T0−1, 후 = T0+7 ~ T0+34 (예: T0 11/2 → 전 10/5~11/1, 후 11/9~12/6) | TOP30 안: 서치어드바이저 TOP30 CTR. **TOP30 밖: 이 패널 `--slate` 28일 네이버 세션**(전 창은 그 월요일 파일, 없으면 1회 기간 지정 내보내기) | 교정 1건마다 후 ≥ 전 이면 '비음수' | 비음수 비율 60% 이상이 목표. 1/4 순효과 판독에서 음수 교정은 문자열 되돌리기 |
| **(b) 봉급표·성과급·연말정산·연도 전환 계열** | **2/1** (2/2 시즌 결산 R6-13 에 반영) | 9월 = 9/1~9/30, 1월 = 1/1~1/31 | `panel-sep-20260930.csv`·`panel-jan-20270131.csv` 의 클러스터 paytables·bonus·yearend·rollover | 주간 평균 = 세션 × 7 ÷ 일수(9월 30, 1월 31). 1월 ÷ 9월 비율을 계열별로 기록. 참고로 템플릿 행(pay-table+pay-military, bonus-calc+samsung-bonus, yearend+yearend-calc, rollover)도 같이 적음 | 결산 입력만. 이 규칙만으로 코드를 바꾸지 않음 |
| **(c) 되돌리기** | 매주 월요일 기록 때 확인, 공식 판독 **12/7** | 기준 = 10/5 의 28일 파일(9/7~10/4) 클러스터 세션 ÷ 4(주간 평균). 비교 = 그 월요일 7일 파일 | 클러스터 표 | 한 계열의 7일 세션 < 기준 주간 평균 × 0.8(20% 넘게 하락) **이고** 달력상 이유가 없음. 달력상 이유 = 공휴일·연휴가 낀 주, 시즌 일정(연말정산·봉급표 발표 전후), 성과급·타결 뉴스 사이클 종료(발표일 기준) — 판독 때 이유를 적음 | 그 계열의 **마지막 문자열 변경**을 되돌림(동결기에도 가능). 기준 이후 그 계열에 문자열 변경이 없었으면 기록만 |
| **(d) 연말정산** | **12/7** | 28일 11/9~12/6 | 서치어드바이저 TOP30 + `panel-28d-20261207.csv` 의 yearend 클러스터 | TOP30 에 연말정산 행이 0개 **이고** yearend 클러스터 28일 세션 < 1,000 | 공식 발표가 아닌 연말정산 문자열 작업을 멈춤(공식 발표 반영 E0~E12 는 계속) |
| **(e) 롱테일** | **12/7** | 11/2 파일(10/5~11/1) 대 12/7 파일(11/9~12/6) | 한 줄 기록의 `롱테일` 값 + 서치어드바이저 '서버 실패' 수(12/7) | 롱테일 증가율 = (12/7 − 11/2) ÷ 11/2 가 **+3% 미만이고** 서버 실패 > 200 | R6-02 5단계(콘솔 캐시 조정)를 올림 |
| **(f) 합병 회사 페이지** | **2/1** (2/10 결산 → 2/20 계열 결정, R6-13) | 전 = 10/5 의 28일 파일(9/7~10/4 — R6-08 배포일 10/4 하루 포함, 재수집 지연으로 영향 무시), 후 = 2/1 의 28일 파일(1/4~1/31) | `--slate <R6-08 대상 회사 경로>,<대조군 3곳>` | 대조군 = 10/5 파일에서 company 템플릿 중 대상 회사와 28일 세션이 가장 가까운 위·아래 3곳(합병·개명·별칭 변경이 없는 회사). **10/5 에 고정해 gsc-sniping-log 에 적고 바꾸지 않음**. 대상의 (후 ÷ 전)을 대조군 중앙값과 비교 | 2월 통합 결정(R6-13)의 입력 |

- 판독 결과는 날짜·창·판정만 metrics-log 에(집계값), 경로가 필요한 (a)·(f)는 gsc-sniping-log Round 4 에 적습니다.
- 파일이 빠진 주는 '기록 없음'으로 남기고 다음 주 값으로 대신하지 않습니다.

## 9. 문제 해결

| 증상 | 원인과 대처 |
|---|---|
| exit 2 '저장소 작업 트리 안' | CSV 를 `C:/Users/ruby1/moneysalary-exports/ga4/` 로 옮깁니다 |
| '헤더 인식 실패' | 탭 `PANEL` 이 아닌 표를 받았습니다. 열 `방문 페이지 + 쿼리 문자열`·`세션수` 가 있어야 합니다 |
| '리퍼러 내보내기입니다' | `REFERRER` 탭 파일을 패널 자리에 넣었습니다. 그 파일은 `--referrer` 로 넣습니다 |
| '잘렸을 수 있다' | 행 표시 500 인지 보고, 500 을 넘으면 시작 행 501 로 한 번 더 받아 함께 넣습니다 |
| '세션 소스 열 없음 — 가정' | 정상입니다(필터로 걸었음). 필터가 빠졌는지만 한 번 확인합니다 |
| `(other)` 경고 | GA4 가 행을 뭉쳤습니다. 기간을 줄이거나 7일·28일을 나눠 봅니다. URL 수·커버리지가 낮게 나옵니다 |
