# 수익·SEO·유입 100배 계획 2026-09 — 정직한 산술과 실행 정본

작성 2026-09-05 저녁. 운영자 지시 "계획부터 완벽히 하고, 애드센스 수익·SEO·유입을 현재의 100배로". 오전 정본 `docs/revenue-10x-plan-2026-09.md`(67 에이전트, Phase 1~2 배포 완료) 위에서 11개 렌즈 진단(78건 발견) → 발견별 적대적 검증 2표(증거·규칙) → 57건 생존 → 코드 실행 가능 36건 중 14건 당일 배치 실행의 결과를 반영한다. 오전 정본의 결정 대기·게이트·불변 규칙·기각 목록은 그대로 유효하며, 이 문서는 **(1) 100배의 산술적 실체 (2) 오늘 새로 확정된 사실 (3) 다년 궤적의 기둥 (4) 지금 실행한 것과 남은 것**을 확정한다.

---

## 0. 결론 (한눈)

| 항목 | 값 |
|---|---|
| 기준선 | 8/31~9/4 실측 하루 $19.2 · PV 4,363 · 페이지 RPM $4.40 (평월은 $10~15) |
| 100배 | 하루 $1,900 ≈ 월 8,000만원 |
| 산술 | 수익 = 세션 × PV/세션 × RPM/1000 + CPA. RPM 잔여 상한 ×2~2.5, PV/세션 ×1.3~1.5 → **100배는 세션 ×30~40**(하루 세션 3,000 → 10만) |
| 세션의 실체 (GA4 1/1~9/5, 오늘 첫 분해) | 네이버 **67.7%** · direct 23.5% · 사내망 4.6% · bing 1.4% · 커뮤니티 1.4% · **구글 0.8%** · AI 어시스턴트 0.6% |
| 판정 | **100배는 12개월 계획 밖이다.** 네이버 한 채널로 세션 ×30은 검색 총량 자체가 허락하지 않고, 구글(0.8%)·AI(0.6%)는 0에서 시작한다. 정직한 궤적은 12개월 ×2.5~4, 24개월 ×5~10(구글 회사축·성과급 장르가 1페이지에 오르고 AI 인용이 열릴 때), 100배는 그 이후에도 사이트 성격(한국어 연봉 정보) 자체의 상한과 충돌한다 |
| 이 계획의 실제 산출 | ① 곱해질 분모(세션)의 채널별 관측 체계 확립 — 이전 계획은 1% 채널(구글)에 관측이 걸려 있었음 ② 코드 밖 차단 2건 실측(CF 엣지 AI 봇 403·엣지 캐시 미적용) → 운영자 콘솔 한 줄로 열림 ③ 1월 OPI 피크(PV 24%) 자산 사전 제작 ④ 인용·백링크 플라이휠의 빠진 배선 ⑤ 측정 인프라(metrics-ingest·내부링크 귀속·공유 utm) — 세션이 늘었을 때 어디서 늘었는지 처음으로 알 수 있게 됨 |

**병목은 여전히 실행이다.** 코드 레버 36건을 전부 합쳐도 ×1.05를 넘지 않는다(검증 보정치). 곱셈은 운영자 콘솔(앵커·캐시·AI 봇·GSC/서치어드바이저 내보내기)과 시간(색인 숙성·시즌)에서만 나온다.

---

## 1. 오늘 새로 확정된 사실 (오전 정본에 없던 것)

| # | 사실 | 근거 | 계획에 미치는 영향 |
|---|---|---|---|
| F1 | 세션 소스: 네이버 165,511(67.7%, m.search 128,576 + organic 36,677) · direct 57,415 · 사내망(sec.media.samsung.net 8,181·menlosecurity 2,792·teams) 11,143 · 구글 1,936 · AI(chatgpt 1,164·copilot 257·claude) 1,431. 첫 사용자 기준 네이버 75.6% | GA4 개요 CSV 소스/매체 섹션(오전엔 페이지 제목 섹션만 집계) | 오전 정본 §2-2 "네이버 GA4 소스 실측 0회"는 해소. 세션 배수 서사를 채널별로 재배열(§3) |
| F2 | 일 사용자 5월 885 → 6월 1,861 → 7월 1,809 → 8월 2,301 → 9월 2,767. 평일 2,800~4,500·주말 1,900~2,100. 재방문 ≈20~25% | GA4 일별 신규/재방문 | 월 +20~25% 자연 성장 중(네이버 순위·성과급 뉴스). 프로젝션 하한은 이 추세 유지 |
| F3 | **Cloudflare 엣지가 AI 검색·에이전트 UA에 페이지 403** — OAI-SearchBot·ChatGPT-User·PerplexityBot·Claude-SearchBot·Claude-User·GPTBot·DuckAssistBot 전부 403(Server: cloudflare), bingbot·Googlebot·Yeti 200 | curl 실측 2026-09-05 (본 세션 재검증) | 결정②의 전제("robots.txt 주입·학습봇만")가 틀렸다. 답변엔진이 페이지를 읽어 새 인용을 만드는 경로가 닫혀 있고, 현 chatgpt.com 유입은 Bing 인덱스 경유 추정. **CF 대시보드 AI bot policy에서 Search·Agent = Allow(Training은 Block 유지)** — 9/21 캐시 규칙 직후 같은 세션으로 앞당김 제안(§6-J) |
| F4 | 프로덕션 robots.txt는 CF 관리 블록이 앞에 주입돼 9종(Amazonbot·Applebot-Extended·Bytespider·CCBot·ClaudeBot·CloudflareBrowserRenderingCrawler·Google-Extended·GPTBot·meta-externalagent) Disallow + Content-Signal ai-train=no. llms.txt 404 | curl | F3와 합쳐 결정② 근거 정정. AI Overview/AI Mode는 Googlebot이라 무관 |
| F5 | next.config headers()의 s-maxage 40여 규칙은 프로덕션 프리렌더 HTML에 **전혀 적용되지 않음**(cf-cache-status DYNAMIC). 엣지 HIT는 대시보드 규칙이 있는 /salary/*(14400)뿐. sitemap.xml 354KB·rss 2종도 DYNAMIC | curl + next-on-pages 특성 | L08a(9/21 캐시 규칙)가 유일한 해법임을 실측으로 고정. 모든 크롤 개방(AI 봇·Bingbot 완화·lite 2차)은 L08a 이후 |
| F6 | 수동 광고단위 커버리지 8월 94.0% → 9/3 85.0 · 9/4 83.9 · 9/5 87.5. 노출 RPM 0.51→0.42. 요청/PV는 오히려 감소(1.46→1.33), 매칭은 +38%인데 PV(+47~60%)보다 덜 늘어 커버리지 하락 | 수동유닛 CSV 재집계 | "9/2 배치가 요청을 늘렸다"는 단순 인과는 수동 합계에서 안 보임. 유닛 특정은 9/7 광고단위 CSV + GA4 ad_unfilled × slot_kind × page_path로만. 코드 조치 없음 |
| F7 | 미국 1,208노출(CTR 0.3%·데스크톱)은 /salary/[amount] 159p(4클릭/1,174노출/순위 1~2)와 규모·순위가 정합 → 숫자 URL 매칭 **가설**(익명화 쿼리라 CSV로 확정 불가). /en은 83노출뿐 | GSC 8/16 CSV 재집계 | 데스크톱 CTR 6.7%는 오염 분모. 9/13 미국 필터 내보내기로 확정, 판정은 KR 필터 CSV만. /en 확장 가치 0. noindex 금지 |
| F8 | 회사 카니벌라이제이션 없음: canonical self, /company/[id] 308, lite 219곳↔정본 430곳 이름 겹침 0. GA4 삼성전자 2제목은 5/15→5/24→7/6 title 공식 변경의 시간차 | 코드·git·라이브 HTML | 재작업 불필요로 확정. GA4 페이지 집계는 page_path 기준으로(9/7 세션) |
| F9 | 네이버 Yeti 렌더링은 병목 아님 — 회사·성과급·직업·홈 핵심 사실 전부 SSR HTML. 진짜 약점은 신선도 신호(WebApplication dateModified 2026-01-01 전역 하드코딩·회사 428곳 lastUpdated 5월 정체) | 빌드 HTML 파싱 | 오늘 배치 1에서 수정(§4) |
| F10 | 같은 회사 평균연봉이 표면별로 다름(수기 disclosed vs DART ETL): 삼성 15,800/15,363 · SK 18,500/17,800 · 메리츠화재 +48% · DB손보 +32% · HD현중 +20% · 남부발전 +18%. 수기 우선은 의도된 설계(보도 교차확인) | 코드 대조 | 5% 초과 시 DART 산정치 인라인 병기(오늘 배치). 4곳 출처 재검토는 결정 ⑤에 근거 첨부 |
| F11 | 삼성 성과급 계산기 858%와 보도 791%는 같은 분모(연봉 8,000만)의 동일 척도(수치 정합). 다만 page.tsx:552~554 문구 "791%/553%/252%는 … **월 기본급 대비**로 환산"은 여전히 오기(9/3 메모리 기록대로) — 진단에서 "분모가 달라 비교 불성립"이라고 본 발견은 반박됨 | Client.tsx 754행 검산·page.tsx grep | 수치 무변경. 문구 정정은 9/21 이후 samsung-bonus 접촉 슬롯(L13b 커밋)에 동봉 |
| F12 | Bingbot Crawl-delay 10은 유지(8/10 Worker 한도 대응). AI 검색봇 전용 robots 그룹·middleware 화이트리스트는 CF 403 해제 없이는 무의미 | 코드 | F3 해제 후에만 재검토 |

---

## 2. 분해식 — 현재값·상한·채널 분해

| 항 | 현재 | 12개월 상한 | 근거 |
|---|---|---|---|
| RPM | $4.40(피크)·$3.3~3.5(평시) | ×1.4~2.0 | 앵커(×1.03~1.10)·위치 이동 ⑦·헤더 가림 수리·커버리지 회수·인피드·사이드바 그리드. 밀도는 소진(노출/PV 5.3, AV 53%) |
| PV/세션 | 1.49 | ×1.1~1.3 | 회사·성과급군 마지막 광고 아래 링크·최근 본·공유 상태 URL·시즌 클러스터. 계측이 먼저(오늘 배치) |
| 세션 — 네이버 68% | 일 ≈2,000 | ×1.5~2.5 | 순위(회사축 27~117위 → L10' description·별칭·신선도)·시즌(1월 OPI·연말정산)·AI 브리핑 하방(−20% 가정) |
| 세션 — direct/사내망 28% | 일 ≈850 | ×1.3~2 | 삼성 사내망 재공유(공유 상태 URL·PWA)·재방문 루프. 1월 피크에 집중 |
| 세션 — 구글 0.8% | 일 ≈8 | ×5~20 (절대치 일 40~160) | 성과급 장르 1페이지(M01)·봉급표 풀표·/job 내부링크·인용 백링크. 회사축은 잡플래닛·사람인·블라인드가 점유 — 24개월 과제 |
| 세션 — AI 0.6% | 일 ≈6 | ×3~10 (절대치 일 20~60) | F3 해제가 전제. 출처·기준일 블록, 리포트 CSV/Dataset |
| CPA | $0 | 일 $5~15 | LinkPrice 머천트 실사(9/21) 결과에 종속 |

곱셈: RPM ×1.4~2.0 × 세션 ×1.6~2.5 × PV/세션 ×1.1~1.3 ≈ **×2.5~6.5(12개월, 상단은 전 콘솔 항목 실행 + 시즌 외생 포함)**. 100배가 되려면 구글·AI가 네이버와 같은 규모(일 세션 각 3~5만)로 자라야 하며, 그것은 한국어 회사 연봉 SERP의 구조를 바꾸는 일이라 이 계획의 통제 밖이다.

---

## 3. 기둥 6개 — 다년 궤적 (각 기둥의 첫 수는 §4~§6에 배정)

| 기둥 | 논지 | 상한 | 첫 수(이번 주~10월) |
|---|---|---|---|
| P1 네이버 회사축 순위 (68%) | 트래픽 엔진은 "{회사} 연봉" 네이버 웹문서. 온페이지는 이미 포화, 남은 건 신선도 신호·description 공시 주입(L10')·별칭·서치어드바이저 RSS·AI 브리핑 대응 | 세션 ×1.5~2.5 | 오늘: dateModified 전역 상수·회사 lastUpdated 파생·리포트 RSS 합류. 9/13: 서치어드바이저 내보내기(신설 병합). 9/28~: L10'(승인⑧). 10/5: RSS 제출 |
| P2 구글 개통 (0.8% → 5~10%) | 회사축은 2년 과제. 소형 사이트가 이길 수 있는 장르는 성과급 계산기(2페이지 → 1페이지)·봉급표 풀표·직업 연봉 내부링크·데이터 리포트 인용 | 절대 세션 일 40~160 | 오늘: /job 내부링크 블록(레이아웃, 광고 아래)·리포트 CSV/JSON+Dataset distribution·인용 정합. 9/20: M01(성과급 서브쿼리 H1/title + 홈 H1 키워드 동봉). 9/13 콘솔: GSC URL-prefix 속성 4개로 섹션별 색인 수. 12월: 봉급표 2027 확정표에 풀표 구조 |
| P3 AI 답변엔진 (0.6% → 3~5%) | 이미 구글의 60% 규모. CF 403이 새 인용을 막고 있음 | 절대 세션 일 20~60 | 9/21: L08a 캐시 직후 AI bot policy Search/Agent Allow(결정② 앞당김, §6-J). 9/21 이후: samsung-bonus 출처·기준일 footer(승인 D). Phase 5: llms.txt |
| P4 direct·재방문·사내망 (28%) | 두 번째 채널인데 정체 불명. 공유 바이럴과 재방문을 구분해야 투자처가 보임 | PV/세션 ×1.1~1.2, 1월 세션 +5~10% | 오늘: 공유 링크 채널별 utm·PWA start_url utm·내부링크 모듈 귀속·위젯 임베드 호스트. 9/21 이후: 삼성 계산기 공유 상태 URL(해시)·최근 본 모듈. 9/13 콘솔: 소스 × 방문 페이지 교차 |
| P5 시즌 피크 자산 (1월 OPI = PV 24%) | 단일 최대 자산. 발표 ≤24h 반영·정합 게이트·사전 제작 세트가 있어야 시즌 RPM·재공유가 산다 | 12~1월 외생 ×1.2~1.4(레버 아님) | 오늘: 7종 계산기 데이터 모듈화·SK 동기화 키트·12/1·1/2 세트 상수·1월 OPI 배너 항목(null 게이트). 9/21 이후: opiData 단일 소스·TAI H2 게이트·잠정실적(1/8) 트리거·시뮬레이터 지연 마운트 |
| P6 RPM 회수·품질 | 밀도는 끝. 남은 건 뷰어빌리티·우발 클릭·채움률·위치 | RPM ×1.4~2.0 | 9/7: 광고단위 CSV로 우발 클릭·커버리지 유닛 특정(점검쌍 7종 콘솔팩 기입). 오늘: ad-audit 인접·가림 INFO 게이트. 승인: /job·/industry 헤더 오프셋 수리(A)·사이드바 그리드(F, 승인⑨ 병합)·⑦ 위치 이동·앵커 9/21·인피드 |

---

## 4. 배치 1 — 2026-09-05 당일 실행 (코드, 승인 불요, 광고 무접촉)

선정 기준: 규칙 검증 통과 + 광고 위 UI 0 + samsung-bonus 4파일 무접촉(9/21 이후 접촉 규칙) + 기준선 창 오염 없음. 배수는 전부 ×1.00~1.01(계측·위생·피크 대비). 항목별 독립 커밋.

| # | 항목 | 발견 ID | 기둥 | 내용 | 상태 |
|---|---|---|---|---|---|
| B1 | metrics-ingest.mjs + docs/metrics-log.md | plan-gap-critic-5 | 측정 | gsc-coverage·ga4-sources·log 서브커맨드, --selftest, 첫 행(2026-09-05 집계) | (실행 결과 §4-1) |
| B2 | rss.xml에 인사이트 리포트 3편 합류 | google-authority-7 | P1·P2 | guid /insights/slug, 채널 pubDate max | 〃 |
| B3 | 구조화 데이터·신선도 4종 | naver-onpage-2·google-authority-8·data-trust-4·naver-onpage-6 | P1·P2 | WebApplication dateModified=STATIC_LAST_MODIFIED 단일 상수·회사 Dataset citation(DART/알리오)+'추정치 포함' 문구·DART 산정치 인라인 병기(5%↑)·lastUpdated=max(데이터일, 2026-07-06 연금상한 반영, DART 주입일) | 〃 |
| B4 | 주석 정정(코드 동작 무변경) | crawl-performance-3·ai-channel-7·plan-gap-critic-6/7 | 위생 | next.config 캐시 주석 '프리렌더 미적용'·robots.ts 68%·CF 관리 블록 각주 | 〃 |
| B5 | PWA manifest 수리 | retention-pv-5 | P4 | 연말정산 바로가기 → /year-end-tax, start_url utm, sw v2 | 〃 |
| B6 | 공유 링크 채널별 utm | plan-gap-critic-3 | P4 | withUtm(url, channel) + 카카오/복사/웹공유/플로팅바 | 〃 |
| B7 | 내부링크 모듈 클릭 귀속 | retention-pv-6 | P4 측정 | InternalLinkTracker(문서 위임, 기존 guide_cta_click position=module 재사용) + data-msy-module 9종 | 〃 |
| B8 | 위젯 임베드 호스트 계측 | google-authority-4 | P2 측정 | referrer host → utm_content | 〃 |
| B9 | 리포트 원본 CSV/JSON + Dataset distribution/license + /embed 링크 | google-authority-1·5 | P2·P3 | insights/<slug>/data.csv·json, 링크는 layout PageFooterAds 아래만 | 〃 |
| B10 | 회사 페이지 → 직업 연봉 링크 블록 | google-clusters-2 | P2·P4 | salary-db/layout.tsx PageFooterAds 아래 클라이언트 컴포넌트(업종→직업 4건) | 〃 |
| B11 | 12/1·1/2 시즌 세트 상수 + 1월 OPI 배너 항목(null 게이트) | plan-gap-critic-4 ③④ | P5 | DEC/JAN 세트 3파일, opiAnnouncement.ts(발표 전 null), 교체는 한 줄 | 〃 |
| B12 | 성과급 계산기 7종 데이터 모듈화 + SK 동기화 키트 | plan-gap-critic-4 ① | P5 | Client 인라인 상수 → data.ts(동작 0 변경, 프리즈 테스트), docs/drafts/sk-ps-sync-kit-2027.md | 〃 |
| B13 | ad-audit INFO 게이트 2종 | adsense-quality-6 | P6 | 우발 클릭 인접·fixed 헤더 가림 후보(INFO만, exit 불변) | 〃 |
| B14 | companyData.ts 6개사 정합 | data-trust-6 | 신뢰 | 수기 disclosed 값으로 동기화(compare 화면) | 〃 |

### 4-1. 실행 결과 (2026-09-06 새벽, 브랜치 claude/100x-batch-20260905 → main)

| # | 커밋 | 비고 |
|---|---|---|
| B1 | f9ad874 | gsc-coverage·ga4-sources·log + --selftest 8/8. docs/metrics-log.md 첫 행(2026-09-05 집계) |
| B2 | 810a5d7 | 리포트 3편 item(category 데이터 리포트)·채널 pubDate max. TOP100 updatedDate = max(수기, DART 스냅샷일) |
| B3 | 267bdb4 | siteDates.ts(STATIC_LAST_MODIFIED 2026-07-16·TAX_TABLE_EFFECTIVE_DATE 2026-07-06) · verify-sitemap WebApplication 날짜 WARN 게이트(0건) · 회사 Dataset citation(공시 289곳)·description '추정치 포함' · DART 괴리 5%↑ 인라인 병기·순위 배지 산정값 |
| B4 | dc3a2ad | 주석만(non-comment 바이트 동일 확인) |
| B5 | b1745ab | 리뷰 발견: manifest에 id 없어 start_url 변경 = 앱 identity 변경 → `"id": "/"` 고정으로 기존 설치 호환 |
| B6 | 3279b6e | withUtm 멱등·해시 보존·/share/{base64} 무영향, 카카오 홈 버튼도 kakao/share |
| B7 | 30cc79a | 새 이벤트명 없이 guide_cta_click position=모듈 재사용(9/7 측정기준으로 즉시 분해), 모듈 11종 |
| B8 | eaa39a4 | 셸 6종 + 수기 2종(salary·year-end-tax) 동일 IIFE, URL API 결합 |
| B9 | 1fc6959 | force-static 라우트 6개(BOM CSV·JSON), license=/insights#citation-policy, middleware 제외, 링크는 layout PageFooterAds 아래 |
| B10 | dab0aee | 서버 layout이 경량 맵(<25KB) 계산 → 클라 usePathname 판별. ★감사 오탐 교훈: 주석의 `<PageFooterAds/>` 문자열이 광고 사용처로 집계됨 → 주석에 `<컴포넌트명` 금지 |
| B11 | e471538 | DEC/JAN 세트 3파일(활성은 SEP 유지), OPI 항목은 getCurrentSeasonal(now,{opiAnnounced}) 게이트 |
| B12 | 576823d | Client 7종 import-only diff, 프리즈 테스트 14건, verify-bonus-data data.ts 합산 스캔 |
| B13 | bea24a9 | INFO 41(인접)·4(헤더 가림 /job·/industry 4라우트) — 승인 A 근거 |
| B14 | 92ad362 | 5개사(삼성 15,800·네이버 14,600·카카오 10,900·현대차 13,100·LG엔솔 11,200) |

게이트(푸시 직전): tsc 0 · vitest 227/227 · eslint 0 errors · ad-audit ERROR 0/WARN 0(--diff 신규 후보 0) · verify:sitemap 미등재 0(신선도 WARN 24 기존) · verify:tax 0 · verify:bonus 0 · next build exit 0. 검증 워크플로는 사용량 한도로 리뷰 20/28만 완료 — 미완 항목은 본 세션에서 diff 직접 검토.

---

## 5. 후속 배치 — 코드, 시점 게이트 있음 (배수 계상 없음)

| 시점 | 항목 | 발견 ID | 게이트 |
|---|---|---|---|
| 9/18~9/20 | InstallPwaBanner PV 카운트 수리(usePathname·리스너 즉시 등록·appinstalled 플래그·이벤트 2종) | retention-pv-4 | 9/17 전면최적화 D+14 판정 종료 후, 앵커 ON(9/21)과 다른 날 |
| 9/20 M01 커밋 | 성과급 서브쿼리 title/H1 + 홈 H1 '2026 연봉 계산기 / 실수령액 5초 계산'(2줄 유지, 히어로 높이 불변) + samsung-bonus·sk-hynix 관련 가이드 카드(RelatedGuides 재사용, RelatedCalculators 앞) + BonusClusterLinks 4번째 슬롯 리포트 카드 | naver-onpage-5·peak-season-3·google-authority-2 | 9/20 GSC 28일 '성과급' 판정 후, KR 필터 CSV 기준 |
| 9/21 이후 첫 슬롯 | L13b 본체: opiData.ts 단일 소스·FIXED_OPI1_RATE 치환·TAI H2 null 슬롯+라벨 파생+잔존 문자열 게이트(허용 목록 방식)·ANNUAL_OP 잠정실적 상수(1/8 트리거, 히어로 기존 문장 치환 방식)·공유 상태 URL 해시(d/s/p/y+o1/cr/ins, FloatingShareBar 동기)·시뮬레이터 2종 IO 지연 마운트(고정 min-height)+useDeferredValue | plan-gap-critic-4 ②·peak-season-1/2/4/5 | calcSamsungBonusNet 791/553/252%·MX 50% 회귀 테스트 선커밋, ad-audit --diff 0, 광고 위 높이 불변 증명, 10/31 동결 전 |
| 9/21 이후 | 정본 회사 → lite 이웃 카드(RelatedCompanies 6칸 내 교체, 커버리지 스크립트 실측) | google-technical-7 | 10/19 lite 색인 게이트 전 |
| 9/21 L08a와 같은 날 이후 | _routes.json exclude로 리다이렉트 없는 프리렌더 가족 Worker 우회(≈1,050 URL) | crawl-performance-1 | middleware 우회 부작용(non-www 301·봇 403 상실 → CF 규칙 대체 확인), RSC 프리페치 MPA 폴백·GA4 page_view 영향, TTL=L08a 규칙B와 동일, Purge 런북 |
| 10월 | /calc/[slug] RelatedCompanies 회전(카드 수 불변) · /company/compare 무효 슬러그 404(승인 E 후) · 최근 본 모듈(bookmark_click 실측 후) | retention-pv-8·google-technical-6·retention-pv-3 | — |
| 12월 확정표 슬롯 | 봉급표 5종 공식 별표 전체(1~32호봉) — 마지막 광고 아래 접힘 섹션, data.go.kr 파일 기반, 앵커 3값 검증 | google-clusters-1 | 2026·2027 이중 전사 방지를 위해 12월 한 번에 |
| 2027-02 | 사이트맵 섹션 분할(코드) — 9/13 GSC URL-prefix 속성으로 대체 가능하면 영구 보류 | google-technical-3·crawl-performance-4 | Next 14 generateSitemaps 인덱스 미생성·verify/indexnow/qa-crawl/health-check 4곳 개정 필요 |

---

## 6. 승인 요청 (예/아니오 한 줄, 광고·구조 접촉)

| ID | 요청 | 하방 | 근거 |
|---|---|---|---|
| A | /job·/industry 4라우트 min-h-screen 래퍼에 pt-[var(--header-height)] — **수리로 분류 동의** (HomeTop 라벨 전체·유닛 상단 ≈20px가 fixed 헤더에 가림, unfilled 시 브레드크럼도) | 0 (래퍼 외부 패딩) | adsense-quality-1 |
| B | 성과급 실지급률 리포트 카드: BonusClusterLinks 4번째 빈 슬롯(sk-hynix 등 3장 페이지)만 — 높이 0 증가 변형은 코드로, 캡 5 확장 변형은 승인 | 0 / 카드 1행 | google-authority-2 |
| C | 회사 페이지 430곳 '공시 기반 인용문 + 복사 버튼'(공시 289곳만, 추정 없음) — 위치: 사이드바 aside 최하단(광고 아래) vs 공시 블록 내부(광고 위, 승인) | 위치에 따라 0~1블록 | google-authority-3 |
| D | /calc/samsung-bonus 하단 '출처·기준일' footer(sk-hynix 652행과 동일 text-xs 패턴, RelatedCalculators 직후 — calc/layout 광고 3개 위이므로 승인) 9/21 이후 | 각주 1블록 | ai-channel-4 |
| E | /company/compare/[slug] 무효 조합 404 처리 — '수리' 분류 동의(무효 URL의 GuideMid 노출 표면 삭제) | 0 | google-technical-6 |
| F | 승인⑨(사이드바 단독 이식)에 '기존 /salary-db/[id]·/calc/[slug] 그리드를 본문 전체 2열로 재배치' 병합 | 본문 열 폭 변화 | adsense-quality-5 |
| G | 삼성전자 seedCompanies entry.base 4,800→5,300(보도 초봉, 출처 URL 명기) — title '신입 6,100만원~'로 바뀜, avgAmount는 불변 | 순위 재평가 창 | data-trust-1 |
| H | 1월 홈 배너 1순위 = OPI(발표 후) vs 카드공제 — 코드는 OPI 항목을 null 게이트로 넣어 둠(오늘 배치) | 0 | plan-gap-critic-4 |
| I | 리포트 CSV/JSON license = 사이트 인용 정책 URL(출처 표기 시 자유 인용). CC BY 4.0 등 외부 라이선스 채택 여부 | 0 | google-authority-1 |
| **J** | **CF AI bot policy: Search = Allow · Agent = Allow · Training = Block 유지 — 9/21 캐시 규칙 직후 같은 세션** (결정②를 Phase 5에서 9/21로 앞당김. 현재 AI 검색·에이전트 UA 전부 403) | Worker 요청 소폭 증가(캐시 HIT 전제) | ai-channel-1·F3 |

---

## 7. 콘솔 세션표 추가분 (기존 세션에 병합 — 상세 문구는 `docs/operator-console-pack.md`)

| 세션 | 추가 소항목 |
|---|---|
| 9/7 | GA4 맞춤 채널 그룹: Organic Search에 m.search.naver.com·search.naver.com·m.search.daum.net 추가(기본 채널 그룹은 네이버 모바일 53%를 Referral로 분류) · GA4 페이지 집계는 page_path 기준 · 광고단위 CSV 점검쌍 7종(우발 클릭·커버리지) · 측정기준 목록에 module(=position 재사용) 확인 |
| 9/13 | GSC URL-prefix 속성 4개(/salary-db/listed/, /monthly/, /guides/, /calc/) → 섹션별 색인 수 즉시 · 국가=한국 필터 페이지·검색어 내보내기(판정은 KR만) · 서치어드바이저 검색어·페이지·수집현황 내보내기(앞당김) · GA4: 세션 소스 × 방문 페이지 교차 1장(사내망·AI 리퍼럴 랜딩) + '방문 페이지' 보조 측정기준 · Workers & Pages 사용량 기준선 캡처 |
| 9/21 | 캐시 규칙 B에 sitemap.xml·rss.xml·rss-companies.xml 포함, 기존 /salary/*·robots.txt 규칙 매칭 캡처 먼저, Cache Key에서 utm_* 무시 · 검증 curl.exe … /calc/samsung-bonus 2회 → cf-cache-status HIT·Age>0 확인 후에만 **J(AI bot policy) 실행** → OAI-SearchBot UA 200 확인 |
| 10/5 | 위젯 utm_content(임베드 호스트)·/embed referral·utm_source=pwa·kakao/share 행 확인 · 미국 필터 GSC 결과에서 /salary 숫자 URL 가설 확정 |
| 10/19 | 사내망 코호트 랜딩·AI 리퍼럴 랜딩 재확인 · Workers 사용량 재캡처(피크 대비) |

---

## 8. 프로젝션 (검증 보정치, 전부 추정 — 오전 정본 §6과 동일 골격, 채널 분해만 추가)

| 시점 | 배수 | 하루 | 전제 |
|---|---|---|---|
| 9/30 | ×1.05~1.20 | $11~24 | 27a692c 회수 + 세션 1·2 실행. 자연 성장 +20%/월은 별도 |
| 10/31 | ×1.10~1.40 | $11~28 | 앵커·⑦·인피드 중 2개 통과 + J(AI 개방) |
| 12~1월 피크 | ×1.15~1.45 + 외생 ×1.2~1.4 | $14~40 | L13b·시즌 세트·잠정실적 트리거·공유 상태 URL. 네이버 1월 실측 부재 → 하한만 |
| 2027-03 평시 | ×1.4~2.0 | $14~40 | 동결 해제, AI 채널 1~3%, 구글 성과급 장르 1페이지 |
| 2027-09 | ×2.5~4 | $25~80 | lite Phase 2·헤더 다이어트·인용 백링크 누적·CPA 머천트 |
| 2028-03 | ×4~8 | $40~160 | 구글 회사축 일부 1페이지(백링크·리포트 인용 12개월 누적)·AI 채널 5% |
| **100배** | 세션 ×30~40 | $1,900 | 현 사이트 성격에서 계획 기간 밖. 재검토 조건: 구글+AI 세션이 네이버의 30%를 넘는 달이 생길 때 |

---

## 9. 이번 진단에서 기각된 것 (재제안 방지 — 21건 중 주요)

| 발견 | 기각 사유 |
|---|---|
| 미국 1,208노출 = /salary 숫자 URL(확정으로 쓰는 것) | 익명화 쿼리라 CSV로 확정 불가 → 가설로만 기록, 9/13 확정 |
| /salary-db/compare 성과 페어 사이트맵 재등재 | 결정 대기 #5(현행 유지)와 중복, 색인 거부 이력 |
| article:modified_time 전 페이지 출력 | 성과급 2종은 이미 출력, 배수 근거 없음 |
| 성과급·직업 가시 갱신일 배지 | 절반 거짓(JobOfficialStats 기준연도 있음), 효과 미측정 |
| '{회사} 초봉' H2 exact-match | title·description·FAQ에 이미 존재, 3개월 3클릭 규모 |
| 회사 페이지 상단 '정답 문장' 블록 | CompanyDisclosedSalary가 이미 광고 위 상단에 있음 |
| Bingbot Crawl-delay 완화 · AI 검색봇 robots 그룹·middleware 화이트리스트 | CF 403 해제 전엔 무의미, Worker 한도 대응 유지 |
| /salary → /monthly 링크 · 회사 페이지 HomeTop 아래 링크 스트립 | /monthly 인바운드는 푸터 외에도 존재 / HomeTop은 마지막 광고가 아님(layout PageFooterAds) → 광고 위 삽입 |
| Multiplex로 끝나는 6군 하단 링크 | qna·glossary는 layout 광고가 뒤에 있어 규칙 2 위반 |
| /salary·/monthly 결과 직하 2연속 유닛 | InArticle과 CalcResult 사이에 공제 상세 카드 존재, 간격 64px |
| Link prefetch={false} 0곳 | AppLink 래퍼가 전역 prefetch=false 강제(a9aa3cc) — 이미 배포 |
| 성과급 용어 글로서리 | 1노출 쿼리, 규모 없음 |
| '{회사} 성과급' 비계산기 회사 10종 | 절반은 계산기 존재 |
| 삼성 성과급 "858%와 791%는 분모가 달라 비교 불성립" | 검산 결과 동일 분모(연봉 8,000만) — 수치는 정합. 남은 건 page.tsx:554 "월 기본급 대비" 문구 오기뿐(9/21 이후 동봉) |
| FY2025 공시 41곳 lastUpdated 2025-11 | 실제 16곳, 그중 9곳만 해당 — 규모 4.5배 과장 |
| 헤더 2중 SSR 다이어트 앞당김 · Workers 한도 항목 | 2월 순연 기각 목록 / L08a·세션표에 이미 존재 |

---

## 10. 불변 규칙 (이번에 추가 확정)
1. 세션 배수 서사는 채널별로 쓴다(네이버·direct/사내망·구글·AI). 채널 합산 배수를 레버 배수로 쓰지 않는다.
2. 판정 CSV는 국가=한국 필터만(미국 1,208노출 오염). GA4 채널 판정은 맞춤 채널 그룹(네이버 모바일 = Organic Search) 또는 소스/매체 행 합산으로만.
3. samsung-bonus 4파일(page·shared·Client·taiData) 접촉은 9/21 이후 한 번에(M01·L13b·공유 해시·시뮬레이터 동봉), title/description은 M01만.
4. 크롤 개방 순서: L08a 캐시 HIT 확인 → J(AI bot policy) → Bingbot 완화·lite 2차 → llms.txt. 순서 역전 금지.
5. 코드 레버는 배수를 계상하지 않는다(전부 ×1.00~1.01). 프로젝션은 콘솔 실행·시즌·색인 숙성만으로 쓴다.
6. 데이터 표면 정합: 수기 disclosed 우선은 유지하되 5% 초과 괴리는 DART 산정치를 병기한다. 역산 추정 금지.

## 11. 근거
- 진단 원자료: 세션 scratchpad `findings.json`(78건·검증 2표), `lens-summaries.md`, `brief.md`
- 실측: GA4 개요 CSV 소스/매체·일별·지역 섹션(리포 밖 보관), 수동유닛 CSV 재집계, curl(AI UA 10종·캐시 헤더·robots.txt), GSC 8/16 CSV 재집계
- 정본 연계: `docs/revenue-10x-plan-2026-09.md`(§2-3 실행 현황에 배치 1 행 추가) · `docs/operator-console-pack.md`(§7 병합) · `docs/ad-experiments.md`(커버리지 보고) · `docs/gsc-sniping-log.md`(F7 가설)
