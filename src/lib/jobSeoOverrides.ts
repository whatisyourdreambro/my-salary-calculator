// /job/[slug] 직업별 SEO 메타(title·description) 개별 교체 맵 — R6-06 (2026-09-27).
//
// 지금은 비어 있다(휴면). 비어 있는 동안 /job/* 메타는 템플릿 출력과 바이트 단위로 같다.
// 항목을 넣는 일은 동결기(11/1~1/31)에도 허용되는 "데이터 변경"이다 — 구조·DOM 은 그대로.
//
// 규칙 (항목을 추가·수정하기 전에 전부 지킨다 — 가드: src/lib/__tests__/jobSeoOverrides.test.ts)
//   1) 한 URL 의 메타 변경은 35일에 한 번. 바꾼 날을 t0(YYYY-MM-DD, KST 배포일)으로 적고,
//      t0+35일 창을 읽기 전에는 같은 URL 을 다시 바꾸지 않는다(검색엔진 재평가·CTR 판정 창).
//   2) 대학교수(professor)·의사(doctor) 메타는 2026-09-25(c32af11f, 억 표기 통일)에 바뀌었다.
//      그래서 다음 변경은 T0+35 읽기(≈2026-10-30) 이후가 가장 빠르다 — t0 는
//      JOB_SEO_EARLIEST_T0 보다 이르면 안 된다(가드 테스트가 막는다).
//   3) 길이: title·description 은 각각 같은 직업의 템플릿 출력 길이 이하.
//      (SERP 잘림 방지 + 같은 문자열이 OG 카드 제목에도 쓰인다)
//   4) 수치: 금액은 jobsData 의 그 직업 값만(formatManwonKorean 표기). 새 통계·추정치 금지(YMYL).
//   5) og:title·twitter:title 은 buildPageMetadata 가 title 에서 만든다 — 따로 두지 않는다.
//   6) H1·본문은 절대 건드리지 않는다. 이 맵은 generateMetadata 에서만 읽는다.
//
// 예정: 11/2 교수 항목 1건 — 10/30 읽기에서 /job/professor CTR 이 6.0% 미만일 때만 추가.
//   후보 title '교수 연봉 2026 — 대학교수 평균 8,500만원·직급별 비교' (35자, 현재 제목과 같은 길이).

export interface JobSeoOverride {
  /** 사이트명 없는 제목 — buildPageMetadata 가 " | 머니샐러리" 를 붙인다 */
  title: string;
  description: string;
  /** 이 항목이 배포된 날(YYYY-MM-DD, KST) — 35일 판정 창의 시작점 */
  t0: string;
}

export interface JobMetaText {
  title: string;
  description: string;
}

/** 규칙 2 — professor·doctor 의 2026-09-25 변경 + 35일 읽기 창 이후 */
export const JOB_SEO_EARLIEST_T0 = "2026-10-30";

/** 직업 id(jobsData.id) → 메타 교체. 비어 있음 = 전 직업 템플릿 그대로. */
export const JOB_SEO_OVERRIDES: Readonly<Record<string, JobSeoOverride>> = Object.freeze({});

/** 교체 항목이 있으면 그 title·description, 없으면 base 를 그대로(같은 객체) 돌려준다. */
export function resolveJobMeta(
  jobId: string,
  base: JobMetaText,
  overrides: Readonly<Record<string, JobSeoOverride>> = JOB_SEO_OVERRIDES,
): JobMetaText {
  const hit = Object.prototype.hasOwnProperty.call(overrides, jobId) ? overrides[jobId] : undefined;
  return hit ? { title: hit.title, description: hit.description } : base;
}
