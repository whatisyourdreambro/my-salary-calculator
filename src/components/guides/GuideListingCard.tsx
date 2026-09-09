import Link from "@/components/AppLink";
import { ArrowRight } from "lucide-react";
import type { GuideCardMeta } from "@/lib/guidesData";
import { formatGuideDate, getGuideModifiedDate } from "@/lib/guideDates";

export default function GuideListingCard({ guide, locale = "ko", featured = false }: {
  guide: GuideCardMeta; locale?: "ko" | "en"; featured?: boolean;
}) {
  const english = locale === "en";
  const date = getGuideModifiedDate(guide);
  const category = english && guide.category === "RealEstate" ? "Housing & Loans"
    : english && guide.category === "Tax" ? "Tax & Insurance" : guide.category;
  const Heading = featured ? "h2" : "h3";
  return <article className={featured ? "mb-10" : "h-full"}>
    <Link href={`${english ? "/en" : ""}/guides/${guide.slug}`} className={`ms-surface ms-interactive group flex h-full flex-col ${featured ? "p-6 sm:p-9" : "p-5 sm:p-6"}`}>
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
        {featured && <span className="font-semibold text-link">{english ? "Latest guide" : "최근 가이드"}</span>}
        <span className="text-muted-foreground">{category}</span>
      </div>
      <Heading className={`${featured ? "max-w-4xl text-2xl sm:text-3xl" : "text-xl"} font-bold leading-snug tracking-tight text-foreground`}>{guide.title}</Heading>
      <p className={`mt-3 flex-grow leading-7 text-muted-foreground ${featured ? "max-w-3xl text-base" : "text-sm"}`}>{guide.description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">{date !== guide.publishedDate ? (english ? "Updated " : "수정 ") : (english ? "Published " : "발행 ")}<time dateTime={date}>{formatGuideDate(date, locale)}</time></span>
        <span className="inline-flex items-center gap-2 font-semibold text-link">{english ? "Read guide" : "가이드 읽기"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" /></span>
      </div>
    </Link>
  </article>;
}
