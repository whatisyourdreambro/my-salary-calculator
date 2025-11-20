import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Salary in Korea - Net Pay Calculator for Expats",
    description: "Calculate your monthly net pay in South Korea. Includes 19% Flat Tax calculator for foreign workers.",
    openGraph: {
        title: "Salary in Korea - Net Pay Calculator for Expats",
        description: "Calculate your monthly net pay in South Korea. Includes 19% Flat Tax calculator for foreign workers.",
        type: "website",
    },
};

export default function EnglishLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="en-locale">
            {children}
        </div>
    );
}
