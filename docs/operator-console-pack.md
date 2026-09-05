# 운영자 세션표 — 코드 0줄로 수익 올리는 콘솔 작업 (2026-09-05 개정)

정본 계획: `docs/revenue-10x-plan-2026-09.md` §4·§5 + `docs/revenue-100x-plan-2026-09.md` §6(승인 A~J)·§7(세션 추가분, 2026-09-05). 이 문서는 그 세션표의 실행판이다.
원칙: **한 세션 = 최대 3항목·25분**, 격주 고정 요일. 각 항목은 클릭 경로 ≤5줄 + 완료 증빙 1장.
메뉴 이름이 다르면 첫 화면 캡처만 보내면 경로를 보정한다. 무응답 = 보류(자동 승인 없음).

## 완료·수령 기록
- ✅ 2026-08-16 카카오 JS 키 반영 · 2026-08-24 GUIDE_MID 디스플레이 유닛(1848295488) 발급·env 교체
- ✅ 2026-09-05 **AdSense 일별 보고서**(2025-09-19~2026-09-05, 수익·PV·RPM·노출·Active View·클릭) + **GA4 개요**(2026-01-01~09-05, 활성 사용자·페이지 제목별 조회) + **광고 단위 목록** 캡처 수령
  → 보관 `C:\Users\ruby1\.moneysalary-secrets\adsense\` (리포 밖). 집계는 계획서 §2.
- ✅ 2026-09-05 코드 배포: 27a692c(IN_ARTICLE 폭 0px) 병합 · 광고 채움 계측 · 하단 고정 UI 앵커 감지 · 회사 RSS 소스 교체·자동발견 링크 · 헬스체크 주간 cron
- ✅ 2026-09-05/06 **배치 1(B1~B14) 코드 완료** — 브랜치 `claude/100x-batch-20260905`(metrics-ingest·rss 리포트 3편·신선도 단일 상수·PWA manifest·공유 utm·내부링크 귀속·위젯 utm_content·리포트 CSV/JSON·회사→직업 링크·12/1·1/2 세트+OPI 게이트·계산기 7종 data.ts+SK 키트·ad-audit INFO 게이트·companyData 정합). main 푸시는 이 세션. 정본 `docs/revenue-100x-plan-2026-09.md` §4, 실행 현황 `docs/revenue-10x-plan-2026-09.md` §2-3. 콘솔 작업 0건(아래 세션표에 하위 항목으로만 병합).
- ✅ 2026-09-06 **광고 단위별 CSV**(13행·합계 $131.32) + **GSC 361일 내보내기**(countries·devices·dates·pages·queries·appearance) 수령 → 보관 `C:\Users\ruby1\.moneysalary-secrets\adsense\` · `...\gsc\2026-09-06\`(리포 밖). 집계·판정은 `docs/revenue-100x-plan-2026-09.md` §1 F13~F17 · `docs/gsc-sniping-log.md` Round 2. ★두 자료가 9/7·9/13 세션 항목을 앞당겨 해소했으므로 **아래 세션표의 해당 항목을 축소·교체**했다(신규 세션 없음).
- (참고 — 콘솔 조작 아님) 브리프의 "GSC 16개월"은 실제로 **361일(2025-09-08~2026-09-03)**이고 "2026-09 6일분 104클릭"은 **3일분(9/1~9/3)**이었다. 다음 내보내기 때 기간 라벨을 실데이터 범위로 적어 주시면 창 판정이 빨라집니다.

## 세션 1 — 9/7 (20분 + 하위 항목 ≤5분 — 25분 초과분은 9/21 세션 3 ④ 여유 슬롯으로 이월)
1. ☐ **GA4 데이터 보관 14개월** (1분): analytics.google.com → 왼쪽 아래 관리(톱니) → 데이터 수집 및 수정 → **데이터 보관** → 이벤트 데이터 보관 **14개월** → 저장. 증빙: 저장 화면 캡처.
2. ☐ **GA4 맞춤 측정기준 5개** (8분): 관리 → 데이터 표시 → **맞춤 정의** → 맞춤 측정기준 만들기 → 범위 **이벤트** → 측정기준 이름·이벤트 매개변수에 같은 값 입력 → 저장. 5개: `slot_kind`, `position`, `calc_type`, `offer_id`, `vertical`. 증빙: 맞춤 정의 목록 캡처 1장. (나머지 8개 `page`·`company_id`·`method`·`content_type`·`size_key`·`target_path`·`metric_name`·`metric_rating`는 9/21)
   - 2-b **맞춤 채널 그룹(3분)**: 관리 → 데이터 표시 → **채널 그룹** → 새 채널 그룹 만들기(기본 복사) → Organic Search 규칙에 '세션 소스 정확히 일치' `m.search.naver.com` / `search.naver.com` / `m.search.daum.net` OR 추가 → 저장 → **보고서 기본 채널 그룹으로 지정**. 이유: 기본 채널 그룹은 네이버 모바일 검색(세션 53%)을 Referral 로 분류. 맞춤 채널 그룹은 조회 시점 적용(소급 반영)이라 25분 초과 시 9/21 세션 3 ④로 이월해도 손실 없음. 페이지 집계는 `page_title` 대신 **`page_path`** 측정기준 사용(삼성전자 2제목 분리 함정).
   - `position`(이벤트 범위, 매개변수 position)이 위 5개에 포함돼 있으면 추가 작업 없음 — 기존 related-calc·next-action·related-guide 외에 내부 링크 모듈 id 11종(industry-rank·related-companies·company-connections·bonus-cluster·year-end-cluster·sibling-hubs·listed-band·job-related-calc·job-companies·job-pay-table·job-siblings)도 값으로 들어옴(별도 등록 불필요, 등록 전 데이터는 이벤트 수만 보이고 모듈 분해 불가 — M04와 동일 주의). `href`/`slug`는 측정기준으로 등록하지 말 것(일 500 고유값 한도 초과 시 절삭).
3. ☐ **AdSense 광고 단위 CSV 1장** (4분 — ★2026-09-06 축소: 종전 3장 중 **앞의 2장(8/3~8/16 · 8/17~8/30)은 취소**): adsense.google.com → 보고서 → 날짜 **최근 28일** → 분류 기준 **광고 단위** → 표 우측 상단 다운로드 CSV. 파일명 `2026-09-07-units-28d.csv`. **원본은 리포에 넣지 않는다**(채팅 첨부만). **취소 사유**: 실험 #1은 전 창(8/3~8/16)에 유닛이 **1.03일**만 존재했고(f5c1375 2026-08-15 23:21 KST) 표본도 19클릭이라 그 2장을 받아도 판정이 불가능하다 — 실험 #1은 "판정 불가·현상 유지"로 **종결 권고**(승인 L, docs/ad-experiments.md). **이 1장의 목적은 실험 판정이 아니라** 결과창_본문(5584143639) 우발 클릭 서명이 **현재도 발화 중인지** 재판정하는 것이다(누적 CTR 4.147%는 7~8월 유산이고 9/1~9/4 수동 CTR은 2.20%). 절약된 8분은 아래 정책 센터 캡처와 9/13 항목으로.
   - **점검 후보쌍 7종(유닛×페이지군)과 판정 서명** — `node scripts/adsense-report.mjs units <28d.csv> --md` 표를 이 기준으로 읽는다. 서명은 내부 휴리스틱(8월 평균 대비, AdSense 정책 기준 아님): 우발 클릭 = CTR≥3.5% AND CPC≤$0.015(스크립트 플래그; Active View<50% 는 수동 판독) · 미채움 = 커버리지<80%(8월 94%) · 저뷰어빌리티 = Active View<45%.
     (1) 결과창_본문 5584143639 × /salary·/monthly(NextActions 직하)·/calc/[slug] SimpleCalculatorView(ShareSection 직하)·홈 SalaryCalculator(NextActions 직후)·listed/[stockCode](9/2 신설) — 우발 1순위 ·
     (2) 인아티클 3302558597 × 홈·/salary SalaryResultCard(결과 카드↔공제 상세 사이)·samsung-bonus(시뮬레이터 직하)·/calc/[slug] — 우발 2순위(27a692c 9/5 이후 첫 요청분은 구간 분리) ·
     (3) 상단 9958502911 × /job·/industry(fixed 헤더 가림 — 승인 A)·홈 히어로 직하·계산기형 15곳 H1 직하(⑦) — 저뷰어빌리티 ·
     (4) 멀티플렉스 1910866475 × 본문 끝 목록형(job·industry·region·hub·qna·glossary·compare·insights) — 미채움 1순위 ·
     (5) 가이드중간 1848295488 × listed 219p·/tools 24·인덱스 12(9/2 신설) — 미채움 2순위 ·
     (6) PC_날개 1397486615 × salary-db/[id]·calc/[slug]·/salary 하단 그리드·guides — 저뷰어빌리티 ·
     (7) 디스플레이2 8284703133 × /monthly·/table·홈 — ★실험 #1은 2026-09-06 **판정 불가·현상 유지 확정**(측정 설계 불성립)이므로 이제 판정 축이 아니다. 그래도 **관찰만·변경 금지**(승인 L 확정 전까지 배치 불변).
     주의: CSV 는 유닛 단위(2026-09-06 실측 **13행** — 현재 배선 7 + 사장 유닛 6종)라 페이지군 귀속은 9/13 세션 2 ②의 GA4 탐색(ad_unit_click·ad_unfilled × slot_kind × page_path — 9/7 측정기준 등록 이후 적재분만, prefix 단위) 보조 귀속표이며 **판정 축은 광고단위 1축**. ★그리고 **날짜 열이 없는 CSV(계정 누적표)는 어떤 창 판정에도 쓸 수 없다** — 2026-09-06분이 그랬다(F13). 반드시 **날짜 맞춤 지정**으로 받아야 창 비교가 성립한다. 커버리지 비교는 배치 변경 0건 유닛(상단·디스플레이2)도 같은 창으로 봐 "코드 vs 트래픽 믹스"를 먼저 가르고, 9/2~9/4 vs 9/5~ 구간을 나눠 읽는다. 결과는 docs/ad-experiments.md 9/17 판정 절에 "유닛×페이지군 후보표(보조)"로 기록, 철회·수리는 승인 항목으로만.
   - [코드 산출] `node scripts/ad-audit.mjs --verbose` 의 [인접] 41건·[헤더가림] 4건 목록을 보고 실제 화면에서 간격(광고↔공유 버튼)·헤더 겹침을 눈으로 확인, 수리할 항목만 승인 큐에 체크(자동 수정 없음). 운영자 눈 확인 3건(각 1분, 여유 시): ① 모바일에서 /job/개발자(임의 1곳)·/industry/it(임의 1곳)·/job·/industry 4종을 열어 상단 광고가 fixed 헤더(72px)에 가려지는지 → 가려지면 '헤더 가림 4곳 래퍼 pt-header 수리'(100배 계획 승인 A) 예/아니오 ② AdSense '광고 단위별' CTR 3% 이상 유닛이 있으면 [인접] 목록 중 해당 페이지와 대조 — 겹치는 곳만 '간격 수리' 승인 큐에 체크 ③ 공유 섹션 바로 위에 광고가 있는 시즌 페이지(year-end-tax-2026·tax-rates-2026·social-insurance-rates-2027 등 HomeTop+Multiplex 가 ShareSection 을 사이에 둔 9곳) 모바일에서 광고↔공유 버튼 여백이 손가락 한 마디(약 24px) 이상인지.
   - ☐ **AdSense > 계정 > 정책 센터 캡처 1장 (2분, 신규 2026-09-06)**: adsense.google.com → 계정 → **정책 센터** 화면 1장 + "무효 클릭 / 무효 트래픽" 관련 **알림 이력**이 있으면 그 문구 그대로 채팅에. 목적: 결과창_본문(수동 수익 **64.5%** · 사이트 누적 수익 **9.98%**)의 **정책 리스크 상한 확정**. 알림 0건이면 리스크 상한이 닫히고 **승인 M(⑦ 위치 이동 앞당김)을 계속 보류**할 수 있다 — 지금 이 유닛을 근거 없이 건드리면 상방은 불명확한데 하방이 사이트 수익의 10%다.

## 9/8 (10분)
- ☐ 건강보험 요율 결정 결과 한 줄: "인상 총요율 X.XX% (근로자 Y.YYY%) 시행 2027-01-01, 부과체계 변경 없음" 또는 "동결". 키트: `docs/drafts/health-rate-2027-kit.md`.
- ☐ LinkPrice 대시보드 → 리포트 → 기간 8/25~9/7 → **u_id** 열 기준 클릭·승인·커미션 캡처 1장.
- ☐ (배치 1 배포 다음날 1회, 2분) 위젯 크로스 오리진 확인 — `file://` 가 아닌 임의 도메인(CodePen 등)에 `<iframe src="https://www.moneysalary.com/widget/salary">` 를 넣고 위젯 CTA 우클릭 → 링크 주소 복사 → `utm_content=<그 도메인>` 이 붙는지 확인(위젯 엣지 캐시 s-maxage 86400 이라 배포 다음날). /widget/salary 를 새 탭으로 직접 열면 referrer 가 없어 utm_content 가 안 붙는 것이 정상.

## 세션 2 — 9/13 (실소요 31~35분 — 25분에서 끊을 경우 우선순위: ①기간 지정 units CSV(9/6~9/12) → ②GSC URL-prefix 속성 4개 → ③나머지는 9/21 세션 3 ④로 이월)
1. ☐ **서치콘솔 내보내기** (14분): search.google.com/search-console → ① 색인 생성 → **페이지** → 우측 상단 내보내기(전체) + 하단 "색인이 생성되지 않는 이유" 각 행(발견됨-현재 색인 안 됨 / 크롤링됨-현재 색인 안 됨 / 중복) 클릭 후 각각 내보내기 — ★**같은 화면에서 "색인 생성됨" URL 목록도 함께 내보내기**(신규 2026-09-06: 실적 CSV의 노출 0은 색인 실패가 아니라 **순위 부재**일 수도 있어 둘을 구분하려면 이 목록이 필요하다. /salary-db/listed/ 219곳은 실적 CSV에 3페이지·19노출뿐인데 pages.csv가 내보내기 상한 1,000행에 걸려 노출 1~2짜리가 잘렸을 수 있어 3/219는 **하한**이다) ② 실적 → 검색결과 → 날짜 **최근 28일** → 내보내기(zip: 검색어·페이지·국가·기기) ③ 같은 화면에 필터 **국가: 미국** 추가 → 페이지·검색어 탭 내보내기, **이어서 국가: 한국으로 바꿔 페이지·검색어 탭 한 번 더 내보내기**(이후 모든 CTR·순위 판정은 한국 필터 CSV 만 사용) ④ 링크 → **외부 링크 내보내기** + 총 외부 링크 수 캡처 ⑤ ★**"수동 조치" · "보안 문제" 탭 캡처 1장**(신규 2026-09-06 — 2026-01-08 노출 계단 사건의 사후 원인 확인: 01-07 232노출/14.8위 → 01-08 7노출 → 이후 113일 4.5노출/일. 붕괴 기간 중 커밋은 0건이나 직전 2025-12-22~30에 21건이 배포돼 "구글 측 사건"으로 단정할 수 없다).
   - 파일은 zip 그대로 + 사유별 내보내기 CSV 3장을 채팅 첨부 → 보관 `C:\Users\ruby1\.moneysalary-secrets\gsc\2026-09-13\` (리포 밖). Claude 가 `scripts/metrics-ingest.mjs` 로 집계해 `docs/metrics-log.md` 1행 기록. (Claude 보고) 미국 필터 페이지 탭에서 /salary/{숫자} 가 지배적인지 1회 확인 → docs/gsc-sniping-log.md 의 '숫자 쿼리 URL 매칭' 가설 확정(10/5 보고).
   - ★**기기 = 데스크톱 + 국가 = 한국 이중 필터로 페이지 탭 1장 더(2분, 신규 2026-09-06)**: 같은 실적 화면에서 필터를 두 개 겹쳐 내보내기. 이유 — 361일 실측에서 데스크톱 노출 10,773 중 **최소 7,041이 국내**이고 국내 데스크톱 CTR은 약 6.3%(모바일 약 21%)다. 데스크톱을 통째로 "해외 노이즈"로 처리하면 **전체 노출의 절반을 놓친다**(Round 1의 "데스크톱 6.7%는 오염 분모"는 미국 필터에만 해당).
   - ★**검색어 "성과급" 필터 + 커스텀 기간 2창(3분, 신규 2026-09-06)**: 실적 → 검색어 필터 `성과급` → 날짜를 **맞춤 8/9~8/22**로 1장, **맞춤 8/23~9/5**로 1장(합 2장). 이유 — 9/20 R1.5 판정(8/23 성과급 클러스터 개편의 단독 효과)은 기본 "최근 28일"(약 8/16~9/12) 내보내기로는 **전 창이 잘려 판정 불가**다. ★그래도 8/25 SK 총투표 부결 뉴스와 9/3 전면최적화 10커밋이 같은 창에 섞여 완전 귀인은 불가하므로, 판정 시 **/calc/samsung-bonus 단독 지표와 "나머지 사이트" 지표를 분리 집계**한다(8/15~9/3 순증 449클릭 중 264 = 58.8%가 이 한 페이지).
   - ★**GSC URL-prefix 속성 4개 추가(2분) — 반드시 실행(2026-09-06 승격)**: 속성 추가 → URL 접두어 → `https://www.moneysalary.com/salary-db/listed/`, `/monthly/`, `/guides/`, `/calc/` 각각 → 도메인 속성 하위라 자동 검증 → 각 속성의 "페이지" 화면에서 섹션별 색인 수 즉시 확인. **이것이 10/19 lite 색인 게이트의 원자료를 9/13으로 앞당긴다** — 그 수치가 나오기 전까지 lite 2차 투자와 "정본 회사 → lite 이웃 카드"(100배 계획 §5의 9/21 이후 항목)는 보류. ★게이트 축은 GSC **실적** CSV가 아니라 **색인(페이지) 보고서 + 네이버 서치어드바이저 수집현황**이다(실적의 노출 0 ≠ 색인 실패).
   - **서치어드바이저 내보내기(5분, 10/5 에서 앞당김)**: searchadvisor.naver.com → 리포트 → **검색 유입** → 검색어·페이지(최근 28일) 각 내보내기 + **콘텐츠 수집 현황** 캡처 1장 → 10/5 는 RSS 제출·재캡처만. 네이버 회사 축(페이지×검색어) 기준선.
2. ☐ **GA4 유입 경로** (5분): 보고서 → 획득 → **트래픽 획득** → 기본 측정기준 **세션 소스/매체** → 날짜 최근 28일 → 우측 상단 공유 → **파일 다운로드(CSV)**. 세션 1 에서 맞춤 채널 그룹을 만들었으면 '세션 기본 채널 그룹' 열도 함께(항목 수 불변).
   - 같은 표에 보조 측정기준 **방문 페이지** 추가 → 세션 소스 × 방문 페이지 교차 CSV 1장 더(사내망 `sec.media.samsung.net`·AI `chatgpt.com` 이 어느 페이지에 착지하는지 — AI 채널 D0 기준선, 결정②/승인 J 해제 여부와 무관하게 유효). /share/* 와 /calc/*?v= 랜딩은 noindex 라 utm 없이도 공유 유입으로 분리됨. 같은 표에서 `kakao / share`·`copy / share`·`webshare / share` 행 출현 여부만 확인(배포 후 7일치 — 비중 판정은 10/5 로 이월). `pwa / homescreen` 세션 수는 기준선 0 확인만(설치된 클라이언트가 SW v2·새 manifest 를 수신하기 전이라 0이 정상) → 값은 docs/metrics-log.md.
   - 주의: `utm_medium=share` 는 GA4 기본 채널 그룹에서 Unassigned 로 떨어진다 — 채널 그룹 보고서가 아니라 **소스/매체 행**으로 읽을 것. 커뮤니티(dcinside·fmkorea) referral 행은 `copy / share` 로 일부 이동하므로 전월 비교 시 합산.
   - **탐색 분석 2개(5분)**: ① 자유 형식: 행=`position`, 열=이벤트 이름(`guide_cta_click` 필터), 값=이벤트 수·총 사용자, 세그먼트 없음, 기간=배포일~9/12 → CSV(`ga4-guide-cta-position-0913.csv`); 2차 표 행=페이지 경로+position(`/salary-db/*` 필터)로 모듈별 클릭/PV — 7일치라 상대 순위용, 실질 판정은 10/5 D+28 재조회. ② 이벤트 in {`ad_unit_click`, `ad_unfilled`} × `slot_kind` × `page_path`(9/7 등록 이후 적재분 ≈5일치, prefix 단위) → 9/7 후보쌍 7종의 페이지군 귀속(보조 귀속표 — 판정 축 아님, 셀 클릭<50 은 판정 보류).
3. ☐ **★AdSense 광고단위 기간 지정 CSV + 기기별 + 서치콘솔 사이트맵** (12분): **① 1순위(신규 2026-09-06) — 보고서 → 날짜 맞춤 `2026-09-06~09-12` → 분류 기준 광고 단위 → CSV 다운로드**(파일명 `2026-09-13-units-0906_0912.csv`). 이 한 장이 27a692c(IN_ARTICLE 3302558597) 회수 판정의 **유일한 자료**다 — 판정선: 주 요청 **≥5,000**(≈노출 4,500) 완전 회수 / **1,000~5,000** 부분 회수 / **<1,000** 미회수·재조사. **② 2순위 — 같은 화면에서 가능하면 "날짜 및 광고 단위" 교차 보고서 1장(2026-09-01~09-08)**, 불가하면 창 지정 units 2장(9/1~9/2 · 9/3~9/6): 9/3~9/4 수동 유닛 커버리지 하락(93.2%→84.5%)의 **멀티플렉스 단독 귀속 확정**용 — 멀티플렉스(1910866475) 일 요청이 9/3부터 약 1,000건대로 뛰었는지만 보면 닫힌다(승인 K 판정 자료). ★교차 보고서 1장이 ①까지 함께 해결한다면 **그것 하나만 받아도 된다**. **③ 분류 기준 기기**(모바일/데스크톱 노출·RPM) 캡처 1장. 원본은 리포에 넣지 말고 채팅 첨부만. 서치콘솔 → 색인 생성 → **Sitemaps** → sitemap.xml 행 "다시 제출". 상단 URL 검사창에 아래 5개를 하나씩 넣고 **색인 생성 요청**: `/civil-servant-pay-2027`, `/chuseok-bonus-2026`, `/calc/bonus-calculators`, `/salary-db/ranking`, `/year-end-tax-2027`.
   - (≤1분) Cloudflare → Workers & Pages → **사용량**(일 요청·CPU 시간) 화면 1장 캡처 — 9/21 규칙 B 생성 전 기준선(CR-01·02 우선순위 판정값).
   - (한 줄 답변) 리포트 CSV/JSON 의 데이터 라이선스는 현재 사이트 인용 정책 URL(`/insights#citation-policy`, 출처 표기 시 자유 인용) 사용 중 — CC BY 4.0 등 외부 라이선스 채택 여부(100배 계획 **승인 I**). 무응답 = 현행 유지.

## 세션 3 — 9/21 (25분)
1. ☐ **Cloudflare 캐시 규칙** (12분): dash.cloudflare.com → moneysalary.com → Caching → **Cache Rules** → 기존 규칙 목록 캡처(특히 /salary/* 규칙이 있으면) → 규칙 2개 생성(표현식은 세션 당일 채팅으로 제공: A = `rsc`·`next-router-prefetch` 헤더 Bypass 상단, B = GET·/api /widget /share /private 제외 Edge TTL 1시간 Override·Browser bypass·200만) → Deploy → Caching → Configuration → **Purge Everything** → 사이트에서 헤더 메뉴 3번 클릭해 정상 이동 확인 → Workers & Pages 사용량 캡처 1장.
   - **규칙 B 대상 확인**: `sitemap.xml`(354KB)·`rss.xml`(237KB)·`rss-companies.xml`(98KB) 3종 모두 DYNAMIC 실측이라 규칙 B 에 포함. `robots.txt` 는 기존 규칙으로 이미 14400 캐시(REVALIDATED)라 추가 불필요 — 대신 **기존 `/salary/*`(14400)·`/robots.txt` 규칙이 어떻게 매칭되는지 캡처를 규칙 B 생성 전에 먼저**(9/13 Workers 사용량 기준선 캡처도 선행). `_not-found`(443KB)는 status 200 조건과 충돌하므로 규칙 B 에 넣지 말고, 넣으려면 status 404·짧은 TTL 별도 규칙 + 배포 직후 Purge 런북 조건부.
   - **Cache Key**: 규칙 B 의 Cache Key 설정에서 Query String → 쿼리 `utm_source`·`utm_medium`·`utm_campaign`·`utm_term`·`utm_content`(및 `?tab=`) 무시(Custom cache key 에서 utm_* 제외) — PWA start_url 이 `/?utm_source=pwa&utm_medium=homescreen` 이고 공유 링크가 채널별 utm 을 달아 홈·계산기 HTML 캐시 키가 쿼리별로 분산(미스율·Worker 호출 증가)되지 않도록, 규칙 생성과 같은 세션에서 처리.
   - **검증(HIT 게이트)**: Purge Everything 후 `curl.exe -s -D - -o NUL -A "Mozilla/5.0 Chrome" https://www.moneysalary.com/calc/samsung-bonus` 를 2회 실행 → 두 번째 응답 `cf-cache-status: HIT`·`Age > 0` 확인. **미달 시 AI 봇 해제(아래)·Bingbot Crawl-delay 완화·lite 2차 발행 전부 보류.** (실측 2026-09-05: /calc·/salary-db·홈 HTML 은 DYNAMIC, max-age=0, must-revalidate — next.config headers() 의 s-maxage 는 프리렌더 HTML 에 미적용. /salary/* 14400 은 대시보드 규칙 기인.)
   - **HIT 확인 후 → AI bot policy(승인 J, 운영자 예/아니오, 2분)**: Security → Settings → **Configure AI bot policies**: Search = **Allow**, Agent = **Allow**, Training = **Block 유지** → 저장 → 검증 `curl.exe -s -o NUL -w "%{http_code}" -A "Mozilla/5.0 (compatible; OAI-SearchBot/1.0)" https://www.moneysalary.com/calc/samsung-bonus` → **200**. 배경: 2026-09-05 실측에서 CF 엣지가 OAI-SearchBot·ChatGPT-User·PerplexityBot·Claude-SearchBot·Claude-User·GPTBot·DuckAssistBot 전부 403(robots.txt 의 CF 관리 블록 9종 + Content-Signal ai-train=no 는 별개). 해제해도 자동광고·검색 무접촉, 효과는 AI 답변엔진 인용·Gemini 앱 그라운딩 노출뿐(AI Overview·AI Mode 는 Googlebot 이라 무관). 하방: Worker 요청 소폭 증가(캐시 HIT 전제).
2. ☐ **앵커 광고 ON + 인피드 단위 발급** (8분): AdSense → 광고 → **사이트 기준** → moneysalary.com 연필 → 저장 전 패널 전체 캡처 1장(현재값) → **앵커 광고: 사용**, **사이드 레일: 사용 안 함**, **동적 앵커(접이식): 사용 안 함**, 전면(비네트)·인페이지 설정은 **건드리지 않음** → 사이트에 적용 → 저장 후 캡처 1장 + 채팅에 "앵커 켬 9/21". 이어서 광고 → **광고 단위 기준** → **인피드 광고** → 이름 `머니샐러리_인피드` → 스타일 자동 제안 → 만들기 → 코드의 `data-ad-slot` 숫자와 `data-ad-layout-key` 값을 채팅으로 전달.
3. ☐ **LinkPrice 머천트 실사** (5분+): LinkPrice 대시보드 → 머천트 검색에 `카드`·`증권`·`ISA`·`IRP`·`대출비교`·`보험` 각각 → 결과 화면 캡처(모집 중 여부·커미션·소재 규정). 있으면 제휴 신청(머천트당 3분). **없으면 '없음' 한 줄** — 그러면 제휴 확장 항목은 계획에서 제거된다.
4. (여유 시) GA4 맞춤 측정기준 나머지 8개 + 세션 1·2 에서 이월된 하위 항목(맞춤 채널 그룹 등).

## 9/27 (3분)
- ☐ LinkPrice 리포트 u_id 승인 확정분 재캡처(인정기간 20일).

## 세션 4 — 10/5 (25분)
1. ☐ **네이버 서치어드바이저** (10분): searchadvisor.naver.com → 웹마스터 도구 → moneysalary.com → 요청 → **RSS 제출** → `https://www.moneysalary.com/rss.xml`, `https://www.moneysalary.com/rss-companies.xml` 각각 제출(회사 피드는 10/5 이전에 설명문 갱신 배포가 끝난 뒤가 맞다) → 리포트 → 검색 유입(검색어·페이지 최근 28일)·콘텐츠 수집 현황·사이트 진단 각 캡처(검색어·페이지 **내보내기**는 9/13 세션 2 ①로 앞당김 — 여기서는 RSS 제출 + 재캡처만).
   - **제출 직전 확인**: 브라우저에서 `https://www.moneysalary.com/rss.xml` 을 열어 /insights 리포트 3편(성과급 실지급률·상장사 평균연봉 TOP100·업종별 초봉)이 `<category>데이터 리포트</category>` item 3건으로 실려 있는지 확인 후 제출 — 2026-09-05 코드 합류분(배포 후 최대 1시간 캐시 s-maxage=3600 반영 대기).
2. ☐ **네이버 검색 5개 캡처** (10분): 시크릿 창에서 `삼성전자 연봉`, `한화시스템 연봉`, `중부발전 연봉`, `삼성전자 성과급 계산기`, `머니샐러리` — PC·모바일 첫 화면 각 1장(우리 위치·AI 브리핑 유무).
3. ☐ **앵커 판정 자료** (5분): AdSense 보고서 → 최근 28일 → 분류 기준 **광고 형식**(자동 광고: 앵커/인페이지/비네트) 캡처 1장 + 정책 센터 경고 0 확인 캡처.
   - **GA4 트래픽 획득 3건(같은 화면에서 보조 측정기준만 교체, 합 5분 — 초과 시 10/19 이월)**: ① 세션 소스/매체 `pwa / homescreen` 세션 수 1차 판정(9/13 기준선 0 대비) — 재방문 20~25% 중 PWA 기여분 귀속. 0이면 신규 설치 부재(InstallPwaBanner 노출/수락률 A3 ⑪과 함께 점검), 웹푸시 등 알림 제안으로 확장 금지(기각 레버) ② `kakao / share`·`copy / share`·`webshare / share` 행 비중 판정(9/13 은 존재 확인만) — 공유 코호트가 direct 절반 이상이면 공유 카피·OG 후속(세션 +2~5% 이하) 검토 ③ **위젯 임베드 호스트**: 보조 측정기준 **'세션 수동 광고 콘텐츠'**(utm_content) 추가 → 필터 '세션 소스' 정확히 일치 `widget` → 행(hostname)별 세션·참여 세션 수를 docs/metrics-log.md 에 기록(맞춤 측정기준 등록 불필요, 기본 제공 — R2 B2·B3 KPI '임베드 도메인 수' 데이터 소스). 값이 `(not set)` 만이면 배포 후 24h 미경과(엣지 캐시) 또는 임베드 호스트가 no-referrer 정책. 네이버 블로그는 임의 iframe 미허용이라 사실상 티스토리·워드프레스·기업 블로그만 집계.
   - (Claude) 9/13 탐색 분석(guide_cta_click × position)을 기간 배포일~10/4(D+28)로 재조회해 내부 링크 모듈 순위 확정 — 9/13 수치는 7일치라 상대 순위 참고용.

## 세션 5 — 10/19 (20분)
1. ☐ 서치콘솔 색인 생성 → 페이지 내보내기 재수출(상장사 219곳 색인률 게이트). 내보내기 시 **"색인 생성됨" 행도 내보내기(URL 목록)** — 상장사 /salary-db/listed/ 색인률을 색인+미색인 목록으로 계산하기 위함(없으면 `--section-total 219` 로 근사; 9/13 에 만든 URL-prefix 속성 `/salary-db/listed/` 의 페이지 화면이면 직접 읽힘).
2. ☐ AdSense 보고서 → 페이지 필터 `/salary-db/ranking`·`/salary-db/listed/`·`/guides` 전/후 14일 + 인피드 유닛 행 CSV(인피드 판정).
3. ☐ LinkPrice 캡처 + "상장사 확장 2월 진행 / 보류" 한 줄. + (같은 GA4 화면) 사내망·AI 리퍼럴 랜딩 재확인(9/13 교차표 대비) + Cloudflare Workers & Pages 사용량 재캡처(규칙 B 이후·피크 대비).

## 월 1회 루틴 (11/2 · 12/7 · 1/4, 15분)
AdSense 페이지·광고단위 28일 CSV 2장 → GA4 트래픽 획득 CSV → 서치콘솔 28일 zip → 서치어드바이저 캡처 3장 → 쿠팡 파트너스 리포트 → 실적 → **서브ID별** 28일 엑셀 → LinkPrice u_id → GA4 `utm_source=widget` × utm_content(hostname) 세션 수(metrics-log `widget_embed_hosts` 열, 월 1회). 원본은 리포 밖 보관, 문서에는 집계만 — `scripts/metrics-ingest.mjs log` 로 `docs/metrics-log.md` 1행.

## 남은 확인 항목 (5분 이내, 아무 세션에나)
- ☐ EEA 동의 메시지(CMP) 게시 — AdSense → 개인 정보 보호 및 메시지 → 유럽 규정 메시지 → 만들기 → 기본 스타일 → 게시. **앵커 판정(10/5) 후**에 한다(겹침 회피). 코드측 CSP는 2026-08-23 배포 완료.
- ☐ Cloudflare Pages → Settings → Environment variables에 `NEXT_PUBLIC_ADSENSE_SLOT_GUIDE_MID`가 **등록돼 있으면** 1848295488인지 확인(없으면 할 일 없음).
- ☐ developers.kakao.com → 내 애플리케이션 → 플랫폼 → Web에 `https://www.moneysalary.com` 등록 확인.
- ☐ GA4와 AdSense가 **같은 구글 계정**인지 한 줄 답변 → 같으면 GA4 관리 → 제품 링크 → AdSense 링크 연결(페이지별 광고 수익을 GA4에서 보게 됨).
- ☐ **트리거형(날짜 없음) — SK하이닉스 재협상 타결 보도 당일(약 10분)**: 코드 배포 후 Cloudflare → Caching → Configuration → **Purge Everything**(또는 `/calc/sk-hynix-bonus`·`/calc/bonus-calculators`·`/sitemap.xml`·`/rss.xml` 커스텀 퍼지) → Search Console URL 검사 2건(`/calc/sk-hynix-bonus`·`/calc/bonus-calculators`) 색인 생성 요청 + Sitemaps 다시 제출 → D+1 '실제 URL 테스트'로 타결 문구 렌더 확인. 세부는 `docs/drafts/sk-ps-sync-kit-2027.md` §3 런북 표(코드 5점 동기화는 Claude).

## 분석 스크립트 (Claude 용 — CSV 도착 시 실행, 원본은 리포 밖)
```
node scripts/adsense-report.mjs window <일별.csv> <from> <to> [--compare <from2> <to2>] [--md]   # 기간 집계(+두 창 비교·변화율)
node scripts/adsense-report.mjs join <사이트일별.csv> <subset일별.csv> <from> <to> [--md]        # 날짜 조인 → subset 점유율·나머지 RPM/CTR/CPC
node scripts/adsense-report.mjs units <광고단위.csv> [--from <d> --to <d>] [--md]                 # 광고 단위별 표 + 우발 클릭/죽은 유닛 플래그
node scripts/adsense-report.mjs exp1 <광고단위_전.csv> <광고단위_후.csv> [--days <n1> <n2>] [--md] # 실험 #1 판정(유지/재검토/판정 불가)
node scripts/adsense-report.mjs --selftest                                                        # 예시 파일 2개 join 자가 점검
node scripts/metrics-ingest.mjs gsc-coverage <표.csv> <차트.csv> --not-indexed <사유별상세.csv>... [--indexed <색인목록.csv>] [--section /salary-db/listed/ | --section-total 219] [--out <gsc.json>]  # 색인/미색인·사유별 행수·상장사 lite 섹션 색인률(10/19 게이트)
node scripts/metrics-ingest.mjs ga4-sources <세션소스매체.csv> [--out <ga4.json>]                                        # GA4 트래픽 획득 CSV → 네이버 합산·direct·사내망·google·bing·AI·커뮤니티 점유
node scripts/metrics-ingest.mjs log --date <YYYY-MM-DD> --window "…" --ga4 <ga4.json> --gsc <gsc.json> --adsense "<window 요약>" --note "…"  # docs/metrics-log.md 집계 1행 append(원본 목록 금지)
#   v2 추가 플래그(2026-09-06): --gsc-block-clicks/-impr/-ctr/-pos/-window/-prev · --coverage-exmux --coverage-total (총 커버리지는 멀티플렉스 때문에 건강 게이트로 못 씀 — ex-mux 로 판정)
node scripts/metrics-ingest.mjs --selftest                                                                              # 합성 예시로 자가 점검(exit 0 필수)
```
CSV 는 `C:\Users\ruby1\.moneysalary-secrets\adsense\` 에 두고 절대 경로로 지정. 2026-09-05 실측(6/1~9/4 조인 96일): 수동(추정) 수익 점유 16.2%·클릭 39.7%·CPC $0.015 vs 나머지 $0.050.

## 참고: 광고 단위 목록 (2026-09-05 캡처 기준)
**현재 배선 7개**: 가이드중간 1848295488 · 디스플레이2 8284703133 · 멀티플렉스 1910866475 · 인아티클 3302558597 · 상단 9958502911 · 결과창_본문 5584143639 · PC_날개 1397486615. 이 7개가 누적 수익의 **95.95%**($126.00/$131.32)이고 나머지 $5.32는 아래 사장 유닛 6종 — 종전 "살아 있는 7개 = 수동 수익 100%"는 **오류**.

★**2026-09-06 정정(광고단위 CSV × git 이력 실측) — 종전 "미사용" 서술은 오류였다**:
- **6458241606 (구 "머니샐러리_모바일_앵커")**: 미사용 유닛이 **아니다**. 2026-03-02~04-17 layout.tsx 하드코딩 모바일 앵커(50a41e7→3a9684f) → **2026-05-05~08-24 GUIDE_MID 정본 슬롯**(dbec822 `.env.production` 등록 → 13b7c62 2026-08-24 00:05 에 1848295488 로 교체). 누적 **12,087노출 · 380클릭 · $4.94 · 커버리지 95.50%로 13유닛 중 1위**. 타입은 디스플레이가 맞고 **현재 미배선 · 삭제 금지** · 재사용은 슬롯 env 접촉이므로 **승인 항목 N**(권고: 보존만).
- **2025-11 생성분 7개 중 5개는 실사용 이력이 있다** — 중앙01 3348584614 · 왼쪽01 2717302873 · 왼쪽02 1464657303 · 오른쪽01 2773143192 · 오른쪽02 1404221203. 1720efc(2025-11-24) 좌우 스티키 사이드바 배선 → 574a31a(2025-12-30) 재렌더 추가 → c667d2e(2026-02-12) 제거. 4종 합 **2,696노출 · 3,775요청 · $0.38 · 커버리지 72.2~74.4%** — 이 커버리지는 유닛 결함이 아니라 **2025-12~2026-02 계정 채움률(66.5 / 71.8 / 79.3%)의 잔상**이다(같은 창 수동 누적 요청 ≈3,729건과 근사 일치 = 그 시기 수동 활동의 사실상 전부). 중앙01은 요청 2 · 노출 0 — `flex justify-center` 안 `display:block` ins 로 폭 0px 이 된 구조로, 27a692c 가 고친 IN_ARTICLE 과 **같은 계열의 반복 패턴**. **중앙02 · 001 두 개만 CSV 에 행이 없어 진짜 무실적.**
- 시대 판별자: 평균 가시시간이 레거시 4종 18.74 / 19.08 / 27.42 / 25.70초 vs 현행 유닛 4.64~12.05초.

인피드 유닛은 아직 없음(세션 3). `.env.production:12` 주석의 "6458241606 앵커 타입"은 8/24 시점 기록 — **타입은 디스플레이가 맞고 "미사용"만 오류**였다. env 파일은 규칙 1(슬롯 env)로 무접촉. 9/21 앵커 ON 은 자동광고 사이트 설정 토글이지 유닛이 아니므로 이 유닛 번호와 무관.

## 네이버 블로그 원고
운영자 블로그가 없어 발행 루틴은 없음. 원고 7편은 `docs/naver-blog/`에 보존(개설 시 재사용).
