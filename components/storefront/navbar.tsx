import { NavbarClient } from './navbar-client';
import { AnnouncementsTicker } from './announcements-ticker';
import { MobileStoreHeader } from './mobile-store-header';
import { getActiveAnnouncements } from '@/lib/cms';

export async function Navbar() {
  const messages = await getActiveAnnouncements();

  const hasAnnouncements = messages.length > 0;

  return (
    <div className="sticky top-0 z-40 lg:static lg:z-auto">
      <AnnouncementsTicker messages={messages} />
      <NavbarClient
        className={hasAnnouncements ? 'border-b-0 lg:border-b' : undefined}
      />
      <MobileStoreHeader />
    </div>
  );
}
