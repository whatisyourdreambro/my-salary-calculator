import ComparisonResultContent from "@/components/ComparisonResultContent";

export const runtime = 'edge';

interface PageProps {
    params: {
        slug: string;
    };
}

export default function ComparisonResultPage({ params }: PageProps) {
    return <ComparisonResultContent slug={params.slug} />;
}
