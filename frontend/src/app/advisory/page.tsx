import { Header } from "@/components/header";
import { AdvisoryForm } from "@/components/advisory-form";

export default function AdvisoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <AdvisoryForm />
      </main>
    </div>
  );
}
