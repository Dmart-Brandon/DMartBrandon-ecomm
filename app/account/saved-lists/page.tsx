import { Navbar } from '@/components/storefront/navbar';
import { Footer } from '@/components/storefront/footer';
import { SavedListsClient } from './saved-lists-client';

export const dynamic = 'force-dynamic';

export default function SavedListsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SavedListsClient />
      <Footer />
    </div>
  );
}
