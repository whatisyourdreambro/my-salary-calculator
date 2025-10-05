"use client";

import Link from "next/link";
import type { GrowthPlan } from "@/lib/reportCardAnalysis";
import { ArrowRight, Target, BrainCircuit, BarChart2 } from "lucide-react";

interface Props {
  plans: GrowthPlan[];
}

const iconMap = {
  1: Target,
  2: BrainCircuit,
  3: BarChart2,
};

export default function AIGrowthPlan({ plans }: Props) {
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-center mb-6">
        🚀 AI 커리어 성장 플랜
      </h3>
      <div className="space-y-6">
        {plans.map((plan) => {
          const Icon = iconMap[plan.step as keyof typeof iconMap] || Target;
          return (
            <div
              key={plan.step}
              className="p-6 border rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-500 dark:text-gray-400">
                    STEP {plan.step}
                  </p>
                  <h4 className="font-bold text-xl text-light-text dark:text-dark-text mt-1">
                    {plan.title}
                  </h4>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
                    {plan.description}
                  </p>
                  <Link
                    href={plan.link}
                    className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-primary hover:underline"
                  >
                    {plan.linkText} <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
