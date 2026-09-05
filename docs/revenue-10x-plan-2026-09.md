# 수익 10배 계획 2026-09 — 진단·검증 기반 정본

작성 2026-09-05. 10축 진단(57+10 에이전트, 레버별 적대적 검증 2~3표) 결과를 반영한 단일 정본.
기존 정본(`docs/revenue-masterplan-2026-09.md`, `docs/growth-proposals*.md`, `docs/ad-experiments.md`)의 결정 대기·게이트·불변 규칙은 그대로 유효하며, 이 문서는 그 위에서 **"무엇을 어떤 순서로, 어떤 근거로"** 를 확정한다.

후속 정본(100배 산술·기둥·승인 A~J): `docs/revenue-100x-plan-2026-09.md` (2026-09-05) — 이 문서의 §2-3 실행 현황에 배치 1(B1~B14)·후속 대기 행을 반영.

---

## 0. 결론 (한눈)

| 항목 | 값 |
|---|---|
| 기준선 | 하루 $10~20 (운영자 2026-09-03) ≈ 월 40~85만원 |
| 목표 | 10배 = 하루 $100~200 ≈ 월 420~840만원 |
| 산술 | 수익 = 세션 × PV/세션 × RPM/1000 + CPA. RPM 레버 총합 상한 ×2~2.5, PV/세션 ×1.3~1.5, CPA 일 $5~15 상한 → **10배는 세션 ×3~4 없이 불가** |
| 정직한 도달치 | 10/31 ×1.1~1.4 · 2027-03 평시 ×1.4~2.0 · 12개월 상한 ×2.5~4 (전부 추정, 근거 §6) |
| 10배 시점 | 세션 ×3~4를 만들 랜딩 확장(DART lite 397곳+)·구글 성과급 장르·네이버 관측이 2027-02 이후에만 가능 → **2027 하반기 이후, 12개월 내 확률 절반 이하** |
| 이 계획의 실제 산출 | ① 새고 있던 수익 회수(IN_ARTICLE 결손·앵커 미실행) ② 측정 기준선 확보(현재 분해식 값 전부 역산) ③ 시즌 자산 정합 ④ 세션 확장의 전제(색인 게이트·캐시·CPA 지면) — 세션이 늘었을 때 곱해질 분모를 10/31 전에 세우는 것 |

**병목은 코드가 아니라 실행이다.** 지난 3주 운영자 콘솔 작업 0/6 실행. 이 계획의 배수는 §4 세션표가 실행될 때만 성립하며, 미실행 시 배수는 27a692c 단독 ×1.05~1.15로 내려앉는다.

---

## 1. 지금 새고 있는 돈 3곳 (즉시 회수)

### 1-1. IN_ARTICLE 슬롯(3302558597)이 전 사이트에서 광고 요청을 못 하고 있다
- 원인: `src/components/AdPlacement.tsx` in-article 분기 `<ins>`에 width가 없어 flex 컨테이너에서 폭 0px → AdSense가 요청 자체를 안 함. 2026-05-13(24fae21) 이후 4개월 지속 추정. 프로덕션 실측(390px): 컨테이너 358px, ins 0×0, iframe 0.
- 도달: 199/209 라우트. 홈·/salary 211·/monthly 105의 **결과 직하** 유닛 포함. 8/30 홈 결과직하 부활(232bc56)도 실송출 0 추정.
- 수정: 커밋 **27a692c**(운영자 승인 9/4, 테스트 127/127, ad-audit 0)가 브랜치 `claude/fix-inarticle-ins-zero-width-20260904`에만 존재, **main 미병합**. 커밋 본문이 "실험 #1 미판정이라 병합 보류"를 적고 있어 운영자 한 줄이 필요.
- 근거로 병합 가능: 실험 #1 비교 창(8/3~8/16 vs 8/17~8/30)은 과거이고 두 창 모두 결함 상태라 상대 비교는 유효. 9/2 전면최적화(광고 107라우트 순증)가 #1 미판정 상태에서 이미 배포된 관행 있음.
- 효과: RPM ×1.05~1.15 (검증 보정치, 추정). 하루 $0.75~2.25 회수. **확정은 병합 후 AdSense 광고단위 3302558597 행 첫 7일 노출로.**
- 조건: 병합일 = 기준선 리셋일로 `docs/ad-experiments.md` 기록. 배포 24h 내 DOM 확인(ins width>0·data-ad-status 세팅·iframe≥1). 9/13·9/17 관찰은 병합일 경계로 구간 분리.

### 1-2. 앵커 광고가 3주째 꺼져 있다 (콘솔 토글, 코드 0줄)
- 8/16 콘솔팩 §1 ☐, 8/30·8/31 프로덕션 미노출 재확인.
- 효과: 모바일 RPM +8~15%(잠식 반영) × 모바일 비중 → 전체 ×1.03~1.10 (검증 보정치, 추정). 마스터플랜 +15~25%는 상단치.
- **켜기 전 선행 3개**: ① §12-2 ⑪ InstallPwaBanner 앵커 감지 수리(FloatingShareBar 3중 감지를 `src/lib/bottomAdDetect.ts`로 공유, BottomSheet·토스트에도 적용) ② 현재 자동광고 설정 패널 캡처(비네트 ON/OFF·신규 트리거·최대 광고 수·동적 앵커·사이드레일) ③ 9/17 전면최적화 D+14 판정 종료. → **ON 시점 9/21**, 판정 10/5(클릭<50이면 10/19).
- 규칙: 밀도 하향·비네트 변경은 같은 슬롯에 넣지 않는다(귀속 불가). 앵커 ON 시 **사이드레일·동적 앵커 명시 OFF**(재제안 금지 항목). 판정은 "형식별 행 앵커 수익 > 인페이지 감소분 AND 정책 경고 0 AND Active View 비하락".

### 1-3. 측정이 없어서 모든 판정이 멈춰 있다
- AdSense 페이지별/광고단위 보고서 제공 0회 → 실험 #1(8/17) 미판정 → #2a·A2·A3·A4·⑦ 전부 정지.
- GA4 맞춤 측정기준 미등록(소급 불가, 매일 손실), 데이터 보관 2개월 기본 가능성, GA4↔AdSense 링크 미연결, GA4 소스/매체·네이버 서치어드바이저·GSC 커버리지·쿠팡 subId·LinkPrice u_id 리포트 전부 0회.
- **실험 #1 소급 판정의 현실**: AdSense '페이지' 보고서는 최근 30일 고정이라 8/3~8/16 페이지 RPM은 소급 불가. 소급 가능한 축은 **'광고 단위' 보고서(맞춤 기간 가능)** 뿐 → display-2(8284703133) 후 창 단독 수입 > 0 AND result(5584143639)·fluid 비잠식으로 판정. 판정 불가면 "현상 유지"(revert 아님 — 규칙 변경이라 운영자 승인 필요). 후 창에 대상군 접촉 커밋 12건(948ce7c·021d335·13b7c62 등)이 섞여 페이지 RPM 축은 어차피 무효.

---

## 2. 분해식 현재값과 상한

### 2-1. 실측 갱신 (2026-09-05 운영자 제공 AdSense 일별 CSV, 리포 밖 보관)

| 창 | 일 수익 | 일 PV | 페이지 RPM | 노출/PV | Active View | 일 클릭 |
|---|---|---|---|---|---|---|
| 6월 | $5.95 | 2,287 | $2.60 | 2.9 | 69.6% | 134 |
| 7월 | $6.96 | 2,146 | $3.25 | 3.5 | 67.2% | 220 |
| 8/3~8/16 (실험 #1 전) | $8.52 | 2,403 | $3.55 | 4.3 | 60.4% | 258 |
| 8/17~8/30 (실험 #1 후) | $10.36 | 2,962 | $3.50 | 4.3 | 59.1% | 316 |
| 8/24~8/30 | $10.50 | 3,225 | $3.26 | 4.7 | 55.6% | 317 |
| **8/31~9/4** | **$19.21** | **4,363** | **$4.40** | **5.3** | **53.5%** | **443** |

읽는 법: 6월→9월 페이지 RPM ×1.7은 **PV당 노출이 2.9→5.3으로 늘어난 결과**(자동광고+수동 유닛 순증)이고, 그 대가로 뷰어빌리티가 70%→53%로 떨어졌다. 노출 RPM은 $0.8~1.0에서 제자리. 즉 "광고를 더 넣어 RPM을 올리는" 길은 이미 상당 부분 소진됐고, 다음 밀도 증가는 뷰어빌리티 하락(입찰가 하락)으로 상쇄될 위험이 크다 — 앵커(설계상 100% 뷰어블)·위치 이동(⑦)·채움률 회수(27a692c)가 남은 RPM 레버인 이유. 8/31~9/4 급등은 PV(현대차·기아 타결 뉴스, 9월 시즌)와 RPM이 함께 오른 것.

GA4 개요(1/1~9/5): 활성 사용자 18.0만, 페이지 제목별 조회 1위 삼성전자 성과급 계산기(2개 제목 합 8.8만, 1월 OPI 시즌 포함), 홈 1.2만, 회사 DB 목록 1.2만, 회사 페이지는 개별 700~4,200으로 롱테일. → 단일 최대 자산은 **/calc/samsung-bonus**(구글·GA4 모두), 회사 축은 합으로 큰 롱테일.

### 2-1-b. 수동 광고 단위 vs 자동광고 분해 (2026-09-05 운영자 제공 2번째 CSV — 필터 미표기, **수동 광고 단위 합계로 추정**: 2025-11-27 시작 = 첫 수동 유닛 생성일과 일치, 유닛 목록 캡처와 정합. 9/7 광고단위 CSV로 확정)

| 창 | 수동(추정) 일 수익 | 수익 점유 | 노출 점유 | 클릭 점유 | 수동 CTR | 수동 CPC | 수동 노출 RPM | 나머지(자동광고 추정) 노출 RPM | 나머지 CTR | 나머지 CPC | 수동 노출/PV | 나머지 노출/PV |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 6월 | $0.90 | 15% | 30% | 36% | 2.40% | $0.019 | $0.45 | $1.09 | 1.85% | $0.059 | 0.87 | 2.02 |
| 7월 | $1.11 | 16% | 29% | 40% | 4.09% | $0.013 | $0.52 | $1.09 | 2.48% | $0.044 | 1.00 | 2.50 |
| 8/1~16 | $1.37 | 16% | 26% | 40% | 3.81% | $0.014 | $0.53 | $0.98 | 2.03% | $0.048 | 1.11 | 3.10 |
| 8/17~30 | $2.02 | 19% | 34% | 48% | 3.51% | $0.013 | $0.46 | $0.99 | 1.93% | $0.051 | 1.47 | 2.84 |
| 8/31~9/4 | $2.63 | 14% | 24% | 28% | 2.24% | $0.021 | $0.48 | $0.94 | 1.81% | $0.052 | 1.26 | 4.05 |

읽는 법(추정 전제):
1. **수익의 81~86%는 자동광고**에서 나온다. 수동 유닛 821슬롯(9/2 기준)이 만드는 수익은 하루 $1~2.6. 8/15 이후 진행된 수동 슬롯 순증·Display2 확산·Multiplex 배치는 전부 이 14~19% 조각 위의 작업이었다. 자동광고 설정(앵커·형식·밀도)이 코드보다 큰 레버라는 결론이 수치로 확인됨.
2. **수동 유닛 클릭의 단가가 4배 낮다**(CPC $0.013~0.021 vs $0.044~0.059) — CTR 은 4~5%(7월·8월 초)로 디스플레이 통상치(0.5~1.5%)의 3~5배. "높은 CTR + 극저 CPC"는 우발 클릭(광고가 버튼·입력·결과 카드 등 상호작용 요소 옆에 있어 잘못 눌림)에 구글이 단가를 깎는 전형 패턴. 7/13~8/23 사이 수동 CTR ≥4% 인 날이 33일. 8/25 이후 2.2~2.9%·CPC $0.021 로 완화(부활 팩·전면최적화로 하단 유닛 비중 증가 추정). **정책 리스크(무효 트래픽)와 단가 하락이 동시에 걸린 항목** — 어느 유닛인지는 9/7 광고단위 CSV로 특정(의심 1순위: 결과 직하 CalcResultAd·계산기 입력부 인접 유닛).
3. **수동 유닛은 페이지뷰당 1.0~1.5회만 노출**된다(페이지당 4~6유닛인데). 뷰포트 진입 시에만 요청하는 lazy 구조에서 대부분의 하단 유닛은 보이지 않는다 → 슬롯 수 순증의 한계 효용이 낮은 이유. 자동광고는 PV당 2.0(6월)→4.05(9월)로 두 배 — 뷰어빌리티 70→53% 하락의 주범.
4. 자동광고 노출 RPM 은 밀도 2배에도 $1.09→$0.94(−14%)에 그쳐 PV당 자동광고 수익은 $2.2→$3.8/1,000PV 로 순증 — 밀도 하향(P0-2)은 급하지 않다. 앵커는 새 인벤토리(뷰어빌리티 100%)라 여전히 1순위.
5. 실험 #1(8/17) 주간에 수동 노출 2,760→4,273/일(+55%, /monthly·/table·인덱스 Display2)로 수동 점유 24→41%, 수동 수익 +55%($1.36→$2.11) — 사이트 수익 +19%. 대상군 판정은 광고단위 축(9/7).

코드에서 확인한 우발 클릭 의심 배치(9/7 CSV로 특정 전): 홈 `SalaryCalculator.tsx:461-467` — NextActions(버튼) → ResultAd → RelatedCalculators(링크) 사이에 광고가 끼어 있음 · `SalaryResultCard.tsx:80` InArticleAd 가 결과 카드와 '공제 상세'(Info 아이콘) 사이 · `SimpleCalculatorView.tsx:205` CalcResultAd 결과 직하 · `samsung-bonus/page.tsx:377-379` 계산기(SamsungBonusClient) 직하 InArticleAd. 수리 방향(승인 항목): 광고 위·아래 상호작용 요소와 최소 간격 확보(모바일 wrapper margin), 광고 라벨 유지, 위치 이동은 유닛 수 불변으로.

→ 이 분해가 확정되면 다음 광고 작업의 순서가 바뀐다: ① 우발 클릭 의심 유닛 간격·위치 수리(승인 항목으로 승격) ② 앵커 ON ③ ⑦ 위치 이동 ④ 인피드. 사이드바·Multiplex·표 분할 같은 '수동 유닛 추가'류는 기대치를 수익 14~19% 조각 기준으로 재산정(각 ×1.00~1.01).
- 정적 검출 게이트 가동(2026-09-05, 100배 계획 B13): `scripts/ad-audit.mjs` 5)·6) INFO — 기준선 인접 41 / 헤더가림 4. 헤더가림 4곳(/job·/job/[slug]·/industry·/industry/[slug], 91라우트)은 광고 컴포넌트 외부 래퍼 `pt-[var(--header-height)]` 로 수리 가능(§2-1 허용 범위)하나 승인 항목으로 분류 — 승인 대기 목록에 '⑮ 헤더 가림 4곳 래퍼 상단 패딩' 후보로 등재 제안(=100배 계획 §6-A). 인접 41건은 9/7 CSV·운영자 눈 확인 후 간격 수리만 승인 큐(콘솔팩 세션 1 ③).

### 2-2. 분해식 현재값과 상한

| 인수 | 현재(실측/역산) | 상한 | 근거 |
|---|---|---|---|
| RPM | **$4.4** (8/31~9/4 실측) | ×1.5~2 = $7~9 | 노출/PV 5.3·뷰어빌리티 53%로 밀도 여력 소진. 앵커·⑦ 이동·27a692c 회수·시즌 단가로만. 종전 가정($1.5~4)보다 높아 세션 배수 요구는 그만큼 낮아짐 |
| PV/세션 | 1.5~2 (역산) | ×1.3~1.5 | 계산기 이용 후 이탈 구조. GA4 세션 실측은 9/13 |
| 세션 | 일 2,200~2,900 (PV 4,363 역산) | 채널 제약 | 구글 일 ~10클릭(3개월 비브랜드 33클릭). 네이버가 사실상 전부이나 GA4 소스 실측 0회(9/13). 네이버 외부사이트 점유 9.5%·AI 브리핑 2026년 말 40% 확대 = 구조적 하방 |
| CPA | 일 $0~1 | $5~15 | 활성 오퍼 2종(신용조회, 건당 수천 원). 카드·증권·대출비교 머천트가 LinkPrice에 있어야 상한 도달 |
| 구글 | 일 10클릭 | 12개월 일 100~300클릭 | 회사 연봉·연봉계산기 머리쿼리는 잡플래닛·사람인·인크루트 독점. 이길 수 있는 장르 = 성과급 계산기(경쟁 pages.dev/vercel 개인 도구, 삼성 5위) |

---

## 2-3. 실행 현황 (2026-09-05, 운영자 "계획대로 순차적으로 진행" 승인)

| 레버 | 상태 | 비고 |
|---|---|---|
| L01 27a692c 병합·배포 | ✅ main 병합·푸시 | 기준선 리셋일 = 배포일. 배포 후 24h 내 프로덕션 DOM(ins 폭>0·iframe≥1) 확인 → §4 |
| M04 ad_filled/ad_unfilled 계측 | ✅ 배포 | AdPlacement.tsx 관찰자 + analytics.ts + 소스 스캔 테스트. GA4 맞춤 측정기준 등록(세션 1) 전엔 이벤트 수만 보임 |
| A3 ⑪ 하단 고정 UI 앵커 감지 | ✅ 배포 | `src/lib/bottomAdDetect.ts` 공유. InstallPwaBanner fail-closed(4초 유예·1초 폴링·영구 양보), BottomSheet 하단 여백, FloatingShareBar 동일 로직 이관. 토스트 8곳(2.8초)은 후속 |
| L09a RSS 소스·autodiscovery | ✅ 배포 | 로컬 실측: 피드 200건 pubDate 전부 2026-08-23, 회사 페이지 `<link rel=alternate type=application/rss+xml>` 2건. /en 계열은 자체 alternates 로 미상속(허용). **서치어드바이저 제출은 세션 4(10/5), L10' 배포 후** |
| L08b health-check 주간 cron | ✅ 배포 | ci.yml schedule 월 00:00 UTC + workflow_dispatch, 5분 후 1회 재시도. 첫 실행 9/7(월) — 실패 시 GitHub 메일 |
| L12 건정심 키트 | ✅ 초안 | `docs/drafts/health-rate-2027-kit.md`. 9/8 운영자 한 줄 → 당일 1커밋 |
| L11a·L02' (운영자) | ☐ 9/7 세션 1 | `docs/operator-console-pack.md` 세션표 |
| L13a 시즌 배너·10월 세트 | ✅ 배포(2차) | `src/lib/seasonalCalendar.ts` 분리(now 주입·테스트 18+), 10월 항목(/year-end-tax-preview, 날짜 없음), 11~1월 → 2027 허브. 9월/10월 세트 상수 + 한 줄 스위치 3파일(`SeasonalLinks.tsx`·`seasonLinks.ts`·`HeaderSearch.tsx`) — **9/26 교체는 각 파일 한 줄**. 리뷰 발견: getDaysLeft 연도 경계(1월 초 D-365·9/26 D-0) → 지난 마감 null 로 수정 |
| L14'·M07 연말정산 클러스터 | ✅ 배포(2차) | relatedCalculators `yearEnd` 카테고리 신설(리뷰 발견: tax 끝에 붙이면 limit=4 라 도달 0) — 허브·/year-end-tax·공제 4종·R2 3종만 우선 소비, 다른 tax 페이지 4종 불변(테스트 고정). R2 3종 page 에 클러스터 탭(마지막 광고 아래). YEAR_END_STEPS 중복 1건→dependent-check 치환(16 불변). `src/lib/yearEndSeason.ts` 연도 상수(문자열 바이트 동일 증명) — 12/15 값 교체 |
| L18' sitemap 정합·게이트 | ✅ 배포(2차) | civil-servant-pay-2027·hyundai·kia lastModified 2026-09-03. verify-sitemap 신선도 WARN(마지막 커밋 해시·제목 동반, shallow clone 건너뜀) — 도입 시 24건은 광고·메타 횡단 커밋 포화, 콘텐츠 커밋만 override 갱신 |
| 분석 스크립트 | ✅ 배포(2차) | `scripts/adsense-report.mjs` window/join/units/exp1/--selftest — 9/7 광고단위 CSV 도착 시 units→exp1 순 |
| (발견) CI verify:tax 게이트 수리 | ✅ c365ce9 | `pension-hike-2027/Client.tsx` 리터럴로 8/30 이후 ci 워크플로 8회 연속 실패(후속 build·qa-crawl 전부 skip) — 정본 참조로 교체. 헬스체크 cron 알림이 의미를 가지려면 ci 가 녹색이어야 함 |
| **배치 1 (2026-09-05/06, 100배 계획 §4, 브랜치 `claude/100x-batch-20260905`)** | ✅ 배포 대기 — main 푸시 시점은 이 세션 | 광고 무접촉·승인 불요·samsung-bonus 4파일 무접촉. 배수 전부 ×1.00~1.01(계측·위생·피크 대비) — 프로젝션 합산 금지 |
| B1 metrics-ingest.mjs + docs/metrics-log.md | ✅ 배포 대기 | gsc-coverage·ga4-sources·log 서브커맨드 + --selftest(exit 0 필수), 첫 행 2026-09-05 집계. 9/13 세션 2 번들부터 사용, AdSense 는 adsense-report.mjs 결과를 텍스트로 넘김. 원본 CSV 는 리포 밖(§8-8) |
| B2 rss.xml 리포트 3편 | ✅ 배포 대기 | [코드] rss.xml 에 /insights 리포트 3편 합류(guid=/insights/<slug>, pubDate=updatedDate, 채널 pubDate=가이드·리포트 max) + listed-avg-salary updatedDate 를 DART 스냅샷일(dartReportStats.dataDate)과 max()로 파생 — 회귀 테스트 src/lib/__tests__/rssInsights.test.ts. 세션 배수 계상 없음(위생·인용 경로). 10/5 RSS 제출 전 '데이터 리포트' category item 3건 확인(콘솔팩 세션 4) |
| B3 siteDates 단일 상수·lastUpdated 파생·Dataset citation·DART 병기 | ✅ 배포 대기 | WebApplication dateModified=STATIC_LAST_MODIFIED 단일 상수, 회사 lastUpdated=max(데이터일·2026-07-06 연금상한 반영·DART 주입일), 회사 Dataset citation(DART/알리오)+'추정치 포함' 문구, 수기 disclosed↔DART 5% 초과 괴리 시 DART 산정치 인라인 병기(100배 계획 F9·F10, 수기 우선 유지). 배수 0(신선도 신호) |
| B4 주석 정정 | ✅ 배포 대기 | next.config 캐시 주석 '프리렌더 미적용'·robots.ts 네이버 68%·CF 관리 블록 각주 — 코드 동작 무변경 |
| B5 PWA manifest(id 고정·utm·바로가기) | ✅ 배포 대기 | retention-pv-5: 바로가기 연말정산 → /year-end-tax(기존 /year-end-tax-2026=종소세 5월 가이드 오매핑 수정)·start_url /?utm_source=pwa&utm_medium=homescreen·sw.js CACHE_NAME msy-static-v2. 수익 직접 배수 ×1.00(계측·수리 레버) — PV-04 재방문 분해의 전제. src/app/year-end-tax-2026/page.tsx 는 수정 불필요(manifest 가 오류였음). 함정은 아래 메모 |
| B6 공유 utm | ✅ 배포 대기 | plan-gap-critic-3: src/lib/shareChannels.ts withUtm(url, source, medium="share") 순수 함수 신설, ShareButtons·FloatingShareBar·카카오 피드 홈 버튼에 채널별 utm_source={kakao\|webshare\|copy\|instagram\|naver_blog\|facebook\|x\|band\|line\|telegram\|threads}&utm_medium=share. canonical/OG 는 pathname 기준 유지(색인 중복 없음). 직접 배수 0(측정 레버) — direct 23.5% 분해 목적. 부작용: 커뮤니티 게시 링크가 referral 대신 copy/share 로 귀속 → 채널 비교 시 합산. 갱신 체크포인트: 10/5 세션 4(또는 11/2 월간 metrics-ingest) GA4 소스/매체 kakao / share·copy / share·webshare / share 행 비중 판정 — 9/13 은 7일치라 존재 확인만; 공유 코호트가 direct 절반 이상이면 공유 카피·OG 후속 레버(세션 +2~5% 이하) 검토 |
| B7 InternalLinkTracker | ✅ 배포 대기 | retention-pv-6: 루트 레이아웃 InternalLinkTracker(document 클릭 위임) + data-msy-module 11종(industry-rank·related-companies·company-connections·bonus-cluster·year-end-cluster·sibling-hubs·listed-band·job-related-calc·job-companies·job-pay-table·job-siblings). 새 이벤트 없이 guide_cta_click(position=모듈 id) 재사용 → 9/7 position 측정기준으로 분해. 미계측 잔여: 인근 연봉/월급 링크(salary-db/[id]/page.tsx)·SeasonalLinks·Footer(후속 배치에서 data-msy-module 추가). 판정: 9/13 은 7일치 상대 순위용, 실질 판정 D+28(10/5) |
| B8 위젯 utm_content | ✅ 배포 대기 | [계측] 임베드 호스트 utm_content 부착(shared.ts WIDGET_REFERRER_SCRIPT, 셸 6종+수기 2종) — 배수 ×1.0(측정 인프라, 100배 산술식 합산 금지), 수리/계측 분류로 28일 실험 창 미소진. 한계: no-referrer 호스트 미집계(href 무변경), 네이버 블로그는 임의 iframe 미허용, 위젯 엣지 캐시 s-maxage 86400 → 배포 후 최대 1일 지연. 10/5 GA4 '세션 수동 광고 콘텐츠'(utm_content) 캡처 → metrics-log widget_embed_hosts |
| B9 리포트 CSV/JSON + distribution | ✅ 배포 대기 | google-authority-1·5: /insights/<slug>/data.csv·.json 3+3(source/grade 열, 추정 표기 유지) + Dataset distribution/license(사이트 인용 정책 URL)/citation(DART). 링크는 insights layout PageFooterAds 아래만(본문 내 링크는 승인). 외부 라이선스(CC BY 4.0) 채택 여부 = 100배 계획 승인 I |
| B10 CompanyRelatedJobs(layout 광고 아래) | ✅ 배포 대기 | google-clusters-2: salary-db/layout.tsx PageFooterAds 아래 업종→직업 4건 링크 블록(클라이언트 컴포넌트, data-msy-module 귀속). 광고 위 높이 0 |
| B11 12/1·1/2 세트 + OPI 게이트 | ✅ 배포 대기 | SEASONAL_LINKS_DEC/JAN·SEASON_TOP_DEC/JAN·KO_CHIP_SETS.DEC/JAN 3파일, 교체는 12/1·1/2 각 한 줄(활성 세트 SEP 유지). src/data/opiAnnouncement.ts OPI_2026_ANNOUNCEMENT(발표 전 announced=false·rate/date/source null 강제, 테스트 불변식) + seasonalCalendar.ts 1/20~31 OPI 게이트 항목(requires:"opiAnnounced", 카드공제 앞). ★SeasonalBanner.tsx:18 게이트 연결 한 줄은 미적용(발표 런북 growth-playbook §3). 배너 순서 결정 = 승인 H. 상세 L13b·L18' 행 |
| B12 계산기 7종 데이터 모듈화 + SK 키트 | ✅ 배포 대기 | L13b ① 선행: lg-energy·naver·kakao·posco·lg-chem·hd-hyundai·samsung-sdi Client 인라인 상수 → data.ts + data.test.ts 동결값 14건 + verify-bonus-data.mjs Client+data.ts 합산 스캔 + docs/drafts/sk-ps-sync-kit-2027.md(5점·D0~D+3 런북). samsung-bonus 무접촉 |
| B13 ad-audit INFO 게이트 | ✅ 배포 대기 | adsense-quality-6: 우발 클릭 인접 후보 41·fixed 헤더 가림 후보 4(/job·/job/[slug]·/industry·/industry/[slug] HomeTopAd, 헤더 72px). INFO 전용·exit 불변·자동 수정 없음, --diff 는 신규 후보만. 수리는 승인(§2-1-b ①·100배 계획 §6-A)으로만 |
| B14 companyData 정합 | ✅ 배포 대기 | data-trust-6: companyData.ts 평균연봉 5개사(삼성 15,800·NAVER 14,600·카카오 10,900·현대차 13,100·LG엔솔 11,200) seedCompanies 수기 disclosed(2025 사업보고서)와 정합 — /company/compare 트리 표시값 일치. ×1.0(noindex 신뢰 수리). 연 1회 4월 동반 갱신(growth-playbook §4) |
| **후속 대기 (코드, 시점 게이트 — 배수 계상 없음, 100배 계획 §5)** | | |
| InstallPwaBanner PV 카운트 수리 | 대기(9/18~9/20 배포) | retention-pv-4: usePathname·리스너 즉시 등록·appinstalled 플래그·이벤트 2종. 9/17 전면최적화 D+14 판정 종료 후, 앵커 ON(9/21)과 다른 날 |
| 정본 회사 → lite 이웃 카드 | 대기(9/21 이후) | google-technical-7: RelatedCompanies 6칸 내 교체(카드 수 불변), 커버리지 스크립트 실측. 10/19 lite 색인 게이트 전 |
| 봉급표 5종 공식 별표 풀표 | 대기(12월 확정표 슬롯) | google-clusters-1: 1~32호봉 전체, 마지막 광고 아래 접힘 섹션, data.go.kr 파일 기반, 앵커 3값 검증. 2026·2027 이중 전사 방지를 위해 12월 한 번에 |
| _routes.json exclude(프리렌더 가족 Worker 우회 ≈1,050 URL) | 대기(9/21 L08a 와 같은 날 이후) | crawl-performance-1: middleware 우회 부작용(non-www 301·봇 403 상실 → CF 규칙 대체 확인)·RSC 프리페치 MPA 폴백·GA4 page_view 영향·TTL=규칙 B 동일·Purge 런북 |
| 수기 disclosed 7곳 2025 갱신 | 대기(결정 ⑤ 근거 첨부 후) | data-trust-3: 마스터플랜 P1 ⑤(수기 괴리·FY2024 잔존 7곳) 결정에 근거(출처 URL) 첨부 후 — 추정 금지. 표면 정합은 B3 DART 병기로 선처리 |
| peak-season-1~5 + L13b 본체 | 대기(9/21 이후 samsung-bonus 접촉 1회) | opiData.ts 단일 소스·FIXED_OPI1_RATE 치환·TAI H2 null 슬롯+라벨 파생+잔존 문자열 게이트(허용 목록)·ANNUAL_OP 잠정실적 상수(1/8 트리거, 히어로 기존 문장 치환)·공유 상태 URL 해시(d/s/p/y+o1/cr/ins, FloatingShareBar 동기)·시뮬레이터 2종 IO 지연 마운트(고정 min-height)+useDeferredValue. page.tsx:554 '월 기본급 대비' 문구 오기 정정 동봉(수치 무변경, 100배 계획 F11). 게이트: calcSamsungBonusNet 791/553/252%·MX 50% 회귀 테스트 선커밋, ad-audit --diff 0, 광고 위 높이 불변 증명, 10/31 동결 전. M01(9/20)·승인 D footer 와 한 번에 |

**배포 검증(2026-09-05 11:45 KST 전파 확인)**: 프로덕션 `rss-companies.xml` 200건 pubDate 2026-08-23 · 회사 페이지 rss+xml link 2건 · 배포 번들(chunk 1613)에서 in-article `<ins>` 스타일 `width:"100%",textAlign:"center"` 및 `ad_unfilled` 마커 확인. 실제 광고 iframe 생성은 임베디드 브라우저(IntersectionObserver 미발화)·Claude in Chrome(미연결)으로 관측 불가 → **확정은 9/7 광고단위 CSV의 3302558597 행**. 참고: `/salary/*` HTML 은 엣지 캐시(max-age 14400)라 배포 후 최대 4시간 이전 청크를 참조 — L08a 캐시 규칙 설계 시 배포 후 Purge 필수 근거. **정정(2026-09-05 실측)**: /salary/* 엣지 캐시 14400 은 CF 대시보드 규칙 기인(next.config headers() 가 아님). /calc·/salary-db·홈 HTML 은 DYNAMIC(max-age=0, must-revalidate) — next.config `s-maxage` 는 프리렌더 HTML 에 미적용. sitemap.xml·rss 2종도 DYNAMIC. §8-6 순서 규칙(캐시 L08a → 크롤 개방)의 근거.

**함정 메모(배치 1, 2026-09-05)**:
- ★`/manifest.webmanifest` 는 sw.js STATIC_EXACT cache-first — manifest 수정 시 `public/sw.js` CACHE_NAME 버전을 반드시 올릴 것(안 올리면 설치된 클라이언트에 영원히 미반영). Chrome 은 기존 설치의 start_url 변경은 재적용하지 않음(shortcuts·아이콘만 갱신) → utm 계측은 사실상 신규 설치분부터.
- `utm_medium=share` 는 GA4 기본 채널 그룹에서 Unassigned — 소스/매체 행으로만 읽고, 커뮤니티 referral 은 copy/share 로 일부 이동하므로 전월 비교 시 합산.

---

## 3. 레버 — 검증 통과분만 (기각·조건은 §7)

표기: [승인] = 광고/구조 승인 한 줄 필요, [코드] = 무승인 코드, [콘솔] = 운영자 콘솔. 배수는 검증 보정치·추정.

### Phase 1 — 즉시 (9/5~9/13)
| # | 레버 | 종류 | 효과 | 조건·게이트 |
|---|---|---|---|---|
| L01 | 27a692c main 병합·배포 | [승인①] | RPM ×1.05~1.15 | §1-1 조건. 병합 후 광고단위 3302558597 첫 7일 노출 확인 |
| M04 | ad_filled/ad_unfilled 계측 2줄(AdPlacement.tsx MutationObserver에 trackEvent) + GA4 주요 이벤트 4종 표시 | [승인②] | 0 (판정 인프라) | 광고 컴포넌트 내부 예외 — 독립 커밋·즉시 revert 구조·ad-audit 0. L07류 CLS 정비와 같은 파일이므로 분리 |
| A3 | §12-2 ⑪ 하단 고정 UI 앵커 감지 공유 유틸 (InstallPwaBanner·BottomSheet·토스트) | [승인③] | 0 (앵커 선행) | fail-closed(감지 실패 시 배너 미렌더). L01과 별도 커밋 |
| L09a | rss-companies.xml 소스 `allCompanies`→`companyRepository.getAll()` + `buildPageMetadata` alternates.types RSS autodiscovery 복원 | [코드] | 결함 회수(세션 ×1.0 계상) | 2차 정렬키 고정. 로컬 curl로 pubDate '23 Aug 2026'≥100·link 존재 확인(exit 코드 직접). **제출은 C4 배포 후**(§M08) |
| L08b | health-check.mjs 주간 cron(ci.yml schedule, 5분 후 1회 재시도) | [코드] | 꼬리 위험 제거 | GitHub 알림 메일 도착 1회 확인 |
| L12 | 9/8 건정심 2027 건보료율 키트 — 인상/동결 2분기 문안 사전 초안 | [코드] | 유지보수(배수 0) | 게이트: `tsc` exit 0 + `grep "2026 준용\|미확정"` 건보 행 0·장기요양/산재 행 유지 + health 상수 1곳↔카드↔배너 3점 대조. table/2027 4종 page.tsx·navConfig·Footer 포함. 운영자에게 총요율·근로자율 두 수치 받고 재검산. P8 계산기는 인상 의결 시 별도 승인 |
| L11a | GA4 데이터 보관 14개월 + 측정기준 5개(slot_kind·position·calc_type·offer_id·vertical) | [콘솔 9분] | 0 (소급 손실 차단) | 나머지 8개·AdSense 링크는 9/13·9/21로 분산 |
| L02' | AdSense **광고단위** CSV 2장(8/3~8/16·8/17~8/30) | [콘솔 10분] | 실험 #1 게이트 해제 + 3302558597 기준선 | 판정 광고단위 1축, 판정 불가→현상 유지(승인 ④). CSV 원본은 리포 밖 보관, 문서엔 집계만 |

### Phase 2 — 9월 하순 (9/13~9/30)
| # | 레버 | 종류 | 효과 | 조건·게이트 |
|---|---|---|---|---|
| L11b | 9/13 내보내기 번들: GSC 커버리지(전체+사유별)·28일 검색어/페이지/국가/기기·국가=미국 필터·외부링크 / GA4 트래픽 획득 소스·매체 28일 / AdSense 기기별 28일 | [콘솔 25분] | 0 (분모 확정) | 커버리지 내보내기 1,000행 상한 → 섹션 색인률은 표본치(9/13 GSC URL-prefix 속성 4개 추가로 섹션별 색인 수 직접 확인 — 사이트맵 분할 코드 대체). 10/19 lite 게이트 원자료. **2026-09-05 추가**: 국가=한국 필터 페이지·검색어 내보내기(판정은 KR 만) · 서치어드바이저 검색어·페이지 내보내기(10/5 에서 앞당김) · GA4 세션 소스 × 방문 페이지 교차 1장 — 콘솔팩 세션 2 |
| M03 | GSC 사이트맵 재제출 + URL 검사 5건(civil-servant-pay-2027·chuseok·bonus-calculators·ranking·year-end-tax-2027) | [콘솔 7분] | 색인 1~3주 단축 | 9/13 세션에 포함. CMP 게시는 앵커 판정 후 10월 |
| L08a | CF Cache Rule 전 HTML 엣지 캐시 — 규칙A `rsc`/`next-router-prefetch` 헤더 Bypass(상단 필수) + 규칙B GET·경로 제외(/api /widget /share /private) Edge TTL 1h Override, Browser bypass, status 200만 | [콘솔 15분] | 0~+2% + Worker 한도·5xx 방어 | 기존 `/salary/*` 14400 규칙 정체 캡처 먼저. 적용 후 Purge Everything·헤더 메뉴 3클릭·`curl -A Chrome -D -` HIT 확인. 시즌 배포마다 Purge를 런북에 |
| L04' | 앵커 ON (9/21) + 인피드 유닛 발급 + 자동광고 설정 캡처 | [승인④·콘솔 10분] | ×1.03~1.10 | §1-2 조건. 사이드레일·동적앵커 OFF. 판정 10/5 |
| L15a | LinkPrice u_id 캡처(9/8 잠정·9/27 승인 확정) + **머천트 실사 9/21**(카드·증권·ISA/IRP·대출비교·보험 모집 여부·단가·카피 규정) | [콘솔 15분] | 조건부 | 모집 머천트 0이면 C6·시즌 OfferSlot 8곳·offers 스위칭 전부 계획에서 제거(하방 0). card 10/31 마감 역산 |
| L15b | P6-9 확장: offers.json ilikeclick(:63)·adpick(:79)·tenping(:93) 항목 삭제, terms 제7조·affiliate-ops 명칭 정리, 고지 11→13px | [승인⑤] | 정책 리스크 축소 | 광고 코드 무접촉 |
| L13a | SeasonalBanner 10월 항목(/year-end-tax-preview, 날짜 없는 카피) + 11~1월 href→2027 허브 + 10월 교체 세트(SeasonalLinks 320p·seasonLinks 헤더·검색 칩·SEASON 배지) **9/26 교체** | [코드] | 만료 문구 노출 창 제거(배수 0) | `getCurrentSeasonal(now)` 시그니처로 순수 함수 테스트(월별 9점). 광고·배너 위치 무변경. samsung-bonus 접촉은 9/21 이후 |
| M01 | 성과급 계산기 장르 구글 전선 — 9/20 R1.5 판정 후 서브쿼리 갭 페이지(sk-hynix-bonus 'SK하이닉스 성과급 계산기', samsung-bonus 'OPI/TAI 계산') title/H1 정확 일치 + 뉴스 5편 앵커텍스트 일치 + 경쟁 기능 격차(세후·다년 누적·시나리오) 결과 직하 광고 아래 보강 | [코드] | 구글 일 10→25~40클릭(×2.5~4), 세션 +1~3%(시즌 +3~8%) | 9/20 GSC 28일 '성과급' 필터 재수출 후. 신규 페이지 0. L18의 12/15 description 교체는 이 판정(10/19~26) 본 뒤. **+ 홈 H1 키워드 정합(2줄 유지·히어로 높이 불변) 동봉, 판정 KR 필터**(naver-onpage-5, 100배 계획 §5) |
| L14' | 연말정산 클러스터 안전 부분집합: `relatedCalculators.ts` '/year-end-tax-2027' 키 + tax 카테고리 공제 4종, R2 3종 page에 YearEndTaxCluster를 **마지막 광고 아래** 삽입 | [코드] | 위생(배수 0) | 클러스터 탭 8→15 확대·허브 YEAR_END_STEPS 7항목 추가는 광고 위 팽창 → 승인 또는 행 수 불변 치환. 성과급 허브 역링크는 카드 내부 금지(a 중첩) → GuideMid 아래 블록으로만, 9/20 이후 |

### Phase 3 — 10월 (구조 마감 10/31)
| # | 레버 | 종류 | 효과 | 조건·게이트 |
|---|---|---|---|---|
| M02 | §12-2 ⑦ 레거시 H1 직하 HomeTop 15곳 + /tools 3곳 히어로 직하 → 결과 직하 이동 | [승인⑥] | 대상 18라우트 CTR +30~50% → 전체 ×1.01~1.02 | **유닛 수 불변 = 밀도 리스크 0**. 9/21 GA4 slot_kind 표 확인 후 첫 빈 실험 슬롯(10/6~10/19). 늦은 마운트 역전(layout 선점) ad-audit INFO 확인 |
| L06' | R2 A2 인피드 단독 — 랭킹 31·listed 218·/guides·/salary-db 인덱스 아이템 사이 1개 | [승인⑦] | ×1.00~1.015 | 발급 ≤9/30. InFeedAd 래퍼 minHeight 예약·ad-audit in-feed 인식 추가. A3(/table 청크 사이 Display2)는 dedup으로 no-op → **A3는 인피드 기반으로만, 2월** |
| L10' | 회사 description 공시 평균연봉 주입 — **축소판**: sourceUrl이 dart.fss.or.kr/alio.go.kr AND fiscalYear 2025 AND 공시 평균이 title 신입~시니어 범위 내인 회사(≈140곳, 빌드 시 실측) | [승인⑧] | 위생(구글 +0~0.15클릭/일, 네이버 미측정) | title 절대 불변. 프리픽스 아닌 후미 삽입, 150자 내. **같은 커밋에서 대상 회사 lastUpdated 승격 → 그 후 rss-companies 제출**(M08). 시점 9/28 이후·R2 타깃과 비동시. 판정 GSC 28일 국가=KR 필터 |
| L13b | opiData.ts 단일 소스(OPI 실지급률 page.tsx 3곳+Client 기본값 `FIXED_OPI1_RATE` 치환) + TAI_RATES_2026_H2 null 슬롯 + 7종 계산기(LG엔솔·네이버·카카오·포스코·LG화학·HD현대·삼성SDI) Client 인라인 데이터 모듈화 + SK 타결 5점 동기화 키트 초안 + 발표 런북(docs/growth-playbook §3: D0 보도→상수→배포→CF 퍼지→GSC URL 검사→D+1 확인→D+3 리포트 갱신) | [코드] | 동결기 갱신 가능화(배수 0) | `calcSamsungBonusNet` 791/553/252%·MX 50% 회귀 테스트 선커밋. jsdom 추가 금지. 1/15~31 OPI 배너·12/15~31 TAI H2 배너는 **데이터 non-null 게이트**(발표 전 추정 카피 금지). **① 분할 선행 완료 2026-09-05(B12)** — 7종 계산기(lg-energy·naver·kakao·posco·lg-chem·hd-hyundai·samsung-sdi) Client 인라인 상수 → data.ts 모듈화 + data.test.ts 동결값 14건 + verify-bonus-data.mjs Client+data.ts 합산 스캔 + SK PS 타결 동기화 키트 docs/drafts/sk-ps-sync-kit-2027.md(5점·D0~D+3 런북). **② opiData.ts·TAI H2 null 슬롯·FIXED_OPI1_RATE 치환은 9/21 이후 첫 슬롯**(samsung-bonus 무접촉 유지). **선행분 ④ 완료(B11)**: src/data/opiAnnouncement.ts OPI_2026_ANNOUNCEMENT(발표 전 announced=false·rate/date/source null 강제, 테스트가 불변식 검사) + seasonalCalendar.ts 1월 20~31 OPI 게이트 항목(requires:"opiAnnounced", 카드공제 항목 앞). 게이트는 getCurrentSeasonal(now, { opiAnnounced }) 인자 주입 — ★홈 배너 연결(src/components/SeasonalBanner.tsx:18 을 getCurrentSeasonal(now, { opiAnnounced: OPI_2026_ANNOUNCEMENT.announced }) 로 한 줄 교체)은 소유 범위 밖이라 미적용, 발표 런북(growth-playbook §3)에 포함. 발표 후 절차: opiAnnouncement.ts 4필드 채움 → SeasonalBanner 한 줄 → vitest. **[운영자 한 줄 결정 = 100배 계획 승인 H]** 1월 홈 배너 1순위 = OPI(1/20~31, 카드공제보다 우선) — 코드는 이 순서로 배치·게이트 잠금 상태, 결정이 다르면 게이트를 열지 않고 항목만 남긴다(카드공제 자연 폴스루). 2/1~5 연장은 medical(2/1~15)과 겹쳐 별도 결정 |
| L07' | §12-2 ⑥ 데스크톱 SIDEBAR 300x600 **단독** 이식(성과급 23→장문 4→/home-loan, SidebarAd만·skyscraper 병기 금지) | [승인⑨] | 피크 ×1.01~1.03 | **10/17 배포 → 10/31 판정** 가능할 때만. 불가 시 2월. #2a·CLS 정비와 분리. 데스크톱 비중 실측(9/13 번들) 30% 미만이면 강등 |
| C6 | 성과급 계산기 OfferSlot 위치 수리 — `samsung-bonus/Client.tsx:545` ResultNextLinks 내 OfferSlot(shared.tsx:243)이 page의 InArticleAd(L379)·CalcResultAd(L633) **위**에 있음 → 광고 아래로 이동 또는 제거 | [승인⑩] | 0 (12월 securities 오퍼 활성의 전제) | 이동 없이 offers.json 스위칭으로 활성화하면 결과 직하 광고 앞에 CPA 카드 = 8/16 급락 패턴. 동결기 수정 불가 → 10월 필수 |
| M05 | 리스트 3페이지 다이어트 — /salary-db 인덱스(1.8MB·17,800노드·companies prop 115KB→필터 필드만)·/table 4종 SalaryTable 셀 마크업(hourly/weekly는 별도 컴포넌트)·/guides RSC 206KB | [승인⑪] | INP·크롤 효율(PV +0~2%) | /table은 실험 #1 대상군 → L02' 기입 후. 광고 무접촉. 헤더 2중 SSR 다이어트(367KB)는 2월 |
| M07 | 연말정산 클러스터 title 연도 프레임 상수화(`YEAR_END_SEASON_LABEL`, '2027 (2026년 귀속)') — 값 교체 12/15 | [코드] | ×1.00~1.02 | L14'와 같은 배치. 1월 초 교체 금지 |
| L18' | sitemap ROUTE_OVERRIDES 정합(civil-servant-pay-2027 9/3·hyundai/kia) + verify-sitemap 'page 커밋일 > lastmod' WARN + 12~1월 세트 상수(SEASONAL_LINKS_DEC/JAN) 10/31 전 커밋 | [코드] | 위생 | dateModified 21곳은 실제 갱신 커밋일만. SEO_YEAR 상수화는 문자열 불변 diff 게이트 후. **12~1월 시즌 세트 상수 사전 제작 완료(2026-09-05, B11, 브랜치 claude/100x-batch-20260905)** — SEASONAL_LINKS_DEC/JAN(src/app/table/2026/SeasonalLinks.tsx)·SEASON_TOP_DEC/JAN(src/config/seasonLinks.ts)·KO_CHIP_SETS.DEC/JAN(src/components/header/HeaderSearch.tsx). 교체는 12/1·1/2 에 3파일 각 한 줄(ACTIVE_SET·SEASON_TOP·chips). 활성 세트는 SEP 유지 |
| L16' | 10/19 GSC 커버리지 재수출 → /salary-db/listed 219 색인률 산출(≥60% 게이트) | [콘솔 15분] | 0 | lite 본문 보강은 **이미 배포됨**(추이·순위·동종·환산 전부 존재) → 삭제. 통과 시 Phase 2 발행은 **2027-02** |
| M10 | LinkPrice 머천트 신청(9/21 실사 결과 있을 때만) → 승인 URL(u_id=offer_id) offers.json 3필드 스위칭 card 10/25~31 | [콘솔] | 조건부 +$2~8/일(2027-03 평시) | 금소법 §22: 심의필 문구만. securities 12/20 활성 → 첫 입금 2027-03~04 (12~1월 수익에 합산 금지) |

### Phase 4 — 11~1월 동결기 (상수·메타·수치·offers.json·판정만)
- 11/7 사이드바 판정(10/17 배포 시). 12/1·1/2 시즌 세트 상수 교체(1/2 교체 전 확인 2건 — ① 공무원 2027 봉급표 라벨(예산안 3.9% → 확정 여부) ② 국세청 간소화 오픈일 공지 시에만 날짜 카피 보강. 삼성 TAI(12월)·OPI(1월) 링크는 라벨만, 지급률 수치는 발표 후 별도 커밋). 12/15 연말정산 라벨 교체. 12/20 securities 오퍼(C6 완료 전제). 12월 TAI H2·1월 셀트리온·1월 말 OPI·2월 SK PS 발표 반영 ≤24h(런북) + 배포 후 CF Purge.
- 1/1 회사 축 연도 치환(seo.ts title/description/keywords + rss item title): **12월 4주 네이버/구글 회사 축 기준선(GA4 소스/매체)이 있을 때만** 430 정본 1/1 → lite 1/15 단계 교체. 없으면 2/1. H1(`CompanyDetailClient.tsx:70`)은 제외.
- 발표 감시 스케줄 태스크: 일 1회가 아니라 발표 예상 창(TAI 12/1~12, 셀트리온 1/5~20, OPI 1/20~2/5, SK 2/1~15) 격일, 보고만, 확정 지급률+출처 2개 이상일 때만 [승인⑫]. 삭제된 sk-hynix-pi-announcement-watch 삭제 사유 확인 선행.
- 월 1회 데이터 루틴(11/2·12/7·1/4): AdSense 페이지·광고단위 28일 2장, GA4 소스/매체, GSC 28일 zip, 서치어드바이저 캡처 3장, 쿠팡 subId 엑셀, LinkPrice u_id — `scripts/metrics-ingest.mjs`(간이 파서 2시간)로 `docs/metrics-log.md` 1행 — ✅ 2026-09-05 선배포(gsc-coverage·ga4-sources·log + --selftest, 9/13 세션 2 번들부터 사용. AdSense 는 adsense-report.mjs 결과를 텍스트로 넘김).

### Phase 5 — 2027-02~03 재개
- lite Phase 2 +300~397곳 발행(10/19 게이트 통과 + L08a 캐시 전제). A3 /table 청크 사이 인피드. 헤더 2중 SSR 다이어트(367KB, 링크 유지·SVG 스프라이트). 알리오 careerLevels 공기업 46곳(출처 확인 선행). R2 B1 홈 결과 다단계(§7 조건). 비네트 큐(운영자 선택). 결정 ②(CF 관리 robots AI 봇 차단 해제·/llms.txt app route — 캐시 확인 후). 사실(2026-09-05 실측): CF 관리 블록 9종(Amazonbot·Applebot-Extended·Bytespider·CCBot·ClaudeBot·CloudflareBrowserRenderingCrawler·Google-Extended·GPTBot·meta-externalagent) Disallow + Content-Signal ai-train=no; robots.txt 상 유입 UA 는 비차단이지만 **CF 엣지가 AI 검색·에이전트 UA(OAI-SearchBot·ChatGPT-User·PerplexityBot·Claude-SearchBot·Claude-User·GPTBot·DuckAssistBot) 전부 403** — 결정②의 "학습봇만" 전제 오류. 해제 = CF Security → AI bot policy Search/Agent Allow·Training Block 유지(효과 = AI 답변엔진 인용·Gemini 앱 그라운딩 노출, 하방 = 자동광고·검색 무접촉·Worker 요청 소폭 증가). **9/21 캐시 규칙(L08a HIT 확인) 직후로 앞당김 제안(100배 계획 §6-J, 콘솔팩 세션 3 ①)**. AI Overview·AI Mode 는 Googlebot 이라 무관. /llms.txt 는 J 이후. 10/5 결정표 생성 시 ② 행으로 이관.
- 2/15 GSC 28일 창으로 시즌 메타 판정.

---

## 4. 운영자 세션표 (세션당 ≤3항목·≤25분, 격주 고정 요일)

| 일자 | 항목 | 분 |
|---|---|---|
| 9/6 채팅 | 승인 ①②③ + 실험 #1 판정 규칙 ④ 한 줄씩 | 2 |
| **9/7 세션 1** | ① GA4 관리→데이터 수집 및 수정→데이터 보관→14개월 ② 관리→맞춤 정의→맞춤 측정기준(이벤트 범위) slot_kind·position·calc_type·offer_id·vertical 5개 ③ AdSense 보고서→분류 '광고 단위'→맞춤 기간 8/3~8/16, 8/17~8/30 CSV 2장 (+ 하위 2026-09-05: 맞춤 채널 그룹 네이버=Organic Search·page_path 집계·광고단위 점검쌍 7종·position 확인·눈 확인 3건 — 콘솔팩) | 20 |
| 9/8 | 건정심 결과(총요율·근로자율·시행일·부과체계 변경 여부) 한 줄 + LinkPrice 리포트 u_id 8/25~9/7 캡처 1장 | 10 |
| **9/13 세션 2** | ① GSC 색인 생성→페이지 내보내기(전체+사유별) + 실적 28일 검색어·페이지·국가·기기 + 국가=미국 필터 + 링크>외부 링크 ② GA4 보고서→획득→트래픽 획득→세션 소스/매체 28일 CSV ③ AdSense 기기별 28일 + Sitemaps 재제출 + URL 검사 5건 (+ 하위 2026-09-05: 국가=한국 필터 페이지·검색어 — 판정은 KR 만 · GSC URL-prefix 속성 4개 · 서치어드바이저 검색어·페이지 내보내기 앞당김 · GA4 방문 페이지 교차·탐색 2개 · Workers 사용량 기준선 · 라이선스 승인 I — 콘솔팩) | 25 |
| **9/21 세션 3** | ① Cloudflare Caching→Cache Rules 기존 규칙 캡처→규칙 A·B 생성→Purge Everything→헤더 메뉴 3클릭 확인 + Workers 사용량 캡처 ② AdSense 광고→사이트 기준→설정 패널 캡처→앵커 ON·사이드레일/동적앵커 OFF→저장·캡처('앵커 켬 9/21') + 광고 단위 기준→인피드 유닛 1개 발급→슬롯 ID·layout-key 전달 ③ LinkPrice 머천트 검색(카드·증권·ISA·IRP·대출비교·보험) 캡처 → 있으면 신청 (+ 하위 2026-09-05: 규칙 B 에 sitemap·rss 2종 포함·기존 규칙 매칭 캡처 선행·Cache Key utm_* 무시·curl HIT 게이트 → 통과 시에만 AI bot policy Search/Agent Allow(승인 J) — 콘솔팩) | 25 |
| 9/27 | LinkPrice u_id 승인 확정 재캡처 | 3 |
| **10/5 세션 4** | ① 서치어드바이저 RSS 제출(rss.xml, rss-companies.xml — L10' 배포 후) + 리포트 캡처 3장(검색 유입·수집 현황·사이트 진단) ② 네이버 시크릿 모드 5쿼리 PC·모바일 캡처 ③ AdSense 광고 형식별 행(앵커·인페이지·비네트) 28일 캡처 → 앵커 판정 (+ 하위 2026-09-05: rss.xml 리포트 3건 확인 후 제출 · GA4 pwa/homescreen·kakao/share·위젯 utm_content 3건 · /salary 숫자 URL 가설 확정 보고 — 콘솔팩) | 25 |
| **10/19 세션 5** | ① GSC 커버리지 재수출(lite 게이트) ② 인피드 판정 CSV(페이지 필터 /ranking·/listed·/guides + 인피드 유닛 행) ③ LinkPrice 캡처 + 'lite Phase 2 2월 진행/보류' 한 줄 (+ 하위 2026-09-05: '색인 생성됨' URL 목록 내보내기 · 사내망·AI 랜딩 재확인 · Workers 사용량 재캡처) | 20 |
| 11/2·12/7·1/4 | 월 1회 루틴(§Phase 4) | 15 |

세션 1 미실행 시: L01만 진행하고 계획 배수를 ×1.05~1.15로 재산정해 보고.

---

## 5. 승인 요청 (예/아니오로 답할 수 있게)

**이번 주(9/6)**
1. 27a692c main 병합·배포 + "수리는 실험 슬롯을 쓰지 않는다" 동의
2. 채움/미채움 계측 2줄(AdPlacement.tsx 내부, 독립 커밋·즉시 revert)
3. §12-2 ⑪ 하단 고정 UI 앵커 감지 코드
4. 실험 판정 규칙: 광고단위 1축 판정·판정 불가 시 현상 유지(revert 아님)·창 시작일 8/17 통일

**9/21까지**
5. P6-9 확장(offers.json 미가입 네트워크 3항목 삭제·약관 제7조·고지 13px)
6. 앵커 ON 9/21(밀도·비네트 무접촉, 사이드레일·동적앵커 OFF)
7. 인피드 유닛 발급 + A2 실험 10/11~10/24
8. §12-2 ⑦ 광고 위치 이동 18곳(첫 빈 슬롯)

**10월 초**
9. 회사 description 공시 주입 축소판(≈140곳, title 무접촉, 9/28 이후)
10. ⑥ 사이드바 단독(10/17 배포 가능할 때만)
11. 성과급 계산기 OfferSlot 광고 아래 이동(12월 오퍼 활성 전제)
12. 리스트 3페이지 경량화(광고 무접촉)
13. 발표 감시 태스크(발표 창 격일·보고만)
14. 시즌 OfferSlot 8곳·VERTICAL_RULES 4라우트 — **9/21 실사에서 머천트가 있을 때만** 상정

**100배 계획 §6 승인 A~J(2026-09-05)는 `docs/revenue-100x-plan-2026-09.md` 가 정본** — 이 목록과 번호를 합치지 않는다. 그중 코드가 선행돼 운영자 한 줄만 남은 것: **H** 1월 홈 배너 1순위 = OPI(1/20~31, 카드공제보다 우선 — B11 게이트 잠금 상태, 결정이 다르면 게이트를 열지 않고 항목만 남김) · **I** 리포트 CSV/JSON 라이선스 = 사이트 인용 정책 URL 유지 vs CC BY 4.0 · **J** CF AI bot policy Search/Agent Allow(9/21 캐시 HIT 후) · **A** /job·/industry 헤더 가림 래퍼 패딩(=⑮ 후보, §2-1-b).

결정 대기 잔여(마스터플랜 P1 ⑤⑥·P2 D/E·P6 1~8·§12-2 ③④⑤⑧⑨⑩⑫⑬⑭⑮·R2 B1/A3/A4/P8·제안서 ②⑧, 총 34건)는 광고 접촉 여부·하방 1줄·기본값=보류 열을 붙인 결정표로 10/5 세션에 별도 제시. 무응답=보류(자동 승인 없음). 리포트 2호는 `bonus-payout-history-2026`(8/23 발행)이 2호인지 운영자 확인 1문항 후 문서 5곳 정정.

---

## 6. 프로젝션 (검증 보정치, 전부 추정)

| 시점 | 레버 귀속 배수 | 하루 | 전제 |
|---|---|---|---|
| 9/30 | ×1.05~1.20 | $11~24 | L01 병합 + 세션 1. 앵커는 9/21 ON이라 창 절반 |
| 10/31 | ×1.10~1.40 | $11~28 | 앵커·⑦·인피드 중 2개 판정 통과. CPA 라벨분 +$0~0.5 별도 |
| 12~1월 | ×1.15~1.45 + 시즌 외생 ×1.2~1.4(미계상) | $14~40 (외생 포함) | 시즌 자산 정합·발표 24h·오퍼(있을 때). 작년 네이버 1월 실측 부재 → 하한만 |
| 2027-03 평시 | ×1.4~2.0 | $14~40 | 동결 해제 안착. 네이버 AI 브리핑 −20% 이상이면 하한 ×1.2 |
| 2027-09 상한 | ×2.5~4 | $25~80 | lite Phase 2 색인 안착 + 구글 성과급 장르 1~3위 + 헤더·알리오·A3 + CPA 머천트 |
| **10배** | 세션 ×3~4 추가 | $100~200 | 현 구조에서 12개월 내 확률 절반 이하. 2027 하반기 이후 |

곱셈 구조: RPM ×1.4~1.8(상한 소진) × 세션 ×1.5~2 × PV/세션 ×1.1~1.2 ≈ ×4 + CPA. 9/13 번들에서 RPM 실측이 $1.5 미만이면 PV 기준선 상향·세션 배수 요구 하향, $4 초과면 반대. → ✅ 해소: 8/31~9/4 실측 RPM $4.40(§2, docs/metrics-log.md 2026-09-05 행) = "$4 초과" 가지 확정. 9/13 은 재확인만.

---

## 7. 기각·조건부 레버 (재제안 방지)

| 레버 | 판정 | 사유·살리는 조건 |
|---|---|---|
| 경쟁 공백 회사 신규 추가(N5/R6) | 기각 | 삼성메디슨·삼성생명·KB증권·농심·삼양식품·휴젤·베스핀글로벌·SK에코플랜트·중부발전 **전부 krCompanies_Batch* 존재**. 문제는 부재가 아니라 27~117위 → L10' |
| 페이지군 병렬 실험·14일 무응답 자동 승인(R3/R9) | 기각 | 불변 제약·승인제 위반 |
| 비네트 슬롯 확정(R10) | 기각 | 재제안 금지 '(실험 큐로만)'. 근거 비금융. 신규 트리거 3종 자동 활성 상태 확인 먼저 |
| Bing 웹마스터·다음 검색등록·SNS sameAs(G7) | 기각 | 신규 가입 금지 |
| Multiplex /calc/[slug]·/salary-db·/salary HomeTop 직후(L05) | 기각 | `calc/[slug]/page.tsx:165` Related 직후가 `:172` HomeTopAd = 재제안 금지 'HomeTop 직후 연속'. /monthly는 실험 #1 판정 후 별도 슬롯 |
| A3 /table 청크 사이 Display2 | 기각 | 8종 전부 Display2 사용 중 → dedup no-op/이동 함정. 인피드 기반으로 2월 |
| 앵커+밀도+비네트 한 슬롯(L04 원안) | 기각 | 귀속 불가. 앵커 단독 9/21 |
| 성과급 23종 title '2027' 12/15 일괄(S6)·description 12/15 일괄(L18) | 기각 | 28일 재판정 창을 OPI 피크 직전 소비. 실제 데이터 갱신 커밋에만 동봉 |
| 시즌 외생 수요를 레버 배수로 합산(season-peak 1월 ×3~6) | 기각 | 구글 일 7클릭 베이스 외삽 금지 |
| lite 본문 보강 1,742→4,000자(L16) | 기각 | 추이·순위·동종·환산 섹션 **이미 배포**. 고유 수치 밖 보일러플레이트 금지 |
| 헤더 2중 SSR 다이어트·알리오 careerLevels 46곳 | 2월 순연 | 10월 슬롯 경쟁·회귀 위험 대비 효과 소 |
| R2 B1 홈 결과 다단계(L17) | 조건부·2월 기본 | 27a692c 병합 후 프로덕션 iframe 관측일 D0+14 기준선, 홈 랜딩 세션 비중 ≥20% 실측, Display2·쿠팡 밀림 px 명시 승인, 회사 6카드 접힘 기본, CTA 정리 분리 |
| CPA 시즌 OfferSlot 8곳·securities 활성(L15 C3/C4) | 조건부 | 머천트 실재 + C6 위치 수리 + 광고 아래 라인 검증 |
| 운영자 세션표 25분·결정표 24건(L03) | 조건부 | 결정 대기는 34건. 세션당 ≤3항목·광고 승인형 ≤6건만 제시. 배수 계상 금지 |

---

## 8. 불변 규칙 (이 계획에서 추가 확정)
1. 수리(버그)와 실험(배치 변경)을 구분한다 — 단 분류는 운영자 한 줄 동의로만.
2. 실험 판정: 광고단위 축 우선, 창 내 클릭<50이면 28일 연장, 미달 시 '판정 불가·현상 유지'. 판정 불가는 확장 게이트를 해제하지 않는다(27a692c 병합 게이트만).
3. 기준선 창을 서로 오염시키는 배포 금지 — 앵커(9/21)는 L01 병합(9/6~9)·전면최적화 D+14(9/17) 이후, B1은 앵커 판정 이후.
4. 슬롯 체인에 여유 없이 배치하지 않는다 — 10월 슬롯은 ⑦(밀도 0)·인피드 2개까지, 사이드바는 10/17 배포 가능할 때만.
5. 광고 위 UI 금지는 OfferSlot·클러스터 탭·허브 그리드·B1 섹션에도 적용. 무승인 항목이 광고 위 높이를 키우면 승인 항목으로 승격.
6. 신호 순서: 메타 변경(L10') → lastUpdated 승격 → RSS/사이트맵 제출. 캐시(L08a) → 크롤 개방(AI 봇·수집 요청 확대).
7. CPA 입금 시점(인정 20일·익익월)을 프로젝션 창에 반영. 12~1월 수익에 securities 합산 금지.
8. CSV 원본은 리포 밖(`~\.moneysalary-secrets\` 또는 docs/data + .gitignore), 문서엔 집계만. 9/13 이후 GSC zip·커버리지 CSV 는 docs/gsc/ 대신 `C:\Users\ruby1\.moneysalary-secrets\gsc\` 에 두고 절대 경로로 `scripts/metrics-ingest.mjs` 에 넘긴다. 문서에는 docs/metrics-log.md 집계 행만.

---

## 9. 근거 파일
- 운영자 보고서(요약판): https://claude.ai/code/artifact/35b97ded-e4ee-4fa5-8df2-62ba4673693c
- 진단 원자료(10축): 세션 scratchpad `w1-state-raw.md` (재현: 이 문서 §1~§2 수치의 출처 섹션 [docs][ads][engine][gsc][season][cpa][measure][perf][serp][bench])
- 설계·검증(57 에이전트): `w2-result.md` — 레버별 반박 사유·보정치·조건 원문
- GSC 실측: `docs/gsc/2026-08-16-*.csv`
- 커밋: 27a692c(브랜치 전용), 232bc56, 500ec07..7bfbf86, 3a1546f(main HEAD 2026-09-05)
