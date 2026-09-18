import { Navbar } from '@/components/storefront/navbar';
import { Footer } from '@/components/storefront/footer';
import { ProductsListClient } from './products-list-client';

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProductsListClient />
      <Footer />
    </div>
  );
}
