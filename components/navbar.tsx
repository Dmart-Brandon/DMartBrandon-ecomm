// Legacy re-export. Points at the client-side navbar so client pages like
// /profile and /orders that imported `@/components/navbar` keep working
// without needing an async server component in their tree. The server
// shell on /products and /products/[slug] uses `@/components/storefront/navbar`
// directly to pre-fetch the pincode.
export { NavbarClient as Navbar } from '@/components/storefront/navbar-client';
