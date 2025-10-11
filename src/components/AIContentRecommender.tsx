// src/components/AIContentRecommender.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { StoredFinancialData } from '@/app/types';
import { Book, TrendingUp, Sparkles } from 'lucide-react';

interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
}

// From rss.xml/route.ts
const allGuides: Guide[] = [
    { slug: "exchange-rate-deep-dive", title: "환율의 대서사시: 당신의 부를 결정하는 보이지 않는 전쟁", description: "금리의 속삭임, 무역의 파도, 지정학적 폭풍 속에서 환율은 어떻게 춤추는가? 환율의 모든 것을 파헤칩니다.", category: "재테크 로드맵" },
    { slug: "compound-interest", title: "복리의 마법, 스노우볼 효과: 부자들의 비밀 무기", description: "시간을 내 편으로 만들어 자산을 불리는 가장 확실한 방법, 복리의 모든 것을 알려드립니다.", category: "재테크 로드맵" },
    { slug: "salary-negotiation", title: "연봉협상: 최소 20% 올려받는 4단계 전략 (2025년 최종판)", description: "당신의 가치를 돈으로 바꾸는 실전 협상 기술. 준비부터 마무리까지 A to Z.", category: "커리어 성장" },
    { slug: "severance-tax", title: "퇴직금 세금 계산: 최소 40% 아끼는 공제의 비밀 (2025년)", description: "복잡한 퇴직소득세 4단계 계산법과 세금을 획기적으로 줄여주는 '공제'의 모든 것을 설명합니다.", category: "필수 지식" },
    { slug: "year-end-tax-settlement", title: "연말정산 A to Z: 13월의 월급, 제대로 찾는 법 (2025년)", description: "세금 폭탄이 아닌 '13월의 보너스'를 위한 완벽 가이드. 놓치기 쉬운 공제 꿀팁까지 A to Z를 알려드립니다.", category: "필수 지식" },
];

const popularGuides: Guide[] = [
    allGuides.find(g => g.slug === 'salary-negotiation')!,
    allGuides.find(g => g.slug === 'year-end-tax-settlement')!,
    allGuides.find(g => g.slug === 'compound-interest')!,
];

export default function AIContentRecommender() {
    const [recommendedGuides, setRecommendedGuides] = useState<Guide[]>([]);

    useEffect(() => {
        let profile: StoredFinancialData | null = null;
        try {
            const savedData = localStorage.getItem("moneysalary-financial-data");
            if (savedData) {
                profile = JSON.parse(savedData);
            }
        } catch (error) {
            console.error("Failed to parse user profile:", error);
        }

        const recommendations: Guide[] = [];

        if (profile) {
            // Rule 1: If user has severance data, recommend severance tax guide
            if (profile.severance) {
                const severanceGuide = allGuides.find(g => g.slug === 'severance-tax');
                if (severanceGuide) recommendations.push(severanceGuide);
            }

            // Rule 2: High earners get negotiation tips
            if (profile.salary && profile.salary.annualSalary > 70000000) {
                const negotiationGuide = allGuides.find(g => g.slug === 'salary-negotiation');
                if (negotiationGuide) recommendations.push(negotiationGuide);
            }
        }

        // Fill up to 3 recommendations with popular guides, avoiding duplicates
        const finalRecommendations = [...recommendations];
        for (const popular of popularGuides) {
            if (finalRecommendations.length >= 3) break;
            if (!finalRecommendations.some(r => r.slug === popular.slug)) {
                finalRecommendations.push(popular);
            }
        }

        setRecommendedGuides(finalRecommendations.slice(0, 3));

    }, []);

    if (recommendedGuides.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 p-6 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-gray-800/50 rounded-xl">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-primary" size={24} />
                회원님을 위한 추천 콘텐츠
            </h3>
            <ul className="mt-4 space-y-3">
                {recommendedGuides.map(guide => (
                    <li key={guide.slug}>
                        <Link href={`/guides/${guide.slug}`} className="group block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors">
                            <p className="font-bold text-md group-hover:text-primary">{guide.title}</p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{guide.description}</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
