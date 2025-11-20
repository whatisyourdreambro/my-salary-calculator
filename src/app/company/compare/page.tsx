"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { companies } from "@/lib/companyData";
import { ArrowRight, Swords, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function CompareSelectionPage() {
    const router = useRouter();
    const [selectedA, setSelectedA] = useState<string | null>(null);
    const [selectedB, setSelectedB] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCompanies = companies.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCompare = () => {
        if (selectedA && selectedB) {
            router.push(`/company/compare/${selectedA}-vs-${selectedB}`);
        }
    };

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
                        VERSUS ENGINE
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        두 기업의 연봉, 복지, 성장성을 적나라하게 비교해보세요.
                    </p>
                </div>

                <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Company A Selection */}
                        <div className="w-full md:w-5/12">
                            <label className="block text-sm font-bold text-muted-foreground mb-2 text-center">
                                CHALLENGER 1
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full p-4 bg-secondary/50 border border-border rounded-xl appearance-none text-center font-bold text-lg focus:ring-2 focus:ring-primary outline-none cursor-pointer hover:bg-secondary/70 transition-colors"
                                    onChange={(e) => setSelectedA(e.target.value)}
                                    value={selectedA || ""}
                                >
                                    <option value="" disabled>기업 선택</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id} disabled={c.id === selectedB}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    {!selectedA && <span className="text-muted-foreground/50">선택해주세요</span>}
                                </div>
                            </div>
                            {selectedA && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-4 text-center"
                                >
                                    <div className={`w-24 h-24 mx-auto rounded-2xl ${companies.find(c => c.id === selectedA)?.logo} flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-2`}>
                                        {companies.find(c => c.id === selectedA)?.name[0]}
                                    </div>
                                    <div className="font-bold text-xl">{companies.find(c => c.id === selectedA)?.name}</div>
                                </motion.div>
                            )}
                        </div>

                        {/* VS Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                <Swords className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Company B Selection */}
                        <div className="w-full md:w-5/12">
                            <label className="block text-sm font-bold text-muted-foreground mb-2 text-center">
                                CHALLENGER 2
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full p-4 bg-secondary/50 border border-border rounded-xl appearance-none text-center font-bold text-lg focus:ring-2 focus:ring-primary outline-none cursor-pointer hover:bg-secondary/70 transition-colors"
                                    onChange={(e) => setSelectedB(e.target.value)}
                                    value={selectedB || ""}
                                >
                                    <option value="" disabled>기업 선택</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id} disabled={c.id === selectedA}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    {!selectedB && <span className="text-muted-foreground/50">선택해주세요</span>}
                                </div>
                            </div>
                            {selectedB && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-4 text-center"
                                >
                                    <div className={`w-24 h-24 mx-auto rounded-2xl ${companies.find(c => c.id === selectedB)?.logo} flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-2`}>
                                        {companies.find(c => c.id === selectedB)?.name[0]}
                                    </div>
                                    <div className="font-bold text-xl">{companies.find(c => c.id === selectedB)?.name}</div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12">
                        <button
                            onClick={handleCompare}
                            disabled={!selectedA || !selectedB}
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xl font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <span>FIGHT!</span>
                            <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
