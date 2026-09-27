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

`destTemplate()` 결과가 company·calc·other 일 때만 더 쪼갭니다. 나머지 14값은 그대로입니다. 오른쪽 수는 9/27 운영 사이트맵(1,952 URL — batch2 계산기 2쪽 반영) 기준이며, 테스트가 같은 스냅샷(`src/lib/__tests__/fixtures/naverPanelSitemap-2026-09-27.txt`)으로 이 분포를 고정합니다.

| 템플릿 | 상위 dest_tpl | 경로 규칙 | 9/27 사이트맵 URL |
|---|---|---|---:|
| company | company | `/salary-db/<회사>` (lite 제외) | 430 |
| **lite** | company | `/salary-db/listed/<6자리 종목코드>` | 219 |
| salary-db-hub · ranking · compare | 같은 값 | destTemplate 그대로 | 2 · 32 · 0 |
| job · job-hub | 같은 값 | `/job/*` · `/job` | 62 · 1 |
| bonus-calc · samsung-bonus | 같은 값 | `/calc/*-bonus`·`/calc/bonus-calculators` · `/calc/samsung-bonus` | 26 · 1 |
| calc | calc | 그 밖의 `/calc/*` | 218 |
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
- 새 세분값은 `LANDING_TEMPLATES` 끝에만 추가합니다. 분류 규칙을 바꾸면 한 줄 기록의 `v1` 을 `v2` 로 올려 전후를 섞어 읽지 않게 합니다(`PANEL_RULES_VERSION`).

## 2. 주제 클러스터 — 템플릿과 별개 축

판독 (b)·(c)·(d)의 '계열'은 이 클러스터로 봅니다. 템플릿 표에는 섞지 않고 **따로 한 표**로 냅니다.
규칙은 **9/27 확정판(v1)** 입니다. 10/5 첫 기록 전에 검토 지적(OPI·PS 가이드·성과급 도구·한글 Q&A 가 other 로 빠짐)을 반영했고, 그 뒤로는 v2 없이 바꾸지 않습니다.
경로는 퍼센트 인코딩을 풀고(NFC) 봅니다 — GA4 가 한글 slug 를 인코딩으로 줘도 같은 결과입니다.

**1단계 — 경로 규칙**(위에서부터 먼저 맞는 것)

| 클러스터 | 경로 규칙 |
|---|---|
| other | `/en*` 전체(영문판은 네이버 유입 계열이 아님) |
| company | `/salary-db*` · `/company*` · `/industry*` · `/public-institutions*` |
| yearend | yearend 템플릿 경로 + `/calc/(child-deduction\|dependent-check\|dual-income-year-end\|january-bonus)` |
| bonus | `/calc/*-bonus` · `/calc/bonus-*` · `/calc/year-end-bonus-tax` · `/calc/incentive-tax` · `/insights/bonus-*` · 첫 경로에 `bonus` 가 든 페이지 · `/samsung-negotiation-YYYY` |
| paytables | `/(teacher\|police\|firefighter\|civil-servant\|military)-pay-*` · `/calc/civil-servant-net-pay`(공식 봉급표를 그대로 쓰고 같은 12~1월 시즌을 탐) |
| rollover | rollover 템플릿 경로 · `/calc/unemployment-benefit` · `/calc/holiday-allowance-quick`(주휴수당) |
| job | `/job*` |
| home-loan | `/home-loan*` |

**2단계 — 키워드 규칙**: 1단계에 안 걸린 **모든 경로**(가이드·계산기·도구·Q&A·용어집·인사이트 등)에 겁니다. 위에서부터 먼저 맞는 것.

| 클러스터 | 키워드(경로 어디든) |
|---|---|
| yearend | `year-end` · `yearend` · `deduction` · `tax-credit` · `tax-refund` · 연말정산 · 세액공제 · 소득공제 · 부양가족-공제 |
| bonus | `bonus` · `incentive` · `performance-pay` · `profit-sharing` · `wage-negotiation` · 성과급 · 인센티브 · 상여 · 임금협상 · 단어 단위 `opi`·`tai`·`ps`(`-ps-` 는 걸리고 `maps` 는 안 걸림) |
| paytables | `(teacher\|police\|firefighter\|civil-servant\|military)-(net-)pay` · 봉급 · 공무원-보수 |
| rollover | `minimum-wage` · `unemployment` · `insurance-rates` · `weekly-holiday` · `holiday-allowance` · 실업급여 · 최저임금 · 주휴 |
| other | 나머지 |

- 일부러 넣지 않은 것: 근로장려금(`earned-income-credit`)은 연말정산이 아닙니다. 개인 연봉협상(`salary-negotiation`)은 성과급이 아닙니다. '공제' 단독(청년내일채움공제 등)은 세금이 아닙니다. `/job/*` 은 공무원·군인 직업이라도 job 입니다.
- 한 경로에 두 계열 키워드가 있으면 표 위쪽(연말정산 → 성과급 → 봉급표 → 연도 전환)이 이깁니다. 단 `/calc/year-end-bonus`·`/calc/year-end-bonus-tax` 는 1단계에서 bonus 로 정해집니다.

**9/27 운영 사이트맵(1,952 URL) 클러스터 분포** — 테스트가 고정합니다.

| 클러스터 | URL | 구성 |
|---|---:|---|
| company | 713 | 회사 430 · lite 219 · 랭킹 32 · 산업 28 · 허브 2 · `/public-institutions`·`/company/simulator` 2 |
| bonus | 76 | 가이드 40 · 계산기 31 · 최상위 2(`/samsung-negotiation-2026`·`/chuseok-bonus-2026`) · 도구·Q&A·인사이트 각 1 |
| paytables | 7 | 봉급표 6 · 공무원 실수령액 계산기 1 |
| yearend | 43 | 가이드 18 · 최상위 11 · Q&A 7 · 계산기 5 · 용어집 2 |
| rollover | 23 | Q&A 8 · 최상위 6 · 가이드 4 · 용어집 3 · 계산기 2 |
| job | 63 | `/job` 1 · 직업 62 |
| home-loan | 1 | `/home-loan` |
| other | 1,026 | 나머지 |

(검토 전 초안은 bonus 63 · yearend 32 · rollover 10 · paytables 6 · other 1,064 였습니다. 옮겨진 38쪽은 모두 other 에서 왔고, 다른 계열끼리 오간 쪽은 없습니다.)

## 3. 무엇을 재나

| 열 | 뜻 |
|---|---|
| 세션 · 참여 세션 · 조회수 | NAVER-PANEL 필터(네이버 검색 소스)를 통과한 세션. 조회수는 그 세션들의 페이지 조회 |
| URL 수 | 네이버 세션이 1 이상인 고유 방문 페이지(`(not set)`·`(other)` 제외) |
| 세션/페이지 | 세션 ÷ URL 수 |
| 커버리지 | 그 템플릿의 **사이트맵 URL** 중 네이버 세션 1 이상인 URL ÷ 그 템플릿의 사이트맵 URL. 사이트맵에 없는 랜딩(옛 주소 등)은 분자에서 뺍니다(그래서 100% 를 넘지 않습니다). 사이트맵 밖 랜딩 수는 따로 보여 줍니다 |
| 롱테일 | 28일 네이버 세션 상위 30개 URL 을 뺀 나머지 URL 의 세션 합(판독 (e)) |
| 완전성 | 파일마다 GA4 **총계 행**을 남겨 창(여러 파일)의 행 합과 대조합니다. **조회수**는 정확한 이벤트 수라 ±1 까지만 봐줍니다. **세션수**는 GA4 가 HyperLogLog++ 로 근사(95% 구간 약 ±3.3%)해 행 합과 총계가 원래 조금 다르므로, 조회수 열이 없을 때만 총계의 3.3% 폭으로 대조합니다. 결과는 완전 · ⚠ 불완전(누락·초과·잘림 의심) · 총계없음 중 하나입니다 |

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
   - 필터 **3개**(모두 걸어야 합니다 — 하나라도 빠지면 사이트 안 이동·직접 방문 행이 500행을 채워 네이버 검색 행이 잘립니다):
     1. `이벤트 이름` → **정확히 일치** → `page_view`.
     2. `세션 소스` → **정규식과 일치** → 탭 1 과 같은 식 `^(naver|m\.search\.naver\.com|search\.naver\.com)$`
     3. `방문 페이지 + 쿼리 문자열` → **정규식과 일치** → 슬레이트 경로 식. 10/3 값(R6-06 후보 3쪽):
        ```
        ^/(job/professor|job/doctor|home-loan)/?(\?.*)?$
        ```
        슬레이트가 바뀌면(예: 10/30 B20 패자 추가) Claude 가 새 식을 드립니다(패널 `--slate` 출력의 'REFERRER 탭 … 필터용' 줄).
   - 이렇게 걸면 표가 보통 수십 행이라 500행 한도에 닿지 않습니다. 도구도 이 파일의 총계 행을 대조해 잘렸으면 알립니다.
6. 10/3 에는 탭 2 를 28일(9/5~10/2)로 한 번 내보내 둡니다(아래 B 의 방법, 파일 이름 `referrer-28d-20261003.csv`).

## 5. 운영자 B — 매주 월요일 내보내기 (약 3분)

- 폴더: `C:/Users/ruby1/moneysalary-exports/ga4/` (없으면 새로 만듭니다. 저장소 폴더 안에 두면 도구가 거부합니다).
- 기간은 **월요일 전날(일요일)까지의 완료일**입니다.
  - 28일 = 4주 전 월요일 ~ 어제. 예) 10/5 → 9/7~10/4
  - 7일 = 1주 전 월요일 ~ 어제. 예) 10/5 → 9/28~10/4
- 순서
  1. 탭 `PANEL` 을 열고 기간을 28일로 → 오른쪽 위 **내보내기(다운로드 아이콘) → CSV**(화면 판에 따라 '공유 → 파일 다운로드 → CSV') → `panel-28d-YYYYMMDD.csv` 로 저장(YYYYMMDD = 그 월요일).
  2. 기간만 7일로 바꿔 같은 방법으로 → `panel-7d-YYYYMMDD.csv`.
  3. 표 오른쪽 아래 전체 행 수(예: `1-500 / 1,234`)가 500 을 넘으면 **시작 행**을 501 → 1001 → 1501 … 로 바꿔 가며, **받은 파일이 500행 미만이 될 때까지** 받습니다. 이름은 `panel-28d-YYYYMMDD-p2.csv`, `-p3.csv` … (7일도 넘으면 똑같이 `panel-7d-YYYYMMDD-p2.csv` …). 시작 행을 500 처럼 겹치게 넣으면 도구가 거부합니다(같은 행을 두 번 세지 않도록).
     - 도구가 파일마다 **총계 행**과 행 합을 대조해 '⚠ 불완전 — 시작 행 N 으로 한 번 더'라고 알려 주면 그 N 부터 더 받습니다.
  4. 슬레이트 판독이 있는 날(10/5, 10/30, 11/11, 12/7, 12/14, 2/1)에는 탭 `REFERRER` 도 28일로 → `referrer-28d-YYYYMMDD.csv`(필터 3개가 걸려 있는지 먼저 확인).
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

나눠 받은 주(예: 28일 3쪽, 7일 1쪽)는 파일을 모두 넣습니다.

```
npx tsx scripts/naver-template-panel.ts C:/Users/ruby1/moneysalary-exports/ga4/panel-28d-20261005.csv C:/Users/ruby1/moneysalary-exports/ga4/panel-28d-20261005-p2.csv C:/Users/ruby1/moneysalary-exports/ga4/panel-28d-20261005-p3.csv --7d C:/Users/ruby1/moneysalary-exports/ga4/panel-7d-20261005.csv --sitemap https://www.moneysalary.com/sitemap.xml --log-line
```

- 첫 줄: 템플릿 표 + 클러스터 표(검토용, 저장하지 않음). `-p2`·`-p3` … 파일이 있으면 28일 파일 뒤에 이어서 넣고, 7일도 `--7d` 를 파일마다 반복합니다. 거부되는 경우: 같은 내용 파일 두 번, 같은 행이 두 파일에 있는 겹침(시작 행 중복), 파일마다 총계가 다름(다른 기간·탭이 섞임) — 모두 exit 1.
  - 맨 위에 `> ⚠ 불완전 입력(…)` 이 보이면 기록하지 말고 입력 메모의 안내(다음 시작 행)대로 운영자에게 더 받아 달라고 합니다.
- 둘째 줄(`--log-line`): URL·경로·검색어가 없는 한 줄. [metrics-log.md](metrics-log.md) 에 날짜·창(예: `28일 9/7~10/4 · 7일 9/28~10/4`)을 적은 행을 추가하고 비고 칸에 이 줄을 붙입니다(문서 커밋). 형식은 `NAVER-PANEL v1 28d 세션 N 롱테일 N 사이트맵 N 커버 x% ; 열=세션·페이지당·커버·7d ; <템플릿> N·x·x%·N ; … ; 계열 28d … ; 계열 7d … ; 7d 세션 N` 입니다.
  - 28일·7일 창 중 하나라도 불완전(누락·초과·잘림 의심)이면 **한 줄을 내지 않고 exit 3** 으로 거부합니다. 더 받아 다시 돌립니다.
  - 마지막 파일이 500행 미만인데도 계속 모자라면(GA4 임계값, §9) `--allow-incomplete` 를 붙입니다. 그러면 둘째 칸에 `불완전 28d 누락 조회수 N 세션 약 N` 이 붙은 채로 나오고, 그 주는 §8 규칙대로 판독에서 뺍니다.
  - 총계 행이 없는 내보내기면 둘째 칸에 `총계없음 28d` 가 붙습니다(기록은 유효, 완전성만 미확인).
- 셋째 줄(`--slate`, 판독일만): 슬레이트 경로의 28일 네이버 세션과, `--referrer` 를 주면 그 경로의 검색어 × 방문 페이지(경로마다 상위 10개)만 나옵니다. 리퍼러 원문은 나오지 않습니다. 경로·검색어가 들어가므로 metrics-log 가 아니라 [gsc-sniping-log.md](gsc-sniping-log.md) Round 4 행에 적습니다.
  - 리퍼러 파일도 총계 행을 대조합니다. '⚠ 잘린 리퍼러 표' 가 나오면 '(검색어 없음)'·낮은 커버리지가 네이버 때문이 아니라 잘림 때문일 수 있으니, REFERRER 탭 필터 3개를 확인하고 다시 받습니다(여러 파일이면 `--referrer` 반복).
  - 출력 끝의 'REFERRER 탭 … 필터용' 정규식을 gsc-sniping-log 에 같이 적어 두면 다음 판독일에 운영자에게 그대로 드릴 수 있습니다.
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
- **데이터 품질(10/5 첫 기록 전에 정함)**: 한 줄 기록에 `불완전` 이 붙은 창은 그 창을 쓰는 판독·KPI((a)·(c)·(d)·(e)·(f)·커버리지)에서 '기록 없음'과 같이 봅니다 — 잘린 꼬리는 바로 롱테일·커버리지·작은 계열·슬레이트 페이지이기 때문입니다. `총계없음` 은 유효한 기록으로 봅니다. 1회 파일(`panel-sep`·`panel-jan`)과 슬레이트 리퍼러 파일도 같은 기준입니다(불완전이면 더 받아 채운 뒤 판독).

## 9. 문제 해결

| 증상 | 원인과 대처 |
|---|---|
| exit 2 '저장소 작업 트리 안' | CSV 를 `C:/Users/ruby1/moneysalary-exports/ga4/` 로 옮깁니다 |
| '헤더 인식 실패' | 탭 `PANEL` 이 아닌 표를 받았습니다. 열 `방문 페이지 + 쿼리 문자열`·`세션수` 가 있어야 합니다 |
| '리퍼러 내보내기입니다' | `REFERRER` 탭 파일을 패널 자리에 넣었습니다. 그 파일은 `--referrer` 로 넣습니다 |
| '⚠ 불완전 — 행이 빠졌다' · '⚠ 불완전(잘림 의심)' | 총계 행보다 행 합이 적거나, 총계 없이 모든 파일이 '행 표시' 값만큼 찼습니다. 행 표시 500 으로 두고 **안내된 시작 행**(501 → 1001 → 1501 …)부터 받은 파일이 500행 미만이 될 때까지 더 받아 모두 함께 넣습니다 |
| '마지막 파일이 '행 표시' 값보다 적은데도 … 모자라다' | 중간 페이지가 빠지지 않았는지(1·501·1001 … 순서) 봅니다. 그래도 같으면 GA4 임계값(작은 행 숨김)입니다 — Claude 가 `--allow-incomplete` 로 '불완전' 표시와 함께 기록하고 그 주는 §8 대로 판독에서 뺍니다. 2주 연속이면 운영자에게 알립니다 |
| '같은 행 N개가 두 파일에 (시작 행이 겹침)' | 시작 행을 500·1000 처럼 겹치게 받았습니다. 1·501·1001 … 로 다시 받습니다 |
| '파일마다 총계 행이 다릅니다' · '⚠ 불완전(초과)' | 다른 기간·다른 탭 파일이 섞였습니다. 같은 탭·같은 기간 파일만 넣습니다 |
| `총계없음` | 총계 행이 없는 내보내기입니다. 기록은 유효하지만 완전성은 확인되지 않았습니다(마지막 파일이 500행 미만이면 잘림 가능성은 낮음) |
| 슬레이트 '(검색어 없음)'이 많음 · '⚠ 잘린 리퍼러 표' | REFERRER 탭 필터 3개(이벤트 이름·세션 소스·방문 페이지 정규식) 중 빠진 것이 있는지 보고 다시 받습니다. 잘림이 없는데도 검색어가 없으면 네이버가 query 를 뺀 것입니다 |
| '세션 소스 열 없음 — 가정' | 정상입니다(필터로 걸었음). 필터가 빠졌는지만 한 번 확인합니다 |
| `(other)` 경고 | GA4 가 행을 뭉쳤습니다. 기간을 줄이거나 7일·28일을 나눠 봅니다. URL 수·커버리지가 낮게 나옵니다 |
