import { AdvisoryResults } from "@/components/advisory-results";
import { Header } from "@/components/header";
import { Suspense } from 'react';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <Suspense fallback={<div>Loading...</div>}>
          <AdvisoryResults />
        </Suspense>
      </main>
    </div>
  );
}
