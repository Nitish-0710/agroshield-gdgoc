'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Header } from '@/components/header';
import { useTranslation } from '@/hooks/use-translation';
import Image from 'next/image';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/farm.jpg"
        alt="Farm background"
        fill
        sizes="100vw"
        className="object-cover z-10"
        priority
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/45 to-black/30 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-headline">
              {t('appName')}
            </h1>
            <p className="mt-4 text-lg sm:text-xl md:text-2xl text-slate-200">
              {t('tagline')}
            </p>
            <p className="mt-6 text-base sm:text-lg md:text-xl max-w-lg mx-auto text-slate-300">
              {t('description')}
            </p>
            <div className="mt-10">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <Link href="/advisory">{t('getAdvisory')}</Link>
              </Button>
            </div>
          </div>
        </main>

        <footer className="p-4 text-center text-sm text-slate-300">
          AgroShield Hackathon Project
        </footer>
      </div>
    </div>
  );
}
