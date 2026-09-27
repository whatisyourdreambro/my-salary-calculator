# 2027 봉급표 D-Day 런북 (R6-03) · 2027 Pay-table D-Day runbook

작성 2026-09-27 · 계획 문서: `docs/traffic-masterplan-2026-10.md` 의 R6-03 · 도구: `scripts/pay-official-parse.mjs`

인사혁신처가 2027 공무원 봉급표를 게시하면 **24시간 안에** 확정 숫자를 사이트에 올리는 절차입니다.
숫자는 손으로 옮기지 않습니다. 원문 HTML 표를 파서로 읽고, 파서를 쓸 수 없으면(이미지·HWP 뿐) 두 번 따로 입력해 차이 0을 확인합니다.

- 누가: Claude 가 1~7단계와 게이트를 하고, 운영자는 **'메인 푸시'** 한마디와 수집 요청(네이버 10개 이하, GSC 3개 이하)만 합니다.
- 언제: 12/20 부터 매일 감시. 날짜와 무관한 절차라 1월로 밀려도 그대로 씁니다.
- 동결기(11/1~1/31) 안이지만 **허용되는 작업**입니다. 바꾸는 것은 데이터(`PAY_FULL_2027`)·상수·문자열뿐이고, 새 URL·새 컴포넌트·광고 변경은 0입니다.

---

## 0. 전제 (D-Day 전에 main 에 있어야 하는 것)

| 무엇 | 언제 main 에 | 이 런북에서 쓰는 곳 |
|---|---|---|
| r2-l2: `src/lib/payTablesFull2026.ts`, `src/lib/payTablesFull2027.ts`(`PAY_FULL_2027 = null`, `validatePayFull2027`), 2027 교사·경찰·소방 3쪽, 테스트 `payTablesFull2027`·`pay2027ConfirmedSlot` | 10/14 09:10 예약 배포 | 4·5단계 |
| R4-RSS: `src/lib/rssTablesFeed.ts`(`TABLES_FEED_META`, 2027 봉급 3쪽을 `FEED_PATHS` 로 옮김), `rssTablesFeed.test.ts` | 10/16 | 6단계 |
| b2-civilpay(공무원 실수령 계산기) | 10/20 | 게이트 |
| **R6-3**: `/civil-servant-pay-2027` 광고 위 확정 문구 변형(`PAY_2027_CONFIRMED` 로 선택, 꺼진 동안 바이트 동일, 폭 맞춤) + 교원·경찰·소방 확정 문구 1,123폭 증명 | 10/28 | 5단계 |
| 이 키트(파서·픽스처·이 문서) | R6-1 푸시(10/4) | 2~4단계 |
| r6-announce 등록부 `docs/season-urls-2026-27.json` + `scripts/season-announce.ts` | R6-1 푸시(10/4) | 9단계 |
| A35 자동 퍼지(cf-purge.yml 시크릿 3개) | 9/28 운영자 콘솔 | 8단계 |

하나라도 빠졌으면: 빠진 것 없이 할 수 있는 부분만 합니다. 예) R6-3 이 없으면 `/civil-servant-pay-2027` 은 맨 끝 일반직 확정표·Dataset 만 나오고 광고 위 문구는 예상 상태 그대로 둡니다(폭 증명 없는 문구 교체 금지).

---

## 1. 감시 (12/20 부터 매일 09:00·18:00 KST)

확인할 곳 — 숫자의 근거는 **1차 출처만** 인정합니다.

1. 인사혁신처 봉급표 페이지: `https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2027/` (탭에 '2027년'이 생기고 표가 보이면 **T0**)
2. 인사혁신처 누리집 → 알림 → 보도자료: '2027년 공무원 보수' 인상률 발표(`commonRate` 의 근거)
3. 전자관보(gwanbo.go.kr): 공무원보수규정 일부개정령(대통령령) 공포
4. 국가법령정보센터(law.go.kr) 웹 화면: 공무원보수규정 [별표 3]·[별표 10]·[별표 11] 시행 2027-01-01 판. **Open API(OC 키)는 쓰지 않습니다 — 가입 없음.**

- 참고: 2026 표는 대통령령 제36013호(2026-01-02 일부개정, 2026-01-01 적용)였습니다(`payTablesFull2026.ts` 머리 주석). 국무회의 의결 → 관보 공포 → 인사혁신처 표 게시 순서라 연말연시에 걸칠 수 있습니다.
- 뉴스·블로그 기사는 **감지 신호로만** 씁니다. 기사 속 숫자는 넣지 않습니다.
- 감지는 R5 레이더 보고 전용 모드로만 합니다(R6-04). 발표를 감지해도 1단계 원문이 뜨기 전에는 아무것도 바꾸지 않습니다.

## 2. 저장 (5분)

1. 브라우저로 1번 페이지를 열고 **다른 이름으로 저장 → 웹 페이지, HTML만** 으로 저장소 **밖**에 둡니다.
   예) `C:/Users/ruby1/moneysalary-exports/pay-official/mpm2027-YYYYMMDD.html`
2. 저장 시각(KST)과 해시를 적어 둡니다(커밋 본문에 넣음):
   `node -e "console.log(require('crypto').createHash('sha256').update(require('fs').readFileSync(process.argv[1])).digest('hex'))" <파일>`
3. 표가 그림·HWP·PDF 뿐이면 → **4-B 두 번 입력** 으로 갑니다.

## 3. 파싱·검증 (15분)

Git Bash 에서, 저장소(작업 워크트리) 루트에서:

```sh
export MSYS_NO_PATHCONV=1
OUT=C:/Users/ruby1/moneysalary-exports/pay-official
PREV=scripts/__tests__/fixtures/pay-official/mpm-2026.html

# (a) 파서가 배포된 2026 모듈과 여전히 같은지 — '모든 칸 일치' 여야 함
node scripts/pay-official-parse.mjs $PREV --against-module
echo "exit=$?"

# (b) 2027 파싱 + 2026 대비 검증 + JSON 보관(저장소 밖)
node scripts/pay-official-parse.mjs $OUT/mpm2027-YYYYMMDD.html --prev $PREV --json $OUT/pay-2027.json
echo "exit=$?"

# (c) 붙여넣을 조각만 파일로(보고서는 화면)
node scripts/pay-official-parse.mjs $OUT/mpm2027-YYYYMMDD.html --prev $PREV --emit-ts > $OUT/pay-2027-fragment.txt
echo "exit=$?"
```

- 종료 코드는 `echo "exit=$?"` 로 **바로** 읽습니다. `| tail` 같은 파이프 뒤에서 읽지 않습니다(파이프가 코드를 가림).
- 세 번 모두 `exit=0` 이어야 합니다. 1 = 검증 실패, 2 = 사용·입력 오류.
- 파서가 보는 것: 호봉 1부터 빈틈없는 오름차순, 금액 100원 단위, 호봉이 오르면 금액도 오름, 빈 칸은 열 끝에만, 교원 40행, 2026 과 같은 행 수·빈 칸 위치, 모든 칸 ≥ 2026, 연도 2027 > 2026, 전부 같으면 실패(같은 표를 다시 저장한 경우).

**손 확인 (반드시 사람 눈으로):**

1. 출력의 `[anchors]` 4칸 — 9급 1호봉 · 경사 1호봉 · 경감 1호봉 · 교원 9호봉 — 을 열어 둔 원문 표에서 하나씩 찾아 같은지 봅니다.
2. `[prev]` 줄의 **최빈 인상률**이 인사혁신처 보도자료의 2027 공무원 보수 인상률과 같은지 봅니다(2026 은 3.5%, 1호봉 부근 저연차는 더 높았음). 다르면 멈추고 보도자료를 다시 읽습니다. `commonRate` 는 **보도자료의 공통 인상률** 이지 최빈값이 아닙니다.
3. 출력의 연도가 2027 인지 봅니다.

**실패하면:**

- 표를 못 찾음 → 페이지가 아직 다 뜨지 않았거나 구조가 바뀜. 1시간 뒤 다시 저장. 계속 실패하면 4-B.
- 모양이 2026 과 다름(행·계급·빈 칸 위치) → **멈춤.** `validatePayFull2027` 도 2026 모양을 요구하므로 동결기에 코드 없이 넣을 수 없습니다. 아무것도 올리지 않고 운영자에게 알립니다(예상 상태 유지, 2월 구조 창에서 처리).
- 어느 칸이 2026 보다 작음 → 원문 표를 다시 확인. 원문도 작으면 멈추고 운영자에게 알립니다.

## 4-B. 두 번 입력 (원문이 그림·HWP·PDF 뿐일 때, +60~90분)

1. 2026 JSON 을 뼈대로 두 빈 입력 파일을 만듭니다(숫자는 모두 0 → 남은 0 은 검증에서 걸림):
   ```sh
   node scripts/pay-official-parse.mjs $PREV --json $OUT/pay-2026.json
   node -e "const d=require(process.argv[1]);for(const k of ['teacher','policeFire','general'])d[k]=d[k].map(r=>r.map((v,i)=>i===0||v===null?v:0));d.year=2027;require('fs').writeFileSync(process.argv[2],JSON.stringify(d,null,1))" $OUT/pay-2026.json $OUT/typed-a.json
   cp $OUT/typed-a.json $OUT/typed-b.json
   ```
2. **서로 다른 두 번의 입력**으로 A·B 를 채웁니다(다른 세션·다른 사람, 서로 보지 않기). 모양: `teacher` = `[호봉, 금액]`, `policeFire` = `[호봉, 순경, 경장, 경사, 경위, 경감, 경정, 총경, 경무관, 치안감, 치안정감]`, `general` = `[호봉, 9급, 8급, …, 1급]`, 없는 호봉은 `null`.
3. 대조 + 검증 + 조각:
   ```sh
   node scripts/pay-official-parse.mjs --compare $OUT/typed-a.json $OUT/typed-b.json --prev $PREV --emit-ts > $OUT/pay-2027-fragment.txt
   echo "exit=$?"
   ```
   한 칸이라도 다르면 `exit=1` 과 칸 목록이 나옵니다. 원문을 보고 **틀린 쪽만** 고쳐 0 이 될 때까지 반복합니다.
4. 3단계의 손 확인 1~3을 똑같이 합니다.

## 5. 붙여넣기 (15분) — `src/lib/payTablesFull2027.ts` 한 곳

```ts
export const PAY_FULL_2027 = {
  commonRate: 0.0XX, // 인사혁신처 보도자료의 2027 공무원 보수 공통 인상률(확정)
  basis: "2026년 12월 XX일 국무회의 의결, 2027년 1월 1일 적용", // 40자 이내, 원문에서 확인한 사실만
  sourceUrl: "https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2027/",
  checked: "YYYY-MM-DD", // 원문 대조일 = 배포일(KST)
  // ↓ $OUT/pay-2027-fragment.txt 그대로
  teacher: [ … ],
  policeFire: [ … ],
  general: [ … ],
} as PayFull2027 | null;
```

- `as PayFull2027 | null` 는 그대로 둡니다(파일 주석: 리터럴로 좁혀지면 확정 분기가 깨짐).
- 파서는 `src/` 에 아무것도 쓰지 않습니다. 조각 파일 내용을 편집기로 붙입니다(숫자를 고쳐 쓰지 않음).
- `payTablesFull2026.ts` 는 건드리지 않습니다.
- **공무원 2027 문구 전환(R6-3 상수):** `PAY_FULL_2027` 이 null 이 아니면 `PAY_2027_CONFIRMED` 가 true 가 되어 R6-3 의 확정 변형이 자동으로 골라집니다. R6-3 이 남긴 숫자 자리표시자 상수(같은 모양 자리표시자)는 파서 출력(앵커 값)과 `commonRate` 로 채웁니다. 상수 이름·위치는 R6-3 커밋 본문과 파일 머리 주석을 따르고, **10/29 드라이런에서 이 줄에 실제 이름을 적어 둡니다.** 12월 제목안은 10/30 B20 판정이 고른 것을 씁니다.
- 교원·경찰·소방 2027 제목·설명은 이 D-Day 에만 바뀝니다(r2-l2 의 확정 문구, R6-3 에서 폭 증명 완료).

## 6. 피드 메타 맞추기 (10분) — `src/lib/rssTablesFeed.ts`

- 봉급 2027 피드 4개(`/civil-servant-pay-2027`, `/teacher-pay-2027`, `/police-pay-2027`, `/firefighter-pay-2027`)의 `TABLES_FEED_META` title·description 을 확정 상태 페이지 metadata 문자열과 **똑같이** 다시 복사합니다.
- `npx vitest run src/lib/__tests__/rssTablesFeed.test.ts` 가 어긋난 항목을 알려 줍니다. 0이 될 때까지.
- title·description 은 현재 길이 이하, og:title = title (R6-04 규칙).

## 7. 게이트 (약 40분 + 스윕 30분) — 종료 코드를 바로 읽기

```sh
npx tsc --noEmit
npx vitest run src/lib/__tests__/payTablesFull2027.test.ts src/lib/__tests__/pay2027ConfirmedSlot.test.ts src/lib/__tests__/payTableSnippets.test.ts src/lib/__tests__/rssTablesFeed.test.ts
npm test
node --test scripts/__tests__/*.test.mjs
npm run verify:tax
npm run verify:site
npm run verify:sitemap
node scripts/ad-audit.mjs --diff --base origin/main   # ERROR 0 / WARN 0
npm run build                                         # 2027 봉급 4쪽은 계속 정적(○)
npm run verify:autoads                                # 0.0% 손실
```

- 병렬 작업이 있으면 무거운 명령(build·vitest 전체)은 잠금 실행기(lockrun)로 하나씩 돌립니다.
- `payTableSnippets.test.ts` (5)는 2027 페이지가 예산안 수치를 '확정 전'으로만 말하는지 봅니다. R6-3 이 두 상태 모두 통과하게 고쳐 두었어야 합니다 — 확정 상태에서 깨지면 R6-3 결함이므로 멈춥니다.
- **광고 위치 스윕(1,123폭):** 두 서버를 띄웁니다 — A = `origin/main` 빌드, B = 후보 빌드(`next start`). 폭 320~1440 을 1px 마다 + 1536 + 1920, 768 미만은 모바일 문맥, 페이지를 다시 읽지 않고 뷰포트만 바꾸며, 모든 `.ad-container` 의 top(px, 반올림)과 개수를 비교합니다. localhost 밖 요청은 모두 막습니다. 도구: R4 의 `sweepcompare.mjs`(세션 스크래치 — 없으면 이 설명대로 다시 만듦).
  - 대상: 봉급 6쪽 `/civil-servant-pay-2026`, `/civil-servant-pay-2027`, `/teacher-pay-2026`, `/police-pay-2026`, `/firefighter-pay-2026`, `/military-pay-2026` + 이날 바뀌는 `/teacher-pay-2027`, `/police-pay-2027`, `/firefighter-pay-2027`.
  - 기대: **9쪽 모두 1,123폭에서 광고 top 차이 0.** 확정표는 마지막 광고 아래에 붙으므로 문서 높이만 광고 아래에서 늘어납니다.
  - 차이가 하나라도 있으면 푸시하지 않습니다. 원인 문구를 폭 맞춤하거나, 맞출 수 없으면 광고 아래 데이터(확정표·Dataset)만 내보내고 광고 위 문구는 예상 상태로 둡니다.

## 8. 배포 (15분)

1. 운영자에게 결과 표(게이트·스윕·앵커 4칸·인상률)를 보여 주고 **'메인 푸시'** 를 받습니다.
2. `git push origin HEAD:main` (main 만, 브랜치 푸시 금지).
3. cf-purge: A35 가 켜져 있으면 cf-purge.yml 이 CF 배포 뒤 자동 퍼지. 아니면 운영자가 Cloudflare Purge Everything.
4. 마커(브라우저 UA + `?cb=<n>`, 옛 빌드에는 없는 것):
   - `/civil-servant-pay-2027`: `<title>` 에 '확정' 있음·'예상' 없음(R6-3), HTML 에 `id="general-full-table"`
   - `/teacher-pay-2027`: `id="teacher-full-table"` · `/police-pay-2027`: `id="police-full-table"` · `/firefighter-pay-2027`: `id="fire-full-table"`
5. `node scripts/health-check.mjs`
6. 푸시·CF 성공·퍼지 시각을 `docs/ad-experiments.md` 2026-09-25 절 3(c) 공변량 표에 적습니다(문서 커밋).

## 9. 알리기·기록 (15분)

1. 바뀐 URL 목록 = `npx tsx scripts/season-announce.ts diff` 의 lastmod 변경 집합(= CF 빌드 로그 `[indexnow]` 목록). 변화 없는 URL 은 올리지 않습니다.
2. 운영자: 네이버 서치어드바이저 → 요청 → 웹 페이지 수집, **바뀐 URL만 10개 이하** (보통 2027 봉급 4쪽 + 링크 문구가 바뀐 2026 봉급 4쪽).
3. 운영자: Google Search Console URL 검사 → 색인 요청 **3개 이하**: `/civil-servant-pay-2027`, `/teacher-pay-2027`, `/police-pay-2027`.
4. 등록부 행: `docs/season-urls-2026-27.json` 의 E7(봉급표 D-Day) 행 상태를 완료로, 날짜를 배포일로. `npx tsx scripts/season-announce.ts check` 0.
5. `docs/metrics-log.md` 에 한 줄(T0, 배포 시각, 24시간 안 여부).

---

## 시간 예산 (T0 부터 24시간 안)

| 단계 | 예상 | 드라이런 실측(10/29 기록) |
|---|---|---|
| 1 감지 → 2 저장·해시 | 5분 | |
| 3 파싱·검증·손 확인 | 15분 | |
| (4-B 두 번 입력 시) | +60~90분 | |
| 5 붙여넣기·R6-3 상수 | 15분 | |
| 6 피드 메타 | 10분 | |
| 7 게이트(빌드 포함) | 40분 | |
| 7 스윕(기준 빌드 + 9쪽 × 1,123폭) | 30분 | |
| 8 '메인 푸시' → CF 배포 → 퍼지 → 마커 | 15분 | |
| 9 수집 요청·기록 | 15분 | |
| **손 작업 합계** | **약 2시간 25분** (두 번 입력 시 약 4시간) | |

- T0 가 밤이면 다음 날 오전에 끝내도 24시간 안입니다.
- 1/1 빌드(`CURRENT_MINIMUM_WAGE_YEAR` 전환, 요율 연도 등 E8)와 **같은 푸시에 묶지 않습니다.** D-Day 가 12/31~1/2 이면 두 푸시를 따로, 각자 게이트를 돌립니다.

## 되돌리기 (Rollback)

- 언제: 마커가 퍼지 30분 뒤에도 안 보임, health-check 실패, 숫자 오류 제보, CF 빌드 실패, 운영 화면에서 광고 위치가 달라 보임.
- 어떻게:
  1. `git revert --no-edit <D-Day 커밋>` → `PAY_FULL_2027 = null` 로 돌아가 모든 페이지가 예상 상태로 돌아갑니다.
  2. 빠른 게이트: `npx tsc --noEmit`, 7단계 vitest 4종, `npm run build`, `npm run verify:autoads`.
  3. 운영자 '메인 푸시' → 퍼지 → 반대 마커 확인(`/teacher-pay-2027` 에 `id="teacher-full-table"` 없음).
- 급하면 운영자가 Cloudflare Pages 대시보드에서 직전 배포로 Rollback 할 수 있습니다. 이 경우에도 main 에 되돌림 커밋을 넣어야 다음 빌드가 다시 올리지 않고, 퍼지는 손으로 합니다.
- 한 칸만 틀렸으면 손으로 고치지 말고 원문을 다시 저장해 3단계부터 다시 합니다(새 커밋).

## 10/29 드라이런 (푸시 없음)

목적: 절차가 실제로 도는지, 단계별 시간이 얼마인지 재고, 5단계의 R6-3 상수 이름을 적어 둡니다.

1. 10/28 R6-3 푸시 뒤의 `origin/main` 에서 작업 워크트리를 만들고(node_modules 연결), 시작 시각을 적습니다. **가짜 숫자는 이 워크트리 밖으로 나가지 않습니다.**
2. `node scripts/pay-official-parse.mjs scripts/__tests__/fixtures/pay-official/mpm-2026.html --against-module` → '모든 칸 일치'.
3. 연습용 파싱: 2026 픽스처를 '새 표', 2025 픽스처를 `--prev` 로 3단계 (b)(c) 를 그대로 돌립니다(앵커 4칸 = 2,133,000 · 2,472,100 · 2,698,600 · 2,495,600).
4. 가짜 2027 표 만들기(분명히 가짜 — 2026 × 1.035 를 100원 올림) 후 4-B 대조 경로로 조각 만들기:
   ```sh
   node scripts/pay-official-parse.mjs scripts/__tests__/fixtures/pay-official/mpm-2026.html --json $OUT/dry-2026.json
   node -e "const d=require(process.argv[1]);for(const k of ['teacher','policeFire','general'])d[k]=d[k].map(r=>r.map((v,i)=>i===0||v===null?v:Math.ceil(v*1.035/100)*100));d.year=2027;require('fs').writeFileSync(process.argv[2],JSON.stringify(d))" $OUT/dry-2026.json $OUT/dry-fake-2027.json
   node scripts/pay-official-parse.mjs --compare $OUT/dry-fake-2027.json $OUT/dry-fake-2027.json --prev scripts/__tests__/fixtures/pay-official/mpm-2026.html --emit-ts > $OUT/dry-fragment.txt
   ```
5. 5단계대로 붙이고(`basis: "드라이런 가짜 숫자"`), R6-3 상수를 채우고, 6단계 피드 메타를 맞춥니다. **5단계의 R6-3 상수 이름과 파일 위치를 이 문서에 적습니다.**
6. 7단계 게이트 전부 + 9쪽 스윕. 로컬에서 `/teacher-pay-2027` 을 열어 확정표가 마지막 광고 아래에 있는지, `/civil-servant-pay-2027` 제목에 '확정'이 있는지 봅니다.
7. 단계별 시간을 위 '시간 예산' 표의 실측 칸에 적고(문서 커밋만), 워크트리를 지우고(`git worktree remove --force`), `$OUT/dry-*` 파일을 지웁니다.

---

## English steps (same numbering)

Goal: publish the official 2027 pay tables within 24 hours of the Ministry of Personnel Management (MPM) posting them. Numbers are never hand-copied: parse the official HTML, or, if the table is image/HWP/PDF only, transcribe it twice independently and require zero differences. This is a data/constants/strings change, so it is allowed during the 11/1–1/31 structural freeze (no new URLs, no ad changes).

0. **Prerequisites on main:** r2-l2 (10/14: `payTablesFull2026.ts`, `payTablesFull2027.ts` with `PAY_FULL_2027 = null`, three 2027 pages, tests), R4-RSS (10/16: `TABLES_FEED_META`), b2-civilpay (10/20), R6-3 (10/28: confirmed copy variants for `/civil-servant-pay-2027` selected by `PAY_2027_CONFIRMED`, width-proven), this kit (R6-1, 10/4), r6-announce registry (10/4), A35 auto purge. If R6-3 is missing, ship only the below-the-last-ad table and Dataset; keep the copy above ads in the forecast state.
1. **Watch from 12/20, daily 09:00 and 18:00 KST:** the MPM page `https://www.mpm.go.kr/mpm/info/resultPay/bizSalary/2027/` (T0 = the 2027 tab shows the tables), MPM press releases (the 2027 common raise = `commonRate`), the Official Gazette (gwanbo.go.kr), and the law.go.kr web view of 공무원보수규정 [별표 3·10·11]. No law.go.kr Open API key, no sign-up. News is a trigger only, never a number source.
2. **Save** the MPM page with a browser as "HTML only" outside the repo (e.g. `C:/Users/ruby1/moneysalary-exports/pay-official/`). Record fetch time (KST) and SHA-256 for the commit body. Image/HWP/PDF only: go to 4-B.
3. **Parse and validate** (commands in section 3): run `--against-module` on the 2026 fixture (must report a full match), then parse the saved 2027 page with `--prev scripts/__tests__/fixtures/pay-official/mpm-2026.html`, `--json` (outside repo) and `--emit-ts`. Read each exit code directly (0 pass, 1 validation failure, 2 usage/input error). Hand-check the four anchors (9급 1호봉, 경사 1호봉, 경감 1호봉, 교원 9호봉) against the official page, check that the modal raise matches the announced common raise, and that the year is 2027. A shape change versus 2026 means stop: publish nothing and tell the operator.
4-B. **Double entry** (image/HWP/PDF only): build two zero-filled skeletons from the 2026 JSON, fill them in two independent passes, then `--compare a.json b.json --prev <2026 fixture> --emit-ts`. Fix only the wrong side until the exit code is 0. Do the same hand checks.
5. **Paste** into `src/lib/payTablesFull2027.ts`: `PAY_FULL_2027 = { commonRate, basis (≤ 40 chars), sourceUrl, checked, …fragment } as PayFull2027 | null`. The parser never writes into `src/`. Fill the R6-3 number placeholders from the parser anchors and `commonRate` (names recorded at the 10/29 dry run); the copy flips through `PAY_2027_CONFIRMED`. Use the December title chosen by the 10/30 B20 read.
6. **Feed meta:** recopy `TABLES_FEED_META` title and description for the four pay-2027 items from the confirmed page metadata; `rssTablesFeed.test.ts` must pass. Lengths no longer than today; og:title = title.
7. **Gates** (exit codes read directly): `npx tsc --noEmit`; vitest `payTablesFull2027`, `pay2027ConfirmedSlot`, `payTableSnippets`, `rssTablesFeed`; `npm test`; `node --test scripts/__tests__/*.test.mjs`; `verify:tax`, `verify:site`, `verify:sitemap`; `ad-audit --diff --base origin/main` ERROR 0 / WARN 0; `npm run build`; `verify:autoads` 0.0% loss; build-vs-build ad-top sweep at 1,123 widths (320–1440 every px, 1536, 1920; viewport resize without reload; all `.ad-container` tops and counts; non-localhost requests blocked) on the six pay pages (`/civil-servant-pay-2026`, `/civil-servant-pay-2027`, `/teacher-pay-2026`, `/police-pay-2026`, `/firefighter-pay-2026`, `/military-pay-2026`) plus `/teacher-pay-2027`, `/police-pay-2027`, `/firefighter-pay-2027`. Expect zero differences. Any difference: do not push.
8. **Deploy:** show the operator the gate table and wait for '메인 푸시'; `git push origin HEAD:main`; cf-purge (automatic with A35, otherwise the operator purges); markers with a browser UA and `?cb=<n>`: `/civil-servant-pay-2027` title contains 확정 and not 예상 plus `id="general-full-table"`, `/teacher-pay-2027` `id="teacher-full-table"`, `/police-pay-2027` `id="police-full-table"`, `/firefighter-pay-2027` `id="fire-full-table"`; `node scripts/health-check.mjs`; record push, CF success and purge times in `docs/ad-experiments.md` 3(c).
9. **Notify and record:** changed URLs only (`season-announce diff` = the `[indexnow]` list); Naver collection requests ≤ 10; GSC inspections ≤ 3; E7 registry row in `docs/season-urls-2026-27.json` marked done; one line in `docs/metrics-log.md`.

**Timing budget:** about 2 h 25 min hands-on (about 4 h with double entry), inside T0 + 24 h. Never bundle with the 1/1 build.

**Rollback:** `git revert` the D-Day commit (restores `PAY_FULL_2027 = null`), quick gates, operator '메인 푸시', purge, negative marker check. In an emergency the operator can roll back the Cloudflare Pages deployment, but the revert must still land on main and the purge is then manual. Never hand-edit a wrong cell; re-save and re-parse.

**10/29 dry run (no push):** worktree from `origin/main` after R6-3; `--against-module` full match; rehearse parsing with the 2026 fixture as "new" and 2025 as `--prev`; make a clearly fake 2027 table (2026 × 1.035, rounded up to 100 won) and run it through `--compare … --emit-ts`; paste with `basis: "드라이런 가짜 숫자"`, fill R6-3 placeholders, sync feed meta; run every gate and the 9-page sweep; record step times and the R6-3 constant names in this document (docs-only commit); remove the worktree and the fake files.
