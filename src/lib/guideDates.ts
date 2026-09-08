import type { Guide } from "./guidesData";

/** 수정하지 않은 글의 날짜를 배포일로 승격하지 않는다. 발행일은 별도로 보존한다. */
export function getGuideModifiedDate(
  guide: Pick<Guide, "publishedDate" | "modifiedDate">,
): string {
  return guide.modifiedDate ?? guide.publishedDate;
}

/** 날짜만 있는 값은 브라우저의 현지 시간대로 변환하지 않는다. */
export function formatGuideDate(date: string, lang: "ko" | "en" = "ko"): string {
  const [year, month, day] = date.split("-");
  return lang === "en" ? `${Number(month)}/${Number(day)}/${year}` : `${year}.${month}.${day}`;
}
