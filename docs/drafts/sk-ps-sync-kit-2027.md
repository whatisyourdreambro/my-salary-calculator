# SK하이닉스 PS 타결(재협상 합의·총투표 가결) 동기화 키트 — 5점 + D0~D+3 런북

- 작성: 2026-09-05 (revenue-10x-plan L13b ①, plan-gap-critic-4). **문서만 사전 작성 — 코드는 아무것도 바꾸지 않았다.**
- 목적: SK하이닉스 노사가 재협상 타결(새 잠정합의 → 총투표 가결)을 발표하면, 운영자가 보도 링크 한 줄만 주면 **한 커밋**으로 사이트 5곳의 "부결·재협상 중" 표기를 확정 문안으로 전환한다.
- 현재 상태(2026-09-05 `main` 262ef99): `psData.ts AGREEMENT_2026.status = "rejected"` (2026-08-25 총투표 부결, 92f2b81·dd37a15 반영). 라인 번호는 이 시점 기준 — 실행일에 각 파일의 "grep 앵커"로 재검색해 라인을 다시 잡는다(`git log -1 -- <파일>` 로 그 뒤 변경 여부 확인).
- 이 키트에 **수치는 없다.** 새 합의의 인상률·현금/주식 비율·이연 구조는 보도 확인 전까지 어떤 값도 넣지 않는다(§5 데이터 추정 금지). 아래 `{…}` 자리는 전부 보도에서 채운다.

---

## 1. 트리거 정의

| 상황 | 행동 |
|---|---|
| 재협상 **잠정합의** 보도(복수 언론 2곳 이상 동일 내용) | §2 동기화 5점 중 ①·②·④ 만 — `status`는 `"tentative"`로, 수치는 새 합의안으로. 총투표 전이므로 "타결" 문구 금지 |
| **총투표 가결** 보도(사측·노조 공식 발표 또는 복수 언론) | §2 동기화 5점 전부 — `status = "ratified"`. §3 런북 D0 시작 |
| 총투표 **재부결** | `status`는 `"rejected"` 유지, `voteNote`·`SOURCES`에 2차 부결 사실만 추가. 나머지 4점은 날짜·문구만 |
| 보도가 1곳뿐이거나 수치가 매체별로 다름 | **배포 보류.** 운영자에게 차이점을 보고하고 정본 확정 후 진행 |

**이번 커밋에서 절대 건드리지 않는 것**
- 광고 컴포넌트·광고 배치·쿠팡 코드 — 무접촉. `node scripts/ad-audit.mjs --diff` ERROR 0·WARN 증가 0 으로 증명.
- `src/app/calc/samsung-bonus/**` — 별개 작업(9/21 이후 슬롯).
- `PS_HISTORY` 2026 행 추가·`PI_2026.h2` 확정값 — 2027-01~02 별도 체크포인트(psData.ts 헤더 캘린더). 타결 반영과 섞지 않는다.

---

## 2. 동기화 5점 (grep 앵커 포함)

각 행의 "앵커"는 `grep -n` 으로 그대로 찾을 수 있는 현재 문자열이다.

| # | 파일 | 현재 라인 | grep 앵커 | 바꿀 것 |
|---|---|---|---|---|
| ① | `src/app/calc/sk-hynix-bonus/psData.ts` | L25 | `status: "rejected" as AgreementStatus` | `"ratified"`(가결) / `"tentative"`(잠정합의). **이 한 줄이 page.tsx·Client.tsx·StockScenarioSimulator 문구를 일괄 전환**한다 |
| ①-b | 〃 | L26~27 | `agreedDate: "2026-08-20"` / `voteNote:` | `agreedDate` = 새 잠정합의일, `voteNote` = 가결 표결 수치(보도값 그대로) |
| ①-c | 〃 | L29~37 | `wageIncreasePct: 6.3` / `newSplit: { cashNowPct: 40, stockNowPct: 40, stockYear1Pct: 10, stockYear2Pct: 10 }` / `appliesFrom:` | 새 합의가 비율·이연·인상률을 바꿨으면 **보도값으로만** 교체. 바뀌지 않았으면 그대로 |
| ①-d | 〃 | L115 / L129 | `export const SOURCES` / `export const LAST_UPDATED = "2026-08-26"` | `SOURCES` 배열 끝에 `{ outlet, date, fact }` 1행 추가(매체명·일자·사실 요지만, 본문 인용 금지) · `LAST_UPDATED` = 배포일. `article:modified_time`·`dateModified`(page.tsx L231·L247)는 이 값을 자동 사용 |
| ② | `src/app/calc/sk-hynix-bonus/page.tsx` | L47~66 | `STATUS === "ratified"` | `"ratified"` 분기 문자열 3개(PAGE_DESC·STATUS_BADGE·STATUS_SENTENCE)가 **"현금 40%+자사주 60%"를 하드코딩** — 새 합의가 비율을 바꿨으면 이 문자열들을 보도값으로 수정. 비율 동일하면 무수정 |
| ②-b | 〃 | L73·L152·L285·L293·L340·L401·L557 | `STATUS === "rejected"` | 자동 전환(무수정). 단 L285 주석·L340·L401의 비-분기 본문에도 `40% + 자사주 60%` 리터럴이 있으므로 비율 변경 시 함께 교체 |
| ②-c | `src/app/calc/sk-hynix-bonus/Client.tsx` | L287~290 · L409~410 | `AGREEMENT_2026.status === "rejected"` | 자동 전환. `"(잠정합의 기준 · 2026년 성과급부터)"` 등 else 분기가 "타결" 표현이 아니므로 가결 시 문구 검토(선택) |
| ③ | `src/data/bonusData.ts` | L228~236 (sk-hynix 프로필, `year: 2026, scheme: "PS"` 행) | `2026-08-25 총투표 부결(전임직 반대 50.08%·25표 차) — 노사 재협상 중` | `note` 뒷문장을 "→ {가결일} 총투표 가결(찬성 {n}%)·{새 합의 요지}"로, `source`에 매체·일자 추가. 이 프로필의 `sourceFile`은 `psData.ts` — 새 % 수치가 있으면 psData.ts에 먼저 있어야 `verify-bonus-data.mjs` 통과 |
| ④ | `src/data/bonusCalcHub.ts` | L49 · L275~ | `hook: "잠정합의안 8/25 총투표 부결·재협상 중 — 신구 체계 비교 시뮬"` / `export const BONUS_NEWS_2026` | 허브 카드 `hook` 을 타결 문구로 교체 + `BONUS_NEWS_2026` 맨 위에 `{ date, text, href: "/calc/sk-hynix-bonus" }` 1행 추가(기존 8/25 부결 행 L287 형식 그대로) |
| ⑤ | `src/app/sitemap.ts` | L39 | `'/calc/sk-hynix-bonus': { lastModified: new Date('2026-08-26'), priority: 0.9 }` | 날짜 = 배포일. L40 `/calc/bonus-calculators` 도 ④ 변경 시 같이 갱신. 주석 블록(L31~36)에 한 줄 추가. `npx tsx scripts/verify-sitemap.ts` WARN 0 확인 |

**부수 확인(5점 밖, 문구만)**
- `src/lib/guides/semiconductor-bonus-news-2026-09.ts` L16 체크포인트 주석대로 1·2·4편 본문(부결·재협상 서술)을 타결 서술로 — 게시글 본문은 별도 커밋 가능(갱신 후 `gen-guides-meta` 재실행 규칙은 `guidesContent` 정본에만 해당하므로 이 파일은 해당 없음 — 실행 전 확인).
- `docs/growth-playbook-2026.md` §3 "8월 말 ★SK하이닉스 임단협" 행 뒤에 타결 반영 완료 행 추가(운영자 지시 시).

---

## 3. 런북 D0 ~ D+3

| 시점 | 단계 | 실행 | 완료 판정 |
|---|---|---|---|
| D0 −0h | 보도 확인 | 복수 언론 2곳 이상에서 동일 사실(가결 여부·표결 수치·현금/주식 비율·인상률) 확인. 매체별 수치 상이 시 **중단·보고** | 매체 2곳 이름·일자 기록 |
| D0 +0~1h | 상수 갱신 | §2 ①→③→④→⑤ 순서로 편집(①이 먼저여야 ③ 검증 통과). ②는 비율 변경 시만 | `node scripts/verify-bonus-data.mjs` exit 0 · `npx tsc --noEmit` exit 0 · `npx vitest run` 전부 통과 · `node scripts/ad-audit.mjs --diff` ERROR 0·WARN 불변 · `npx tsx scripts/verify-sitemap.ts` WARN 0 (exit 코드 직접 확인, 파이프 금지) |
| D0 +1h | 배포 | 커밋 메시지에 "광고 무접촉" 명기 → main 푸시(운영자 허용 워크플로) → Cloudflare Pages 빌드 완료 확인. 배포 마커 = 새 `LAST_UPDATED` 문자열이 `/calc/sk-hynix-bonus` HTML 에 나타나는지(CSP 헤더는 마커로 쓰지 않음) | 프로덕션 HTML에서 `마지막 갱신 {배포일}` 확인 |
| D0 +1~2h | CF Purge | dash.cloudflare.com → Caching → Configuration → **Purge Everything**(또는 Custom purge: `/calc/sk-hynix-bonus`·`/calc/bonus-calculators`·`/sitemap.xml`·`/rss.xml`) — 운영자 콘솔 작업 | 시크릿 창에서 배너 문구가 "타결"로 보임 |
| D0 +2h | GSC URL 검사 | Search Console → URL 검사 → `https://www.moneysalary.com/calc/sk-hynix-bonus` **색인 생성 요청** → `/calc/bonus-calculators` 도 동일. Sitemaps → sitemap.xml "다시 제출". (IndexNow는 postbuild 자동 — CF 빌드 로그 `[indexnow]` 확인) | GSC "요청 접수" 표시 2건 |
| D+1 | 확인 | GSC URL 검사 "실제 URL 테스트"로 렌더된 제목·설명이 타결 문구인지 확인 · GA4 실시간에서 `/calc/sk-hynix-bonus` 유입 이상 없음 · 카카오 공유 미리보기(디벨로퍼스 캐시 초기화) 문구 확인 | 3항목 체크 |
| D+3 | 리포트 갱신 | `/insights/bonus-payout-history-2026`(reportsRegistry.ts·bonusData.ts 기반) 재생성 결과 확인 — ③이 반영됐으면 리포트 본문의 SK하이닉스 2026 행 note가 타결 문구로 바뀌어야 함. 임베드 위젯(`/widget/*`)은 캐시 헤더 만료 후 확인 | 리포트 페이지·위젯 문구 일치 |

**D+3 이후(별도 커밋)**: 2027-01 PI H2 확정 → `PI_2026.h2` · 2027-01~02 PS % 확정 → `PS_HISTORY` 2026 행 + `bonusData.ts` 2027 행 + `verify-bonus-data.mjs` — psData.ts 헤더 캘린더 그대로.
