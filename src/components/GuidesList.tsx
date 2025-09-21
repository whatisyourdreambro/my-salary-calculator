"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpenText } from "lucide-react";
import type { ElementType } from "react";

interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: ElementType;
}

interface GuidesListProps {
  guides: Guide[];
  categories: Category[];
}

export default function GuidesList({ guides, categories }: GuidesListProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredGuides =
    activeCategory === "all"
      ? guides
      : guides.filter((g) => g.category.includes(activeCategory));

  const groupedGuides = filteredGuides.reduce((acc, guide) => {
    const categoryName = guide.category;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(guide);
    return acc;
  }, {} as Record<string, Guide[]>);

  return (
    <>
      {/* Category Filter UI */}
      <div className="flex justify-center flex-wrap gap-2 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-2 ${
              activeCategory === category.id
                ? "bg-signature-blue text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.name}
          </button>
        ))}
      </div>

      {Object.entries(groupedGuides).map(([categoryName, guidesInCategory]) => {
        const categoryInfo = categories.find(
          (c) => c.id === categoryName || c.name === categoryName
        );
        const Icon = categoryInfo ? categoryInfo.icon : BookOpenText;

        if (guidesInCategory.length === 0) return null;

        return (
          <section key={categoryName} className="mb-16">
            <div className="flex items-center mb-6">
              <Icon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              <h2 className="ml-3 text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
                {categoryInfo ? categoryInfo.name : categoryName}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidesInCategory.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="flex flex-col p-6 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-xl hover:-translate-y-1.5 transition-all bg-light-card dark:bg-dark-card group"
                >
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 group-hover:text-signature-blue transition-colors">
                    {guide.title}
                  </h3>
                  <p className="flex-grow text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {guide.description}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-signature-blue self-start">
                    자세히 보기 →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
