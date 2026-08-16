# 운영자 콘솔 팩 — 코드 0줄로 수익 올리는 40분 (2026-08-16)

100배 마스터플랜 P1. 아래 6개는 **전부 콘솔 클릭만으로 끝나고, 예상 효과 대비 비용이 0**입니다.
위에서부터 순서대로 하세요. 각 항목 끝의 ☐에 완료 체크.

## 1. ★앵커 광고 켜기 — 모바일 수익 +15~25% (5분) ☐
1. adsense.google.com → 광고 → 사이트 기준 → moneysalary.com **수정(연필)**
2. 오른쪽 설정에서 **앵커 광고: 사용** / **전면(비네트) 광고: 사용 안 함**
3. 사이트에 적용 저장
- 사이트의 하단 공유 바는 앵커 광고를 감지하면 스스로 숨도록 이미 코딩돼 있어 충돌 없음.
- 켠 날짜를 메모해 두세요(효과 측정 기준일).

## 2. GUIDE_MID 광고 단위 타입 확인 (10분) ☐
1. AdSense → 광고 → **광고 단위별** → 슬롯 ID **6458241606** 검색
2. 유형이 "**앵커**"로 돼 있으면 → 새 **디스플레이 광고** 단위 생성 → 새 슬롯 ID 복사
3. Cloudflare Pages → Settings → Environment variables → `NEXT_PUBLIC_ADSENSE_SLOT_GUIDE_MID` 값 교체(Production+Preview) → Retry deployment
- 유형이 이미 "디스플레이"면 아무것도 안 해도 됨 → 체크만.

## 3. EEA 동의 메시지(CMP) 게시 (10분) ☐
1. AdSense → 개인 정보 보호 및 메시지 → **유럽 규정 메시지** → 만들기
2. 사이트 moneysalary.com 선택 → 기본 스타일로 **게시**
- 효과: /en·/global의 유럽 방문자에게 광고 송출 재개.

## 4. 네이버 서치어드바이저 RSS 2건 제출 (5분) ☐
1. searchadvisor.naver.com → 웹마스터 도구 → moneysalary.com → 요청 → **RSS 제출**
2. 아래 두 줄을 각각 제출:
   - `https://www.moneysalary.com/rss.xml`
   - `https://www.moneysalary.com/rss-companies.xml`

## 5. GSC sitemap 재제출 + 색인 요청 (5분) ☐
1. search.google.com/search-console → Sitemaps → `sitemap.xml` 제출(이미 있으면 재제출)
2. URL 검사에 아래 2개 넣고 각각 **색인 생성 요청**:
   - `https://www.moneysalary.com/chuseok-bonus-2026`
   - `https://www.moneysalary.com/civil-servant-pay-2027`

## 6. 카카오 JS 키 발급 (10분) ☐
- 절차는 [kakao-share-setup.md](./kakao-share-setup.md) 4단계 그대로.
- 효과: 전 페이지 카카오 버튼이 "링크 복사"→"진짜 공유창+버튼 2개"로 승격.

---

# 성과 데이터 내보내기 방법 (저에게 주실 자료)

## A. 서치콘솔 CSV (격주 금요일)
1. search.google.com/search-console → 왼쪽 **실적** → 기간을 **지난 28일**로
2. 오른쪽 위 **내보내기 → CSV 다운로드**
3. 압축 안의 `쿼리.csv`와 `페이지.csv` 두 파일을 저에게 전달
   (저장 위치 제안: 이 리포의 `docs/gsc/2026-09-05-queries.csv` 형식)

## B. 애드센스 페이지별 수익 (월 1회 + 실험 기간)
1. AdSense → 보고서 → 기간 28일 → 분류 기준 **페이지** 추가
2. 내보내기(CSV) 또는 화면 캡처로 전달
- 실험(광고 위치 변경) 기간에는 적용 전/후 14일씩 필요합니다.

---

# 네이버 블로그 발행 스케줄 (원고 6편 재고, docs/naver-blog/)

| 주차 | 원고 | 파일 |
|---|---|---|
| 9월 1주 | 연말정산 미리보기 | 01-yeonmaljeongsan-preview.md |
| 9월 2주 | 중도퇴사 연말정산 | 02-junggdotoesa.md |
| 9월 3주 | 월급 300 실수령 | 03-wolgeup-300.md |
| 9월 4주 | 공무원 봉급표 | 05-gongmuwon-bonggeup.md |
| 10월 1주 | 기초연금 | 06-gicho-yeongeum.md |
| 10월 2주 | 삼성 OPI 전망 | 04-samsung-opi-forecast.md |

발행 요령: 제목·본문 그대로 복사 → 본문 속 사이트 링크 2~3개 유지 → 발행 후 URL을 저에게 알려주시면 유입 추적 확인. 재고 소진 전에 다음 원고를 계속 만들어 드립니다(추석·2027 공무원 등 시즌 연동).
