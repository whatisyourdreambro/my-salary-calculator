"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TOCItem {
    id: string;
    text: string;
}

export default function TableOfContents({ content }: { content: string }) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // Extract h2 and h3 tags from content string
        // Note: In a real app with markdown, we'd use the AST. 
        // Here we use regex on the HTML string (simple implementation).
        const regex = /<h([2])>(.*?)<\/h\1>/g;
        const matches = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            // Remove any HTML tags inside the heading text
            const text = match[2].replace(/<[^>]*>?/gm, '');
            const id = text.trim().replace(/\s+/g, '-').toLowerCase();
            matches.push({ id, text });
        }
        setHeadings(matches);
    }, [content]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    const handleClick = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.pageYOffset - 100;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    if (headings.length === 0) return null;

    return (
        <nav className="hidden lg:block">
            <h4 className="font-bold text-sm text-foreground/70 mb-4 uppercase tracking-wider">
                목차
            </h4>
            <ul className="space-y-3 text-sm border-l border-border/50 pl-4">
                {headings.map((heading) => (
                    <li key={heading.id} className="relative">
                        <a
                            href={`#${heading.id}`}
                            onClick={(e) => handleClick(heading.id, e)}
                            className={`block transition-colors duration-200 ${activeId === heading.id
                                    ? "text-primary font-bold translate-x-1"
                                    : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                                }`}
                        >
                            {heading.text}
                        </a>
                        {activeId === heading.id && (
                            <motion.div
                                layoutId="toc-indicator"
                                className="absolute -left-[17px] top-0 h-full w-[2px] bg-primary rounded-full"
                            />
                        )}
                    </li>
                ))}
            </ul>
        </nav>
    );
}
