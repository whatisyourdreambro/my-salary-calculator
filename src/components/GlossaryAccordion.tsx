"use client";

import { useState } from "react";

type AccordionItem = {
  title: string;
  content: string;
};

interface GlossaryAccordionProps {
  items: AccordionItem[];
}

export default function GlossaryAccordion({ items }: GlossaryAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="border rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <button
            onClick={() => handleClick(index)}
            className="w-full flex justify-between items-center p-5 text-left bg-card hover:bg-secondary"
          >
            <span className="text-lg font-semibold text-foreground">
              {item.title}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-6 h-6 text-muted-foreground transition-transform duration-300 ${
                activeIndex === index ? "rotate-180" : ""
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              activeIndex === index
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="p-5 border-t bg-card">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {item.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}