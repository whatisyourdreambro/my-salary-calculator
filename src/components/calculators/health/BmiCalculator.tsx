"use client";

import { useState } from "react";
import { Scale } from "lucide-react";

export default function BmiCalculator() {
    const [height, setHeight] = useState<number | "">(""); // cm
    const [weight, setWeight] = useState<number | "">(""); // kg

    let bmi = 0;
    let status = "";
    let color = "text-slate-600";

    if (height && weight) {
        const hM = Number(height) / 100;
        bmi = Number(weight) / (hM * hM);

        if (bmi < 18.5) {
            status = "저체중";
            color = "text-blue-400";
        } else if (bmi < 23) {
            status = "정상";
            color = "text-slate-800";
        } else if (bmi < 25) {
            status = "과체중";
            color = "text-primary";
        } else if (bmi < 30) {
            status = "비만";
            color = "text-primary";
        } else {
            status = "고도비만";
            color = "text-primary";
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                BMI (비만도) 계산기
            </h2>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">신장 (cm)</label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">체중 (kg)</label>
                        <input
                            type="number"
                            value={weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="text-slate-600 mb-2">나의 BMI 지수</div>
                    <div className="text-4xl font-black text-white mb-2">
                        {bmi ? bmi.toFixed(1) : "0.0"}
                    </div>
                    <div className={`text-2xl font-bold ${color}`}>
                        {status || "-"}
                    </div>
                </div>
            </div>
        </div>
    );
}
