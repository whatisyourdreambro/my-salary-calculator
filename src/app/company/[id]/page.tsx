import CompanyProfileContent from "@/components/CompanyProfileContent";

export const runtime = 'edge';

interface PageProps {
    params: {
        id: string;
    };
}

export default function CompanyProfilePage({ params }: PageProps) {
    return <CompanyProfileContent id={params.id} />;
}
