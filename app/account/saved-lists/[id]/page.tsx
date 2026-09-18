import { Navbar } from '@/components/storefront/navbar';
import { Footer } from '@/components/storefront/footer';
import { SavedListDetailClient } from './saved-list-detail-client';

export const dynamic = 'force-dynamic';

export default function SavedListDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SavedListDetailClient listId={params.id} />
      <Footer />
    </div>
  );
}
