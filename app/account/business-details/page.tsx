import { Navbar } from '@/components/storefront/navbar';
import { Footer } from '@/components/storefront/footer';
import { BusinessDetailsClient } from './business-details-client';

export const dynamic = 'force-dynamic';

export default function BusinessDetailsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BusinessDetailsClient />
      <Footer />
    </div>
  );
}
