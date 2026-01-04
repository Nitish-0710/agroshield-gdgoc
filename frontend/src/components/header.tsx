import { AgLogo } from './ag-logo';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <AgLogo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
