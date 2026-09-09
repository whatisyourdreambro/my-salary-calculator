import EnglishHubPage from "@/components/english/EnglishHubPage";
import { ENGLISH_HUBS } from "@/lib/englishHubs";
import { buildEnglishMetadata } from "@/lib/englishSeo";

export const metadata = buildEnglishMetadata(ENGLISH_HUBS.bonus);
export default function Page() { return <EnglishHubPage id="bonus" />; }
