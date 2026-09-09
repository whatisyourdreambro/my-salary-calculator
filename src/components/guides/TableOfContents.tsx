"use client";

import { useEffect, useState } from "react";
import type { GuideHeading } from "@/lib/guideHeadings";

export default function TableOfContents({ headings }: { headings: GuideHeading[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    setActiveId("");
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveId(visible[0].target.id);
    }, { rootMargin: "-96px 0px -65% 0px" });
    for (const { id } of headings) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="이 글의 목차">
      <ol className="space-y-1 border-l border-border pl-3 text-sm">
        {headings.map((heading, index) => (
          <li key={heading.id}>
            <a
              href={`#${encodeURIComponent(heading.id)}`}
              aria-current={activeId === heading.id ? "location" : undefined}
              onClick={() => {
                const element = document.getElementById(heading.id);
                if (!element) return;
                element.tabIndex = -1;
                element.focus({ preventScroll: true });
                setActiveId(heading.id);
              }}
              className={`flex min-h-11 items-start gap-2 rounded-lg px-2 py-3 leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${activeId === heading.id ? "bg-secondary font-semibold text-link" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              <span aria-hidden="true" className="shrink-0 tabular-nums text-muted-foreground">{index + 1}.</span>
              <span>{heading.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
