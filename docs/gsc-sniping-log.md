# GSC 저격 로그 (append-only)

운영 절차 — 격주 금요일(플레이북 §2 금 15분 슬롯 확장):
1. 운영자: GSC → 실적 → 내보내기(CSV) → `docs/gsc/YYYY-MM-DD-queries.csv`·`-pages.csv`로 저장(28일 윈도)
2. `node scripts/gsc-snipe.mjs docs/gsc/<파일>` 실행 → 3버킷 표 확인
3. 우선순위 상위 **5건만** 실행 (주 1~2시간 제약):
   - **버킷 A**(타이틀 개선): 랜딩 페이지 title/description에 쿼리 표현 반영 — 메타만 수정, 11~1월 동결기에도 허용
   - **버킷 B**(순위 8~20 보강): FAQ 1~2개 추가(faqLd 연동)·관련 계산기 내부링크·섹션 1개 확장 — 수치는 보도·공식 출처만
   - **버킷 C**(신규): monthlyStaticParams 격자 확장·신규 페이지 — ★10월 말까지만, 신규 slug는 sitemap·IndexNow 자동 편승
4. 아래 표에 기록, D+28에 같은 행에 결과 기입(저격 성공률 누적)

커밋 규칙: 라운드당 `seo(gsc): round N bucket A titles` / `... bucket B boosts` 분리(버킷별 revert 가능).

---

## Round 1 — (CSV 도착 시 기입)

| 쿼리 | 페이지 | 버킷 | 노출/CTR/순위 (전) | 액션 | 커밋 | 재측정(D+28) | 결과 |
|---|---|---|---|---|---|---|---|
| | | | | | | | |
