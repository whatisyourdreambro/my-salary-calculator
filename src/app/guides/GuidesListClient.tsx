'use client';

import { useState, useMemo, useEffect } from 'react';
import type { GuideCardMeta } from '@/lib/guidesData';

import { Calendar, Search, BookOpen, Clock } from 'lucide-react';
import GuideListingCard from "@/components/guides/GuideListingCard";
import CoupangBanner from '@/components/CoupangBanner';
import { GuideMidAd } from '@/components/AdPlacement';
import { filterAndSortGuides, readGuideSearchQuery, type GuideSortOrder } from '@/lib/guideDiscovery';

type SortOption = GuideSortOrder;

const SORT_OPTIONS: { id: SortOption; label: string; icon: React.ElementType }[] = [
 { id: "latest", label: "최신순", icon: Calendar },
 { id: "oldest", label: "오래된순", icon: Clock },
];
function HeroGuide({ guide }: { guide: GuideCardMeta }) { return <GuideListingCard guide={guide} locale="ko" featured />; }
function GuideCard({ guide }: { guide: GuideCardMeta }) { return <GuideListingCard guide={guide} locale="ko" />; }

const ITEMS_PER_PAGE = 9;

export default function GuidesListClient({
 guides,
 categories,
}: {
 guides: GuideCardMeta[];
 categories: readonly { id: string; name: string }[];
}) {
 const [selectedCategoryId, setSelectedCategoryId] = useState('all');
 const [searchQuery, setSearchQuery] = useState('');
 const [sortBy, setSortBy] = useState<SortOption>('latest');
 const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

 // 정적 HTML은 유지하며 태그 링크의 검색어와 뒤로가기 상태를 복원한다.
 useEffect(() => {
 const restoreFilters = () => {
 const params = new URLSearchParams(window.location.search);
 const cat = params.get('category');
 setSelectedCategoryId(cat && categories.some((c) => c.id === cat) ? cat : 'all');
 setSearchQuery(readGuideSearchQuery(params));
 setVisibleCount(ITEMS_PER_PAGE);
 };
 restoreFilters();
 window.addEventListener('popstate', restoreFilters);
 return () => window.removeEventListener('popstate', restoreFilters);
 }, [categories]);

 const sortedGuides = useMemo(() => {
 return filterAndSortGuides(guides);
 }, [guides]);

 const featuredGuide = sortedGuides[0];

 // 최근 글을 목록에서도 유지한다. 데스크톱 전용 Hero 때문에 모바일에서 누락하지 않는다.
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
 <div className="min-h-screen bg-background text-foreground pb-16">
 {/* Hero Section */}
 <section className="ms-page pt-24 pb-8 sm:pt-28">
 <div className="border-b border-border pb-8">
 <p className="ms-eyebrow mb-4">MoneySalary · 금융 가이드</p>
 <h1 className="ms-title mb-4">
 금융·연봉 <span className="text-link">가이드</span>
 </h1>
 <p className="ms-description max-w-3xl mb-6">
 급여명세서부터 세금, 대출까지. 공식 기준과 적용 조건을 확인하고 내 상황에 필요한 정보를 찾아보세요.
 </p>
 <div className="relative max-w-xl">
 <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
 <Search className="h-5 w-5 text-muted-foreground" />
 </div>
 <input
 type="text"
 className="ms-field w-full pl-14"
 placeholder="관심 키워드 검색..."
 aria-label="가이드 키워드 검색"
 value={searchQuery}
 onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
 />
 </div>
 </div>
 </section>

 <div className="page-width">
 {/* Categories */}
 <div className="mb-6 flex flex-wrap gap-2 py-2">
 {categories.map(category => (
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

 {/* 정렬 옵션 */}
 <div className="flex items-center gap-2 mb-12 flex-wrap">
 <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">
 수정·발행일 기준
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
 <span role="status" className="text-sm text-muted-foreground ml-auto">
 총 {filteredGuides.length}개
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


 {/* Ad Unit: Top — 쿠팡 파트너스 */}
 <div className="mb-12">
 <CoupangBanner
 responsive={{ mobile: "mobile-banner", desktop: "leaderboard" }}
 />
 </div>

 {/* Guides Grid — 6번째 카드 뒤 중간 광고를 위해 2블록 분할 (AnimatePresence popLayout 은 motion 자식만 허용해 그리드 안에 광고 셀을 끼울 수 없음) */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

 {visibleGuides.slice(0, 6).map((guide) => (
 <GuideCard key={guide.slug} guide={guide} />
 ))}

 </div>
 {/* 목록 중간 광고(6번째 카드 뒤) — GUIDE_MID 는 이 페이지·guides/layout(PageFooterAds) 미사용 슬롯 — 전면 최적화 (운영자 지시 2026-09-02) */}
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
 <h3 className="text-2xl font-bold text-muted-blue mb-2">검색 결과가 없습니다</h3>
 <p className="text-muted-foreground mb-6">다른 키워드로 검색하거나 카테고리를 변경해보세요.</p>
 <button
 onClick={() => { setSearchQuery(''); setSelectedCategoryId('all'); }}
 className="ms-button ms-button-primary px-8"
 >
 전체 목록 보기
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
 더 많은 가이드 보기
 </button>
 </div>
 )}


 </div>
 </div>
 );
}
