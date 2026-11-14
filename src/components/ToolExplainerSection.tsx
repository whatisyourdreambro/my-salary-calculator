'use client';

// 도구·재미 페이지 맨 아래 설명 글(lens-meta-F10, 2026-11-13). 항상 그 쪽의 마지막 광고 뒤에 둔다 —
// 페이지 파일에서는 PageFooterAds 다음, 레이아웃에서는 마지막 광고 블록 다음. 링크가 없으니 data-msy-module 은 붙이지 않는다.
// TopicNextSteps 와 같이 path 를 주지 않으면 현재 경로로 찾고, 등록되지 않은 경로에서는 아무것도 렌더하지 않는다.
import { usePathname } from 'next/navigation';
import { getToolExplainer } from '@/lib/toolExplainers';

export default function ToolExplainerSection({ path }: { path?: string }) {
  const pathname = usePathname();
  const explainer = getToolExplainer(path ?? pathname ?? '');
  if (!explainer) return null;
  // relative: /mbti-salary·/lotto 의 main 에는 화면 전체를 덮는 장식 층(absolute inset-0 z-0)이 있다. 위치 지정이 없는
  // 블록은 그 층 아래에 그려져 글자 위에 장식이 얹히고(/mbti-salary 는 글자 선택도 막힌다) — 배치·높이는 그대로 두고 그리는 순서만 올린다.
  return (
    <section className="relative mx-auto my-10 max-w-3xl px-4 sm:px-6" aria-label={explainer.heading}>
      <h2 className="text-lg font-bold text-foreground">{explainer.heading}</h2>
      {explainer.paragraphs.map((text) => (
        <p key={text} className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
      ))}
    </section>
  );
}
