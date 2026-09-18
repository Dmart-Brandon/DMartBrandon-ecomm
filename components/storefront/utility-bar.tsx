import Link from 'next/link';
import { HelpCircle, Package, Store } from 'lucide-react';
import { AnnouncementsTicker } from './announcements-ticker';
import { LanguageSwitcher } from './language-switcher';
import { getActiveAnnouncements } from '@/lib/cms';

export async function UtilityBar() {
  const messages = await getActiveAnnouncements();

  return (
    <div className="hidden border-b border-border/60 bg-secondary/30 md:block">
      <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 flex justify-center lg:justify-start">
          <AnnouncementsTicker messages={messages} />
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="#"
            className="inline-flex items-center gap-1 font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            <Store className="h-3.5 w-3.5" />
            Sell on DMartBrandon
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-1 font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Help
          </Link>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            <Package className="h-3.5 w-3.5" />
            Track Order
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
