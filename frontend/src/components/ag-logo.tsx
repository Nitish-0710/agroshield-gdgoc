'use client';
import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export function AgLogo({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Link href="/" className={cn("flex items-center gap-2 text-xl font-bold text-primary", className)}>
      <Leaf className="h-6 w-6" />
      <span className="font-headline">{t('appName')}</span>
    </Link>
  );
}
