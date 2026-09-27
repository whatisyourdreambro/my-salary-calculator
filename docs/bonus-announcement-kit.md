# 성과급 지급률 확정 공지 키트 — 1~2월 런북

> 운영자 2026-09-27 승인 6: "1~2월 성과급 발표 때 samsung-bonus / sk-hynix-bonus / hyundai-bonus 설명문(description)에
> '지급률 확정(날짜, 회사 공지)' 구절을 회사별로 한 번 덧붙인다. 키트는 지금 잠든 상태로 준비한다."
> 코드: `src/data/bonusAnnouncements.ts` · 테스트: `src/lib/__tests__/bonusAnnouncements.test.ts` · 배포: 2026-09-27 브랜치 `claude/r8-bonus-announce-kit-20260927`(휴면, 출력 바이트 동일).

## 1. 지금 상태 (휴면)

- 세 항목 모두 `{ confirmed: false, rateLabel: null, date: null, source: null }`.
- 세 페이지의 description·og·twitter·JSON-LD description·공유 설명이 4ef59a4b 와 같다(테스트 + 프리렌더 HTML·RSC 대조).
- 꼬리 구절은 **meta description 과 그 복사본(JSON-LD·공유 설명)에만** 붙는다. 화면 문장·H1·광고 위 문구는 건드리지 않으므로 광고 위치가 바뀌지 않는다
  (테스트가 `PAGE_DESC` 를 description 자리 밖에서 쓰지 못하게 막는다).

## 2. 켜는 날 (회사 공지가 나온 날, 동결기 11/1~1/31 에도 가능 — 문자열·데이터만, 새 URL 없음)

1. **출처 확인**: 회사 공지(사내 공지 원문을 인용한 보도 포함)로 지급률 확정을 확인한다. 추정·전망 보도는 쓰지 않는다. 확인한 URL 을 커밋 본문에 적는다(보도면 '보도 기준').
2. **한 항목만 채운다** — `src/data/bonusAnnouncements.ts` 에서 해당 회사 줄의 네 칸을 한 번에:
   ```ts
   "samsung-bonus": { confirmed: true, rateLabel: "2026년 OPI", date: "2027-01-27", source: "https://…" },
   ```
   - `rateLabel`: 무엇의 지급률인지 이름만(12자 이하, 숫자·%·괄호·'지급률' 금지). 수치는 계산기 데이터 파일(opiData·psData 등) 갱신 몫이다.
   - `date`: 회사 공지일(KST). 2027-01-01 ~ 2027-02-28 밖이면 테스트가 실패한다.
   - 결과: description 끝에 ` 2026년 OPI 지급률 확정(1/27, 회사 공지).` 가 한 번 붙는다.
3. **삼성 OPI 라면** `src/data/opiAnnouncement.ts`(홈 1월 배너 OPI 슬롯)도 같은 공지로 채운다 — 별도 파일·별도 줄.
4. **게이트**: `npx vitest run src/lib/__tests__/bonusAnnouncements.test.ts` · `npx tsc --noEmit` · `node scripts/ad-audit.mjs --diff --base origin/main`(ERROR 0 / WARN 0) · `npm run build` →
   바뀐 페이지 프리렌더 HTML 에서 `<meta name="description"` 끝의 구절 1회 확인 · `npm run verify:autoads`(소실 0%).
   화면 문장을 바꾸지 않으므로 adpos 는 해당 1쪽 4폭 동일 확인만.
5. **알림**: `npx tsx scripts/season-announce.ts event E10`(삼성) / `E11`(SK하이닉스·현대차) 목록대로. 이 세 URL 은 sitemap lastmod 손잡이가 `bonus-engine`(공유 날짜)이라
   사이트맵 diff·[indexnow] 에 나오지 않는다 — 'diff 밖 수동 요청'으로 네이버 수집 요청 1개.
6. **피드**: R4-RSS(rss-tables, `TABLES_FEED_META`)가 main 에 들어온 뒤라면, 이 세 URL 이 피드 메타에 설명문을 따로 들고 있는지 확인하고 같은 커밋에서 맞춘다.
7. 운영자 '메인 푸시' → cf-purge → 운영 HTML 에서 구절 확인(브라우저 UA, `?cb=`). 푸시·CF 성공·퍼지 시각을 `docs/ad-experiments.md` 3(c)에 적는다.

## 3. 끄는 법 · 저절로 꺼지는 날

- 되돌리기: 해당 줄을 `{ confirmed: false, rateLabel: null, date: null, source: null }` 로 되돌려 배포.
- 빌드 날짜가 **2027-03-31 을 넘으면** 구절이 붙지 않는다 — 4월 이후 첫 배포에서 저절로 빠진다(그 전에 배포가 없으면 계속 보인다).
- 공지일보다 이른 빌드에서는 붙지 않는다 — 날짜를 미리 채워 둬도 새지 않는다.

## 4. 규칙 (R6-07 성과급 키트와 같은 선)

- 회사 하나에 한 번만(한 시즌 한 번). 같은 설명에 두 번 붙지 않는다(멱등).
- 설명 변경은 주 3개 이하, 사건 하나에 회사 하나. 날짜 기반 일괄 교체 금지. 23개 계산기 Client.tsx 무접촉.
- 참고: 구절은 설명문 **끝**에 붙으므로 검색 결과 스니펫 길이(한글 약 80~90자)를 넘는 부분은 잘려 보일 수 있다
  (종전 길이 samsung 96 · sk-hynix 126 · hyundai 111자 + 구절 약 30자). 앞쪽 배치는 승인 범위 밖이라 하지 않는다.
