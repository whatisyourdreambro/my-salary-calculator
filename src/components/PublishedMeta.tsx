// src/components/PublishedMeta.tsx
// 시즌·시기성 콘텐츠의 발행/갱신일을 본문 상단에 한 줄로 노출.
// 검색 결과·SNS 공유 시 신선도 신호 강화 + 독자 신뢰 보조.

interface PublishedMetaProps {
 /** ISO 날짜 (YYYY-MM-DD) */
 publishedDate: string;
 /** 옵션. ISO 날짜 (YYYY-MM-DD). 발행일과 같으면 단독 표시. */
 updatedDate?: string;
 className?: string;
}

const formatKoDate = (iso: string): string => {
 const [y, m, d] = iso.split("-");
 if (!y || !m || !d) return iso;
 return `${y}.${m}.${d}`;
};

export default function PublishedMeta({
 publishedDate,
 updatedDate,
 className = "",
}: PublishedMetaProps) {
 const showUpdated = updatedDate && updatedDate !== publishedDate;
 return (
 <p
 className={`text-xs text-canvas-600 dark:text-canvas-400 ${className}`}
 >
 <time dateTime={publishedDate}>발행 {formatKoDate(publishedDate)}</time>
 {showUpdated && (
 <>
 <span aria-hidden="true"> · </span>
 <time dateTime={updatedDate}>
 최종 갱신 {formatKoDate(updatedDate!)}
 </time>
 </>
 )}
 </p>
 );
}
