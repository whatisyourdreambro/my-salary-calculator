'use client';

import { useState, useMemo, useEffect } from 'react';
import type { GuideCardMeta } from '@/lib/guidesData';

import { Calendar, BookOpen, Clock } from 'lucide-react';
import GuideListingCard from "@/components/guides/GuideListingCard";
import { HomeTopAd, InArticleAd, GuideMidAd } from '@/components/AdPlacement';
import { filterAndSortGuides, readGuideSearchQuery, type GuideSortOrder } from '@/lib/guideDiscovery';
import EnglishPageShell from '@/components/english/EnglishPageShell';

type SortOption = GuideSortOrder;

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ElementType }[] = [
 { id: "latest", label: "Latest", icon: Calendar },
 { id: "oldest", label: "Oldest", icon: Clock },
];

function HeroGuide({ guide }: { guide: GuideCardMeta }) { return <GuideListingCard guide={guide} locale="en" featured />; }
function GuideCard({ guide }: { guide: GuideCardMeta }) { return <GuideListingCard guide={guide} locale="en" />; }

const ITEMS_PER_PAGE = 9;

export default function EnglishGuidesClient({ guides, categoriesEn }: { guides: GuideCardMeta[]; categoriesEn: readonly { id: string; name: string }[] }) {
 // [slug] 태그 클릭 시 /en/guides?q=tag 로 진입 — q 파라미터를 검색 초기값으로 적용.
 // useSearchParams 는 정적 프리렌더에서 Suspense 경계까지 CSR 로 빠져 h1·본문이 HTML 에서
 // 사라졌다(html-audit: h1 0개·본문 1.4KB). GuidesListClient 와 같은 마운트 후 읽기로 전환 —
 // 전면 최적화 (운영자 지시 2026-09-02)
 const [selectedCategoryId, setSelectedCategoryId] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');
 useEffect(() => {
 const restoreFilters = () => {
 setSearchQuery(readGuideSearchQuery(new URLSearchParams(window.location.search)));
 setVisibleCount(ITEMS_PER_PAGE);
 };
 restoreFilters();
 window.addEventListener('popstate', restoreFilters);
 return () => window.removeEventListener('popstate', restoreFilters);
 }, []);
 const [sortBy, setSortBy] = useState<SortOption>('latest');
 const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

 const sortedGuides = useMemo(() => {
 return filterAndSortGuides(guides);
 }, [guides]);

 const featuredGuide = sortedGuides[0];

 const filteredGuides = useMemo(() => filterAndSortGuides(guides, {
 query: searchQuery, category: selectedCategoryId, order: sortBy,
 }), [guides, selectedCategoryId, searchQuery, sortBy]);

 const visibleGuides = filteredGuides.slice(0, visibleCount);
 const hasMore = visibleCount < filteredGuides.length;

 const handleLoadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);

 const handleCategoryChange = (id: string) => {
 setSelectedCategoryId(id);
 setVisibleCount(ITEMS_PER_PAGE);
 };

 return (
 <EnglishPageShell eyebrow="Guides · Working in Korea" title="English pay, tax and money guides" description="Understand a payslip, read a bonus or stock-award notice and compare financial choices. These guides distinguish official facts, personal eligibility and illustrative calculations." breadcrumbs={[{ name: "Guides", href: "/en/guides" }]}>
 <div className="relative max-w-xl">
 <input
 type="text"
 className="ms-field w-full"
 placeholder="Search keywords..."
 aria-label="Search guide keywords"
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
 />
 </div>
 <div>
 {/* Categories */}
 <div className="mb-6 flex flex-wrap gap-2 py-2">
 {categoriesEn.map(category => (
 <button
 key={category.id}
 onClick={() => handleCategoryChange(category.id)}
 aria-pressed={selectedCategoryId === category.id}
 className={"ms-button text-sm " + (selectedCategoryId === category.id
 ? 'ms-button-primary'
 : 'ms-button-secondary'
 )}
 >
 {category.name}
 </button>
 ))}
 </div>

 {/* Sort options */}
 <div className="flex items-center gap-2 mb-12 flex-wrap">
 <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">
 Updated / published date
 </span>
 {SORT_OPTIONS.map((option) => {
 const Icon = option.icon;
 return (
 <button
 key={option.id}
 onClick={() => { setSortBy(option.id); setVisibleCount(ITEMS_PER_PAGE); }}
 aria-pressed={sortBy === option.id}
 className={"ms-button text-sm " + (sortBy === option.id
 ? 'bg-secondary text-link border border-border'
 : 'ms-button-secondary'
 )}
 >
 <Icon className="w-3.5 h-3.5" />
 {option.label}
 </button>
 );
 })}
 <span role="status" className="text-xs text-muted-foreground ml-auto">
 Total: {filteredGuides.length}
 </span>
 </div>

 {/* Featured Hero */}

 {selectedCategoryId === 'all' && !searchQuery.trim() && sortBy === 'latest' && featuredGuide && (
 <section
 className="hidden md:block"
 >
 <HeroGuide guide={featuredGuide} />
 </section>
 )}


 {/* Ad Unit: Top — CoupangBanner 는 /en 에서 자동 숨김이라 AdSense 로 교체 */}
 <div className="mb-12">
 <HomeTopAd />
 </div>

 {/* Guides Grid — 6번째 카드 뒤 중간 광고를 위해 2블록 분할 */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
 {visibleGuides.slice(0, 6).map((guide) => (
 <GuideCard key={guide.slug} guide={guide} />
 ))}
 </div>
 {/* 목록 중간 광고(6번째 카드 뒤) — GUIDE_MID 는 이 페이지·en/layout(PageFooterAds) 미사용 슬롯 — 전면 최적화 (운영자 지시 2026-09-02) */}
 {visibleGuides.length > 6 && (
 <div className="my-8 max-w-3xl mx-auto">
 <GuideMidAd />
 </div>
 )}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
 {visibleGuides.slice(6).map((guide) => (
 <GuideCard key={guide.slug} guide={guide} />
 ))}
 </div>

 {/* Empty State */}
 {visibleGuides.length === 0 && (
 <div className="ms-surface py-14 text-center ">
 <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
 <h3 className="text-2xl font-bold text-muted-blue mb-2">No results</h3>
 <p className="text-muted-foreground mb-6">Try a different keyword or category.</p>
 <button
 onClick={() => { setSearchQuery(''); setSelectedCategoryId('all'); }}
 className="ms-button ms-button-primary px-8"
 >
 Show All Guides
 </button>
 </div>
 )}

 {/* Load More */}
 {hasMore && (
 <div className="mt-20 text-center">
 <button
 onClick={handleLoadMore}
 className="ms-button ms-button-secondary px-8"
 >
 Load More Guides
 </button>
 </div>
 )}

 {/* Page-end ad block — HomeTopAd 는 상단 슬롯과 동일 슬롯이라 dedup 으로 미노출되어 제거.
 CoupangBanner 는 컴포넌트가 /en 을 조기 차단해 렌더 0이던 죽은 코드라 정리 (2026-08-24) */}
 <div className="mt-16 max-w-3xl mx-auto space-y-6">
 <InArticleAd />
 </div>
 </div>
 </EnglishPageShell>
 );
}
