"use client";

import Link from "@/components/AppLink";
import { usePathname } from "next/navigation";
import { languagePaths } from "@/lib/englishNavigation";

export default function LocaleSwitcher({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { ko, en, english } = languagePaths(usePathname() ?? "/");
  return (
    <nav aria-label={english ? "Language" : "언어"} className={variant === "mobile" ? "mb-4 flex items-center gap-2" : "hidden sm:flex items-center gap-1 rounded-xl border border-border bg-background p-1"}>
      {[{ href: ko, label: variant === "mobile" ? "한국어" : "KO", lang: "ko", current: !english, aria: "한국어로 보기" }, { href: en, label: variant === "mobile" ? "English" : "EN", lang: "en", current: english, aria: "View in English" }].map((item) => (
        <Link key={item.lang} href={item.href} hrefLang={item.lang} lang={item.lang} aria-label={item.aria} aria-current={item.current ? "page" : undefined} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${item.current ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
