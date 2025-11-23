"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle2, Building2, DollarSign, AlertCircle } from "lucide-react";
import AdUnit from "@/components/AdUnit";

export default function SubmitSalaryPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <main className="w-full min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-2xl"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">제출해주셔서 감사합니다!</h1>
                    <p className="text-muted-foreground mb-8">
                        보내주신 데이터는 검수 후 익명으로 DB에 반영됩니다.<br />
                        여러분의 소중한 정보가 투명한 연봉 문화를 만듭니다.
                    </p>
                    <button
                        onClick={() => window.location.href = '/salary-db'}
                        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                    >
                        연봉 DB 보러가기
                    </button>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="w-full min-h-screen bg-background pb-20">
            <div className="bg-slate-900 text-white py-12 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl font-black mb-4">내 연봉 제보하기 📣</h1>
                    <p className="text-slate-300">
                        익명으로 안전하게 처리됩니다. <br />
                        정확한 데이터가 모일수록 우리의 협상력은 올라갑니다.
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-8">
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
                >
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-500" />
                            회사 정보
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">회사명</label>
                                <input required type="text" placeholder="예: 삼성전자" className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">직무/직군</label>
                                <input required type="text" placeholder="예: 백엔드 개발" className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">연차</label>
                                <select className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none">
                                    <option>신입 (1년 미만)</option>
                                    <option>주니어 (1~4년)</option>
                                    <option>시니어 (5~9년)</option>
                                    <option>리드/책임 (10년+)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">계약 연봉 (기본급)</label>
                                <div className="relative">
                                    <input required type="number" placeholder="5000" className="w-full p-3 pr-10 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none" />
                                    <span className="absolute right-3 top-3 text-sm text-muted-foreground">만원</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Compensation Details */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                            보상 상세 (작년 기준)
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">인센티브 (성과급)</label>
                                <div className="relative">
                                    <input type="number" placeholder="1000" className="w-full p-3 pr-10 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none" />
                                    <span className="absolute right-3 top-3 text-sm text-muted-foreground">만원</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">스톡옵션/RSU (연간)</label>
                                <div className="relative">
                                    <input type="number" placeholder="0" className="w-full p-3 pr-10 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none" />
                                    <span className="absolute right-3 top-3 text-sm text-muted-foreground">만원</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* Review */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-purple-500" />
                            한줄 평
                        </h2>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">장점</label>
                            <input type="text" placeholder="예: 밥이 맛있고 동료가 좋아요" className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">단점</label>
                            <input type="text" placeholder="예: 야근이 너무 많아요" className="w-full p-3 rounded-xl bg-secondary border-none focus:ring-2 focus:ring-primary outline-none" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                "제출 중..."
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    익명으로 제출하기
                                </>
                            )}
                        </button>
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            * 수집된 정보는 통계 목적으로만 사용되며 개인을 식별하지 않습니다.
                        </p>
                    </div>
                </motion.form>

                {/* Ad Unit */}
                <div className="mt-12">
                    <AdUnit slotId="9988776655" format="auto" label="Submit Page Bottom" />
                </div>
            </div>
        </main>
    );
}
