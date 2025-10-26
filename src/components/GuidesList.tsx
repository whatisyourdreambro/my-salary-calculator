// src/components/GuidesList.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Guide, categories as allCategories } from "@/lib/guidesData";
import { motion } from "framer-motion";
import { Search, Tag, BarChart, ChevronsRight, Star } from "lucide-react";

// Props for the main component
interface GuidesListProps {
  guides: Guide[];
  categories: { id: string; name: string; }[];
}

// Individual Guide Card Component
const GuideCard = ({ guide }: { guide: Guide }) => {
  const levelColor =
    guide.level === "고급" ? "border-red-500 text-red-500"
    : guide.level === "중급" ? "border-blue-500 text-blue-500"
    : "border-green-500 text-green-500";

  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }}>
      <Link
        href={`/guides/${guide.slug}`}
        className="flex flex-col p-6 border border-border rounded-2xl hover:shadow-xl transition-all bg-card group h-full"
      >
        <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-semibold text-primary">{guide.category}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${levelColor}`}>{guide.level}</span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {guide.title}
        </h3>
        <p className="flex-grow text-sm text-muted-foreground">
          {guide.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-4">
            {guide.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">#{tag}</span>
            ))}
        </div>
      </Link>
    </motion.div>
  );
};

// Main Component
export default function GuidesList({ guides, categories }: GuidesListProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popular");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    guides.forEach(guide => guide.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [guides]);

  const filteredAndSortedGuides = useMemo(() => {
    let filtered = guides;

    if (activeCategory !== "all") {
      filtered = filtered.filter(g => g.category === activeCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        g.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(g => selectedTags.every(tag => g.tags.includes(tag)));
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
      return b.views - a.views; // Default to popular
    });
  }, [guides, activeCategory, searchTerm, selectedTags, sortBy]);

  const featuredGuides = useMemo(() => [...guides].sort((a, b) => b.views - a.views).slice(0, 3), [guides]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  return (
    <div className="space-y-16">
        {/* Featured Section */}
        <section>
            <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3"><Star className="w-8 h-8 text-amber-400"/> 인기 금융 가이드 TOP 3</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredGuides.map(guide => <GuideCard key={guide.slug} guide={guide} />)}
            </div>
        </section>

        {/* Filter & Sort UI */}
        <div className="p-6 bg-card border border-border rounded-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" placeholder="검색..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary" />
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-3 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="popular">인기순</option>
                    <option value="newest">최신순</option>
                </select>
            </div>
            <div className="space-y-3">
                <p className="font-semibold text-muted-foreground flex items-center gap-2"><ChevronsRight size={18}/>카테고리</p>
                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-all ${activeCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <p className="font-semibold text-muted-foreground flex items-center gap-2"><Tag size={18}/>주요 태그</p>
                <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 15).map(tag => (
                        <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${selectedTags.includes(tag) ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary border-transparent text-secondary-foreground hover:border-primary/50'}`}>
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Guides Grid */}
        <section>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">전체 가이드 ({filteredAndSortedGuides.length}개)</h2>
            </div>
            {filteredAndSortedGuides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAndSortedGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}
                </div>
            ) : (
                <div className="text-center py-20 bg-card rounded-2xl border border-border">
                    <p className="text-lg text-muted-foreground">선택한 조건에 맞는 가이드가 없습니다.</p>
                </div>
            )}
        </section>
    </div>
  );
}
