import { AdvisoryResults } from "@/components/advisory-results";
import { Header } from "@/components/header";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <AdvisoryResults />
      </main>
    </div>
  );
}
