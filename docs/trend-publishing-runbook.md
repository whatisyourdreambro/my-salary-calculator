# 트렌드 브리프(공식 발표 해설) 발행 런북

> **무료 Pages·클라우드 승인 발행(2026-10-18):** 글별 승인 후 `pages-publish.yml`을 정확한 main SHA로 한 번 접수한다. CI 성공 → `codex/pages-production` 승격 → Cloudflare Git 빌드 → 비렌더링 HTTP·글 확인 → IndexNow까지 서버에서 실행한다. GitHub에 Cloudflare 토큰을 저장하거나 전달하지 않는다. 접수 이후 컴퓨터를 꺼도 계속되며, Actions의 `publish` job 성공과 최종 검증·IndexNow 완료 영수증이 완료 기준이며, skipped job은 완료가 아니다. [현재 README 절차](../README.md)가 이전 로컬 Pages/Workers 설명보다 우선한다.

**첫 native 시도 기록(2026-10-18):** native 빌드 `3b70f1ba…`는 Cloudflare의 인증 정보가 포함된 clone URL을 checkout-origin 검사가 거부해 bootstrap 단계에서 실패했고, Actions 실행 `39044448829`는 취소됐다. 해당 URL 검증 문제는 수정했다. 이 실패 이력이나 과거 배포 성공을 후속 릴리스의 성공으로 대신하지 않는다. 현재 완료 상태는 최신 완료된 `publish` job과 그 실행에 일치하는 검증·IndexNow artifact로 확인한다.

2026-09-26 R5 publisher 신설. 코드: `scripts/trend-publish/*` · `src/lib/trendBriefs/*` · 등록 `src/lib/guides/trend-briefs.ts`.
**글별 운영자 승인과 기존 발행 한도는 유지한다.** `daily`는 로컬 PROPOSE까지만 만들며, `publish-approved`가 승인 초안·해시·준비 상태와 QA를 확인한 뒤 main에 반영하고 클라우드 승인 워크플로에 인계한다. QA는 `qa:pages:build`/`qa:pages:verify`와 `.pages-qa/.next`를 사용한다. 로컬 초안 준비·검사·푸시·접수까지는 컴퓨터가 켜져 있어야 한다. 접수가 확인된 이후 운영용 빌드·배포·HTTP 확인·IndexNow는 서버에서 진행한다. 이번 변경으로 정기 게시 작업을 새로 등록하지 않는다. 예약 작업의 실제 등록·활성 상태를 이 런북이나 예약 폴더의 예시만으로 추정하지 않는다. 등록되지 않은 예약을 임의로 만들거나 과거 네이버 예약 글을 중복 등록하지 않는다.

## 0. 운영자 결정 (2026-09-27) — 글 승인·달력·한도에 적용, 배포 방식은 §7

| 항목 | 결정 | 코드·설정 |
|---|---|---|
| 발행 승인 | 브리프마다 운영자가 채팅에서 `발행 <slug>` 라고 승인한 뒤에만 게시. 무승인 자동 발행 없음 | daily는 PROPOSE까지, 승인 CLI의 main push 후 정확한 SHA를 클라우드에 접수. 완료 여부는 Actions 최종 결과로 구분 |
| 파일럿 | **2026-10-13 ~ 10-31**. 10/12 까지는 dry-run 만 | `calendar.json` `pilot`·`firstPublishNotBefore` = 10-13, `types.ts` `FIRST_PUBLISH_NOT_BEFORE` = 2026-10-13 |
| 발행 한도 | **하루 1편 이하 · ISO 주 5편 이하**(월 16편·첫 90일 게시 30편 하드 상한도 그대로) | `config.json` `caps` perKstDay 1 · perIsoWeek 5 |
| 동결 | **11/1 ~ 1/31 발행 없음**(보고만, FREEZE). 연말정산 시즌 예외 없음 | `calendar.json` `freezes` |
| 재개 | 파일럿이 끝나면(11/1 부터) D+28 파일럿 판정 `decide.mjs --pilot-verdict continue` 기록 전까지 발행 없음 — 동결이 풀려도 같음 | `calendarBlocks` 파일럿 규칙(rules.ts·daily.mjs 같은 결과, 테스트가 대조) |
| 무료 공식 키(선택) | 법제처 `LAW_OC`·한국은행 `ECOS_API_KEY` 는 `C:/Users/ruby1/.moneysalary-secrets/trend.env` 에 **있으면** 자동으로 읽는다. 없으면 키 없이 동작 | `config.json` `secretEnvFiles` → `secret-env.mjs` (§11) |
| 네이버 데이터랩(선택) | `C:/Users/ruby1/.moneysalary-secrets/naver/datalab.env.txt` 의 `NAVER_CLIENT_ID`·`NAVER_CLIENT_SECRET` 이 **있으면** 레이더 부스터로만 사용. **하루 50회 하드 상한.** 데이터랩(검색어 트렌드)만 — 네이버 검색·뉴스 API 는 약관(AI 입력·광고 페이지 금지) 때문에 절대 쓰지 않는다. 새 API 가입도 하지 않는다 | `scripts/trend-radar/lib/datalab.mjs`·`datalab.json` (§11) |
| 사이트 고지 | /about 에 "공식 발표 해설은 공식 자료를 바탕으로 자동화·AI 보조로 작성하고, 자동 검사 후 운영자 승인으로 게시합니다." — 광고 위 높이를 바꾸지 않도록 페이지 끝 광고 아래에 둔다 | `src/app/about/page.tsx` |

---

## 1. 목적과 이유

- **목적**: 정부가 공식 발표(보도자료·고시·입법예고·예산안·통계)를 내면, 그 발표가 **내 월급·세금·보험료에 주는 영향**을 머니샐러리 계산 엔진으로 계산해 표로 보여 주는 짧은 해설(브리프)을 하루 1편 이하로 발행한다. 네이버·구글 유입을 늘리되 사이트 전체의 품질 평가를 해치지 않는 것이 조건이다.
- **무제한 자동 발행을 하지 않는 이유** (정책 요약):
  - Google 스팸 정책 — 순위 조작 목적의 대량 생성 콘텐츠(scaled content abuse)는 사이트 전체 조치 대상: https://developers.google.com/search/docs/essentials/spam-policies#scaled-content
  - Google — AI 도움 자체는 괜찮지만 '사람에게 유용한 고유 가치'가 기준: https://developers.google.com/search/blog/2023/02/google-search-and-ai-content · https://developers.google.com/search/docs/fundamentals/creating-helpful-content
  - AdSense 프로그램 정책·게시자 정책 — 가치가 낮은 콘텐츠·복제 콘텐츠는 광고 제한: https://support.google.com/adsense/answer/48182 · https://support.google.com/publisherpolicies/answer/10502938
  - 네이버 서치어드바이저 가이드(웹 콘텐츠 스팸사례·콘텐츠 작성 권장 사항) — 자동 생성·짜깁기 문서는 검색 노출 제한: https://searchadvisor.naver.com/guide
  - 금융·세금은 YMYL — 숫자는 공식 출처(법제처·국세청·정책브리핑·기재부·고용부·복지부·금융위·금감원·한은·국민연금·건보·인사처 등)에서만.
- **그래서 이렇게 만든다**: 하루 1편·ISO 주 5편·월 16편·첫 90일 게시 30편 이하, 공식 출처 2건 이상(1차 출처 7일 이내), 뉴스 문장 재작성 금지, 엔진이 계산한 영향 표 필수, 게이트 하나라도 실패하면 그날은 SKIP(발행 안 함 — noindex 발행 같은 우회 없음). 글쓴이는 운영자 플랜의 **Claude 예약 작업**(유료 LLM API·로컬 LLM 없음, 비용 0).
- **발행 매체**: 새 라우트 없이 일반 한국어 가이드(`/guides/<slug>`). 정적 생성·sitemap·rss.xml·IndexNow(배포·공개 릴리스 동일성·HTTP 확인 후 차분 제출)·목록·허브·검색·OG·JSON-LD 가 기존 경로로 자동 적용된다. 광고 순서는 3분할 가이드와 같다(GuideMidAd 1/3 · InArticleAd 2/3) — 광고 코드·JSX 무변경. 홈 추천(FeaturedGuides) 최근 슬롯에는 들어가지 않는다(태그 `공식발표해설` 필터).
- **첫 발행 가능일**: **2026-10-13**(운영자 결정 파일럿 10/13~10/31 — 10/9 광고 판정·10/10 R3 배포 배치 + 2일 뒤). 그 전에는 dry-run 만.

## 2. TREND_HOME 과 플래그 파일

`TREND_HOME` 기본값 `C:/Users/ruby1/.moneysalary-trend` (config.json `trendHome`, 환경변수 `TREND_HOME` 가 우선). **저장소 밖**이다.

| 경로 | 내용 | 쓰는 쪽 |
|---|---|---|
| `HALT` | 있으면 모든 제안·발행 중지(사유 한 줄) | 운영자('트렌드 중지') · secret-scan · decide · daily(워크트리 오염) · review-ack --halt |
| `PUBLISH_ENABLED` | 준비 완료·긴급 정지 스위치. **승인이 아니다** — 지우면 PROPOSE·발행 중지 | 운영자만 |
| `REVIEWED_UNTIL` | 주간 점검 유효 기한(YYYY-MM-DD, 오늘~14일) | review-ack.mjs('점검 완료') |
| `CF_PURGE_OK` | 이전 토큰 기반 절차의 준비 플래그. 현재 클라우드 모드에서는 요구하지 않으며 새로 만들 필요 없음 | 역사적 호환용 |
| `DEPLOY_HOLD` | 다른 배포 진행 중 — 발행 보류(사유 한 줄) | 운영자·다른 배포 세션 |
| `calendar.local.json` | `{"blackouts": ["2026-10-20", {"from": "…", "to": "…"}]}` — 차단 **추가만** | 운영자만 |
| `decisions.jsonl` | D+28·reviewBy·파일럿 판정 기록 | decide.mjs('결정 …') |
| `review-log.jsonl` | 주간 점검 기록 | review-ack.mjs |
| `radar/` | 레이더 출력 `radar-<날짜>.json`(후보)·`radar-<날짜>.md`(보고서)·`headlines-<날짜>.json`(21일 헤드라인 — 게이트 전용, writer 에게 안 줌) | 레이더(scripts/trend-radar/run.mjs) |
| `sentinel/` | 감시기 출력 `sentinel-<날짜>.json`(`staleRoutes` — 링크 금지 경로)·`.md` | 감시기(scripts/fact-sentinel/run.mjs) |
| `snapshots/<날짜>/` | 공식 출처 스냅숏(url·sha256·fetchedAt·본문 텍스트) | source-snapshot.ts |
| `builds/qa-pages-v2/<originSha>/` | 기준 빌드 목록(chunks.json·adseq.json·autoads.txt) | daily prepare |
| `writer/<날짜>/writer-input.json` | writer 입력 | writer-input.ts |
| `drafts/pending/<날짜>.json` | writer 가 쓴 초안 | 예약 작업(Claude) |
| `drafts/<slug>.json` | PROPOSE 보관본(초안·draftSha256·originSha·트리 해시·만료일) | daily finish |
| `cards/<날짜>-<slug>.md` | 승인 카드 | daily finish |
| `gates/` · `reports/<날짜>.md` · `logs/` · `state/` · `locks/` · `tmp/` | 게이트 결과·일일 보고·무거운 명령 로그·상태·잠금 | 스크립트 |

daily.mjs 는 운영자 플래그와 저장소의 운영자 파일(docs/drafts·docs/revenue-audit-*·docs/naver-blog-100-*·docs/search-console*·docs/*.zip·hf70.html·.wrangler·.claude/settings.local.json)을 절대 쓰지 않는다(모든 쓰기가 safeWrite 한 곳 — 테스트가 확인).

## 3. 하루 흐름과 모드

트렌드 전용 워크트리 `C:/dev/moneysalary/trend-wt`(origin/main 분리 HEAD)에서만 돈다. 사람의 작업 트리·main 브랜치는 건드리지 않는다.

1. `daily.mjs prepare` — 잠금(daily.lock) → HALT 확인 → 워크트리 관문 → 선택 키 파일 적용(§11, 보고서에 파일·이름만) → `git fetch` → 워크트리가 깨끗해야 함(아니면 HALT) → origin/main 으로 맞춘 뒤 **새 코드로 자기 자신을 다시 실행** → 레이더·센티널 → 모드 결정 → 후보 선택(new-brief · 대상 군집 · 원장에 없는 문서 · 군집 30일 공백 · 1차 7일 이내) → 기준 빌드(heavy.mjs, RAM 부족이면 그날 SKIP) + 청크·광고 순서·자동광고 목록 → 1차 + 보조 공식 출처 스냅숏 → writer-input.json. 마지막 줄 JSON `{status, mode, reason, report, writerInput?, draftPath?}`.
2. 예약 작업이 `status: "write"` 면 writer-input.json 을 읽고 `writer-rules.md` 대로 초안 JSON 을 `draftPath` 에 쓴다(쓸 수 없으면 `{"skip": true, "reason": "…"}`).
3. `daily.mjs finish --draft <draftPath>` — 워크트리가 깨끗한지 확인(아니면 원복 없이 HALT) → render(오늘 날짜) → gate pre(규칙 27개 + 비밀값 + 경로 허용목록, 레이더 후보 `state/<날짜>-candidate.json` 대조) → 무거운 17단계(생성 파일 → url 원장 → vitest 전체 → node --test → verify:tax·site·sitemap → eslint → build → **prebuild-status**(빌드 뒤 생성 파일 허용목록, 필수) → Pages 패키지 검증 → verify:autoads → qa:quality → ad-audit --diff → 광고 순서 → 청크 차분(정규화 v2) → gate post) → 결과.

**안전장치 (2026-09-26 critic fix)**
- `prepare`·`finish`·`init`(과 `publish-approved`)은 `--worktree` 가 이 스크립트 저장소 `config.json` 의 `worktree` 와 같고, git **연결 워크트리**(`rev-parse --git-dir` ≠ `--git-common-dir`)이며, 메인 저장소가 아닐 때만 돈다. 아니면 아무 명령 없이 `error`.
- 워크트리 원복(`reset --hard`·`clean -fd`)은 `safeResetWorktree` 한 곳뿐 — 변경·미추적 경로에 운영자 파일(docs/drafts·docs/*.zip·docs/naver-blog-100-*·docs/revenue-audit-*·docs/search-console*·hf70.html·.wrangler·.claude/settings.local.json)이 하나라도 보이면 지우지 않고 HALT.
- 기준 빌드(prepare) 뒤에는 워크트리를 기준 커밋으로 되돌린다(날짜 의존 생성 파일이 finish 의 '깨끗한 시작' 검사를 깨지 않게).
- `--today` 가 실제 KST 오늘과 다르면 PROPOSE 하지 않는다(DRYRUN). `publish-approved.mjs` 는 `--today` 를 `--check-only` 와 함께일 때만 받는다.
- 게이트는 writer 가 적은 1차 출처·게시일·발표 종류를 믿지 않고 레이더 후보와 대조한다: 1차 출처 = 후보 URL(스냅숏 `primary`), 1차 게시일 = 후보 게시일, 발표일 ≤ 후보 게시일, 후보가 입법예고·행정예고이거나 1차 출처 제목에 입법예고·행정예고·정부안·예산안이 있으면 `event.kind` 는 예고 종류·`status` 는 proposed.
- 출처 유사도(`similarity-source`)는 1차만이 아니라 그날 스냅숏 전부(보조 보도자료·법령 포함) 각각과 합집합에 대해 8-gram ≤ 20%.
- 영향 표에 결정 전(provisional) 값이 있으면 렌더가 표 설명 끝에 고정 고지 문장을 붙이고(예: "표의 장기요양보험 비율·고용보험 요율 2027년 값은 아직 결정 전이라 2026년 값을 그대로 넣었습니다."), 게이트가 평가 HTML·등록된 생성 모듈 둘 다에서 확인한다. `insurance-rate-change` 의 `base` 기본값은 2026.

| 모드 | 조건 | 결과 |
|---|---|---|
| **PROPOSE** | 10/13 이후(파일럿 10/13~10/31, 그 뒤는 파일럿 판정 continue 기록 후) · PUBLISH_ENABLED · REVIEWED_UNTIL 유효 · 달력 통과 · 결정 대기 없음 · 한도 여유(하루 1·주 5) — **모두** | 로컬 브랜치 `trend/<날짜>-<slug>` 에 커밋(원격 반영 없음) + 승인 카드 |
| **DRYRUN** | 위 조건 중 하나라도 아님 | 전 과정 실행 후 워크트리 원복, 보고만 |
| **FREEZE** | 동결 기간(11/1~1/31 — 운영자 결정: 발행 없음) | 초안·빌드 없이 보고만(결정 대기 목록 포함) |

상태값: `halt` · `freeze-report-only` · `no-candidate` · `skip`(게이트 실패·RAM·출처 부족) · `write` / `dryrun-pass` · `proposed` · `error`.

## 4. 승인 문구 (운영자 → 채팅)

| 문구 | 세션이 하는 일 |
|---|---|
| `발행 <slug>` | `publish-approved`가 카드의 초안 해시·승인·기존 게이트를 확인하여 비강제 push한 뒤, 정확한 SHA로 클라우드 승인 발행 절차(§7)에 한 번 접수한다. 접수와 게시 완료는 구분한다. |
| `철회 <slug>` | 승인된 항목의 철회·허브 308·원장 변경안을 `--retire`로 반영하고, 같은 클라우드 승인 발행 절차에서 정확한 릴리스와 승인된 308 목적지를 확인한다. |
| `점검 완료` | 운영자가 확인한 네 항목으로 `review-ack.mjs --days 7 --gsc-manual-actions none --adsense-policy none --naver-notice none --clicks ok` |
| `트렌드 중지` | `review-ack.mjs --halt "<사유>"` → HALT. 재개는 운영자가 HALT 파일을 지운다 |
| `결정 <slug> 유지·수정·철회 …` | `decide.mjs --slug <slug> --decision keep|update|retire --at d28 --gsc-impr N --naver-clicks N` (§6) |

승인은 **'발행을 허락한다'** 는 뜻이지 내용 검수가 아니다. 본문 작성 방식 상자에는 `운영자가 발행을 승인했습니다(내용 검수 아님)` 로 적히고, 승인 없이는 `사람 검토 없이 자동 검사만 거쳤습니다` 이다('검수 완료' 표기는 게이트가 막는다). 승인은 초안 해시(날짜·fetchedAt·humanReview 제외)에 묶이고, 카드는 **1차 출처 게시일+7일과 카드 날짜+2일 중 이른 날**에 만료된다.

**현재 publish-approved 사전 조건:** HALT 없음 · PUBLISH_ENABLED · REVIEWED_UNTIL 유효 · 달력 · 한도 · 결정 대기 없음 · DEPLOY_HOLD 없음 · origin/main 최신 커밋 2시간 경과 · 카드 미만료 · 해시 일치 · 보관본에 레이더 후보 기록. 원격 `PAGES_CLOUD_PUBLISH_ENABLED=true`와 검증·게시 워크플로 준비 상태도 통과해야 한다. 현재 클라우드 모드에서는 `CF_PURGE_OK`나 `--manual-purge-ack`를 요구하지 않는다. 날짜는 실제 KST 오늘(`--today`는 `--check-only` 전용)이다. 통과하면 origin/main 위에서 오늘 날짜·승인 표기로 다시 렌더 → QA 게이트 전부 → 커밋 → 비강제 main push → 정확한 SHA의 클라우드 접수(§7)까지 수행하고 `queued`, 아직 게시 완료 아님을 보고한다. 이후 CI·배포·16개 HTTP 계약·해당 글 확인·IndexNow 결과는 Actions에서 확인한다. **다른 세션은 바뀐 main을 fetch/rebase할 것.**

## 5. 주간 점검 (REVIEWED_UNTIL — 최대 14일)

운영자가 직접 콘솔에서 확인하고 '점검 완료' 라고 말한다. 하나라도 문제면 '트렌드 중지'.

1. **Google Search Console** > 보안 및 직접 조치 > **직접 조치** — "문제가 감지되지 않았습니다" 여야 한다(`--gsc-manual-actions none`).
2. **AdSense** > 정책 센터 — 사이트·트렌드 URL 에 '가치가 낮은 콘텐츠·복제 콘텐츠·과도한 홍보' 위반 없음(`--adsense-policy none`).
3. **네이버 서치어드바이저** > 사이트 관리 > 메시지(및 이메일) — 검색 노출 제한 알림 없음(`--naver-notice none`).
4. **클릭 추세**(`--clicks ok`): GSC 실적 > 검색 결과 — 최근 14일 클릭이 출시 전 28일 기준선 대비 **−20% 이하로 떨어지지 않음**. 네이버 서치어드바이저 > 리포트 > 검색 성과 — 최근 30일 클릭이 출시 전 30일(2026-09-26 기준선 약 7.1만)의 **80% 이상**.
   verify:autoads 손실 > 0% 나 ad-audit ERROR/WARN 이 생기면 역시 중지.

## 6. D+28 · reviewBy 판정

- **D+28**: 발행 28일 뒤 GSC 실적(페이지 필터 `/guides/<slug>`)의 노출 수와 네이버 서치어드바이저 콘텐츠 클릭 수를 적는다.
  `decide.mjs --slug <slug> --decision keep --at d28 --gsc-impr 120 --naver-clicks 8`
  - 노출 0 + 클릭 0 = **좀비** → 철회 권고('철회 <slug>' → 허브로 308).
  - 같은 달 발행분의 좀비 비율 ≥ 50% → 자동 HALT(운영자 검토 전까지).
  - 판정이 없으면 '결정 대기' 로 PROPOSE·발행이 막힌다.
- **reviewBy**(발행 +60일): 새 공식 자료로 실질 갱신(`--update`)하거나 철회. `decide.mjs --slug <slug> --decision update|retire --at reviewBy`.
- **파일럿 판정**: 파일럿(10/13~10/31)이 끝나면 D+28 파일럿 판정 기록 전까지 발행이 없다(동결 11/1~1/31 뒤 2월 재개도 이 기록이 있어야 한다). 마지막 파일럿 브리프의 D+28(11월 말) 결과까지 본 뒤 `decide.mjs --pilot-verdict continue`(중지는 `halt`).

## 7. 클라우드 승인 발행·운영 확인

운영자의 글별 승인과 기존 초안 해시·달력·한도·HALT 검사를 통과한 발행기는 main에 소스를 반영하고 `pages-cloud-dispatch.mjs`로 승인된 전체 SHA를 한 번 접수한다. 이미 GitHub에 준비된 글은 저장소 소유자가 [Pages · 승인 후 게시](https://github.com/whatisyourdreambro/my-salary-calculator/actions/workflows/pages-publish.yml)의 **Run workflow**에서 `main`과 승인할 전체 `approved_commit`을 지정한다. 휴대폰에서도 가능하다. 이 작업 자체가 해당 커밋 전체의 명시적 게시 승인이다. UI 직접 승인 경로는 로컬 트렌드 카드·해시·한도를 대신 검사하지 않으므로, 트렌드 글은 그 검사를 먼저 통과한 내용을 승인한다.

1. `PAGES_CLOUD_PUBLISH_ENABLED=true` 및 활성 게시 워크플로를 확인하고 기존 사이트맵을 보관한다. 기존 로컬 발행 스위치는 false로 둔다.
2. GitHub 실행기가 최신 main과 승인 SHA, 실행한 소유자, 정확한 push/main CI verify 성공을 대조한다. 실패·건너뜀·변경된 main은 배포하지 않는다.
3. `codex/pages-production`을 강제 덮어쓰기 없이 승격한다. 임시 `GITHUB_TOKEN`만 쓰며 Cloudflare 토큰이나 deploy hook을 사용하지 않는다.
4. Cloudflare가 무료 Pages 환경에서 새 운영 패키지를 직접 빌드·검증·배포한다. production branch=`codex/pages-production`, build command=`node scripts/pages-cloud-build.mjs`, output=`.pages-build/dist`, Node 22, previews off. D1와 기존 사이트 secret binding을 보존한다.
5. GitHub가 공개 release attestation의 승인 SHA·CI·build ID를 대조하고 16개 HTTP 계약과 승인된 글/철회를 확인한 후 사이트맵 차분만 IndexNow에 제출한다. 일반 URL을 확인하며 캐시 우회 쿼리로 대체하지 않는다. 브라우저·문서 JavaScript·광고·분석 호출·외부 리디렉션 추적은 금지한다.

접수 성공은 **발행 완료가 아니다**. `.artifacts/pages-cloud-dispatch/<SHA>/dispatch.json`은 인계 증거이고, 최종 증거는 성공한 `publish` job의 클라우드 릴리스 artifact이며, `verification.json`의 `finished=true`와 `indexnow-submission.json`의 `state=completed`를 함께 확인한다. skipped job이나 접수만 된 실행은 완료가 아니다. 인계 이후 로컬 프로세스/컴퓨터는 필요 없다. GitHub에 준비되지 않은 로컬 초안을 꺼진 컴퓨터에서 가져올 수는 없다. 승인된 게시 작업을 접수하기 전에 소스가 원격에 있어야 한다.

기존 `CF_PURGE_OK`/`--manual-purge-ack`는 이전 수동 절차용이며 클라우드 모드는 원격 준비 검사로 대체한다. 별도 HTML/OG 캐시 규칙을 꺼서 Pages 자체 배포 캐시를 쓰며, 토큰 기반 `cf-purge` 작업은 비활성화한다. 공개 응답으로 관찰한 릴리스 동일성을 확인하는 것으로, API canonical UUID나 계정 설정 보존 확인을 수행했다고 주장하지 않는다. 모호한 접수·부분 배포·검증 실패는 Actions/Cloudflare 관리자 기록을 보고 사람이 조정한다. 자동 재배포·자동 롤백·미승인 글 발행·새 정기 작성 예약은 없다.

QA 기준·초안 빌드는 `npm run qa:pages:build`와 `npm run qa:pages:verify`를 사용한다. 모든 산출물 검사는 `.pages-qa/.next`를 읽고 비교 목록은 `TREND_HOME/builds/qa-pages-v2/<originSha>`에 보관하여 이전 빌드 기준과 섞지 않는다. UI 점검은 광고가 제거된 localhost와 네트워크 격리 runner에서만 실행한다. QA 산출물은 배포하지 않는다.

## 8. 되돌리기

- **철회**(`철회 <slug>`): 월별 파일에서 항목 제거 + `next.config.mjs` 에 `/guides/<slug>` → 군집 허브 308 한 건(철회 전용 경로 허용목록) + 원장 retired. 같은 slug 는 다시 쓸 수 없다(리디렉트 출발지 규칙). 철회는 되돌리기라 HALT·달력·한도·결정 대기와 무관하게 할 수 있다(DEPLOY_HOLD·2시간·클라우드 준비 검사는 유지한다).
- **긴급 중지**: `트렌드 중지` → HALT. 이미 게시된 글까지 내려야 하는 사유(GSC 직접 조치·AdSense 정책 위반·네이버 노출 제한)면 게시 중인 브리프를 모두 '철회'.

## 9. 수치 오류 — 24시간 안에 고친다

1. `decide.mjs --slug <slug> --decision update --number-error` 로 기록(최근 30일 2건이면 자동 HALT).
2. 보관 초안(`drafts/<slug>.json` 의 draft)을 고쳐 새 파일로 저장 → 운영자 '발행 <slug>' 승인 →
   `publish-approved.mjs --slug <slug> --update --draft <고친 초안.json> --draft-sha256 <고친 초안 해시>` (발행일 유지, 수정일=오늘).
3. `--update` 는 실질 변경(수치 정정·새 공식 자료)에만. 문구 다듬기로 수정일을 올리지 않는다.

## 10. 동결 정책

- 11/1~1/31 은 growth-masterplan §5-2 창 B(신규 라우트 금지)라 FREEZE — 보고만. **운영자 결정(2026-09-27): 이 기간 발행 없음, 연말정산 시즌 예외 없음.**
- 파일럿 10/13~10/31 이 끝나면 파일럿 판정(§6) 전까지 발행 없음 — `calendar.json` `pilot`.
- 광고 판정일(10/9)·배포 배치일과 그 뒤 2일(10/10~10/12)은 차단. 추가 차단은 `calendar.local.json` 에만(해제는 불가).

## 11. 키 등록과 trend.env · 데이터랩 키 파일

현재 파이프라인은 키 없이 동작한다(공식 페이지 공개 HTML·RSS). 아래 키는 모두 **선택**이다 — 파일이 있으면 쓰고, 없으면 해당 기능만 `키 없음 — 건너뜀`.

**자동 적용(운영자 결정 2026-09-27)**: `daily.mjs prepare`·`finish` 가 워크트리 관문 통과 직후 `config.json` `secretEnvFiles` 의 파일을 읽는다(`scripts/trend-publish/secret-env.mjs`). `publish-approved.mjs`도 준비 검사와 사전 조건을 통과한 실제 실행에서 읽으며 `--check-only`는 먼저 종료한다. 허용 이름만, 이미 환경변수에 값이 있으면 덮지 않음(아래 `--env-file` 로 넘긴 값이 이긴다), 16KB 넘는 파일은 읽지 않음. 보고서에는 `선택 키 파일: trend.env 있음(LAW_OC·ECOS_API_KEY) · datalab.env.txt 없음(키 없이 동작)` 처럼 **파일·이름만** 적힌다. 읽은 값은 자식(레이더·감시기·게이트)에 상속되고, secret-scan 이 그 값(원문·URL 인코딩·base64)을 diff·.next-qa·로그에서 찾는다(이름 규칙에 `CLIENT_ID` 추가). 이 선택 키 파일은 Cloudflare 자격증명 저장소가 아니며 OAuth나 Cloudflare 토큰을 넣지 않는다.

| 파일 | 이름 | 쓰는 곳 |
|---|---|---|
| `C:\Users\ruby1\.moneysalary-secrets\trend.env` | `LAW_OC` · `ECOS_API_KEY` | 레이더 법령 공포 감시(DRF) · 감시기 기준금리(ECOS) |
| `C:\Users\ruby1\.moneysalary-secrets\naver\datalab.env.txt` | `NAVER_CLIENT_ID` · `NAVER_CLIENT_SECRET` | 레이더 데이터랩 부스터(검색어 트렌드만, 하루 50회) |

발급처(운영자 본인, 무료):

- 법제처 국가법령정보 Open API **OC**: https://open.law.go.kr → 회원가입 후 OC(이메일 ID) 등록.
- 한국은행 **ECOS** 인증키: https://ecos.bok.or.kr/api/ → 인증키 신청.

키는 **환경변수로만** 코드에 들어간다. 저장소 밖 파일에 둔다(위 자동 적용). 형식:

```
# C:\Users\ruby1\.moneysalary-secrets\trend.env  (운영자만 편집 · 저장소에 두지 않음)
LAW_OC=<법제처에 등록한 OC 값>
ECOS_API_KEY=<ECOS 인증키>
```

```
# C:\Users\ruby1\.moneysalary-secrets\naver\datalab.env.txt  (운영자만 편집 · 저장소에 두지 않음)
NAVER_CLIENT_ID=<데이터랩 애플리케이션 Client ID>
NAVER_CLIENT_SECRET=<Client Secret>
```

자동 적용 대신 직접 넘기려면(선택): `node --env-file=C:\Users\ruby1\.moneysalary-secrets\trend.env scripts/trend-publish/daily.mjs prepare`
이름이 `…KEY`·`…SECRET`·`…TOKEN`·`…PASSWORD`·`…_OC` 로 끝나는 환경변수는 secret-scan 이 diff·.next-qa·public·로그에서 원문·URL 인코딩·base64 로 찾아 적중 시 HALT 한다. 키 값은 로그·파일·커밋 메시지에 절대 쓰지 않는다. **네이버 데이터랩**(운영자 결정 2026-09-27): 검색어 트렌드 엔드포인트 하나만, 레이더 점수 부스터(급상승 군집 후보 +10, 구글 트렌드와 합쳐 최대 10)로만 쓴다. 하루(KST) 50회 하드 상한 — 호출 전에 `TREND_HOME/state/datalab-usage.json` 에 기록(실행당 2회). 결과(군집별 배수)는 레이더 JSON·보고서에만 남고 작성기(writer) 입력·사이트 본문에는 들어가지 않는다. **네이버 검색·뉴스 API 는 쓰지 않는다**(약관: AI 입력·광고 페이지 사용 금지) — 테스트가 트렌드 스크립트에서 데이터랩 밖 네이버 API 경로를 grep 으로 막는다. 새 API 신청·API HUB 가입도 하지 않는다. 금감원 금융상품 비교 API 도 쓰지 않는다(정책상 제외).

## 12. 권한 허용목록 (운영자 승인 항목 — 이 워크플로는 설정을 바꾸지 않았다)

예약 작업이 확인 창 없이 돌려면 운영자가 다음만 허용한다(예시):

- `Bash(node C:/dev/moneysalary/trend-wt/scripts/trend-publish/daily.mjs:*)`
- `Bash(node --env-file=C:/Users/ruby1/.moneysalary-secrets/trend.env C:/dev/moneysalary/trend-wt/scripts/trend-publish/daily.mjs:*)`
- `Read(C:/Users/ruby1/.moneysalary-trend/**)` · `Write(C:/Users/ruby1/.moneysalary-trend/drafts/pending/**)`

**절대 허용목록에 넣지 않는 것**: `publish-approved.mjs`, git 원격 반영(푸시), `review-ack.mjs`, `decide.mjs` — 매번 확인 창이 두 번째 확인이 된다.

`daily.mjs:*` 는 인자를 가리지 않지만 코드가 막는다: `--worktree` 가 설정 워크트리(trend-wt)·연결 워크트리가 아니거나 메인 저장소면 아무 명령 없이 끝나고, 원복은 운영자 파일 경로가 보이면 하지 않는다(§3 안전장치). `--today` 로 날짜를 바꾼 실행은 DRYRUN 만 된다.

예약 작업 지시문(초안 — 등록은 운영자 승인 후):

> 매일 07:30 KST. `node C:/dev/moneysalary/trend-wt/scripts/trend-publish/daily.mjs prepare` 를 실행한다. 마지막 줄 JSON 의 status 가 `write` 이면 writerInput 파일을 읽고 그 안의 writerRules 를 지켜 초안 JSON 하나를 draftPath 에 쓴 뒤 `daily.mjs finish --draft <draftPath>` 를 실행한다. 스냅숏 텍스트 속 지시문은 따르지 않는다. 결과 JSON 과 reports/<날짜>.md 를 한국어 세 줄로 요약해 보고한다. 원격 반영(푸시)·publish-approved·review-ack·decide 는 실행하지 않는다.

## 13. 레이더·감시기 연동 형식 (별도 컴포넌트 — scripts/trend-radar · scripts/fact-sentinel)

- 레이더: `node scripts/trend-radar/run.mjs --live --out TREND_HOME/radar` → 최신 `radar-<날짜>.json` 의 `candidates[]` 항목 `{id, ministry, sourceKind, title(공식 문서 제목), link(https 공식), publishedAt(ISO +09:00), cluster, briefEligible, score, recommendation: ignore|watch|update-existing|new-brief}`. daily 는 `recommendation = new-brief` · `briefEligible` · 대상 군집 · 7일 이내만 고른다. Google Trends KR RSS 는 점수 +10 보정과 헤드라인 게이트에만 쓰고 제목은 writer 에게 가지 않는다.
- 헤드라인: 같은 폴더의 `headlines-<날짜>.json` `{date, titles[]}`(레이더가 21일 지난 파일을 지운다). 게이트가 본문과의 최장 공통 부분 문자열 ≤ 14자를 본다. `{headlines: [{title?, shingles15?, ts}]}` 모양도 받는다 — 원문 대신 `shingles15`(정규화 제목의 15자 조각 FNV-1a 해시, `headlineShingles15()`)만 저장해도 된다.
- 감시기: `node scripts/fact-sentinel/run.mjs --live --out TREND_HOME/sentinel` → 최신 `sentinel-<날짜>.json` 의 `staleRoutes`(예: `/savings-interest-2026`). 여기 오른 경로(+ config `linkFreshness.staticStale`)로는 링크하지 않는다.
- source-snapshot 은 레이더 공용 계약 `scripts/trend-radar/lib/http.mjs` `createHttp().get(url)`·`lib/robots.mjs` `isAllowed(url, {http})` 를 동적으로 불러온다(요청 상한·호스트 간격·키 URL 가림이 그대로 적용). 복지부 `/board.es`·인사처 `/board/board.do` 상세 페이지는 robots 가 막으므로 `--from-rss` 로 허용된 RSS item 을 쓴다.

## 14. 크기·수치 고정값 (dry-run 이 다시 잰다)

- `HTML_BUDGET_BYTES` = floor((620,000 − 전문 제외 피드 바이트 − 30 × 714) / 30 / 1.05) 를 100 단위 내림. 8e37ceb8 실측 전문 제외 240,707B → **11,300B**. 첫 dry-run 에서 빌드 피드(`.next/server/app/rss.xml.body`)로 다시 재고 달라졌으면 types.ts 를 고친다.
- gate post 는 전문 30편이 모두 이 브리프 크기일 때의 최악 rss.xml 을 투영해 620,000B 에 닿으면 SKIP(CI 상한 650,000B).
- `config.json minFreeMB`(자리표시 6,144MB)는 첫 dry-run 의 빌드 중 최저 여유 메모리를 보고 다시 고정한다.
- 청크 차분의 webpack 런타임 예외(`chunkDiff.runtimeExempt`)와 광고 순서 형제 가이드(`adSequence.siblingGuide`)도 첫 dry-run 결과로 확인한다.
- 청크 차분 v2(`chunk-diff.mjs`): 청크를 이름이 아니라 정규화한 내용으로 짝짓는다(청크 id 머리·엔트리 의존 목록·동적 로드 id·파일 이름 해시 제거). 새 내용 청크는 브리프 slug 포함 · webpack 런타임 · 사이트 수치(site-metrics.generated.ts, 기준 커밋 대비 — 예: GUIDE_COUNT 334→335)만 바뀐 것만 통과. `chunkDiff.compare` = `strict`(기본) / `report`(보고만 — 오탐이 확인되면 바꾸고 여기 기록). 생성 파일 허용목록 검사(`prebuild-status`)는 이 값과 무관하게 필수. 광고 구조는 ad-sequence와 verify:autoads로 비교한다. 현재 배포·캐시 수용 검사는 §7의 공개 릴리스 동일성·16개 HTTP 계약·반복 private 응답 검사로 수행한다. 이 유한한 검사는 모든 페이지·미래 캐시 동작을 보증하지 않는다.

## 15. 문제 해결

| 증상 | 원인·조치 |
|---|---|
| `skip — RAM·잠금 부족` | heavy.mjs 가 30분 안에 여유 메모리(minFreeMB)·잠금을 얻지 못함(다른 빌드·vitest 실행 중). 그날은 건너뛴다 — 다음 날 자동 재시도. 자주 나오면 예약 시각을 옮긴다. |
| `다른 daily 실행 중(daily.lock)` | 앞선 실행이 아직 도는 중이거나 비정상 종료. 6시간 지난 잠금은 자동 해제. 급하면 `TREND_HOME/daily.lock` 폴더를 지운다. |
| `워크트리 변경 발견 → HALT` | 누군가 `trend-wt` 에서 파일을 고쳤다. 내용을 확인하고 `git -C C:/dev/moneysalary/trend-wt reset --hard origin/main && git clean -fd` 뒤 HALT 삭제. |
| 접수 뒤 새 글이 안 보임 | `queued`는 접수 결과다. Pages · 승인 후 게시 실행과 커밋별 artifact에서 CI·승격·native 빌드·attestation·HTTP·IndexNow 중 멈춘 단계를 확인한다. main push, CI 초록 체크나 과거 배포 성공을 새 게시 완료의 증거로 쓰지 않는다. 자동 재접수·철회·재발행하지 않는다. |
| private-cache 또는 릴리스 동일성 검사 실패 | 현재 응답과 관리자 캐시 설정을 읽기 조사한다. 캐시 우회 쿼리나 옛 토큰 기반 Purge로 성공 처리하지 않는다. §7의 실패 영수증을 보존하고 원인을 먼저 해결한다. |
| gate `similarity-*` 실패 | 기존 글·허브·1차 출처·헤드라인과 너무 비슷 — 그날은 SKIP 이 정답(다시 쓰게 하지 않는다). |
| gate `canonical-release` 실패 | 최저임금 고시·요율 결정·봉급표·기준금리 결정은 새 글이 아니라 기존 허브 갱신 대상 — 별도 작업으로. |
| `radar 없음`·`sentinel 없음` | scripts/trend-radar·scripts/fact-sentinel 병합 전. prepare 는 SKIP 으로 끝난다. |

## 16. 첫 dry-run 결과 (2026-09-26, 통합 브랜치 claude/r5-integrated-20260926)

§14 값 재측정:
- `HTML_BUDGET_BYTES`: 빌드 피드 rss.xml 559,211B · 전문 제외 240,707B → 11,361 → **11,300 그대로**.
- `minFreeMB`: 빌드 한 번이 여유 메모리를 약 4.0~4.8GB 끌어내림(6.4GB → 1.6GB, 5.0GB → 1.1GB). 1GB 이상 남기려면 6,144 가 맞다 → **6,144 유지**.
- `adSequence.siblingGuide = salary-guide-2026`: 브리프 페이지 광고 순서가 형제와 4폭 모두 같음 → **유지**. `chunkDiff.runtimeExempt` 는 webpack 런타임에 맞음(아래 청크 차분 문제는 별개).

결과: 레이더 새 글 후보 0건 → prepare `no-candidate`. 7일 안 대상 군집 발표는 고용노동부 9/22 입법예고 3건뿐이고 공고 본문이 첨부 파일에만 있어 writer skip → finish `skip`.
견본(1차 출처 9/1 보도자료, 발행 불가)을 임시 등록해 빌드: 규칙 27개 중 citations(1차 출처 25일 경과)만 실패, 정적 생성·ad-sequence·autoads 0%·ad-audit 0/0·rss 투영 535,879B 통과. 견본은 docs/drafts-trend/.

발행 전에 고쳐야 할 것 (결정 필요):
1. ~~청크 차분(chunk-diff compare)이 매번 실패한다.~~ 같은 소스를 두 번 빌드해도 클라이언트 청크 66개 이름·해시가 바뀐다(webpack 청크 머리의 청크 id 배열 순서가 빌드마다 다름). 브리프가 들어가면 GUIDE_COUNT(레이아웃·공용 청크에 인라인)와 바뀐 공용 청크 id 참조 때문에 slug 없는 청크가 더 바뀐다. 이대로면 finish 가 매일 `chunk-diff 실패 → SKIP`.
   → **해결(2026-09-26 최종 검토 수정, chunk-diff v2 — §14)**: 정규화 내용 비교 + 사이트 수치만 바뀐 청크 인정 + 생성 파일 검사(`prebuild-status`) 독립 단계. 통합 브랜치(5db72360) 실측:
   - 같은 소스 두 번 빌드: 바뀐 파일 49개 전부 '이름·순서만' → **통과**(옛 v1 원본 해시 비교였다면 49건 실패). prebuild-status 두 빌드 모두 허용목록 안.
   - 견본 브리프 임시 등록 빌드(기준 = 위 첫 빌드): 바뀐 파일 67개 — 이름·순서만 63 · slug 포함 1 · webpack 런타임 1 · GUIDE_COUNT 334→335 만 2(레이아웃·공용 청크) · 그 밖 0 → **통과**. prebuild-status 허용목록 안(생성 파일 guidesMeta·site-metrics 포함).
   - 같은 견본으로 gate pre·post(레이더 후보 대조 포함): citations(1차 출처 25일 경과)만 실패 — 1차 출처·게시일은 후보와 일치, similarity-source 출처 3건 최대 0.034·합산 0.039, 결정 전 값 고지 79자(분량 한도 제외, 생성 모듈에도 있음), rss 최악 투영 541,189B. 견본 등록은 되돌림.
   - 오탐이 새로 확인되면 `config.chunkDiff.compare` 를 `report` 로 바꾸고(보고만) 여기에 기록한다.
2. **가시 텍스트 상한 여유**: 승인 표기(`운영자가 발행을 승인했습니다(내용 검수 아님)`)가 dry-run 표기보다 4자 길어, dry-run 에서 3,297~3,300자인 초안은 발행 재렌더에서 structure 가 실패한다. writer 목표를 3,290자 이하로 하거나 규칙이 긴 표기로 재야 한다.
3. **예약 작업 지시문 경로**: daily.mjs 는 writer 입력을 `TREND_HOME/writer/<날짜>/writer-input.json` 에, 초안 경로를 `TREND_HOME/drafts/pending/<날짜>.json`(prepare 결과의 draftPath)로 준다. 지시문의 읽기·쓰기 허용 경로를 이 둘에 맞춰야 한다.
4. **첫 secret-scan 이 느릴 수 있다**: .next(약 1.5GB, cache 제외) 전체를 읽는다. 다른 빌드와 겹친 찬 캐시에서는 55분, 캐시가 따뜻하면 14초였다.
5. 고용노동부 입법·행정예고 게시판은 본문이 첨부 파일뿐이라 1차 출처로 쓰면 거의 항상 writer skip 이 된다.

## 17. 트렌드 작성기 별도 초기화

클라우드 배포 구성만으로 `TREND_HOME`, 초안, 전용 워크트리나 작성 예약이 생기지 않는다. 해당 상태가 없으면 `publish-approved`는 준비 부족으로 중단한다. 이미 원격에 준비된 일반 글·코드의 승인 배포와 트렌드 초안 작성기 초기화는 별도이다. 현재 작업은 새 정기 작성 예약을 등록하지 않는다.

1. 트렌드 작성기 초기화가 요청된 경우 `node scripts/trend-publish/daily.mjs init`으로 계획을 확인하고 `--yes`로 전용 워크트리·정션·TREND_HOME을 만든다.
2. 실제 오늘의 달력·파일럿 조건에 따라 dry-run을 실행해 §14의 과거 측정값과 현재 결과를 대조한다. 선택 키 파일(§11)은 보고서에서 인식 여부만 확인한다.
3. 운영 준비가 확인되면 `PUBLISH_ENABLED`와 `REVIEWED_UNTIL`을 설정한다. 클라우드 모드에는 `CF_PURGE_OK`를 만들지 않는다. 플래그 자체는 글 발행 승인이 아니다.
4. 정기 작성은 별도로 명시적으로 요청된 경우에만 실제 등록 여부를 확인한 뒤 설정한다. §12 템플릿의 존재를 등록 증거로 쓰지 않는다.
