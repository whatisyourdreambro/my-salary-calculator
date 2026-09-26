# 트렌드 레이더 (`scripts/trend-radar`)

하루 한 번, **무료 공식 신호**(부처 보도자료 RSS·목록)를 모아 금융·급여·세금·노동 12개 클러스터로 거르고,
기존 사이트 페이지에 연결하고, 점수를 매겨 **JSON + 한국어 보고서**를 만든다.

- 글을 쓰지 않는다. 상세 페이지·본문·첨부를 가져오지 않는다. 제목·링크·날짜만 읽는다.
- 키가 없어도 기본 경로가 전부 돈다(키는 선택 소스 1개뿐, 환경변수로만).
- 발행·git 조작·예약 작업 생성은 하지 않는다. 예약 실행(Claude 예약 작업)과 설정 변경은 운영자 승인 항목이다.
- 새 글 추천(`new-brief`)은 **후보**일 뿐이다. 실제 발행 여부는 발행기(trend-publish)의 게이트와 운영자 승인이 정한다.

## 사용법

```bash
# 오프라인 고정 표본(결정적) — 테스트·데모용
node scripts/trend-radar/run.mjs --fixtures --today 2026-09-26

# 실시간(요청 20회 이하, 순차 + 호스트별 1초 간격)
node scripts/trend-radar/run.mjs --live

# 소스 경로별 robots 허용/차단만 확인(요청 8회)
node scripts/trend-radar/run.mjs --check-robots

# 옵션
#   --out <dir>          산출물 폴더(기본 scripts/trend-radar/.cache — git 무시)
#   --max-requests N     요청 상한(기본 20)
#   --today YYYY-MM-DD   기준일(없으면 오늘 KST). 지정하면 기준 시각은 그날 09:00 KST
```

종료 코드: `0` 정상(일부 소스 실패는 보고서에 기록만) · `1` 모든 소스 실패 또는 설정 오류 · `2` 사용법 오류.

테스트: `node --test scripts/__tests__/trend-radar.test.mjs` (완전 오프라인 — 전역 fetch 를 막고 가짜 fetch 만 주입).

## 산출물 (`--out` 폴더)

| 파일 | 내용 |
|---|---|
| `radar-<date>.json` | `generatedAt, mode, date, sources[], candidates[], calendarUpcoming[], nextEvent, trends{items, financeMatches, clusters}, statutes[], lawdrf, cost{ms, rssMB, heapMB, requests, bytes}` — 정확한 형태는 `lib/report.mjs` 의 JSDoc typedef(`RadarOutput`)와 `validateRadar()` |
| `radar-<date>.md` | 한국어 보고서: 소스 상태 표, 새 글 후보 top 5, 기존 페이지 갱신 권장, 관찰, 다가오는 공식 일정(14일), 법령 공포 감시, 구글 트렌드 금융 매칭 수 |
| `headlines-<date>.json` | `{date, titles[]}` — 구글 트렌드 제목 + 트렌드 뉴스 헤드라인. **발행기의 헤드라인 겹침 게이트 전용**(보고서·작성기에 넘기지 않음). 21일 지난 파일은 실행 때마다 삭제 |

후보(candidate) 한 건: `id(sha1(정규화 링크)), src, ministry, sourceKind, title, link, publishedAt(ISO +09:00), cluster, briefEligible, score, scoreParts, matches{guides[3], pages[3]}, hubRoutes[], recommendation, reason(한국어), linkRobots`.

## 소스 (2026-09-26 전부 실측)

| id | 기관 | 형식 | 크기 상한 | robots·이용 메모 |
|---|---|---|---|---|
| mofe-press | 재정경제부 보도·참고자료 | RSS(`YYYY-MM-DD HH:MM:SS.0`) | 2MB | robots 는 검색·설문 경로만 차단. 옛 moef 도메인은 mofe 로 301 |
| mofe-explain | 재정경제부 설명·반박자료 | RSS | 2MB | 같음 |
| fsc-press | 금융위원회 보도자료 | RSS(dc:date) | 600KB | Allow /. description 에 본문 전문 — 파싱 전에 잘라 냄 |
| fsc-explain | 금융위원회 설명자료 | RSS | 600KB | 같음 |
| mohw-press | 보건복지부 보도자료 | RSS(RFC-822 GMT) | 2MB | 이 RSS 경로는 명시 Allow, 상세 `/board.es` 는 Disallow → 링크만 기록(원문 스냅샷 불가 → 새 글 후보에서 관찰로 강등) |
| mpm-press | 인사혁신처 보도자료 | RSS(ISO +0900) | 600KB | 상세 `/board/board.do` Disallow, `/board/rss.do` 허용. 본문 전문 100건 |
| moel-policy | 고용노동부 정책자료 | RSS(dc:date) | 2MB | `/rss/` 허용 |
| moel-lawinfo | 고용노동부 입법·행정예고 | RSS | 2MB | 같음 |
| moel-notice | 고용노동부 공지·공고 | RSS | 2MB | 같음(대부분 채용 공고라 금융 필터에서 빠짐) |
| nts-press | 국세청 보도자료 | 목록 HTML 1쪽(`YYYY.MM.DD.`) | 2MB | Allow /. 국세청은 RSS 가 없음 — 하루 1회 목록만 |
| moel-press | 고용노동부 보도자료 | 목록 HTML 1쪽 | 600KB | `/news/` 허용. 보도자료 RSS 없음 |
| gtrends-kr | 구글 트렌드 KR 일간 RSS | RSS(PDT) | 2MB | 탐색(explore) 화면만 robots 차단, RSS 허용. **신호 전용**: +10 부스트·헤드라인 게이트에만 쓰고 제목을 보고서에 싣지 않음 |
| lawdrf (선택) | 국가법령정보 공동활용 DRF | XML | 1MB | Allow /. env `LAW_OC` 가 있을 때만 1회. 없으면 `키 없음 — 건너뜀` |

공공기관 누리집 자료는 각 기관 저작권 정책(공공누리 등)을 따른다. 이 도구는 **제목·링크·날짜(사실 정보)만** 기록하고 본문·첨부를 복제하지 않는다.

## 환경변수

| 이름 | 용도 | 없을 때 |
|---|---|---|
| `LAW_OC` | 국가법령정보 공동활용(open.law.go.kr) 무료 등록 ID. 최근 7일 공포된 대상 법령(소득세법·조세특례제한법·고용보험법·근로기준법·최저임금법·국민연금법·국민건강보험법·공무원보수규정·남녀고용평등법·근로자퇴직급여 보장법과 각 시행령·시행규칙) 감시 | 건너뜀(보고서에 `키 없음 — 건너뜀`) |

- 키는 **환경변수로만** 읽는다. 저장소·로그·보고서에 절대 쓰지 않는다(`lib/http.mjs` 의 `redactUrl` 이 OC·key·auth·authKey·serviceKey·crtfc_key 값과 ECOS 경로 키를 `***` 로 가림).
- 키가 든 URL 은 https 가 아니면 요청 자체를 거부한다.

## 점수와 추천

점수(0~100) = 자료 종류(고시·공포 40 / 보도자료 32 / 설명자료 24 / 입법·행정예고 20 / 통계·공고 16)
\+ 최신성(24시간 20 / 72시간 12 / 7일 6) + 20 × 클러스터 수요 등급 + 공식 일정 창 ±7일 10 + 구글 트렌드 부스트 10.

추천은 위에서부터 먼저 걸리는 것:

1. `ignore` — 12개 클러스터에 안 맞거나 제외 주제(주식·코인·펀드·전망·정치·연예·스포츠·사고·사망·범죄·재난·보건·복권·신용점수·금리 순위 등)
2. `watch` — 발표 후 31일 초과
3. `update-existing` — 클러스터의 **정본 데이터 발표**(최저임금 고시·보험료율 결정·봉급표 확정·기준소득월액 상·하한 조정 등). 정본 발표는 새 글이 아니라 허브 갱신
4. `watch` — 통계·현황 자료
5. `update-existing` — 새 글 대상이 아닌 클러스터(세법 개정·근로장려금·육아휴직, `briefEligible=false`)이고 허브가 있음
6. `watch` — 새 글 대상이 아닌 클러스터인데 연결 페이지가 없음
7. `watch` — 점수 55 미만 또는 발표 후 7일 초과
8. `update-existing` — 기존 가이드·페이지 제목 유사도 0.5 이상 + 같은 연도
9. `watch` — 원문 상세 페이지가 robots 차단(스냅샷 불가)
10. `new-brief` — 나머지

3·5 가 7 보다 앞선 이유: 허브 갱신은 새 URL 을 만들지 않는 유지보수 권고라 새 글 기준(7일·55점)을 적용하지 않는다. 대신 31일 창 안에서만 권고한다.

## 클러스터 12종 (`clusters.json`)

`minimum-wage` · `social-insurance-rates` · `civil-servant-pay` · `tax-law-amendment` · `year-end-tax` · `earned-income-credit` · `bok-base-rate` · `national-pension` · `parental-leave` · `unemployment-benefit` · `retirement-pension` · `household-loan-policy`

- `hubRoutes` 는 실행 시와 테스트에서 `src/app/<route>/page.tsx` 실존을 검사한다(없으면 설정 오류 → 종료 코드 1).
- `demandWeight` 는 운영자 네이버 서치어드바이저 30일 상위 30(검색어·웹문서) 카테고리 비중을 **거친 등급**(0.3/0.5/0.7/1.0)으로만 옮긴 값이다. 원수치는 저장소에 두지 않는다.

## 공식 일정 (`calendar-events.json`)

2026-09-26 에 법령·공식 페이지로 직접 확인한 일정만 둔다: 최저임금 결정·고시(최저임금법 §8·§10), 근로장려금 반기·정기 신청(조특법 §100의6, 소득세법 §70), 기준소득월액 고시·적용(국민연금법 시행령 §5), 건강보험료율 결정(국민건강보험법 §73 — 시기는 관행), 예산안 제출 기한(국가재정법 §33)·의결 기한(헌법 §54②), 한국은행 2026년 통화정책방향 결정회의(8회).

운영자 확인 대기(`dropped`): 연말정산 간소화 서비스 개통일(1/15 — 공식 페이지 미확인), 한국은행 2027년 회의 일정(공개 후 추가).

## 제외한 소스와 이유 (다시 넣지 말 것)

| 소스 | 이유 |
|---|---|
| 네이버 데이터랩(Data Lab) 검색어 트렌드 API | 2026-07-30 신규 신청 마감. **네이버 API HUB 가입 절대 금지.** 코드·환경변수 이름도 두지 않는다 |
| 네이버 검색 API(뉴스·블로그) | 약관상 AI 입력·캐시·수익 화면 표시 제한 → 제외 |
| 네이버·구글 검색 결과 페이지 수집 | 약관·robots 위반 — 금지 |
| 구글 트렌드 탐색(explore) 화면·비공식 엔드포인트 | robots 차단 — 공개 RSS 만 사용 |
| 정책브리핑(korea.kr) RSS·목록 자동 조회 | RSS 는 2026-07-01 저작권 보호를 이유로 폐지. 목록 자동 조회로 대체하지 않는다(개별 기사 링크를 인용 출처로 쓰는 것은 발행기 몫) |
| 연합뉴스 등 언론사 RSS | 비상업 개인 이용만 허용 — 광고 수익 사이트라 제외. 뉴스 본문·이미지는 어떤 경로로도 수집 안 함 |
| 금감원 금융상품통합비교공시 오픈API | 약관상 실시간 링크만 허용·복제·저장 금지 — 정적 생성 사이트와 맞지 않음 |
| 기획예산처 누리집 | robots 가 홈만 허용 — 자동 수집 안 함 |

## 자원 사용량 (Windows 11, 16GB, Node 22 — 2026-09-26 실측)

| 모드 | 시간 | 요청 | 받은 양 | 메모리(RSS) |
|---|---|---|---|---|
| `--fixtures` | 약 0.5초 | 20(가짜, 법령 표본 포함) | 약 50KB | 약 75MB |
| `--live`(키 없음) | 약 25초(금융위 RSS 가 가장 느림) | 19 | 약 1.3MB | 약 70MB |
| `--check-robots` | 약 3초 | 8 | 수 KB | — |

의존성 없음(Node 22 내장 fetch·TextDecoder·crypto). tsx 도 쓰지 않는다.

## 공용 모듈 계약

- `lib/http.mjs` — `createHttp({fetchImpl, now, sleep, maxRequests=20, perHostGapMs=1000, log, allowHosts})` → `get(url, {maxBytes, accept})` → `{status, text, bytes, ms, finalUrl}`. 순차 요청·호스트별 간격·요청 상한(`CapError`)·스트리밍 크기 상한(`SizeError`)·리다이렉트 3회·네트워크 오류 1회 재시도·키 URL https 강제. 로그는 `[radar] GET host/path status bytes ms` 한 줄(경로는 `redactUrl` 통과, 헤더·본문은 안 찍음). 발행기·감시기도 이 계약을 쓴다.
- `lib/robots.mjs` — `isAllowed(url, {http, ua})` → `{allowed, rule}`. 최장 일치·`*`·`$`, 실행별 호스트 캐시. robots.txt 가 404 면 허용, 5xx·타임아웃·기타는 차단.
