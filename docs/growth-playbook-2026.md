# 머니샐러리 수익 10배 성장 플레이북 (2026-08-15 수립)

> 목표: 월 10~50만원 → 100~500만원. 현실 경로: 2027년 1월 시즌 피크월 100만원+ 첫 진입 → 신규 URL 숙성으로 2027 상반기 평월 4~6× → 2028년 1월 300~500만원 도전.
> (2026-08-15 원문) 이 문서는 운영자의 단일 참조 문서다. 주간 루틴·시즌 캘린더·콘솔 작업·갱신 체크포인트를 담는다.
> ★2026-09-05 개정: **정본은 `docs/revenue-10x-plan-2026-09.md`·`docs/revenue-100x-plan-2026-09.md`·`docs/operator-console-pack.md` — 이 문서는 시즌 캘린더·갱신 체크포인트만** 담는다. §1·§2 의 콘솔·루틴 항목은 콘솔팩 세션표가 우선하며 충돌 시 콘솔팩을 따른다.

## 1. 운영자 콘솔 작업 (일회성, 첫 주말 60~90분)

### AdSense (adsense.google.com)
1. ✅ **완료(2026-08-24)** — 구 "머니샐러리_모바일_앵커"(슬롯 6458241606)는 **디스플레이 타입(앵커 아님, 미사용·삭제 금지 — 정본 콘솔팩 '참고: 광고 단위 목록', 2026-09-05 정정)** → 신규 디스플레이 유닛 "머니샐러리_가이드중간(1848295488)" 발급·GUIDE_MID env 교체·배포 완료 (상세: docs/operator-console-pack.md §2).
2. **앵커 광고 ON — 9/21 세션 3 ②(콘솔팩 정본)**: AdSense → 광고 → 사이트 기준 → **앵커 광고: 사용**, 사이드 레일·동적 앵커(접이식) OFF, 비네트·인페이지 설정은 건드리지 않음 → 판정 10/5(광고 형식별 행). 기대 배수 **×1.03~1.10**(검증 보정치 — 종전 '+15~25%' 표기는 폐기). 코드 변경 없이 콘솔 토글만으로 켜짐.
3. ✅ **완료** — 신규 광고 유닛 2개(MULTIPLEX·DISPLAY_2) 발급·env 반영 완료. 가이드 하단+목록(멀티플렉스), 홈 계산기 직하(디스플레이2) 활성 — 실험 #1(Display2)이 이 유닛으로 가동 중(docs/ad-experiments.md).
4. **개인정보 보호 → EEA 동의 메시지(CMP) 생성·게시**: 콘솔 설정만으로 완료. /en·/global 유럽 트래픽 광고 제한 해소.

### Google Search Console
5. sitemap.xml **재제출** (신규 URL ~130개: /monthly 105 + 성과급 계산기 10 + 정부 페이지 3 + 기타)
6. 주요 신규 URL **색인 요청**: /civil-servant-pay-2026, /basic-pension-2026, /year-end-tax-mid-resign, /monthly/3000000, 성과급 계산기 10종 중 3~4개
7. 301 반영 확인: 2~4주 후 404 리포트 감소 관찰 (일시적 "리디렉션이 포함된 페이지" 증가는 정상)

### 네이버 서치어드바이저 (searchadvisor.naver.com)
8. **RSS 제출 2건**: https://www.moneysalary.com/rss.xml (기존), https://www.moneysalary.com/rss-companies.xml (신규 — 회사 DB 피드)
9. 사이트맵 제출 확인: https://www.moneysalary.com/sitemap.xml

## 2. 주간 루틴 (합계 ~50분 — 블로그 루틴 삭제 2026-09-05)

| 요일 | 시간 | 작업 |
|---|---|---|
| 월 | 15분 | AdSense: RPM 추이·정책 알림·unfilled율 확인 |
| 금 | 15분 | GSC: 404·색인·수동조치 확인 |
| 일 | 20분 | Claude 산출물 수치 출처 스팟체크 2~3건 |

네이버 블로그 없음(2026-08-17 확인) — 발행 루틴은 두지 않는다(블로그 발행 전제 작업 금지, 브리프 규칙 3). 원고 7편은 `docs/naver-blog/` 에 개설 여부 확인 전까지 보존만.

## 3. 시즌 캘린더 (연간 반복)

| 시기 | 작업 | 성격 |
|---|---|---|
| 8월 말 | 광고 보강·신규 페이지 배포 완료 (이번에 완료) | ✅ 완료 |
| 8월 말 | ★SK하이닉스 임단협 총투표 결과 → sk-hynix-bonus/psData.ts `AGREEMENT_2026.status` 변경(가결 "ratified"/부결 "rejected") + sitemap 날짜 갱신 | ✅ 완료 (8/25 부결 반영, 92f2b81) |
| 재협상 타결 시 | SK하이닉스 PS 타결 동기화 5점(psData.ts status → page/Client 라벨 → bonusData.ts → bonusCalcHub → sitemap) + D0~D+3 런북 — `docs/drafts/sk-ps-sync-kit-2027.md` 그대로 실행(운영자 콘솔 퍼지·URL 검사는 콘솔팩 트리거형 항목) | 대기 |
| 8/23 완료 | SK하이닉스 잠정합의 반영 업그레이드 + 삼성 온페이지 SEO + 성과급 허브(/calc/bonus-calculators) 신설 | ✅ 완료 |
| 9월 초 | ★광고 실험 #1(Display2) 판정 — 운영자 AdSense CSV(8/3~8/16 vs 8/18~8/31) → docs/ad-experiments.md 표 기입. 판정 축은 **광고 단위 보고서**(display-2 후 창 단독 수입 > 0 AND result·fluid 비잠식, 9/7 CSV). **판정 불가 시 '현상 유지'(revert 아님) — 판정 불가는 27a692c 병합 게이트만 해제하고 #2a 확장 게이트는 해제하지 않음**(docs/ad-experiments.md 실험 #1 표 원문, 2026-09-05 운영자 승인). 통과 시에만 실험 #2(#2a 성과급 19곳+car-loan InArticle→Display2) 진행 | 필수 |
| 9월 | 연말정산 예습 콘텐츠(사이트 가이드·리포트 — 블로그 없음) | 진행 |
| 10월 중순 | ★DART lite Phase 1(/salary-db/listed 218곳, 8/23 배포) 28일 색인률 측정 — GSC 커버리지에서 색인 ≥60%면 Phase 2 +300곳(dartLite.ts 코호트 상수 확대), 미달이면 게이팅 강화(직원 하한 상향)만 | 필수 |
| **9/26** | SeasonalLinks 추석→연말정산 세트 교체(10배 계획 L13a — `SeasonalLinks.tsx`·`seasonLinks.ts`·`HeaderSearch.tsx` 각 한 줄, 종전 '10월 초' 표기 폐기) — 이번엔 /year-end-tax-2027(허브)·/year-end-tax-preview·/embed(연말정산 위젯) 링크 포함 (1파일 320페이지 일괄) | 필수 |
| 10월 말 | 홈택스 연말정산 미리보기 오픈 대응 — /year-end-tax-preview 확정 일정·메뉴 경로 갱신 + /year-end-tax-2027 캘린더·뉴스 갱신 + 관련 페이지 수치 총점검 | 필수 |
| 11월~1월 | **구조 변경 동결** — 콘텐츠 수치 갱신만. 주간 모니터링 강화 | 원칙 |
| 12월 초 | 삼성 TAI 하반기 지급률 발표 → src/app/calc/samsung-bonus/taiData.ts 갱신 + 허브(/calc/bonus-calculators) 캘린더·뉴스 동시 갱신 (Claude 지시) | 필수 |
| 12월 말 | 공무원 봉급표 2027 확정 → `/civil-servant-pay-2027` 예상표 → 확정표 전환(`civilServantPay.ts` `GENERAL_PAY_ROWS_2027` 교체, 봉급표 버티컬 4종 포함) + 봉급표 풀표(1~32호봉 공식 별표, 마지막 광고 아래 접힘 — 100배 계획 §5 google-clusters-1) 같은 슬롯, OPI/PS 전망 가이드 갱신 | 필수 |
| 1월 | **피크**: 성과급 발표 24시간 내 반영(삼성 OPI·하이닉스 PS·정유 경영성과급 등 — 보도 확인→Claude 지시→배포). 자동차세 연납·최저임금 콘텐츠 | 최대 수익 구간 |
| 2월 | LG디스플레이·한화에어로 등 2월 지급사 실적 반영. 시즌 회고(GA4) | 체크포인트 |
| 4월 | 건보 연말정산(4월이 맞음 — "7월 정산" 서술 금지) 콘텐츠 | 체크포인트 |
| 5월 | 종소세 시즌 — 중도퇴사·N잡 페이지 트래픽 피크 | 체크포인트 |
| 6월 말 | 공공기관 경영평가 발표 → /calc/kepco-bonus 등급 갱신 | 필수 |
| 7월 1일 | 국민연금 기준소득월액 상한 연례 인상 → src/lib/taxConstants2026.ts | 필수 |
| 7~10월 | 임단협 시즌 — 현대차·기아·현대모비스·현대로템 타결안 반영 | 필수 |

### 발표 런북 (D0 → D+3, 12~2월 지급 발표 공통 — 10배 계획 L13b)

- D0: 보도 확인(출처 URL 2개 이상) → 상수 갱신 → 배포 → CF Purge Everything → GSC URL 검사(색인 요청) → D+1 실제 URL 테스트로 문구 확인 → D+3 리포트(/insights 성과급 실지급률)·허브 캘린더 갱신. SK PS 는 `docs/drafts/sk-ps-sync-kit-2027.md` 5점·런북 그대로. 발표 전 추정 카피 금지(null 게이트).
- **OPI 발표 D0**: ① `src/data/opiAnnouncement.ts` 의 `announced`/`rate`/`date`/`source` 4필드 동시 기입(보도 URL 필수) ② `SeasonalBanner.tsx` 게이트 한 줄(`getCurrentSeasonal(now, { opiAnnounced: OPI_2026_ANNOUNCEMENT.announced })`) 연결 여부 확인 — 2026-09-05 배치는 미연결 상태 ③ `npx vitest run src/lib/__tests__/seasonalBanner.test.ts` 통과 확인(발표 정본 불변식 테스트 포함). 1월 홈 배너 1순위(OPI vs 카드공제)는 100배 계획 승인 H.

## 4. 데이터 갱신 체크포인트 (Claude 지시용)

- **성과급 계산기 23종**: 각 페이지 푸터에 출처·기준 시점 명기됨. 새 지급률 보도 시 해당 페이지만 갱신.
  - 7종(LG엔솔·네이버·카카오·포스코·LG화학·HD현대중공업·삼성SDI)은 시나리오 %·기본값이 `src/app/calc/<slug>/data.ts` 단일 소스 — 갱신 시 같은 폴더 `data.test.ts` 동결값·`bonusData.ts` 프로필을 한 커밋에서 함께 고치고 `node scripts/verify-bonus-data.mjs`(Client.tsx+data.ts 합산 스캔) exit 0 확인.
- **미신설 회사(의도적 제외)**: 쿠팡·토스(정기 성과급 제도 없음), HMM(2021 이후 지급률 보도 없음), 크래프톤(2021 자료뿐) — 새 보도가 나오면 신설 가능.
- **careerLevels**: 보도값 확보 회사만 등재 원칙 유지. 추정 금지.
  - 공기업 확대 백로그(2026-08-23 조사): 알리오(alio.go.kr)의 표준 공시 항목은
    "직원 평균보수·신입사원 초임"(단일값)이라 직급별 표는 **기관별 XLS 원문 검수**가
    필요. 경로: 알리오 → 기관별 공시 → {한국전력공사·한수원·코레일·가스공사·LH 등}
    → 보수관리 XLS 다운로드 → 직급별 표 존재 시만 전사(없으면 스킵 — 추정 금지).
    대상 id 실존 확인 완료: kepco·khnp·korail·kogas·lh·incheon-airport·
    korea-expressway·k-water·nps·ibk (중복 id 주의: lh/lh-korea 등 —
    companyRepository.getById가 반환하는 실서비스 엔트리 파일에 기입할 것).
- **/monthly 격자**: src/lib/monthlyStaticParams.ts 가 단일 소스 — sitemap과 동기 유지.
- **jobsData officialStats**: 워크피디아 재직자조사 연 1회 갱신(직업당 표본 ~30명 설문 — 공무원 계열은 봉급표 병기 원칙).
- **기초연금**: 매년 1월 기준연금액·선정기준액 고시 → /basic-pension-2026 갱신.
- **★DART 공시 연봉 (연 1회, 매년 4월 중순)**: 사업보고서 마감(3/31)+정정 2주 후
  `node scripts/dart-etl.mjs fetch --year 직전연도 --force` → `emit` → `diff` 실행.
  골든 diff(수기 vs DART ±10%) 통과 확인 → dartDisclosed/dartInjection 커밋.
  키는 저장소 밖 `~\.moneysalary-secrets\dart.key` → env DART_API_KEY 주입 (커밋 전
  40hex 스캔 게이트 필수). 신규 상장사는 `match` 재실행 → corpCodeMap 검수 추가.
  8월에 반기보고서로 점검 실행만(급여 수치 갱신 금지 — 6개월 누적 왜곡).
  - `seedCompanies.ts` `disclosed.avgSalaryManwon` 갱신 시 `src/lib/companyData.ts` 6개사 `averageSalary` 도 함께 갱신(id 매핑: hyundai-motor↔hyundai, lg-energy↔lgensol). `entryLevelSalary` 는 출처 확보 전 수정 금지.
- **레거시 가이드 50편**: 2026-08-15 재작성 완료 — 연 1회(8월) 수치 재점검.
- **리포트 updatedDate**: 갱신 시 `rss.xml` pubDate 가 함께 바뀌어 피드 상단에 재노출됨(의도된 동작) — 사소한 오타 수정으로 updatedDate 올리지 말 것(피드 재노출 남발 방지). TOP100(listed-avg-salary)은 DART 재수집(DART_DATA_DATE)만으로 자동 승격, 수기 본문 수정 시에만 `src/data/reportsRegistry.ts` `LISTED_AVG_SALARY_MANUAL_UPDATED`.

## 5. 효과 검증 지표 (기준선: 2026-08-15)

- 기준선: GSC 일 6클릭(2026-08-07), 월 수익 10~50만원. sitemap 실측 ~1,580 URL(2026-08-23 코드 기준 — compare 413 제거 후 문서 수치가 과대였음) → DART lite 219 + 가이드 허브 7 확장 후 **~1,800 URL**
- 배포 후 2주: AdSense 페이지 RPM 전/후, GA4 ad_impression slot_kind 분포(홈 fluid 노출 발생 = 결과 직하 부활 증거), coupang_click 추이(사이드바 skyscraper 복구 효과)
- 배포 후 4~8주: GSC 신규 URL 색인율(/monthly·성과급 계산기·봉급표), 재작성 가이드 50편 CTR 전후 비교, 404 리포트 감소
- 월간: calc_start→calc_submit 퍼널(계산기별), compare_view 소비 분포, 네이버 referral 세그먼트

## 6. 코드 규약 — 공유 링크·내부 링크 모듈 (2026-09-05 배치 1, Claude 지시용)

- 공유 URL 은 반드시 `shareChannels.withUtm(url, channel)` 로 감싼 뒤 내보낸다(채널 미확정 시 상위에서 붙이지 말 것 — ShareButtons 가 채널별로 부여, 멱등이라 이중 감싸도 안전). `/share/{base64}`·`?v=base64` 는 손대지 않음(회귀 테스트 `src/lib/__tests__/shareChannels.test.ts`).
- 새 내부 링크 모듈(서버 컴포넌트)을 만들 때는 래퍼 `<section>`/`<nav>` 에 `data-msy-module="<짧은-id>"` 를 붙이고 `src/lib/__tests__/internalLinkModules.test.ts` MODULES 표에 등록(총 15종 이하 유지). onClick 으로 `trackGuideCTAClick` 을 직접 호출하는 모듈에는 속성을 붙이지 않는다(2중 집계).
