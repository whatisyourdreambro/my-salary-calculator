// src/components/UpdatedBadge.tsx
//
// 데이터 갱신 시점을 화면·크롤러에 노출하는 작은 배지.
// 연봉은 신선도(freshness) 민감 주제 — 시각적 "업데이트" 텍스트와 <time> 태그가
// 검색 순위·CTR에 기여한다. 정적 페이지에서도 stale 되지 않도록 절대 표기(연·월)를 쓴다.

interface UpdatedBadgeProps {
  /** ISO 날짜 문자열 (예: "2026-05-15") */
  date: string;
  /** 배지 텍스트 앞 접두어 (예: "연봉 데이터") */
  prefix?: string;
  /** 컨테이너 className 전체 override */
  className?: string;
}

export default function UpdatedBadge({ date, prefix, className }: UpdatedBadgeProps) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  const iso = parsed.toISOString().slice(0, 10);
  const text = `${parsed.getFullYear()}년 ${parsed.getMonth() + 1}월 업데이트`;

  return (
    <span
      className={
        className ??
        "inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400"
      }
    >
      <span aria-hidden="true">↻</span>
      <time dateTime={iso}>{prefix ? `${prefix} ${text}` : text}</time>
    </span>
  );
}
